// src/app/notice-of-privacy-practices/page.tsx
"use client";

import React from "react";
import Link from "next/link";
import { ShieldAlert as PrivacyIcon, Mail } from "lucide-react"; // Using ShieldAlert as an icon

const NoticeOfPrivacyPracticesPage = () => {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 py-12 sm:py-16 md:py-20">
      <div className="container mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <header className="mb-10 text-center">
          <PrivacyIcon className="h-16 w-16 text-indigo-600 mx-auto mb-4" />
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-gray-900">
            Notice of Privacy Practices
          </h1>
          <p className="mt-3 text-sm sm:text-base text-gray-500">
            Effective Date: May 30, 2025
          </p>
        </header>

        <div className="prose prose-sm sm:prose-base lg:prose-lg max-w-none bg-white p-6 sm:p-8 md:p-10 rounded-xl shadow-xl">
          <p>
            This Notice of Privacy Practices (“Notice”) describes how Focal
            Optical (“Focal,” “we,” “us,” or “our”) may use and disclose your
            protected health information (&quot;PHI&quot;) and how you can
            access this information. We are committed to maintaining the privacy
            of your PHI and complying with applicable laws, including the Health
            Insurance Portability and Accountability Act of 1996
            (&quot;HIPAA&quot;).
          </p>
          <p>Please review this Notice carefully.</p>

          <h2>Our Legal Duties</h2>
          <p>We are required by law to:</p>
          <ul>
            <li>Maintain the privacy and security of your PHI</li>
            <li>
              Provide you with this Notice of our legal duties and privacy
              practices
            </li>
            <li>Follow the terms of this Notice currently in effect</li>
            <li>Notify you in case of a breach of unsecured PHI</li>
          </ul>

          <h2>What is PHI?</h2>
          <p>
            PHI is information that identifies you and relates to your past,
            present, or future physical or mental health or condition, the
            provision of healthcare to you, or payment for the provision of
            healthcare. This includes your name, contact details, health
            information, and prescription details.
          </p>

          <h2>How We Use and Disclose Your PHI</h2>
          <p>
            We are permitted to use and disclose your PHI without your written
            authorization in the following ways:
          </p>
          <h3>Treatment</h3>
          <p>
            We may use your PHI to provide you with healthcare services,
            including filling prescriptions for corrective lenses and providing
            consultations.
          </p>
          <h3>Payment</h3>
          <p>
            We may use your PHI to obtain payment for healthcare services we
            provide, including billing your insurance or a third party.
          </p>
          <h3>Healthcare Operations</h3>
          <p>
            We may use your PHI to operate our business, including quality
            assessment, training, and customer service.
          </p>

          <h2>Other Uses and Disclosures Without Authorization</h2>
          <p>
            We may also use or disclose your PHI without your consent or
            authorization for:
          </p>
          <ul>
            <li>
              Public health activities (e.g., reporting disease outbreaks)
            </li>
            <li>Health oversight activities (e.g., audits and inspections)</li>
            <li>Legal proceedings (e.g., responding to subpoenas)</li>
            <li>Law enforcement purposes</li>
            <li>Organ and tissue donation requests</li>
            <li>
              Research purposes (subject to approval and privacy safeguards)
            </li>
            <li>To prevent or reduce a serious threat to health or safety</li>
            <li>As required by law (e.g., for workers’ compensation claims)</li>
          </ul>

          <h2>Uses and Disclosures Requiring Your Authorization</h2>
          <p>We will obtain your written authorization before:</p>
          <ul>
            <li>Using your PHI for marketing purposes</li>
            <li>Disclosing your PHI in a way not covered by this Notice</li>
            <li>Selling your PHI</li>
          </ul>
          <p>
            You may revoke your authorization at any time by contacting us in
            writing.
          </p>

          <h2>Your Rights Regarding Your PHI</h2>
          <p>You have the following rights:</p>
          <ul>
            <li>
              <strong>Right to Access:</strong> You can request access to your
              PHI or request a copy.
            </li>
            <li>
              <strong>Right to Amend:</strong> You can request corrections to
              your PHI if you believe it is inaccurate or incomplete.
            </li>
            <li>
              <strong>Right to an Accounting of Disclosures:</strong> You can
              request a list of certain disclosures of your PHI.
            </li>
            <li>
              <strong>Right to Request Restrictions:</strong> You can ask us to
              limit the use or disclosure of your PHI.
            </li>
            <li>
              <strong>Right to Request Confidential Communications:</strong> You
              can request that we contact you in a specific way (e.g., only via
              mail).
            </li>
            <li>
              <strong>Right to a Paper Copy of This Notice:</strong> You can
              request a paper copy of this Notice at any time.
            </li>
            <li>
              <strong>Right to File a Complaint:</strong> You can file a
              complaint with us or with the U.S. Department of Health and Human
              Services if you believe your privacy rights have been violated.
            </li>
          </ul>
          <p>
            To exercise any of these rights, contact us at{" "}
            <a
              href="mailto:hello@focaloptical.com"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              hello@focaloptical.com
            </a>
            .
          </p>

          <h2>Our Responsibilities</h2>
          <p>
            We are required by law to maintain the privacy and security of your
            PHI.
          </p>
          <p>
            We will let you know promptly if a breach occurs that may compromise
            the privacy or security of your PHI.
          </p>
          <p>
            We must follow the duties and privacy practices described in this
            Notice.
          </p>
          <p>
            We will not use or share your PHI other than as described here
            unless you tell us we can in writing.
          </p>

          <h2>Changes to This Notice</h2>
          <p>
            We reserve the right to change this Notice and make the new Notice
            effective for all PHI we maintain. Any changes will be posted on our
            website and available upon request.
          </p>

          <h2>Contact Us</h2>
          <p>
            If you have any questions or complaints regarding this Notice or our
            privacy practices, please contact:
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

export default NoticeOfPrivacyPracticesPage;
