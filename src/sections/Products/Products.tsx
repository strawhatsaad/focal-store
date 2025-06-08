// File: src/sections/Products/Products.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useWishlist } from "@/context/WishlistContext";
import { Heart, Loader2 } from "lucide-react";
import { MappedProduct } from "@/types/product";

// Helper component to display price with optional discount
const PriceDisplay = ({ originalPrice, isFirstTimeCustomer }: { originalPrice: string; isFirstTimeCustomer: boolean | undefined }) => {
    const priceNum = parseFloat(originalPrice.replace('$', ''));

    if (isNaN(priceNum) || isFirstTimeCustomer === undefined) {
        return <p className="mt-0.5 text-sm sm:text-base font-semibold text-gray-900">{originalPrice}</p>;
    }
  
    if (isFirstTimeCustomer) {
      const discountedPrice = priceNum * 0.80;
      return (
        <div className="mt-0.5 flex items-baseline gap-1.5">
          <p className="text-sm sm:text-base font-bold text-black">${discountedPrice.toFixed(2)}</p>
          <p className="text-xs sm:text-sm font-medium text-red-600 line-through">${priceNum.toFixed(2)}</p>
        </div>
      );
    }
  
    return <p className="mt-0.5 text-sm sm:text-base font-semibold text-gray-900">${priceNum.toFixed(2)}</p>;
};

const ProductsSection = ({
  products,
  heading,
  isFirstTimeCustomer,
}: {
  products: MappedProduct[];
  heading: string;
  isFirstTimeCustomer: boolean | undefined;
}) => {
  const { addToWishlist, removeFromWishlist, isProductInWishlist, loading: wishlistLoading } = useWishlist();
  const [togglingId, setTogglingId] = useState<string | null>(null);
  
  const handleWishlistToggle = async (e: React.MouseEvent, product: MappedProduct) => {
    e.preventDefault(); // Prevent link navigation
    e.stopPropagation(); // Stop event bubbling
    setTogglingId(product.id);
    if (isProductInWishlist(product.id)) {
        await removeFromWishlist(product.id);
    } else {
        await addToWishlist(product);
    }
    setTogglingId(null);
  }

  return (
    <div className="bg-white" id="products">
      <div className="w-full px-0 py-2 sm:py-4">
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-x-3 sm:gap-x-10 md:gap-x-20 gap-y-4 sm:gap-y-6">
          {products.map((product) => (
            <div key={product.id} className="group relative">
                <Link href={product.href} className="block">
                    <div className="w-full aspect-[4/3] bg-gray-50 border border-gray-200 rounded-lg overflow-hidden group-hover:shadow-lg transition-shadow duration-300">
                        {product.imageSrc ? (
                        <Image
                            alt={product.imageAlt || product.name}
                            src={product.imageSrc}
                            width={300}
                            height={225}
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
                </Link>
                <div className="mt-1.5 flex justify-between items-start">
                    <div className="flex-1">
                         <h3 className="text-xs sm:text-sm font-medium text-gray-800 group-hover:text-black pr-1">
                           <Link href={product.href}>{product.name}</Link>
                         </h3>
                        <PriceDisplay originalPrice={product.price} isFirstTimeCustomer={isFirstTimeCustomer} />
                    </div>
                    <button 
                        onClick={(e) => handleWishlistToggle(e, product)} 
                        disabled={wishlistLoading || togglingId === product.id}
                        className="p-1.5 text-gray-400 hover:text-red-500 disabled:opacity-50 transition-colors"
                        aria-label="Add to wishlist"
                    >
                       {togglingId === product.id ? (
                           <Loader2 className="h-5 w-5 animate-spin" />
                       ) : (
                         <Heart className={`h-5 w-5 ${isProductInWishlist(product.id) ? 'fill-current text-red-500' : ''}`} />
                       )}
                    </button>
                </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
export default ProductsSection;
