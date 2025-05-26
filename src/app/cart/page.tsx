// File: src/app/cart/page.tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useCart } from "@/context/CartContext"; // Ensure this path is correct
import { useSession } from "next-auth/react"; // For getting customer info
import Link from "next/link";
import Image from "next/image"; // Keep if you use Next Image elsewhere, otherwise remove
import {
  Loader2,
  Trash2,
  ArrowLeft,
  ShoppingBag,
  AlertCircle,
  CreditCard, // Added for checkout button
} from "lucide-react";
// optionsTree import removed as price calculation should rely on _finalCalculatedPrice from modal

const parsePrice = (priceInput: string | number | undefined | null): number => {
  if (priceInput === null || priceInput === undefined) return 0;
  if (typeof priceInput === "number") return isNaN(priceInput) ? 0 : priceInput;
  const numericString = String(priceInput).replace(/[^0-9.-]+/g, "");
  const parsed = parseFloat(numericString);
  return isNaN(parsed) ? 0 : parsed;
};

const CartPage = () => {
  const {
    cart,
    loading: cartContextLoading, // Renamed to avoid conflict
    error: cartContextError,
    updateLineItem,
    removeLineItem,
    clearCartError,
  } = useCart();
  const { data: session } = useSession();

  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null);
  const [isCreatingDraftOrder, setIsCreatingDraftOrder] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

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
    if (cartContextError && cart) {
      // Use cartContextError
      const timer = setTimeout(() => clearCartError(), 5000);
      return () => clearTimeout(timer);
    }
  }, [cartContextError, cart, clearCartError]);

  const lineItemsWithDisplayPrice = useMemo(() => {
    if (!cart?.lines?.edges) return [];
    return cart.lines.edges.map((edge) => {
      const line = edge.node;
      let displayPrice = parsePrice(line.merchandise.priceV2.amount); // Default to variant price
      let isCustomizedEyeglass = false;
      let finalCalculatedPrice = displayPrice; // Initialize with base price

      const finalPriceAttr = line.attributes.find(
        (attr) => attr.key === "_finalCalculatedPrice"
      );

      if (finalPriceAttr) {
        const parsedFinalPrice = parsePrice(finalPriceAttr.value);
        if (parsedFinalPrice > 0) {
          finalCalculatedPrice = parsedFinalPrice; // This is the unit price including customizations
          isCustomizedEyeglass = true;
        }
      }
      return {
        ...line,
        merchandiseId: line.merchandise.id, // Expose merchandiseId (variant GID)
        customizedUnitPrice: finalCalculatedPrice, // Unit price including customizations
        displayTotalPrice: finalCalculatedPrice * line.quantity,
        isCustomizedEyeglass,
        title:
          line.merchandise.product.title +
          (line.merchandise.title !== "Default Title"
            ? ` - ${line.merchandise.title}`
            : ""),
      };
    });
  }, [cart]);

  const shopifySubtotal = cart?.cost?.subtotalAmount
    ? parsePrice(cart.cost.subtotalAmount.amount)
    : 0;

  // Calculate UI subtotal based on customized prices
  const uiCalculatedSubtotal = lineItemsWithDisplayPrice.reduce(
    (acc, item) => acc + item.displayTotalPrice,
    0
  );
  const currencyCode = cart?.cost?.subtotalAmount?.currencyCode || "USD";

  const handleProceedToCheckout = async () => {
    if (!lineItemsWithDisplayPrice || lineItemsWithDisplayPrice.length === 0) {
      setCheckoutError("Your cart is empty.");
      return;
    }
    setIsCreatingDraftOrder(true);
    setCheckoutError(null);

    const draftOrderLineItems = lineItemsWithDisplayPrice.map((item) => ({
      variantId: item.merchandiseId, // This is the Product Variant GID
      quantity: item.quantity,
      customizedPrice: item.customizedUnitPrice.toFixed(2), // Send the unit price with customizations
      attributes: item.attributes.map((attr) => ({
        key: attr.key,
        value: attr.value,
      })),
      title: item.title, // Send a descriptive title
    }));

    const customerInfoPayload: any = {};
    if (session?.user?.email) {
      customerInfoPayload.email = session.user.email;
    }
    // Add more customer info if needed, like shipping address if you collect it pre-checkout

    try {
      const response = await fetch("/api/checkout/create-draft-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lineItems: draftOrderLineItems,
          customerInfo: customerInfoPayload,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to create draft order.");
      }

      if (result.invoiceUrl) {
        // Optionally, clear the Storefront cart here if needed,
        // though the user is moving to a Shopify-hosted checkout.
        // Example: await clearCart(); // if you implement a clearCart function in CartContext
        window.location.href = result.invoiceUrl;
      } else {
        throw new Error("Invoice URL not received from draft order creation.");
      }
    } catch (err: any) {
      console.error("Error proceeding to draft order checkout:", err);
      setCheckoutError(
        err.message ||
          "An unexpected error occurred while preparing your order."
      );
    } finally {
      setIsCreatingDraftOrder(false);
    }
  };

  if (cartContextLoading && !cart) {
    // Use cartContextLoading
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

        {cartContextError && ( // Use cartContextError
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
                <p>{cartContextError}</p>
              </div>
            </div>
          </div>
        )}
        {checkoutError && (
          <div
            className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md shadow-md mb-6"
            role="alert"
          >
            <div className="flex">
              <div className="py-1">
                <AlertCircle className="h-6 w-6 text-red-500 mr-3" />
              </div>
              <div>
                <p className="font-bold">Checkout Error</p>
                <p>{checkoutError}</p>
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
              Looks like you haven&apos;t added anything to your cart yet.
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
                    <img // Using standard img tag for simplicity, ensure src is valid
                      src={
                        line.merchandise.image?.url ||
                        "https://placehold.co/128x128/F7F4EE/333333?text=No+Image"
                      }
                      alt={
                        line.merchandise.image?.altText ||
                        line.merchandise.product.title
                      }
                      width={128} // These are for aspect ratio hint if using CSS for sizing
                      height={128}
                      className="w-full h-full object-contain"
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
                            {line.title}
                          </Link>
                        </h3>
                        <p className="ml-4">
                          ${line.displayTotalPrice.toFixed(2)}
                        </p>
                      </div>
                      {/* <p className="mt-1 text-sm text-gray-500">
                        {line.merchandise.title} {/* This might be redundant if title includes it *}
                      </p> */}
                      {line.attributes && line.attributes.length > 0 && (
                        <div className="mt-1 space-y-0.5">
                          {line.attributes
                            .filter(
                              (attr) => attr.key !== "_finalCalculatedPrice" // Don't display internal price attribute
                            )
                            .map((attr) => (
                              <p
                                key={attr.key}
                                className="text-xs text-gray-500"
                              >
                                <span className="font-medium">{attr.key}:</span>{" "}
                                {attr.value}
                              </p>
                            ))}
                        </div>
                      )}
                      {line.isCustomizedEyeglass && (
                        <p className="mt-1 text-xs text-blue-600">
                          Price includes customizations ($
                          {line.customizedUnitPrice.toFixed(2)} each).
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
                            updatingItemId === line.id ||
                            line.quantity <= 0 ||
                            isCreatingDraftOrder
                          }
                          className="px-2 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50 rounded-l"
                          aria-label="Decrease quantity"
                        >
                          &ndash;
                        </button>
                        <span className="px-3 py-1 text-center w-10 border-l border-r border-gray-300">
                          {updatingItemId === line.id && cartContextLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                          ) : (
                            line.quantity
                          )}
                        </span>
                        <button
                          onClick={() =>
                            handleQuantityChange(line.id, line.quantity + 1)
                          }
                          disabled={
                            updatingItemId === line.id || isCreatingDraftOrder
                          }
                          className="px-2 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50 rounded-r"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>

                      <div className="flex">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(line.id)}
                          disabled={
                            updatingItemId === line.id || isCreatingDraftOrder
                          }
                          className="font-medium text-red-600 hover:text-red-500 flex items-center disabled:opacity-50"
                        >
                          {updatingItemId === line.id && cartContextLoading ? (
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
                <p>
                  ${uiCalculatedSubtotal.toFixed(2)} {currencyCode}
                </p>
              </div>
              {cart?.cost.totalTaxAmount &&
                parsePrice(cart.cost.totalTaxAmount.amount) > 0 && (
                  <div className="flex justify-between mt-1 text-sm text-gray-600">
                    <p>Taxes (estimated by Shopify based on variant prices)</p>
                    <p>
                      ${parsePrice(cart.cost.totalTaxAmount.amount).toFixed(2)}{" "}
                      {cart.cost.totalTaxAmount.currencyCode}
                    </p>
                  </div>
                )}
              <p className="mt-1 text-sm text-gray-500">
                Shipping calculated at Shopify checkout. Final price including
                customizations will be shown on the Shopify payment page.
              </p>
              <div className="mt-6">
                <button
                  onClick={handleProceedToCheckout}
                  disabled={isCreatingDraftOrder || cartContextLoading}
                  className="w-full flex items-center justify-center rounded-md border border-transparent bg-black px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-gray-800 transition-colors duration-150 ease-in-out disabled:opacity-50"
                >
                  {isCreatingDraftOrder ? (
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  ) : (
                    <CreditCard className="w-5 h-5 mr-2" />
                  )}
                  Proceed to Secure Checkout
                </button>
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
