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

// The GET_SHOPIFY_CUSTOMER_BY_EMAIL_QUERY and its helper function are removed
// as the query `customers(first: 1, query: $emailQuery)` is not valid for Storefront API
// for general email lookup without specific conditions or different API (Admin API).


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
export const CART_FRAGMENT = `/* ... existing fragment ... */`;
export const CART_CREATE_MUTATION = `/* ... existing mutation ... */`;
export const CART_LINES_ADD_MUTATION = `/* ... existing mutation ... */`;
export const CART_LINES_UPDATE_MUTATION = `/* ... existing mutation ... */`;
export const CART_LINES_REMOVE_MUTATION = `/* ... existing mutation ... */`;
export const GET_CART_QUERY = `/* ... existing query ... */`;


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

// getShopifyCustomerByEmail function removed as its query was invalid for Storefront API


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
export async function createShopifyCart(input = {}) { /* ... */ }
export async function getShopifyCart(cartId) { /* ... */ }
export async function addLinesToShopifyCart(cartId, lines) { /* ... */ }
export async function updateLinesInShopifyCart(cartId, lines) { /* ... */ }
export async function removeLinesFromShopifyCart(cartId, lineIds) { /* ... */ }
