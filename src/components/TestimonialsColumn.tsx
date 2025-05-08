"use client";
import { testimonials } from "@/sections/HomePage/Testimonials";
import Image from "next/image";
import React from "react";
import { motion } from "framer-motion";

const TestimonialsColumn = (props: {
  className?: string;
  testimonials: typeof testimonials;
  duration?: number;
}) => {
  return (
    <div className={props.className}>
      <motion.div
        className="flex flex-col gap-6 pb-6"
        animate={{
          translateY: "-50%",
        }}
        transition={{
          repeat: Infinity,
          ease: "linear",
          repeatType: "loop",
          duration: props.duration || 10,
        }}
      >
        {[...new Array(2)].fill(0).map((_, index) => (
          <React.Fragment key={index}>
            {props.testimonials.map(
              ({ text, imageSrc, name, username }, index) => (
                <div key={username} className="card">
                  <div>{text}</div>
                  <div className="flex items-center gap-2 mt-5">
                    <Image
                      src={imageSrc}
                      alt={name}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                    <div className="flex flex-col">
                      <div className="font-medium tracking-tight leading-5">
                        {name}
                      </div>
                      <div className="leading-5 tracking-tight">{username}</div>
                    </div>
                  </div>
                </div>
              )
            )}
          </React.Fragment>
        ))}
      </motion.div>
    </div>
  );
};

export default TestimonialsColumn;
