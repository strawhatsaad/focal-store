// src/app/how-to-buy-eyeglasses-online/page.tsx
"use client";

import React from "react";
import Link from "next/link";
import {
  Frame,
  Wand2,
  FileText,
  ShoppingCart,
  CheckCircle,
  Eye,
  ArrowRight,
  Ruler,
  Glasses,
} from "lucide-react";

const StepCard = ({
  step,
  title,
  description,
  children,
}: {
  step: string;
  title: string;
  description: string;
  children?: React.ReactNode;
}) => (
  <div className="flex items-start">
    <div className="flex-shrink-0 flex flex-col items-center mr-4">
      <div className="flex items-center justify-center w-10 h-10 bg-black text-white rounded-full font-bold">
        {step}
      </div>
      <div className="w-px h-full min-h-16 bg-gray-300 mt-2"></div>
    </div>
    <div className="flex-1 pb-12">
      <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
      <p className="mt-1 text-gray-600">{description}</p>
      {children && <div className="mt-4">{children}</div>}
    </div>
  </div>
);

const HowToBuyEyeglassesPage = () => {
  return (
    <main className="min-h-screen bg-slate-50 py-12 sm:py-16">
      <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <header className="mb-12 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-gray-900">
            How to Buy Eyeglasses Online
          </h1>
          <p className="mt-3 text-base sm:text-lg text-gray-600">
            Your simple guide to ordering the perfect pair of glasses from
            Focal.
          </p>
        </header>

        <div className="space-y-0">
          <StepCard
            step="1"
            title="Find Your Perfect Frame"
            description="Your journey starts with finding a frame that fits your style. Browse our curated collection of high-quality eyeglasses. Use the filters to narrow down your search by shape, material, color, and more."
          >
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/eyewear"
                className="w-full sm:w-auto flex items-center justify-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800 transition-colors"
              >
                <Glasses className="mr-2 h-4 w-4" /> Browse Eyeglasses
              </Link>
            </div>
          </StepCard>

          <StepCard
            step="2"
            title="Customize Your Lenses"
            description="Once you've picked a frame, click 'Customize Lenses & Enter Rx'. Our lens customizer will pop up, allowing you to tailor your lenses to your needs."
          >
            <div className="p-4 bg-gray-50 border rounded-lg">
              <p className="text-sm font-medium text-gray-800">
                You can choose:
              </p>
              <ul className="mt-2 text-xs text-gray-600 list-disc list-inside space-y-1">
                <li>
                  <strong>Prescription Type:</strong> Single-vision,
                  progressives, readers, or non-prescription.
                </li>
                <li>
                  <strong>Lens Type:</strong> Classic, blue-light filtering, or
                  light-responsive (transitions).
                </li>
                <li>
                  <strong>Lens Material:</strong> Choose from standard or
                  thinner high-index lenses, ideal for stronger prescriptions.
                </li>
              </ul>
            </div>
          </StepCard>

          <StepCard
            step="3"
            title="Provide Your Prescription"
            description="After customizing your lenses, the next step is to provide your prescription. You have three convenient options:"
          >
            <ul className="mt-2 text-sm text-gray-600 list-disc list-inside space-y-2">
              <li>
                <strong>Enter Manually:</strong> Type in your prescription
                details directly.
              </li>
              <li>
                <strong>Upload a File:</strong> Upload a photo or scan of your
                prescription. This is often the quickest method.
              </li>
              <li>
                <strong>Add it Later:</strong> We&apos;ll save your order and
                you can add your prescription details later from your account.
              </li>
            </ul>
          </StepCard>

          <StepCard
            step="4"
            title="Enter Prescription & PD"
            description="If you choose manual entry, you'll need a valid prescription from your eye doctor. You'll enter values for each eye (OD & OS) and your Pupillary Distance (PD)."
          >
            <div className="p-4 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg">
              <p className="text-sm font-semibold text-blue-800 mb-2">
                Don&apos;t have your PD?
              </p>
              <p className="text-xs text-blue-700 mb-3">
                Pupillary Distance is crucial for centering your lenses
                correctly. You can easily measure it at home.
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <Link
                  href="/how-to-read-prescriptions"
                  className="text-xs text-blue-600 hover:underline inline-flex items-center"
                >
                  <ArrowRight className="inline h-3 w-3 mr-1" /> How to Read
                  Your Rx
                </Link>
                <Link
                  href="/how-to-measure-pd"
                  className="text-xs text-blue-600 hover:underline inline-flex items-center"
                >
                  <Ruler className="inline h-3 w-3 mr-1" /> How to Measure Your
                  PD
                </Link>
              </div>
            </div>
          </StepCard>

          <StepCard
            step="5"
            title="Review & Add to Cart"
            description="Finally, confirm all your details are correct—your frame, lens choices, and prescription. Once everything looks good, click 'Add to Cart'."
          />

          <StepCard
            step="6"
            title="Checkout & See the Difference"
            description="Proceed to our secure checkout to complete your order. You'll need an account with us. If it's your first time, a 20% discount will be automatically applied! We'll take care of the rest, crafting your perfect glasses and shipping them to you."
          >
            <div className="p-4 bg-green-50 border-l-4 border-green-400 rounded-r-lg">
              <h4 className="font-semibold text-green-800">
                A Purchase with a Purpose
              </h4>
              <p className="text-sm text-green-700 mt-1">
                Every pair of glasses you buy helps fund a sight-restoring
                cataract surgery for someone in need through the Cure Blindness
                Foundation.
              </p>
            </div>
          </StepCard>
        </div>
      </div>
    </main>
  );
};

export default HowToBuyEyeglassesPage;
