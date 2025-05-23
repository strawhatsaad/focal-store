"use client";

import React, { useRef, useState, useEffect } from "react";
import { twMerge } from "tailwind-merge";
import ProductFeatures from "@/sections/Products/ProductDetails/ProductFeatures";
import EyeglassesModal from "../EyeglassesModal";

const Hero = ({ product }: any) => {
  const [selectedVariant, setSelectedVariant] = useState<any>(
    product.variants[0]
  );
  const [selectedImage, setSelectedImage] = useState(
    product.variants[0]?.images?.[0]?.src || product.images?.[0]?.src
  );

  const [hasUserSelectedImage, setHasUserSelectedImage] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);

  const handleThumbnailClick = (src: string) => {
    setSelectedImage(src);
    setHasUserSelectedImage(true);
  };

  const thumbContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hasUserSelectedImage) {
      if (selectedVariant?.images?.[0]?.src) {
        setSelectedImage(selectedVariant.images[0].src);
      } else if (selectedVariant?.imageSrc) {
        setSelectedImage(selectedVariant.imageSrc);
      } else {
        setSelectedImage(product.images?.[0]?.src);
      }
    }
  }, [selectedVariant, hasUserSelectedImage]);

  const scrollThumbnails = (direction: "left" | "right") => {
    if (!thumbContainerRef.current) return;
    const scrollAmount = thumbContainerRef.current.clientWidth / 2;
    thumbContainerRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  const handleVariantClick = (variant: any) => {
    setSelectedVariant(variant);
    setHasUserSelectedImage(false); // reset when variant changes
  };

  const [rightEyeEnabled, setRightEyeEnabled] = useState(true);
  const [leftEyeEnabled, setLeftEyeEnabled] = useState(true);
  const [rightEyeQty, setRightEyeQty] = useState(1);
  const [leftEyeQty, setLeftEyeQty] = useState(1);

  const getDisplayedImage = () => {
    return (
      selectedImage ||
      selectedVariant?.imageSrc ||
      selectedVariant?.images?.[0]?.src
    );
  };

  return (
    <section className="py-8 bg-white md:py-16 antialiased">
      <div className="max-w-screen-xl px-4 mx-auto 2xl:px-0 container">
        <div className="lg:grid lg:grid-cols-2 lg:gap-8 xl:gap-16">
          {/* Image Section */}
          <div className="shrink-0 max-w-md lg:max-w-lg mx-auto">
            <div className="w-full h-[400px] flex justify-center items-center bg-transparent overflow-hidden border rounded-lg">
              <img
                src={getDisplayedImage()}
                alt={product.name}
                className="object-contain max-w-full max-h-full"
              />
            </div>

            {/* Thumbnails */}
            <div className="relative mt-4">
              <button
                onClick={() => scrollThumbnails("left")}
                className="absolute left-0 top-1/2 transform -translate-y-1/2 z-0 bg-white shadow p-2 rounded-full"
              >
                ←
              </button>
              <div
                ref={thumbContainerRef}
                className="flex overflow-x-hidden gap-2 px-8 scrollbar-hide"
              >
                {product.images.map((img: any, index: number) => (
                  <img
                    key={index}
                    src={img.src}
                    alt=""
                    onClick={() => handleThumbnailClick(img.src)}
                    className={`w-24 h-24 object-contain rounded border cursor-pointer flex-shrink-0 ${
                      selectedImage === img.src
                        ? "border-black"
                        : "border-gray-300"
                    }`}
                  />
                ))}
              </div>
              <button
                onClick={() => scrollThumbnails("right")}
                className="absolute right-0 top-1/2 transform -translate-y-1/2 z-0 bg-white shadow p-2 rounded-full"
              >
                →
              </button>
            </div>

            <div className="hidden lg:block mt-4">
              <ProductFeatures
                product={product}
                selectedVariant={selectedVariant.name}
              />
            </div>
          </div>

          {/* Product Details Section */}
          <div className="relative">
            <div
              className={twMerge(
                "lg:sticky lg:top-48",
                product.collection === "Eyewear" ? "lg:top-56" : ""
              )}
            >
              <h1 className="text-xl font-semibold sm:text-2xl text-black mt-6 sm:mt-8 lg:mt-0">
                {product.name}
              </h1>

              <div className="mt-4 sm:items-center sm:gap-4 sm:flex">
                <p className="text-2xl font-extrabold sm:text-3xl text-black">
                  {selectedVariant.price}
                </p>
                <div className="flex items-center gap-2 mt-2 sm:mt-0">
                  <svg
                    className="w-4 h-4 text-yellow-300"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M13.849 4.22c-.684-1.626-3.014-1.626-3.698 0L8.397 8.387l-4.552.361c-1.775.14-2.495 2.331-1.142 3.477l3.468 2.937-1.06 4.392c-.413 1.713 1.472 3.067 2.992 2.149L12 19.35l3.897 2.354c1.52.918 3.405-.436 2.992-2.15l-1.06-4.39 3.468-2.938c1.353-1.146.633-3.336-1.142-3.477l-4.552-.36-1.754-4.17Z" />
                  </svg>
                  <p className="text-sm font-medium leading-none text-gray-400">
                    (5.0)
                  </p>
                  <a
                    href="#"
                    className="text-sm font-medium underline text-gray-600"
                  >
                    345 Reviews
                  </a>
                </div>
              </div>

              {/* Variant Selection */}
              <div
                className={twMerge(
                  "flex gap-2 mt-5",
                  product.collection === "Eyewear" && "hidden"
                )}
              >
                {product.variants.map((variant: any) => (
                  <button
                    key={variant.id}
                    onClick={() => handleVariantClick(variant)}
                    className={twMerge(
                      "py-2.5 px-5 text-sm font-medium border rounded-lg transition-all duration-300",
                      selectedVariant.id === variant.id
                        ? "bg-black text-white border-black"
                        : "bg-transparent text-black border-black hover:bg-black hover:text-white"
                    )}
                  >
                    {variant.name}
                  </button>
                ))}
              </div>

              {/* Eyewear Variant Buttons */}
              <div
                className={twMerge(
                  "mt-4",
                  product.collection !== "Eyewear" && "hidden"
                )}
              >
                <div className="flex flex-wrap gap-4">
                  {product.variants.map((variant: any) => (
                    <button
                      key={variant.id}
                      onClick={() => handleVariantClick(variant)}
                      className={twMerge(
                        "flex-1 min-w-[160px] max-w-[250px] py-4 px-5 text-sm font-medium text-center border rounded-lg transition-all duration-300",
                        selectedVariant.id === variant.id
                          ? "bg-black text-white border-black"
                          : "bg-transparent text-black border-black hover:bg-black hover:text-white"
                      )}
                    >
                      {variant.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity Selection */}
              <div
                className={twMerge(
                  "mt-6 space-y-2",
                  product.collection === "Eyewear" && "hidden"
                )}
              >
                <h3 className="text-sm font-medium">Select quantity:</h3>
                {["Right eye (OD)", "Left eye (OS)"].map((label, idx) => (
                  <div
                    key={label}
                    className="flex items-center justify-between border rounded-lg px-4 py-3"
                  >
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={idx === 0 ? rightEyeEnabled : leftEyeEnabled}
                        onChange={(e) =>
                          idx === 0
                            ? setRightEyeEnabled(e.target.checked)
                            : setLeftEyeEnabled(e.target.checked)
                        }
                        className="form-checkbox h-4 w-4 text-blue-600"
                      />
                      <span>{label}</span>
                    </label>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() =>
                          idx === 0
                            ? setRightEyeQty((prev) => Math.max(1, prev - 1))
                            : setLeftEyeQty((prev) => Math.max(1, prev - 1))
                        }
                        className="w-6 h-6 flex items-center justify-center border rounded"
                      >
                        −
                      </button>
                      <span className="w-6 text-center">
                        {idx === 0 ? rightEyeQty : leftEyeQty}
                      </span>
                      <button
                        onClick={() =>
                          idx === 0
                            ? setRightEyeQty((prev) => prev + 1)
                            : setLeftEyeQty((prev) => prev + 1)
                        }
                        className="w-6 h-6 flex items-center justify-center border rounded"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Call To Action Buttons */}
              <div className="mt-6 sm:gap-4 sm:flex sm:items-center sm:mt-8">
                <a
                  href="#"
                  onClick={() => setModalOpen(true)}
                  className={twMerge(
                    "text-white bg-black rounded-lg text-sm px-5 py-2.5 flex items-center justify-center hover:scale-105 transition-all duration-300",
                    product.collection !== "Eyewear" && "hidden"
                  )}
                >
                  <svg
                    className="w-5 h-5 -ms-2 me-2"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 4h1.5L8 16m0 0h8m-8 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm8 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm.75-3H7.5M11 7H6.312M17 4v6m-3-3h6"
                    />
                  </svg>
                  Select Lenses and Buy
                </a>

                {modalOpen && (
                  <EyeglassesModal
                    product={product}
                    onClose={() => setModalOpen(false)}
                    isOpen={modalOpen}
                    selectedVariant={selectedVariant}
                  />
                )}

                <a
                  href="#"
                  className="mt-4 sm:mt-0 flex items-center justify-center py-2.5 px-5 text-sm font-medium text-white bg-black rounded-lg border hover:scale-105 transition-all duration-300"
                >
                  <svg
                    className="w-5 h-5 -ms-2 me-2"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 6V18M6 12H18"
                    />
                  </svg>
                  Add to Cart
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
