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
  query Products {
    products(first: 9) {
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
