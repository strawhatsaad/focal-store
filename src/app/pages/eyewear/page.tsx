import { Footer } from "@/sections/HomePage/Footer";
import { Header } from "@/sections/HomePage/Header";
import React from "react";
import { storeFront } from "../../../../utils";
import Hero from "@/sections/Products/Hero";
import ProductsSection from "@/sections/Products/Products";

const EyewearPage = async () => {
  const variables = {
    handle: "Eyewear", // Replace with dynamic value as needed
  };

  let result = await storeFront(productQuery, variables);

  const data = result.data.collectionByHandle.products.edges;

  const products = data.map(({ node }: any) => ({
    id: node.id,
    name: node.title,
    href: `/products/${node.handle}`,
    price: `$${node.priceRange.minVariantPrice.amount}`,
    imageSrc: node.featuredImage.url,
    imageAlt: node.featuredImage.altText,
  }));

  console.log(products);

  return (
    <main>
      <Hero
        title="Eyewear"
        headline="Discover our premium Eyewear Collection—a curated selection of stylish, comfortable, and vision-enhancing glasses designed to suit every face and lifestyle."
      />
      <ProductsSection products={products} heading="Featured Eyeglasses" />
    </main>
  );
};

export default EyewearPage;

const gql = String.raw;

const productQuery = gql`
  query GetCollectionProducts($handle: String!) {
    collectionByHandle(handle: $handle) {
      title
      description
      products(first: 50) {
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
