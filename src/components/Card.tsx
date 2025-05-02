import Image, { StaticImageData } from "next/image";
import React from "react";
import { twMerge } from "tailwind-merge";

interface CardProps {
  image?: StaticImageData;
  title?: string;
  quantity?: number;
  imageStyles?: string;
}

const Card = ({ image, title, quantity, imageStyles }: CardProps) => {
  return (
    <div className="bg-[#E6E0E0]/30 w-full px-12 py-5 rounded-2xl h-[200px] md:h-[200px] lg:h-[300px] group">
      <div className="md:h-[85px] lg:h-[131px] flex items-center justify-center relative">
        <Image
          src={image}
          alt="product"
          className="rounded-lg group-hover:-translate-y-5 transition-all duration-300"
        />
      </div>

      <div className="border-t-[1px] border-black/40 md:mt-4 lg:mt-6 -mx-6">
        <h3 className="md:text-[10px] lg:text-lg font-bold mt-4">{title}</h3>
        <p className="text-black/60 md:text-[10px] lg:text-sm">
          {quantity} pack
        </p>
      </div>
    </div>
  );
};

export default Card;
