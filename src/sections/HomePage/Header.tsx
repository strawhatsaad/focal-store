// File: src/sections/HomePage/Header.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import Logo from "@/assets/navBarLogo.png";
import {
  HeartIcon,
  SearchIcon,
  ShoppingCartIcon,
  UserCircle,
  LogIn,
} from "lucide-react";
import { twMerge } from "tailwind-merge";
import { X, Menu } from "lucide-react";
import { useSession, signIn } from "next-auth/react"; 
import { useCart } from "@/context/CartContext"; 

export const Header = () => {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: session, status } = useSession();
  const { cart } = useCart();
  const [totalQuantity, setTotalQuantity] = useState(0);
  const isLoadingSession = status === "loading";

  useEffect(() => {
    if (cart) {
      setTotalQuantity(cart.totalQuantity || 0);
    } else {
      setTotalQuantity(0);
    }
  }, [cart]);

  const toggleMobileMenu = () => {
    setMobileMenuOpen((prev) => !prev);
  };

  const handleSignIn = () => {
    signIn(undefined, { callbackUrl: "/" });
  };

  const handleMobileSignInClick = () => {
    setMobileMenuOpen(false); 
    handleSignIn(); 
  };

  const navLinks = [
    { title: "Contact Lenses", href: "/pages/contact-lenses" },
    { title: "Eyewear", href: "/pages/eyewear" },
    { title: "Sunglasses", href: "/pages/sunglasses" },
    { title: "Eyehealth", href: "/pages/eyehealth" },
    { title: "Learning Center", href: "/pages/learning-center" },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white backdrop-blur-sm shadow-sm">
      <div className="flex justify-center items-center py-1 bg-gray-100 text-black text-xs md:text-sm">
        <p className="font-semibold tracking-normal cursor-default hidden md:block hover:scale-105 transition-all duration-350">
          First Order? Save 20% + free shipping 🎉
        </p>
        <p className="font-semibold tracking-normal cursor-default md:hidden">
          Save 20% + Free Shipping!
        </p>
      </div>

      <div className="py-3 md:py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <Image
                src={Logo}
                alt="Focal Logo"
                className="hover:scale-105 transition-transform duration-300 w-[120px] h-auto md:w-[135px] lg:w-[160px]"
                priority
              />
            </Link>

            <div
              onClick={toggleMobileMenu}
              className="md:hidden cursor-pointer z-50 relative w-7 h-7"
            >
              <Menu
                size={28}
                className={`absolute transition-all duration-300 ease-in-out ${
                  isMobileMenuOpen
                    ? "opacity-0 scale-90 rotate-45"
                    : "opacity-100 scale-100 rotate-0"
                }`}
              />
              <X
                size={28}
                className={`absolute transition-all duration-300 ease-in-out ${
                  isMobileMenuOpen
                    ? "opacity-100 scale-100 rotate-0"
                    : "opacity-0 scale-90 -rotate-45"
                }`}
              />
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex md:gap-3 lg:gap-5 text-black/70 items-center">
              {navLinks.map((link) => (
                <Link href={link.href} key={link.title} className="group"> {/* Added group for group-hover */}
                  <span 
                    className="inline-block md:text-xs lg:text-sm font-medium group-hover:text-black group-hover:font-semibold transition-all duration-300 ease-in-out cursor-pointer py-2 group-hover:scale-110"
                  >
                    {link.title}
                  </span>
                </Link>
              ))}

              {isLoadingSession ? (
                <div className="h-8 w-20 bg-gray-200 rounded-full animate-pulse"></div>
              ) : session?.user ? (
                <Link href="/account" className="group"> {/* Added group */}
                  <span className="flex items-center gap-1 md:text-xs lg:text-sm font-medium group-hover:text-black group-hover:font-semibold transition-all duration-300 ease-in-out cursor-pointer p-2 rounded-md group-hover:bg-gray-100 group-hover:scale-105"> {/* Adjusted scale to 105 for account link for balance */}
                    <UserCircle size={18} />
                    {session.user.name?.split(' ')[0] || session.user.email} 
                  </span>
                </Link>
              ) : (
                <button
                  onClick={handleSignIn} 
                  className="bg-black text-white px-4 py-1.5 lg:px-6 lg:py-2 rounded-full font-medium inline-flex items-center justify-center tracking-tight hover:bg-gray-800 hover:scale-105 transition-all duration-300 md:text-xs lg:text-sm"
                >
                  Sign in
                </button>
              )}

              <div className="flex items-center md:gap-2 lg:gap-3">
                <SearchIcon
                  strokeWidth={2.5}
                  color="#374151"
                  size={24}
                  className="hover:scale-110 transition-transform duration-200 cursor-pointer md:size-5 lg:size-6"
                />
                <Link href="/wishlist" aria-label="Wishlist">
                  <HeartIcon
                    strokeWidth={2.5}
                    color="#374151"
                    size={24}
                    className="hover:scale-110 transition-transform duration-200 cursor-pointer md:size-5 lg:size-6"
                  />
                </Link>
                <Link
                  href="/cart"
                  className="relative"
                  aria-label="Shopping Cart"
                > 
                  <ShoppingCartIcon
                    strokeWidth={2.5}
                    color="#374151"
                    size={24}
                    className="hover:scale-110 transition-transform duration-200 cursor-pointer md:size-5 lg:size-6"
                  />
                  {totalQuantity > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {totalQuantity}
                    </span>
                  )}
                </Link>
              </div>
            </nav>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      <div
        className={twMerge(
          "md:hidden fixed inset-x-0 top-0 z-40 pt-[70px] h-screen overflow-y-auto bg-white shadow-lg transition-transform duration-500 ease-in-out",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="px-6 py-8 space-y-5">
          {navLinks.map((link) => (
            <Link
              key={link.title}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block text-lg font-semibold text-gray-800 hover:text-black transition-all duration-300 ease-in-out py-2 hover:bg-gray-50 rounded-md px-2 hover:scale-110 transform" // Added hover:scale-110 and transform
            >
              {link.title}
            </Link>
          ))}
          <hr className="my-4" />
          {isLoadingSession ? (
            <div className="h-8 w-32 bg-gray-200 rounded-md animate-pulse mb-4"></div>
          ) : session?.user ? (
            <Link
              href="/account"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-lg font-semibold text-gray-800 hover:text-black transition-all duration-300 ease-in-out py-2 hover:bg-gray-50 rounded-md px-2 hover:scale-105 transform" // scale 105 for account link for balance
            >
              My Account ({session.user.name?.split(' ')[0] || session.user.email})
            </Link>
          ) : (
            <button
              onClick={handleMobileSignInClick} 
              className="w-full text-left text-lg font-semibold text-black hover:bg-gray-100 transition-all duration-300 ease-in-out py-3 px-2 rounded-md flex items-center gap-2 hover:scale-105 transform"
            >
              <LogIn size={20} /> Sign In / Create Account
            </button>
          )}
          <hr className="my-4" />
          <div className="flex justify-center space-x-6 pt-4">
            <SearchIcon
              strokeWidth={2.5}
              size={26}
              className="cursor-pointer hover:opacity-75 transition-all duration-200 ease-in-out hover:scale-110 transform"
            />
            <Link href="/wishlist" onClick={() => setMobileMenuOpen(false)}>
              <HeartIcon
                strokeWidth={2.5}
                size={26}
                className="cursor-pointer hover:opacity-75 transition-all duration-200 ease-in-out hover:scale-110 transform"
              />
            </Link>
            <Link
              href="/cart"
              className="relative"
              onClick={() => setMobileMenuOpen(false)}
            > 
              <ShoppingCartIcon
                strokeWidth={2.5}
                size={26}
                className="cursor-pointer hover:opacity-75 transition-all duration-200 ease-in-out hover:scale-110 transform"
              />
              {totalQuantity > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                  {totalQuantity}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};
