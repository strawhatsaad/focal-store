"use client";

import ArrowIcon from "@/assets/arrow-right.svg";
import heroImage from "@/assets/heroImage.png";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import LinkButton from "@/components/LinkButton";
// Link from next/link is no longer needed here for these buttons
// import Link from "next/link";

export const Hero = () => {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start end", "end start"],
  });

  const translateY = useTransform(scrollYProgress, [0, 1], [150, -150]);

  return (
    <section
      id="hero"
      ref={heroRef}
      className="pt-8 pb-12 bg-[#F7F4EE] overflow-x-clip md:pt-5 md:pb-10 lg:pb-7 lg:-mt-28"
    >
      <div className="container">
        <div className="flex flex-col md:flex-row items-center">
          <div className="text-center md:text-left w-full md:w-[320px] lg:w-[520px] lg:mt-32 order-2 md:order-1">
            <h1 className="text-4xl sm:text-5xl md:text-[38px] lg:text-6xl font-bold tracking-tight mt-6">
              See Clearly, Change the World
            </h1>
            <div className="mt-4 lg:mt-6 flex flex-col gap-2">
              <p className="text-lg sm:text-xl md:text-xl lg:text-[22px] text-black font-medium tracking-tight md:tracking-tighter mt-4 sm:mt-6">
                Same price. Same brands. One Big Difference: You give sight to
                someone who&apos;s lost it.
              </p>
              <p className="text-lg sm:text-xl md:text-xl lg:text-[22px] text-black font-medium tracking-tight md:tracking-tighter mt-4 sm:mt-6">
                Every time you buy contact lenses or glasses, you can be
                providing a cataract lens to someone in need.
              </p>
            </div>
            <div className="flex flex-col items-center md:items-start gap-5 mt-6 sm:mt-8">
              <div className="flex flex-col sm:flex-row gap-3 items-center md:-mx-2">
                {/* LinkButton now handles its own Link component */}
                <LinkButton
                  href="/contact-lenses" // Pass the full href
                  title="Contact Lenses"
                  containerStyles="btn btn-primary bg-black text-white rounded-full py-2.5 px-5 sm:py-2 sm:px-4 text-sm sm:text-base hover:font-bold hover:scale-105 transition-all duration-[350ms]"
                  textStyles="text-white font-medium"
                  // sectionId prop is no longer needed here if href is provided
                />
                <LinkButton
                  href="/eyewear" // Pass the full href
                  title="Eyewear"
                  containerStyles="btn btn-primary bg-black text-white rounded-full py-2.5 px-6 sm:py-2 sm:px-7 text-sm sm:text-base hover:font-bold hover:scale-105 transition-all duration-[350ms]"
                  textStyles="text-white font-medium"
                  // sectionId prop is no longer needed here if href is provided
                />
              </div>
              <div>
                {/* This button is not a LinkButton, so it's fine */}
                <button className="btn btn-text gap-1 flex items-center p-0 hover:font-bold hover:scale-105 transition-all duration-[350ms] text-sm sm:text-base">
                  <span className="font-semibold">
                    Let&apos;s Fix The World&apos;s Vision Problem Together
                  </span>
                  <ArrowIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              </div>
            </div>
          </div>
          {/* Image section */}
          <div className="w-full mt-6 mb-6 md:mb-0 md:mt-0 md:flex-1 relative order-1 md:order-2 flex justify-center items-center md:h-[648px]">
            <motion.img
              src={heroImage.src}
              alt="Hero Image"
              className="max-h-[280px] w-auto sm:max-h-[320px] md:absolute md:w-auto md:max-w-none md:-left-24 md:top-44 lg:-left-28 lg:top-0 md:max-h-[350px] lg:max-h-[460px] lg:mt-40 object-contain"
              style={{
                translateY: translateY,
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};
