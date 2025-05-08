"use client";

import { useEffect, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import ArrowIcon from "@/assets/arrow-right.svg";
import { motion, useDragControls } from "framer-motion";
import Link from "next/link";

export const ContactLenses = ({ products }: any) => {
  const [selectedCardIndex, setSelectedCardIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const controls = useDragControls();
  const containerRef = useRef(null);

  const chunkSize = 3; // Number of products per slide
  const totalChunks = Math.ceil(products.length / chunkSize); // Number of slides

  // Split the products array into chunks of 3 for each slide
  const productChunks = [];
  for (let i = 0; i < products.length; i += chunkSize) {
    productChunks.push(products.slice(i, i + chunkSize));
  }

  useEffect(() => {
    if (isHovered) return; // Pause auto-slide on hover
    const timeout = setTimeout(() => {
      setSelectedCardIndex((prev) => (prev === totalChunks - 1 ? 0 : prev + 1));
    }, 4000); // Change slide every 4 seconds
    return () => {
      clearTimeout(timeout);
    };
  }, [selectedCardIndex, isHovered]);

  const handleDragEnd = (event: any, info: any) => {
    if (info.offset.x < -50) {
      setSelectedCardIndex((prev) => (prev === totalChunks - 1 ? 0 : prev + 1));
    } else if (info.offset.x > 50) {
      setSelectedCardIndex((prev) => (prev === 0 ? totalChunks - 1 : prev - 1));
    }
  };

  return (
    <section>
      <div className="sm:mt-[50px] md:mt-[70px] lg:mt-[100px]">
        <div>
          <div className="text-center flex flex-col md:gap-2 -mb-16">
            <h2 className="sm:text-2xl md:text-3xl lg:text-5xl tracking-tight md:tracking-tighter font-extrabold">
              Contact Lenses
            </h2>
            <p className="text-xs md:text-sm lg:text-xl font-semibold tracking-tight">
              Our Featured, Best-Selling Contact Lenses
            </p>
          </div>

          <div className="mt-24 lg:mt-40 flex justify-start container">
            <motion.div
              ref={containerRef}
              className="flex gap-6 cursor-grab active:cursor-grabbing"
              drag="x"
              dragControls={controls}
              dragConstraints={containerRef}
              onDragEnd={handleDragEnd}
              animate={{
                x: `-${selectedCardIndex * (100 / chunkSize)}%`, // Show 3 products per slide
                opacity: 1,
              }}
              transition={{
                type: "spring",
                stiffness: 100,
                damping: 40,
              }}
            >
              {productChunks.map((chunk, index) => (
                <motion.div
                  key={index}
                  className="flex gap-0 md:gap-4"
                  initial={{ opacity: 0, x: 100 }} // Start with the chunk hidden (on the right)
                  animate={{
                    opacity: selectedCardIndex === index ? 1 : 0,
                    x: selectedCardIndex === index ? 0 : 100,
                  }} // Fade and slide in the current chunk
                  exit={{ opacity: 0, x: -100 }} // Fade out to the left
                  transition={{
                    opacity: { duration: 0.5 },
                    x: { duration: 0.5 },
                  }}
                >
                  {chunk.map((product: any, cardIndex: any) => (
                    <div
                      key={cardIndex}
                      className="inline-flex flex-shrink-0 transition-all duration-500 -mr-4 md:mr-0"
                      onMouseEnter={() => setIsHovered(true)}
                      onMouseLeave={() => setIsHovered(false)}
                    >
                      <div className="group relative">
                        <div className="w-[280px] sm:w-[100px] md:w-[320px] lg:w-[340px] px-4 py-6 border border-gray-300 bg-transparent rounded-lg group-hover:scale-105 transition-transform duration-300">
                          <img
                            alt={product.imageAlt}
                            src={product.imageSrc}
                            className="w-full h-20 md:h-64 object-contain"
                          />
                        </div>
                        <div className="mt-4 flex flex-col lg:flex-row justify-between sm:w-[130px] md:w-[320px] lg:w-[340px]">
                          <div>
                            <h3 className="text-xs md:text-sm text-gray-700">
                              <a href={product.href}>
                                <span
                                  aria-hidden="true"
                                  className="absolute inset-0"
                                />
                                {product.name}
                              </a>
                            </h3>
                          </div>
                          <p className="text-xs md:text-sm font-bold text-gray-900">
                            {product.price}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Pagination */}
        <div className="flex flex-col items-center justify-center mt-8 md:mt-28 gap-4 md:gap-5 lg:gap-6">
          <div className="flex justify-center md:-mt-12">
            <div className="bg-black/10 inline-flex gap-2 md:gap-3 lg:gap-2 py-2 px-4 md:py-4 md:px-7 lg:py-3 lg:px-5 rounded-full hover:scale-110 transition-all duration-[350ms]">
              {productChunks.map((_, cardIndex) => (
                <div
                  key={cardIndex}
                  className={twMerge(
                    "size-2.5 md:size-4 lg:size-2.5 bg-zinc-400 rounded-full cursor-pointer md:hover:scale-125 lg:hover:scale-150 transition-all duration-350",
                    cardIndex === selectedCardIndex && "bg-black"
                  )}
                  onClick={() => setSelectedCardIndex(cardIndex)}
                ></div>
              ))}
            </div>
          </div>
          <div>
            <Link href={"/pages/contact-lenses"}>
              <button className="btn btn-text gap-1 flex items-center hover:font-bold hover:scale-105 transition-all duration-[350ms]">
                <span className="font-semibold">All Contact Lenses</span>
                <ArrowIcon className="h-5 w-5" />
              </button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
