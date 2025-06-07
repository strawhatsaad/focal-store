// src/app/sunglasses/page.tsx
"use client"; // This page can be a client component if you add interactive elements like a newsletter signup

import React from "react";
import Link from "next/link";
import { Sun, Sparkles, ArrowRight } from "lucide-react"; // Example icons

const SunglassesComingSoonPage = () => {
  return (
    <main className="min-h-[calc(100vh-150px)] flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-gray-100 text-center p-6 sm:p-8">
      <div className="max-w-md">
        <div className="mb-8 flex justify-center">
          <div className="p-4 bg-yellow-400 rounded-full shadow-lg animate-pulse">
            <Sun size={48} className="text-white" />
          </div>
        </div>

        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900">
          Shades Are on Their Way!
        </h1>
        <p className="mt-4 text-lg sm:text-xl text-gray-600">
          Our new Sunglasses Collection is launching soon. Get ready to find
          your perfect pair!
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/"
            className="w-full sm:w-auto flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-black hover:bg-gray-800 transition-colors duration-150 ease-in-out shadow-md"
          >
            Go Back to Homepage
            <ArrowRight size={20} className="ml-2" />
          </Link>
          <Link
            href="/pages/contact-lenses" // Link to your contact lenses collection
            className="w-full sm:w-auto flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-150 ease-in-out shadow-md"
          >
            Shop Contact Lenses
          </Link>
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500">
            Want to be the first to know?
            {/* You can add a newsletter sign-up link or component here later */}
            <Link
              href="/"
              className="font-medium text-black hover:underline ml-1"
            >
              Follow us for updates!
            </Link>
          </p>
        </div>

        <div className="mt-10 flex justify-center items-center space-x-2 text-gray-400">
          <Sparkles size={16} />
          <span className="text-xs">Exciting styles arriving soon</span>
          <Sparkles size={16} />
        </div>
      </div>
    </main>
  );
};

export default SunglassesComingSoonPage;
