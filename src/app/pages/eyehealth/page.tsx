// src/app/eyehealth/page.tsx
"use client";

import React from "react";
import Link from "next/link";
import { Eye, Sparkles, ArrowRight, BookOpen } from "lucide-react"; // Changed Sun to Eye, BookOpen for Learning Center

const EyehealthComingSoonPage = () => {
  return (
    <main className="min-h-[calc(100vh-150px)] flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-gray-100 text-center p-6 sm:p-8">
      <div className="max-w-md">
        <div className="mb-8 flex justify-center">
          <div className="p-4 bg-blue-500 rounded-full shadow-lg animate-pulse">
            {" "}
            {/* Changed color */}
            <Eye size={48} className="text-white" />
          </div>
        </div>

        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900">
          Your Eye Health Hub is Coming Soon!
        </h1>
        <p className="mt-4 text-lg sm:text-xl text-gray-600">
          We&apos;re preparing a dedicated space with valuable insights and tips
          for maintaining optimal eye health. Stay tuned!
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
            href="/pages/contact-lenses"
            className="w-full sm:w-auto flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-150 ease-in-out shadow-md"
          >
            Shop Contact Lenses
          </Link>
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500">
            Want to be the first to know when it launches?
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
          <span className="text-xs">
            Valuable eye care information is on its way.
          </span>
          <Sparkles size={16} />
        </div>
      </div>
    </main>
  );
};

export default EyehealthComingSoonPage;
