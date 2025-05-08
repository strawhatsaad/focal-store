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

  console.log(slug);

  const variables = {
    handle: slug, // Replace with dynamic value as needed
  };

  let result = await storeFront(singleProductQuery, variables);

  const data = result.data.productByHandle;
  const product = {
    id: data.handle,
    name: data.title,
    href: `/products/${data.handle}`,
    price: `$${data.priceRange.minVariantPrice.amount}`,
    imageSrc: data.images.edges[0]?.node.transformedSrc || "",
    imageAlt: data.images.edges[0]?.node.altText || "",
    description: data.description,
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
  };

  result = await storeFront(allProductsQuery);

  const relatedProducts = result.data.products.edges.map(({ node }: any) => ({
    id: node.handle,
    name: node.title,
    href: `/products/${node.handle}`,
    price: `$${node.priceRange.minVariantPrice.amount}`,
    imageSrc: node.images.edges[0]?.node.transformedSrc || "",
    imageAlt: node.images.edges[0]?.node.altText || "",
  }));

  return (
    <main>
      <Hero product={product} />
      <div className="lg:hidden container">
        <ProductFeatures product={product} />
      </div>
      <hr className="my-12 md:mb-8 md:mt-0 border-gray-800 container" />
      <FAQSection product={product} />
      <RelatedProducts products={relatedProducts} />
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
      priceRange {
        minVariantPrice {
          amount
        }
        maxVariantPrice {
          amount
        }
      }
      images(first: 1) {
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
  query Products {
    products(first: 4) {
      edges {
        node {
          title
          handle
          tags
          priceRange {
            minVariantPrice {
              amount
            }
            maxVariantPrice {
              amount
            }
          }
          images(first: 1) {
            edges {
              node {
                transformedSrc
                altText
              }
            }
          }
          description
        }
      }
    }
  }
`;
