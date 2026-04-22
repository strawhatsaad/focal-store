import EyewearHero from "@/sections/Products/ProductDetails/EyewearHero";
import React, { Suspense } from "react";
import RelatedProducts from "@/sections/Products/ProductDetails/RelatedProducts";
import ProductFeatures from "@/sections/Products/ProductDetails/ProductFeatures";
import FAQSection from "@/sections/Products/ProductDetails/FAQ";
import { storeFront } from "../../../../../utils";

export const revalidate = 3600;

interface PageProps {
  params: {
    slug: string;
  };
}

const ProductDetails = async ({ params }: PageProps) => {
  const { slug } = params;

  const variables = {
    handle: slug,
  };

  let result;
  try {
    result = await storeFront(singleProductQuery, variables, null, {
      revalidate: 3600,
      tags: [`product:${slug}`],
    });
  } catch (error) {
    console.error("Error fetching single product:", error);
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
    colorSwatches: getMetafieldValue("color_swatches")
      ? JSON.parse(getMetafieldValue("color_swatches"))
      : [],
    frameWidths: getMetafieldValue("frame_widths")
      ? JSON.parse(getMetafieldValue("frame_widths"))
      : [],
    frameMeasurements: getMetafieldValue("frame_measurements") || "",
  };

  return (
    <main>
      <EyewearHero product={product} />
      <div className="lg:hidden container">
        <ProductFeatures
          product={product}
          selectedVariant={product.variants[0]?.name}
        />
      </div>
      <hr className="my-12 md:mb-8 md:mt-0 border-gray-800 container" />
      <FAQSection product={product} />
      <Suspense fallback={<RelatedProductsSkeleton />}>
        <RelatedProductsSection excludeSlug={slug} />
      </Suspense>
    </main>
  );
};

async function RelatedProductsSection({ excludeSlug }: { excludeSlug: string }) {
  let relatedProductsResult;
  try {
    relatedProductsResult = await storeFront(
      allProductsQuery,
      { handle: "Eyewear" },
      null,
      { revalidate: 3600, tags: ["collection:Eyewear"] }
    );
  } catch (error) {
    console.error("Error fetching related products:", error);
    return null;
  }

  const relatedProductsData =
    relatedProductsResult.data?.collectionByHandle?.products.edges || [];
  const relatedProducts = relatedProductsData
    .filter(({ node }: any) => node && node.handle !== excludeSlug)
    .slice(0, 4)
    .map(({ node }: any) => ({
      id: node.handle,
      name: node.title,
      href: `/products/eyewear/${node.handle}`,
      price: `$${parseFloat(node.priceRange.minVariantPrice.amount).toFixed(2)}`,
      imageSrc: node.featuredImage?.url || "",
      imageAlt: node.featuredImage?.altText || "",
    }));

  return <RelatedProducts products={relatedProducts} headingText={true} />;
}

function RelatedProductsSkeleton() {
  return (
    <div className="container py-8">
      <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-6" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="aspect-square bg-gray-200 rounded animate-pulse"
          />
        ))}
      </div>
    </div>
  );
}

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
          { namespace: "custom", key: "color_swatches" }
          { namespace: "custom", key: "frame_widths" }
          { namespace: "custom", key: "frame_measurements" }
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
      products(first: 10) {
        edges {
          node {
            id
            title
            handle
            featuredImage {
              url
              altText
            }
            priceRange {
              minVariantPrice {
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
