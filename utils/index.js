// File: utils/index.js

/**
 * Makes a request to the Shopify Storefront API.
 * @param {string} query The GraphQL query string.
 * @param {Record<string, any>} [variables={}] The variables for the GraphQL query.
 * @param {string | null} [customerAccessToken=null] The customer's access token for authenticated requests.
 * @returns {Promise<any>} The Shopify API response.
 */
export async function storeFront(query, variables = {}, customerAccessToken = null) {
  // ... (existing storeFront function code - no changes here)
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
    throw error;
  }
}


/**
 * Makes a request to the Shopify Admin API.
 * IMPORTANT: This function should ONLY be called from server-side code.
 * @param {string} query The GraphQL query string.
 * @param {Record<string, any>} [variables={}] The variables for the GraphQL query.
 * @returns {Promise<any>} The Shopify Admin API response.
 */
export async function shopifyAdminRequest(query, variables = {}) {
  // ... (existing shopifyAdminRequest function code - ensure it's present and correct)
  const shopName = process.env.SHOPIFY_SHOP_NAME;
  const adminApiAccessToken = process.env.SHOPIFY_ADMIN_API_ACCESS_TOKEN;
  const adminApiVersion = process.env.SHOPIFY_ADMIN_API_VERSION || '2024-07'; 

  if (!shopName || !adminApiAccessToken) {
    console.error("Shopify Admin API credentials are not configured.");
    throw new Error("Shopify Admin API credentials are not configured.");
  }

  const adminApiURL = `https://${shopName}.myshopify.com/admin/api/${adminApiVersion}/graphql.json`;
  console.log(`[shopifyAdminRequest] Using Admin API URL: ${adminApiURL}`);

  const headers = {
    "Content-Type": "application/json",
    "X-Shopify-Access-Token": adminApiAccessToken,
  };

  try {
    const response = await fetch(adminApiURL, {
      method: "POST",
      headers: headers,
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`[shopifyAdminRequest] Shopify Admin API HTTP Error (${response.status}) for URL ${adminApiURL}: ${errorBody}`);
      let errorMessage = `Shopify Admin API request failed: ${response.statusText} (Status: ${response.status})`;
       try {
        const jsonError = JSON.parse(errorBody);
        if (jsonError && jsonError.errors) {
          if (Array.isArray(jsonError.errors)) {
            errorMessage += ` - Details: ${jsonError.errors.map((e) => e.message || "Unknown Shopify Admin error").join(", ")}`;
          } else if (typeof jsonError.errors === 'string') {
             errorMessage += ` - Details: ${jsonError.errors}`;
          } else if (typeof jsonError.errors === 'object') {
            errorMessage += ` - Details: ${JSON.stringify(jsonError.errors)}`;
          }
        }
      } catch (e) {
        errorMessage += ` - Raw Response Body: ${errorBody.substring(0, 300)}${errorBody.length > 300 ? "..." : ""}`;
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();
    if (result.errors && Array.isArray(result.errors) && result.errors.length > 0) {
      const errorMessages = result.errors.map((e) => e.message || "Unknown Shopify Admin GraphQL error").join("; ");
      console.error("[shopifyAdminRequest] Shopify Admin GraphQL Errors:", JSON.stringify(result.errors, null, 2));
      throw new Error(`Shopify Admin GraphQL error: ${errorMessages}`);
    }
    
    const mutationName = Object.keys(result.data || {})[0];
    if (mutationName && result.data?.[mutationName]?.userErrors?.length > 0) {
        const userErrors = result.data[mutationName].userErrors;
        const errorMessages = userErrors.map((e) => e.message || "Unknown Shopify Admin user error").join("; ");
        console.error(`[shopifyAdminRequest] Shopify Admin User Errors in ${mutationName}:`, JSON.stringify(userErrors, null, 2));
        throw new Error(`Shopify Admin user error: ${errorMessages}`);
    }
    return result;
  } catch (error) {
    console.error("[shopifyAdminRequest] Error during Shopify Admin API call execution:", error.message);
    if (error.message.toLowerCase().includes("failed to fetch")) {
        throw new Error(`Network error: Failed to fetch from ${adminApiURL}. Original error: ${error.message}`);
    }
    throw error;
  }
}

// --- Customer Management (Storefront & Admin as needed) ---
// ... (all existing customer mutations: CREATE_SHOPIFY_CUSTOMER_MUTATION, CUSTOMER_ACCESS_TOKEN_CREATE_MUTATION, GET_CUSTOMER_INFO_QUERY, CUSTOMER_UPDATE_MUTATION)

// --- Draft Order (Admin API) ---
export const DRAFT_ORDER_CREATE_MUTATION = `
  mutation draftOrderCreate($input: DraftOrderInput!) {
    draftOrderCreate(input: $input) {
      draftOrder {
        id
        invoiceUrl
        name
        status
        totalPriceSet {
          presentmentMoney {
            amount
            currencyCode
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

// ... (all existing Order, Address, Cart Storefront API mutations and fragments)

// --- Helper Functions ---
// ... (all existing helper functions for Storefront API calls)

/**
 * Creates a new Shopify draft order using the Admin API.
 * @param {object} draftOrderInput - The DraftOrderInput object.
 * @returns {Promise<any>} The Shopify Admin API response.
 */
export async function createShopifyDraftOrder(draftOrderInput) {
  if (!draftOrderInput) {
    console.error("[createShopifyDraftOrder] draftOrderInput is required.");
    throw new Error("Draft order input is required.");
  }
  return shopifyAdminRequest(DRAFT_ORDER_CREATE_MUTATION, { input: draftOrderInput });
}

// --- Make sure to keep other existing mutations and helpers:
// CREATE_SHOPIFY_CUSTOMER_MUTATION, CUSTOMER_ACCESS_TOKEN_CREATE_MUTATION, GET_CUSTOMER_INFO_QUERY, CUSTOMER_UPDATE_MUTATION (if used for password)
// GET_CUSTOMER_ORDERS_QUERY, GET_CUSTOMER_ADDRESSES_QUERY, and all address mutations
// All CART_FRAGMENT and cart mutations (CART_CREATE_MUTATION, etc.)
// All helper functions like createShopifyCustomer, createShopifyCart, etc.
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
// Assuming CUSTOMER_UPDATE_MUTATION is still needed for direct password set on Focal account page
export const CUSTOMER_UPDATE_MUTATION = `
mutation customerUpdate($input: CustomerInput!) {
  customerUpdate(input: $input) {
    customer { id email }
    userErrors { field message }
  }
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

export const CART_FRAGMENT = `
  fragment CartFragment on Cart {
    id
    checkoutUrl
    cost {
      subtotalAmount { amount currencyCode }
      totalAmount { amount currencyCode }
      totalTaxAmount { amount currencyCode }
    }
    lines(first: 100) {
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
    buyerIdentity { 
      email
      phone
      customer { id }
      countryCode
    }
  }
`;
export const CART_CREATE_MUTATION = `mutation cartCreate($input: CartInput) { cartCreate(input: $input) { cart { ...CartFragment } userErrors { field message } } } ${CART_FRAGMENT}`;
export const CART_LINES_ADD_MUTATION = `mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) { cartLinesAdd(cartId: $cartId, lines: $lines) { cart { ...CartFragment } userErrors { field message } } } ${CART_FRAGMENT}`;
export const CART_LINES_UPDATE_MUTATION = `mutation cartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) { cartLinesUpdate(cartId: $cartId, lines: $lines) { cart { ...CartFragment } userErrors { field message } } } ${CART_FRAGMENT}`;
export const CART_LINES_REMOVE_MUTATION = `mutation cartLinesRemove($cartId: ID!, $lineIds: [ID!]!) { cartLinesRemove(cartId: $cartId, lineIds: $lineIds) { cart { ...CartFragment } userErrors { field message } } } ${CART_FRAGMENT}`;
export const GET_CART_QUERY = `query getCart($id: ID!) { cart(id: $id) { ...CartFragment } } ${CART_FRAGMENT}`;
export const CART_BUYER_IDENTITY_UPDATE_MUTATION = `
  mutation cartBuyerIdentityUpdate($cartId: ID!, $buyerIdentity: CartBuyerIdentityInput!) {
    cartBuyerIdentityUpdate(cartId: $cartId, buyerIdentity: $buyerIdentity) {
      cart { ...CartFragment }
      userErrors { field message code }
    }
  }
  ${CART_FRAGMENT}
`;

export async function createShopifyCustomer(input) { return storeFront(CREATE_SHOPIFY_CUSTOMER_MUTATION, { input }); }
export async function createShopifyCustomerAccessToken(input) { return storeFront(CUSTOMER_ACCESS_TOKEN_CREATE_MUTATION, { input }); }
export async function getCustomerOrders(customerAccessToken, first, cursor = null) { return storeFront(GET_CUSTOMER_ORDERS_QUERY, { customerAccessToken, first, cursor }, customerAccessToken); }
export async function getCustomerAddresses(customerAccessToken) { return storeFront(GET_CUSTOMER_ADDRESSES_QUERY, { customerAccessToken }, customerAccessToken); }
export async function createCustomerAddress(customerAccessToken, addressInput) { return storeFront(CUSTOMER_ADDRESS_CREATE_MUTATION, { customerAccessToken, address: addressInput }, customerAccessToken); }
export async function updateCustomerAddress(customerAccessToken, addressId, addressInput) { return storeFront(CUSTOMER_ADDRESS_UPDATE_MUTATION, { customerAccessToken, id: addressId, address: addressInput }, customerAccessToken); }
export async function deleteCustomerAddress(customerAccessToken, addressId) { return storeFront(CUSTOMER_ADDRESS_DELETE_MUTATION, { customerAccessToken, id: addressId }, customerAccessToken); }
export async function updateCustomerDefaultAddress(customerAccessToken, addressId) { return storeFront(CUSTOMER_DEFAULT_ADDRESS_UPDATE_MUTATION, { customerAccessToken, addressId }, customerAccessToken); }

export async function createShopifyCart(input = {}) { return storeFront(CART_CREATE_MUTATION, { input }); }
export async function getShopifyCart(cartId) { if (!cartId) { console.warn("getShopifyCart called without cartId"); return null; } return storeFront(GET_CART_QUERY, { id: cartId }); }
export async function addLinesToShopifyCart(cartId, lines) { if (!cartId || !lines || lines.length === 0) { console.warn("addLinesToShopifyCart called with invalid parameters."); return null; } return storeFront(CART_LINES_ADD_MUTATION, { cartId, lines }); }
export async function updateLinesInShopifyCart(cartId, lines) { if (!cartId || !lines || lines.length === 0) { console.warn("updateLinesInShopifyCart called with invalid parameters."); return null; } return storeFront(CART_LINES_UPDATE_MUTATION, { cartId, lines }); }
export async function removeLinesFromShopifyCart(cartId, lineIds) { if (!cartId || !lineIds || lineIds.length === 0) { console.warn("removeLinesFromShopifyCart called with invalid parameters."); return null; } return storeFront(CART_LINES_REMOVE_MUTATION, { cartId, lineIds }); }
export async function associateCartWithCustomer(cartId, customerAccessToken, customerEmail = null) {
  if (!cartId || !customerAccessToken) {
    console.warn("associateCartWithCustomer called with invalid parameters.");
    throw new Error("Cart ID and Customer Access Token are required for association.");
  }
  const buyerIdentity = { customerAccessToken: customerAccessToken, ...(customerEmail && { email: customerEmail }) };
  return storeFront(CART_BUYER_IDENTITY_UPDATE_MUTATION, { cartId, buyerIdentity });
}
