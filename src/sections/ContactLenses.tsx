"use client";

import Card from "@/components/Card";
import precision1Image from "@/assets/precision1.png";
import acuvueOasysImage from "@/assets/acuvueOasys.png";
import dailiesTotalImage from "@/assets/dailiesTotal.webp";
import acuvueMax from "@/assets/acuvueMax.webp";
import { useState } from "react";
import { twMerge } from "tailwind-merge";
import ArrowIcon from "@/assets/arrow-right.svg";

const cardData = [
  {
    image: precision1Image,
    title: "Precision1",
    quantity: 90,
  },
  {
    image: acuvueOasysImage,
    title: "Acuvue Oasys 1-Day",
    quantity: 90,
  },
  {
    image: dailiesTotalImage,
    title: "Dailies Total 1",
    quantity: 90,
  },
  {
    image: acuvueMax,
    title: "Acuvue Oasys Max 1-Day",
    quantity: 90,
  },
];

export const ContactLenses = () => {
  const [selectedCardIndex, setSelectedCardIndex] = useState(0);
  return (
    <section>
      <div className="container sm:mt-[50px] md:mt-[70px] lg:mt-[100px]">
        <div>
          <div className="text-center flex flex-col md:gap-2">
            <h2 className="sm:text-2xl md:text-3xl lg:text-5xl tracking-tight md:tracking-tighter font-extrabold">
              Contact Lenses
            </h2>
            <p className="text-xs md:text-sm lg:text-xl font-semibold tracking-tight">
              Our Featured, Best-Selling Contact Lenses
            </p>
          </div>
          <div className="hidden md:flex md:flex-row items-center justify-center md:gap-6 lg:gap-10 md:mt-16 lg:mt-9">
            {cardData.map(({ image, title, quantity }, cardIndex) => (
              <Card
                key={cardIndex}
                image={image}
                title={title}
                quantity={quantity}
              />
            ))}
          </div>
          <div className="md:hidden grid grid-cols-2 items-center justify-center gap-4 md:gap-6 lg:gap-10 mt-12 md:mt-16 lg:mt-9">
            {cardData.map(({ image, title, quantity }, cardIndex) => (
              <Card
                key={cardIndex}
                image={image}
                title={title}
                quantity={quantity}
              />
            ))}
          </div>
        </div>
        <div className="flex flex-col items-center justify-center mt-8 md:mt-0 md:gap-5 lg:gap-6">
          <div className="hidden md:flex justify-center md:mt-7 lg:mt-10">
            <div className="bg-black/10 inline-flex md:gap-1 lg:gap-2 md:py-2 md:px-2.5 lg:py-3 lg:px-5 rounded-full hover:scale-110 transition-all duration-[350ms]">
              {cardData.map(({ title }, cardIndex) => (
                <div
                  key={title}
                  className={twMerge(
                    "md:size-1.5 lg:size-2.5 bg-zinc-400 rounded-full cursor-pointer md:hover:scale-125 lg:hover:scale-150 transition-all duration-350",
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
