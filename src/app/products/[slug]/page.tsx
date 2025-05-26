import Hero from "@/sections/Products/ProductDetails/Hero";
import React from "react";
import { storeFront } from "../../../../utils";
import RelatedProducts from "@/sections/Products/ProductDetails/RelatedProducts";
import ProductFeatures from "@/sections/Products/ProductDetails/ProductFeatures";
import FAQSection from "@/sections/Products/ProductDetails/FAQ";

interface PageProps {
  params: {
    slug: string;
  };
}

const ProductDetails = async ({ params }: PageProps) => {
  const { slug } = params;

  console.log("Fetching product (generic) with slug:", slug);

  const variables = {
    handle: slug,
  };

  let result;
  try {
    result = await storeFront(singleProductQuery, variables);
  } catch (error) {
    console.error("Error fetching single product (generic):", error);
    return (
      <main>
        <div>Product not found or error fetching data.</div>
      </main>
    );
  }

  if (!result.data?.productByHandle) {
    console.warn("Product data not found for slug (generic):", slug);
    return (
      <main>
        <div>Product not found.</div>
      </main>
    );
  }

  const data = result.data.productByHandle;
  console.log("Product data received (generic):", data);

  // Helper function to safely access metafields
  const getMetafieldValue = (
    key: string,
    metafieldsArray: any[] | null | undefined
  ) => {
    if (metafieldsArray && Array.isArray(metafieldsArray)) {
      const metafield = metafieldsArray.find((mf: any) => mf && mf.key === key);
      return metafield?.value || "";
    }
    return "";
  };

  const product = {
    id: data.handle,
    name: data.title,
    href: `/products/${data.handle}`,
    price: `$${parseFloat(
      data.priceRange?.minVariantPrice?.amount || "0"
    ).toFixed(2)}`,
    images:
      data.images?.edges?.map(({ node }: any) => ({
        id: node.id || node.url,
        src: node.transformedSrc || node.url || "",
        alt: node.altText || data.title || "Product image",
      })) || [],
    description: data.description,
    collection: data.collections?.edges?.[0]?.node.title || "",
    collectionHandle: data.collections?.edges?.[0]?.node.handle || "frontpage", // For related products
    product_type: data.productType || "",
    variants:
      data.variants?.edges?.map(({ node }: any) => ({
        id: node.id,
        name: node.title,
        price: `$${parseFloat(node.priceV2?.amount || "0").toFixed(2)}`,
        priceV2: {
          amount: parseFloat(node.priceV2?.amount || "0").toFixed(2),
          currencyCode: node.priceV2?.currencyCode || "USD",
        },
        optionNames: node.selectedOptions?.map((opt: any) => opt.name) || [],
        imageSrc: node.image?.transformedSrc || node.image?.url || "",
        imageAlt: node.image?.altText || "",
        image: node.image
          ? {
              id: node.image.id,
              src: node.image.transformedSrc || node.image.url,
              altText: node.image.altText,
            }
          : null,
      })) || [],
    type: getMetafieldValue("lens_type", data.metafields),
    material: getMetafieldValue("material", data.metafields),
    manufacturer: getMetafieldValue("manufacturer", data.metafields),
    frame_width: getMetafieldValue("frame_width1", data.metafields), // Assuming frame_width1 is correct key
    frame_size: getMetafieldValue("frame_size", data.metafields),
  };

  // For Related Products, use the fetched collection handle or a fallback
  const relatedProductCollectionHandle = product.collectionHandle;
  let relatedProductsResult;
  try {
    relatedProductsResult = await storeFront(allProductsQuery, {
      handle: relatedProductCollectionHandle,
    });
  } catch (error) {
    console.error(
      `Error fetching related products for collection ${relatedProductCollectionHandle}:`,
      error
    );
    relatedProductsResult = {
      data: { collectionByHandle: { products: { edges: [] } } },
    };
  }

  const relatedProductsData =
    relatedProductsResult.data?.collectionByHandle?.products?.edges || [];

  const relatedProducts = relatedProductsData
    .filter(({ node }: any) => node && node.handle !== slug)
    .slice(0, 4)
    .map(({ node }: any) => ({
      id: node.handle,
      name: node.title,
      href:
        node.collections?.edges?.[0]?.node.handle === "Eyewear" ||
        node.productType === "EYEGLASSES" ||
        node.productType === "SUNGLASSES"
          ? `/products/eyewear/${node.handle}`
          : `/products/${node.handle}`,
      price: `$${parseFloat(
        node.priceRange?.minVariantPrice?.amount || "0"
      ).toFixed(2)}`,
      imageSrc:
        node.featuredImage?.url ||
        node.images?.edges?.[0]?.node.transformedSrc ||
        "",
      imageAlt:
        node.featuredImage?.altText ||
        node.images?.edges?.[0]?.node.altText ||
        "Related product",
    }));

  return (
    <main>
      <Hero product={product} />
      <div className="lg:hidden container">
        <ProductFeatures
          product={product}
          selectedVariant={product.variants[0]?.name}
        />
      </div>
      <hr className="my-12 md:mb-8 md:mt-0 border-gray-800 container" />
      <FAQSection product={product} />
      <div>
        <RelatedProducts products={relatedProducts} headingText={true} />
      </div>
    </main>
  );
};

export default ProductDetails;

const gql = String.raw;

const singleProductQuery = gql`
  query GetProductByHandle($handle: String!) {
    productByHandle(handle: $handle) {
      title
      handle
      description
      productType
      tags
      collections(first: 1) {
        edges {
          node {
            title
            handle # Added handle for collection
          }
        }
      }
      priceRange {
        minVariantPrice {
          amount
          currencyCode
        }
        maxVariantPrice {
          amount
          currencyCode
        }
      }
      images(first: 10) {
        edges {
          node {
            id
            url
            transformedSrc
            altText
          }
        }
      }
      variants(first: 10) {
        edges {
          node {
            id
            title
            sku
            availableForSale
            priceV2 {
              amount
              currencyCode
            }
            selectedOptions {
              name
              value
            }
            image {
              id
              url
              transformedSrc
              altText
            }
          }
        }
      }
      # Ensure you are requesting the metafields with correct identifiers
      metafields(
        identifiers: [
          { namespace: "custom", key: "lens_type" }
          { namespace: "custom", key: "material" }
          { namespace: "custom", key: "manufacturer" }
          { namespace: "custom", key: "frame_width1" } # Verify this key if it's correct
          { namespace: "custom", key: "frame_size" }
        ]
      ) {
        namespace # Included for debugging if needed
        key
        value
        type # Included for debugging if needed
      }
    }
  }
`;

const allProductsQuery = gql`
  query GetCollectionProducts($handle: String!) {
    collectionByHandle(handle: $handle) {
      title
      description
      products(first: 5) {
        # Fetch a few more than 4 for filtering
        edges {
          node {
            id
            title
            handle
            productType
            collections(first: 1) {
              edges {
                node {
                  handle
                }
              }
            }
            featuredImage {
              url
              altText
            }
            images(first: 1) {
              edges {
                node {
                  transformedSrc
                  altText
                }
              }
            }
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
              maxVariantPrice {
                amount
                currencyCode
              }
            }
          }
        }
      }
    }
  }
`;
