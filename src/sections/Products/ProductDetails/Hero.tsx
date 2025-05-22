"use client";

import React, { useRef, useState, useEffect } from "react";
import { twMerge } from "tailwind-merge";
import ProductFeatures from "@/sections/Products/ProductDetails/ProductFeatures";

const Hero = ({ product }: any) => {
  const [selectedVariant, setSelectedVariant] = useState<any>(
    product.variants[0]
  );

  const [selectedImage, setSelectedImage] = useState(
    selectedVariant?.images?.[0]?.src || product.images?.[0]?.src
  );

  const thumbContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const variantImage = selectedVariant?.images?.[0]?.src;
    if (variantImage) {
      setSelectedImage(variantImage);
    } else {
      setSelectedImage(product.images?.[0]?.src);
    }
  }, [selectedVariant]);

  const handleThumbnailClick = (src: string) => {
    setSelectedImage(src);
  };

  const scrollThumbnails = (direction: "left" | "right") => {
    if (!thumbContainerRef.current) return;
    const scrollAmount = thumbContainerRef.current.clientWidth / 2;
    thumbContainerRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  // Handle variant selection
  const handleVariantClick = (variant: any) => {
    setSelectedVariant(variant);
  };

  const [rightEyeEnabled, setRightEyeEnabled] = useState(true);
  const [leftEyeEnabled, setLeftEyeEnabled] = useState(true);
  const [rightEyeQty, setRightEyeQty] = useState(1);
  const [leftEyeQty, setLeftEyeQty] = useState(1);

  let variantNames: any;

  product.variants.map((variant: any) => {
    variantNames = variant.name.split("/");
  });

  return (
    <section className="py-8 bg-white md:py-16 antialiased">
      <div className="max-w-screen-xl px-4 mx-auto 2xl:px-0 container">
        <div className="lg:grid lg:grid-cols-2 lg:gap-8 xl:gap-16">
          <div className="shrink-0 max-w-md lg:max-w-lg mx-auto">
            <div>
              {/* Main Image */}
              <div className="w-full h-[400px] flex justify-center items-center bg-transparent overflow-hidden border rounded-lg">
                <img
                  src={selectedVariant?.imageSrc}
                  alt={product.name}
                  className={twMerge(
                    "object-contain max-w-full max-h-full",
                    selectedVariant == product.variants[0] ? "hidden" : ""
                  )}
                />

                <img
                  className={twMerge(
                    "object-contain max-w-full max-h-full",
                    selectedVariant != product.variants[0] ? "hidden" : ""
                  )}
                  src={selectedImage}
                  alt={product.name}
                />
              </div>

              {/* Thumbnails */}
              {/* Thumbnails Scrollable with Arrows */}
              <div className="relative">
                {/* Left Arrow */}
                <button
                  onClick={() => scrollThumbnails("left")}
                  className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white shadow p-2 rounded-full"
                >
                  ←
                </button>

                {/* Thumbnails Container */}
                <div
                  ref={thumbContainerRef}
                  className="flex overflow-x-hidden gap-2 px-8 scrollbar-hide"
                >
                  {product.images.map((img: any, index: any) => (
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

                {/* Right Arrow */}
                <button
                  onClick={() => scrollThumbnails("right")}
                  className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white shadow p-2 rounded-full"
                >
                  →
                </button>
              </div>
            </div>

            <div className="hidden lg:block">
              <ProductFeatures
                product={product}
                selectedVariant={selectedVariant.name}
              />
            </div>
          </div>

          <div className="relative">
            <div
              className={twMerge(
                "lg:sticky lg:top-48",
                product.collection == "Eyewear" ? "lg:top-56" : ""
              )}
            >
              <div className="mt-6 sm:mt-8 lg:mt-0">
                <h1 className="text-xl font-semibold sm:text-2xl text-black">
                  {product.name}
                </h1>
                <div className="mt-4 sm:items-center sm:gap-4 sm:flex">
                  <p className="text-2xl font-extrabold sm:text-3xl text-black">
                    {selectedVariant.price}
                  </p>

                  <div className="flex items-center gap-2 mt-2 sm:mt-0">
                    <div className="flex items-center gap-1">
                      {/* Ratings SVG */}
                      <svg
                        className="w-4 h-4 text-yellow-300"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M13.849 4.22c-.684-1.626-3.014-1.626-3.698 0L8.397 8.387l-4.552.361c-1.775.14-2.495 2.331-1.142 3.477l3.468 2.937-1.06 4.392c-.413 1.713 1.472 3.067 2.992 2.149L12 19.35l3.897 2.354c1.52.918 3.405-.436 2.992-2.15l-1.06-4.39 3.468-2.938c1.353-1.146.633-3.336-1.142-3.477l-4.552-.36-1.754-4.17Z" />
                      </svg>
                      {/* Other stars */}
                      <p className="text-sm font-medium leading-none text-gray-400">
                        (5.0)
                      </p>
                      <a
                        href="#"
                        className="text-sm font-medium leading-none underline hover:no-underline text-white"
                      >
                        345 Reviews
                      </a>
                    </div>
                  </div>
                </div>

                <div
                  className={twMerge(
                    "flex items-center gap-2 sm:mt-0",
                    product.collection == "Eyewear" ? "hidden" : ""
                  )}
                >
                  {product.variants.map((variant: any) => (
                    <div key={variant.id}>
                      <a
                        href="#"
                        onClick={() => handleVariantClick(variant)}
                        title={variant.name}
                        className={twMerge(
                          "flex items-center justify-center mt-5 py-2.5 px-5 text-sm font-medium text-white focus:outline-none border rounded-lg transition-all duration-300",
                          selectedVariant.id === variant.id
                            ? "bg-black border-black hover:text-white"
                            : "bg-transparent text-black border-black hover:bg-black hover:text-white"
                        )}
                        role="button"
                      >
                        {variant.name} {variant.optionNames}
                      </a>
                    </div>
                  ))}
                </div>

                <div
                  className={twMerge(
                    "flex items-center gap-2 sm:mt-0",
                    product.collection != "Eyewear" ? "hidden" : ""
                  )}
                >
                  <div className="flex flex-wrap gap-4 mt-4">
                    {product.variants.map((variant: any) => (
                      <div
                        key={variant.id}
                        className="flex-1 min-w-[160px] max-w-[250px]"
                      >
                        <a
                          href="#"
                          onClick={() => handleVariantClick(variant)}
                          title={variant.name}
                          className={twMerge(
                            "flex items-center justify-center w-full h-full py-4 px-5 text-sm font-medium text-center focus:outline-none border rounded-lg transition-all duration-300",
                            selectedVariant.id === variant.id
                              ? "bg-black border-black text-white"
                              : "bg-transparent text-black border-black hover:bg-black hover:text-white"
                          )}
                          role="button"
                        >
                          {variant.name}
                        </a>
                      </div>
                    ))}
                  </div>
                </div>

                <div
                  className={twMerge(
                    "mt-6 space-y-2",
                    product.collection == "Eyewear" ? "hidden" : ""
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
                          onChange={(e) => {
                            idx === 0
                              ? setRightEyeEnabled(e.target.checked)
                              : setLeftEyeEnabled(e.target.checked);
                          }}
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
                          className="w-6 h-6 flex items-center justify-center border rounded text-lg"
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
                          className="w-6 h-6 flex items-center justify-center border rounded text-lg"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 sm:gap-4 sm:items-center sm:flex sm:mt-8">
                  <a
                    href="#"
                    title=""
                    className={twMerge(
                      "text-white mt-4 sm:mt-0 bg-black focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 focus:outline-none dark:focus:ring-primary-800 flex items-center justify-center hover:scale-105 transition-all duration-300",
                      product.collection != "Eyewear" ? "hidden" : ""
                    )}
                    role="button"
                  >
                    <svg
                      className="w-5 h-5 -ms-2 me-2"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
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
                    Select Lenses and buy
                  </a>

                  <a
                    href="#"
                    title=""
                    className="flex items-center justify-center py-2.5 px-5 text-sm font-medium text-white focus:outline-none bg-black rounded-lg border hover:text-primary-700 focus:z-10 focus:ring-4 focus:ring-black border-black hover:text-white hover:scale-105 transition-all duration-300"
                    role="button"
                  >
                    <svg
                      className="w-5 h-5 -ms-2 me-2"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12.01 6.001C6.5 1 1 8 5.782 13.001L12.011 20l6.23-7C23 8 17.5 1 12.01 6.002Z"
                      />
                    </svg>
                    Add to favorites
                  </a>

                  <a
                    href="#"
                    title=""
                    className={twMerge(
                      "text-white mt-4 sm:mt-0 bg-black focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 focus:outline-none dark:focus:ring-primary-800 flex items-center justify-center hover:scale-105 transition-all duration-300",
                      product.collection == "Eyewear" ? "hidden" : ""
                    )}
                    role="button"
                  >
                    <svg
                      className="w-5 h-5 -ms-2 me-2"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
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
                    Add to cart
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
