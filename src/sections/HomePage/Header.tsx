"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Logo from "@/assets/navBarLogo.png";
import { HeartIcon, SearchIcon, ShoppingCartIcon } from "lucide-react";
import LinkButton from "@/components/LinkButton";
import { twMerge } from "tailwind-merge";
import { X, Menu } from "lucide-react";

export const Header = () => {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen((prev) => !prev);
  };

  const navLinks = [
    { title: "Contact Lenses", href: "/contact-lenses" },
    { title: "Eyewear", href: "/eyewear" },
    { title: "Sunglasses", href: "/sunglasses" },
    { title: "Eyehealth", href: "/eyehealth" },
    { title: "Learning Center", href: "/learning-center" },
    { title: "Sign in", href: "/sign-in" },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white backdrop-blur-sm">
      {/* Promo Bar */}
      <div className="flex justify-center items-center py-1 bg-white text-black text-sm gap-3">
        <p className="text-black md:mt-5 md:-mb-3 lg:-mb-6 font-extrabold tracking-normal cursor-default hidden md:block hover:scale-110 transition-all duration-350">
          First Order? Save 20% + free shipping 🎉
        </p>
      </div>

      {/* Main Header */}
      <div className="sm:py-0 md:py-5 lg:pb-1">
        <div className="container">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/">
              <Image
                src={Logo}
                alt="Focal Logo"
                className="hover:scale-110 transition-all duration-350 sm:w-[140px] sm:h-[55px] md:-ml-3 md:w-[135px] md:h-[50px] lg:w-[180px] lg:h-[70px]"
              />
            </Link>

            {/* Mobile Menu Toggle */}
            <div
              onClick={toggleMobileMenu}
              className="md:hidden cursor-pointer z-30 relative w-7 h-7"
            >
              <Menu
                size={28}
                className={`absolute transition-all duration-500 ease-in-out ${
                  isMobileMenuOpen
                    ? "opacity-0 scale-90 rotate-45"
                    : "opacity-100 scale-100"
                }`}
              />
              <X
                size={28}
                className={`absolute transition-all duration-500 ease-in-out ${
                  isMobileMenuOpen
                    ? "opacity-100 scale-100 rotate-0"
                    : "opacity-0 scale-90 -rotate-45"
                }`}
              />
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex md:gap-4 lg:gap-6 text-black/60 items-center">
              {navLinks.slice(0, 5).map((link, i) => (
                <Link href={link.href} key={i}>
                  <LinkButton
                    title={link.title}
                    sectionId={`${link.title
                      .toLowerCase()
                      .replace(/\s/g, "-")}-btn`}
                    textStyles="md:text-xs lg:text-sm"
                    containerStyles="hover:font-bold hover:scale-110 transition-all duration-350"
                  />
                </Link>
              ))}

              <LinkButton
                title="Sign in"
                sectionId="sign-in-btn"
                textStyles="md:text-xs lg:text-sm"
                containerStyles="bg-black text-white px-4 py-2 md:py-1.5 lg:px-8 lg:py-2 rounded-full font-medium inline-flex items-center justify-center tracking-tight hover:font-bold hover:scale-110 transition-all duration-350"
              />

              {[SearchIcon, HeartIcon, ShoppingCartIcon].map((Icon, i) => (
                <Icon
                  key={i}
                  strokeWidth={3}
                  color="#000000"
                  size={32}
                  className="hover:scale-125 transition-all duration-350 md:size-6 lg:size-8"
                />
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu (drops vertically) */}
      <div
        className={twMerge(
          "md:hidden overflow-hidden bg-white shadow-md border-t border-gray-200 transition-all duration-[1000ms] ease-in-out transform flex flex-col justify-center items-center text-center",
          isMobileMenuOpen
            ? "max-h-[500px] opacity-100 scale-y-100"
            : "max-h-0 opacity-0 scale-y-95"
        )}
      >
        <div className="px-6 py-4 space-y-4">
          {navLinks.map((link, idx) => (
            <Link
              key={idx}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block text-base font-semibold text-black hover:underline"
            >
              {link.title}
            </Link>
          ))}

          <div className="flex justify-start space-x-6 pt-4">
            {[SearchIcon, HeartIcon, ShoppingCartIcon].map((Icon, idx) => (
              <Icon key={idx} strokeWidth={2.5} size={26} />
            ))}
          </div>
        </div>
      </div>
    </header>
  );
};
