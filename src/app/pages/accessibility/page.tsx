// src/app/accessibility/page.tsx
"use client";

import React from "react";
import Link from "next/link";
import { Accessibility, Mail } from "lucide-react"; // Changed UniversalAccess to Accessibility

const AccessibilityStatementPage = () => {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 py-12 sm:py-16 md:py-20">
      <div className="container mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <header className="mb-10 text-center">
          <Accessibility className="h-16 w-16 text-green-600 mx-auto mb-4" />{" "}
          {/* Changed icon and color for variety */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-gray-900">
            Accessibility Statement
          </h1>
          <p className="mt-3 text-sm sm:text-base text-gray-500">
            Effective Date: May 30, 2025
          </p>
        </header>

        <div className="prose prose-sm sm:prose-base lg:prose-lg max-w-none bg-white p-6 sm:p-8 md:p-10 rounded-xl shadow-xl">
          <p>
            Focal Optical (&quot;Focal,&quot; &quot;we,&quot; &quot;us,&quot; or
            &quot;our&quot;) is committed to ensuring digital accessibility for
            people with disabilities. We strive to provide a positive user
            experience for all our customers and are actively working to
            increase the accessibility and usability of our website,
            https://focaloptical.com.
          </p>
          <p>
            We are dedicated to complying with the Web Content Accessibility
            Guidelines (WCAG) 2.1, Level AA, and other applicable accessibility
            standards.
          </p>

          <h2>Our Commitment</h2>
          <ul>
            <li>
              We have designed and developed our website with accessibility in
              mind.
            </li>
            <li>
              We regularly review and update our website to improve
              accessibility.
            </li>
            <li>
              We train our team to ensure accessibility best practices are
              followed.
            </li>
            <li>
              We welcome feedback and take prompt action to resolve
              accessibility barriers.
            </li>
          </ul>

          <h2>Accessibility Features</h2>
          <p>
            Our site incorporates the following features to enhance
            accessibility:
          </p>
          <ul>
            <li>
              <strong>Alt Text:</strong> Descriptive alt text is provided for
              all meaningful images.
            </li>
            <li>
              <strong>Keyboard Navigation:</strong> The website is navigable via
              keyboard without the use of a mouse.
            </li>
            <li>
              <strong>Screen Reader Compatibility:</strong> The site is designed
              to be compatible with most major screen readers.
            </li>
            <li>
              <strong>Color Contrast:</strong> We maintain sufficient color
              contrast between text and backgrounds.
            </li>
            <li>
              <strong>Resizable Text:</strong> Users can adjust the text size
              using browser settings without loss of content or functionality.
            </li>
          </ul>

          <h2>Ongoing Efforts</h2>
          <p>
            We are continually working to enhance our digital experiences.
            Regular audits, evaluations, and improvements are part of our
            ongoing commitment to ensuring accessibility.
          </p>
          <p>
            We may partner with third-party vendors who are also expected to
            ensure that their content is accessible and meets applicable
            accessibility standards.
          </p>

          <h2>Third-Party Content</h2>
          <p>
            While we strive to ensure that third-party content on our website is
            accessible, we cannot guarantee accessibility for content or
            websites not owned or controlled by Focal Optical.
          </p>

          <h2>Feedback</h2>
          <p>
            We welcome your feedback on the accessibility of our Site. If you
            encounter any barriers or have suggestions for improvement, please
            contact us:
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
          <p>
            We aim to respond to accessibility feedback within five (5) business
            days.
          </p>

          <h2>Need Assistance?</h2>
          <p>
            If you need assistance accessing any part of our website or have
            specific questions about the accessibility features of our site,
            please reach out to us at{" "}
            <a
              href="mailto:hello@focaloptical.com"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              hello@focaloptical.com
            </a>
            . We are happy to assist you and will do our best to provide the
            information you need through an alternative communication method or
            accessible format upon request.
          </p>
        </div>
      </div>
    </main>
  );
};

export default AccessibilityStatementPage;
