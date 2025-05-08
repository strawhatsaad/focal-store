"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronUpIcon } from "@heroicons/react/24/outline";
import { twMerge } from "tailwind-merge";

interface FAQItemProps {
  title: string;
  children: React.ReactNode;
  openFlag: boolean;
  bgWhite?: boolean;
}

export default function FAQItem({
  title,
  children,
  openFlag,
  bgWhite,
}: FAQItemProps) {
  const [open, setOpen] = useState(openFlag);
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (open && contentRef.current) {
      setHeight(contentRef.current.scrollHeight);
    } else {
      setHeight(0);
    }
  }, [open]);

  return (
    <div
      className={twMerge(
        "border-t border-gray-200 pt-6",
        bgWhite ? "bg-white p-3 rounded-xl" : ""
      )}
    >
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full justify-between items-center text-left text-lg md:text-xl font-semibold text-gray-900 hover:text-blue-600"
      >
        <span>{title}</span>
        <ChevronUpIcon
          className={`h-5 w-5 transition-transform duration-300 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      <div
        ref={contentRef}
        style={{ maxHeight: `${height}px` }}
        className="transition-all duration-500 ease-in-out overflow-hidden"
      >
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}
