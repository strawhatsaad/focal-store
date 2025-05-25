// File: src/app/cart/page.tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useCart } from "@/context/CartContext"; // Ensure this path is correct
import Link from "next/link";
import Image from "next/image";
import {
  Loader2,
  Trash2,
  ArrowLeft,
  ShoppingBag,
  AlertCircle,
} from "lucide-react";
import { optionsTree } from "../../../lib/optionsData"; // Import your optionsTree

// Helper to parse price strings (e.g., "$145.00" or "145.00") into numbers
const parsePrice = (priceInput: string | number | undefined | null): number => {
  if (priceInput === null || priceInput === undefined) return 0;
  if (typeof priceInput === "number") return isNaN(priceInput) ? 0 : priceInput;
  const numericString = String(priceInput).replace(/[^0-9.-]+/g, "");
  const parsed = parseFloat(numericString);
  return isNaN(parsed) ? 0 : parsed;
};

// Helper to find an option in the tree and get its price (simplified)
// This needs to be robust based on your optionsTree structure
const getCustomizationPrice = (
  attributes: Array<{ key: string; value: string }>
): number => {
  let additionalPrice = 0;
  if (!attributes || !optionsTree) return 0;

  // This is a simplified lookup. A more robust version would traverse the optionsTree
  // similar to how EyeglassesModal does, based on the sequence of attributes.
  // For now, let's assume attributes directly map to keys in optionsTree or its children.

  // Example: if attributes are [{key: "Prescription Type", value: "Progressives"}, {key: "Lens Type", value: "Precision"}]
  // And optionsTree is { "Progressives": { basePrice: 230, children: { "Precision": { basePrice: 70 }}}}
  // This simplified logic won't correctly sum nested prices without full traversal.

  // A more accurate approach requires knowing the structure of attributes from EyeglassesModal
  // and how they map to optionsTree paths.
  // For demonstration, let's assume attributes store the 'label' from optionsTree as 'key'
  // and the selected option 'value' which might be a key in the next level of optionsTree.

  // This is a placeholder for a more complex calculation.
  // You would need to iterate through attributes, find corresponding nodes in optionsTree, and sum basePrices.
  // This example won't work correctly without knowing the exact attribute structure and optionsTree traversal.

  // A simple sum based on matching attribute keys to top-level option labels (very basic)
  // This is NOT a correct calculation for your nested optionsTree.
  // attributes.forEach(attr => {
  //   Object.values(optionsTree).forEach(prescriptionType => {
  //     if (prescriptionType.label === attr.key) { // This condition is likely wrong
  //       // Need to find the actual selected option within this prescriptionType
  //       // This requires a more complex traversal based on how attributes are stored.
  //     }
  //   });
  // });

  // To correctly calculate, we need to know how the `finalSelectionsSummary` from the modal
  // (which has {key: optionNode.label, value: optionKey}) relates to finding prices in optionsTree.
  // The `basePrice` is associated with the `optionKey` at each step.
  // If attributes store the `optionKey` and we can reconstruct the path:

  // For now, this function will return 0 as a proper calculation is complex without
  // knowing the exact structure of `attributes` and how they map to `optionsTree`.
  // The EyeglassesModal *already calculates* the total. The ideal would be to pass that total
  // as a special attribute, e.g., {key: "_finalPrice", value: "620.00"}

  const finalPriceAttribute = attributes.find(
    (attr) => attr.key === "_finalCalculatedPrice"
  );
  if (finalPriceAttribute) {
    return parsePrice(finalPriceAttribute.value);
  }

  return additionalPrice; // Placeholder
};

const CartPage = () => {
  const {
    cart,
    loading,
    error,
    updateLineItem,
    removeLineItem,
    clearCartError,
  } = useCart();
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null);

  const handleQuantityChange = async (lineId: string, newQuantity: number) => {
    if (newQuantity < 0) return;
    setUpdatingItemId(lineId);
    await updateLineItem(lineId, newQuantity);
    setUpdatingItemId(null);
  };

  const handleRemoveItem = async (lineId: string) => {
    setUpdatingItemId(lineId);
    await removeLineItem(lineId);
    setUpdatingItemId(null);
  };

  useEffect(() => {
    if (error && cart) {
      const timer = setTimeout(() => clearCartError(), 5000);
      return () => clearTimeout(timer);
    }
  }, [error, cart, clearCartError]);

  // Calculate displayed price for each line item
  const lineItemsWithDisplayPrice = useMemo(() => {
    if (!cart?.lines?.edges) return [];
    return cart.lines.edges.map((edge) => {
      const line = edge.node;
      let displayPrice = parsePrice(line.merchandise.priceV2.amount);
      let isCustomizedEyeglass = false;

      // Check if it's an eyeglass by looking for specific attributes from the modal
      if (line.attributes.some((attr) => attr.key === "Frame")) {
        // "Frame" attribute is added by modal
        isCustomizedEyeglass = true;
        // Attempt to find a special attribute storing the modal's calculated total price
        const finalPriceAttr = line.attributes.find(
          (attr) => attr.key === "_finalCalculatedPrice"
        );
        if (finalPriceAttr) {
          const parsedFinalPrice = parsePrice(finalPriceAttr.value);
          if (parsedFinalPrice > 0) {
            displayPrice = parsedFinalPrice;
          }
        } else {
          // Fallback: if _finalCalculatedPrice isn't there, we can't easily recalculate
          // the full customized price on the cart page without complex optionsTree traversal logic.
          // The note in the modal about cart price vs. final quote is important here.
          // For display, we'll stick to base variant price if no _finalCalculatedPrice attribute.
          console.warn(
            `Line item ${line.id} looks like customized eyeglasses but missing _finalCalculatedPrice attribute.`
          );
        }
      }
      return {
        ...line,
        displayUnitPrice: displayPrice, // Price per single item
        displayTotalPrice: displayPrice * line.quantity, // Total for this line (quantity * unit price)
        isCustomizedEyeglass,
      };
    });
  }, [cart]);

  // This subtotal is from Shopify (based on base variant prices)
  const shopifySubtotal = cart?.cost?.subtotalAmount
    ? parsePrice(cart.cost.subtotalAmount.amount)
    : 0;

  // This would be a UI-only calculated subtotal if we sum up all displayTotalPrices
  // const uiCalculatedSubtotal = lineItemsWithDisplayPrice.reduce((acc, item) => acc + item.displayTotalPrice, 0);

  if (loading && !cart) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[calc(100vh-200px)] bg-gray-50 p-4">
        <Loader2 className="h-12 w-12 animate-spin text-black" />
        <p className="ml-3 text-lg font-medium text-gray-700 mt-4">
          Loading your cart...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 py-8 md:py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <header className="mb-8 md:mb-10">
          <Link
            href="/"
            className="flex items-center text-sm text-gray-600 hover:text-black mb-6 group"
          >
            <ArrowLeft
              size={18}
              className="mr-2 group-hover:-translate-x-1 transition-transform duration-200"
            />
            Continue Shopping
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-800">
            Your Shopping Cart
          </h1>
        </header>

        {error && (
          <div
            className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md shadow-md mb-6"
            role="alert"
          >
            <div className="flex">
              <div className="py-1">
                <AlertCircle className="h-6 w-6 text-red-500 mr-3" />
              </div>
              <div>
                <p className="font-bold">Cart Error</p>
                <p>{error}</p>
              </div>
            </div>
          </div>
        )}

        {!cart || lineItemsWithDisplayPrice.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg shadow-xl">
            <ShoppingBag className="h-20 w-20 text-gray-300 mx-auto mb-6" />
            <h2 className="text-2xl font-semibold text-gray-700 mb-3">
              Your cart is empty
            </h2>
            <p className="text-gray-500 mb-8">
              Looks like you haven't added anything to your cart yet.
            </p>
            <Link
              href="/"
              className="px-8 py-3 bg-black text-white font-semibold text-sm rounded-lg shadow-md hover:bg-gray-800 transition-colors duration-150 ease-in-out transform hover:scale-105"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="bg-white p-6 sm:p-8 rounded-xl shadow-xl">
            <ul role="list" className="divide-y divide-gray-200">
              {lineItemsWithDisplayPrice.map((line) => (
                <li key={line.id} className="flex py-6 sm:py-8">
                  <div className="flex-shrink-0 w-24 h-24 sm:w-32 sm:h-32 border border-gray-200 rounded-md overflow-hidden">
                    <img
                      src={
                        line.merchandise.image?.url ||
                        "https://placehold.co/128x128/F7F4EE/333333?text=No+Image"
                      }
                      alt={
                        line.merchandise.image?.altText ||
                        line.merchandise.product.title
                      }
                      width={128}
                      height={128}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).onerror = null;
                        (e.target as HTMLImageElement).src =
                          "https://placehold.co/128x128/F7F4EE/333333?text=Error";
                      }}
                    />
                  </div>

                  <div className="ml-4 flex-1 flex flex-col">
                    <div>
                      <div className="flex justify-between text-base font-medium text-gray-900">
                        <h3>
                          <Link
                            href={`/products/${line.merchandise.product.handle}`}
                            className="hover:underline"
                          >
                            {line.merchandise.product.title}
                          </Link>
                        </h3>
                        {/* Display the calculated total price for this line item */}
                        <p className="ml-4">
                          ${line.displayTotalPrice.toFixed(2)}
                        </p>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">
                        {line.merchandise.title}
                      </p>
                      {line.attributes && line.attributes.length > 0 && (
                        <div className="mt-1 space-y-0.5">
                          {line.attributes
                            .filter(
                              (attr) => attr.key !== "_finalCalculatedPrice"
                            )
                            .map(
                              (
                                attr // Don't display internal price attribute
                              ) => (
                                <p
                                  key={attr.key}
                                  className="text-xs text-gray-500"
                                >
                                  <span className="font-medium">
                                    {attr.key}:
                                  </span>{" "}
                                  {attr.value}
                                </p>
                              )
                            )}
                        </div>
                      )}
                      {line.isCustomizedEyeglass &&
                        line.displayUnitPrice !==
                          parsePrice(line.merchandise.priceV2.amount) && (
                          <p className="mt-1 text-xs text-blue-600">
                            Price includes customizations.
                          </p>
                        )}
                    </div>
                    <div className="flex-1 flex items-end justify-between text-sm mt-4">
                      <div className="flex items-center border border-gray-300 rounded">
                        <button
                          onClick={() =>
                            handleQuantityChange(line.id, line.quantity - 1)
                          }
                          disabled={
                            updatingItemId === line.id || line.quantity <= 0
                          }
                          className="px-2 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50 rounded-l"
                          aria-label="Decrease quantity"
                        >
                          {" "}
                          &ndash;{" "}
                        </button>
                        <span className="px-3 py-1 text-center w-10 border-l border-r border-gray-300">
                          {updatingItemId === line.id && loading ? (
                            <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                          ) : (
                            line.quantity
                          )}
                        </span>
                        <button
                          onClick={() =>
                            handleQuantityChange(line.id, line.quantity + 1)
                          }
                          disabled={updatingItemId === line.id}
                          className="px-2 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50 rounded-r"
                          aria-label="Increase quantity"
                        >
                          {" "}
                          +{" "}
                        </button>
                      </div>

                      <div className="flex">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(line.id)}
                          disabled={updatingItemId === line.id}
                          className="font-medium text-red-600 hover:text-red-500 flex items-center disabled:opacity-50"
                        >
                          {updatingItemId === line.id && loading ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-1" />
                          ) : (
                            <Trash2 size={16} className="mr-1" />
                          )}
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="border-t border-gray-200 pt-6 mt-6">
              <div className="flex justify-between text-base font-medium text-gray-900">
                <p>Subtotal</p>
                {/* Display Shopify's subtotal. The checkoutUrl will use this. */}
                <p>
                  ${shopifySubtotal.toFixed(2)}{" "}
                  {cart?.cost.subtotalAmount.currencyCode}
                </p>
              </div>
              {cart?.cost.totalTaxAmount &&
                parsePrice(cart.cost.totalTaxAmount.amount) > 0 && (
                  <div className="flex justify-between mt-1 text-sm text-gray-600">
                    <p>Taxes</p>
                    <p>
                      ${parsePrice(cart.cost.totalTaxAmount.amount).toFixed(2)}{" "}
                      {cart.cost.totalTaxAmount.currencyCode}
                    </p>
                  </div>
                )}
              <p className="mt-1 text-sm text-gray-500">
                Shipping calculated at checkout. Final price including all
                customizations will be confirmed before payment.
              </p>
              <div className="mt-6">
                <a
                  href={cart?.checkoutUrl}
                  className="w-full flex items-center justify-center rounded-md border border-transparent bg-black px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-gray-800 transition-colors duration-150 ease-in-out"
                >
                  Proceed to Checkout
                </a>
              </div>
              <div className="mt-6 flex justify-center text-center text-sm text-gray-500">
                <p>
                  or&nbsp;
                  <Link
                    href="/"
                    className="font-medium text-black hover:text-gray-700"
                  >
                    Continue Shopping
                    <span aria-hidden="true"> &rarr;</span>
                  </Link>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
