// src/app/layout.tsx
import type { Metadata } from "next";
import { DM_Sans } from "next/font/google"; // Import DM_Sans
import "./globals.css";
import { Header } from "@/sections/HomePage/Header";
import { Footer } from "@/sections/HomePage/Footer";
import Providers from "./providers"; // For NextAuth SessionProvider
import { CartProvider } from "@/context/CartContext"; // For Cart Context
import { WishlistProvider } from "@/context/WishlistContext"; // Import WishlistProvider
import Head from "next/head";

// Configure DM Sans
const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"], // Specify the weights you'll use
  variable: "--font-dm-sans", // Define a CSS variable
  display: "swap",
});

export const metadata: Metadata = {
  title: "Focal Optical",
  description: "Your one-stop shop for eyewear and contact lenses.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <Head>
        <title>Focal Opticals</title>
        <meta property="og:title" content="Focal Opticals" />
        <meta
          property="og:description"
          content="Shop high-quality, affordable contact lenses while making a change for the world."
        />
        <meta
          property="og:image"
          content="https://www.focaloptical.com/_next/static/media/heroImage.6398e06a.png"
        />
        <meta property="og:url" content="https://yourdomain.com" />
        <meta property="og:type" content="website" />

        {/* Twitter Card (optional but recommended) */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Focal Opticals" />
        <meta
          name="twitter:description"
          content="Shop high-quality, affordable contact lenses while making a change for the world."
        />
        <meta
          name="twitter:image"
          content="https://www.focaloptical.com/_next/static/media/heroImage.6398e06a.png"
        />
      </Head>

      <body className={`${dmSans.variable} font-sans antialiased`}>
        <Providers>
          <CartProvider>
            <WishlistProvider>
              <Header />
              <main className="min-h-screen">{children}</main>
              <Footer />
            </WishlistProvider>
          </CartProvider>
        </Providers>
      </body>
    </html>
  );
}
