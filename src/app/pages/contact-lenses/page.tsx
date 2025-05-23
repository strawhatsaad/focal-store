import Hero from "@/sections/Products/Hero";
import ProductsSection from "@/sections/Products/Products";
import React from "react";
import { storeFront } from "../../../../utils/index";

const ContactLensesPage = async () => {
  const result = await storeFront(productQuery);

  const products = result.data.products.edges.map(({ node }: any) => ({
    id: node.handle,
    name: node.title,
    href: `/products/${node.handle}`,
    price: `$${node.priceRange.minVariantPrice.amount}`,
    imageSrc: node.images.edges[0]?.node.transformedSrc || "",
    imageAlt: node.images.edges[0]?.node.altText || "",
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
  query Products {
    products(first: 20) {
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
