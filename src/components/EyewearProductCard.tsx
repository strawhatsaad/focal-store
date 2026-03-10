"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";

interface ColorSwatch {
  name: string;
  hex: string;
}

interface ProductVariant {
  id: string;
  title: string;
  price: string;
  imageSrc: string;
}

export interface EyewearProductProps {
  id: string;
  name: string;
  handle: string;
  tags: string[];
  variants: ProductVariant[];
  colorSwatches: ColorSwatch[];
}

const EyewearProductCard: React.FC<{ product: EyewearProductProps }> = ({
  product,
}) => {
  const [selectedVariant, setSelectedVariant] = useState(
    product.variants[0] || null,
  );

  const [isHovered, setIsHovered] = useState(false);

  if (!selectedVariant) return null;

  return (
    <div
      className="group flex flex-col w-full bg-white relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative w-full aspect-[4/3] bg-gray-100 mb-4 overflow-hidden rounded-md cursor-pointer">
        <Link
          href={`/products/eyewear/${product.handle}?color=${encodeURIComponent(selectedVariant.title)}`}
        >
          <Image
            src={selectedVariant.imageSrc}
            alt={product.name}
            fill
            className="object-cover object-center transition-opacity duration-300"
            sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
          />
        </Link>
        <button className="absolute top-3 right-3 p-2 rounded-full bg-transparent hover:bg-gray-100 transition-colors z-10 text-gray-500 hover:text-red-500">
          <Heart size={20} />
        </button>
      </div>

      <div className="flex flex-col flex-grow px-1">
        <div className="flex justify-between items-start mb-1">
          <h3 className="text-lg font-medium text-gray-900">
            <Link
              href={`/products/eyewear/${product.handle}?color=${encodeURIComponent(selectedVariant.title)}`}
            >
              {product.name}
            </Link>
          </h3>
          <span className="text-base font-medium text-gray-900 ml-2">
            ${selectedVariant.price}
          </span>
        </div>

        {/* Color Name */}
        <p className="text-sm text-gray-500 mb-3 opacity-0 group-hover:opacity-100 transition-opacity h-5">
          {selectedVariant.title}
        </p>

        {/* Swatches */}
        <div className="flex flex-wrap gap-2 mb-4">
          {product.variants.map((variant) => {
            const swatch = product.colorSwatches.find(
              (s) => s.name.toLowerCase() === variant.title.toLowerCase(),
            );
            // Support comma-separated hex for gradients like tortoise shell mapping.
            const hasMultipleColors = swatch?.hex.includes(",");
            const bgStyle = swatch
              ? hasMultipleColors
                ? { background: `linear-gradient(135deg, ${swatch.hex})` }
                : { backgroundColor: swatch.hex }
              : { backgroundColor: "#ccc" }; // fallback

            return (
              <button
                key={variant.id}
                onClick={(e) => {
                  e.preventDefault();
                  setSelectedVariant(variant);
                }}
                className={`w-5 h-5 rounded-full ring-2 ring-offset-1 transition-all ${
                  selectedVariant.id === variant.id
                    ? "ring-black scale-110"
                    : "ring-transparent opacity-70 hover:opacity-100"
                }`}
                style={bgStyle}
                title={variant.title}
                aria-label={`Select color ${variant.title}`}
              />
            );
          })}
        </div>

        <Link
          href={`/products/eyewear/${product.handle}?color=${encodeURIComponent(selectedVariant.title)}`}
          className="w-full py-3 px-4 border border-black rounded-lg text-sm font-medium text-center transition-all bg-transparent text-black hover:bg-black hover:text-white"
        >
          Select lenses and buy
        </Link>
      </div>
    </div>
  );
};

export default EyewearProductCard;
