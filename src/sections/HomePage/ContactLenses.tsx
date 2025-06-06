"use client";

import { useEffect, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import ArrowIcon from "@/assets/arrow-right.svg";
import { motion, useDragControls } from "framer-motion";
import Link from "next/link";
import { useCart } from "@/context/CartContext";

// Helper component to display price with optional discount
const PriceDisplay = ({ originalPrice, isFirstTimeCustomer }: { originalPrice: string; isFirstTimeCustomer: boolean | undefined }) => {
    const priceNum = parseFloat(originalPrice.replace('$', ''));

    if (isNaN(priceNum) || isFirstTimeCustomer === undefined) {
        return <p className="text-xs sm:text-sm font-bold text-gray-900">{originalPrice}</p>;
    }
  
    if (isFirstTimeCustomer) {
      const discountedPrice = priceNum * 0.80;
      return (
        <div className="flex items-center justify-center gap-1.5">
          <p className="text-xs sm:text-sm font-bold text-black">${discountedPrice.toFixed(2)}</p>
          <p className="text-[10px] sm:text-xs font-medium text-red-600 line-through">${priceNum.toFixed(2)}</p>
        </div>
      );
    }
  
    return <p className="text-xs sm:text-sm font-bold text-gray-900">${priceNum.toFixed(2)}</p>;
};

export const ContactLenses = ({ products }: any) => {
  const { isFirstTimeCustomer } = useCart(); // Get status from cart context
  const [selectedCardIndex, setSelectedCardIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const controls = useDragControls();
  const containerRef = useRef<HTMLDivElement>(null);

  const [chunkSize, setChunkSize] = useState(1);

  useEffect(() => {
    const updateChunkSize = () => {
      if (window.innerWidth >= 1024) {
        setChunkSize(3);
      } else if (window.innerWidth >= 768) {
        setChunkSize(2);
      } else if (window.innerWidth >= 640) {
        setChunkSize(2);
      } else {
        setChunkSize(1);
      }
    };

    updateChunkSize();
    window.addEventListener("resize", updateChunkSize);
    return () => window.removeEventListener("resize", updateChunkSize);
  }, []);

  const totalChunks = products ? Math.ceil(products.length / chunkSize) : 0;

  const productChunks: any[][] = [];
  if (products) {
    for (let i = 0; i < products.length; i += chunkSize) {
      productChunks.push(products.slice(i, i + chunkSize));
    }
  }

  useEffect(() => {
    if (isHovered || totalChunks <= 1) return;
    const timeout = setTimeout(() => {
      setSelectedCardIndex((prev) => (prev >= totalChunks - 1 ? 0 : prev + 1));
    }, 4000);
    return () => {
      clearTimeout(timeout);
    };
  }, [selectedCardIndex, isHovered, totalChunks]);

  const handleDragEnd = (event: any, info: any) => {
    if (totalChunks <= 1) return;
    const dragThreshold = (containerRef.current?.offsetWidth || 300) / (chunkSize * 2.5);
    if (info.offset.x < -dragThreshold) {
      setSelectedCardIndex((prev) => (prev >= totalChunks - 1 ? 0 : prev + 1));
    } else if (info.offset.x > dragThreshold) {
      setSelectedCardIndex((prev) => (prev <= 0 ? totalChunks - 1 : prev - 1));
    }
  };

  useEffect(() => {
    if (selectedCardIndex >= totalChunks && totalChunks > 0) {
      setSelectedCardIndex(totalChunks - 1);
    } else if (totalChunks === 0 && selectedCardIndex !== 0) {
      setSelectedCardIndex(0);
    }
  }, [selectedCardIndex, totalChunks]);

  if (!products || products.length === 0) {
    return (
      <section className="py-12">
        <div className="container text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl tracking-tight font-extrabold mb-4">
            Contact Lenses
          </h2>
          <p className="text-gray-600">No products to display at the moment.</p>
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="mt-12 sm:mt-[50px] md:mt-[70px] lg:mt-[100px]">
        <div>
          <div className="text-center flex flex-col gap-1 md:gap-2 mb-8 sm:mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl tracking-tight font-extrabold">
              Contact Lenses
            </h2>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl font-semibold tracking-tight text-gray-700">
              Our Featured, Best-Selling Contact Lenses
            </p>
          </div>

          <div className="container overflow-hidden">
            <motion.div
              ref={containerRef}
              className="flex cursor-grab active:cursor-grabbing"
              drag="x"
              dragControls={controls}
              dragConstraints={{
                left: -((totalChunks - 1) * (containerRef.current?.offsetWidth || 0)),
                right: 0,
              }}
              onDragEnd={handleDragEnd}
              animate={{
                x: `-${selectedCardIndex * 100}%`,
              }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 30,
              }}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              {productChunks.map((chunk, chunkIndex) => (
                <motion.div
                  key={`chunk-${chunkIndex}`}
                  className="flex-shrink-0 w-full flex justify-center"
                  style={{
                    gap: chunkSize > 1 ? "1rem" : "0",
                  }}
                >
                  {chunk.map((product: any, cardIndex: any) => (
                    <div
                      key={`${product.id}-${cardIndex}`}
                      className="inline-flex flex-shrink-0 transition-all duration-500"
                      style={{ width: `${100 / Math.max(1, chunkSize)}%` }}
                    >
                      <div className="group relative p-2 w-full">
                        <div className="w-full px-2 py-3 sm:px-4 sm:py-6 border border-gray-300 bg-transparent rounded-lg group-hover:scale-105 transition-transform duration-300 flex flex-col items-center">
                          <img
                            alt={product.imageAlt || "Product Image"}
                            src={
                              product.imageSrc ||
                              "https://placehold.co/200x200/F7F4EE/333333?text=No+Image"
                            }
                            className="w-full h-24 sm:h-32 md:h-48 lg:h-64 object-contain"
                          />
                        </div>
                        <div className="mt-2 sm:mt-4 flex flex-col text-center w-full">
                          <div>
                            <h3 className="text-[11px] xs:text-xs sm:text-sm text-gray-700 truncate">
                              <a href={product.href}>
                                <span
                                  aria-hidden="true"
                                  className="absolute inset-0"
                                />
                                {product.name}
                              </a>
                            </h3>
                          </div>
                          <PriceDisplay originalPrice={product.price} isFirstTimeCustomer={isFirstTimeCustomer} />
                        </div>
                      </div>
                    </div>
                  ))}
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center mt-6 sm:mt-8 md:mt-12 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
          {totalChunks > 1 && (
            <div className="flex justify-center">
              <div className="bg-black/10 inline-flex gap-1.5 sm:gap-2 md:gap-3 lg:gap-2 py-1.5 px-3 sm:py-2 sm:px-4 md:py-3 md:px-5 lg:py-3 lg:px-5 rounded-full hover:scale-110 transition-all duration-[350ms]">
                {Array.from({ length: totalChunks }).map(
                  (_, cardIndex) => (
                    <div
                      key={`dot-${cardIndex}`}
                      className={twMerge(
                        "h-2 w-2 sm:h-2.5 sm:w-2.5 md:h-3 md:w-3 lg:size-2.5 bg-zinc-400 rounded-full cursor-pointer hover:scale-125 transition-all duration-300",
                        cardIndex === selectedCardIndex &&
                          "bg-black scale-110 sm:scale-125"
                      )}
                      onClick={() => setSelectedCardIndex(cardIndex)}
                    ></div>
                  )
                )}
              </div>
            </div>
          )}
          <div>
            <Link href={"/pages/contact-lenses"}>
              <button className="btn btn-text gap-1 flex items-center hover:font-bold hover:scale-105 transition-all duration-[350ms] text-sm sm:text-base">
                <span className="font-semibold">All Contact Lenses</span>
                <ArrowIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
