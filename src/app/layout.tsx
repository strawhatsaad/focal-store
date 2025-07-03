// src/app/layout.tsx
import type { Metadata } from "next";
import { DM_Sans } from "next/font/google"; // Import DM_Sans
import "./globals.css";
import { Header } from "@/sections/HomePage/Header";
import { Footer } from "@/sections/HomePage/Footer";
import Providers from "./providers"; // For NextAuth SessionProvider
import { CartProvider } from "@/context/CartContext"; // For Cart Context
import { WishlistProvider } from "@/context/WishlistContext"; // Import WishlistProvider
import BottomPromoBar from "@/components/BottomPromoBar"; // Import the new component

// Configure DM Sans
const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"], // Specify the weights you'll use
  variable: "--font-dm-sans", // Define a CSS variable
  display: "swap",
});

export const metadata: Metadata = {
  title: "Focal Optical",
  description:
    "Shop high-quality, affordable contact lenses while making a change for the world.",
  openGraph: {
    title: "Focal Optical",
    description:
      "Shop high-quality, affordable contact lenses while making a change for the world.",
    url: "https://www.focaloptical.com",
    siteName: "Focal Optical",
    images: [
      {
        url: "https://www.focaloptical.com/_next/static/media/heroImage.6398e06a.png", // Absolute URL required
        width: 1200,
        height: 630,
        alt: "Focal Optical Contact Lenses Preview",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Focal Optical",
    description:
      "Shop high-quality, affordable contact lenses while making a change for the world.",
    images: [
      "https://www.focaloptical.com/_next/static/media/heroImage.6398e06a.png",
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${dmSans.variable} font-sans antialiased`}>
        <Providers>
          <CartProvider>
            <WishlistProvider>
              <Header />
              <main className="min-h-screen pb-16">{children}</main>{" "}
              {/* Add padding-bottom to avoid overlap */}
              <Footer />
              <BottomPromoBar /> {/* Add the new component here */}
            </WishlistProvider>
          </CartProvider>
        </Providers>
      </body>
    </html>
  );
}
