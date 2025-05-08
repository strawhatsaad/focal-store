"use client";

import { useState } from "react";
import { twMerge } from "tailwind-merge";
import ArrowIcon from "@/assets/arrow-right.svg";
import RelatedProducts from "../Products/ProductDetails/RelatedProducts";

export const ContactLenses = ({ products }: any) => {
  const [selectedCardIndex, setSelectedCardIndex] = useState(0);
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
          <RelatedProducts products={products} headingText={false} />
        </div>
        <div className="flex flex-col items-center justify-center mt-8 md:mt-0 md:gap-5 lg:gap-6">
          <div className="hidden md:flex justify-center -mt-12">
            <div className="bg-black/10 inline-flex md:gap-3 lg:gap-2 md:py-4 md:px-7 lg:py-3 lg:px-5 rounded-full hover:scale-110 transition-all duration-[350ms]">
              {products.map((product: any, cardIndex: any) => (
                <div
                  key={product.id}
                  className={twMerge(
                    "md:size-4 lg:size-2.5 bg-zinc-400 rounded-full cursor-pointer md:hover:scale-125 lg:hover:scale-150 transition-all duration-350",
                    cardIndex === selectedCardIndex && "bg-black"
                  )}
                  onClick={() => setSelectedCardIndex(cardIndex)}
                ></div>
              ))}
            </div>
          </div>
          <div>
            <button className="btn btn-text gap-1 flex items-center hover:font-bold hover:scale-105 transition-all duration-[350ms]">
              <span className="font-semibold">All Contact Lenses</span>
              <ArrowIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
