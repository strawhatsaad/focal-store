// src/app/refund-policy/page.tsx
import React from "react";
import { RotateCcw } from "lucide-react";
import PolicyPage from "@/components/PolicyPage";

export const metadata = {
  title: "Return & Refund Policy | Focal Optical",
};

export default function Page() {
  return (
    <PolicyPage
      policyKey="refundPolicy"
      fallbackTitle="Return & Refund Policy"
      icon={<RotateCcw className="h-16 w-16 text-emerald-600 mx-auto mb-4" />}
    />
  );
}
