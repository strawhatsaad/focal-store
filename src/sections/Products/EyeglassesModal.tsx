// File: src/sections/Products/EyeglassesModal.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { optionsTree } from "../../../lib/optionsData"; // Ensure this path is correct
import { X, Loader2, RefreshCcw } from "lucide-react";
import { useCart } from "@/context/CartContext"; // Ensure this path is correct
import Image from "next/image";

interface OptionNode {
  label: string;
  basePrice: number;
  final?: boolean;
  children?: Record<string, OptionNode>;
  optionDisplayName?: string;
}

interface EyeglassesModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: any;
  selectedVariant: any;
}

const parsePrice = (priceInput: string | number | undefined | null): number => {
  if (priceInput === null || priceInput === undefined) {
    console.warn(
      "[parsePrice] Received undefined or null priceInput, returning 0."
    );
    return 0;
  }
  if (typeof priceInput === "number") {
    return isNaN(priceInput) ? 0 : priceInput;
  }
  const numericString = String(priceInput).replace(/[^0-9.-]+/g, "");
  const parsed = parseFloat(numericString);
  if (isNaN(parsed)) {
    console.warn(
      `[parsePrice] Failed to parse '${priceInput}' into a number, returning 0.`
    );
    return 0;
  }
  return parsed;
};

export default function EyeglassesModal({
  isOpen,
  onClose,
  product,
  selectedVariant,
}: EyeglassesModalProps) {
  const {
    addLineItem,
    loading: cartLoading,
    error: cartError,
    clearCartError,
  } = useCart();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [addToCartSuccess, setAddToCartSuccess] = useState(false);
  const [addToCartModalError, setAddToCartModalError] = useState<string | null>(
    null
  );

  const [steps, setSteps] = useState<string[][]>([]);
  const [selections, setSelections] = useState<string[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [finalSelectionsSummary, setFinalSelectionsSummary] = useState<
    Array<{ key: string; value: string }>
  >([]);

  const getOptionNode = useCallback(
    (
      path: string[],
      currentTree: Record<string, OptionNode>
    ): OptionNode | undefined => {
      if (!path || path.length === 0) return undefined;
      let node: OptionNode | undefined = currentTree[path[0]];
      for (let i = 1; i < path.length; i++) {
        if (!node?.children) return undefined;
        node = node.children[path[i]];
      }
      return node;
    },
    []
  );

  const resetCustomizations = useCallback(() => {
    setSteps(
      Object.keys(optionsTree).length > 0 ? [Object.keys(optionsTree)] : []
    );
    setSelections([]);
    setCurrentStepIndex(0);

    let initialFramePrice = 0;
    if (selectedVariant && typeof selectedVariant.price === "string") {
      initialFramePrice = parsePrice(selectedVariant.price);
    } else if (
      selectedVariant &&
      selectedVariant.priceV2 &&
      typeof selectedVariant.priceV2.amount === "string"
    ) {
      initialFramePrice = parsePrice(selectedVariant.priceV2.amount);
    } else if (
      product &&
      product.priceRange &&
      product.priceRange.minVariantPrice &&
      typeof product.priceRange.minVariantPrice.amount === "string"
    ) {
      initialFramePrice = parsePrice(product.priceRange.minVariantPrice.amount);
    }
    setTotalPrice(initialFramePrice);
    setFinalSelectionsSummary([]);
    setAddToCartSuccess(false);
    setAddToCartModalError(null);
    if (cartError) clearCartError();
  }, [selectedVariant, product, cartError, clearCartError]);

  useEffect(() => {
    if (isOpen && selectedVariant) {
      resetCustomizations();
    }
  }, [isOpen, selectedVariant, resetCustomizations]);

  const calculateAndSetPriceAndSummary = useCallback(
    (currentSelections: string[]) => {
      let basePrice = 0;
      if (selectedVariant && typeof selectedVariant.price === "string") {
        basePrice = parsePrice(selectedVariant.price);
      } else if (
        selectedVariant &&
        selectedVariant.priceV2 &&
        typeof selectedVariant.priceV2.amount === "string"
      ) {
        basePrice = parsePrice(selectedVariant.priceV2.amount);
      } else if (
        product &&
        product.priceRange &&
        product.priceRange.minVariantPrice &&
        typeof product.priceRange.minVariantPrice.amount === "string"
      ) {
        basePrice = parsePrice(product.priceRange.minVariantPrice.amount);
      }

      let newNumericPrice = basePrice;
      const summary: Array<{ key: string; value: string }> = [];
      let currentPathNode = optionsTree;

      for (let i = 0; i < currentSelections.length; i++) {
        const selectionKey = currentSelections[i];
        if (!currentPathNode || !currentPathNode[selectionKey]) {
          break;
        }
        const optionNode = currentPathNode[selectionKey];
        newNumericPrice += optionNode.basePrice;
        summary.push({
          key: optionNode.label,
          value: optionNode.optionDisplayName || selectionKey,
        });
        if (optionNode.children) {
          currentPathNode = optionNode.children;
        } else {
          break;
        }
      }
      setTotalPrice(newNumericPrice);
      setFinalSelectionsSummary(summary);
    },
    [selectedVariant, product]
  );

  const handleOptionSelect = (optionKey: string, stepIdx: number) => {
    const newSelections = [...selections.slice(0, stepIdx), optionKey];
    setSelections(newSelections);
    calculateAndSetPriceAndSummary(newSelections);

    const currentNode = getOptionNode(newSelections, optionsTree);
    const newSteps = [...steps.slice(0, stepIdx + 1)];

    if (currentNode?.children && !currentNode.final) {
      newSteps[stepIdx + 1] = Object.keys(currentNode.children);
      setCurrentStepIndex(stepIdx + 1);
    } else {
      newSteps.splice(stepIdx + 1);
      setCurrentStepIndex(stepIdx);
    }
    setSteps(newSteps);
  };

  const handleAddToCartInModal = async () => {
    if (!selectedVariant?.id) {
      setAddToCartModalError("Base frame variant is not selected.");
      return;
    }
    const isCustomizationComplete = () => {
      if (Object.keys(optionsTree).length === 0) return true;
      let currentNode = optionsTree;
      for (let i = 0; i < selections.length; i++) {
        const selection = selections[i];
        if (!currentNode[selection]) return false;
        const nodeDetails = currentNode[selection];
        if (nodeDetails.final) return true;
        if (!nodeDetails.children) return true;
        if (i < selections.length - 1) {
          currentNode = nodeDetails.children;
        } else {
          return !nodeDetails.children;
        }
      }
      const currentOptionNode = getOptionNode(selections, optionsTree);
      return !!(
        currentOptionNode &&
        (currentOptionNode.final || !currentOptionNode.children)
      );
    };

    if (!isCustomizationComplete()) {
      setAddToCartModalError("Please complete all customization steps.");
      return;
    }

    setIsAddingToCart(true);
    setAddToCartSuccess(false);
    setAddToCartModalError(null);
    if (cartError) clearCartError();

    const attributes = finalSelectionsSummary.map((sel) => ({
      key: sel.key,
      value: sel.value,
    }));
    attributes.unshift({
      key: "Frame",
      value: `${product.name} - (${
        selectedVariant.name || selectedVariant.title || "Default Style"
      })`,
    });
    // Add the final calculated price as a custom attribute
    attributes.push({
      key: "_finalCalculatedPrice",
      value: totalPrice.toFixed(2),
    });

    const success = await addLineItem(selectedVariant.id, 1, attributes);

    setIsAddingToCart(false);
    if (success) {
      setAddToCartSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } else {
      setAddToCartModalError(
        cartError || "Failed to add customized eyeglasses to cart."
      );
    }
  };

  const isFinalStepCompleted = () => {
    if (Object.keys(optionsTree).length === 0) return true;
    if (
      selections.length === 0 &&
      Object.keys(optionsTree).length > 0 &&
      steps[0]?.length > 0
    )
      return false;
    const currentNode = getOptionNode(selections, optionsTree);
    return (
      currentNode?.final === true ||
      (!currentNode?.children && selections.length > 0)
    );
  };

  if (!isOpen) return null;

  const frameDisplayName =
    selectedVariant?.name || selectedVariant?.title || "N/A";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4 transition-opacity duration-300 ease-in-out">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col transform transition-all duration-300 ease-in-out scale-100">
        <div className="flex items-center justify-between p-4 md:p-5 border-b sticky top-0 bg-white z-10">
          <h2 className="text-lg md:text-xl font-semibold text-gray-800">
            Customize Your {product?.name || "Eyeglasses"}
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
              alt={
                frameDisplayName === "N/A"
                  ? product?.name || "Eyeglass Image"
                  : frameDisplayName
              }
              width={300}
              height={200}
              className="max-w-full max-h-[200px] sm:max-h-[250px] md:max-h-[300px] object-contain rounded"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src =
                  "https://placehold.co/300x200/E2E8F0/4A5568?text=Image+Error";
              }}
            />
          </div>

          <div className="w-full md:w-1/2 p-4 md:p-6 overflow-y-auto space-y-4 md:space-y-5">
            <div className="text-right mb-3">
              <p className="text-xs text-gray-500">
                Selected Frame: {frameDisplayName}
              </p>
              <p className="text-lg font-bold text-gray-800">
                Total Price: ${totalPrice.toFixed(2)}
              </p>
            </div>

            {steps.map((stepOptions, stepIdx) => {
              if (stepIdx > currentStepIndex && selections.length < stepIdx)
                return null;
              const stepNodePath = selections.slice(0, stepIdx);
              let titleForThisStep = "Select Option";
              if (stepIdx === 0) {
                const firstKey = Object.keys(optionsTree)[0];
                titleForThisStep =
                  firstKey && optionsTree[firstKey]
                    ? optionsTree[firstKey].label
                    : "Prescription Type";
              } else {
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
                      const buttonText =
                        optionNodeDetails?.optionDisplayName || optionKey;

                      const price = optionNodeDetails?.basePrice ?? 0;

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

            {addToCartModalError && (
              <p className="text-xs text-red-500 mt-2">{addToCartModalError}</p>
            )}
            {addToCartSuccess && (
              <p className="text-xs text-green-600 mt-2">Added to cart!</p>
            )}
          </div>
        </div>

        <div className="p-4 md:p-5 border-t flex flex-col items-end sticky bottom-0 bg-white z-10">
          <p className="text-xs text-gray-500 mb-2 w-full text-center md:text-right">
            Note: Price includes frame & selected lens options. Shopify cart
            will show base frame price; customizations listed as details.
          </p>
          <button
            onClick={handleAddToCartInModal}
            disabled={!isFinalStepCompleted() || isAddingToCart || cartLoading}
            className="w-full md:w-auto flex items-center justify-center bg-black text-white py-2.5 px-5 rounded-md text-sm font-semibold
                       hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black
                       disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors duration-150"
          >
            {isAddingToCart || cartLoading ? (
              <Loader2 className="animate-spin h-5 w-5 mr-2" />
            ) : null}
            Add to Cart - ${totalPrice.toFixed(2)}
          </button>
        </div>
      </div>
    </div>
  );
}
