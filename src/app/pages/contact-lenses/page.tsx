import Hero from "@/sections/Products/Hero";
import ProductsSection from "@/sections/Products/Products";
import React from "react";
import { storeFront } from "../../../../utils/index";

const ContactLensesPage = async () => {
  const variables = {
    handle: "Contacts", // Replace with dynamic value as needed
  };

  let result = await storeFront(productQuery, variables);

  const data = result.data.collectionByHandle.products.edges;

  const products = data.map(({ node }: any) => ({
    id: node.id,
    name: node.title,
    href: `/products/${node.handle}`, // Assuming general product slug structure
    price: `$${parseFloat(node.priceRange.minVariantPrice.amount).toFixed(2)}`, // Format price
    imageSrc: node.featuredImage.url,
    imageAlt: node.featuredImage.altText,
  }));

  return (
    <main>
      <Hero
        title="Contact Lenses"
        headline="Explore our premium selection of prescription and colored contact lenses designed for comfort, clarity, and style."
      />
      <ProductsSection products={products} heading="Featured Contact Lenses" />
    </main>
  );
};

export default ContactLensesPage;

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
