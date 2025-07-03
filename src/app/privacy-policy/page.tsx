// src/app/privacy-policy/page.tsx
"use client";

import React from "react";
import Link from "next/link"; // For internal links if any, though most here are external or mailto
import { ShieldCheck, Mail, ExternalLinkIcon } from "lucide-react"; // Example icons

const PrivacyPolicyPage = () => {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 py-12 sm:py-16 md:py-20">
      <div className="container mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <header className="mb-10 text-center">
          <ShieldCheck className="h-16 w-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-gray-900">
            Privacy Policy
          </h1>
          <p className="mt-3 text-sm sm:text-base text-gray-500">
            Effective Date: May 30, 2025
          </p>
        </header>

        <div className="prose prose-sm sm:prose-base lg:prose-lg max-w-none bg-white p-6 sm:p-8 md:p-10 rounded-xl shadow-xl">
          <p>
            Focal Optical (&quot;Focal,&quot; &quot;we,&quot; &quot;us,&quot; or
            &quot;our&quot;) values your trust and is committed to protecting
            your privacy. This Privacy Policy describes how we collect, use, and
            share your information when you visit or make a purchase from
            focaloptical.com (the &quot;Site&quot;).
          </p>
          <p>
            By using our Site, you agree to the terms of this Privacy Policy.
          </p>

          <h2>Information We Collect</h2>
          <p>We collect several types of information:</p>

          <h3>Personal Information You Provide</h3>
          <p>
            When you create an account, place an order, or contact us, we
            collect information like your name, email address, shipping address,
            phone number, and payment information.
          </p>

          <h3>Information Automatically Collected</h3>
          <p>
            We automatically collect information about your device and browsing
            activities, such as your IP address, browser type, time zone, and
            cookies, when you visit our Site.
          </p>

          <h3>Information from Third Parties</h3>
          <p>
            We may receive information from social media platforms and other
            third-party sources.
          </p>

          <h2>How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul>
            <li>Fulfill your orders and provide customer service</li>
            <li>
              Communicate with you, including responding to inquiries and
              sending marketing emails (you can opt-out)
            </li>
            <li>Personalize your experience on the Site</li>
            <li>Analyze Site usage to improve our services</li>
            <li>Prevent fraudulent transactions and monitor against threats</li>
            <li>Comply with legal obligations and enforce our agreements</li>
          </ul>

          <h2>Sharing Your Information</h2>
          <p>We may share your information with:</p>
          <ul>
            <li>
              <strong>Service Providers:</strong> We work with third parties who
              perform services on our behalf, such as payment processors,
              shipping companies, marketing service providers, and analytics
              providers.
            </li>
            <li>
              <strong>Business Transfers:</strong> In the event of a merger,
              sale, or acquisition, your information may be transferred.
            </li>
            <li>
              <strong>Compliance and Legal Requirements:</strong> We may
              disclose information if required by law, regulation, or legal
              process, or to protect our rights.
            </li>
          </ul>
          <p>We do not sell your personal information to third parties.</p>

          <h2>Cookies and Other Tracking Technologies</h2>
          <p>
            We use cookies, pixel tags, and other tracking technologies to
            collect information about your browsing activities and usage
            patterns. These technologies help us improve your experience and
            deliver relevant ads.
          </p>
          <p>
            You can control cookies through your browser settings. To learn
            more, visit{" "}
            <a
              href="http://www.allaboutcookies.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              http://www.allaboutcookies.org{" "}
              <ExternalLinkIcon className="inline-block h-3 w-3 ml-0.5" />
            </a>
            .
          </p>
          <p>
            Our Site uses Google Analytics and other similar analytics services
            to understand Site usage and improve our services. These services
            may collect your IP address and other information about your usage.
          </p>

          <h2>Your Rights and Choices</h2>
          <p>Depending on your location, you may have the right to:</p>
          <ul>
            <li>Access the personal information we have about you</li>
            <li>Request correction of inaccurate information</li>
            <li>Request deletion of your personal information</li>
            <li>Object to processing or request restriction</li>
            <li>Withdraw consent at any time</li>
          </ul>
          <p>
            To exercise these rights, please contact us at{" "}
            <a
              href="mailto:hello@focaloptical.com"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              hello@focaloptical.com
            </a>
            .
          </p>

          <h2>California Privacy Rights (CCPA)</h2>
          <p>If you are a California resident, you have the right to:</p>
          <ul>
            <li>
              Request access to the categories and specific pieces of personal
              information we have collected about you
            </li>
            <li>Request deletion of your personal information</li>
            <li>Opt-out of the sale of your personal information</li>
          </ul>
          <p>We do not sell your personal information.</p>
          <p>
            You or your authorized agent can submit a request by contacting{" "}
            <a
              href="mailto:hello@focaloptical.com"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              hello@focaloptical.com
            </a>
            .
          </p>

          <h2>Nevada Privacy Rights</h2>
          <p>
            Nevada residents may opt-out of the sale of their personal
            information. We do not currently sell personal information; however,
            you may submit a verified request to opt-out by contacting{" "}
            <a
              href="mailto:hello@focaloptical.com"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              hello@focaloptical.com
            </a>
            .
          </p>

          <h2>GDPR and EEA Users</h2>
          <p>
            If you are located in the European Economic Area (EEA), you have the
            following rights under the GDPR:
          </p>
          <ul>
            <li>Right to access</li>
            <li>Right to rectification</li>
            <li>Right to erasure (&quot;right to be forgotten&quot;)</li>
            <li>Right to restrict processing</li>
            <li>Right to data portability</li>
            <li>Right to object</li>
            <li>Right to withdraw consent</li>
          </ul>
          <p>
            To exercise these rights, please contact us at{" "}
            <a
              href="mailto:hello@focaloptical.com"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              hello@focaloptical.com
            </a>
            .
          </p>

          <h2>International Users</h2>
          <p>
            If you are accessing our Site from outside the United States, please
            be aware that your information will be transferred to and processed
            in the United States. By using our Site, you consent to this
            transfer.
          </p>

          <h2>Do Not Track Signals</h2>
          <p>
            Some browsers offer &quot;Do Not Track&quot; (DNT) signals. Our Site
            does not respond to DNT signals at this time.
          </p>

          <h2>Data Retention</h2>
          <p>
            We retain your personal information for as long as necessary to
            fulfill the purposes for which it was collected, including for
            legal, accounting, or reporting requirements.
          </p>

          <h2>Security</h2>
          <p>
            We implement reasonable security measures to protect your personal
            information. However, no method of transmission over the Internet or
            electronic storage is completely secure.
          </p>

          <h2>Third-Party Links</h2>
          <p>
            Our Site may contain links to third-party websites. This Privacy
            Policy does not apply to the practices of third parties. We
            encourage you to read their privacy policies.
          </p>

          <h2>Children&apos;s Privacy</h2>
          <p>
            Our Site is not intended for children under the age of 13. We do not
            knowingly collect personal information from children.
          </p>

          <h2>Accessibility</h2>
          <p>
            Focal Optical is committed to ensuring this Privacy Policy is
            accessible to individuals with disabilities. If you encounter any
            difficulty accessing this policy, please contact us at{" "}
            <a
              href="mailto:hello@focaloptical.com"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              hello@focaloptical.com
            </a>
            .
          </p>

          <h2>Changes to This Privacy Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. Changes will be
            posted on this page with an updated effective date.
          </p>

          <h2>Contact Us</h2>
          <p>
            If you have any questions or concerns about this Privacy Policy,
            please contact us at:
          </p>
          <address className="not-italic">
            Focal Optical
            <br />
            <a
              href="mailto:hello@focaloptical.com"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              hello@focaloptical.com
            </a>
            <br />
            <Link
              href="/"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              https://focaloptical.com/
            </Link>
          </address>
        </div>
      </div>
    </main>
  );
};

export default PrivacyPolicyPage;
