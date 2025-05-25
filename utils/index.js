// File: utils/index.js

/**
 * Makes a request to the Shopify Storefront API.
 * @param {string} query The GraphQL query string.
 * @param {Record<string, any>} [variables={}] The variables for the GraphQL query.
 * @param {string | null} [customerAccessToken=null] The customer's access token for authenticated requests.
 * @returns {Promise<any>} The Shopify API response.
 */
export async function storeFront(query, variables = {}, customerAccessToken = null) {
  const headers = {
    "Content-Type": "application/json",
    "X-Shopify-Storefront-Access-Token": process.env.NEXT_PUBLIC_STOREFRONT_ACCESS_TOKEN,
  };

  if (customerAccessToken) {
    headers["X-Shopify-Customer-Access-Token"] = customerAccessToken;
  }

  const apiURL = process.env.NEXT_PUBLIC_API_URL;
  if (!apiURL) {
    console.error("Shopify API URL is not defined in environment variables (NEXT_PUBLIC_API_URL). Ensure it points to a CURRENT Shopify API version (e.g., /api/2024-07/graphql.json).");
    throw new Error("Shopify API URL is not configured.");
  }
  if (!process.env.NEXT_PUBLIC_STOREFRONT_ACCESS_TOKEN) {
    console.error("Shopify Storefront Access Token is not defined in environment variables (NEXT_PUBLIC_STOREFRONT_ACCESS_TOKEN).");
    throw new Error("Shopify Storefront Access Token is not configured.");
  }

  try {
    const response = await fetch(apiURL, {
      method: "POST",
      headers: headers,
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`[storeFront] Shopify API HTTP Error (${response.status}): ${errorBody}`);
      let errorMessage = `Shopify API request failed: ${response.statusText} (Status: ${response.status})`;
      try {
        const jsonError = JSON.parse(errorBody);
        if (jsonError && jsonError.errors && Array.isArray(jsonError.errors)) {
          errorMessage += ` - Details: ${jsonError.errors.map((e) => e.message || "Unknown Shopify error").join(", ")}`;
        } else if (jsonError && jsonError.error) {
            errorMessage += ` - Details: ${jsonError.error}`;
        }
      } catch (e) {
        errorMessage += ` - Raw Response Body: ${errorBody.substring(0, 300)}${errorBody.length > 300 ? "..." : ""}`;
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();
    if (result.errors && Array.isArray(result.errors) && result.errors.length > 0) {
      const errorMessages = result.errors.map((e) => e.message || "Unknown Shopify GraphQL error").join("; ");
      console.error("[storeFront] Shopify GraphQL Errors:", JSON.stringify(result.errors, null, 2));
      throw new Error(`Shopify GraphQL error: ${errorMessages}`);
    }
    return result;
  } catch (error) {
    console.error("[storeFront] Error during Shopify API call execution:", error.message);
    if (error.message.toLowerCase().includes("failed to fetch")) {
        throw new Error(`Network error or CORS issue: Failed to fetch from ${apiURL}. Check browser console (Network tab for preflight OPTIONS request details) and ensure the Shopify API version in your URL is current. Original error: ${error.message}`);
    }
    throw error;
  }
}

// --- Customer Management ---
export const CREATE_SHOPIFY_CUSTOMER_MUTATION = `
  mutation customerCreate($input: CustomerCreateInput!) {
    customerCreate(input: $input) {
      customer {
        id
        firstName
        lastName
        email
        phone
        acceptsMarketing
      }
      customerUserErrors {
        code
        field
        message
      }
    }
  }
`;

export const CUSTOMER_ACCESS_TOKEN_CREATE_MUTATION = `
  mutation customerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) {
    customerAccessTokenCreate(input: $input) {
      customerAccessToken {
        accessToken
        expiresAt
      }
      customerUserErrors {
        code
        field
        message
      }
    }
  }
`;

// --- Order History ---
export const GET_CUSTOMER_ORDERS_QUERY = `
  query getCustomerOrders($customerAccessToken: String!, $first: Int!, $cursor: String) {
    customer(customerAccessToken: $customerAccessToken) {
      orders(first: $first, after: $cursor, sortKey: PROCESSED_AT, reverse: true) {
        edges {
          node {
            id
            orderNumber
            processedAt
            financialStatus
            fulfillmentStatus
            totalPriceV2 {
              amount
              currencyCode
            }
            lineItems(first: 5) {
              edges {
                node {
                  title
                  quantity
                  variant {
                    image {
                      url(transform: {maxWidth: 100, maxHeight: 100})
                      altText
                    }
                    priceV2 {
                        amount
                        currencyCode
                    }
                  }
                }
              }
            }
          }
          cursor
        }
        pageInfo {
            hasNextPage
            endCursor
        }
      }
    }
  }
`;

// --- Manage Addresses ---
export const GET_CUSTOMER_ADDRESSES_QUERY = `
  query getCustomerAddresses($customerAccessToken: String!) {
    customer(customerAccessToken: $customerAccessToken) {
      defaultAddress {
        id
        address1
        address2
        city
        company
        country
        countryCodeV2
        firstName
        lastName
        phone
        province
        provinceCode
        zip
        formatted
      }
      addresses(first: 10) {
        edges {
          node {
            id
            address1
            address2
            city
            company
            country
            countryCodeV2
            firstName
            lastName
            phone
            province
            provinceCode
            zip
            formatted
          }
        }
      }
    }
  }
`;

export const CUSTOMER_ADDRESS_CREATE_MUTATION = `
  mutation customerAddressCreate($customerAccessToken: String!, $address: MailingAddressInput!) {
    customerAddressCreate(customerAccessToken: $customerAccessToken, address: $address) {
      customerAddress {
        id
      }
      customerUserErrors {
        code
        field
        message
      }
    }
  }
`;

export const CUSTOMER_ADDRESS_UPDATE_MUTATION = `
  mutation customerAddressUpdate($customerAccessToken: String!, $id: ID!, $address: MailingAddressInput!) {
    customerAddressUpdate(customerAccessToken: $customerAccessToken, id: $id, address: $address) {
      customerAddress {
        id
      }
      customerUserErrors {
        code
        field
        message
      }
    }
  }
`;

export const CUSTOMER_ADDRESS_DELETE_MUTATION = `
  mutation customerAddressDelete($customerAccessToken: String!, $id: ID!) {
    customerAddressDelete(customerAccessToken: $customerAccessToken, id: $id) {
      deletedCustomerAddressId
      customerUserErrors {
        code
        field
        message
      }
    }
  }
`;

export const CUSTOMER_DEFAULT_ADDRESS_UPDATE_MUTATION = `
  mutation customerDefaultAddressUpdate($customerAccessToken: String!, $addressId: ID!) {
    customerDefaultAddressUpdate(customerAccessToken: $customerAccessToken, addressId: $addressId) {
      customer {
        id
        defaultAddress {
          id
        }
      }
      customerUserErrors {
        code
        field
        message
      }
    }
  }
`;


// --- Cart Mutations and Queries ---
export const CART_FRAGMENT = `
  fragment CartFragment on Cart {
    id
    checkoutUrl
    cost {
      subtotalAmount {
        amount
        currencyCode
      }
      totalAmount {
        amount
        currencyCode
      }
      totalTaxAmount {
        amount
        currencyCode
      }
    }
    lines(first: 100) { # Adjust count as needed, or implement pagination for cart lines
      edges {
        node {
          id
          quantity
          merchandise {
            ... on ProductVariant {
              id
              title
              priceV2 {
                amount
                currencyCode
              }
              image {
                url(transform: {maxWidth: 100, maxHeight: 100})
                altText
              }
              product {
                title
                handle
              }
            }
          }
          attributes { # Custom attributes for customizations
            key
            value
          }
        }
      }
    }
    totalQuantity
    # buyerIdentity { # Useful if you want to associate cart with a logged-in customer
    #   customerAccessToken
    #   email
    #   phone
    #   countryCode
    # }
  }
`;

export const CART_CREATE_MUTATION = `
  mutation cartCreate($input: CartInput) {
    cartCreate(input: $input) {
      cart {
        ...CartFragment
      }
      userErrors {
        field
        message
      }
    }
  }
  ${CART_FRAGMENT}
`;

export const CART_LINES_ADD_MUTATION = `
  mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        ...CartFragment
      }
      userErrors {
        field
        message
      }
    }
  }
  ${CART_FRAGMENT}
`;

export const CART_LINES_UPDATE_MUTATION = `
  mutation cartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart {
        ...CartFragment
      }
      userErrors {
        field
        message
      }
    }
  }
  ${CART_FRAGMENT}
`;

export const CART_LINES_REMOVE_MUTATION = `
  mutation cartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart {
        ...CartFragment
      }
      userErrors {
        field
        message
      }
    }
  }
  ${CART_FRAGMENT}
`;

export const GET_CART_QUERY = `
  query getCart($id: ID!) {
    cart(id: $id) {
      ...CartFragment
    }
  }
  ${CART_FRAGMENT}
`;


// --- Helper Functions ---

/**
 * Creates a new customer in Shopify.
 * @param {object} input - The customer data (email, password, firstName, lastName).
 * @returns {Promise<any>} The Shopify API response.
 */
export async function createShopifyCustomer(input) {
  return storeFront(CREATE_SHOPIFY_CUSTOMER_MUTATION, { input });
}

/**
 * Creates a customer access token (logs in a customer).
 * @param {object} input - The login credentials (email, password).
 * @returns {Promise<any>} The Shopify API response.
 */
export async function createShopifyCustomerAccessToken(input) {
  return storeFront(CUSTOMER_ACCESS_TOKEN_CREATE_MUTATION, { input });
}

/**
 * Fetches customer orders from Shopify.
 * @param {string} customerAccessToken - The customer's access token.
 * @param {number} first - The number of orders to fetch.
 * @param {string | null} [cursor] - The cursor for pagination.
 * @returns {Promise<any>} The Shopify API response.
 */
export async function getCustomerOrders(customerAccessToken, first, cursor = null) {
  return storeFront(
    GET_CUSTOMER_ORDERS_QUERY,
    { customerAccessToken, first, cursor },
    customerAccessToken
  );
}

/**
 * Fetches customer addresses from Shopify.
 * @param {string} customerAccessToken - The customer's access token.
 * @returns {Promise<any>} The Shopify API response.
 */
export async function getCustomerAddresses(customerAccessToken) {
  return storeFront(
    GET_CUSTOMER_ADDRESSES_QUERY,
    { customerAccessToken },
    customerAccessToken
  );
}

/**
 * Creates a new customer address in Shopify.
 * @param {string} customerAccessToken - The customer's access token.
 * @param {object} addressInput - The address data.
 * @returns {Promise<any>} The Shopify API response.
 */
export async function createCustomerAddress(customerAccessToken, addressInput) {
  return storeFront(
    CUSTOMER_ADDRESS_CREATE_MUTATION,
    { customerAccessToken, address: addressInput },
    customerAccessToken
  );
}

/**
 * Updates an existing customer address in Shopify.
 * @param {string} customerAccessToken - The customer's access token.
 * @param {string} addressId - The ID of the address to update.
 * @param {object} addressInput - The new address data.
 * @returns {Promise<any>} The Shopify API response.
 */
export async function updateCustomerAddress(customerAccessToken, addressId, addressInput) {
  return storeFront(
    CUSTOMER_ADDRESS_UPDATE_MUTATION,
    { customerAccessToken, id: addressId, address: addressInput },
    customerAccessToken
  );
}

/**
 * Deletes a customer address in Shopify.
 * @param {string} customerAccessToken - The customer's access token.
 * @param {string} addressId - The ID of the address to delete.
 * @returns {Promise<any>} The Shopify API response.
 */
export async function deleteCustomerAddress(customerAccessToken, addressId) {
  return storeFront(
    CUSTOMER_ADDRESS_DELETE_MUTATION,
    { customerAccessToken, id: addressId },
    customerAccessToken
  );
}

/**
 * Sets a customer's default address in Shopify.
 * @param {string} customerAccessToken - The customer's access token.
 * @param {string} addressId - The ID of the address to set as default.
 * @returns {Promise<any>} The Shopify API response.
 */
export async function updateCustomerDefaultAddress(customerAccessToken, addressId) {
  return storeFront(
    CUSTOMER_DEFAULT_ADDRESS_UPDATE_MUTATION,
    { customerAccessToken, addressId },
    customerAccessToken
  );
}

// --- Cart Helper Functions ---
/**
 * Creates a new Shopify cart.
 * Can optionally include lines and buyer identity.
 * @param {object} [input={}] - The input for cart creation (e.g., { lines: [...], buyerIdentity: {...} }).
 * @returns {Promise<any>} The Shopify API response containing the cart.
 */
export async function createShopifyCart(input = {}) {
  return storeFront(CART_CREATE_MUTATION, { input });
}

/**
 * Fetches an existing Shopify cart by its ID.
 * @param {string} cartId - The ID of the cart to fetch.
 * @returns {Promise<any>} The Shopify API response containing the cart.
 */
export async function getShopifyCart(cartId) {
  if (!cartId) {
    console.warn("getShopifyCart called without cartId");
    return null; // Or throw an error, or return a specific structure
  }
  return storeFront(GET_CART_QUERY, { id: cartId });
}

/**
 * Adds line items to an existing Shopify cart.
 * @param {string} cartId - The ID of the cart.
 * @param {Array<object>} lines - An array of line items to add. Each item: { merchandiseId, quantity, attributes? }
 * @returns {Promise<any>} The Shopify API response containing the updated cart.
 */
export async function addLinesToShopifyCart(cartId, lines) {
  if (!cartId || !lines || lines.length === 0) {
    console.warn("addLinesToShopifyCart called with invalid parameters.");
    // Potentially throw an error or return a specific error structure
    return null; 
  }
  return storeFront(CART_LINES_ADD_MUTATION, { cartId, lines });
}

/**
 * Updates line items in an existing Shopify cart.
 * @param {string} cartId - The ID of the cart.
 * @param {Array<object>} lines - An array of line items to update. Each item: { id (line ID), quantity }
 * @returns {Promise<any>} The Shopify API response containing the updated cart.
 */
export async function updateLinesInShopifyCart(cartId, lines) {
  if (!cartId || !lines || lines.length === 0) {
    console.warn("updateLinesInShopifyCart called with invalid parameters.");
    return null;
  }
  return storeFront(CART_LINES_UPDATE_MUTATION, { cartId, lines });
}

/**
 * Removes line items from an existing Shopify cart.
 * @param {string} cartId - The ID of the cart.
 * @param {Array<string>} lineIds - An array of line item IDs to remove.
 * @returns {Promise<any>} The Shopify API response containing the updated cart.
 */
export async function removeLinesFromShopifyCart(cartId, lineIds) {
  if (!cartId || !lineIds || lineIds.length === 0) {
    console.warn("removeLinesFromShopifyCart called with invalid parameters.");
    return null;
  }
  return storeFront(CART_LINES_REMOVE_MUTATION, { cartId, lineIds });
}
