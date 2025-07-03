// src/app/washington-health-privacy/page.tsx
"use client";

import React from "react";
import Link from "next/link";
import { ShieldHalf, Mail } from "lucide-react"; // Using ShieldHalf as an example icon

const WashingtonHealthPrivacyPage = () => {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 py-12 sm:py-16 md:py-20">
      <div className="container mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <header className="mb-10 text-center">
          <ShieldHalf className="h-16 w-16 text-teal-600 mx-auto mb-4" />
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-gray-900">
            Washington Consumer Health Data Privacy Policy
          </h1>
          <p className="mt-3 text-sm sm:text-base text-gray-500">
            Effective Date: May 30, 2025
          </p>
        </header>

        <div className="prose prose-sm sm:prose-base lg:prose-lg max-w-none bg-white p-6 sm:p-8 md:p-10 rounded-xl shadow-xl">
          <p>
            This Washington Consumer Health Data Privacy Policy
            (&quot;Washington Policy&quot;) explains how Focal Optical
            (&quot;Focal,&quot; &quot;we,&quot; &quot;us,&quot; or
            &quot;our&quot;) collects, uses, and shares the Consumer Health Data
            of individuals who reside in Washington or whose health data is
            collected in Washington, in compliance with the Washington My Health
            My Data Act (&quot;Washington Act&quot;).
          </p>
          <p>
            This Washington Policy applies to Consumer Health Data collected
            through our website https://focaloptical.com and related digital
            services (the &quot;Services&quot;).
          </p>
          <p>
            This Policy does not cover Protected Health Information
            (&quot;PHI&quot;) governed by the Health Insurance Portability and
            Accountability Act of 1996 (&quot;HIPAA&quot;). For information
            about how we handle PHI, please see our Notice of Privacy Practices.
          </p>

          <h2>1. What is Consumer Health Data?</h2>
          <p>
            &quot;Consumer Health Data&quot; refers to personal information that
            is linked or reasonably linkable to an individual and identifies
            their past, present, or future physical or mental health status.
          </p>
          <p>Examples include:</p>
          <ul>
            <li>
              Information related to an individual’s health conditions,
              treatments, diagnoses, or medications
            </li>
            <li>Biometric data and genetic information</li>
            <li>Health-related services or products an individual seeks</li>
          </ul>

          <h2>2. How We Collect Consumer Health Data</h2>
          <p>We collect Consumer Health Data through:</p>
          <ul>
            <li>
              <strong>Information You Provide:</strong> Information you submit
              directly to us, such as name, contact information, prescription
              details, and health-related preferences when using our Services.
            </li>
            <li>
              <strong>Automatically Collected Information:</strong> Information
              collected through cookies and similar technologies, such as IP
              address, device information, and browsing behavior when you
              interact with our Services.
            </li>
          </ul>
          <p>We collect this information to:</p>
          <ul>
            <li>Provide, manage, and improve our Services</li>
            <li>Process your orders and deliver products</li>
            <li>Offer personalized content and recommendations</li>
            <li>Comply with applicable legal obligations</li>
          </ul>

          <h2>3. How We Use and Share Consumer Health Data</h2>
          <p>
            We use Consumer Health Data only for purposes allowed by law or with
            your consent.
          </p>
          <p>We may share Consumer Health Data with:</p>
          <ul>
            <li>
              <strong>Service Providers:</strong> Entities that perform services
              on our behalf (e.g., order fulfillment, customer support,
              analytics).
            </li>
            <li>
              <strong>Affiliates:</strong> Our subsidiaries and related entities
              as needed to deliver our Services.
            </li>
            <li>
              <strong>Regulatory Authorities:</strong> As required by law or
              regulation.
            </li>
            <li>
              <strong>Healthcare Providers:</strong> At your direction or with
              your consent.
            </li>
            <li>
              <strong>Business Transfers:</strong> If we undergo a merger,
              acquisition, reorganization, or sale of assets.
            </li>
          </ul>
          <p>
            We do not sell Consumer Health Data without your explicit consent.
          </p>

          <h2>4. Your Rights</h2>
          <p>If you are a Washington Consumer, you have the right to:</p>
          <ul>
            <li>
              Confirm whether we collect, share, or sell your Consumer Health
              Data
            </li>
            <li>Access the Consumer Health Data we have collected about you</li>
            <li>Request Deletion of your Consumer Health Data</li>
            <li>
              Withdraw Consent to our collection and sharing of your Consumer
              Health Data
            </li>
            <li>
              Receive a List of third parties with whom we have shared your
              Consumer Health Data
            </li>
          </ul>

          <h2>5. How to Exercise Your Rights</h2>
          <p>You may submit a privacy rights request by contacting us at:</p>
          <p>
            Email:{" "}
            <a
              href="mailto:hello@focaloptical.com"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              hello@focaloptical.com
            </a>
          </p>
          <p>
            For your protection, we may verify your identity before fulfilling
            your request. Verification methods may include confirming details
            you have provided to us or asking for additional information.
          </p>
          <p>
            If we deny your request, you have the right to appeal the decision.
            To submit an appeal, please contact{" "}
            <a
              href="mailto:hello@focaloptical.com"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              hello@focaloptical.com
            </a>
            . If your appeal is denied, we will provide you with instructions on
            how to contact the Washington State Attorney General.
          </p>
          <p>
            We do not discriminate against individuals for exercising their
            rights under the Washington Act.
          </p>

          <h2>6. Changes to This Policy</h2>
          <p>
            We may update this Washington Policy periodically to reflect changes
            in our practices or legal obligations. Updates will be posted on
            this page with a new effective date.
          </p>

          <h2>7. Contact Us</h2>
          <p>
            If you have any questions or concerns about this Washington Policy
            or how we handle your Consumer Health Data, please contact:
          </p>
          <address className="not-italic">
            Focal Optical
            <br />
            Email:{" "}
            <a
              href="mailto:hello@focaloptical.com"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              hello@focaloptical.com
            </a>
            <br />
            Website:{" "}
            <Link
              href="/"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              https://focaloptical.com
            </Link>
          </address>
        </div>
      </div>
    </main>
  );
};

export default WashingtonHealthPrivacyPage;
