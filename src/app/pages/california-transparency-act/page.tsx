// src/app/california-transparency-act/page.tsx
"use client";

import React from "react";
import Link from "next/link";
import { Anchor, Mail } from "lucide-react"; // Using Anchor as an example icon for transparency/supply chain

const CaliforniaTransparencyActPage = () => {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 py-12 sm:py-16 md:py-20">
      <div className="container mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <header className="mb-10 text-center">
          <Anchor className="h-16 w-16 text-cyan-600 mx-auto mb-4" />
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-gray-900">
            California Transparency in Supply Chains Act Disclosure
          </h1>
          <p className="mt-3 text-sm sm:text-base text-gray-500">
            Effective Date: May 30, 2025
          </p>
        </header>

        <div className="prose prose-sm sm:prose-base lg:prose-lg max-w-none bg-white p-6 sm:p-8 md:p-10 rounded-xl shadow-xl">
          <p>
            At Focal Optical (&quot;Focal,&quot; &quot;we,&quot; &quot;us,&quot;
            or &quot;our&quot;), we are committed to ensuring that our supply
            chains are free from human trafficking and slavery. In compliance
            with the California Transparency in Supply Chains Act (SB 657), we
            disclose our efforts to eradicate human trafficking and slavery from
            our direct supply chains.
          </p>

          <h2>1. Verification</h2>
          <p>
            We evaluate and address the risks of human trafficking and slavery
            in our supply chains by:
          </p>
          <ul>
            <li>Mapping our direct suppliers and their subcontractors.</li>
            <li>
              Assessing risk factors such as geographic location and labor
              practices.
            </li>
            <li>
              Collaborating with independent organizations to evaluate potential
              risks.
            </li>
          </ul>
          <p>
            We prioritize working with suppliers who share our commitment to
            ethical labor practices.
          </p>

          <h2>2. Audits</h2>
          <p>
            Focal conducts regular audits of our direct suppliers to ensure
            compliance with our standards:
          </p>
          <ul>
            <li>Audits are performed by independent third-party auditors.</li>
            <li>Audits are scheduled and occur at least annually.</li>
            <li>
              Auditors assess working conditions, review documentation, and
              interview employees.
            </li>
          </ul>
          <p>
            These audits help us maintain transparency and accountability within
            our supply chain.
          </p>

          <h2>3. Certification</h2>
          <p>We require our direct suppliers to certify that:</p>
          <ul>
            <li>
              Materials incorporated into our products comply with laws
              regarding slavery and human trafficking.
            </li>
            <li>Their suppliers also adhere to these legal standards.</li>
          </ul>
          <p>
            This certification is a condition of our business relationships.
          </p>

          <h2>4. Internal Accountability</h2>
          <p>
            Focal maintains internal accountability standards and procedures:
          </p>
          <ul>
            <li>
              Our Vendor Code of Conduct outlines expectations for ethical labor
              practices.
            </li>
            <li>
              Employees and contractors are expected to uphold these standards.
            </li>
            <li>
              Violations may result in corrective action, including termination
              of business relationships.
            </li>
          </ul>

          <h2>5. Training</h2>
          <p>
            We provide training to our employees and management who have direct
            responsibility for supply chain management:
          </p>
          <ul>
            <li>
              Training focuses on identifying and mitigating risks of human
              trafficking and slavery.
            </li>
            <li>
              We stay informed about industry best practices and legal
              requirements.
            </li>
          </ul>
          <p>
            Focal Optical is dedicated to ethical sourcing and the protection of
            human rights within our supply chains. We continuously strive to
            improve our practices and uphold the highest standards of integrity.
          </p>

          <h2>Contact Us</h2>
          <p>For more information, please contact us at:</p>
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

export default CaliforniaTransparencyActPage;
