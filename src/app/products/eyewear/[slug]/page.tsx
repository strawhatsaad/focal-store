import Hero from "@/sections/Products/ProductDetails/Hero";
import React from "react";
import RelatedProducts from "@/sections/Products/ProductDetails/RelatedProducts";
import ProductFeatures from "@/sections/Products/ProductDetails/ProductFeatures";
import FAQSection from "@/sections/Products/ProductDetails/FAQ";
import { storeFront } from "../../../../../utils";

interface PageProps {
  params: {
    slug: string;
  };
}

const ProductDetails = async ({ params }: PageProps) => {
  const { slug } = params;

  console.log("Fetching product with slug:", slug);

  const variables = {
    handle: slug,
  };

  let result;
  try {
    result = await storeFront(singleProductQuery, variables);
  } catch (error) {
    console.error("Error fetching single product:", error);
    // Handle error appropriately, maybe return a not found page or error component
    return (
      <main>
        <div>Product not found or error fetching data.</div>
      </main>
    );
  }

  if (!result.data?.productByHandle) {
    console.warn("Product data not found for slug:", slug);
    return (
      <main>
        <div>Product not found.</div>
      </main>
    );
  }

  const data = result.data.productByHandle;
  console.log("Product data received:", data);

  // Safe access to metafields
  const getMetafieldValue = (key: string) => {
    if (data.metafields && Array.isArray(data.metafields)) {
      const metafield = data.metafields.find((mf: any) => mf && mf.key === key);
      return metafield?.value || "";
    }
    return "";
  };

  const product = {
    id: data.handle,
    name: data.title,
    href: `/products/eyewear/${data.handle}`,
    price: `$${parseFloat(data.priceRange.minVariantPrice.amount).toFixed(2)}`,
    imageSrc:
      data.images?.edges?.[0]?.node.transformedSrc ||
      data.images?.edges?.[0]?.node.url ||
      "",
    images:
      data.images?.edges?.map(({ node }: any) => ({
        id: node.id || node.url,
        src: node.transformedSrc || node.url,
        alt: node.altText || data.title,
      })) || [],
    description: data.description,
    variants:
      data.variants?.edges?.map(({ node }: any) => ({
        id: node.id,
        name: node.title,
        price: `$${parseFloat(node.priceV2.amount).toFixed(2)}`,
        priceV2: {
          amount: parseFloat(node.priceV2.amount).toFixed(2),
          currencyCode: node.priceV2.currencyCode,
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
    type: getMetafieldValue("lens_type"),
    material: getMetafieldValue("material"),
    manufacturer: getMetafieldValue("manufacturer"),
    collection: "Eyewear",
    product_type: data.productType || "Eyewear",
    frame_width: getMetafieldValue("frame_width1"),
    frame_size: getMetafieldValue("frame_size"),
  };

  let relatedProductsResult;
  try {
    relatedProductsResult = await storeFront(allProductsQuery, {
      handle: "Eyewear",
    });
  } catch (error) {
    console.error("Error fetching related products:", error);
    relatedProductsResult = {
      data: { collectionByHandle: { products: { edges: [] } } },
    }; // Default to empty
  }

  const relatedProductsData =
    relatedProductsResult.data?.collectionByHandle?.products.edges || [];
  const relatedProducts = relatedProductsData
    .filter(({ node }: any) => node && node.handle !== slug)
    .slice(0, 4)
    .map(({ node }: any) => ({
      id: node.handle,
      name: node.title,
      href: `/products/eyewear/${node.handle}`,
      price: `$${parseFloat(node.priceRange.minVariantPrice.amount).toFixed(
        2
      )}`,
      imageSrc:
        node.featuredImage?.url ||
        node.images?.edges?.[0]?.node.transformedSrc ||
        "",
      imageAlt:
        node.featuredImage?.altText ||
        node.images?.edges?.[0]?.node.altText ||
        "",
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
      metafields(
        identifiers: [
          { namespace: "custom", key: "lens_type" }
          { namespace: "custom", key: "material" }
          { namespace: "custom", key: "manufacturer" }
          { namespace: "custom", key: "frame_width1" }
          { namespace: "custom", key: "frame_size" }
        ]
      ) {
        namespace
        key
        value
        type
      }
    }
  }
`;

const allProductsQuery = gql`
  query GetCollectionProducts($handle: String!) {
    collectionByHandle(handle: $handle) {
      title
      description
      products(first: 10) {
        edges {
          node {
            id
            title
            handle
            description
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
