"use client";

import { useCart } from "@/context/CartContext";
import { twMerge } from "tailwind-merge";
import Link from "next/link";
import Image from "next/image";

// Helper component for price display
const PriceDisplay = ({ originalPrice, isFirstTimeCustomer }: { originalPrice: string; isFirstTimeCustomer: boolean | undefined }) => {
    const priceNum = parseFloat(originalPrice.replace('$', ''));

    if (isNaN(priceNum) || isFirstTimeCustomer === undefined) {
        return <p className="text-sm font-bold text-gray-900">{originalPrice}</p>;
    }
  
    if (isFirstTimeCustomer) {
      const discountedPrice = priceNum * 0.80;
      return (
        <div className="flex flex-col items-end">
          <p className="text-sm font-bold text-black">${discountedPrice.toFixed(2)}</p>
          <p className="text-xs font-medium text-red-600 line-through">${priceNum.toFixed(2)}</p>
        </div>
      );
    }
  
    return <p className="text-sm font-bold text-gray-900">${priceNum.toFixed(2)}</p>;
};

function RelatedProductsComponent({ products, headingText, isFirstTimeCustomer }: any) {
  return (
    <div className="bg-white">
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-0">
        <h2
          className={twMerge(
            "text-2xl font-bold tracking-tight text-gray-900",
            !headingText ? "hidden" : ""
          )}
        >
          Customers also purchased
        </h2>

        <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
          {products.map((product: any) => (
            <div key={product.id} className="group relative">
                <Link href={product.href}>
                    <div className="w-full py-0 px-4 md:px-6 md:py-6 lg:px-2 lg:py-6 border border-gray-300 bg-transparent rounded-lg group-hover:scale-105 transition-transform duration-300">
                        <Image
                        alt={product.imageAlt}
                        src={product.imageSrc}
                        width={300}
                        height={300}
                        className="w-full h-48 md:h-64 object-contain"
                        />
                    </div>
                    <div className="mt-4 flex justify-between">
                        <div>
                        <h3 className="text-sm text-gray-700">
                            <span aria-hidden="true" className="absolute inset-0" />
                            {product.name}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">{product.color}</p>
                        </div>
                        <PriceDisplay originalPrice={product.price} isFirstTimeCustomer={isFirstTimeCustomer} />
                    </div>
                </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Wrapper component to use the hook
export default function RelatedProducts({ products, headingText }: any) {
    const { isFirstTimeCustomer } = useCart();
    return (
        <RelatedProductsComponent 
            products={products}
            headingText={headingText}
            isFirstTimeCustomer={isFirstTimeCustomer}
        />
    )
}
