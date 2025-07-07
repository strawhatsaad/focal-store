// src/components/ScrollToTop.tsx
"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * A client component that listens for changes in the URL pathname
 * and scrolls the window to the top (0, 0) on every navigation.
 * This ensures users always start at the top of a new page.
 */
export default function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    // The `window.scrollTo` method scrolls the window to a particular
    // place in the document. (0, 0) means the top-left corner.
    window.scrollTo(0, 0);
  }, [pathname]); // The effect re-runs every time the pathname changes.

  // This component does not render any visible UI.
  return null;
}
