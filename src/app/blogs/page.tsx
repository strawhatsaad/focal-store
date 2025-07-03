// src/app/blogs/page.tsx
"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image, { StaticImageData } from "next/image";
import { Search, ArrowRight } from "lucide-react";
import Fuse from "fuse.js";

// Import blog images
import blogImage1 from "@/assets/What it Takes to Create Quailty Eywear.png";
import blogImage2 from "@/assets/How to Buy Contacts Online.png";
import blogImage3 from "@/assets/How to Buy Glasses Online.png";
import blogImage4 from "@/assets/How to Measure Your PD.png";
import blogImage5 from "@/assets/How To Read a Prescription.png";
import blogImage6 from "@/assets/How We're Fixing The Blindness Problem.png";
import blogImage7 from "@/assets/How to use vision insurance.png";

// --- Data Structure ---
interface Blog {
  id: string;
  image: StaticImageData;
  title: string;
  description: string;
  href: string;
  category:
    | "Buying Guides"
    | "Frames & Fit"
    | "Lenses & Health"
    | "Our Mission";
  keywords: string[];
}

const allBlogs: Blog[] = [
  {
    id: "quality-eyewear",
    image: blogImage1,
    title: "What it Takes to Create Quality Eyewear",
    description:
      "Explore the journey of craftsmanship, from premium materials to the meticulous details that define a perfect frame.",
    href: "/what-it-takes-to-create-quality-eyewear",
    category: "Frames & Fit",
    keywords: ["quality", "eyewear", "frames", "style", "craftsmanship"],
  },
  {
    id: "buy-contacts",
    image: blogImage2,
    title: "How to Buy Contacts Online",
    description:
      "A simple, step-by-step guide to ordering your prescribed contact lenses with ease and confidence from our store.",
    href: "/how-to-buy-contacts-online",
    category: "Buying Guides",
    keywords: ["buy", "contacts", "online", "guide", "order"],
  },
  {
    id: "buy-glasses",
    image: blogImage3,
    title: "How to Buy Glasses Online",
    description:
      "Your complete guide to finding the perfect frames and customizing your lenses, all from the comfort of your home.",
    href: "/how-to-buy-eyeglasses-online",
    category: "Buying Guides",
    keywords: ["buy", "glasses", "online", "guide", "order", "frames"],
  },
  {
    id: "measure-pd",
    image: blogImage4,
    title: "How to Measure Your PD",
    description:
      "Learn the simple steps to measure your Pupillary Distance (PD) at home for a perfect glasses fit.",
    href: "/how-to-measure-pd",
    category: "Frames & Fit",
    keywords: ["measure", "pd", "pupillary", "distance", "health", "fit"],
  },
  {
    id: "read-rx",
    image: blogImage5,
    title: "How To Read a Prescription",
    description:
      "Demystify the numbers and abbreviations on your eye prescription with our easy-to-understand guide.",
    href: "/how-to-read-prescriptions",
    category: "Lenses & Health",
    keywords: ["read", "prescription", "rx", "health", "lenses"],
  },
  {
    id: "our-mission",
    image: blogImage6,
    title: "How We're Fixing The Blindness Problem",
    description:
      "Discover our mission and how every purchase you make contributes to curing blindness around the world.",
    href: "/cure-blindness",
    category: "Our Mission",
    keywords: ["mission", "cure", "blindness", "charity"],
  },
  {
    id: "vision-insurance",
    image: blogImage7,
    title: "How to use vision insurance",
    description:
      "Learn how to use your out-of-network vision insurance benefits to get reimbursed for your eyewear purchases.",
    href: "/how-to-use-vision-insurance",
    category: "Buying Guides",
    keywords: [
      "vision",
      "insurance",
      "fsa",
      "hsa",
      "reimbursement",
      "buying",
      "guide",
    ],
  },
];

// --- Reusable Components ---

const HeroSection = ({
  query,
  setQuery,
}: {
  query: string;
  setQuery: (q: string) => void;
}) => (
  <section className="relative bg-gray-100 py-16 sm:py-20 md:py-24 text-center overflow-hidden">
    <div className="absolute inset-0 bg-white opacity-50"></div>
    <Image
      src={blogImage3}
      alt="Eyeglasses on a desk"
      fill
      style={{ objectFit: "cover" }}
      className="absolute inset-0 z-0 opacity-10"
      placeholder="blur"
      priority
    />
    <div className="container relative z-10 mx-auto px-4">
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-gray-900">
        Tips & Guides
      </h1>
      <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">
        For all things eyewear
      </p>
      <form
        className="mt-8 max-w-lg mx-auto"
        onSubmit={(e) => e.preventDefault()}
      >
        <div className="relative">
          <input
            type="search"
            placeholder="What are you looking for?"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-5 pr-12 py-3 text-base border-gray-300 rounded-full shadow-sm focus:ring-black focus:border-black"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
            <Search className="h-5 w-5" />
          </div>
        </div>
      </form>
      <div className="mt-6 flex justify-center flex-wrap gap-2 sm:gap-3">
        <Link
          href="/how-to-measure-pd"
          className="px-4 py-1.5 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:bg-white transition-colors"
        >
          Measure Pupillary Distance
        </Link>
        <Link
          href="/how-to-read-prescriptions"
          className="px-4 py-1.5 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:bg-white transition-colors"
        >
          Read Prescription
        </Link>
        <Link
          href="/how-to-use-vision-insurance"
          className="px-4 py-1.5 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:bg-white transition-colors"
        >
          Vision Insurance
        </Link>
      </div>
    </div>
  </section>
);

const FullWidthPostCard = ({ blog }: { blog: Blog }) => (
  <div className="bg-white rounded-lg shadow-lg overflow-hidden md:grid md:grid-cols-2 md:items-center">
    <div className="relative w-full aspect-[4/3] md:aspect-auto md:h-full">
      <Image
        src={blog.image}
        alt={blog.title}
        fill
        style={{ objectFit: "contain" }}
        placeholder="blur"
      />
    </div>
    <div className="p-8 md:p-12">
      <h3 className="mt-2 text-2xl sm:text-3xl font-bold text-gray-900">
        {blog.title}
      </h3>
      <p className="mt-4 text-gray-600">{blog.description}</p>
      <Link
        href={blog.href}
        className="mt-6 inline-flex items-center gap-2 font-semibold text-black hover:underline"
      >
        Learn More <ArrowRight size={16} />
      </Link>
    </div>
  </div>
);

const StaticFeaturedSection = () => (
  <section className="py-12 sm:py-16 bg-white">
    <div className="container mx-auto px-4">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden md:grid md:grid-cols-2 md:items-center">
        <div className="relative w-full aspect-[4/3] md:aspect-auto md:h-full">
          <Image
            src={blogImage1}
            alt="Crafting quality eyewear"
            fill
            style={{ objectFit: "contain" }}
            placeholder="blur"
          />
        </div>
        <div className="p-8 md:p-12">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500">
            We&apos;ve Got You Covered
          </h2>
          <h3 className="mt-2 text-2xl sm:text-3xl font-bold text-gray-900">
            Look No Further
          </h3>
          <p className="mt-4 text-gray-600">
            Learn how to read your prescription, measure your pupillary
            distance, find the perfect frame, and finally figure out what those
            numbers on the inside of your glasses mean.
          </p>
        </div>
      </div>
    </div>
  </section>
);

const SmallBlogCard = ({ blog }: { blog: Blog }) => (
  <Link href={blog.href} className="group">
    <div className="relative w-full aspect-[16/10] rounded-lg overflow-hidden shadow-md">
      <Image
        src={blog.image}
        alt={blog.title}
        fill
        style={{ objectFit: "contain" }}
        className="transition-transform duration-300 group-hover:scale-105"
        placeholder="blur"
      />
    </div>
    <h4 className="mt-4 font-bold text-gray-800 group-hover:text-black">
      {blog.title}
    </h4>
    <div className="mt-2 text-sm font-semibold text-black group-hover:underline flex items-center">
      Learn more <ArrowRight size={14} className="ml-1" />
    </div>
  </Link>
);

const CategorySection = ({
  title,
  blogs,
  description,
  bgColor = "bg-white",
  isFirst = false,
}: {
  title: string;
  blogs: Blog[];
  description?: string;
  bgColor?: string;
  isFirst?: boolean;
}) => {
  if (blogs.length === 0) return null;

  return (
    <section
      className={`py-12 sm:py-16 ${bgColor} ${isFirst ? "" : "border-t"}`}
    >
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mb-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            {title}
          </h2>
          {description && (
            <p className="mt-4 text-lg text-gray-600">{description}</p>
          )}
        </div>
        {blogs.length === 1 ? (
          <FullWidthPostCard blog={blogs[0]} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.map((blog) => (
              <SmallBlogCard key={blog.href} blog={blog} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

// --- Main Page Component ---

const BlogArchivePage = () => {
  const [query, setQuery] = useState("");

  const fuse = useMemo(
    () =>
      new Fuse(allBlogs, {
        keys: [
          { name: "title", weight: 0.6 },
          { name: "description", weight: 0.2 },
          { name: "keywords", weight: 0.2 },
        ],
        includeScore: true,
        threshold: 0.4,
        minMatchCharLength: 2,
      }),
    []
  );

  const filteredBlogs = useMemo(() => {
    if (query.trim() === "") {
      return allBlogs;
    }
    return fuse.search(query).map((result) => result.item);
  }, [query, fuse]);

  const buyingGuides = filteredBlogs.filter(
    (b) => b.category === "Buying Guides"
  );
  const framesAndFit = filteredBlogs.filter(
    (b) => b.category === "Frames & Fit"
  );
  const lensesAndHealth = filteredBlogs.filter(
    (b) => b.category === "Lenses & Health"
  );
  const ourMission = filteredBlogs.filter((b) => b.category === "Our Mission");

  const visibleCategories = [
    {
      title: "Buying Guides",
      blogs: buyingGuides,
      description:
        "The perfect pair is waiting! All you have to do is find the frame you want and follow the prompts on the product page.",
      bgColor: "bg-white",
    },
    {
      title: "Frames & Fit",
      blogs: framesAndFit,
      description:
        "When it comes to buying frames, the most important thing is how much you love them! But there are a few tips and tricks to help you make your decision.",
      bgColor: "bg-gray-50",
    },
    {
      title: "Lenses & Health",
      blogs: lensesAndHealth,
      description:
        "Whether you're new to buying eyewear, or just want to know where to find your PD (pupillary distance), we've got a guide to help you find what you need.",
      bgColor: "bg-white",
    },
    {
      title: "Our Mission",
      blogs: ourMission,
      description:
        "Learn more about our commitment to making vision care accessible for everyone, everywhere.",
      bgColor: "bg-gray-50",
    },
  ].filter((cat) => cat.blogs.length > 0);

  return (
    <main className="bg-white">
      <HeroSection query={query} setQuery={setQuery} />

      {query === "" && <StaticFeaturedSection />}

      {visibleCategories.map((cat, index) => (
        <CategorySection
          key={cat.title}
          title={cat.title}
          description={cat.description}
          blogs={cat.blogs}
          bgColor={cat.bgColor}
          isFirst={index === 0 && query === ""}
        />
      ))}

      {filteredBlogs.length === 0 && query !== "" && (
        <div className="text-center py-20 bg-white">
          <h3 className="text-xl font-semibold">
            No results found for &quot;{query}&quot;
          </h3>
          <p className="text-gray-600 mt-2">
            Try searching for something else.
          </p>
        </div>
      )}
    </main>
  );
};

export default BlogArchivePage;
