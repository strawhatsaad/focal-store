// File: src/sections/Products/EyeglassesModal.tsx
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
      currentTree: Record<string, OptionNode>
    ): OptionNode | undefined => {
      if (!path || path.length === 0) return undefined;
      let node: OptionNode | undefined = currentTree[path[0]];
      for (let i = 1; i < path.length; i++) {
        if (!node?.children || !node.children[path[i]]) return undefined; // Added check for path[i]
        node = node.children[path[i]];
      }
      return node;
    },
    []
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
      Object.keys(optionsTree).length > 0 ? [Object.keys(optionsTree)] : []
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
            `[EyeglassesModal] Option key "${selectionKey}" not found at step ${i} in optionsTree.`
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
    [baseFramePrice]
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4 transition-opacity duration-300 ease-in-out">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col transform transition-all duration-300 ease-in-out scale-100">
        <div className="flex items-center justify-between p-4 md:p-5 border-b sticky top-0 bg-white z-10">
          <h2 className="text-lg md:text-xl font-semibold text-gray-800">
            Customize Lenses for {product?.name || "Eyeglasses"}
          </h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={resetCustomizations}
              aria-label="Reset customizations"
              className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
              title="Reset Selections"
            >
              <RefreshCcw className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              aria-label="Close customization modal"
              className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row flex-grow overflow-hidden">
          <div className="w-full md:w-1/2 p-4 md:p-6 border-b md:border-b-0 md:border-r flex items-center justify-center bg-gray-50">
            <img
              src={
                selectedVariant?.image?.src ||
                selectedVariant?.imageSrc ||
                product?.images?.[0]?.src ||
                "https://placehold.co/300x200/E2E8F0/4A5568?text=Eyeglasses"
              }
              alt={frameDisplayName}
              // Using inline style for object-fit as next/image is not used here
              style={{
                maxWidth: "100%",
                maxHeight: "300px",
                objectFit: "contain",
              }}
              className="rounded" // Removed fixed width/height, rely on parent and max-height
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src =
                  "https://placehold.co/300x200/E2E8F0/4A5568?text=Image+Error";
              }}
            />
          </div>

          <div className="w-full md:w-1/2 p-4 md:p-6 overflow-y-auto space-y-4 md:space-y-5">
            <div className="text-right mb-3">
              <p className="text-xs text-gray-500">
                Frame: {frameDisplayName} (${baseFramePrice.toFixed(2)})
              </p>
              <p className="text-lg font-bold text-gray-800">
                Total Price: ${totalPrice.toFixed(2)}
              </p>
            </div>

            {steps.map((stepOptions, stepIdx) => {
              if (stepIdx > currentStepIndex && selections.length <= stepIdx)
                return null; // Corrected condition

              let titleForThisStep = "Select Option";
              if (stepIdx === 0 && Object.keys(optionsTree).length > 0) {
                const firstKey = Object.keys(optionsTree)[0];
                titleForThisStep =
                  optionsTree[firstKey]?.label || "Prescription Type";
              } else if (stepIdx > 0) {
                const parentNodeOfCurrentOptions = getOptionNode(
                  selections.slice(0, stepIdx),
                  optionsTree
                );
                titleForThisStep =
                  parentNodeOfCurrentOptions?.label || `Step ${stepIdx + 1}`;
              }

              return (
                <div key={`step-group-${stepIdx}`} className="mb-3">
                  <h3 className="text-sm font-medium text-gray-600 mb-1.5">
                    {titleForThisStep}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {stepOptions.map((optionKey) => {
                      const isSelected = selections[stepIdx] === optionKey;
                      const currentOptionParentPath = selections.slice(
                        0,
                        stepIdx
                      );
                      const parentNodeForThisOption = getOptionNode(
                        currentOptionParentPath,
                        optionsTree
                      );
                      const optionNodeDetails =
                        stepIdx === 0
                          ? optionsTree[optionKey]
                          : parentNodeForThisOption?.children?.[optionKey];

                      if (!optionNodeDetails) {
                        // Defensive check
                        // console.warn(`Option details not found for key: ${optionKey} at step ${stepIdx}`);
                        return null;
                      }

                      const buttonText =
                        optionNodeDetails.optionDisplayName || optionKey;
                      const price = optionNodeDetails.basePrice ?? 0;

                      return (
                        <button
                          key={optionKey}
                          className={`px-3 py-1.5 text-xs rounded border transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-1
                            ${
                              isSelected
                                ? "bg-black text-white border-black ring-black"
                                : "border-gray-300 text-gray-700 hover:border-gray-600 hover:bg-gray-50 ring-gray-300"
                            }
                          `}
                          onClick={() => handleOptionSelect(optionKey, stepIdx)}
                        >
                          {buttonText}
                          {price > 0 ? ` (+$${price.toFixed(2)})` : ""}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {processingError && (
              <p className="text-xs text-red-500 mt-2">{processingError}</p>
            )}
          </div>
        </div>

        <div className="p-4 md:p-5 border-t flex flex-col items-end sticky bottom-0 bg-white z-10">
          <p className="text-xs text-gray-500 mb-2 w-full text-center md:text-right">
            Price includes frame & selected lens options.
          </p>
          <button
            onClick={handleProceedToPrescription}
            disabled={!isFinalStepCompleted()}
            className="w-full md:w-auto flex items-center justify-center bg-black text-white py-2.5 px-5 rounded-md text-sm font-semibold
                       hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black
                       disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors duration-150"
          >
            Next: Enter Prescription <ArrowRight size={16} className="ml-2" />
          </button>
        </div>
      </div>
    </div>
  );
}
