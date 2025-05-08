"use client";

import ArrowIcon from "@/assets/arrow-right.svg";
import heroImage from "@/assets/heroImage.png";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValueEvent,
} from "framer-motion";
import { useRef } from "react";
import LinkButton from "@/components/LinkButton";

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
      className="lg:pt-5 md:pb-10 lg:pb-7 bg-[#F7F4EE] overflow-x-clip lg:-mt-28"
    >
      <div className="container">
        <div className="md:flex items-center">
          <div className="sm:pt-14 md:w-[320px] lg:w-[520px] lg:mt-32">
            <h1 className="text-5xl md:text-[38px] lg:text-6xl font-bold tracking-tight md:tracking-tighter mt-6">
              See Clearly, Change the World
            </h1>
            <div className="lg:mt-6 flex flex-col gap-2">
              <p className="md:text-xl lg:text-[22px] text-black font-medium tracking-tight md:tracking-tighter mt-6">
                Same price. Same brands. One Big Difference: We give sight to
                someone who&apos;s lost it.
              </p>
              <p className="md:text-xl lg:text-[22px] text-black font-medium tracking-tight md:tracking-tighter mt-6">
                Every time you buy contact lenses or glasses, we donate a
                cataract lens to someone in need.
              </p>
            </div>
            <div className="flex flex-col gap-5 mt-8">
              <div className="flex gap-3 items-center md:-mx-2">
                <LinkButton
                  title="Contact Lenses"
                  containerStyles="btn btn-primary bg-black text-white rounded-full py-2 px-4 hover:font-bold hover:scale-110 transition-all duration-[350ms]"
                  textStyles="text-white font-medium"
                  sectionId="cta"
                />
                <LinkButton
                  title="Eyewear"
                  containerStyles="btn btn-primary bg-black text-white rounded-full py-2 px-7 hover:font-bold hover:scale-110 transition-all duration-[350ms]"
                  textStyles="text-white font-medium"
                  sectionId="cta"
                />
              </div>
              <div>
                <button className="btn btn-text gap-1 flex items-center p-0 hover:font-bold hover:scale-105 transition-all duration-[350ms]">
                  <span className="font-semibold">
                    Let&apos;s Fix The World&apos;s Vision Problem
                  </span>
                  <ArrowIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
          <div className="sm:pb-8 mt-10 md:mt-0 md:h-[648px] md:flex-1 relative">
            <motion.img
              src={heroImage.src}
              alt="Hero Image"
              className="md:absolute md:w-auto md:max-w-none md:-left-24 md:top-44 lg:-left-28 lg:top-0 md:h-[350px] lg:h-[460px] lg:mt-40"
              animate={{
                translateY: [-10, 10],
              }}
              transition={{
                repeat: Infinity,
                repeatType: "mirror",
                duration: 3,
                ease: "easeInOut",
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};
