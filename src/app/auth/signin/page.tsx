// File: src/app/auth/signin/page.tsx
"use client";

import { useState, FormEvent, useEffect, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Logo from "@/assets/navBarLogo.png";
import { Eye, EyeOff, AlertTriangle, Loader2, CheckCircle } from "lucide-react";
import AuthButtons from "@/components/AuthButtons";

function SignInFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const errorParam = searchParams.get("error");
  const reasonParam = searchParams.get("reason");
  const verifiedParam = searchParams.get("verified");

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  useEffect(() => {
    if (reasonParam === "orderAttempt") {
      setInfoMessage("You need to be logged in to order Contacts and Glasses.");
    } else {
      setInfoMessage(null);
    }

    if (verifiedParam === "true") {
      setSuccessMessage("Your email has been verified! You can now sign in.");
    }

    if (errorParam) {
      let decodedError = decodeURIComponent(errorParam);
      if (decodedError === "CredentialsSignin") {
        setFormError("Invalid email or password. Please try again.");
      } else if (
        decodedError.includes("Shopify API request failed") ||
        decodedError.includes("Invalid credentials")
      ) {
        setFormError("Login failed. Please check your email and password.");
      } else {
        setFormError(decodedError);
      }
    } else {
      setFormError(null);
    }
  }, [errorParam, reasonParam, verifiedParam]);

  const handleCredentialsSignIn = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFormError(null);
    setInfoMessage(null);
    setSuccessMessage(null);

    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
      callbackUrl: callbackUrl,
    });

    setLoading(false);
    if (result?.error) {
      if (result.error === "CredentialsSignin") {
        setFormError("Invalid email or password. Please try again.");
      } else {
        setFormError(result.error);
      }
    } else if (result?.ok && result?.url) {
      router.push(result.url);
    } else if (result?.ok && !result.url) {
      router.push(callbackUrl);
    }
  };

  const handleSignUp = async (e: FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setFormError("Passwords do not match.");
      return;
    }
    if (password.length < 5) {
      setFormError("Password must be at least 5 characters long.");
      return;
    }
    setLoading(true);
    setFormError(null);
    setInfoMessage(null);
    setSuccessMessage(null);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, firstName, lastName }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(
          data.message || "Sign up failed due to an unknown error."
        );
      }
      setSuccessMessage(
        "Success! A verification link has been sent to your email address. Please check your inbox to complete your registration."
      );
      // Don't switch form, keep showing the success message
    } catch (err: any) {
      setFormError(
        err.message || "An unexpected error occurred during sign up."
      );
    } finally {
      setLoading(false);
    }
  };

  const renderForm = () => {
    if (isSignUp) {
      return (
        <form onSubmit={handleSignUp} className="space-y-5">
          <div>
            <label
              htmlFor="firstName"
              className="block text-sm font-medium text-gray-700"
            >
              First Name
            </label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black sm:text-sm"
            />
          </div>
          <div>
            <label
              htmlFor="lastName"
              className="block text-sm font-medium text-gray-700"
            >
              Last Name
            </label>
            <input
              id="lastName"
              name="lastName"
              type="text"
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black sm:text-sm"
            />
          </div>
          <div>
            <label
              htmlFor="email-signup"
              className="block text-sm font-medium text-gray-700"
            >
              Email address
            </label>
            <input
              id="email-signup"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black sm:text-sm"
            />
          </div>
          <div className="relative">
            <label
              htmlFor="password-signup"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              id="password-signup"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black sm:text-sm"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 top-6 pr-3 flex items-center text-sm leading-5 text-gray-500 hover:text-gray-700"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          <div className="relative">
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700"
            >
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black sm:text-sm"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 top-6 pr-3 flex items-center text-sm leading-5 text-gray-500 hover:text-gray-700"
              aria-label={
                showConfirmPassword
                  ? "Hide confirm password"
                  : "Show confirm password"
              }
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="animate-spin h-5 w-5" />
              ) : (
                "Create Account"
              )}
            </button>
          </div>
        </form>
      );
    }
    return (
      <form onSubmit={handleCredentialsSignIn} className="space-y-5">
        <div>
          <label
            htmlFor="email-signin"
            className="block text-sm font-medium text-gray-700"
          >
            Email address
          </label>
          <input
            id="email-signin"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black sm:text-sm"
          />
        </div>
        <div className="relative">
          <label
            htmlFor="password-signin"
            className="block text-sm font-medium text-gray-700"
          >
            Password
          </label>
          <input
            id="password-signin"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black sm:text-sm"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 top-6 pr-3 flex items-center text-sm leading-5 text-gray-500 hover:text-gray-700"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        <div className="flex items-center justify-between">
          <div className="text-sm">
            <a href="#" className="font-medium text-black hover:text-gray-700">
              Forgot your password?
            </a>
          </div>
        </div>
        <div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin h-5 w-5" /> : "Sign In"}
          </button>
        </div>
      </form>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/" className="flex justify-center">
          <Image
            src={Logo}
            alt="Focal Logo"
            width={150}
            height={50}
            priority
            className="hover:opacity-80 transition-opacity"
          />
        </Link>
        <h2 className="mt-6 text-center text-2xl md:text-3xl font-bold tracking-tight text-gray-900">
          {isSignUp ? "Create your account" : "Sign in to your account"}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{" "}
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setFormError(null);
              setSuccessMessage(null);
              setInfoMessage(null);
            }}
            className="font-medium text-black hover:text-gray-700"
          >
            {isSignUp
              ? "sign in to an existing account"
              : "create a new account"}
          </button>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl rounded-lg sm:px-10">
          {infoMessage && (
            <div className="mb-4 p-3 bg-blue-50 border-l-4 border-blue-400 text-blue-600 flex items-center rounded-md">
              <AlertTriangle size={20} className="mr-2 flex-shrink-0" />
              <p className="text-sm">{infoMessage}</p>
            </div>
          )}
          {formError && (
            <div className="mb-4 p-3 bg-red-100 border-l-4 border-red-400 text-red-700 flex items-center rounded-md">
              <AlertTriangle size={20} className="mr-2 flex-shrink-0" />
              <p className="text-sm">{formError}</p>
            </div>
          )}
          {successMessage && (
            <div className="mb-4 p-3 bg-green-100 border-l-4 border-green-500 text-green-700 rounded-md flex items-center">
              <CheckCircle size={20} className="mr-2 flex-shrink-0" />
              <p className="text-sm">{successMessage}</p>
            </div>
          )}

          {successMessage && isSignUp ? null : (
            <>
              {renderForm()}
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">
                      Or continue with
                    </span>
                  </div>
                </div>
                <div className="mt-6">
                  <AuthButtons />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SignInPageContainer() {
  return (
    <Suspense fallback={<SignInPageLoadingFallback />}>
      <SignInFormContent />
    </Suspense>
  );
}

function SignInPageLoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex flex-col justify-center items-center py-12 sm:px-6 lg:px-8">
      <Loader2 className="h-12 w-12 animate-spin text-black" />
      <p className="mt-4 text-gray-600">Loading sign-in page...</p>
    </div>
  );
}
