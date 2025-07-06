// src/app/auth/verify/page.tsx
"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle, AlertTriangle, Loader2 } from "lucide-react";

function VerificationStatus() {
  const searchParams = useSearchParams();
  const status = searchParams.get("status");
  const message = searchParams.get("message");

  let content;

  if (status === "error") {
    let errorMessage = "An unknown error occurred.";
    if (message === "Missing_token") {
      errorMessage = "The verification link is missing a token.";
    } else if (message === "Invalid_or_expired_token") {
      errorMessage = "This verification link is invalid or has expired.";
    } else if (message === "Token_has_expired") {
      errorMessage =
        "Your verification link has expired. Please try signing up again.";
    }

    content = (
      <>
        <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-800">
          Verification Failed
        </h1>
        <p className="mt-2 text-gray-600">{errorMessage}</p>
        <Link
          href="/auth/signin"
          className="mt-6 inline-block px-6 py-2.5 bg-black text-white font-medium text-sm rounded-lg shadow-md hover:bg-gray-800 transition-colors"
        >
          Back to Sign Up
        </Link>
      </>
    );
  } else {
    // Default/loading state or success can be handled here if needed,
    // but the API redirects to signin on success.
    content = (
      <>
        <Loader2 className="h-16 w-16 animate-spin text-gray-400 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-800">Verifying...</h1>
        <p className="mt-2 text-gray-600">
          Please wait while we verify your account.
        </p>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg text-center">
        {content}
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <Loader2 className="h-12 w-12 animate-spin" />
        </div>
      }
    >
      <VerificationStatus />
    </Suspense>
  );
}
