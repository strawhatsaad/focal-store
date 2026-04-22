"use client";

import React, { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import type { LensCustomizationData } from "../EyeglassesModal";
import { Heart, X } from "lucide-react";

const EyeglassesModal = dynamic(() => import("../EyeglassesModal"), {
  ssr: false,
});
const EyeglassesPrescriptionModal = dynamic(
  () => import("@/components/EyeglassesPrescriptionModal"),
  { ssr: false }
);

const EyewearHero = ({ product }: any) => {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [isEyeglassesLensModalOpen, setIsEyeglassesLensModalOpen] =
    useState(false);
  const [isEyeglassesRxModalOpen, setIsEyeglassesRxModalOpen] = useState(false);
  const [isAuthPromptOpen, setIsAuthPromptOpen] = useState(false);
  const [currentLensCustomizations, setCurrentLensCustomizations] =
    useState<LensCustomizationData | null>(null);
  const [activeImageSrc, setActiveImageSrc] = useState<string>("");

  useEffect(() => {
    if (product?.variants?.length > 0) {
      const searchParams = new URLSearchParams(window.location.search);
      const colorParam = searchParams.get("color");

      let initialVariant = product.variants[0];
      if (colorParam) {
        const found = product.variants.find(
          (v: any) =>
            v.name.toLowerCase() === colorParam.toLowerCase() ||
            v.title.toLowerCase() === colorParam.toLowerCase(),
        );
        if (found) initialVariant = found;
      }
      setSelectedVariant(initialVariant);
    } else {
      setSelectedVariant(null);
    }
  }, [product]);

  const allImages = useMemo(() => {
    let imgs = [...(product?.images || [])];
    if (selectedVariant?.imageSrc) {
      const variantImageIndex = imgs.findIndex(
        (img) => img.src === selectedVariant.imageSrc,
      );
      if (variantImageIndex > -1) {
        const [vImg] = imgs.splice(variantImageIndex, 1);
        imgs.unshift(vImg);
      } else {
        imgs.unshift({
          src: selectedVariant.imageSrc,
          alt:
            selectedVariant.imageAlt || selectedVariant.name || "Product Image",
          id: "variant-img",
        });
      }
    }
    return imgs;
  }, [product?.images, selectedVariant]);

  useEffect(() => {
    if (allImages.length > 0) {
      setActiveImageSrc(allImages[0].src);
    }
  }, [allImages]);

  const handleSelectLenses = () => {
    setIsEyeglassesLensModalOpen(true);
  };

  const handleLensCustomizationComplete = (
    customizations: LensCustomizationData,
  ) => {
    setCurrentLensCustomizations(customizations);
    setIsEyeglassesLensModalOpen(false);

    if (!session) {
      setIsAuthPromptOpen(true);
    } else {
      setIsEyeglassesRxModalOpen(true);
    }
  };

  const handleAuthRedirect = () => {
    if (currentLensCustomizations && selectedVariant) {
      sessionStorage.setItem("focal_pending_rx_flow", "true");
      sessionStorage.setItem(
        "focal_pending_lenses",
        JSON.stringify(currentLensCustomizations),
      );
      sessionStorage.setItem(
        "focal_pending_variant_id",
        String(selectedVariant.id),
      );
    }
    const currentPath = window.location.pathname + window.location.search;
    router.push(`/auth/signin?callbackUrl=${encodeURIComponent(currentPath)}`);
  };

  // Recover state after login redirect
  useEffect(() => {
    if (status === "authenticated" && selectedVariant) {
      const isPendingFlow = sessionStorage.getItem("focal_pending_rx_flow");
      const pendingVariantId = sessionStorage.getItem(
        "focal_pending_variant_id",
      );
      const pendingLenses = sessionStorage.getItem("focal_pending_lenses");

      if (
        isPendingFlow === "true" &&
        pendingVariantId === String(selectedVariant.id) &&
        pendingLenses
      ) {
        try {
          const parsedLenses = JSON.parse(pendingLenses);
          setCurrentLensCustomizations(parsedLenses);
          setIsEyeglassesRxModalOpen(true);
        } catch (e) {
          console.error("Failed to parse pending lenses", e);
        } finally {
          sessionStorage.removeItem("focal_pending_rx_flow");
          sessionStorage.removeItem("focal_pending_lenses");
          sessionStorage.removeItem("focal_pending_variant_id");
        }
      }
    }
  }, [status, selectedVariant]);

  const displayedVariantName =
    selectedVariant?.name || selectedVariant?.title || "N/A";
  const displayedPrice = selectedVariant?.priceV2?.amount
    ? parseFloat(selectedVariant.priceV2.amount).toFixed(2)
    : String(selectedVariant?.price || product?.price || "0").replace("$", "");

  return (
    <div className="w-full bg-white relative min-h-screen pb-24">
      <div className="w-full max-w-[1600px] mx-auto pt-6 px-4 md:px-8 flex flex-col lg:flex-row gap-8 lg:gap-12 relative items-start">
        {/* Left Side: Main Column (Images + Info) */}
        <div className="w-full lg:flex-1 flex flex-col gap-12">
          {/* Image Gallery */}
          <div className="w-full flex flex-col-reverse md:flex-row gap-4 h-[auto]">
            {/* Thumbnails */}
            <div className="flex md:flex-col gap-3 overflow-auto hide-scrollbar md:w-[84px] shrink-0">
              {allImages.map((img: any, idx: number) => (
                <button
                  key={img.id || idx}
                  onClick={() => setActiveImageSrc(img.src)}
                  className={`w-20 md:w-full aspect-[4/3] md:aspect-[5/4] bg-[#f4f5f5] shrink-0 relative rounded-lg overflow-hidden transition-colors box-border ${
                    activeImageSrc === img.src
                      ? "ring-2 ring-[#1451cc] ring-inset"
                      : "ring-1 ring-gray-200 hover:ring-gray-400"
                  }`}
                >
                  <Image
                    src={img.src}
                    alt={img.alt || "Thumbnail"}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>

            {/* Main Image */}
            <div className="flex-1 relative bg-[#f4f5f5] rounded-xl flex items-center justify-center overflow-hidden min-h-[400px] md:min-h-[500px]">
              {activeImageSrc && (
                <Image
                  src={activeImageSrc}
                  alt={product?.name || "Main Image"}
                  fill
                  className="object-contain object-center scale-105 transition-transform duration-500"
                  priority
                  sizes="(max-width: 1024px) 100vw, 70vw"
                />
              )}
              {/* Try on Button (static UI matching WP) */}
              <button className="absolute top-4 right-4 bg-white text-gray-900 border border-gray-300 px-5 py-2.5 rounded-full text-sm font-medium hover:bg-gray-50 transition-colors flex items-center gap-2 shadow-sm">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 3v4M3 5h4M6 17v4M4 19h4M13 3h8v8M13 13h8v8M18 3v20M13 8h10" />
                </svg>
                Try on virtually
              </button>
            </div>
          </div>

          {/* Everything Included Section */}
          <div className="w-full max-w-2xl border-t border-b border-gray-200 py-8">
            <details className="group" open>
              <summary className="flex justify-between items-center font-medium cursor-pointer list-none text-[22px] text-gray-900 font-serif">
                Everything included for ${displayedPrice}
                <span className="transition-transform duration-300 group-open:rotate-180">
                  <svg
                    fill="none"
                    height="24"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    viewBox="0 0 24 24"
                    width="24"
                  >
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </span>
              </summary>
              <div className="text-gray-600 mt-4 text-[15px]">
                <p className="mb-6">
                  We also offer progressive, blue-light-filtering, and
                  anti-fatigue lenses—plus more! <br />
                  <a
                    href="#"
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    View all lens types
                  </a>
                </p>
                <ul className="space-y-6">
                  <li className="flex items-start gap-4">
                    <div className="mt-0.5 text-gray-500">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      >
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                        <path d="M6.5 2h11A2.5 2.5 0 0 1 20 4.5v15a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                      </svg>
                    </div>
                    <div>
                      <strong className="block text-gray-900 font-medium">
                        Single-vision prescriptions
                      </strong>
                      <span>
                        Also choose readers or non-prescription lenses
                      </span>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="mt-0.5 text-gray-500">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      >
                        <rect
                          x="2"
                          y="7"
                          width="20"
                          height="10"
                          rx="2"
                          ry="2"
                        ></rect>
                        <line x1="12" y1="7" x2="12" y2="17"></line>
                      </svg>
                    </div>
                    <div>
                      <strong className="block text-gray-900 font-medium">
                        Polycarbonate lenses
                      </strong>
                      <span>
                        The most impact-resistant lens material for glasses
                      </span>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="mt-0.5 text-gray-500">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      >
                        <circle cx="12" cy="12" r="5"></circle>
                        <line x1="12" y1="1" x2="12" y2="3"></line>
                        <line x1="12" y1="21" x2="12" y2="23"></line>
                        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                        <line
                          x1="18.36"
                          y1="18.36"
                          x2="19.78"
                          y2="19.78"
                        ></line>
                        <line x1="1" y1="12" x2="3" y2="12"></line>
                        <line x1="21" y1="12" x2="23" y2="12"></line>
                        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                      </svg>
                    </div>
                    <div>
                      <strong className="block text-gray-900 font-medium">
                        Anti-reflective and scratch-resistant lens coatings
                      </strong>
                      <span>And our lenses block 100% of UV rays</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="mt-0.5 text-gray-500">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      >
                        <rect x="1" y="3" width="15" height="13"></rect>
                        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                        <circle cx="5.5" cy="18.5" r="2.5"></circle>
                        <circle cx="18.5" cy="18.5" r="2.5"></circle>
                      </svg>
                    </div>
                    <div>
                      <strong className="block text-gray-900 font-medium">
                        Free shipping
                      </strong>
                      <span>On every single order at Warby Parker</span>
                    </div>
                  </li>
                </ul>
              </div>
            </details>
          </div>
        </div>

        {/* Right Side: Floating Product Info Card */}
        <div className="w-full lg:w-[440px] shrink-0 z-10 lg:mt-4 md:sticky md:top-[100px]">
          <div className="bg-white rounded-2xl p-8 lg:p-10 shadow-[0_8px_30px_rgba(0,0,0,0.04)] flex flex-col relative border border-gray-100">
            <div className="flex justify-between items-start mb-2">
              <h1 className="text-[34px] font-medium tracking-tight text-gray-900 leading-tight">
                {product?.name}
              </h1>
              <button className="text-gray-400 hover:text-red-500 transition-colors mt-2">
                <Heart size={26} strokeWidth={1.5} />
              </button>
            </div>

            <p className="text-xs text-gray-400 tracking-wide uppercase font-semibold mb-2">
              {product?.manufacturer || "Made in Italy"}
            </p>

            <div className="flex items-center gap-4 mb-8">
              <p className="text-lg text-gray-900">
                Starting at{" "}
                <span className="font-medium">${displayedPrice}</span>
              </p>
              <div className="flex items-center gap-1.5 text-[#1451cc] text-sm">
                <div className="flex text-lg tracking-tighter">
                  ★★★★<span className="text-gray-300">★</span>
                </div>
                <span className="underline cursor-pointer hover:text-[#0c3a99]">
                  4.4 (143)
                </span>
              </div>
            </div>

            <p className="text-[17px] italic font-serif text-gray-900 mb-4">
              {displayedVariantName}
            </p>

            {/* Color Selection */}
            {product?.variants && product.variants.length > 0 && (
              <div className="flex flex-wrap gap-3.5 mb-10">
                {product.variants.map((variant: any) => {
                  const swatch = product.colorSwatches?.find(
                    (s: any) =>
                      s.name.toLowerCase() ===
                      (variant.title || variant.name).toLowerCase(),
                  );
                  const hasMultipleColors = swatch?.hex.includes(",");
                  const bgStyle = swatch
                    ? hasMultipleColors
                      ? { background: `linear-gradient(135deg, ${swatch.hex})` }
                      : { backgroundColor: swatch.hex }
                    : { backgroundColor: "#ccc" };

                  const isSelected = selectedVariant?.id === variant.id;

                  return (
                    <button
                      key={variant.id}
                      onClick={() => {
                        setSelectedVariant(variant);
                        window.history.replaceState(
                          null,
                          "",
                          `?color=${encodeURIComponent(variant.title || variant.name)}`,
                        );
                      }}
                      className={`w-8 h-8 rounded-full transition-all border outline-none ${
                        isSelected
                          ? "ring-[1.5px] ring-[#1451cc] ring-offset-[3px] border-transparent scale-100"
                          : "border-gray-300 ring-transparent opacity-90 hover:opacity-100"
                      }`}
                      style={bgStyle}
                      title={variant.title || variant.name}
                      aria-label={`Select color ${variant.title || variant.name}`}
                    />
                  );
                })}
              </div>
            )}

            {/* Width Selection */}
            {product?.frameWidths && product.frameWidths.length > 0 && (
              <div className="mb-10">
                <h3 className="text-sm font-medium text-gray-900 mb-3">
                  Width
                </h3>
                <div className="flex flex-wrap gap-2.5">
                  {product.frameWidths.map(
                    (width: { name: string; mm: number }) => (
                      <button
                        key={width.name}
                        className="px-6 py-3 border border-gray-300 rounded-md text-sm font-medium hover:border-black transition-colors w-full sm:w-auto"
                      >
                        {width.name}
                      </button>
                    ),
                  )}
                </div>
              </div>
            )}

            <button
              onClick={handleSelectLenses}
              disabled={!selectedVariant}
              className="w-full bg-black text-white font-medium text-[17px] py-[18px] rounded-full hover:bg-gray-800 transition-colors disabled:opacity-50 mt-2 shadow-sm"
            >
              Select lenses and buy
            </button>

            <div className="mt-8 flex items-center justify-between text-[13px] text-gray-500 border-t border-gray-100 pt-8 px-2">
              <div className="flex flex-col items-center gap-2 text-center w-1/3">
                <svg
                  className="w-7 h-7 stroke-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                  />
                </svg>
                <span>Free shipping</span>
              </div>
              <div className="flex flex-col items-center gap-2 text-center w-1/3">
                <svg
                  className="w-7 h-7 stroke-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z"
                  />
                </svg>
                <span>Free returns</span>
              </div>
              <div className="flex flex-col items-center gap-2 text-center w-1/3">
                <svg
                  className="w-7 h-7 stroke-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>15% off 2+ pairs</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {isAuthPromptOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl relative">
            <button
              onClick={() => setIsAuthPromptOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 transition-colors"
            >
              <X size={20} />
            </button>
            <h2 className="text-2xl font-serif text-gray-900 mb-2 mt-2">
              Sign in required
            </h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              To securely save your prescription details and complete this
              purchase, please sign in or create an account.
            </p>
            <button
              onClick={handleAuthRedirect}
              className="w-full bg-black text-white font-medium text-lg py-4 rounded-full hover:bg-gray-800 transition-colors"
            >
              Sign in / Register
            </button>
          </div>
        </div>
      )}

      {isEyeglassesLensModalOpen && selectedVariant && (
        <EyeglassesModal
          product={product}
          selectedVariant={selectedVariant}
          isOpen={isEyeglassesLensModalOpen}
          onClose={() => setIsEyeglassesLensModalOpen(false)}
          onLensCustomizationComplete={handleLensCustomizationComplete}
        />
      )}
      {isEyeglassesRxModalOpen &&
        selectedVariant &&
        currentLensCustomizations && (
          <EyeglassesPrescriptionModal
            isOpen={isEyeglassesRxModalOpen}
            onClose={() => {
              setIsEyeglassesRxModalOpen(false);
              setCurrentLensCustomizations(null);
            }}
            product={product}
            selectedVariant={selectedVariant}
            lensCustomizations={currentLensCustomizations}
          />
        )}
    </div>
  );
};

export default EyewearHero;
