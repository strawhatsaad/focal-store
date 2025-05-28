import { Blogs } from "@/sections/HomePage/Blogs";
import { ContactLenses } from "@/sections/HomePage/ContactLenses";
import { CureBlindnessDetails } from "@/sections/HomePage/CureBlindnessDetails";
import { CureBlindnessFeatures } from "@/sections/HomePage/CureBlindnessFeatures";
import { CureBlindnessVideo } from "@/sections/HomePage/CureBlindnessVideo";
import { FAQ } from "@/sections/HomePage/FAQ";
import { Footer } from "@/sections/HomePage/Footer";
import { Header } from "@/sections/HomePage/Header";
import { Headline } from "@/sections/HomePage/Headline";
import { Hero } from "@/sections/HomePage/Hero";
import { LensType } from "@/sections/HomePage/LensType";
import { Testimonials } from "@/sections/HomePage/Testimonials";
import { storeFront } from "../../utils";

export default async function Home() {
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
    <main className="overflow-hidden">
      <Hero />
      <Headline />
      <ContactLenses products={products} />
      <CureBlindnessFeatures />
      <CureBlindnessDetails />
      <CureBlindnessVideo />
      <Blogs />
      <LensType />
      <Testimonials />
      <FAQ />
    </main>
  );
}

const gql = String.raw;

const productQuery = gql`
  query GetCollectionProducts($handle: String!) {
    collectionByHandle(handle: $handle) {
      title
      description
      products(first: 12) {
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
