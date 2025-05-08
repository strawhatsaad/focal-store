export async function storeFront(query, variables = {}) {
    const response = await fetch(
      process.env.NEXT_PUBLIC_API_URL,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Storefront-Access-Token": process.env.NEXT_PUBLIC_STOREFRONT_ACCESS_TOKEN,
        },
        body: JSON.stringify({
          query,
          variables,
        }),
      }
    );
  
    const result = await response.json();
    console.log("GraphQL response:", JSON.stringify(result, null, 2));
    return result;
  }
  