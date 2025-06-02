// src/app/how-to-read-prescriptions/page.tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image, { StaticImageData } from "next/image";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { twMerge } from "tailwind-merge";

// Import your images
import writtenRxRegular from "/public/images/rx-guide/Written-Regular.png";
import writtenRxAstig from "/public/images/rx-guide/Written-Astig.png";
import writtenRxMultifocal from "/public/images/rx-guide/Written-multifocal.png";

import rxBoxBase from "/public/images/rx-guide/rx-box.png";
import rxBoxToric from "/public/images/rx-guide/rx-box-toric.png";
import rxBoxMultifocal from "/public/images/rx-guide/rx-box-multifocal.png";

type ViewMode = "written" | "box";
type SpecialLensType = "none" | "astigmatism" | "multifocal";

interface Step {
  id: string;
  title: string;
  info: string;
  highlightStyle?: React.CSSProperties;
}

interface ImageHighlightProps {
  style?: React.CSSProperties;
  isActive: boolean;
}

const ImageHighlight: React.FC<ImageHighlightProps> = ({ style, isActive }) => {
  if (!isActive || !style) return null;
  return (
    <div
      className="absolute border-2 border-red-500 rounded-sm pointer-events-none transition-opacity duration-300"
      style={{ ...style, opacity: isActive ? 1 : 0 }}
    />
  );
};

// --- Highlight Coordinates for Written Regular/Astigmatism ---
const writtenRxRegularAstigCoordinates = {
  od: { top: "47%", left: "7%", width: "87%", height: "10%" },
  os: { top: "56%", left: "7%", width: "87%", height: "10%" },
  sph: { top: "39%", left: "13%", width: "18%", height: "27%" },
  bc_written: { top: "39%", left: "30%", width: "16.5%", height: "27%" },
  dia_written: { top: "39%", left: "46%", width: "15.5%", height: "27%" },
  brand: { top: "66.5%", left: "5%", width: "90%", height: "12%" },
  exp: { top: "78%", left: "61%", width: "33%", height: "15%" },
  cyl_written_astig: { top: "39%", left: "61.5%", width: "16%", height: "27%" },
  axis_written_astig: { top: "39%", left: "77%", width: "17%", height: "27%" },
};

// --- Highlight Coordinates specifically for Written Multifocal ---
const writtenRxMultifocalCoordinates = {
  od: { top: "47%", left: "6.5%", width: "87.5%", height: "10%" },
  os: { top: "56.5%", left: "6.5%", width: "87.5%", height: "9.5%" },
  sph: { top: "39%", left: "13%", width: "21.5%", height: "26.5%" },
  bc_written: { top: "39%", left: "34.5%", width: "20.5%", height: "27%" },
  dia_written: { top: "39%", left: "54.25%", width: "19.5%", height: "27%" },
  add_written_multi: {
    top: "39%",
    left: "73.25%",
    width: "20.5%",
    height: "27%",
  },
  brand: { top: "66.5%", left: "5%", width: "90%", height: "12%" },
  exp: { top: "78%", left: "61%", width: "33%", height: "15%" },
};

// --- Highlight Coordinates for Box Images ---
const rxBoxBaseCoordinates = {
  od_box_check: { top: "13.5%", left: "60.5%", width: "13%", height: "10%" },
  os_box_check: { top: "13.5%", left: "75%", width: "13%", height: "10%" },
  pwr_box: { top: "37%", left: "44%", width: "22%", height: "23.5%" },
  bc_box: { top: "37%", left: "15%", width: "13%", height: "23.5%" },
  dia_box: { top: "37%", left: "29%", width: "14%", height: "23.5%" },
};

const rxBoxToricCoordinates = {
  od_box_check: { top: "13.5%", left: "60%", width: "13%", height: "10%" },
  os_box_check: { top: "13.5%", left: "75%", width: "13%", height: "10%" },
  pwr_box: { top: "37%", left: "40%", width: "19.25%", height: "23%" },
  bc_box: { top: "37%", left: "14%", width: "13%", height: "23%" },
  dia_box: { top: "37%", left: "27%", width: "13%", height: "23%" },
  cyl_box: { top: "37%", left: "58.75%", width: "13%", height: "23%" },
  axis_box: { top: "37%", left: "73%", width: "14.25%", height: "23%" },
};

const rxBoxMultifocalCoordinates = {
  od_box_check: { top: "13.5%", left: "60%", width: "13%", height: "10%" },
  os_box_check: { top: "13.5%", left: "75%", width: "13%", height: "10%" },
  pwr_box: { top: "37%", left: "44.5%", width: "19.25%", height: "23%" },
  bc_box: { top: "37%", left: "14.5%", width: "13%", height: "23%" },
  dia_box: { top: "37%", left: "29%", width: "13%", height: "23%" },
  add_box: { top: "37%", left: "63%", width: "24%", height: "23%" },
};

// --- Step Definitions (without highlightStyle initially) ---
const WRITTEN_STEP_OD: Step = {
  id: "od",
  title: "Right Eye (O.D.)",
  info: 'OD stands for "oculus dexter" which is Latin for "right eye". The right eye is always listed first on the prescription.',
};
const WRITTEN_STEP_OS: Step = {
  id: "os",
  title: "Left Eye (O.S.)",
  info: "OS stands for \"oculus sinister\" which is Latin. We'll give you free shipping if you can guess its English translation. It's always listed second on a prescription.",
};
const WRITTEN_STEP_SPH: Step = {
  id: "sph",
  title: "Power / Sphere",
  info: "Sometimes abbreviated to PWR, SPH, or something similar, they all mean the same thing: it's the strength of your prescription.\n\nIt will have a plus or minus before it depending on if you're nearsighted (-) or farsighted (+).",
};
const WRITTEN_STEP_BC: Step = {
  id: "bc_written",
  title: "Base Curve (BC)",
  info: "It's a number between 8 and 10 that measures the curve of the lens. The larger the number, the flatter the lens. The base curve determines how the lens fits on your eye and most brands only produce contacts in a couple of base curve options.",
};
const WRITTEN_STEP_DIA: Step = {
  id: "dia_written",
  title: "Diameter (DIA)",
  info: "The width of the lens in millimeters. Most brands manufacture contacts in one standard size between 13.5 and 15 mm wide.",
};
const WRITTEN_STEP_BRAND: Step = {
  id: "brand",
  title: "Brand",
  info: "The brand is part of the prescription and specifies which kind of contacts you can buy. Each brand is made with a specific material and water content.\n\nIf you wear colored contacts, you can order any color that’s available within the brand you were prescribed.",
};
const WRITTEN_STEP_EXP: Step = {
  id: "exp",
  title: "Expiration Date",
  info: "Your prescription is valid for one or two years, depending on which state you live in.",
};

const WRITTEN_STEP_CYL_ASTIG: Step = {
  id: "cyl_written_astig",
  title: "Cylinder (CYL)",
  info: "This indicates the lens power needed to correct astigmatism. It usually ranges from -0.75 to -2.25.",
};
const WRITTEN_STEP_AXIS_ASTIG: Step = {
  id: "axis_written_astig",
  title: "Axis",
  info: "The orientation of the cylinder correction, measured in degrees from 10 to 180.",
};
const WRITTEN_STEP_ADD_MULTI: Step = {
  id: "add_written_multi",
  title: "ADD Power",
  info: "For multifocal lenses, this is the added magnifying power to help with close-up vision.",
};

// Box steps remain the same as they are already ordered correctly
const boxStepsBase: Step[] = [
  {
    id: "od_box_check",
    title: "Right Eye (O.D.)",
    info: 'OD stands for "oculus dexter" which is Latin for "right eye". Check the box to see values for your right eye.',
  },
  {
    id: "os_box_check",
    title: "Left Eye (O.S.)",
    info: 'OS stands for "oculus sinister" which is Latin. Check the box to see values for your left eye.',
  },
  {
    id: "pwr_box",
    title: "Power / Sphere (PWR/D)",
    info: "Sometimes abbreviated to PWR, SPH, or something similar, they all mean the same thing: it's the strength of your prescription. It will have a plus or minus before it depending on if you're nearsighted (-) or farsighted (+).",
  },
  {
    id: "bc_box",
    title: "Base Curve (BC)",
    info: "It's a number between 8 and 10 that measures the curve of the lens. The larger the number, the flatter the lens.",
  },
  {
    id: "dia_box",
    title: "Diameter (DIA)",
    info: "The width of the lens in millimeters. Most brands manufacture contacts in one standard size.",
  },
];

const boxStepsAstigmatism: Step[] = [
  {
    id: "cyl_box",
    title: "Cylinder (CYL)",
    info: "This indicates the lens power needed to correct astigmatism.",
  },
  {
    id: "axis_box",
    title: "Axis",
    info: "The orientation of the cylinder correction, measured in degrees.",
  },
];

const boxStepsMultifocal: Step[] = [
  {
    id: "add_box",
    title: "ADD Power",
    info: "For multifocal lenses, this is the added magnifying power.",
  },
];

const HowToReadPrescriptionsPage = () => {
  const [viewMode, setViewMode] = useState<ViewMode>("written");
  const [specialLensType, setSpecialLensType] =
    useState<SpecialLensType>("none");
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const steps = useMemo(() => {
    let orderedSteps: Step[] = [];
    let currentCoordinates: Record<string, React.CSSProperties | undefined>;

    if (viewMode === "written") {
      const basePart1 = [
        WRITTEN_STEP_OD,
        WRITTEN_STEP_OS,
        WRITTEN_STEP_SPH,
        WRITTEN_STEP_BC,
        WRITTEN_STEP_DIA,
      ];
      const basePart2 = [WRITTEN_STEP_BRAND, WRITTEN_STEP_EXP];

      if (specialLensType === "multifocal") {
        currentCoordinates = writtenRxMultifocalCoordinates;
        orderedSteps = [...basePart1, WRITTEN_STEP_ADD_MULTI, ...basePart2];
      } else if (specialLensType === "astigmatism") {
        currentCoordinates = writtenRxRegularAstigCoordinates;
        orderedSteps = [
          ...basePart1,
          WRITTEN_STEP_CYL_ASTIG,
          WRITTEN_STEP_AXIS_ASTIG,
          ...basePart2,
        ];
      } else {
        // 'none'
        currentCoordinates = writtenRxRegularAstigCoordinates;
        orderedSteps = [...basePart1, ...basePart2];
      }
      // Apply highlight styles to all steps in the final order
      return orderedSteps.map((step) => ({
        ...step,
        highlightStyle: currentCoordinates[step.id],
      }));
    } else {
      // viewMode === 'box'
      let baseBoxSteps = boxStepsBase;
      let additionalBoxSteps: Step[] = [];
      if (specialLensType === "multifocal") {
        currentCoordinates = rxBoxMultifocalCoordinates;
        additionalBoxSteps = boxStepsMultifocal;
      } else if (specialLensType === "astigmatism") {
        currentCoordinates = rxBoxToricCoordinates;
        additionalBoxSteps = boxStepsAstigmatism;
      } else {
        // 'none'
        currentCoordinates = rxBoxBaseCoordinates;
      }
      // Apply highlights to base box steps
      const highlightedBaseBoxSteps = baseBoxSteps.map((step) => ({
        ...step,
        highlightStyle: currentCoordinates[step.id],
      }));
      // Apply highlights to additional box steps
      const highlightedAdditionalBoxSteps = additionalBoxSteps.map((step) => ({
        ...step,
        highlightStyle: currentCoordinates[step.id],
      }));
      return highlightedBaseBoxSteps.concat(highlightedAdditionalBoxSteps);
    }
  }, [viewMode, specialLensType]);

  const currentImage = useMemo(() => {
    if (viewMode === "written") {
      if (specialLensType === "astigmatism") return writtenRxAstig;
      if (specialLensType === "multifocal") return writtenRxMultifocal;
      return writtenRxRegular;
    } else {
      if (specialLensType === "astigmatism") return rxBoxToric;
      if (specialLensType === "multifocal") return rxBoxMultifocal;
      return rxBoxBase;
    }
  }, [viewMode, specialLensType]);

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    setCurrentStepIndex(0);
  };

  const handleSpecialLensTypeChange = (type: SpecialLensType) => {
    setSpecialLensType((prev) => (prev === type ? "none" : type));
    setCurrentStepIndex(0);
  };

  const nextStep = () => {
    setCurrentStepIndex((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const prevStep = () => {
    setCurrentStepIndex((prev) => Math.max(prev - 1, 0));
  };

  const currentStepData = steps[currentStepIndex];

  return (
    <main className="min-h-screen bg-slate-50 py-12 sm:py-16">
      <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <header className="mb-10 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-gray-900">
            How to Read Your Prescription
          </h1>
          <p className="mt-3 text-base sm:text-lg text-gray-600">
            Understanding your contact lens prescription is key to clear vision.
          </p>
        </header>

        <div className="mb-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <span className="text-sm font-medium text-gray-700">View as:</span>
          <div className="flex rounded-lg shadow-sm">
            <button
              onClick={() => handleViewModeChange("written")}
              className={twMerge(
                "px-4 py-2 text-sm font-medium rounded-l-lg border border-gray-300 focus:z-10 focus:ring-2 focus:ring-black focus:outline-none",
                viewMode === "written"
                  ? "bg-black text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              )}
            >
              Written Prescription
            </button>
            <button
              onClick={() => handleViewModeChange("box")}
              className={twMerge(
                "px-4 py-2 text-sm font-medium rounded-r-lg border border-l-0 border-gray-300 focus:z-10 focus:ring-2 focus:ring-black focus:outline-none",
                viewMode === "box"
                  ? "bg-black text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              )}
            >
              On a Box of Contacts
            </button>
          </div>
        </div>

        <div className="lg:grid lg:grid-cols-2 lg:gap-8 xl:gap-12 items-start">
          <div className="relative mb-8 lg:mb-0 lg:sticky lg:top-24 self-start">
            <Image
              src={currentImage}
              alt={`Example of ${
                viewMode === "written" ? "a written" : "a contact lens box"
              } prescription ${
                specialLensType !== "none" ? `for ${specialLensType}` : ""
              }`}
              width={currentImage.width}
              height={currentImage.height}
              layout="responsive"
              className="rounded-lg shadow-lg bg-white"
              priority
            />
            <ImageHighlight
              style={currentStepData?.highlightStyle}
              isActive={true}
            />
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg">
            <div className="mb-6 min-h-[180px] sm:min-h-[200px]">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">
                {currentStepIndex + 1}. {currentStepData?.title}
              </h2>
              <p className="text-sm sm:text-base text-gray-600 whitespace-pre-line">
                {currentStepData?.info}
              </p>
            </div>

            <div className="flex justify-between items-center border-t pt-4">
              <button
                onClick={prevStep}
                disabled={currentStepIndex === 0}
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowLeft size={16} className="mr-1.5" /> Prev
              </button>
              <span className="text-xs text-gray-500">
                Step {currentStepIndex + 1} of {steps.length}
              </span>
              <button
                onClick={nextStep}
                disabled={currentStepIndex === steps.length - 1}
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next <ArrowRight size={16} className="ml-1.5" />
              </button>
            </div>

            <div className="mt-8 border-t pt-6 space-y-4">
              <h3 className="text-md font-semibold text-gray-700">
                Does your prescription include any of these?
              </h3>
              <div className="flex flex-col sm:flex-row sm:gap-6">
                <label className="flex items-center space-x-2 cursor-pointer p-2 rounded-md hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={specialLensType === "astigmatism"}
                    onChange={() => handleSpecialLensTypeChange("astigmatism")}
                    className="h-4 w-4 text-black border-gray-300 rounded focus:ring-black"
                  />
                  <span className="text-sm text-gray-700">
                    I have an astigmatism / wear toric lenses
                  </span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer p-2 rounded-md hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={specialLensType === "multifocal"}
                    onChange={() => handleSpecialLensTypeChange("multifocal")}
                    className="h-4 w-4 text-black border-gray-300 rounded focus:ring-black"
                  />
                  <span className="text-sm text-gray-700">
                    I wear multifocal lenses
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default HowToReadPrescriptionsPage;
