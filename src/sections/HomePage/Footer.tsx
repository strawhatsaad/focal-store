// src/sections/HomePage/Footer.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import Logo from "@/assets/NavBarFocalLogo 1.png";
import ArrowIcon from "@/assets/arrow-right.svg";
import {
  Facebook,
  InstagramIcon,
  MailIcon,
  MessageSquareIcon,
  PhoneCall,
  Youtube,
} from "lucide-react";
import visaIcon from "@/assets/visa.png";
import mastercardIcon from "@/assets/mastercard.png";
import discoverIcon from "@/assets/discover.png";
import paypalIcon from "@/assets/paypal.png";
import americanExpressIcon from "@/assets/american-express.png";
import fsaHsaIcon from "@/assets/fsahsa.png";

export const Footer = () => {
  const footerLinkSections = [
    {
      title: "About us",
      links: [
        { name: "Our Story", href: "/about/story" },
        { name: "Community", href: "/about/community" },
        { name: "Careers", href: "/about/careers" },
      ],
    },
    {
      title: "Help",
      links: [
        { name: "How to order", href: "/help/how-to-order" },
        {
          name: "How to read your prescription",
          href: "/how-to-read-prescriptions",
        },
        { name: "Privacy Policy", href: "/pages/privacy-policy" },
        { name: "Terms of Use", href: "/pages/terms-of-use" },
        {
          name: "Notice of Privacy Practices",
          href: "/pages/notice-of-privacy-practices",
        },
        {
          name: "California Transparency Act",
          href: "/pages/california-transparency-act",
        },
        {
          name: "Washington Consumer Health Data Privacy Policy",
          href: "/pages/washington-health-privacy",
        },
        { name: "Accessibility Statement", href: "/pages/accessibility" }, // Added new link
        { name: "Contact us", href: "/contact-us" },
      ],
    },
    {
      title: "My Account",
      links: [
        { name: "Order Status", href: "/account/orders" },
        { name: "Reorder", href: "/account/reorder" },
        { name: "Upload Prescription", href: "/account/prescriptions" },
        { name: "My prescription", href: "/account/prescriptions" },
        { name: "My subscriptions", href: "/account/subscriptions" },
      ],
    },
    {
      title: "Resources",
      links: [
        { name: "Eyewear", href: "/pages/eyewear" },
        { name: "Sunglasses", href: "/pages/sunglasses" },
        { name: "Contact Lenses", href: "/pages/contact-lenses" },
        { name: "Offers & coupons", href: "/offers" },
      ],
    },
  ];

  return (
    <footer className="bg-black py-8 sm:py-10 text-white">
      <div className="container mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex flex-col lg:flex-row justify-between items-start gap-8 lg:gap-12 xl:gap-16">
          <div className="w-full lg:w-2/5 flex flex-col items-center lg:items-start gap-6 sm:gap-8">
            <div className="flex flex-col items-center lg:items-start gap-4 sm:gap-5">
              <Link
                href={"/"}
                className="block w-[120px] sm:w-[150px] md:w-[170px] hover:scale-105 transition-transform duration-[350ms]"
              >
                <div className="relative w-full">
                  <Image
                    src={Logo}
                    alt="Focal Logo"
                    layout="responsive"
                    width={Logo.width}
                    height={Logo.height}
                    sizes="(max-width: 639px) 120px, (max-width: 767px) 150px, 170px"
                  />
                </div>
              </Link>
              <h2 className="font-bold text-base sm:text-lg md:text-xl lg:text-2xl text-center lg:text-left">
                See the world clearly. Help the world see
              </h2>
            </div>
            <button className="hidden btn btn-text gap-1 p-0 md:flex items-center hover:font-bold hover:scale-105 transition-all duration-[350ms]">
              <span className="font-semibold text-white text-sm sm:text-base">
                Learn More
              </span>
              <ArrowIcon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </button>
            <div className="flex w-full justify-center lg:justify-start gap-3 sm:gap-4">
              <InstagramIcon className="w-8 h-8 sm:w-10 sm:h-10 md:w-[50px] md:h-[50px] text-white cursor-pointer hover:opacity-80" />
              <Facebook className="w-8 h-8 sm:w-10 sm:h-10 md:w-[50px] md:h-[50px] text-white cursor-pointer hover:opacity-80" />
              <Youtube className="w-8 h-8 sm:w-10 sm:h-10 md:w-[50px] md:h-[50px] text-white cursor-pointer hover:opacity-80" />
            </div>
            <div className="w-full flex flex-col items-center lg:items-start">
              <p className="font-medium text-white/50 text-sm sm:text-base">
                We Accept
              </p>
              <div className="flex flex-wrap justify-center lg:justify-start gap-2 sm:gap-3 md:gap-4 mt-2 sm:mt-1">
                <Image
                  src={visaIcon}
                  alt="Visa"
                  className="h-6 sm:h-7 md:h-8 w-auto"
                />
                <Image
                  src={mastercardIcon}
                  alt="Mastercard"
                  className="h-6 sm:h-7 md:h-8 w-auto"
                />
                <Image
                  src={discoverIcon}
                  alt="Discover"
                  className="h-6 sm:h-7 md:h-8 w-auto"
                />
                <Image
                  src={americanExpressIcon}
                  alt="American Express"
                  className="h-6 sm:h-7 md:h-8 w-auto"
                />
                <Image
                  src={paypalIcon}
                  alt="PayPal"
                  className="h-6 sm:h-7 md:h-8 w-auto"
                />
                <Image
                  src={fsaHsaIcon}
                  alt="FSA/HSA"
                  className="h-6 sm:h-7 md:h-8 w-auto"
                />
              </div>
            </div>
          </div>

          <div className="w-full lg:w-3/5 flex flex-col mt-8 lg:mt-0 gap-8 sm:gap-10 md:gap-12">
            <div className="flex flex-col gap-3 sm:gap-4 text-center sm:text-left">
              <h2 className="font-bold text-xl sm:text-2xl md:text-2xl lg:text-3xl">
                We&apos;re here to help.
              </h2>
              <p className="font-medium text-sm sm:text-base md:text-sm lg:text-base">
                Real people with real answers in real time, 24/7.
              </p>
              <div className="flex flex-col sm:flex-row justify-center sm:justify-start items-center sm:items-start gap-3 sm:gap-4 mt-1 sm:mt-2 text-xs sm:text-sm">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <MailIcon size={16} className="sm:size-5" />
                  <Link href={"mailto:hello@focaloptical.com"}>
                    <span>hello@focaloptical.com</span>
                  </Link>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <MessageSquareIcon size={16} className="sm:size-5" />
                  <span>Chat with us</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-6 sm:gap-x-6 sm:gap-y-8 md:gap-8 text-center sm:text-left">
              {footerLinkSections.map((section) => (
                <div
                  key={section.title}
                  className="flex flex-col gap-2 sm:gap-2.5 md:gap-3 lg:gap-4"
                >
                  <h3 className="font-bold text-sm sm:text-base md:text-base lg:text-lg">
                    {section.title}
                  </h3>
                  {section.links.map((linkItem) => (
                    <Link href={linkItem.href} key={linkItem.name}>
                      <p className="text-xs sm:text-sm md:text-sm lg:text-base text-white/80 hover:text-white cursor-pointer">
                        {linkItem.name}
                      </p>
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="text-center text-xs text-white/50 mt-10 sm:mt-12 md:mt-16">
          © {new Date().getFullYear()} Focal Optical. All rights reserved.
        </div>
      </div>
    </footer>
  );
};
