// File: src/app/cart/page.tsx
"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useCart } from "@/context/CartContext"; 
import { useSession } from "next-auth/react"; 
import { useRouter } from "next/navigation"; 
import Link from "next/link";
import {
  Loader2,
  Trash2,
  ArrowLeft,
  ShoppingBag,
  AlertCircle,
  CreditCard,
  LogIn, 
  Tag,
} from "lucide-react";

const parsePrice = (priceInput: string | number | undefined | null): number => {
  if (priceInput === null || priceInput === undefined) return 0;
  if (typeof priceInput === "number") return isNaN(priceInput) ? 0 : priceInput;
  const numericString = String(priceInput).replace(/[^0-9.-]+/g, "");
  const parsed = parseFloat(numericString);
  return isNaN(parsed) ? 0 : parsed;
};

// Define the donation product variant ID here
const DONATION_PRODUCT_VARIANT_ID = "gid://shopify/ProductVariant/46334706581757";

function CartPageContent() {
  const {
    cart,
    loading: cartContextLoading, 
    isInitializing,
    error: cartContextError,
    updateLineItem,
    removeLineItem,
    clearCartError,
    clearCartAndCreateNew, 
    isFirstTimeCustomer,
  } = useCart();
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter(); 

  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null);
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false); 
  const [checkoutMessage, setCheckoutMessage] = useState<string | null>(null); 

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
    if (cartContextError) {
      const timer = setTimeout(() => clearCartError(), 5000);
      return () => clearTimeout(timer);
    }
  }, [cartContextError, clearCartError]);

  const lineItemsWithDisplayPrice = useMemo(() => {
    if (!cart?.lines?.edges) return [];
    return cart.lines.edges.map((edge) => {
      const line = edge.node;
      let displayPrice = parsePrice(line.merchandise.priceV2.amount); 
      let isCustomizedEyeglass = false;
      let finalCalculatedPrice = displayPrice; 

      const finalPriceAttr = line.attributes.find(
        (attr) => attr.key === "_finalCalculatedPrice"
      );

      if (finalPriceAttr) {
        const parsedFinalPrice = parsePrice(finalPriceAttr.value);
        if (parsedFinalPrice > 0) {
          finalCalculatedPrice = parsedFinalPrice; 
          isCustomizedEyeglass = true;
        }
      }
      return {
        ...line,
        merchandiseId: line.merchandise.id, 
        customizedUnitPrice: finalCalculatedPrice, 
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
  
  const uiCalculatedSubtotal = lineItemsWithDisplayPrice.reduce(
    (acc, item) => acc + item.displayTotalPrice,
    0
  );

  const discountAmount = isFirstTimeCustomer ? uiCalculatedSubtotal * 0.20 : 0;
  const finalSubtotal = uiCalculatedSubtotal - discountAmount;
  
  const currencyCode = cart?.cost?.subtotalAmount?.currencyCode || "USD";

  const handleProceedToCheckout = async () => {
    setCheckoutMessage(null); 
    setIsProcessingCheckout(true);

    if (sessionStatus === "loading") {
      setCheckoutMessage("Verifying your session...");
      return; 
    }

    if (!session) {
      setCheckoutMessage("Redirecting to sign in...");
      const currentPath = window.location.pathname + window.location.search;
      router.push(`/auth/signin?callbackUrl=${encodeURIComponent(currentPath)}`); 
      return;
    }

    if (!lineItemsWithDisplayPrice || lineItemsWithDisplayPrice.length === 0) {
      setCheckoutMessage("Your cart is empty.");
      setIsProcessingCheckout(false);
      return;
    }

    const draftOrderLineItems = lineItemsWithDisplayPrice.map((item) => ({
      variantId: item.merchandiseId, 
      quantity: item.quantity,
      customizedPrice: item.customizedUnitPrice.toFixed(2), 
      attributes: item.attributes.map((attr) => ({
        key: attr.key,
        value: attr.value,
      })),
      title: item.title, 
    }));

    const customerInfoPayload: any = {};
    if (session?.user?.email) { 
      customerInfoPayload.email = session.user.email;
    }
    
    try {
      setCheckoutMessage("Processing your order...");
      
      const cartToken = cart?.checkoutUrl.split('/cart/')[1]?.split('?')[0];
      if (!cartToken) {
          throw new Error("Could not determine cart token for reordering.");
      }

      const response = await fetch("/api/checkout/create-draft-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lineItems: draftOrderLineItems,
          customerInfo: customerInfoPayload,
          cartToken: cartToken, 
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to create draft order.");
      }

      if (result.invoiceUrl) {
        setCheckoutMessage("Redirecting to Shopify checkout...");
        await clearCartAndCreateNew(); 
        window.location.href = result.invoiceUrl; 
      } else {
        throw new Error("Invoice URL not received from draft order creation.");
      }
    } catch (err: any) {
      console.error("Error proceeding to draft order checkout:", err);
      setCheckoutMessage(
        err.message ||
          "An unexpected error occurred while preparing your order."
      );
       setIsProcessingCheckout(false); 
    } 
  };
  
  if (isInitializing || (cartContextLoading && !cart)) { 
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 py-8 md:py-12 px-2 xs:px-4">
      <div className="container mx-auto max-w-4xl"> 
        <header className="mb-6 md:mb-10">
          <Link
            href="/"
            className="flex items-center text-xs xs:text-sm text-gray-600 hover:text-black mb-4 sm:mb-6 group"
          >
            <ArrowLeft
              size={16} 
              className="mr-1.5 xs:mr-2 group-hover:-translate-x-1 transition-transform duration-200"
            />
            Continue Shopping
          </Link>
          <h1 className="text-2xl xs:text-3xl md:text-4xl font-bold tracking-tight text-gray-800">
            Your Shopping Cart
          </h1>
        </header>

        {cartContextError && ( 
          <div
            className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 sm:p-4 rounded-md shadow-md mb-6 text-sm"
            role="alert"
          >
            <div className="flex">
              <div className="py-1">
                <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-red-500 mr-2 sm:mr-3" />
              </div>
              <div>
                <p className="font-bold">Cart Error</p>
                <p>{cartContextError}</p>
              </div>
            </div>
          </div>
        )}
        {checkoutMessage && (
          <div
            className={`p-3 sm:p-4 rounded-md shadow-md mb-6 border-l-4 text-sm ${
              checkoutMessage.toLowerCase().includes("error") || checkoutMessage.toLowerCase().includes("failed")
                ? "bg-red-100 border-red-500 text-red-700"
                : "bg-blue-100 border-blue-500 text-blue-700" 
            }`}
            role="alert"
          >
            <div className="flex items-center">
              <div className="py-1">
                {checkoutMessage.toLowerCase().includes("error") || checkoutMessage.toLowerCase().includes("failed") ? (
                  <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3" />
                ) : checkoutMessage.toLowerCase().includes("sign in") ? (
                  <LogIn className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3" />
                ) : ( 
                  <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin mr-2 sm:mr-3" />
                )}
              </div>
              <p>{checkoutMessage}</p>
            </div>
          </div>
        )}

        {!cart || lineItemsWithDisplayPrice.length === 0 ? (
          <div className="text-center py-12 sm:py-16 bg-white rounded-lg shadow-xl">
            <ShoppingBag className="h-16 w-16 sm:h-20 sm:w-20 text-gray-300 mx-auto mb-4 sm:mb-6" />
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-700 mb-2 sm:mb-3">
              Your cart is empty
            </h2>
            <p className="text-gray-500 mb-6 sm:mb-8 text-sm sm:text-base">
              Looks like you haven&apos;t added anything to your cart yet.
            </p>
            <Link
              href="/"
              className="px-6 py-2.5 sm:px-8 sm:py-3 bg-black text-white font-semibold text-xs sm:text-sm rounded-lg shadow-md hover:bg-gray-800 transition-colors duration-150 ease-in-out transform hover:scale-105"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="bg-white p-3 xs:p-4 sm:p-6 md:p-8 rounded-xl shadow-xl"> 
            <ul role="list" className="divide-y divide-gray-200">
              {lineItemsWithDisplayPrice.map((line) => {
                const isDonation = line.merchandise.id === DONATION_PRODUCT_VARIANT_ID;
                const itemDiscount = isFirstTimeCustomer ? line.displayTotalPrice * 0.20 : 0;
                const itemFinalPrice = line.displayTotalPrice - itemDiscount;

                return (
                  <li key={line.id} className="flex flex-col md:flex-row py-4 xs:py-6 sm:py-8"> 
                    <div className="flex-shrink-0 w-20 h-20 xs:w-24 xs:h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 border border-gray-200 rounded-md overflow-hidden mx-auto md:mx-0"> 
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
                      />
                    </div>
                    <div className="ml-0 md:ml-4 mt-3 md:mt-0 flex-1 flex flex-col"> 
                      <div>
                        <div className="flex flex-col md:flex-row justify-between text-sm sm:text-base font-medium text-gray-900"> 
                          <h3 className="mb-1 md:mb-0 break-words md:pr-2">  
                            <Link
                              href={`/products/${line.merchandise.product.handle}`}
                              className="hover:underline"
                            >
                              {line.title}
                            </Link>
                          </h3>
                          <div className="flex-shrink-0 self-start md:self-auto text-right">
                              {isFirstTimeCustomer ? (
                                  <div className="flex flex-col items-end">
                                      <p className="text-black font-bold">${itemFinalPrice.toFixed(2)}</p>
                                      <p className="text-red-600 line-through text-xs">${line.displayTotalPrice.toFixed(2)}</p>
                                  </div>
                              ) : (
                                  <p>${line.displayTotalPrice.toFixed(2)}</p>
                              )}
                          </div>
                        </div>
                        {line.attributes && line.attributes.length > 0 && (
                          <div className="mt-1 space-y-0.5">
                            {line.attributes
                              .filter(
                                (attr) => attr.key !== "_finalCalculatedPrice" 
                              )
                              .map((attr) => (
                                <p key={attr.key} className="text-xs text-gray-500 break-words">
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
                      <div className="flex-1 flex flex-col md:flex-row items-start md:items-center justify-between text-xs sm:text-sm mt-3 md:mt-4 gap-3 md:gap-0"> 
                        {isDonation ? (
                            <div className="flex items-center">
                                <p className="text-gray-600 font-medium">Quantity: 1</p>
                            </div>
                        ) : (
                            <div className="flex items-center border border-gray-300 rounded">
                                <button
                                onClick={() => handleQuantityChange(line.id, line.quantity - 1)}
                                disabled={updatingItemId === line.id || line.quantity <= 1 || isProcessingCheckout }
                                className="px-2 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50 rounded-l"
                                aria-label="Decrease quantity"
                                > &ndash; </button>
                                <span className="px-2.5 sm:px-3 py-1 text-center w-8 sm:w-10 border-l border-r border-gray-300">
                                {updatingItemId === line.id && cartContextLoading ? (
                                    <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin mx-auto" />
                                ) : ( line.quantity )}
                                </span>
                                <button
                                onClick={() => handleQuantityChange(line.id, line.quantity + 1)}
                                disabled={updatingItemId === line.id || isProcessingCheckout}
                                className="px-2 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50 rounded-r"
                                aria-label="Increase quantity"
                                > + </button>
                            </div>
                        )}

                        <div className="flex mt-2 md:mt-0"> 
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(line.id)}
                            disabled={updatingItemId === line.id || isProcessingCheckout || isDonation}
                            className="font-medium text-red-600 hover:text-red-500 flex items-center disabled:opacity-50 disabled:text-red-300 disabled:cursor-not-allowed px-2 py-1 rounded-md hover:bg-red-50"
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
                )
              })}
            </ul>

            <div className="border-t border-gray-200 pt-6 mt-6">
              <div className="space-y-1 text-sm text-gray-700">
                  <div className="flex justify-between">
                      <p>Subtotal</p>
                      <p>${uiCalculatedSubtotal.toFixed(2)}</p>
                  </div>
                  {isFirstTimeCustomer && (
                    <div className="flex justify-between text-green-600 font-medium">
                        <p className="flex items-center gap-1"><Tag size={14} /> First-Time Discount (20%)</p>
                        <p>-${discountAmount.toFixed(2)}</p>
                    </div>
                  )}
                  {cart?.cost.totalTaxAmount && parsePrice(cart.cost.totalTaxAmount.amount) > 0 && (
                      <div className="flex justify-between text-sm text-gray-600">
                          <p>Taxes (estimated)</p>
                          <p>${parsePrice(cart.cost.totalTaxAmount.amount).toFixed(2)}</p>
                      </div>
                  )}
              </div>

              <div className="flex justify-between text-base font-bold text-gray-900 mt-4 pt-4 border-t">
                  <p>Estimated Total</p>
                  <p>${finalSubtotal.toFixed(2)}</p>
              </div>

              <p className="mt-1 text-xs sm:text-sm text-gray-500">
                Shipping and final taxes calculated at Shopify checkout.
              </p>
              <div className="mt-6">
                <button
                  onClick={handleProceedToCheckout}
                  disabled={isProcessingCheckout || cartContextLoading || sessionStatus === "loading"}
                  className="w-full flex items-center justify-center rounded-md border border-transparent bg-black px-4 py-2.5 sm:px-6 sm:py-3 text-sm sm:text-base font-medium text-white shadow-sm hover:bg-gray-800 transition-colors duration-150 ease-in-out disabled:opacity-50"
                >
                  {isProcessingCheckout || cartContextLoading || sessionStatus === "loading" ? (
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  ) : (
                    <CreditCard className="w-5 w-5 mr-2" />
                  )}
                  Proceed to Secure Checkout
                </button>
              </div>
              <div className="mt-6 flex justify-center text-center text-xs sm:text-sm text-gray-500">
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
}

export default function CartPage() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center min-h-screen"><Loader2 className="h-12 w-12 animate-spin"/></div>}>
            <CartPageContent />
        </Suspense>
    )
}
