// src/app/wishlist/page.tsx
"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useWishlist } from "@/context/WishlistContext";
import { Loader2, Heart, Trash2 } from "lucide-react";
import { MappedProduct } from "@/types/product";

const WishlistPage = () => {
  const {
    wishlist,
    removeFromWishlist,
    loading: wishlistLoading,
  } = useWishlist();

  if (wishlistLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-black" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12 sm:py-16">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <header className="mb-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900">
            My Wishlist
          </h1>
          <p className="mt-3 text-lg text-gray-600">
            Your saved favorites. Click on an item to view its details.
          </p>
        </header>

        {wishlist.length === 0 ? (
          <div className="text-center py-16 px-6 bg-white rounded-lg shadow-md">
            <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              Your Wishlist is Empty
            </h2>
            <p className="text-gray-500 mb-6">
              Looks like you haven&apos;t added any items yet.
            </p>
            <Link
              href="/pages/contact-lenses"
              className="px-6 py-2.5 bg-black text-white font-medium text-sm rounded-lg shadow-sm hover:bg-gray-800 transition-colors"
            >
              Discover Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
            {wishlist.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-lg shadow-md overflow-hidden group flex flex-col w-full text-left"
              >
                <Link href={product.href} className="block">
                  <div className="aspect-square w-full h-[300px] bg-gray-100">
                    <Image
                      alt={product.imageAlt || product.name}
                      src={product.imageSrc}
                      width={300}
                      height={300}
                      className="w-full h-full object-contain object-center group-hover:opacity-80 transition-opacity"
                    />
                  </div>
                </Link>
                <div className="p-4 flex flex-col flex-grow">
                  <h3 className="text-sm font-medium text-gray-800 flex-grow">
                    <Link href={product.href} className="hover:underline">
                      {product.name}
                    </Link>
                  </h3>
                  <p className="mt-1 text-base font-bold text-gray-900">
                    {product.price}
                  </p>
                  <div className="mt-4 flex flex-col">
                    <button
                      onClick={() => removeFromWishlist(product.id)}
                      className="w-full flex items-center justify-center gap-2 text-sm text-red-600 bg-red-50 px-4 py-2 rounded-md hover:bg-red-100 transition-colors"
                    >
                      <Trash2 size={16} /> Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default WishlistPage;
