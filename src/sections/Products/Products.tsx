// File: src/sections/Products/Products.tsx
import Link from "next/link";
import Image from "next/image"; // Using Next/Image for potential optimization
import { useEffect } from "react";

// Helper component to display price with optional discount
const PriceDisplay = ({ originalPrice, isFirstTimeCustomer }: { originalPrice: string; isFirstTimeCustomer: boolean | undefined }) => {
    const priceNum = parseFloat(originalPrice.replace('$', ''));

    // If price is invalid or status is not yet determined, show the original price.
    if (isNaN(priceNum) || isFirstTimeCustomer === undefined) {
        return <p className="mt-1 text-sm sm:text-base font-semibold text-gray-900">{originalPrice}</p>;
    }
  
    // If it is a first-time customer, show the discounted price and the original price.
    if (isFirstTimeCustomer) {
      const discountedPrice = priceNum * 0.80;
      return (
        <div className="mt-1 flex items-baseline gap-1.5">
          <p className="text-sm sm:text-base font-bold text-black">${discountedPrice.toFixed(2)}</p>
          <p className="text-xs sm:text-sm font-medium text-red-600 line-through">${priceNum.toFixed(2)}</p>
        </div>
      );
    }
  
    // Otherwise, show the regular price.
    return <p className="mt-1 text-sm sm:text-base font-semibold text-gray-900">${priceNum.toFixed(2)}</p>;
};


const ProductsSection = ({
  products,
  heading,
  isFirstTimeCustomer, // Accept the new prop
}: {
  products: any[];
  heading: string;
  isFirstTimeCustomer: boolean | undefined;
}) => {
  // Add console log for debugging
  useEffect(() => {
    console.log("[ProductsSection] Received isFirstTimeCustomer:", isFirstTimeCustomer);
  }, [isFirstTimeCustomer]);

  const productData = products;
  return (
    <div className="bg-white" id="products">
      <div className="w-full px-0 py-8 sm:py-12">
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 sm:gap-x-6 gap-y-8 sm:gap-y-10">
          {productData.map((product: any) => (
            <Link
              key={product.id || product.name}
              href={product.href}
              className="group block"
            >
              <div className="w-full aspect-[4/3] bg-gray-50 border border-gray-200 rounded-lg overflow-hidden group-hover:shadow-lg transition-shadow duration-300">
                {product.imageSrc ? (
                  <Image
                    alt={product.imageAlt || product.name || "Product Image"}
                    src={product.imageSrc}
                    width={300}
                    height={225}
                    layout="responsive"
                    className="object-contain w-full h-full group-hover:opacity-90 transition-opacity duration-300"
                    onError={(e) =>
                      (e.currentTarget.src =
                        "https://placehold.co/300x225/F7F4EE/333333?text=No+Image")
                    }
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <span className="text-xs text-gray-400">No Image</span>
                  </div>
                )}
              </div>
              <h3 className="mt-3 text-xs sm:text-sm font-medium text-gray-800 group-hover:text-black truncate">
                {product.name}
              </h3>
              <PriceDisplay originalPrice={product.price} isFirstTimeCustomer={isFirstTimeCustomer} />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};
export default ProductsSection;
