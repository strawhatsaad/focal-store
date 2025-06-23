// src/app/how-to-measure-pd/page.tsx
"use client";

import React from "react";
import Image from "next/image";
import { Ruler, Users, Glasses } from "lucide-react";
import measureYourselfIMG from "@/assets/HowToMeasurePD/measure-yourself.jpg";
import measureWithPartnerIMG from "@/assets/HowToMeasurePD/measure-with-friend.jpeg";

const HowToMeasurePdPage = () => {
  return (
    <main className="min-h-screen bg-slate-50 py-12 sm:py-16">
      <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <header className="mb-10 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-gray-900">
            How to Measure Your Pupillary Distance (PD) at Home
          </h1>
          <p className="mt-3 text-base sm:text-lg text-gray-600">
            A simple guide to getting an accurate measurement for your next pair
            of glasses.
          </p>
        </header>

        <div className="prose prose-lg max-w-none bg-white p-6 sm:p-8 md:p-10 rounded-xl shadow-xl">
          <p>
            When it comes to ordering prescription glasses, one tiny but
            powerful number can make all the difference: your Pupillary Distance
            (PD). It&apos;s the distance between the centers of your pupils,
            measured in millimeters, and it ensures that your lenses are
            positioned correctly in front of your eyes. A properly measured PD
            leads to sharper vision, less eye strain, and more comfortable
            glasses.
          </p>
          <p>
            If you don&apos;t have your PD on hand, don&apos;t worry — measuring
            it at home is simple with a few basic tools. Here&apos;s a
            step-by-step guide to help you get it right.
          </p>

          <div className="my-8 p-6 bg-gray-50 rounded-lg border">
            <h2 className="text-2xl font-semibold flex items-center">
              <Ruler className="mr-3 h-7 w-7 text-black" />
              What You’ll Need:
            </h2>
            <ul className="mt-4 space-y-2">
              <li>A mirror</li>
              <li>
                A millimeter ruler (you can print one or use a regular one)
              </li>
              <li>A steady hand</li>
              <li>A friend (optional but helpful!)</li>
            </ul>
          </div>

          <div className="my-8">
            <h2 className="text-2xl font-semibold text-center mb-4">
              Video Tutorial
            </h2>
            <div className="w-full mx-auto max-w-2xl">
              {/* Note: The src URL provided is not a valid YouTube embed link. 
                  Replace it with a proper embed URL like "https://www.youtube.com/embed/b5dOglpKq4I" for it to display. */}
              <iframe
                src="https://www.youtube.com/embed/b5dOglpKq4I"
                title="How to Measure Your PD (Pupillary Distance) for Glasses at Home"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                className="w-full aspect-[19/10] rounded-xl shadow-lg"
              ></iframe>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 my-8">
            <div className="flex flex-col items-center">
              <Image
                src={measureYourselfIMG}
                alt="Illustration of a person measuring their PD in a mirror"
                width={300}
                height={200}
                className="rounded-lg mb-4 bg-gray-200"
              />
              <h3 className="text-xl font-semibold mt-4">
                How to Measure Your PD by Yourself
              </h3>
              <ol className="mt-4 space-y-3">
                <li>
                  <strong>Get Your Ruler Ready:</strong> Use a ruler that
                  measures in millimeters. If you&apos;re using a printed ruler,
                  make sure it&apos;s printed at 100% scale.
                </li>
                <li>
                  <strong>Stand in Front of a Mirror:</strong> Position yourself
                  about 8 inches (20 cm) away from a mirror, standing straight
                  and relaxed.
                </li>
                <li>
                  <strong>Align the Ruler:</strong> Hold the ruler against your
                  forehead, just above your eyes, and close your right eye. Line
                  up the zero (0) mark with the center of your left pupil.
                </li>
                <li>
                  <strong>Take the Measurement:</strong> Without moving the
                  ruler, close your left eye and open your right eye. Read the
                  number that lines up with the center of your right pupil.
                  That&apos;s your PD!
                </li>
                <li>
                  <strong>Double-Check:</strong> Repeat the process a few times
                  to make sure you&apos;re getting a consistent number. If you
                  get slightly different results, take the average.
                </li>
              </ol>
            </div>
            <div className="flex flex-col items-center">
              <Image
                src={measureWithPartnerIMG}
                alt="Illustration of a person helping another measure their PD"
                width={300}
                height={200}
                className="rounded-lg mb-4 bg-gray-200"
              />
              <h3 className="text-xl font-semibold mt-4">
                How to Measure Your PD with Help
              </h3>
              <ol className="mt-4 space-y-3">
                <li>
                  <strong>Get Comfortable:</strong> Sit down and focus on a
                  point about 10 to 20 feet away to keep your eyes steady and
                  relaxed.
                </li>
                <li>
                  <strong>Ruler Placement:</strong> Have your helper rest the
                  ruler flat against your forehead, aligning the 0 mm mark with
                  the center of your right pupil.
                </li>
                <li>
                  <strong>Measure Carefully:</strong> While you continue looking
                  at the distant object, your helper should measure the distance
                  to the center of your left pupil. This number is your PD.
                </li>
              </ol>
            </div>
          </div>

          <div className="my-8 p-6 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg">
            <h2 className="text-2xl font-semibold flex items-center">
              <Glasses className="mr-3 h-7 w-7 text-blue-600" />
              Types of PD Measurements
            </h2>
            <ul className="mt-4 space-y-2">
              <li>
                <strong>Single PD:</strong> A single number, like 63 mm,
                measuring the total distance between your pupils. This is common
                for single-vision lenses.
              </li>
              <li>
                <strong>Dual PD:</strong> Two measurements, such as 31 mm and 32
                mm, representing the distance from each pupil to the bridge of
                your nose. This is often needed for progressive or bifocal
                lenses.
              </li>
            </ul>
          </div>

          <h3>Typical PD Ranges</h3>
          <ul>
            <li>
              <strong>Adult Range:</strong> 54–74 mm
            </li>
            <li>
              <strong>Average for Women:</strong> About 60 mm
            </li>
            <li>
              <strong>Average for Men:</strong> About 64 mm
            </li>
          </ul>
          <p>
            (Keep in mind: these are averages — your unique PD might be
            different, and that&apos;s perfectly normal!)
          </p>

          <h3>Why Getting Your PD Right Matters</h3>
          <p>A PD that&apos;s off by even a few millimeters can cause:</p>
          <ul>
            <li>Eye strain</li>
            <li>Blurry vision</li>
            <li>Headaches</li>
            <li>General discomfort with your glasses</li>
          </ul>
          <p>
            Taking a few minutes to get this measurement right ensures that your
            lenses align properly with your eyes, giving you the clearest, most
            comfortable vision possible.
          </p>
          <p className="font-semibold">
            With just a mirror, a ruler, and a little patience, you can easily
            measure your PD at home — no special equipment or appointments
            needed!
          </p>
        </div>
      </div>
    </main>
  );
};

export default HowToMeasurePdPage;
