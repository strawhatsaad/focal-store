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
      <div className="container mt-[100px]">
        <div>
          <div className="text-center flex flex-col gap-2">
            <h2 className="text-5xl tracking-tight font-extrabold">
              Contact Lenses
            </h2>
            <p className="text-xl font-semibold tracking-tight">
              Our Featured, Best-Selling Contact Lenses
            </p>
          </div>
          <div className="flex flex-row items-center justify-center gap-10 mt-9">
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
        <div className="flex flex-col items-center justify-center gap-6">
          <div className="flex justify-center mt-10">
            <div className="bg-black/10 inline-flex gap-2 py-3 px-5 rounded-full hover:scale-110 transition-all duration-[350ms]">
              {cardData.map(({ title }, cardIndex) => (
                <div
                  key={title}
                  className={twMerge(
                    "size-2.5 bg-zinc-400 rounded-full cursor-pointer hover:scale-150 transition-all duration-350",
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
