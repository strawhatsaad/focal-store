// src/app/layout.tsx
import type { Metadata } from "next";
import { DM_Sans } from "next/font/google"; // Import DM_Sans
import "./globals.css";
import { Header } from "@/sections/HomePage/Header";
import { Footer } from "@/sections/HomePage/Footer";
import Providers from "./providers"; // For NextAuth SessionProvider
import { CartProvider } from "@/context/CartContext"; // For Cart Context

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
      {/* Apply the font variable and Tailwind's font-sans class */}
      <body className={`${dmSans.variable} font-sans antialiased`}>
        <Providers>
          {" "}
          {/* Wraps children with SessionProvider */}
          <CartProvider>
            <Header />
            <main className="min-h-screen">
              {" "}
              {/* Ensure main content area can fill screen */}
              {children}
            </main>
            <Footer />
          </CartProvider>
        </Providers>
      </body>
    </html>
  );
}
