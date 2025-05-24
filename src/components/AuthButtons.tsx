// File: src/components/AuthButtons.tsx
"use client";

import { signIn } from "next-auth/react";
import { Chrome, Apple } from "lucide-react"; // Using lucide-react for icons

const AuthButtons = () => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-center">
      <button
        onClick={() => signIn("google", { callbackUrl: "/" })}
        className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 w-full sm:w-auto transition-colors duration-150 ease-in-out"
      >
        <Chrome size={20} />
        Continue with Google
      </button>
    </div>
  );
};

export default AuthButtons;
