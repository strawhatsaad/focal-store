// File: src/sections/HomePage/Header.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Logo from "@/assets/navBarLogo.png"; // Ensure this path is correct
import {
  HeartIcon,
  SearchIcon,
  ShoppingCartIcon,
  LogOut,
  UserCircle,
  LogIn,
} from "lucide-react"; // Added LogIn
import AuthButtons from "@/components/AuthButtons"; // AuthButtons will be used on the /auth/signin page
import { twMerge } from "tailwind-merge";
import { X, Menu } from "lucide-react";
import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation"; // For programmatic navigation

export const Header = () => {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter(); // Initialize router
  const isLoading = status === "loading";

  const toggleMobileMenu = () => {
    setMobileMenuOpen((prev) => !prev);
  };

  const navLinks = [
    { title: "Contact Lenses", href: "/pages/contact-lenses" },
    { title: "Eyewear", href: "/pages/eyewear" },
    { title: "Sunglasses", href: "/sunglasses" },
    { title: "Eyehealth", href: "/eyehealth" },
    { title: "Learning Center", href: "/learning-center" },
  ];

  const handleMobileSignInClick = () => {
    setMobileMenuOpen(false); // Close menu
    router.push("/auth/signin"); // Navigate to custom sign-in page
  };

  return (
    <header className="sticky top-0 z-30 bg-white backdrop-blur-sm shadow-sm">
      {/* Promo Bar */}
      <div className="flex justify-center items-center py-1 bg-gray-100 text-black text-xs md:text-sm">
        <p className="font-semibold tracking-normal cursor-default hidden md:block hover:scale-105 transition-all duration-350">
          First Order? Save 20% + free shipping 🎉
        </p>
        <p className="font-semibold tracking-normal cursor-default md:hidden">
          Save 20% + Free Shipping!
        </p>
      </div>

      {/* Main Header */}
      <div className="py-3 md:py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/">
              <Image
                src={Logo}
                alt="Focal Logo"
                className="hover:scale-105 transition-transform duration-300 w-[120px] h-auto md:w-[135px] lg:w-[160px]"
                priority
              />
            </Link>

            {/* Mobile Menu Toggle */}
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

            {/* Desktop Nav */}
            <nav className="hidden md:flex md:gap-3 lg:gap-5 text-black/70 items-center">
              {navLinks.map((link) => (
                <Link href={link.href} key={link.title}>
                  <span className="md:text-xs lg:text-sm font-medium hover:text-black hover:font-semibold transition-all duration-200 cursor-pointer">
                    {link.title}
                  </span>
                </Link>
              ))}

              {isLoading ? (
                <div className="h-8 w-20 bg-gray-200 rounded-full animate-pulse"></div>
              ) : session?.user ? (
                <>
                  <Link href="/account">
                    <span className="flex items-center gap-1 md:text-xs lg:text-sm font-medium hover:text-black hover:font-semibold transition-all duration-200 cursor-pointer">
                      <UserCircle size={18} />
                      {session.user.name || session.user.email}
                    </span>
                  </Link>
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="flex items-center gap-1 bg-red-500 text-white px-3 py-1.5 lg:px-4 lg:py-2 rounded-full text-xs lg:text-sm font-medium hover:bg-red-600 transition-all duration-200"
                  >
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </>
              ) : (
                <button
                  onClick={() => signIn(undefined, { callbackUrl: "/" })} // This directs to /auth/signin due to pages config
                  className="bg-black text-white px-4 py-1.5 lg:px-6 lg:py-2 rounded-full font-medium inline-flex items-center justify-center tracking-tight hover:bg-gray-800 hover:scale-105 transition-all duration-300 md:text-xs lg:text-sm"
                >
                  Sign in
                </button>
              )}

              <div className="flex items-center md:gap-2 lg:gap-3">
                <SearchIcon
                  strokeWidth={2.5}
                  color="#374151"
                  size={28}
                  className="hover:scale-110 transition-transform duration-200 cursor-pointer md:size-5 lg:size-6"
                />
                <Link href="/wishlist">
                  <HeartIcon
                    strokeWidth={2.5}
                    color="#374151"
                    size={28}
                    className="hover:scale-110 transition-transform duration-200 cursor-pointer md:size-5 lg:size-6"
                  />
                </Link>
                <Link href="/cart">
                  <ShoppingCartIcon
                    strokeWidth={2.5}
                    color="#374151"
                    size={28}
                    className="hover:scale-110 transition-transform duration-200 cursor-pointer md:size-5 lg:size-6"
                  />
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
              className="block text-lg font-semibold text-gray-800 hover:text-black transition-colors"
            >
              {link.title}
            </Link>
          ))}
          <hr className="my-4" />
          {isLoading ? (
            <div className="h-8 w-32 bg-gray-200 rounded-md animate-pulse mb-4"></div>
          ) : session?.user ? (
            <>
              <Link
                href="/account"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-lg font-semibold text-gray-800 hover:text-black transition-colors"
              >
                My Account ({session.user.name || session.user.email})
              </Link>
              <button
                onClick={() => {
                  signOut({ callbackUrl: "/" });
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left text-lg font-semibold text-red-600 hover:text-red-700 transition-colors py-2 flex items-center gap-2"
              >
                <LogOut size={20} /> Sign Out
              </button>
            </>
          ) : (
            // Updated mobile sign-in section
            <button
              onClick={handleMobileSignInClick}
              className="w-full text-left text-lg font-semibold text-black hover:bg-gray-100 transition-colors py-3 px-2 rounded-md flex items-center gap-2"
            >
              <LogIn size={20} /> Sign In / Create Account
            </button>
          )}
          <hr className="my-4" />
          <div className="flex justify-start space-x-6 pt-4">
            <SearchIcon
              strokeWidth={2}
              size={24}
              className="text-gray-700 hover:text-black"
            />
            <Link href="/wishlist" onClick={() => setMobileMenuOpen(false)}>
              <HeartIcon
                strokeWidth={2}
                size={24}
                className="text-gray-700 hover:text-black"
              />
            </Link>
            <Link href="/cart" onClick={() => setMobileMenuOpen(false)}>
              <ShoppingCartIcon
                strokeWidth={2}
                size={24}
                className="text-gray-700 hover:text-black"
              />
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};
