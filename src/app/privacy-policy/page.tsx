// src/app/privacy-policy/page.tsx
import React from "react";
import { ShieldCheck } from "lucide-react";
import PolicyPage from "@/components/PolicyPage";

export const metadata = {
  title: "Privacy Policy | Focal Optical",
};

export default function Page() {
  return (
    <PolicyPage
      policyKey="privacyPolicy"
      fallbackTitle="Privacy Policy"
      icon={<ShieldCheck className="h-16 w-16 text-blue-600 mx-auto mb-4" />}
    />
  );
}
