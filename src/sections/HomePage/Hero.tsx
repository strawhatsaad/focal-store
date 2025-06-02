"use client";

import ArrowIcon from "@/assets/arrow-right.svg";
import heroImage from "@/assets/heroImage.png";
import {
  motion,
  useScroll,
  useTransform,
  // useMotionValueEvent, // No longer needed if we remove one animation or simplify
} from "framer-motion";
import { useRef } from "react";
import LinkButton from "@/components/LinkButton";
import Link from "next/link";

export const Hero = () => {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start end", "end start"], // Parallax effect starts when top of hero section reaches bottom of viewport, ends when bottom of hero reaches top of viewport
  });

  // Parallax effect: Image moves up as user scrolls down, and down as user scrolls up
  // Adjust the [150, -150] range to control the amount of parallax movement.
  // Positive values move it down initially, negative values move it up as it scrolls into view.
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
                Same price. Same brands. One Big Difference: We give sight to
                someone who&apos;s lost it.
              </p>
              <p className="text-lg sm:text-xl md:text-xl lg:text-[22px] text-black font-medium tracking-tight md:tracking-tighter mt-4 sm:mt-6">
                Every time you buy contact lenses or glasses, we donate a
                cataract lens to someone in need.
              </p>
            </div>
            <div className="flex flex-col items-center md:items-start gap-5 mt-6 sm:mt-8">
              <div className="flex flex-col sm:flex-row gap-3 items-center md:-mx-2">
                <Link href={"/pages/contact-lenses"}>
                  <LinkButton
                    title="Contact Lenses"
                    containerStyles="btn btn-primary bg-black text-white rounded-full py-2.5 px-5 sm:py-2 sm:px-4 text-sm sm:text-base hover:font-bold hover:scale-105 transition-all duration-[350ms]"
                    textStyles="text-white font-medium"
                    sectionId="cta"
                  />
                </Link>
                <Link href={"/pages/eyewear"}>
                  <LinkButton
                    title="Eyewear"
                    containerStyles="btn btn-primary bg-black text-white rounded-full py-2.5 px-6 sm:py-2 sm:px-7 text-sm sm:text-base hover:font-bold hover:scale-105 transition-all duration-[350ms]"
                    textStyles="text-white font-medium"
                    sectionId="cta"
                  />
                </Link>
              </div>
              <div>
                <button className="btn btn-text gap-1 flex items-center p-0 hover:font-bold hover:scale-105 transition-all duration-[350ms] text-sm sm:text-base">
                  <span className="font-semibold">
                    Let&apos;s Fix The World&apos;s Vision Problem
                  </span>
                  <ArrowIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              </div>
            </div>
          </div>
          {/* Image section */}
          <div className="w-full mt-8 md:mt-0 md:flex-1 relative order-1 md:order-2 flex justify-center items-center md:h-[648px]">
            <motion.img
              src={heroImage.src}
              alt="Hero Image"
              className="max-h-[280px] w-auto sm:max-h-[320px] md:absolute md:w-auto md:max-w-none md:-left-24 md:top-44 lg:-left-28 lg:top-0 md:max-h-[350px] lg:max-h-[460px] lg:mt-40 object-contain"
              // Removed the conflicting animate prop for translateY
              // animate={{
              //   translateY: [-10, 10], // This was causing conflict with the scroll-based translateY
              // }}
              // transition={{
              //   repeat: Infinity,
              //   repeatType: "mirror",
              //   duration: 3,
              //   ease: "easeInOut",
              // }}
              style={{
                translateY: translateY, // Only apply the scroll-based parallax translateY
                // Adding will-change can sometimes help performance, but test without it first
                // willChange: 'transform',
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};
