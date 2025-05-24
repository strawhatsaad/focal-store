// File: utils/index.js

// Your existing storeFront function
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
    console.error("Shopify API URL is not defined in environment variables.");
    throw new Error("Shopify API URL is not configured.");
  }
  if (!process.env.NEXT_PUBLIC_STOREFRONT_ACCESS_TOKEN) {
    console.error("Shopify Storefront Access Token is not defined in environment variables.");
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
      console.error(`Shopify API Error (${response.status}): ${errorBody}`);
      try {
        const jsonError = JSON.parse(errorBody);
        if (jsonError && jsonError.errors) {
          throw new Error(
            `Shopify API request failed: ${response.statusText} - ${jsonError.errors
              .map((e) => e.message)
              .join(", ")}`
          );
        }
      } catch (e) {
        // If parsing fails, just throw with the text body
      }
      throw new Error(`Shopify API request failed: ${response.statusText}`);
    }

    const result = await response.json();
    if (result.errors) {
      console.error("Shopify GraphQL Errors:", JSON.stringify(result.errors, null, 2));
    }
    return result;
  } catch (error) {
    console.error("Network or other error in storeFront function:", error);
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

// Helper functions (optional, but good practice)

/**
 * Creates a new customer in Shopify.
 * @param {object} input - The customer data (email, password, firstName, lastName).
 * @returns {Promise<object>} The Shopify API response.
 */
export async function createShopifyCustomer(input) {
  return storeFront(CREATE_SHOPIFY_CUSTOMER_MUTATION, { input });
}

/**
 * Creates a customer access token (logs in a customer).
 * @param {object} input - The login credentials (email, password).
 * @returns {Promise<object>} The Shopify API response.
 */
export async function createShopifyCustomerAccessToken(input) {
  return storeFront(CUSTOMER_ACCESS_TOKEN_CREATE_MUTATION, { input });
}

/**
 * Fetches customer orders from Shopify.
 * @param {string} customerAccessToken - The customer's access token.
 * @param {number} first - The number of orders to fetch.
 * @param {string} [cursor] - The cursor for pagination.
 * @returns {Promise<object>} The Shopify API response.
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
 * @returns {Promise<object>} The Shopify API response.
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
 * @returns {Promise<object>} The Shopify API response.
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
 * @returns {Promise<object>} The Shopify API response.
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
 * @returns {Promise<object>} The Shopify API response.
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
 * @returns {Promise<object>} The Shopify API response.
 */
export async function updateCustomerDefaultAddress(customerAccessToken, addressId) {
  return storeFront(
    CUSTOMER_DEFAULT_ADDRESS_UPDATE_MUTATION,
    { customerAccessToken, addressId },
    customerAccessToken
  );
}
