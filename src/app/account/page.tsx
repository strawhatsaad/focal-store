// File: src/app/account/page.tsx
"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import {
  Loader2,
  UserCircle,
  Mail,
  LogOut,
  // ShoppingBag, // Removed as Order History is removed
  // MapPin, // Removed as Manage Addresses is removed
  FileText,
} from "lucide-react";

const AccountPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/auth/signin?callbackUrl=/account");
    }
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <Loader2 className="h-12 w-12 animate-spin text-black" />
        <p className="ml-3 text-lg font-medium text-gray-700">
          Loading account details...
        </p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50 text-center px-4">
        <UserCircle className="h-16 w-16 text-gray-400 mb-4" />
        <h1 className="text-2xl font-semibold text-gray-700 mb-2">
          Access Denied
        </h1>
        <p className="text-gray-500 mb-6">
          Please sign in to view your account details.
        </p>
        <button
          onClick={() => router.push("/auth/signin?callbackUrl=/account")}
          className="px-6 py-2.5 bg-black text-white font-medium text-sm rounded-lg shadow-md hover:bg-gray-800 transition-colors duration-150 ease-in-out"
        >
          Sign In
        </button>
      </div>
    );
  }

  const { user } = session;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 py-8 md:py-16 px-4">
      <div className="container mx-auto max-w-4xl">
        <header className="mb-10 md:mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-800">
            My Account
          </h1>
          <p className="mt-3 text-lg text-gray-600">
            Welcome back, {user?.name || user?.email || "Valued Customer"}!
            Manage your profile and view your activity.
          </p>
        </header>

        <div className="bg-white p-6 sm:p-8 md:p-10 rounded-xl shadow-xl space-y-8">
          <section className="pb-8 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
              {user?.image ? (
                <Image
                  src={user.image}
                  alt={user.name || "User profile picture"}
                  width={100}
                  height={100}
                  className="rounded-full border-4 border-gray-200 shadow-md"
                />
              ) : (
                <UserCircle className="h-24 w-24 text-gray-400" />
              )}
              <div className="text-center sm:text-left">
                <h2 className="text-2xl font-semibold text-gray-800">
                  {user?.name || "N/A"}
                </h2>
                <p className="text-gray-600 flex items-center justify-center sm:justify-start mt-1">
                  <Mail size={18} className="mr-2 text-gray-500" />
                  {user?.email || "N/A"}
                </p>
                {user?.shopifyCustomerId && (
                  <p className="text-xs text-gray-500 mt-1">
                    Shopify Customer ID:{" "}
                    {user.shopifyCustomerId.substring(
                      user.shopifyCustomerId.lastIndexOf("/") + 1
                    )}
                  </p>
                )}
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Order History Card Removed */}
            {/* Manage Addresses Card Removed */}
            <AccountActionCard
              icon={<FileText className="text-purple-600" size={28} />}
              title="Manage Prescriptions"
              description="Upload and view your eyewear or contact lens prescriptions."
              href="/account/prescriptions"
            />
            {/* Add more cards as needed - ensure the grid looks balanced if only one item remains */}
            {/* If only one item, you might want to change grid-cols-1 md:grid-cols-1 or adjust styling */}
          </section>

          <section className="pt-8 mt-8 border-t border-gray-200 flex justify-center">
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="flex items-center justify-center gap-2 px-8 py-3 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transition-all duration-150 ease-in-out transform hover:scale-105"
            >
              <LogOut size={20} />
              Sign Out
            </button>
          </section>
        </div>
        <p className="text-center text-gray-500 text-sm mt-12">
          Need help?{" "}
          <Link
            href="/contact-us"
            className="text-black hover:underline font-medium"
          >
            Contact Support
          </Link>
        </p>
      </div>
    </div>
  );
};

interface AccountActionCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
}

const AccountActionCard: React.FC<AccountActionCardProps> = ({
  icon,
  title,
  description,
  href,
}) => {
  return (
    <Link
      href={href}
      className="block p-6 bg-gray-50 hover:bg-gray-100 rounded-lg shadow-sm transition-all duration-200 ease-in-out group"
    >
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0 p-3 bg-white rounded-full shadow-inner group-hover:scale-110 transition-transform duration-200">
          {icon}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-800 group-hover:text-black">
            {title}
          </h3>
          <p className="mt-1 text-sm text-gray-600">{description}</p>
        </div>
      </div>
    </Link>
  );
};

export default AccountPage;
