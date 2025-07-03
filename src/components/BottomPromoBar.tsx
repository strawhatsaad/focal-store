"use client";

import { useState, useEffect } from "react";
import { X, Tag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useSession } from "next-auth/react"; // Import useSession

const BottomPromoBar = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { isFirstTimeCustomer } = useCart();
  const { status } = useSession(); // Get session status

  // Effect to control visibility based on user status and session storage
  useEffect(() => {
    // Don't do anything until we know the user's status
    if (isFirstTimeCustomer === undefined) {
      return;
    }

    const dismissed = sessionStorage.getItem("promoBarDismissed");

    // Show the bar if the user is a first-timer AND it hasn't been dismissed in this session
    if (isFirstTimeCustomer && !dismissed) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1500);
      return () => clearTimeout(timer);
    } else {
      // Hide it if they aren't a first-timer or if it has been dismissed
      setIsVisible(false);
    }
  }, [isFirstTimeCustomer, status]); // Re-evaluate when auth status changes

  // Effect to clear the dismissal flag when the user logs in or out
  useEffect(() => {
    // When the session status changes (e.g., user logs out and session becomes null, or new user logs in)
    // we clear the sessionStorage flag. This ensures that on a fresh login,
    // the bar can reappear if the user is still eligible.
    sessionStorage.removeItem("promoBarDismissed");
  }, [status]); // Dependency on session status

  const handleDismiss = () => {
    setIsVisible(false);
    // Use sessionStorage to remember the dismissal for the current browser session.
    // This will be cleared on logout/login by the effect above.
    sessionStorage.setItem("promoBarDismissed", "true");
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-gray-800 text-white transition-transform duration-500 ease-in-out transform animate-slide-up">
      <div className="container mx-auto px-4 py-2.5 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Tag className="h-5 w-5 text-yellow-300 flex-shrink-0" />
          <p className="text-xs sm:text-sm font-medium">
            <span className="font-bold">First Order?</span> Get 20% OFF + Free
            Shipping! Discount applied at checkout.
          </p>
        </div>
        <button
          onClick={handleDismiss}
          className="p-1 rounded-full hover:bg-gray-700 transition-colors"
          aria-label="Dismiss promotional message"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default BottomPromoBar;
