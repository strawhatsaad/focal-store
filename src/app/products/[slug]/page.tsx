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

  const variables = {
    handle: slug, // Replace with dynamic value as needed
  };

  let result = await storeFront(singleProductQuery, variables);

  let data = result.data.productByHandle;

  const product = {
    id: data.handle,
    name: data.title,
    href: `/products/${data.handle}`,
    price: `$${data.priceRange.minVariantPrice.amount}`,
    images: data.images.edges.map(({ node }: any) => ({
      src: node.transformedSrc || "",
      alt: node.altText || "",
    })),
    description: data.description,
    collection: data.collections.edges[0]?.node.title || "",
    variants: data.variants.edges.map(({ node }: any) => ({
      id: node.id,
      name: node.title,
      price: `$${node.priceV2.amount}`,
      optionNames: node.selectedOptions.map((opt: any) => opt.name),
      imageSrc: node.image?.transformedSrc || "",
      imageAlt: node.image?.altText || "",
    })),
    type: data.metafields[0]?.value || "",
    material: data.metafields[1]?.value || "",
    manufacturer: data.metafields[2]?.value || "",
    frame_width: data.metafields[3]?.value || "",
    frame_size: data.metafields[4]?.value || "",
  };

  console.log(product);

  const relatedProductVariables = {
    handle: product.collection || "", // Replace with dynamic value as needed
  };

  result = await storeFront(allProductsQuery, relatedProductVariables);

  data = result.data.collectionByHandle.products.edges;

  const relatedProducts = data.map(({ node }: any) => ({
    id: node.id,
    name: node.title,
    href: `/products/${node.handle}`,
    price: `$${node.priceRange.minVariantPrice.amount}`,
    imageSrc: node.featuredImage.url,
    imageAlt: node.featuredImage.altText,
  }));

  return (
    <main>
      <Hero product={product} />
      <div className="lg:hidden container">
        <ProductFeatures product={product} />
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
      tags
      collections(first: 1) {
        edges {
          node {
            title
          }
        }
      }
      priceRange {
        minVariantPrice {
          amount
        }
        maxVariantPrice {
          amount
        }
      }
      images(first: 10) {
        edges {
          node {
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
      products(first: 4) {
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
