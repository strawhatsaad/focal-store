// src/app/how-to-use-vision-insurance/page.tsx
"use client";

import React, { useState } from "react";
import {
  Search,
  ShoppingCart,
  Send,
  DollarSign,
  CreditCard,
  Eye,
  FileText,
  CheckCircle,
  X,
  Download,
} from "lucide-react";
import Link from "next/link";
import FAQItem from "@/components/Products/ProductDetails/FAQItem";
import Image from "next/image";

// --- Types and Data ---

interface ProviderData {
  name: string;
  formUrl: string; // Placeholder for the download link
  address: {
    name: string;
    street: string;
    cityStateZip: string;
  };
}

const insuranceProviders = [
  "VSP",
  "EyeMed",
  "Aetna",
  "Anthem",
  "UnitedHealthcare",
  "Humana",
  "Cigna",
  "NVA",
];

const providerData: { [key: string]: ProviderData } = {
  VSP: {
    name: "VSP",
    formUrl: "https://www.vsp.com/claims/submit-oon-claim",
    address: {
      name: "Vision Service Plan",
      street: "P.O. Box 385018",
      cityStateZip: "Birmingham, AL 35238-5018",
    },
  },
  EyeMed: {
    name: "EyeMed",
    formUrl: "https://www.eyemedvisioncare.com/delta/oon/Delta_OON_Form.pdf",
    address: {
      name: "EyeMed Vision Care",
      street: "Attn: OON Claims",
      cityStateZip: "P.O. Box 8504, Mason, OH 45040-7111",
    },
  },
  Aetna: {
    name: "Aetna",
    formUrl: "http://www.aetna.com/data/forms_library/vision_claim_form.pdf",
    address: {
      name: "Aetna Life Insurance Company",
      street: "PO Box 981106",
      cityStateZip: "El Paso, TX 79998",
    },
  },
  Anthem: {
    name: "Anthem",
    formUrl:
      "https://www.anthem.com/health-insurance/nsecurepdf/English_VA_blueviewvision_abcbs_claimform.PDF",
    address: {
      name: "Blue View Vision",
      street: "Attn: OON Claims",
      cityStateZip: "P.O. Box 8504, Mason, OH 45040-7111",
    },
  },
  UnitedHealthcare: {
    name: "UnitedHealthcare",
    formUrl:
      "https://rrd.myuhcvision.com/Viewers/17246_r_r_d_OutofNetworkForm.pdf.att?gk=547070D3627CED265BE1362C039CEDBF013AB3087FDA3D10279B655D6D7E744F245BCC96F56B4B620ADB909B69B763727014342C5C89CE24BD24040BCBB3C380",
    address: {
      name: "UnitedHealthcare Vision",
      street: "ATTN: Claims Department",
      cityStateZip: "P.O. Box 30978, Salt Lake City, UT 84130",
    },
  },
  Humana: {
    name: "Humana",
    formUrl:
      "https://www.compbenefits.com/custom/docs/NonNetworkVisionClaimForm.pdf",
    address: {
      name: "Humana Vision Care Plan",
      street: "Attn: OON Claims",
      cityStateZip: "P.O. Box 14311, Lexington, KY 40512-4311",
    },
  },
  Cigna: {
    name: "Cigna",
    formUrl:
      "https://www.cigna.com/assets/docs/Cigna%20notices-of-privacy-practices/vision-forms/vision-claim-form-2015-fillable.pdf",
    address: {
      name: "Cigna Vision",
      street: "P.O. Box 385018",
      cityStateZip: "Birmingham, AL 35238-5018",
    },
  },
  NVA: {
    name: "NVA",
    formUrl:
      "https://www.e-nva.com/nva/DocumentViewerServlet?view=pdf&file=/nva/pdfs//NonParClaimForm.pdf",
    address: {
      name: "National Vision Administrators, L.L.C.",
      street: "P.O. Box 2187",
      cityStateZip: "Clifton, NJ 07015",
    },
  },
};

const genericSteps = (
  providerName: string,
  address: ProviderData["address"]
) => [
  {
    title: "Fill out claim form",
    description: "Complete the following claim form.",
  },
  {
    title: "Submit claim form and invoice",
    description:
      "Submit the completed claim form and submit along with your itemized invoice to this address:",
    address: address,
  },
  {
    title: "Download itemized invoice",
    description: "",
  },
  {
    title: "Get reimbursed",
    description: `After submitting your claim, it typically takes around 3 weeks to get reimbursed. If there is an issue, please reach out to your vision insurance provider - not Focal.`,
  },
];

// --- Reusable Components ---

const CoverageCard = ({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) => (
  <div className="flex items-start gap-4 p-4">
    <div className="flex-shrink-0 text-black">{icon}</div>
    <div>
      <h4 className="font-semibold text-gray-800">{title}</h4>
      <p className="mt-1 text-sm text-gray-600">{description}</p>
    </div>
  </div>
);

const ReimbursementModal = ({
  isOpen,
  onClose,
  provider,
}: {
  isOpen: boolean;
  onClose: () => void;
  provider: ProviderData | null;
}) => {
  if (!isOpen || !provider) return null;

  const steps = genericSteps(provider.name, provider.address);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4 transition-opacity duration-300 ease-in-out">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col transform transition-all duration-300 ease-in-out scale-100">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold text-gray-800">
            {provider.name} Reimbursement
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-500 hover:bg-gray-100"
          >
            <X size={24} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto space-y-6">
          <p className="text-sm text-gray-600">
            We&apos;re not in-network with {provider.name}, however, you can
            apply for reimbursement on your prescription lenses and eye exam.
            Just follow the steps below:
          </p>
          {steps.map((step, index) => (
            <div key={index} className="flex items-start gap-4">
              <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-black text-white font-bold text-lg">
                {index + 1}
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-gray-800">{step.title}</h4>
                <p className="mt-1 text-sm text-gray-600">{step.description}</p>
                {index === 0 && (
                  <div className="mt-3">
                    <Link
                      href={provider.formUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-800 font-semibold rounded-md hover:bg-gray-200 transition-colors text-sm"
                    >
                      <Download size={16} /> Download Form
                    </Link>
                  </div>
                )}
                {step.address && (
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md text-sm">
                    <p className="font-semibold">{step.address.name}</p>
                    <p>{step.address.street}</p>
                    <p>{step.address.cityStateZip}</p>
                  </div>
                )}
                {index === 2 && (
                  <div className="mt-3">
                    <p className="text-sm text-gray-600">
                      You can download an itemized invoice by logging into your{" "}
                      <Link
                        href="/account"
                        className="text-black font-medium underline hover:text-gray-700"
                      >
                        account
                      </Link>
                      .
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="p-4 border-t text-right">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            Close this window
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Page Component ---

const HowToUseInsurancePage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResult, setSearchResult] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalProvider, setModalProvider] = useState<ProviderData | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      setSearchResult(null);
      return;
    }
    const found = insuranceProviders.find((p) =>
      p.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (found) {
      setSearchResult(
        `Yes, we accept ${found} as an out-of-network provider! Follow the steps below to get reimbursed.`
      );
    } else {
      setSearchResult(
        "We likely accept your insurance as an out-of-network provider. Follow the steps below, or contact your provider to confirm."
      );
    }
  };

  const handleProviderClick = (providerName: string) => {
    const data = providerData[providerName];
    if (data) {
      setModalProvider(data);
      setIsModalOpen(true);
    }
  };

  return (
    <main className="bg-slate-50">
      {/* Hero Section */}
      <section className="py-16 sm:py-20 text-center bg-white border-b border-gray-200">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900">
            Using Your Vision Insurance is as Easy as 1-2-3
          </h1>
          <p className="mt-4 max-w-3xl mx-auto text-lg text-gray-600">
            We accept most vision insurance plans as an out-of-network provider.
            This means you place your order with us, and then submit a claim to
            your insurance provider for reimbursement.
          </p>
          <form onSubmit={handleSearch} className="mt-8 max-w-xl mx-auto">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Check for your insurance provider"
                className="w-full pl-5 pr-12 py-3 text-base border-gray-300 rounded-full shadow-sm focus:ring-black focus:border-black"
              />
              <button
                type="submit"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
              >
                <Search className="h-5 w-5" />
              </button>
            </div>
            {searchResult && (
              <div className="mt-4 text-sm text-center p-3 bg-green-50 text-green-800 rounded-lg">
                {searchResult}
              </div>
            )}
          </form>
          <div className="mt-10">
            <p className="text-sm text-gray-500 uppercase font-semibold tracking-wider">
              ACCEPTED OUT-OF-NETWORK PROVIDERS INCLUDE
            </p>
            <div className="mt-4 flex flex-wrap justify-center items-center gap-x-6 sm:gap-x-8 gap-y-2 text-gray-500 font-semibold">
              {insuranceProviders.slice(0, 5).map((name) => (
                <button
                  key={name}
                  onClick={() => handleProviderClick(name)}
                  className="hover:text-black transition-colors duration-300"
                >
                  {name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 sm:py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900">
            How It Works
          </h2>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 text-center">
            <div className="flex flex-col items-center p-6">
              <div className="flex items-center justify-center w-20 h-20 rounded-full bg-black text-white mb-5">
                <ShoppingCart size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-800">
                1. Place Your Order
              </h3>
              <p className="mt-2 text-gray-600">
                Shop our site for contact lenses or prescription glasses and
                place your order.
              </p>
            </div>
            <div className="flex flex-col items-center p-6">
              <div className="flex items-center justify-center w-20 h-20 rounded-full bg-black text-white mb-5">
                <Send size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-800">
                2. Submit Your Claim
              </h3>
              <p className="mt-2 text-gray-600">
                Use our receipt to easily submit a claim to your insurance
                provider.
              </p>
            </div>
            <div className="flex flex-col items-center p-6">
              <div className="flex items-center justify-center w-20 h-20 rounded-full bg-black text-white mb-5">
                <DollarSign size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-800">
                3. Get Reimbursed
              </h3>
              <p className="mt-2 text-gray-600">
                Your insurance provider will mail you a check for your
                reimbursement.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What Does Insurance Cover Section */}
      <section className="py-16 sm:py-20 bg-gray-100">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900">
            What Does Vision Insurance Cover?
          </h2>
          <p className="mt-4 text-center text-lg text-gray-600 max-w-3xl mx-auto">
            While every plan is different, most vision insurance provides
            coverage for the following:
          </p>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <CoverageCard
              icon={<Eye size={24} />}
              title="Prescription Lenses"
              description="This includes single-vision, bifocal, and trifocal lenses for eyeglasses."
            />
            <CoverageCard
              icon={<FileText size={24} />}
              title="Contact Lenses"
              description="Most plans cover a portion of the cost for prescription contact lenses."
            />
            <CoverageCard
              icon={<CheckCircle size={24} />}
              title="Lens Coatings"
              description="Features like anti-scratch, anti-reflective, and UV protection are often partially or fully covered."
            />
            <CoverageCard
              icon={<ShoppingCart size={24} />}
              title="Eyeglass Frames"
              description="Your plan will typically provide an allowance towards the cost of new frames."
            />
          </div>
        </div>
      </section>

      {/* How to Submit Claim Section */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            How to Submit a Claim
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Because we are an out-of-network provider, we can&apos;t bill your
            insurance company directly. But, getting reimbursed is simple!
          </p>
          <div className="mt-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-800">
              What you&apos;ll need:
            </h3>
            <ul className="mt-4 space-y-3 list-disc list-inside text-gray-700">
              <li>
                An out-of-network claim form from your insurance provider&apos;s
                website.
              </li>
              <li>An itemized receipt from your Focal order.</li>
            </ul>
          </div>
          <p className="mt-6 text-gray-600">
            You can download your itemized receipt from your{" "}
            <Link
              href="/account/orders"
              className="text-black font-medium underline hover:text-gray-700"
            >
              Order History
            </Link>{" "}
            page. Then, simply fill out your provider&apos;s claim form and
            submit it along with our receipt through your provider&apos;s
            portal, email, or mail.
          </p>
        </div>
      </section>

      {/* Provider Reimbursement Section */}
      <section className="py-16 sm:py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900">
            Get Reimbursed From Your Provider
          </h2>
          <p className="mt-4 text-center text-lg text-gray-600">
            Select your provider below for a step-by-step guide.
          </p>
          <div className="mt-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {insuranceProviders.map((providerName) => (
              <button
                key={providerName}
                onClick={() => handleProviderClick(providerName)}
                className="p-4 flex justify-center items-center h-20 text-center font-medium border rounded-lg transition-all duration-200 bg-white hover:bg-gray-50 hover:shadow-md"
              >
                {providerName}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* FSA/HSA Section */}
      <section className="py-16 sm:py-20 bg-gray-100">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="p-8 bg-black text-white rounded-2xl shadow-lg flex flex-col md:flex-row items-center gap-8">
            <div className="flex-shrink-0">
              <CreditCard size={56} className="text-yellow-300" />
            </div>
            <div>
              <h2 className="text-3xl font-bold">
                Using Your FSA or HSA Is Even Easier
              </h2>
              <p className="mt-4 text-gray-300">
                Contact lenses and prescription eyewear are FSA (Flexible
                Spending Account) and HSA (Health Savings Account) eligible
                expenses. Simply use your FSA or HSA card at checkout just like
                you would a regular credit card.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900">
            Frequently Asked Questions
          </h2>
          <div className="mt-12 space-y-4">
            <FAQItem
              title="What is the difference between in-network and out-of-network?"
              openFlag={false}
              bgWhite={true}
            >
              <p className="text-gray-600">
                In-network providers have a contract with your insurance
                company, which means they can bill them directly. As an
                out-of-network provider, we don&apos;t have a direct contract.
                This allows us to offer competitive pricing, and you can still
                get reimbursed by submitting a claim yourself.
              </p>
            </FAQItem>
            <FAQItem
              title="How do I get an itemized receipt?"
              openFlag={false}
              bgWhite={true}
            >
              <p className="text-gray-600">
                You can download an itemized receipt for any of your orders by
                visiting the{" "}
                <Link
                  href="/account/orders"
                  className="text-black font-medium underline hover:text-gray-700"
                >
                  Order History
                </Link>{" "}
                page in your account. The receipt will have all the necessary
                information for your claim form.
              </p>
            </FAQItem>
            <FAQItem
              title="How much will I be reimbursed?"
              openFlag={false}
              bgWhite={true}
            >
              <p className="text-gray-600">
                The amount of reimbursement depends on your specific insurance
                plan&apos;s out-of-network benefits. We recommend contacting
                your insurance provider directly to find out the exact amount or
                percentage you&apos;re eligible to receive back.
              </p>
            </FAQItem>
            <FAQItem
              title="What if my insurance provider is not on your list?"
              openFlag={false}
              bgWhite={true}
            >
              <p className="text-gray-600">
                Our list includes the most common providers, but it&apos;s not
                exhaustive. Most vision plans offer out-of-network benefits, so
                it&apos;s very likely we&apos;re still covered. The best way to
                be sure is to call your insurance provider and ask about your
                out-of-network coverage for contact lenses or prescription
                eyewear.
              </p>
            </FAQItem>
            <FAQItem
              title="What if I need more information for my claim?"
              openFlag={false}
              bgWhite={true}
            >
              <p className="text-gray-600">
                If your insurance provider requires additional information that
                isn&apos;t on your itemized receipt, please{" "}
                <Link
                  href="/contact-us"
                  className="text-black font-medium underline hover:text-gray-700"
                >
                  contact our support team
                </Link>
                . We&apos;re happy to provide any necessary details to help you
                with your reimbursement.
              </p>
            </FAQItem>
          </div>
        </div>
      </section>

      <ReimbursementModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        provider={modalProvider}
      />
    </main>
  );
};

export default HowToUseInsurancePage;
