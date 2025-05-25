// File: src/app/layout.tsx
import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import { twMerge } from "tailwind-merge";
import { Header } from "@/sections/HomePage/Header"; // Ensure this path is correct
import { Footer } from "@/sections/HomePage/Footer"; // Ensure this path is correct
import NextAuthProvider from "./providers"; // This should contain SessionProvider
import { CartProvider } from "@/context/CartContext"; // Ensure this path is correct
// SessionHandler import removed

const dmSans = DM_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Focal",
  description:
    "A place for you to buy eyewear and contact lenses while contributing to a good cause.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="relative">
      <body className={twMerge(dmSans.className, "antialiased bg-[#FFFFFF]")}>
        <NextAuthProvider>
          <CartProvider>
            {/* SessionHandler component removed */}
            <Header />
            <main className="min-h-screen">{children}</main>
            <Footer />
          </CartProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}
