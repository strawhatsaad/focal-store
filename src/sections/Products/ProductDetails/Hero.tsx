// File: src/sections/Products/ProductDetails/Hero.tsx
"use client";

import React, { useRef, useState, useEffect } from "react";
import { twMerge } from "tailwind-merge";
import ProductFeatures from "@/sections/Products/ProductDetails/ProductFeatures";
import EyeglassesModal from "../EyeglassesModal";
import { useCart } from "@/context/CartContext";
import {
  ShoppingCart,
  Loader2,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import Image from "next/image";

const Hero = ({ product }: any) => {
  useEffect(() => {
    console.log(
      "[Hero Init] Product data received:",
      JSON.stringify(product, null, 2)
    );
    if (product?.variants && product.variants.length > 0) {
      product.variants.forEach((v: any, index: number) => {
        // Log the properties you expect to use, like 'name', 'title', and 'image' or 'imageSrc'
        console.log(
          `[Hero Init] Variant ${index}: Name='${v.name}', Title='${v.title}', Image Object:`,
          JSON.stringify(v.image, null, 2),
          "Direct imageSrc:",
          v.imageSrc
        );
      });
    }
  }, [product]);

  const {
    addLineItem,
    loading: cartLoading,
    error: cartContextError,
    clearCartError,
  } = useCart();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [addToCartSuccess, setAddToCartSuccess] = useState(false);
  const [addToCartError, setAddToCartError] = useState<string | null>(null);

  const [selectedVariant, setSelectedVariant] = useState<any>(
    () => product?.variants?.[0] || null
  );

  const [selectedImage, setSelectedImage] = useState<string>(() => {
    const initialVar = product?.variants?.[0];
    // Prioritize variant.image.src, then variant.imageSrc, then product's first image
    return (
      initialVar?.image?.src ||
      initialVar?.imageSrc ||
      product?.images?.[0]?.src ||
      ""
    );
  });

  const [hasUserManuallySelectedImage, setHasUserManuallySelectedImage] =
    useState(false);
  const [isEyeglassesModalOpen, setIsEyeglassesModalOpen] = useState(false);

  const thumbContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (product?.variants?.length > 0) {
      const initialVariant = product.variants[0];
      if (!selectedVariant || selectedVariant.product?.id !== product.id) {
        setSelectedVariant(initialVariant);
        const initialImageSrc =
          initialVariant?.image?.src ||
          initialVariant?.imageSrc ||
          product.images?.[0]?.src ||
          "";
        setSelectedImage(initialImageSrc);
        setHasUserManuallySelectedImage(false);
      }
    }
  }, [product]);

  const handleThumbnailClick = (src: string) => {
    setSelectedImage(src);
    setHasUserManuallySelectedImage(true);
  };

  const handleFrameVariantClick = (variant: any) => {
    console.log(
      "[Hero Click] Frame variant clicked. Variant data:",
      JSON.stringify(variant, null, 2)
    );
    setSelectedVariant(variant);
    // Correctly access variant's image: try variant.image.src, then variant.imageSrc
    const newImageSrc =
      variant?.image?.src ||
      variant?.imageSrc ||
      product?.images?.[0]?.src ||
      "";
    console.log(
      `[Hero Click] Setting selectedImage directly to new variant's image: ${newImageSrc}`
    );
    setSelectedImage(newImageSrc);
    setHasUserManuallySelectedImage(false);
  };

  const scrollThumbnails = (direction: "left" | "right") => {
    if (!thumbContainerRef.current) return;
    const scrollAmount = thumbContainerRef.current.clientWidth / 2;
    thumbContainerRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  const [rightEyeEnabled, setRightEyeEnabled] = useState(true);
  const [leftEyeEnabled, setLeftEyeEnabled] = useState(true);
  const [rightEyeQty, setRightEyeQty] = useState(1);
  const [leftEyeQty, setLeftEyeQty] = useState(1);

  const getDisplayedImage = () => {
    let displaySrc = "";
    if (hasUserManuallySelectedImage && selectedImage) {
      displaySrc = selectedImage;
    } else if (selectedVariant) {
      displaySrc = selectedVariant.image?.src || selectedVariant.imageSrc || "";
    }

    return (
      displaySrc ||
      product?.images?.[0]?.src ||
      "https://placehold.co/400x400/F7F4EE/333333?text=No+Image"
    );
  };

  const handlePrimaryAction = async () => {
    setAddToCartSuccess(false);
    setAddToCartError(null);
    if (cartContextError) clearCartError();

    const isEyewearProduct =
      product.collection === "Eyewear" ||
      product.productType === "EYEGLASSES" ||
      product.product_type?.toLowerCase() === "eyeglasses";

    if (isEyewearProduct) {
      if (!selectedVariant) {
        setAddToCartError("Please select a frame style.");
        setTimeout(() => setAddToCartError(null), 3000);
        return;
      }
      setIsEyeglassesModalOpen(true);
      return;
    }

    if (!selectedVariant?.id) {
      setAddToCartError("Please select a product variant.");
      setTimeout(() => setAddToCartError(null), 3000);
      return;
    }

    if (
      (!rightEyeEnabled || rightEyeQty <= 0) &&
      (!leftEyeEnabled || leftEyeQty <= 0)
    ) {
      setAddToCartError("Please select a quantity for at least one eye.");
      setTimeout(() => setAddToCartError(null), 3000);
      return;
    }

    setIsAddingToCart(true);
    let itemsAddedCount = 0;
    let operationSucceeded = true;

    try {
      if (rightEyeEnabled && rightEyeQty > 0) {
        const added = await addLineItem(selectedVariant.id, rightEyeQty, [
          { key: "Eye", value: "Right (OD)" },
        ]);
        if (added) itemsAddedCount++;
        else operationSucceeded = false;
      }

      if (operationSucceeded && leftEyeEnabled && leftEyeQty > 0) {
        const added = await addLineItem(selectedVariant.id, leftEyeQty, [
          { key: "Eye", value: "Left (OS)" },
        ]);
        if (added) itemsAddedCount++;
        else operationSucceeded = false;
      }
    } catch (err: any) {
      operationSucceeded = false;
      setAddToCartError(err.message || "An unexpected error occurred.");
      console.error("Add to cart error caught in component:", err);
    }

    setIsAddingToCart(false);
    if (operationSucceeded && itemsAddedCount > 0) {
      setAddToCartSuccess(true);
      setTimeout(() => setAddToCartSuccess(false), 3000);
    } else if (!operationSucceeded) {
      setAddToCartError(
        cartContextError || "Failed to add items to cart. Please try again."
      );
      setTimeout(() => setAddToCartError(null), 4000);
    }
  };

  const isScrollLeftDisabled =
    !thumbContainerRef.current || thumbContainerRef.current.scrollLeft === 0;
  const isScrollRightDisabled =
    !thumbContainerRef.current ||
    thumbContainerRef.current.scrollLeft +
      thumbContainerRef.current.offsetWidth >=
      thumbContainerRef.current.scrollWidth - 5;

  const showFrameVariants =
    (product.collection === "Eyewear" ||
      product.productType === "EYEGLASSES" ||
      product.product_type?.toLowerCase() === "eyeglasses") &&
    product.variants?.length > 1;

  const displayedVariantName = selectedVariant?.name || "N/A";

  return (
    <section className="py-8 bg-white md:py-16 antialiased">
      <div className="max-w-screen-xl px-4 mx-auto 2xl:px-0 container">
        <div className="lg:grid lg:grid-cols-2 lg:gap-8 xl:gap-16">
          {/* Image Section */}
          <div className="shrink-0 max-w-md lg:max-w-lg mx-auto">
            <div className="w-full h-[300px] md:h-[400px] flex justify-center items-center bg-transparent overflow-hidden border border-gray-200 rounded-lg p-2">
              <img
                src={getDisplayedImage()}
                alt={selectedVariant?.name || product.name || "Product Image"}
                width={400}
                height={400}
                className="object-contain max-w-full max-h-full"
                key={selectedImage}
                onError={(e) => {
                  (e.target as HTMLImageElement).onerror = null;
                  (e.target as HTMLImageElement).src =
                    "https://placehold.co/400x400/e2e8f0/4a5568?text=Image+Error";
                }}
              />
            </div>

            {product.images && product.images.length > 1 && (
              <div className="relative mt-4">
                <button
                  onClick={() => scrollThumbnails("left")}
                  className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white/80 hover:bg-white shadow p-2 rounded-full disabled:opacity-50"
                  disabled={isScrollLeftDisabled}
                >
                  {" "}
                  ←{" "}
                </button>
                <div
                  ref={thumbContainerRef}
                  className="flex overflow-x-auto gap-2 px-10 scrollbar-hide py-1"
                >
                  {product.images.map((img: any, index: number) => (
                    <div
                      key={img.id || `thumb-${index}`}
                      className="flex-shrink-0 w-20 h-20 md:w-24 md:h-24 cursor-pointer"
                      onClick={() => handleThumbnailClick(img.src)}
                    >
                      <img
                        src={
                          img.src ||
                          "https://placehold.co/96x96/e2e8f0/4a5568?text=N/A"
                        }
                        alt={img.altText || `Thumbnail ${index + 1}`}
                        width={96}
                        height={96}
                        className={`w-full h-full object-contain rounded border transition-all duration-200 ${
                          selectedImage === img.src &&
                          hasUserManuallySelectedImage
                            ? "border-black ring-2 ring-black"
                            : "border-gray-300 hover:border-gray-500"
                        }`}
                        onError={(e) => {
                          (e.target as HTMLImageElement).onerror = null;
                          (e.target as HTMLImageElement).src =
                            "https://placehold.co/96x96/e2e8f0/4a5568?text=Error";
                        }}
                      />
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => scrollThumbnails("right")}
                  className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white/80 hover:bg-white shadow p-2 rounded-full disabled:opacity-50"
                  disabled={isScrollRightDisabled}
                >
                  {" "}
                  →{" "}
                </button>
              </div>
            )}
            <div className="hidden lg:block mt-8">
              <ProductFeatures
                product={product}
                selectedVariant={selectedVariant?.name}
              />
            </div>
          </div>

          {/* Details Section */}
          <div className="relative">
            <div
              className={twMerge(
                "lg:sticky lg:top-28",
                showFrameVariants ? "lg:top-32" : ""
              )}
            >
              <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800 mt-6 sm:mt-8 lg:mt-0">
                {product.name}
              </h1>
              <p className="mt-2 text-2xl sm:text-3xl font-extrabold text-black">
                {selectedVariant?.priceV2?.amount
                  ? `$${parseFloat(selectedVariant.priceV2.amount).toFixed(2)}`
                  : product.price || "$0.00"}
              </p>

              {showFrameVariants && (
                <div className="mt-6 mb-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">
                    Style:{" "}
                    <span className="font-semibold">
                      {displayedVariantName}
                    </span>
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 md:gap-3">
                    {product.variants.map((variant: any, index: number) => {
                      const variantIdLastPart = variant.id
                        ? variant.id.substring(variant.id.lastIndexOf("/") + 1)
                        : index;
                      // Use variant.name for button text, as per your data structure
                      const buttonText =
                        variant.name || `Variant ${variantIdLastPart}`;
                      return (
                        <button
                          key={variant.id || `variant-${index}`}
                          onClick={() => handleFrameVariantClick(variant)}
                          title={variant.name || "Variant"}
                          className={twMerge(
                            "w-full py-2.5 px-3 text-xs sm:text-sm font-medium border rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 text-center truncate",
                            selectedVariant?.id === variant.id
                              ? "bg-black text-white border-black ring-black"
                              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400 ring-transparent"
                          )}
                        >
                          {buttonText}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {!showFrameVariants &&
                product.variants &&
                product.variants.length > 1 && (
                  <div className="mt-5">
                    <h3 className="text-sm font-medium text-gray-900 mb-2">
                      {selectedVariant?.optionNames?.[0] || "Select Option"}:{" "}
                      <span className="font-semibold">
                        {selectedVariant?.name || "N/A"}
                      </span>
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {product.variants.map((variant: any, index: number) => (
                        <button
                          key={variant.id || `cl-variant-${index}`}
                          onClick={() => handleFrameVariantClick(variant)}
                          className={twMerge(
                            "py-2.5 px-5 text-sm font-medium border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1",
                            selectedVariant?.id === variant.id
                              ? "bg-black text-white border-black ring-black"
                              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400 ring-transparent"
                          )}
                        >
                          {variant.name || `Variant ${index + 1}`}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

              {!showFrameVariants && (
                <div className="mt-6 space-y-3">
                  {/* ... quantity selection UI for contact lenses ... */}
                </div>
              )}

              <div className="mt-8">
                <button
                  onClick={handlePrimaryAction}
                  disabled={isAddingToCart || cartLoading || !selectedVariant}
                  className="w-full flex items-center justify-center gap-2 px-5 py-3.5 text-sm font-semibold text-white bg-black rounded-lg shadow-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-150 ease-in-out"
                >
                  {isAddingToCart || cartLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <ShoppingCart className="w-5 h-5" />
                  )}
                  {product.collection === "Eyewear" ||
                  product.productType === "EYEGLASSES" ||
                  product.product_type?.toLowerCase() === "eyeglasses"
                    ? "Select Lenses & Buy"
                    : "Add to Cart"}
                </button>
              </div>
              {addToCartSuccess && (
                <p className="mt-3 text-sm text-green-600 font-medium flex items-center">
                  <CheckCircle size={16} className="mr-1" /> Item(s) added to
                  cart!
                </p>
              )}
              {addToCartError && (
                <p className="mt-3 text-sm text-red-600 font-medium flex items-center">
                  <AlertTriangle size={16} className="mr-1" /> {addToCartError}
                </p>
              )}
              {cartContextError && !addToCartError && (
                <p className="mt-3 text-sm text-red-600 font-medium flex items-center">
                  <AlertTriangle size={16} className="mr-1" /> Cart Error:{" "}
                  {cartContextError}
                </p>
              )}
            </div>
          </div>
        </div>
        {isEyeglassesModalOpen &&
          (product.collection === "Eyewear" ||
            product.productType === "EYEGLASSES" ||
            product.product_type?.toLowerCase() === "eyeglasses") &&
          selectedVariant && (
            <EyeglassesModal
              product={product}
              selectedVariant={selectedVariant}
              isOpen={isEyeglassesModalOpen}
              onClose={() => setIsEyeglassesModalOpen(false)}
            />
          )}
        <div className="lg:hidden mt-8">
          <ProductFeatures
            product={product}
            selectedVariant={selectedVariant?.name}
          />
        </div>
      </div>
    </section>
  );
};

export default Hero;
