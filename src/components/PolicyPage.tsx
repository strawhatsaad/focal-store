// src/components/PolicyPage.tsx
import React from "react";
import { ShieldCheck } from "lucide-react";
import { getShopPolicies } from "../../utils";

type PolicyKey =
  | "privacyPolicy"
  | "termsOfService"
  | "refundPolicy"
  | "shippingPolicy"
  | "subscriptionPolicy";

interface ShopPolicy {
  id: string;
  title: string;
  body: string;
  handle: string;
  url: string;
}

interface PolicyPageProps {
  policyKey: PolicyKey;
  fallbackTitle: string;
  icon?: React.ReactNode;
}

export const revalidate = 3600;

export default async function PolicyPage({
  policyKey,
  fallbackTitle,
  icon,
}: PolicyPageProps) {
  let policy: ShopPolicy | null = null;

  try {
    const result = await getShopPolicies();
    policy = result?.data?.shop?.[policyKey] || null;
  } catch (error) {
    console.error(`[PolicyPage] Failed to fetch ${policyKey}:`, error);
  }

  const title = policy?.title || fallbackTitle;

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 py-12 sm:py-16 md:py-20">
      <div className="container mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <header className="mb-10 text-center">
          {icon ?? (
            <ShieldCheck className="h-16 w-16 text-gray-700 mx-auto mb-4" />
          )}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-gray-900">
            {title}
          </h1>
        </header>

        <div className="bg-white p-6 sm:p-8 md:p-10 rounded-xl shadow-xl">
          {policy?.body ? (
            <div
              className="prose prose-sm sm:prose-base lg:prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: policy.body }}
            />
          ) : (
            <p className="text-center text-gray-600">
              This policy is not currently available. Please check back soon or
              contact us at{" "}
              <a
                href="mailto:info@focaloptical.com"
                className="text-blue-600 hover:underline"
              >
                info@focaloptical.com
              </a>
              .
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
