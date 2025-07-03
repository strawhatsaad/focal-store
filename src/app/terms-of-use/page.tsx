// src/app/terms-of-use/page.tsx
"use client";

import React from "react";
import Link from "next/link";
import { FileText as TermsIcon, Mail } from "lucide-react"; // Using FileText as an example icon for terms

const TermsOfUsePage = () => {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 py-12 sm:py-16 md:py-20">
      <div className="container mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <header className="mb-10 text-center">
          <TermsIcon className="h-16 w-16 text-gray-700 mx-auto mb-4" />
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-gray-900">
            Terms of Use
          </h1>
          <p className="mt-3 text-sm sm:text-base text-gray-500">
            Effective Date: May 30, 2025
          </p>
        </header>

        <div className="prose prose-sm sm:prose-base lg:prose-lg max-w-none bg-white p-6 sm:p-8 md:p-10 rounded-xl shadow-xl">
          <p>
            Welcome to Focal Optical! These Terms of Use (&quot;Terms&quot;)
            govern your access to and use of our website located at
            https://focaloptical.com (the &quot;Site&quot;) and any related
            services provided by Focal Optical (&quot;Focal,&quot;
            &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;). By accessing or
            using the Site, you agree to be bound by these Terms.
          </p>

          <h2>1. Eligibility</h2>
          <p>
            You must be at least 18 years old to use our Site. By using the
            Site, you represent and warrant that you meet this requirement.
          </p>

          <h2>2. Account Registration</h2>
          <p>
            To access certain features of the Site, you may need to register for
            an account. You agree to provide accurate and complete information
            and to keep this information up to date. You are responsible for
            maintaining the confidentiality of your account credentials and for
            all activities that occur under your account.
          </p>

          <h2>3. Orders and Payment</h2>
          <p>
            When you place an order through our Site, you agree to provide
            current, complete, and accurate purchase and account information.
            You authorize us to charge your payment method for the total amount
            of your order, including any applicable taxes and shipping fees.
          </p>

          <h2>4. Product Information</h2>
          <p>
            We strive to ensure that all product descriptions, images, and
            prices are accurate. However, we do not warrant that product
            descriptions or other content on the Site are accurate, complete,
            reliable, current, or error-free.
          </p>

          <h2>5. Intellectual Property</h2>
          <p>
            All content on the Site, including text, graphics, logos, images,
            and software, is the property of Focal Optical or its content
            suppliers and is protected by intellectual property laws. You may
            not use, reproduce, distribute, or create derivative works from any
            content without our prior written permission.
          </p>

          <h2>6. User Conduct</h2>
          <p>
            You agree not to use the Site for any unlawful purpose or in any way
            that could harm Focal Optical or any third party. Prohibited
            activities include, but are not limited to:
          </p>
          <ul>
            <li>Engaging in fraudulent activities</li>
            <li>Interfering with the operation of the Site</li>
            <li>Uploading or transmitting viruses or other malicious code</li>
          </ul>

          <h2>7. Third-Party Links</h2>
          <p>
            Our Site may contain links to third-party websites. We are not
            responsible for the content or practices of these websites.
            Accessing third-party sites is at your own risk.
          </p>

          <h2>8. Termination</h2>
          <p>
            We reserve the right to terminate or suspend your account and access
            to the Site at our sole discretion, without notice or liability, for
            conduct that we believe violates these Terms or is harmful to other
            users of the Site, us, or third parties, or for any other reason.
          </p>

          <h2>9. Disclaimer of Warranties</h2>
          <p>
            The Site and all content and services provided through it are
            offered &quot;as is&quot; and &quot;as available&quot; without
            warranties of any kind, either express or implied.
          </p>

          <h2>10. Limitation of Liability</h2>
          <p>
            To the fullest extent permitted by law, Focal Optical shall not be
            liable for any indirect, incidental, special, consequential, or
            punitive damages arising out of or related to your use of the Site.
          </p>

          <h2>11. Indemnification</h2>
          <p>
            You agree to indemnify and hold harmless Focal Optical and its
            affiliates, officers, agents, and employees from any claims,
            liabilities, damages, losses, and expenses arising out of your use
            of the Site or violation of these Terms.
          </p>

          <h2>12. Governing Law</h2>
          <p>
            These Terms are governed by the laws of the State of Michigan,
            without regard to its conflict of law principles.
          </p>

          <h2>13. Dispute Resolution</h2>
          <p>
            Any disputes arising under these Terms will be resolved through
            binding arbitration in accordance with the rules of the American
            Arbitration Association. You agree to waive any right to a jury
            trial or to participate in a class action.
          </p>

          <h2>14. Entire Agreement and Severability</h2>
          <p>
            These Terms, along with our Privacy Policy, constitute the entire
            agreement between you and Focal Optical regarding your use of the
            Site. If any provision of these Terms is held to be invalid or
            unenforceable, the remaining provisions will continue in full force
            and effect.
          </p>

          <h2>15. Changes to Terms</h2>
          <p>
            We may update these Terms from time to time. Changes will be posted
            on this page with an updated effective date. Your continued use of
            the Site after any changes constitutes your acceptance of the new
            Terms.
          </p>

          <h2>16. Contact Us</h2>
          <p>
            If you have any questions about these Terms, please contact us at:
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
              https://focaloptical.com
            </Link>
          </address>
        </div>
      </div>
    </main>
  );
};

export default TermsOfUsePage;
