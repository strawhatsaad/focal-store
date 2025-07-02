// File: src/components/AuthButtons.tsx
"use client";

import { signIn } from "next-auth/react";
import { Chrome } from "lucide-react";

const AuthButtons = () => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-center">
      <button
        onClick={() => signIn("google", { callbackUrl: "/" })}
        className="w-full flex items-center justify-center gap-3 py-2.5 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        <Chrome className="h-5 w-5" />
        Continue with Google
      </button>
    </div>
  );
};

export default AuthButtons;
