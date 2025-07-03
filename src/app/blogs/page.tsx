// src/app/blogs/page.tsx
"use client";

import React from "react";
import Link from "next/link";
import Image, { StaticImageData } from "next/image";
import { BookOpen, ArrowRight } from "lucide-react";

// Import blog images (same as homepage component)
import blogImage1 from "@/assets/What it Takes to Create Quailty Eywear.png";
import blogImage2 from "@/assets/How to Buy Contacts Online.png";
import blogImage3 from "@/assets/How to Buy Glasses Online.png";
import blogImage4 from "@/assets/How to Measure Your PD.png";
import blogImage5 from "@/assets/How To Read a Prescription.png";
import blogImage6 from "@/assets/How We're Fixing The Blindness Problem.png";
import blogImage7 from "@/assets/How to use vision insurance.png";

interface Blog {
  image: StaticImageData;
  title: string;
  description: string;
  href: string;
}

const allBlogs: Blog[] = [
  {
    image: blogImage1,
    title: "What it Takes to Create Quality Eyewear",
    description:
      "Explore the journey of craftsmanship, from premium materials to the meticulous details that define a perfect frame.",
    href: "/what-it-takes-to-create-quality-eyewear",
  },
  {
    image: blogImage2,
    title: "How to Buy Contacts Online",
    description:
      "A simple, step-by-step guide to ordering your prescribed contact lenses with ease and confidence from our store.",
    href: "/how-to-buy-contacts-online",
  },
  {
    image: blogImage3,
    title: "How to Buy Glasses Online",
    description:
      "Your complete guide to finding the perfect frames and customizing your lenses, all from the comfort of your home.",
    href: "/how-to-buy-eyeglasses-online",
  },
  {
    image: blogImage4,
    title: "How to Measure Your PD",
    description:
      "Learn the simple steps to measure your Pupillary Distance (PD) at home for a perfect glasses fit.",
    href: "/how-to-measure-pd",
  },
  {
    image: blogImage5,
    title: "How To Read a Prescription",
    description:
      "Demystify the numbers and abbreviations on your eye prescription with our easy-to-understand guide.",
    href: "/how-to-read-prescriptions",
  },
  {
    image: blogImage6,
    title: "How We're Fixing The Blindness Problem",
    description:
      "Discover our mission and how every purchase you make contributes to curing blindness around the world.",
    href: "/cure-blindness",
  },
  {
    image: blogImage7,
    title: "How to use vision insurance",
    description:
      "Learn how to use your out-of-network vision insurance benefits to get reimbursed for your eyewear purchases.",
    href: "/how-to-use-vision-insurance",
  },
];

const BlogCard = ({ blog }: { blog: Blog }) => (
  <Link
    href={blog.href}
    className="group block bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden"
  >
    <div className="relative w-full aspect-video">
      <Image
        src={blog.image}
        alt={blog.title}
        className="transition-transform duration-300 group-hover:scale-105"
      />
    </div>
    <div className="p-6">
      <h3 className="text-lg font-bold text-gray-800 group-hover:text-black">
        {blog.title}
      </h3>
      <p className="mt-2 text-sm text-gray-600 line-clamp-3">
        {blog.description}
      </p>
      <div className="mt-4 text-sm font-semibold text-black group-hover:underline flex items-center">
        Read More <ArrowRight size={16} className="ml-1" />
      </div>
    </div>
  </Link>
);

const BlogArchivePage = () => {
  return (
    <main className="min-h-screen bg-slate-50 py-12 sm:py-16">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <header className="mb-12 text-center">
          <BookOpen className="h-16 w-16 text-black mx-auto mb-4" />
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900">
            The Focal Point Blog
          </h1>
          <p className="mt-3 text-lg text-gray-600 max-w-2xl mx-auto">
            Your source for eye health tips, style guides, and understanding
            your vision.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {allBlogs.map((blog) => (
            <BlogCard key={blog.title} blog={blog} />
          ))}
        </div>
      </div>
    </main>
  );
};

export default BlogArchivePage;
