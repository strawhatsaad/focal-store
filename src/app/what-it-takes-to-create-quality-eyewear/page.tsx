// src/app/what-it-takes-to-create-quality-eyewear/page.tsx
"use client";

import React from "react";
import Image from "next/image";
import {
  Gem,
  DraftingCompass,
  Wind,
  Hand,
  Microscope,
  Shield,
  Sun,
  Hammer,
} from "lucide-react";

import qualityEyewear from "@/assets/WhatItTakesToCreateQualityEyewear/QualityEyeframes.jpg";
import polishingEyewear from "@/assets/WhatItTakesToCreateQualityEyewear/polishingEyeframe.jpg";

// --- Reusable Components for this page ---

// Component for the main features section
const QualityPillarCard = ({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) => (
  <div className="flex flex-col items-center text-center p-6 bg-gray-50 rounded-lg border border-gray-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
    <div className="flex items-center justify-center w-16 h-16 rounded-full bg-black text-white mb-4">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

// Component for individual process steps
const ProcessStep = ({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) => (
  <div className="flex items-start">
    <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-gray-200 text-black font-bold text-xl mr-6">
      {number}
    </div>
    <div>
      <h3 className="text-2xl font-semibold text-gray-900">{title}</h3>
      <p className="mt-2 text-lg text-gray-700">{text}</p>
    </div>
  </div>
);

// --- Main Page Component ---

const QualityEyewearPage = () => {
  return (
    <div className="bg-white font-sans">
      <main>
        {/* --- Hero Section --- */}
        <section className="relative bg-[#2c5b6b] text-white">
          <div className="absolute inset-0">
            <Image
              src={qualityEyewear}
              alt="Close-up of beautifully crafted eyeglasses"
              className="w-full h-full object-cover opacity-20"
              width={1920}
              height={800}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#2c5b6b]/90 via-[#2c5b6b]/50 to-transparent"></div>
          </div>
          <div className="relative container mx-auto px-4 sm:px-6 py-20 md:py-28 lg:py-40">
            <div className="max-w-3xl">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight">
                What It Takes to Create Quality Eyewear
              </h1>
              <p className="mt-6 text-xl text-gray-200">
                It’s more than just a frame and lenses. It’s a journey of
                design, precision craftsmanship, and an unwavering commitment to
                detail. Discover the art and science behind every pair of Focal
                glasses.
              </p>
            </div>
          </div>
        </section>

        {/* --- Pillars of Quality Section --- */}
        <section className="py-16 sm:py-20 lg:py-24 bg-slate-50">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#2c5b6b] tracking-tight">
                The Focal Difference: Our Pillars of Quality
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                From the first sketch to the final polish, our process is guided
                by three core principles that ensure every pair of glasses is a
                masterpiece of form and function.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <QualityPillarCard
                icon={<Gem size={32} />}
                title="Premium Materials"
                description="We source best-in-class materials like high-grade cellulose acetate and ultra-lightweight titanium to ensure your frames are durable, comfortable, and beautiful."
              />
              <QualityPillarCard
                icon={<DraftingCompass size={32} />}
                title="Purposeful Design"
                description="Our designs are born from a deep understanding of ergonomics and style. We create timeless shapes and innovative features that provide a perfect, comfortable fit."
              />
              <QualityPillarCard
                icon={<Hammer size={32} />}
                title="Meticulous Craftsmanship"
                description="Each frame undergoes a multi-stage process of cutting, hand-polishing, and assembly by skilled artisans who treat every pair as a work of art."
              />
            </div>
          </div>
        </section>

        {/* --- The Journey of a Frame Section --- */}
        <section className="py-16 sm:py-20 lg:py-24">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
              <div>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-[#2c5b6b] tracking-tight">
                  The Journey of a Frame
                </h2>
                <p className="mt-4 text-xl text-gray-800 font-semibold">
                  From Raw Material to Refined Eyewear
                </p>
                <div className="mt-8 space-y-10">
                  <ProcessStep
                    number="1"
                    title="Design & Prototyping"
                    text="Every great frame begins as an idea. Our designers sketch, model, and 3D-print dozens of prototypes, obsessing over every curve, angle, and detail to perfect the fit and feel."
                  />
                  <ProcessStep
                    number="2"
                    title="Material Selection"
                    text="We choose materials for their unique qualities. Rich, plant-based acetate for its vibrant colors and warm feel; strong, hypoallergenic titanium for its feather-light strength."
                  />
                  <ProcessStep
                    number="3"
                    title="Hand-Finishing"
                    text="Our frames are tumbled in a barrel of wood chips and then hand-polished by artisans. This meticulous process creates a uniquely smooth, glossy finish that machines simply can't replicate."
                  />
                </div>
              </div>
              <div className="mt-12 lg:mt-0">
                <Image
                  src={polishingEyewear}
                  alt="A craftsperson carefully polishing an eyeglass frame"
                  width={600}
                  height={700}
                  className="w-full h-auto rounded-lg shadow-2xl"
                />
              </div>
            </div>
          </div>
        </section>

        {/* --- The Heart of Vision: Our Lenses Section --- */}
        <section className="bg-gray-100 py-16 sm:py-20 lg:py-24">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#2c5b6b] tracking-tight">
                The Heart of Vision: Our Lenses
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                Crystal-clear vision is non-negotiable. That’s why we equip our
                frames with lenses that are as advanced as they are precise.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
              <div className="p-4">
                <Microscope className="mx-auto h-12 w-12 text-[#f68d2e]" />
                <h4 className="mt-4 text-lg font-bold">Precision Cut</h4>
                <p className="mt-1 text-gray-600">
                  Your prescription is cut into the lenses with diamond-cutting
                  technology for ultimate accuracy.
                </p>
              </div>
              <div className="p-4">
                <Sun className="mx-auto h-12 w-12 text-[#f68d2e]" />
                <h4 className="mt-4 text-lg font-bold">
                  Anti-Reflective & UV Blocking
                </h4>
                <p className="mt-1 text-gray-600">
                  Every pair comes standard with coatings to reduce glare and
                  protect your eyes from harmful UV rays.
                </p>
              </div>
              <div className="p-4">
                <Hand className="mx-auto h-12 w-12 text-[#f68d2e]" />
                <h4 className="mt-4 text-lg font-bold">Scratch-Resistant</h4>
                <p className="mt-1 text-gray-600">
                  A durable, scratch-resistant coating is included to keep your
                  vision clear and your lenses pristine.
                </p>
              </div>
              <div className="p-4">
                <Wind className="mx-auto h-12 w-12 text-[#f68d2e]" />
                <h4 className="mt-4 text-lg font-bold">
                  Feather-Light Options
                </h4>
                <p className="mt-1 text-gray-600">
                  For stronger prescriptions, we offer advanced high-index
                  lenses that are significantly thinner and lighter.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default QualityEyewearPage;
