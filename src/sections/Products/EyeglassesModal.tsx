// File: src/sections/Products/EyeglassesModal.tsx
/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect, useCallback, useMemo } from "react"; // Added useMemo
import { optionsTree, OptionNode } from "../../../lib/optionsData";
import {
  X,
  Loader2,
  RefreshCcw,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
} from "lucide-react"; // Added ArrowRight
// useCart is no longer needed here as this modal won't add to cart directly
import Image from "next/image"; // Assuming you might use Next/Image

// Data structure to pass to the next modal (EyeglassesPrescriptionModal)
export interface LensCustomizationData {
  options: Array<{ key: string; value: string; price: number }>;
  price: number; // Total price including frame and lens customizations
}

interface EyeglassesModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: any;
  selectedVariant: any;
  onLensCustomizationComplete: (data: LensCustomizationData) => void;
}

const parsePrice = (priceInput: string | number | undefined | null): number => {
  if (priceInput === null || priceInput === undefined) return 0;
  if (typeof priceInput === "number") return isNaN(priceInput) ? 0 : priceInput;
  const numericString = String(priceInput).replace(/[^0-9.-]+/g, "");
  const parsed = parseFloat(numericString);
  return isNaN(parsed) ? 0 : parsed;
};

export default function EyeglassesModal({
  isOpen,
  onClose,
  product,
  selectedVariant,
  onLensCustomizationComplete,
}: EyeglassesModalProps) {
  const [steps, setSteps] = useState<string[][]>([]);
  const [selections, setSelections] = useState<string[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [finalSelectionsSummary, setFinalSelectionsSummary] = useState<
    Array<{ key: string; value: string; price: number }>
  >([]);
  const [processingError, setProcessingError] = useState<string | null>(null);

  const getOptionNode = useCallback(
    (
      path: string[],
      currentTree: Record<string, OptionNode>,
    ): OptionNode | undefined => {
      if (!path || path.length === 0) return undefined;
      let node: OptionNode | undefined = currentTree[path[0]];
      for (let i = 1; i < path.length; i++) {
        if (!node?.children || !node.children[path[i]]) return undefined; // Added check for path[i]
        node = node.children[path[i]];
      }
      return node;
    },
    [],
  );

  const baseFramePrice = useMemo(() => {
    let price = 0;
    if (selectedVariant && typeof selectedVariant.price === "string") {
      price = parsePrice(selectedVariant.price);
    } else if (
      selectedVariant &&
      selectedVariant.priceV2 &&
      typeof selectedVariant.priceV2.amount === "string"
    ) {
      price = parsePrice(selectedVariant.priceV2.amount);
    } else if (
      product &&
      product.priceRange &&
      product.priceRange.minVariantPrice &&
      typeof product.priceRange.minVariantPrice.amount === "string"
    ) {
      price = parsePrice(product.priceRange.minVariantPrice.amount);
    }
    return price;
  }, [product, selectedVariant]);

  const resetCustomizations = useCallback(() => {
    setSteps(
      Object.keys(optionsTree).length > 0 ? [Object.keys(optionsTree)] : [],
    );
    setSelections([]);
    setCurrentStepIndex(0);
    setTotalPrice(baseFramePrice);
    setFinalSelectionsSummary([]);
    setProcessingError(null);
  }, [baseFramePrice]);

  useEffect(() => {
    if (isOpen && selectedVariant) {
      resetCustomizations();
    }
  }, [isOpen, selectedVariant, resetCustomizations]);

  const calculateAndSetPriceAndSummary = useCallback(
    (currentSelections: string[]) => {
      let newNumericPrice = baseFramePrice;
      const summary: Array<{ key: string; value: string; price: number }> = [];
      let currentPathNodeTree = optionsTree; // Use a local var for traversing the tree

      for (let i = 0; i < currentSelections.length; i++) {
        const selectionKey = currentSelections[i];
        if (!currentPathNodeTree || !currentPathNodeTree[selectionKey]) {
          console.warn(
            `[EyeglassesModal] Option key "${selectionKey}" not found at step ${i} in optionsTree.`,
          );
          break;
        }
        const optionNode = currentPathNodeTree[selectionKey];
        newNumericPrice += optionNode.basePrice;
        summary.push({
          key: optionNode.label,
          value: optionNode.optionDisplayName || selectionKey,
          price: optionNode.basePrice,
        });
        if (optionNode.children) {
          currentPathNodeTree = optionNode.children; // Update the traversal reference
        } else {
          break;
        }
      }
      setTotalPrice(newNumericPrice);
      setFinalSelectionsSummary(summary);
    },
    [baseFramePrice],
  );

  const handleOptionSelect = (optionKey: string, stepIdx: number) => {
    const newSelections = [...selections.slice(0, stepIdx), optionKey];
    setSelections(newSelections);
    calculateAndSetPriceAndSummary(newSelections);

    const currentNode = getOptionNode(newSelections, optionsTree);
    const newStepsArray = [...steps.slice(0, stepIdx + 1)];

    if (currentNode?.children && !currentNode.final) {
      newStepsArray[stepIdx + 1] = Object.keys(currentNode.children);
      setCurrentStepIndex(stepIdx + 1);
    } else {
      newStepsArray.splice(stepIdx + 1);
      setCurrentStepIndex(stepIdx);
    }
    setSteps(newStepsArray);
    setProcessingError(null);
  };

  const isFinalStepCompleted = () => {
    if (Object.keys(optionsTree).length === 0) return true;
    if (selections.length === 0 && steps[0]?.length > 0) return false;

    const currentNode = getOptionNode(selections, optionsTree);
    return !!(
      currentNode &&
      (currentNode.final === true || !currentNode.children)
    );
  };

  const handleProceedToPrescription = () => {
    setProcessingError(null);
    if (!isFinalStepCompleted()) {
      setProcessingError("Please complete all lens customization steps.");
      return;
    }

    const customizationData: LensCustomizationData = {
      options: finalSelectionsSummary,
      price: totalPrice,
    };
    onLensCustomizationComplete(customizationData);
    // onClose(); // Let Hero component handle closing this modal after receiving data
  };

  if (!isOpen) return null;

  const frameDisplayName =
    selectedVariant?.name ||
    selectedVariant?.title ||
    product?.name ||
    "Selected Frame";

  return (
    <div
      className={`fixed inset-0 z-[100] flex bg-[#f7f6f2] transition-all duration-300 ${isOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}
    >
      {/* Left Side: Dynamic Image */}
      <div className="hidden lg:flex flex-1 flex-col items-center justify-center relative p-12 bg-[#f4f5f5]">
        <div className="relative w-full max-w-2xl aspect-[16/9] flex items-center justify-center">
          <img
            src={
              selectedVariant?.image?.src ||
              selectedVariant?.imageSrc ||
              product?.images?.[0]?.src ||
              "https://placehold.co/800x600/E2E8F0/4A5568?text=Eyeglasses"
            }
            alt={frameDisplayName}
            className="max-w-full max-h-full object-contain scale-125 saturate-[1.05]"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src =
                "https://placehold.co/800x600/E2E8F0/4A5568?text=Image+Error";
            }}
          />
        </div>
        <div className="absolute bottom-12 left-12">
          <h2 className="text-[34px] font-medium text-gray-900 tracking-tight leading-none mb-2">
            {product?.name || "Frame"}
          </h2>
          <p className="text-[20px] italic font-serif text-gray-700">
            {frameDisplayName}
          </p>
        </div>
        <div className="absolute bottom-12 right-12 text-right">
          <p className="text-sm text-gray-500 uppercase tracking-widest font-semibold mb-1">
            Total
          </p>
          <p className="text-[26px] font-medium text-gray-900 leading-none">
            ${totalPrice.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Right Side: Options Panel */}
      <div
        className={`bg-white w-full lg:w-[480px] xl:w-[540px] h-full shadow-2xl flex flex-col transform transition-transform duration-500 ease-out border-l border-gray-200 relative ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 bg-white sticky top-0 z-30">
          <div className="flex-1">
            {currentStepIndex > 0 ? (
              <button
                onClick={() => setCurrentStepIndex(currentStepIndex - 1)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-full text-gray-900 font-medium hover:bg-gray-100 transition-all border border-gray-200"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M19 12H5"></path>
                  <path d="M12 19l-7-7 7-7"></path>
                </svg>
                Back
              </button>
            ) : (
              <h2 className="lg:hidden text-xl font-medium text-gray-900 tracking-tight">
                Customize lenses
              </h2>
            )}
          </div>

          <div className="flex bg-gray-50 rounded-full p-1 border border-gray-200">
            <button
              onClick={resetCustomizations}
              className="p-2 text-gray-500 hover:text-gray-900 rounded-full hover:bg-white transition-all"
              title="Reset"
            >
              <RefreshCcw size={16} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-900 rounded-full hover:bg-white transition-all"
              title="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="flex-grow overflow-y-auto bg-white hide-scrollbar pb-32 pt-8 lg:pt-12 px-6 lg:px-12">
          {/* Mobile Product Summary */}
          <div className="lg:hidden flex items-center gap-4 mb-8 pb-8 border-b border-gray-100">
            <div className="w-24 h-24 bg-[#F7F6F2] rounded-lg flex items-center justify-center p-2 shrink-0">
              <img
                src={
                  selectedVariant?.image?.src ||
                  selectedVariant?.imageSrc ||
                  product?.images?.[0]?.src ||
                  "https://placehold.co/300x200/E2E8F0/4A5568?text=Eyeglasses"
                }
                alt={frameDisplayName}
                className="max-w-full max-h-full object-contain"
              />
            </div>
            <div className="flex-grow">
              <h3 className="text-base font-semibold text-gray-900">
                {product?.name || "Frame"}
              </h3>
              <p className="text-sm text-gray-500">{frameDisplayName}</p>
            </div>
          </div>

          <div className="space-y-12 animate-in fade-in slide-in-from-right-4 duration-500">
            {steps.map((stepOptions, stepIdx) => {
              if (stepIdx !== currentStepIndex) return null;

              let titleForThisStep = "Select Option";
              let subtitle = "";
              if (stepIdx === 0 && Object.keys(optionsTree).length > 0) {
                const firstKey = Object.keys(optionsTree)[0];
                titleForThisStep =
                  optionsTree[firstKey]?.label || "Select a prescription type";
              } else if (stepIdx > 0) {
                const parentNodeOfCurrentOptions = getOptionNode(
                  selections.slice(0, stepIdx),
                  optionsTree,
                );
                titleForThisStep =
                  parentNodeOfCurrentOptions?.label || `Step ${stepIdx + 1}`;
                subtitle = parentNodeOfCurrentOptions?.description || "";
              }

              const isCurrentActiveStep = stepIdx === currentStepIndex;

              return (
                <div
                  key={`step-group-${stepIdx}`}
                  className={`transition-all duration-500 ${!isCurrentActiveStep && stepIdx < currentStepIndex ? "opacity-40 hover:opacity-100" : "opacity-100"}`}
                >
                  <div className="mb-6">
                    <h3 className="text-[26px] font-medium text-gray-900 tracking-tight">
                      {titleForThisStep}
                    </h3>
                    {subtitle && (
                      <p className="text-[15px] text-gray-600 mt-2 leading-relaxed">
                        {subtitle}
                      </p>
                    )}
                  </div>

                  <div className="space-y-4">
                    {stepOptions.map((optionKey) => {
                      const isSelected = selections[stepIdx] === optionKey;
                      const currentOptionParentPath = selections.slice(
                        0,
                        stepIdx,
                      );
                      const parentNodeForThisOption = getOptionNode(
                        currentOptionParentPath,
                        optionsTree,
                      );
                      const optionNodeDetails =
                        stepIdx === 0
                          ? optionsTree[optionKey]
                          : parentNodeForThisOption?.children?.[optionKey];

                      if (!optionNodeDetails) return null;

                      const buttonText =
                        optionNodeDetails.optionDisplayName || optionKey;
                      const description = optionNodeDetails.description;
                      const price = optionNodeDetails.basePrice ?? 0;

                      return (
                        <div
                          key={optionKey}
                          onClick={() => handleOptionSelect(optionKey, stepIdx)}
                          className={`w-full p-5 rounded-2xl border transition-all cursor-pointer flex flex-col text-left group
                            ${
                              isSelected
                                ? "border-black shadow-sm ring-1 ring-black"
                                : "border-gray-200 bg-white hover:border-black"
                            }
                          `}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <span
                              className={`text-[17px] font-medium leading-tight text-gray-900`}
                            >
                              {buttonText}
                            </span>
                            {price > 0 ||
                            buttonText.toLowerCase().includes("included") ? (
                              <span
                                className={`text-[15px] font-medium whitespace-nowrap ml-4 text-gray-900`}
                              >
                                {price > 0
                                  ? `+$${price.toFixed(2)}`
                                  : "Included"}
                              </span>
                            ) : null}
                          </div>
                          {description && (
                            <p
                              className={`text-[14px] mt-2 leading-relaxed text-gray-500`}
                            >
                              {description}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {processingError && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3">
                <AlertTriangle
                  size={20}
                  className="text-red-500 shrink-0 mt-0.5"
                />
                <p className="text-sm text-red-700">{processingError}</p>
              </div>
            )}
          </div>
        </div>

        <div className="absolute bottom-0 w-full bg-white border-t border-gray-100 p-6 shadow-[0_-10px_40px_rgba(0,0,0,0.03)] z-20">
          <button
            onClick={handleProceedToPrescription}
            disabled={!isFinalStepCompleted()}
            className="w-full flex items-center justify-center bg-black text-white py-4 px-6 rounded-full text-[17px] font-medium hover:bg-gray-800 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
          >
            Review & Continue
          </button>
        </div>
      </div>
    </div>
  );
}
