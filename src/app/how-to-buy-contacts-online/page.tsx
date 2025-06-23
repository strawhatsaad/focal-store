// src/app/how-to-buy-contacts-online/page.tsx
"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Search,
  CheckSquare,
  ShoppingCart,
  LogIn,
  Eye,
  ArrowRight,
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
      <div className="w-px h-16 bg-gray-300 mt-2"></div>
    </div>
    <div className="flex-1">
      <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
      <p className="mt-1 text-gray-600">{description}</p>
      {children && <div className="mt-4">{children}</div>}
    </div>
  </div>
);

const HowToBuyContactsPage = () => {
  return (
    <main className="min-h-screen bg-slate-50 py-12 sm:py-16">
      <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <header className="mb-12 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-gray-900">
            How to Buy Contact Lenses Online
          </h1>
          <p className="mt-3 text-base sm:text-lg text-gray-600">
            A simple, step-by-step guide to ordering your contacts from Focal.
          </p>
        </header>

        <div className="space-y-4">
          <StepCard
            step="1"
            title="Find Your Brand"
            description="Start by finding the exact brand of contact lenses your eye doctor prescribed. You can use the search bar or browse our 'Contact Lenses' page. It's important to stick to your prescribed brand for the best fit and vision."
          >
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/pages/contact-lenses"
                className="w-full sm:w-auto flex items-center justify-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800 transition-colors"
              >
                <Eye className="mr-2 h-4 w-4" /> Browse All Contacts
              </Link>
              <Link
                href="/search"
                className="w-full sm:w-auto flex items-center justify-center px-5 py-2.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <Search className="mr-2 h-4 w-4" /> Search for Your Brand
              </Link>
            </div>
          </StepCard>

          <StepCard
            step="2"
            title="Enter Your Prescription"
            description="Once you're on the product page, select your quantity and click 'Enter Prescription & Add to Cart'. A pop-up will appear where you can enter the specific values for each eye (OD for right, OS for left) from your prescription."
          >
            <div className="p-4 bg-gray-50 border rounded-lg">
              <p className="text-sm font-medium text-gray-800">
                You will need these values:
              </p>
              <ul className="mt-2 text-xs text-gray-600 list-disc list-inside space-y-1">
                <li>
                  <strong>Power/Sphere (SPH/PWR):</strong> Your main vision
                  correction.
                </li>
                <li>
                  <strong>Base Curve (BC):</strong> The curvature of the lens.
                </li>
                <li>
                  <strong>Diameter (DIA):</strong> The width of the lens.
                </li>
                <li>
                  <strong>Astigmatism?</strong> You&apos;ll also need Cylinder
                  (CYL) and Axis values.
                </li>
                <li>
                  <strong>Multifocal?</strong> You&apos;ll also need an ADD
                  Power value.
                </li>
              </ul>
              <Link
                href="/how-to-read-prescriptions"
                className="text-xs text-blue-600 hover:underline mt-3 inline-block"
              >
                Learn how to read your prescription{" "}
                <ArrowRight className="inline h-3 w-3" />
              </Link>
            </div>
          </StepCard>

          <StepCard
            step="3"
            title="Verify Your Prescription"
            description="After entering your parameters, you'll need to verify your prescription. You have three easy options:"
          >
            <ul className="mt-2 text-sm text-gray-600 list-disc list-inside space-y-2">
              <li>
                <strong>Upload a photo/scan:</strong> The fastest way to get
                your order processed.
              </li>
              <li>
                <strong>Use a saved prescription:</strong> If you&apos;ve
                ordered with us before, select a saved Rx from your account.
              </li>
              <li>
                <strong>Add it later:</strong> We&apos;ll remind you to add your
                prescription details before we can ship your order.
              </li>
            </ul>
          </StepCard>

          <StepCard
            step="4"
            title="Checkout & Relax"
            description="Once your items are in the cart, proceed to our secure checkout. You'll need an account to complete your purchase. If you're a first-time customer, your 20% discount will be applied automatically! We'll verify your prescription with your doctor's office and ship your contacts right to your door."
          >
            <div className="p-4 bg-green-50 border-l-4 border-green-400 rounded-r-lg">
              <h4 className="font-semibold text-green-800">
                You&apos;re Making a Difference!
              </h4>
              <p className="text-sm text-green-700 mt-1">
                Remember, every purchase helps fund sight-restoring surgeries
                for those in need through our partnership with the Cure
                Blindness Foundation.
              </p>
            </div>
          </StepCard>
        </div>
      </div>
    </main>
  );
};

export default HowToBuyContactsPage;
