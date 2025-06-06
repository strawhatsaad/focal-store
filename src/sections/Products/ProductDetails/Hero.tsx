// File: src/sections/Products/ProductDetails/Hero.tsx
"use client";

import React, { useRef, useState, useEffect, useMemo } from "react";
import { twMerge } from "tailwind-merge";
import ProductFeatures from "@/sections/Products/ProductDetails/ProductFeatures";
import EyeglassesModal, { LensCustomizationData } from "../EyeglassesModal";
import ContactLensPrescriptionModal, {
  ContactLensPrescriptionData,
} from "@/components/ContactLensPrescriptionModal";
import EyeglassesPrescriptionModal from "@/components/EyeglassesPrescriptionModal";
import { useCart } from "@/context/CartContext";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  ShoppingCart,
  Loader2,
  CheckCircle,
  AlertTriangle,
  HeartIcon as DonationIcon,
} from "lucide-react";

const Hero = ({ product }: any) => {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();

  const {
    addLineItem,
    loading: cartLoading,
    error: cartContextError,
    clearCartError,
  } = useCart();

  const [isProcessingPageAction, setIsProcessingPageAction] = useState(false);
  const [actionSuccess, setActionSuccess] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [hasUserManuallySelectedImage, setHasUserManuallySelectedImage] =
    useState(false);

  const [isEyeglassesLensModalOpen, setIsEyeglassesLensModalOpen] =
    useState(false);
  const [isEyeglassesRxModalOpen, setIsEyeglassesRxModalOpen] = useState(false);
  const [currentLensCustomizations, setCurrentLensCustomizations] =
    useState<LensCustomizationData | null>(null);

  const [isClModalOpen, setIsClModalOpen] = useState(false);

  const [rightEyeEnabled, setRightEyeEnabled] = useState(true);
  const [leftEyeEnabled, setLeftEyeEnabled] = useState(true);
  const [rightEyeQty, setRightEyeQty] = useState(2);
  const [leftEyeQty, setLeftEyeQty] = useState(2);
  const maxQty = 4;

  const thumbContainerRef = useRef<HTMLDivElement>(null);

  const isContactLensProduct = useMemo(() => {
    const collectionName = product?.collection?.toLowerCase() || "";
    return collectionName === "contacts";
  }, [product]);

  const isEyewearProduct = useMemo(() => {
    const collectionName = product?.collection?.toLowerCase() || "";
    return collectionName === "eyewear" && !isContactLensProduct;
  }, [product, isContactLensProduct]);

  useEffect(() => {
    if (product?.variants?.length > 0) {
      const initialVariant = product.variants[0];
      setSelectedVariant(initialVariant);
      setSelectedImage(
        initialVariant?.image?.src ||
          initialVariant?.imageSrc ||
          product.images?.[0]?.src ||
          ""
      );
    } else {
      setSelectedVariant(null);
      setSelectedImage(product?.images?.[0]?.src || "");
    }
    setHasUserManuallySelectedImage(false);
    setActionSuccess(false);
    setActionError(null);

    if (isContactLensProduct) {
      setRightEyeQty(2);
      setLeftEyeQty(2);
      setRightEyeEnabled(true);
      setLeftEyeEnabled(true);
    } else {
      setRightEyeQty(1);
      setLeftEyeQty(1);
      setRightEyeEnabled(false);
      setLeftEyeEnabled(false);
    }
  }, [product, isContactLensProduct]);

  const handlePrimaryAction = async () => {
    setActionSuccess(false);
    setActionError(null);
    if (cartContextError) clearCartError();

    if (sessionStatus === "loading") {
      setActionError("Verifying session, please wait...");
      setTimeout(() => setActionError(null), 3000);
      return;
    }

    if (!session) {
      const currentPath = window.location.pathname + window.location.search;
      router.push(
        `/auth/signin?callbackUrl=${encodeURIComponent(
          currentPath
        )}&reason=orderAttempt`
      );
      return;
    }

    if (!selectedVariant?.id) {
      setActionError("Please select a product variant or style.");
      setTimeout(() => setActionError(null), 3000);
      return;
    }

    if (isContactLensProduct) {
      if (
        (!rightEyeEnabled || rightEyeQty <= 0) &&
        (!leftEyeEnabled || leftEyeQty <= 0)
      ) {
        setActionError(
          "Please select a quantity greater than 0 for at least one eye."
        );
        setTimeout(() => setActionError(null), 3000);
        return;
      }
      if (!rightEyeEnabled && !leftEyeEnabled) {
        setActionError(
          "Please enable at least one eye for prescription entry."
        );
        setTimeout(() => setActionError(null), 3000);
        return;
      }
      setIsClModalOpen(true);
    } else if (isEyewearProduct) {
      setIsEyeglassesLensModalOpen(true);
    } else {
      setIsProcessingPageAction(true);
      const success = await addLineItem(selectedVariant.id, 1, [
        { key: "Product Type", value: product?.product_type || "General" },
      ]);
      if (success) {
        setActionSuccess(true);
        router.push("/cart");
      } else {
        setActionError(cartContextError || "Failed to add item to cart.");
        setTimeout(() => setActionError(null), 4000);
      }
      setIsProcessingPageAction(false);
    }
  };

  const handleLensCustomizationComplete = (
    customizations: LensCustomizationData
  ) => {
    setCurrentLensCustomizations(customizations);
    setIsEyeglassesLensModalOpen(false);
    setIsEyeglassesRxModalOpen(true);
  };
  
  const handleClPrescriptionComplete = async (
    prescriptionData: ContactLensPrescriptionData
  ) => {
    setIsClModalOpen(false);
    setIsProcessingPageAction(true);
    setActionSuccess(false);
    setActionError(null);

    let finalPrescriptionReference =
      prescriptionData.prescriptionReferenceValue;

    if (
      prescriptionData.prescriptionReferenceType === "new" &&
      prescriptionData.uploadedFile
    ) {
      const formData = new FormData();
      formData.append("prescriptionFile", prescriptionData.uploadedFile);
      formData.append("label", prescriptionData.prescriptionReferenceValue);
      formData.append("category", "ContactLenses");

      try {
        const uploadRes = await fetch("/api/account/prescriptions", {
          method: "POST",
          body: formData,
        });
        const uploadResult = await uploadRes.json();
        if (!uploadRes.ok)
          throw new Error(
            uploadResult.message ||
              "Failed to upload new prescription from modal."
          );
        finalPrescriptionReference =
          uploadResult.prescription?.storageUrlOrId ||
          `Uploaded: ${
            uploadResult.prescription?.fileName ||
            prescriptionData.uploadedFile.name
          }`;
      } catch (e: any) {
        setActionError(`Prescription Upload Error: ${e.message}`);
        setIsProcessingPageAction(false);
        return;
      }
    } else if (prescriptionData.prescriptionReferenceType === "existing") {
      finalPrescriptionReference = prescriptionData.prescriptionReferenceValue;
    } else if (prescriptionData.prescriptionReferenceType === "later") {
      finalPrescriptionReference = "Will Provide Later";
    }

    const totalQuantity =
      (rightEyeEnabled ? rightEyeQty : 0) + (leftEyeEnabled ? leftEyeQty : 0);
    if (totalQuantity === 0) {
      setActionError("No quantity selected for either eye.");
      setIsProcessingPageAction(false);
      return;
    }

    const combinedAttributes = [
      { key: "Product", value: `${product.name} - ${selectedVariant.name}` },
      { key: "Prescription Ref", value: finalPrescriptionReference },
      { key: "FocalProductType", value: "ContactLenses" },
    ];

    if (rightEyeEnabled && rightEyeQty > 0) {
      combinedAttributes.push({
        key: "Right Eye (OD)",
        value: `${rightEyeQty} boxe(s)`,
      });
      combinedAttributes.push({
        key: "OD SPH",
        value: prescriptionData.odValues.sph || "N/A",
      });
      combinedAttributes.push({
        key: "OD BC",
        value: prescriptionData.odValues.bc || "N/A",
      });
      combinedAttributes.push({
        key: "OD DIA",
        value: prescriptionData.odValues.dia || "N/A",
      });
      if (
        prescriptionData.odValues.cyl &&
        prescriptionData.odValues.cyl !== "0.00"
      ) {
        combinedAttributes.push({
          key: "OD CYL",
          value: prescriptionData.odValues.cyl,
        });
        if (prescriptionData.odValues.axis) {
          combinedAttributes.push({
            key: "OD Axis",
            value: prescriptionData.odValues.axis,
          });
        }
      }
      if (prescriptionData.odValues.add) {
        combinedAttributes.push({
          key: "OD ADD",
          value: prescriptionData.odValues.add,
        });
      }
    }

    if (leftEyeEnabled && leftEyeQty > 0) {
      combinedAttributes.push({
        key: "Left Eye (OS)",
        value: `${leftEyeQty} boxe(s)`,
      });
      combinedAttributes.push({
        key: "OS SPH",
        value: prescriptionData.osValues.sph || "N/A",
      });
      combinedAttributes.push({
        key: "OS BC",
        value: prescriptionData.osValues.bc || "N/A",
      });
      combinedAttributes.push({
        key: "OS DIA",
        value: prescriptionData.osValues.dia || "N/A",
      });
      if (
        prescriptionData.osValues.cyl &&
        prescriptionData.osValues.cyl !== "0.00"
      ) {
        combinedAttributes.push({
          key: "OS CYL",
          value: prescriptionData.osValues.cyl,
        });
        if (prescriptionData.osValues.axis) {
          combinedAttributes.push({
            key: "OS Axis",
            value: prescriptionData.osValues.axis,
          });
        }
      }
      if (prescriptionData.osValues.add) {
        combinedAttributes.push({
          key: "OS ADD",
          value: prescriptionData.osValues.add,
        });
      }
    }

    try {
      const success = await addLineItem(
        selectedVariant.id,
        totalQuantity,
        combinedAttributes
      );

      if (success) {
        setActionSuccess(true);
        router.push("/cart");
      } else {
        setActionError(
          cartContextError || "The contact lens item could not be added."
        );
        setTimeout(() => setActionError(null), 5000);
      }
    } catch (e: any) {
      setActionError(
        e.message || "An error occurred while adding items to cart."
      );
      setTimeout(() => setActionError(null), 4000);
    } finally {
      setIsProcessingPageAction(false);
    }
  };

  const handleThumbnailClick = (src: string) => {
    setSelectedImage(src);
    setHasUserManuallySelectedImage(true);
  };

  const handleFrameVariantClick = (variant: any) => {
    setSelectedVariant(variant);
    const newImageSrc =
      variant?.image?.src ||
      variant?.imageSrc ||
      product?.images?.[0]?.src ||
      "";
    setSelectedImage(newImageSrc);
    setHasUserManuallySelectedImage(false);
  };

  const scrollThumbnails = (direction: "left" | "right") => {
    if (!thumbContainerRef.current) return;
    const scrollAmount = thumbContainerRef.current.clientWidth / 2;
    thumbContainerRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  const getDisplayedImage = () => {
    return (
      selectedImage ||
      product?.images?.[0]?.src ||
      "https://placehold.co/400x400/F7F4EE/333333?text=No+Image"
    );
  };

  const isScrollLeftDisabled =
    !thumbContainerRef.current || thumbContainerRef.current.scrollLeft === 0;
  const isScrollRightDisabled =
    !thumbContainerRef.current ||
    thumbContainerRef.current.scrollLeft +
      thumbContainerRef.current.offsetWidth >=
      thumbContainerRef.current.scrollWidth - 5;

  const showFrameVariants = isEyewearProduct && product?.variants?.length > 1;
  const showContactLensVariantSection =
    isContactLensProduct && product?.variants?.length > 0;

  const displayedVariantName =
    selectedVariant?.name || selectedVariant?.title || "N/A";
  const displayedPrice = selectedVariant?.priceV2?.amount
    ? `$${parseFloat(selectedVariant.priceV2.amount).toFixed(2)}`
    : selectedVariant?.price || product?.price || "$0.00";

  let donationSpecifics = "";
  if (isContactLensProduct) {
    donationSpecifics =
      "When you buy four boxes of contact lenses, we donate an additional cataract lens on your behalf!";
  } else if (isEyewearProduct) {
    donationSpecifics =
      "When you buy a pair of eyeglasses, we donate an additional cataract lens on your behalf!";
  }

  return (
    <section className="py-8 bg-white md:py-16 antialiased">
      <div className="max-w-screen-xl px-4 mx-auto 2xl:px-0 container">
        <div className="lg:grid lg:grid-cols-2 lg:gap-8 xl:gap-16">
          <div className="shrink-0 max-w-md lg:max-w-lg mx-auto">
            <div className="w-full h-[300px] md:h-[400px] flex justify-center items-center bg-transparent overflow-hidden border border-gray-200 rounded-lg p-2">
              <img
                src={getDisplayedImage()}
                alt={
                  displayedVariantName === "N/A"
                    ? product?.name || "Product Image"
                    : displayedVariantName
                }
                width={400}
                height={400}
                className="object-contain max-w-full max-h-full"
                key={selectedImage}
                onError={(e) => {
                  (e.target as HTMLImageElement).onerror = null;
                  (e.target as HTMLImageElement).src =
                    "https://placehold.co/400x400/e2e8f0/4a5568?text=Image+Error";
                }}
              />
            </div>
            {product?.images && product.images.length > 1 && (
              <div className="relative mt-4">
                <button
                  onClick={() => scrollThumbnails("left")}
                  disabled={isScrollLeftDisabled}
                  className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white/80 hover:bg-white shadow p-2 rounded-full disabled:opacity-50"
                >
                  {" "}
                  ←{" "}
                </button>
                <div
                  ref={thumbContainerRef}
                  className="flex overflow-x-auto gap-2 px-10 scrollbar-hide py-1"
                >
                  {product.images.map((img: any, index: number) => (
                    <div
                      key={img.id || `thumb-${index}`}
                      className="flex-shrink-0 w-20 h-20 md:w-24 md:h-24 cursor-pointer"
                      onClick={() => handleThumbnailClick(img.src)}
                    >
                      <img
                        src={
                          img.src ||
                          "https://placehold.co/96x96/e2e8f0/4a5568?text=N/A"
                        }
                        alt={img.altText || `Thumbnail ${index + 1}`}
                        width={96}
                        height={96}
                        className={`w-full h-full object-contain rounded border transition-all duration-200 ${
                          selectedImage === img.src &&
                          hasUserManuallySelectedImage
                            ? "border-black ring-2 ring-black"
                            : "border-gray-300 hover:border-gray-500"
                        }`}
                        onError={(e) => {
                          (e.target as HTMLImageElement).onerror = null;
                          (e.target as HTMLImageElement).src =
                            "https://placehold.co/96x96/e2e8f0/4a5568?text=Error";
                        }}
                      />
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => scrollThumbnails("right")}
                  disabled={isScrollRightDisabled}
                  className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white/80 hover:bg-white shadow p-2 rounded-full disabled:opacity-50"
                >
                  {" "}
                  →{" "}
                </button>
              </div>
            )}
            <div className="hidden lg:block mt-8">
              <ProductFeatures
                product={product}
                selectedVariant={displayedVariantName}
              />
            </div>
          </div>

          <div className="relative">
            <div
              className={twMerge(
                "lg:sticky",
                showFrameVariants ? "lg:top-32" : "lg:top-28"
              )}
            >
              <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800 mt-6 sm:mt-8 lg:mt-0">
                {product?.name}
              </h1>
              <p className="mt-2 text-2xl sm:text-3xl font-extrabold text-black">
                {displayedPrice}
              </p>

              {showFrameVariants && product?.variants && (
                <div className="mt-6 mb-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">
                    {" "}
                    Style:{" "}
                    <span className="font-semibold">
                      {displayedVariantName}
                    </span>{" "}
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 md:gap-3">
                    {product.variants.map((variant: any, index: number) => (
                      <button
                        key={variant.id || `variant-${index}`}
                        onClick={() => handleFrameVariantClick(variant)}
                        title={variant.name || variant.title || "Variant"}
                        className={twMerge(
                          "w-full py-2.5 px-3 text-xs sm:text-sm font-medium border rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 text-center truncate",
                          selectedVariant?.id === variant.id
                            ? "bg-black text-white border-black ring-black"
                            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400 ring-transparent"
                        )}
                      >
                        {" "}
                        {variant.name ||
                          variant.title ||
                          `Variant ${index + 1}`}{" "}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {showContactLensVariantSection && product?.variants && (
                <div className="mt-5">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">
                    {" "}
                    Pack Size:{" "}
                    <span className="font-semibold">
                      {" "}
                      {selectedVariant?.name || selectedVariant?.title
                        ? `${selectedVariant.name || selectedVariant.title}`
                        : "N/A"}{" "}
                    </span>{" "}
                  </h3>
                  {product.variants.length > 1 && (
                    <div className="flex flex-wrap gap-2">
                      {product.variants.map((variant: any, index: number) => (
                        <button
                          key={variant.id || `cl-variant-${index}`}
                          onClick={() => handleFrameVariantClick(variant)}
                          className={twMerge(
                            "py-2.5 px-5 text-sm font-medium border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1",
                            selectedVariant?.id === variant.id
                              ? "bg-black text-white border-black ring-black"
                              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400 ring-transparent"
                          )}
                        >
                          {" "}
                          {variant.name ||
                            variant.title ||
                            `Variant ${index + 1}`}{" "}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {isContactLensProduct && (
                <div className="mt-6 space-y-3">
                  <h3 className="text-sm font-medium text-gray-900">
                    {" "}
                    Select quantity (boxes per eye):{" "}
                  </h3>
                  {["Right eye (OD)", "Left eye (OS)"].map((label, idx) => (
                    <div
                      key={label}
                      className="flex items-center justify-between border rounded-lg px-4 py-3 bg-gray-50/50"
                    >
                      <label className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={idx === 0 ? rightEyeEnabled : leftEyeEnabled}
                          onChange={(e) =>
                            idx === 0
                              ? setRightEyeEnabled(e.target.checked)
                              : setLeftEyeEnabled(e.target.checked)
                          }
                          className="form-checkbox h-4 w-4 text-black border-gray-300 rounded focus:ring-black"
                        />
                        <span className="text-sm text-gray-700">{label}</span>
                      </label>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() =>
                            idx === 0
                              ? setRightEyeQty((prev) => Math.max(1, prev - 1))
                              : setLeftEyeQty((prev) => Math.max(1, prev - 1))
                          }
                          disabled={
                            (idx === 0 &&
                              (!rightEyeEnabled || rightEyeQty <= 1)) ||
                            (idx === 1 && (!leftEyeEnabled || leftEyeQty <= 1))
                          }
                          className="w-7 h-7 flex items-center justify-center border border-gray-300 rounded bg-white hover:bg-gray-100 disabled:opacity-50"
                        >
                          {" "}
                          −{" "}
                        </button>
                        <span className="w-8 text-center text-sm font-medium text-gray-800">
                          {" "}
                          {idx === 0 ? rightEyeQty : leftEyeQty}{" "}
                        </span>
                        <button
                          onClick={() =>
                            idx === 0
                              ? setRightEyeQty((prev) =>
                                  Math.min(maxQty, prev + 1)
                                )
                              : setLeftEyeQty((prev) =>
                                  Math.min(maxQty, prev + 1)
                                )
                          }
                          disabled={
                            (idx === 0 &&
                              (!rightEyeEnabled || rightEyeQty >= maxQty)) ||
                            (idx === 1 &&
                              (!leftEyeEnabled || leftEyeQty >= maxQty))
                          }
                          className="w-7 h-7 flex items-center justify-center border border-gray-300 rounded bg-white hover:bg-gray-100 disabled:opacity-50"
                        >
                          {" "}
                          +{" "}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
                <DonationIcon className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="text-sm text-blue-700">
                  With every purchase at Focal, we donate to CureBlindness.org.
                  {donationSpecifics && (
                    <span className="block mt-1">{donationSpecifics}</span>
                  )}
                </p>
              </div>

              <div className="mt-8">
                <button
                  onClick={handlePrimaryAction}
                  disabled={
                    isProcessingPageAction ||
                    cartLoading ||
                    !selectedVariant ||
                    sessionStatus === "loading"
                  }
                  className="w-full flex items-center justify-center gap-2 px-5 py-3.5 text-sm font-semibold text-white bg-black rounded-lg shadow-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-150 ease-in-out"
                >
                  {isProcessingPageAction ||
                  cartLoading ||
                  sessionStatus === "loading" ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <ShoppingCart className="w-5 w-5" />
                  )}
                  {isContactLensProduct
                    ? "Enter Prescription & Add to Cart"
                    : isEyewearProduct
                    ? "Customize Lenses & Enter Rx"
                    : "Add to Cart"}
                </button>
              </div>
              {actionSuccess && (
                <p className="mt-3 text-sm text-green-600 font-medium flex items-center">
                  {" "}
                  <CheckCircle size={16} className="mr-1" /> Item(s) added to
                  cart!{" "}
                </p>
              )}
              {actionError && (
                <p className="mt-3 text-sm text-red-600 font-medium flex items-center">
                  {" "}
                  <AlertTriangle size={16} className="mr-1" /> {actionError}{" "}
                </p>
              )}
              {cartContextError && !actionError && (
                <p className="mt-3 text-sm text-red-600 font-medium flex items-center">
                  {" "}
                  <AlertTriangle size={16} className="mr-1" /> Cart Error:{" "}
                  {cartContextError}{" "}
                </p>
              )}
            </div>
          </div>
        </div>

        {isEyeglassesLensModalOpen &&
          isEyewearProduct &&
          selectedVariant &&
          product && (
            <EyeglassesModal
              product={product}
              selectedVariant={selectedVariant}
              isOpen={isEyeglassesLensModalOpen}
              onClose={() => setIsEyeglassesLensModalOpen(false)}
              onLensCustomizationComplete={handleLensCustomizationComplete}
            />
          )}
        {isEyeglassesRxModalOpen &&
          isEyewearProduct &&
          selectedVariant &&
          product &&
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
        {isClModalOpen &&
          isContactLensProduct &&
          selectedVariant &&
          product && (
            <ContactLensPrescriptionModal
              product={product}
              selectedVariant={selectedVariant}
              isOpen={isClModalOpen}
              onClose={() => {
                setIsClModalOpen(false);
                setIsProcessingPageAction(false);
              }}
              onComplete={handleClPrescriptionComplete}
            />
          )}

        <div className="lg:hidden mt-8">
          <ProductFeatures
            product={product}
            selectedVariant={selectedVariant?.name}
          />
        </div>
      </div>
    </section>
  );
};

export default Hero;