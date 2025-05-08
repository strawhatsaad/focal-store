import blogImage1 from "@/assets/What it Takes to Create Quailty Eywear.png";
import blogImage2 from "@/assets/How to Buy Contacts Online.png";
import blogImage3 from "@/assets/How to Buy Glasses Online.png";
import blogImage4 from "@/assets/How to Measure Your PD.png";
import blogImage5 from "@/assets/How To Read a Prescription.png";
import blogImage6 from "@/assets/How We're Fixing The Blindness Problem.png";
import blogImage7 from "@/assets/How to use vision insurance.png";
import Image from "next/image";
import Link from "next/link";

const blogData = [
  {
    image: blogImage1,
    title: "What it Takes to Create Quality Eyewear",
  },
  {
    image: blogImage2,
    title: "How to Buy Contacts Online",
  },
  {
    image: blogImage3,
    title: "How to Buy Glasses Online",
  },
  {
    image: blogImage4,
    title: "How to Measure Your PD",
  },
  {
    image: blogImage5,
    title: "How To Read a Prescription",
  },
  {
    image: blogImage6,
    title: "How We're Fixing The Blindness Problem",
  },
  {
    image: blogImage7,
    title: "How to use vision insurance",
  },
];

const blogDataSplit1 = [
  {
    image: blogImage1,
    title: "What it Takes to Create Quality Eyewear",
  },
  {
    image: blogImage2,
    title: "How to Buy Contacts Online",
  },
  {
    image: blogImage3,
    title: "How to Buy Glasses Online",
  },
  {
    image: blogImage4,
    title: "How to Measure Your PD",
  },
];

const blogDataSplit2 = [
  {
    image: blogImage5,
    title: "How To Read a Prescription",
  },
  {
    image: blogImage6,
    title: "How We're Fixing The Blindness Problem",
  },
  {
    image: blogImage7,
    title: "How to use vision insurance",
  },
];

export const Blogs = () => {
  return (
    <section className="mt-24">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col items-center md:gap-8 lg:gap-12">
          <div className="flex flex-col items-center gap-1 md:gap-1 lg:gap-4 max-w-2xl">
            <h2 className="text-3xl md:text-4xl lg:text-7xl font-black tracking-tighter text-center bg-gradient-to-b from-black to-[#001E80] text-transparent bg-clip-text">
              We know a thing or two about eyes
            </h2>
            <p className="text-sm md:text-lg lg:text-xl font-medium text-center">
              Eye-opening reads you&apos;ll actually want to see.
            </p>
          </div>
          <div className="hidden md:flex md:flex-row justify-center md:gap-3 lg:gap-12">
            {blogData.map(({ image, title }, index) => (
              <Link
                key={index}
                href={"/"}
                className="md:text-xs lg:text-lg font-semibold tracking-tighter text-center group"
              >
                <div className="flex flex-col items-center md:gap-1.5 lg:gap-2.5">
                  <Image
                    src={image}
                    alt="Blog Image"
                    className="group-hover:-translate-y-3 transition-all duration-300"
                  />
                  <p className="group-hover:scale-105 group-hover:underline transition-all duration-300">
                    {title}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          {/* Mobile View */}
          <div className="flex flex-col md:hidden gap-5 p-10">
            <div className="grid grid-cols-4 gap-3">
              {blogDataSplit1.map(({ image, title }, index) => (
                <Link
                  key={index}
                  href={"/"}
                  className="text-xs font-semibold tracking-tighter text-center group"
                >
                  <div className="flex flex-col items-center gap-1.5">
                    <Image
                      src={image}
                      alt="Blog Image"
                      className="group-hover:-translate-y-3 transition-all duration-300"
                    />
                    <p className="group-hover:scale-105 group-hover:underline transition-all duration-300">
                      {title}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-6">
              {blogDataSplit2.map(({ image, title }, index) => (
                <Link
                  key={index}
                  href={"/"}
                  className="text-xs font-semibold tracking-tighter text-center group"
                >
                  <div className="flex flex-col items-center gap-1.5">
                    <Image
                      src={image}
                      alt="Blog Image"
                      className="group-hover:-translate-y-3 transition-all duration-300"
                    />
                    <p className="group-hover:scale-105 group-hover:underline transition-all duration-300">
                      {title}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
