// File: src/app/auth/signin/page.tsx
"use client"; // Keep this for the outer page component as well

import { useState, FormEvent, ChangeEvent, useEffect, Suspense } from "react"; // Added Suspense
import {
  signIn,
  getProviders,
  LiteralUnion,
  ClientSafeProvider,
} from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Logo from "@/assets/navBarLogo.png"; // Adjust path as necessary
import {
  Chrome,
  Apple,
  Eye,
  EyeOff,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { BuiltInProviderType } from "next-auth/providers/index";

type Providers = Record<
  LiteralUnion<BuiltInProviderType>,
  ClientSafeProvider
> | null;

// This component will contain the logic that uses useSearchParams
function SignInFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams(); // Now used inside this dedicated component
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const errorParam = searchParams.get("error");

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null); // Initialize with null
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [providers, setProviders] = useState<Providers>(null);

  useEffect(() => {
    const fetchProviders = async () => {
      const res = await getProviders();
      setProviders(res);
    };
    fetchProviders();
  }, []);

  useEffect(() => {
    // Update formError when errorParam changes
    if (errorParam) {
      let decodedError = decodeURIComponent(errorParam);
      if (decodedError === "CredentialsSignin") {
        setFormError("Invalid email or password. Please try again.");
      } else if (decodedError === "OAuthAccountNotLinked") {
        setFormError(
          "This email is already associated with another provider. Try signing in with that provider."
        );
      } else if (decodedError === "Callback") {
        setFormError(
          "There was an issue with the sign-in provider. Please try again or use a different method."
        );
      } else {
        setFormError(decodedError); // Use the error message directly if it's custom
      }
    } else {
      setFormError(null); // Clear error if no errorParam
    }
  }, [errorParam]);

  const handleCredentialsSignIn = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFormError(null);
    setSuccessMessage(null);

    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
      callbackUrl: callbackUrl,
    });

    setLoading(false);
    if (result?.error) {
      // Error messages are now handled by the useEffect listening to errorParam
      // but we can still set a generic one if needed, or rely on the redirect with error.
      // For direct feedback without waiting for redirect and param parsing:
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
    setLoading(true);
    setFormError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, firstName, lastName }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Sign up failed.");
      }

      setSuccessMessage("Account created successfully! Please sign in.");
      setIsSignUp(false);
      setEmail(email);
      setPassword("");
      setConfirmPassword("");
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
              className="absolute inset-y-0 right-0 top-6 pr-3 flex items-center text-sm leading-5"
            >
              {showPassword ? (
                <EyeOff size={20} className="text-gray-500" />
              ) : (
                <Eye size={20} className="text-gray-500" />
              )}
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
              className="absolute inset-y-0 right-0 top-6 pr-3 flex items-center text-sm leading-5"
            >
              {showConfirmPassword ? (
                <EyeOff size={20} className="text-gray-500" />
              ) : (
                <Eye size={20} className="text-gray-500" />
              )}
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
    // Sign In form
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
            className="absolute inset-y-0 right-0 top-6 pr-3 flex items-center text-sm leading-5"
          >
            {showPassword ? (
              <EyeOff size={20} className="text-gray-500" />
            ) : (
              <Eye size={20} className="text-gray-500" />
            )}
          </button>
        </div>
        <div className="flex items-center justify-between">
          <div className="text-sm">
            {/* TODO: Implement forgot password functionality */}
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
          {formError && (
            <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-400 text-red-700 flex items-center">
              <AlertTriangle size={20} className="mr-2" />
              <p className="text-sm">{formError}</p>
            </div>
          )}
          {successMessage && (
            <div className="mb-4 p-3 bg-green-50 border-l-4 border-green-400 text-green-700">
              <p className="text-sm">{successMessage}</p>
            </div>
          )}

          {renderForm()}

          {providers &&
            Object.values(providers).filter((p) => p.id !== "credentials")
              .length > 0 && (
              <>
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
                </div>

                <div className="mt-6 grid grid-cols-1 gap-3">
                  {Object.values(providers).map((provider) => {
                    if (provider.id === "credentials") return null;
                    const Icon =
                      provider.id === "google"
                        ? Chrome
                        : provider.id === "apple"
                        ? Apple
                        : null;
                    return (
                      <div key={provider.name}>
                        <button
                          onClick={() => signIn(provider.id, { callbackUrl })}
                          disabled={loading}
                          className="w-full inline-flex justify-center items-center py-2.5 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50"
                        >
                          {Icon && <Icon size={20} className="mr-2" />}
                          {provider.name}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
        </div>
      </div>
    </div>
  );
}

// The main page component now wraps SignInFormContent in Suspense
export default function SignInPageContainer() {
  return (
    <Suspense fallback={<SignInPageLoadingFallback />}>
      <SignInFormContent />
    </Suspense>
  );
}

// A simple fallback component to show while searchParams are loading
function SignInPageLoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex flex-col justify-center items-center py-12 sm:px-6 lg:px-8">
      <Loader2 className="h-12 w-12 animate-spin text-black" />
      <p className="mt-4 text-gray-600">Loading sign-in options...</p>
    </div>
  );
}
