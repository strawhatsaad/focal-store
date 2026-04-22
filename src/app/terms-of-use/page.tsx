// src/app/terms-of-use/page.tsx
import React from "react";
import { FileText } from "lucide-react";
import PolicyPage from "@/components/PolicyPage";

export const metadata = {
  title: "Terms of Service | Focal Optical",
};

export default function Page() {
  return (
    <PolicyPage
      policyKey="termsOfService"
      fallbackTitle="Terms of Service"
      icon={<FileText className="h-16 w-16 text-gray-700 mx-auto mb-4" />}
    />
  );
}
