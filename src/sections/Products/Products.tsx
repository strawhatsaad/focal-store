import precision1Image from "@/assets/precision1.png";
import acuvueOasysImage from "@/assets/acuvueOasys.png";
import dailiesTotalImage from "@/assets/dailiesTotal.webp";
import acuvueMax from "@/assets/acuvueMax.webp";
import { storeFront } from "../../../utils/index";
import Link from "next/link";

const ProductsSection = ({ products }: any) => {
  const productData = products;
  return (
    <div className="bg-white" id="products">
      <div className="mx-auto max-w-2xl px-4 py-16 sm:pt-0 sm:px-6 sm:pb-20 lg:max-w-7xl lg:px-8">
        <h2 className="text-4xl tracking-tighter font-bold mb-12">
          Featured Lenses
        </h2>

        <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
          {productData.map((product: any) => (
            <Link key={product.id} href={product.href} className="group">
              <div className="w-full py-0 px-4 md:px-6 md:py-6 lg:px-2 lg:py-12 border border-gray-300 bg-transparent rounded-lg group-hover:scale-105 transition-transform duration-300">
                <img
                  alt={product.imageAlt}
                  src={product.imageSrc}
                  className="w-full h-48 md:h-64 object-contain"
                />
              </div>
              <h3 className="mt-4 text-sm text-gray-700">{product.name}</h3>
              <p className="mt-1 text-lg font-medium text-gray-900">
                {product.price}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};
export default ProductsSection;

// export async function getStaticProps() {
//   const { data } = await storeFront(productQuery);
//   return {
//     props: {
//       products: data.products,
//     },
//   };
// }

// const gql = String.raw;

// const productQuery = gql`
//   query Products {
//     products(first: 4) {
//       edges {
//         node {
//           title
//           handle
//           tags
//           priceRange {
//             minVariantPrice {
//               amount
//             }
//             maxVariantPrice {
//               amount
//             }
//           }
//           images(first: 1) {
//             edges {
//               node {
//                 transformedSrc
//                 altText
//               }
//             }
//           }
//         }
//       }
//     }
//   }
// `;
