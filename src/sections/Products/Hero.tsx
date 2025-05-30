// src/sections/Products/Hero.tsx
import React from "react";

const Hero = ({ title, headline }: { title: string; headline: string }) => {
  return (
    <section>
      <div className="relative isolate px-4 sm:px-6 lg:px-8">
        {" "}
        {/* Adjusted base horizontal padding */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
        >
          <div
            style={{
              clipPath:
                "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
            }}
            className="relative left-[calc(50%-11rem)] aspect-1155/678 w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
          />
        </div>
        {/* Adjusted vertical padding: Reduced bottom padding */}
        {/* Old: py-16 sm:py-20 md:py-24 lg:py-28 */}
        {/* New: pt-16 pb-8 sm:pt-20 sm:pb-10 md:pt-24 md:pb-12 lg:pt-28 lg:pb-16 */}
        <div className="mx-auto max-w-2xl pt-4 pb-7 sm:pt-4 sm:pb-7 md:pt-24 md:pb-12 lg:pt-8 lg:pb-8">
          <div className="text-center">
            <h1 className="text-4xl font-semibold tracking-tight text-balance text-gray-900 sm:text-5xl md:text-6xl lg:text-7xl">
              {title}
            </h1>
            <p className="mt-6 text-base font-medium text-pretty text-gray-500 sm:text-lg md:text-xl sm:leading-8">
              {headline}
            </p>
            <div className="mt-8 flex items-center justify-center gap-x-6">
              <a
                href="#products"
                className="rounded-md bg-black px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:scale-105 transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
              >
                View All {title}
              </a>
            </div>
          </div>
        </div>
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
        >
          <div
            style={{
              clipPath:
                "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
            }}
            className="relative left-[calc(50%+3rem)] aspect-1155/678 w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
          />
        </div>
      </div>
    </section>
  );
};

export default Hero;
