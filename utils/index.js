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
    console.error("Shopify Storefront API URL is not defined in environment variables (NEXT_PUBLIC_API_URL).");
    throw new Error("Shopify Storefront API URL is not configured.");
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
    // It's important to check for GraphQL errors even if the HTTP status is OK
    if (result.errors && Array.isArray(result.errors) && result.errors.length > 0) {
      const errorMessages = result.errors.map((e) => e.message || "Unknown Shopify GraphQL error").join("; ");
      console.error("[storeFront] Shopify GraphQL Errors:", JSON.stringify(result.errors, null, 2));
      throw new Error(`Shopify GraphQL error: ${errorMessages}`);
    }
    return result;
  } catch (error) {
    console.error("[storeFront] Error during Shopify API call execution:", error.message);
    if (error.message.toLowerCase().includes("failed to fetch")) {
        throw new Error(`Network error or CORS issue: Failed to fetch from ${apiURL}. Check browser console. Original error: ${error.message}`);
    }
    throw error; // Re-throw the error to be caught by the caller
  }
}

// ... (keep all your existing mutations and helper functions for customer, orders, addresses, etc.)

// --- Cart Mutations and Queries (Storefront API) ---
export const CART_FRAGMENT = `
  fragment CartFragment on Cart {
    id
    checkoutUrl
    cost {
      subtotalAmount { amount currencyCode }
      totalAmount { amount currencyCode }
      totalTaxAmount { amount currencyCode }
    }
    lines(first: 100) { # Adjust count as needed
      edges {
        node {
          id
          quantity
          merchandise {
            ... on ProductVariant {
              id
              title
              priceV2 { amount currencyCode }
              image { url(transform: {maxWidth: 100, maxHeight: 100}) altText }
              product { title handle }
            }
          }
          attributes { key value }
        }
      }
    }
    totalQuantity
    buyerIdentity { # Corrected: customerAccessToken is not a field on the returned CartBuyerIdentity
      email
      phone
      customer {
        id # Shopify Customer GID
      }
      countryCode
      # deliveryAddressPreferences { # if you need this
      #   ... on MailingAddress {
      #     address1
      #   }
      # }
    }
  }
`;

export const CART_CREATE_MUTATION = `mutation cartCreate($input: CartInput) { cartCreate(input: $input) { cart { ...CartFragment } userErrors { field message } } } ${CART_FRAGMENT}`;
export const CART_LINES_ADD_MUTATION = `mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) { cartLinesAdd(cartId: $cartId, lines: $lines) { cart { ...CartFragment } userErrors { field message } } } ${CART_FRAGMENT}`;
export const CART_LINES_UPDATE_MUTATION = `mutation cartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) { cartLinesUpdate(cartId: $cartId, lines: $lines) { cart { ...CartFragment } userErrors { field message } } } ${CART_FRAGMENT}`;
export const CART_LINES_REMOVE_MUTATION = `mutation cartLinesRemove($cartId: ID!, $lineIds: [ID!]!) { cartLinesRemove(cartId: $cartId, lineIds: $lineIds) { cart { ...CartFragment } userErrors { field message } } } ${CART_FRAGMENT}`;
export const GET_CART_QUERY = `query getCart($id: ID!) { cart(id: $id) { ...CartFragment } } ${CART_FRAGMENT}`;

// NEW MUTATION for associating a cart with a customer
export const CART_BUYER_IDENTITY_UPDATE_MUTATION = `
  mutation cartBuyerIdentityUpdate($cartId: ID!, $buyerIdentity: CartBuyerIdentityInput!) {
    cartBuyerIdentityUpdate(cartId: $cartId, buyerIdentity: $buyerIdentity) {
      cart {
        ...CartFragment
      }
      userErrors {
        field
        message
        code # Include code for better error handling
      }
    }
  }
  ${CART_FRAGMENT}
`;


// --- Cart Helper Functions ---
export async function createShopifyCart(input = {}) { return storeFront(CART_CREATE_MUTATION, { input }); }
export async function getShopifyCart(cartId) { if (!cartId) { console.warn("getShopifyCart called without cartId"); return null; } return storeFront(GET_CART_QUERY, { id: cartId }); }
export async function addLinesToShopifyCart(cartId, lines) { if (!cartId || !lines || lines.length === 0) { console.warn("addLinesToShopifyCart called with invalid parameters."); return null; } return storeFront(CART_LINES_ADD_MUTATION, { cartId, lines }); }
export async function updateLinesInShopifyCart(cartId, lines) { if (!cartId || !lines || lines.length === 0) { console.warn("updateLinesInShopifyCart called with invalid parameters."); return null; } return storeFront(CART_LINES_UPDATE_MUTATION, { cartId, lines }); }
export async function removeLinesFromShopifyCart(cartId, lineIds) { if (!cartId || !lineIds || lineIds.length === 0) { console.warn("removeLinesFromShopifyCart called with invalid parameters."); return null; } return storeFront(CART_LINES_REMOVE_MUTATION, { cartId, lineIds }); }

/**
 * Associates a cart with a customer using their access token.
 * @param {string} cartId The ID of the cart to update.
 * @param {string} customerAccessToken The customer's access token.
 * @param {string | null} [customerEmail] The customer's email (optional but good to include).
 * @returns {Promise<any>} The Shopify API response.
 */
export async function associateCartWithCustomer(cartId, customerAccessToken, customerEmail = null) {
  if (!cartId || !customerAccessToken) {
    console.warn("associateCartWithCustomer called with invalid parameters.");
    throw new Error("Cart ID and Customer Access Token are required for association.");
  }
  const buyerIdentity = { // This is CartBuyerIdentityInput!
    customerAccessToken: customerAccessToken,
    ...(customerEmail && { email: customerEmail }),
    // countryCode: "US", // Example: If you collect/require this
  };
  return storeFront(CART_BUYER_IDENTITY_UPDATE_MUTATION, { cartId, buyerIdentity });
}

// Ensure other mutations and helpers are present as they were
export const CREATE_SHOPIFY_CUSTOMER_MUTATION = `
  mutation customerCreate($input: CustomerCreateInput!) {
    customerCreate(input: $input) {
      customer { id firstName lastName email }
      customerUserErrors { code field message }
    }
  }
`;
export const CUSTOMER_ACCESS_TOKEN_CREATE_MUTATION = `
  mutation customerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) {
    customerAccessTokenCreate(input: $input) {
      customerAccessToken { accessToken expiresAt }
      customerUserErrors { code field message }
    }
  }
`;
export const GET_CUSTOMER_INFO_QUERY = `
  query getCustomerInfo($customerAccessToken: String!) {
    customer(customerAccessToken: $customerAccessToken) { id email firstName lastName }
  }
`;
export const GET_CUSTOMER_ORDERS_QUERY = `
  query getCustomerOrders($customerAccessToken: String!, $first: Int!, $cursor: String) {
    customer(customerAccessToken: $customerAccessToken) {
      orders(first: $first, after: $cursor, sortKey: PROCESSED_AT, reverse: true) {
        edges { node { id orderNumber processedAt financialStatus fulfillmentStatus totalPriceV2 { amount currencyCode } lineItems(first: 5) { edges { node { title quantity variant { image { url(transform: {maxWidth: 100, maxHeight: 100}) altText } priceV2 { amount currencyCode } } } } } } } cursor }
        pageInfo { hasNextPage endCursor }
      }
    }
  }
`;
export const GET_CUSTOMER_ADDRESSES_QUERY = `
  query getCustomerAddresses($customerAccessToken: String!) {
    customer(customerAccessToken: $customerAccessToken) {
      defaultAddress { id address1 address2 city company country countryCodeV2 firstName lastName phone province provinceCode zip formatted }
      addresses(first: 10) { edges { node { id address1 address2 city company country countryCodeV2 firstName lastName phone province provinceCode zip formatted } } }
    }
  }
`;
export const CUSTOMER_ADDRESS_CREATE_MUTATION = `
  mutation customerAddressCreate($customerAccessToken: String!, $address: MailingAddressInput!) {
    customerAddressCreate(customerAccessToken: $customerAccessToken, address: $address) { customerAddress { id } customerUserErrors { code field message } }
  }
`;
export const CUSTOMER_ADDRESS_UPDATE_MUTATION = `
  mutation customerAddressUpdate($customerAccessToken: String!, $id: ID!, $address: MailingAddressInput!) {
    customerAddressUpdate(customerAccessToken: $customerAccessToken, id: $id, address: $address) { customerAddress { id } customerUserErrors { code field message } }
  }
`;
export const CUSTOMER_ADDRESS_DELETE_MUTATION = `
  mutation customerAddressDelete($customerAccessToken: String!, $id: ID!) {
    customerAddressDelete(customerAccessToken: $customerAccessToken, id: $id) { deletedCustomerAddressId customerUserErrors { code field message } }
  }
`;
export const CUSTOMER_DEFAULT_ADDRESS_UPDATE_MUTATION = `
  mutation customerDefaultAddressUpdate($customerAccessToken: String!, $addressId: ID!) {
    customerDefaultAddressUpdate(customerAccessToken: $customerAccessToken, addressId: $addressId) { customer { id defaultAddress { id } } customerUserErrors { code field message } }
  }
`;

export async function createShopifyCustomer(input) { return storeFront(CREATE_SHOPIFY_CUSTOMER_MUTATION, { input }); }
export async function createShopifyCustomerAccessToken(input) { return storeFront(CUSTOMER_ACCESS_TOKEN_CREATE_MUTATION, { input }); }
export async function getCustomerOrders(customerAccessToken, first, cursor = null) { return storeFront(GET_CUSTOMER_ORDERS_QUERY, { customerAccessToken, first, cursor }, customerAccessToken); }
export async function getCustomerAddresses(customerAccessToken) { return storeFront(GET_CUSTOMER_ADDRESSES_QUERY, { customerAccessToken }, customerAccessToken); }
export async function createCustomerAddress(customerAccessToken, addressInput) { return storeFront(CUSTOMER_ADDRESS_CREATE_MUTATION, { customerAccessToken, address: addressInput }, customerAccessToken); }
export async function updateCustomerAddress(customerAccessToken, addressId, addressInput) { return storeFront(CUSTOMER_ADDRESS_UPDATE_MUTATION, { customerAccessToken, id: addressId, address: addressInput }, customerAccessToken); }
export async function deleteCustomerAddress(customerAccessToken, addressId) { return storeFront(CUSTOMER_ADDRESS_DELETE_MUTATION, { customerAccessToken, id: addressId }, customerAccessToken); }
export async function updateCustomerDefaultAddress(customerAccessToken, addressId) { return storeFront(CUSTOMER_DEFAULT_ADDRESS_UPDATE_MUTATION, { customerAccessToken, addressId }, customerAccessToken); }
