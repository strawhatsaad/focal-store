// src/components/EyeglassesPrescriptionModal.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  ArrowRight,
  ArrowLeft,
  UploadCloud,
  CheckCircle,
  AlertTriangle,
  Loader2,
  ClockFading,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useCart } from "@/context/CartContext";
import type { LensCustomizationData } from "@/sections/Products/EyeglassesModal";
import { useRouter } from "next/navigation";

export interface EyeglassRxDetails {
  prescriptionName?: string;
  shippingState?: string;
  dateOfBirth?: string;
  odSph?: string;
  odCyl?: string;
  odAxis?: string;
  odAdd?: string;
  osSph?: string;
  osCyl?: string;
  osAxis?: string;
  osAdd?: string;
  hasDualPd?: boolean;
  pdSingle?: string;
  pdOd?: string;
  pdOs?: string;
  prescriptionConfirmed?: boolean;
}

interface EyeglassesPrescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: any;
  selectedVariant: any;
  lensCustomizations: LensCustomizationData;
}

const US_STATES = [
  "AL",
  "AK",
  "AZ",
  "AR",
  "CA",
  "CO",
  "CT",
  "DE",
  "FL",
  "GA",
  "HI",
  "ID",
  "IL",
  "IN",
  "IA",
  "KS",
  "KY",
  "LA",
  "ME",
  "MD",
  "MA",
  "MI",
  "MN",
  "MS",
  "MO",
  "MT",
  "NE",
  "NV",
  "NH",
  "NJ",
  "NM",
  "NY",
  "NC",
  "ND",
  "OH",
  "OK",
  "OR",
  "PA",
  "RI",
  "SC",
  "SD",
  "TN",
  "TX",
  "UT",
  "VT",
  "VA",
  "WA",
  "WV",
  "WI",
  "WY",
];

const generateRangeOptions = (
  start: number,
  end: number,
  step: number,
  includePositiveSign = false,
  suffix = "",
): string[] => {
  const options: string[] = [];
  if (start === 0 && end === 0 && step === 0 && suffix === "°") {
    options.push(`0${suffix}`);
  }

  let initialZeroAdded = false;
  if (start <= 0 && end >= 0 && Math.abs(step) < 1 && suffix === "") {
    if (!options.includes("0.00")) {
      options.push("0.00");
      initialZeroAdded = true;
    }
  }

  for (let i = start; i <= end; i += step) {
    if (i === 0 && initialZeroAdded && Math.abs(step) < 1 && suffix === "")
      continue;

    let valueStr = i.toFixed(Math.abs(step) < 1 ? 2 : 0);
    if (includePositiveSign && i > 0) {
      valueStr = `+${valueStr}`;
    }
    if (i === 0 && Math.abs(step) < 1 && suffix === "" && !initialZeroAdded) {
      valueStr = (0).toFixed(2);
    }
    options.push(`${valueStr}${suffix}`);
  }

  const uniqueOptions = Array.from(new Set(options));

  if (suffix === "") {
    uniqueOptions.sort((a, b) => parseFloat(a) - parseFloat(b));
  } else {
    uniqueOptions.sort(
      (a, b) =>
        parseInt(a.replace(suffix, "")) - parseInt(b.replace(suffix, "")),
    );
  }
  return uniqueOptions;
};

const EyeglassesPrescriptionModal: React.FC<
  EyeglassesPrescriptionModalProps
> = ({ isOpen, onClose, product, selectedVariant, lensCustomizations }) => {
  const { data: session } = useSession();
  const {
    addLineItem,
    loading: cartLoading,
    error: cartErrorHook,
    clearCartError,
  } = useCart();
  const router = useRouter();

  type ModalStep =
    | "initialChoice"
    | "manualInput_patientInfo"
    | "manualInput_eyeRx"
    | "manualInput_pd"
    | "uploadRx";

  const [currentStep, setCurrentStep] = useState<ModalStep>("initialChoice");
  const [rxDetails, setRxDetails] = useState<EyeglassRxDetails>({
    hasDualPd: false,
    prescriptionConfirmed: false,
  });
  const [uploadedRxFile, setUploadedRxFile] = useState<File | null>(null);
  const [uploadedRxLabel, setUploadedRxLabel] = useState<string>("");

  const [isProcessingPageAction, setIsProcessingPageAction] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const prevIsOpenRef = useRef<boolean>(isOpen);

  useEffect(() => {
    if (isOpen && !prevIsOpenRef.current) {
      setCurrentStep("initialChoice");
      setRxDetails({
        hasDualPd: false,
        prescriptionConfirmed: false,
        prescriptionName: session?.user?.name || "",
      });
      setUploadedRxFile(null);
      setUploadedRxLabel(
        session?.user?.name
          ? `${session.user.name} - Eyeglass Rx`
          : "Eyeglass Rx",
      );
      setError(null);
      setSuccessMessage(null);
      setIsProcessingPageAction(false);
      if (cartErrorHook) clearCartError();
    }
    prevIsOpenRef.current = isOpen;
  }, [isOpen, session, cartErrorHook, clearCartError]);

  const handleInputChange = (field: keyof EyeglassRxDetails, value: any) => {
    setRxDetails((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setUploadedRxFile(event.target.files[0]);
      if (
        !uploadedRxLabel ||
        uploadedRxLabel ===
          (session?.user?.name
            ? `${session.user.name} - Eyeglass Rx`
            : "Eyeglass Rx")
      ) {
        setUploadedRxLabel(event.target.files[0].name.replace(/\.[^/.]+$/, ""));
      }
      setError(null);
    } else {
      setUploadedRxFile(null);
    }
  };

  const validatePatientInfo = (): boolean => {
    if (!rxDetails.prescriptionName?.trim()) {
      setError("Prescription name is required.");
      return false;
    }
    if (!rxDetails.shippingState) {
      setError("Shipping state is required.");
      return false;
    }
    if (!rxDetails.dateOfBirth) {
      setError("Date of birth is required.");
      return false;
    }
    return true;
  };

  const validateEyeRx = (): boolean => {
    const { odSph, odCyl, odAxis, osSph, osCyl, osAxis } = rxDetails;
    if (!odSph || odSph === "") {
      setError("Right Eye SPH is required.");
      return false;
    }
    if (!osSph || osSph === "") {
      setError("Left Eye SPH is required.");
      return false;
    }
    if (
      odCyl &&
      odCyl !== "0.00" &&
      odCyl !== "+0.00" &&
      (!odAxis || odAxis === "0°" || odAxis === "")
    ) {
      setError("Right Eye Axis is required if CYL is not 0.00.");
      return false;
    }
    if (
      osCyl &&
      osCyl !== "0.00" &&
      osCyl !== "+0.00" &&
      (!osAxis || osAxis === "0°" || osAxis === "")
    ) {
      setError("Left Eye Axis is required if CYL is not 0.00.");
      return false;
    }
    return true;
  };

  const validatePd = (): boolean => {
    if (rxDetails.hasDualPd) {
      if (!rxDetails.pdOd?.trim() || !rxDetails.pdOs?.trim()) {
        setError(
          "If using dual PD, both Right Eye and Left Eye PD values are required.",
        );
        return false;
      }
      if (
        isNaN(parseFloat(rxDetails.pdOd)) ||
        isNaN(parseFloat(rxDetails.pdOs))
      ) {
        setError("Dual PD values must be numbers.");
        return false;
      }
    } else if (rxDetails.pdSingle?.trim()) {
      if (isNaN(parseFloat(rxDetails.pdSingle))) {
        setError("Single PD value must be a number.");
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    setError(null);
    if (currentStep === "manualInput_patientInfo") {
      if (validatePatientInfo()) setCurrentStep("manualInput_eyeRx");
    } else if (currentStep === "manualInput_eyeRx") {
      if (validateEyeRx()) setCurrentStep("manualInput_pd");
    } else if (currentStep === "manualInput_pd") {
      if (!validatePd()) return;
      if (!rxDetails.prescriptionConfirmed) {
        setError("Please confirm the prescription information is correct.");
        return;
      }
      handleFinalAddToCart("manual");
    }
  };

  const handlePrevious = () => {
    setError(null);
    if (currentStep === "manualInput_pd") setCurrentStep("manualInput_eyeRx");
    else if (currentStep === "manualInput_eyeRx")
      setCurrentStep("manualInput_patientInfo");
    else if (
      currentStep === "manualInput_patientInfo" ||
      currentStep === "uploadRx"
    )
      setCurrentStep("initialChoice");
  };

  const handleFinalAddToCart = async (
    prescriptionMethod: "manual" | "upload" | "later",
  ) => {
    setIsProcessingPageAction(true);
    setError(null);
    setSuccessMessage(null);
    if (cartErrorHook) clearCartError();

    let prescriptionAttributes: Array<{ key: string; value: string }> = [];

    if (prescriptionMethod === "manual") {
      if (!rxDetails.prescriptionConfirmed) {
        setError(
          "Please confirm the prescription information is correct before adding to cart.",
        );
        setIsProcessingPageAction(false);
        return;
      }
      if (!validatePatientInfo() || !validateEyeRx() || !validatePd()) {
        setIsProcessingPageAction(false);
        return;
      }
      prescriptionAttributes = [
        { key: "Rx Method", value: "Manual Entry" },
        { key: "Rx Name", value: rxDetails.prescriptionName || "N/A" },
        { key: "Rx State", value: rxDetails.shippingState || "N/A" },
        { key: "Rx DOB", value: rxDetails.dateOfBirth || "N/A" },
        { key: "OD SPH", value: rxDetails.odSph || "N/A" },
        { key: "OD CYL", value: rxDetails.odCyl || "0.00" },
        {
          key: "OD Axis",
          value:
            (rxDetails.odCyl &&
            rxDetails.odCyl !== "0.00" &&
            rxDetails.odCyl !== "+0.00"
              ? rxDetails.odAxis
              : "N/A") || "N/A",
        },
        { key: "OD ADD", value: rxDetails.odAdd || "N/A" },
        { key: "OS SPH", value: rxDetails.osSph || "N/A" },
        { key: "OS CYL", value: rxDetails.osCyl || "0.00" },
        {
          key: "OS Axis",
          value:
            (rxDetails.osCyl &&
            rxDetails.osCyl !== "0.00" &&
            rxDetails.osCyl !== "+0.00"
              ? rxDetails.osAxis
              : "N/A") || "N/A",
        },
        { key: "OS ADD", value: rxDetails.osAdd || "N/A" },
        { key: "PD Type", value: rxDetails.hasDualPd ? "Dual" : "Single" },
        {
          key: "PD Value",
          value: rxDetails.hasDualPd
            ? `OD: ${rxDetails.pdOd || "N/A"}, OS: ${rxDetails.pdOs || "N/A"}`
            : rxDetails.pdSingle || "N/A",
        },
      ];
    } else if (prescriptionMethod === "upload" && uploadedRxFile) {
      const formData = new FormData();
      formData.append("prescriptionFile", uploadedRxFile);
      formData.append(
        "label",
        uploadedRxLabel || uploadedRxFile.name.replace(/\.[^/.]+$/, ""),
      );
      formData.append("category", "Eyeglasses");

      try {
        const uploadRes = await fetch("/api/account/prescriptions", {
          method: "POST",
          body: formData,
        });
        const uploadResult = await uploadRes.json();
        if (!uploadRes.ok)
          throw new Error(
            uploadResult.message || "Failed to upload prescription.",
          );
        prescriptionAttributes.push({
          key: "Rx Method",
          value: "Uploaded File",
        });
        prescriptionAttributes.push({
          key: "Rx File Ref",
          value:
            uploadResult.prescription?.storageUrlOrId ||
            `Uploaded: ${
              uploadResult.prescription?.fileName || uploadedRxFile.name
            }`,
        });
      } catch (e: any) {
        setError(`Prescription Upload Error: ${e.message}`);
        setIsProcessingPageAction(false);
        return;
      }
    } else if (prescriptionMethod === "upload" && !uploadedRxFile) {
      setError("Please select a prescription file to upload.");
      setIsProcessingPageAction(false);
      return;
    } else if (prescriptionMethod === "later") {
      prescriptionAttributes.push({
        key: "Rx Method",
        value: "Will Provide Later",
      });
    } else {
      setError("Invalid prescription method.");
      setIsProcessingPageAction(false);
      return;
    }

    const lensOptionAttributes = lensCustomizations.options.map((opt) => ({
      key: opt.key,
      value: opt.value,
    }));

    const allAttributes = [
      { key: "FocalProductType", value: "Eyeglasses" },
      ...lensOptionAttributes,
      ...prescriptionAttributes,
      {
        key: "_finalCalculatedPrice",
        value: lensCustomizations.price.toFixed(2),
      },
      {
        key: "Frame",
        value: `${product.name} - (${
          selectedVariant.name || selectedVariant.title
        })`,
      },
    ];

    try {
      const success = await addLineItem(selectedVariant.id, 1, allAttributes);

      if (success) {
        setSuccessMessage("Eyeglasses added to cart!");
        onClose();
        router.push("/cart");
      } else {
        setError(
          cartErrorHook ||
            "Failed to add eyeglasses to cart. Please try again.",
        );
      }
    } catch (e: any) {
      setError(e.message || "An unexpected error occurred.");
    } finally {
      setIsProcessingPageAction(false);
    }
  };

  const sphOptions = generateRangeOptions(-20, 20, 0.25, true);
  const cylOptions = generateRangeOptions(-10, 10, 0.25, true);
  const axisOptions = generateRangeOptions(0, 180, 1, false, "°");
  const addOptions = generateRangeOptions(0.25, 7, 0.25, false);

  const renderInitialChoice = () => (
    <div className="text-center space-y-5 py-4">
      <h3 className="text-[26px] font-medium text-gray-900 tracking-tight">
        Provide Your Eyeglass Prescription
      </h3>
      <p className="text-[15px] text-gray-600 leading-relaxed max-w-sm mx-auto">
        Choose how you&apos;d like to submit your prescription details.
      </p>
      <div className="pt-6 space-y-3">
        <button
          onClick={() => setCurrentStep("manualInput_patientInfo")}
          className="w-full bg-white text-gray-900 border border-gray-300 py-[18px] px-6 rounded-2xl hover:border-gray-900 transition-colors text-[17px] font-medium shadow-sm"
        >
          Enter Prescription Manually
        </button>
        <button
          onClick={() => setCurrentStep("uploadRx")}
          className="w-full bg-white text-gray-900 border border-gray-300 py-[18px] px-6 rounded-2xl hover:border-gray-900 transition-colors text-[17px] font-medium shadow-sm"
        >
          Upload a Photo of Your Prescription
        </button>
        <button
          onClick={() => handleFinalAddToCart("later")}
          disabled={isProcessingPageAction || cartLoading}
          className="w-full bg-black text-white py-[18px] px-6 rounded-full hover:bg-gray-800 transition-colors text-[17px] font-medium flex items-center justify-center gap-2 disabled:opacity-70 mt-4 shadow-sm"
        >
          {isProcessingPageAction || cartLoading ? (
            <Loader2 className="animate-spin h-5 w-5" />
          ) : (
            <ClockFading size={18} />
          )}
          Add Prescription Later & Add to Cart
        </button>
      </div>
    </div>
  );

  const renderManualInputPatientInfo = () => (
    <div className="space-y-5">
      <h3 className="text-xl font-semibold border-b pb-3 mb-4 text-gray-800">
        Patient Information
      </h3>
      <div>
        <label
          htmlFor="rxName"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          First and Last Name on Prescription{" "}
          <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="rxName"
          value={rxDetails.prescriptionName || ""}
          onChange={(e) =>
            handleInputChange("prescriptionName", e.target.value)
          }
          className="mt-1 block w-full px-3 py-2.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black sm:text-sm"
          required
        />
      </div>
      <div>
        <label
          htmlFor="shippingState"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          State of Shipping Address <span className="text-red-500">*</span>
        </label>
        <select
          id="shippingState"
          value={rxDetails.shippingState || ""}
          onChange={(e) => handleInputChange("shippingState", e.target.value)}
          className="mt-1 block w-full pl-3 pr-10 py-2.5 border-gray-300 focus:outline-none focus:ring-black focus:border-black sm:text-sm rounded-md"
          required
        >
          <option value="">Select State</option>
          {US_STATES.map((state) => (
            <option key={state} value={state}>
              {state}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label
          htmlFor="dob"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Date of Birth <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          id="dob"
          value={rxDetails.dateOfBirth || ""}
          onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
          className="mt-1 block w-full px-3 py-2.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black sm:text-sm"
          required
        />
      </div>
    </div>
  );

  const renderEyeRxInputs = (eye: "OD" | "OS") => {
    const currentValues = rxDetails;
    const sphField = eye === "OD" ? "odSph" : "osSph";
    const cylField = eye === "OD" ? "odCyl" : "osCyl";
    const axisField = eye === "OD" ? "odAxis" : "osAxis";
    const addField = eye === "OD" ? "odAdd" : "osAdd";
    const isAxisDisabled =
      !currentValues[cylField] ||
      currentValues[cylField] === "0.00" ||
      currentValues[cylField] === "+0.00";

    return (
      <div className="space-y-3 p-4 border rounded-lg bg-gray-50 mb-4">
        <h4 className="text-md font-semibold text-gray-700">
          {eye === "OD" ? "Right Eye (OD)" : "Left Eye (OS)"}
        </h4>
        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
          <div>
            <label
              htmlFor={`${eye}-sph`}
              className="block text-xs font-medium text-gray-600 mb-0.5"
            >
              SPH <span className="text-red-500">*</span>
            </label>
            <select
              id={`${eye}-sph`}
              value={currentValues[sphField] || ""}
              onChange={(e) => handleInputChange(sphField, e.target.value)}
              className="mt-1 w-full text-sm p-2 border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black"
            >
              <option value="">Select</option>
              {sphOptions.map((o) => (
                <option key={`${eye}-sph-${o}`} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor={`${eye}-cyl`}
              className="block text-xs font-medium text-gray-600 mb-0.5"
            >
              CYL
            </label>
            <select
              id={`${eye}-cyl`}
              value={currentValues[cylField] || ""}
              onChange={(e) => handleInputChange(cylField, e.target.value)}
              className="mt-1 w-full text-sm p-2 border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black"
            >
              <option value="">Select</option>
              {cylOptions.map((o) => (
                <option key={`${eye}-cyl-${o}`} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor={`${eye}-axis`}
              className="block text-xs font-medium text-gray-600 mb-0.5"
            >
              Axis{" "}
              {currentValues[cylField] &&
                currentValues[cylField] !== "0.00" &&
                currentValues[cylField] !== "+0.00" && (
                  <span className="text-red-500">*</span>
                )}
            </label>
            <select
              id={`${eye}-axis`}
              value={currentValues[axisField] || ""}
              onChange={(e) => handleInputChange(axisField, e.target.value)}
              disabled={isAxisDisabled}
              className="mt-1 w-full text-sm p-2 border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black disabled:bg-gray-200 disabled:cursor-not-allowed"
            >
              <option value="">Select</option>
              {axisOptions.map((o) => (
                <option key={`${eye}-axis-${o}`} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor={`${eye}-add`}
              className="block text-xs font-medium text-gray-600 mb-0.5"
            >
              ADD
            </label>
            <select
              id={`${eye}-add`}
              value={currentValues[addField] || ""}
              onChange={(e) => handleInputChange(addField, e.target.value)}
              className="mt-1 w-full text-sm p-2 border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black"
            >
              <option value="">Select</option>
              {addOptions.map((o) => (
                <option key={`${eye}-add-${o}`} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    );
  };

  const renderManualInputEyeRx = () => (
    <div className="space-y-5">
      <h3 className="text-xl font-semibold border-b pb-3 mb-4 text-gray-800">
        Prescription Values
      </h3>
      {renderEyeRxInputs("OD")}
      {renderEyeRxInputs("OS")}
    </div>
  );

  const renderManualInputPd = () => (
    <div className="space-y-5">
      <h3 className="text-xl font-semibold border-b pb-3 mb-4 text-gray-800">
        Pupillary Distance (PD)
      </h3>
      <div className="flex items-center p-3 bg-blue-50 border border-blue-200 rounded-md">
        <input
          type="checkbox"
          id="hasDualPd"
          checked={!!rxDetails.hasDualPd}
          onChange={(e) => handleInputChange("hasDualPd", e.target.checked)}
          className="h-4 w-4 text-black border-gray-300 rounded focus:ring-black"
        />
        <label htmlFor="hasDualPd" className="ml-2 block text-sm text-gray-700">
          My prescription has two PD values (e.g., 31.5 / 32.0)
        </label>
      </div>
      {!rxDetails.hasDualPd ? (
        <div>
          <label
            htmlFor="pdSingle"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Single PD Value{" "}
            <span className="text-xs text-gray-500">(if applicable)</span>
          </label>
          <input
            type="text"
            id="pdSingle"
            value={rxDetails.pdSingle || ""}
            onChange={(e) => handleInputChange("pdSingle", e.target.value)}
            placeholder="e.g., 63"
            className="mt-1 block w-full px-3 py-2.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black sm:text-sm"
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="pdOd"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Right Eye (OD) PD <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="pdOd"
              value={rxDetails.pdOd || ""}
              onChange={(e) => handleInputChange("pdOd", e.target.value)}
              placeholder="e.g., 31.5"
              className="mt-1 block w-full px-3 py-2.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black sm:text-sm"
              required
            />
          </div>
          <div>
            <label
              htmlFor="pdOs"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Left Eye (OS) PD <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="pdOs"
              value={rxDetails.pdOs || ""}
              onChange={(e) => handleInputChange("pdOs", e.target.value)}
              placeholder="e.g., 31.5"
              className="mt-1 block w-full px-3 py-2.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black sm:text-sm"
              required
            />
          </div>
        </div>
      )}
      <div className="pt-4">
        <label className="flex items-start">
          <input
            type="checkbox"
            checked={!!rxDetails.prescriptionConfirmed}
            onChange={(e) =>
              handleInputChange("prescriptionConfirmed", e.target.checked)
            }
            className="h-4 w-4 text-black border-gray-300 rounded focus:ring-black mt-0.5 flex-shrink-0"
          />
          <span className="ml-2 text-sm text-gray-700">
            I confirm that this information is correct and taken from a valid
            prescription for{" "}
            <strong className="font-medium">
              {rxDetails.prescriptionName || "the patient"}
            </strong>
            .
          </span>
        </label>
      </div>
    </div>
  );

  const renderUploadRx = () => (
    <div className="space-y-5">
      <h3 className="text-xl font-semibold border-b pb-3 mb-4 text-gray-800">
        Upload Prescription
      </h3>
      <p className="text-sm text-gray-600">
        Please upload a clear photo or scan of your valid eyeglass prescription.
      </p>
      <div>
        <label
          htmlFor="rxFileLabel"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Prescription Label (Optional)
        </label>
        <input
          type="text"
          id="rxFileLabel"
          value={uploadedRxLabel}
          onChange={(e) => setUploadedRxLabel(e.target.value)}
          placeholder={
            session?.user?.name
              ? `${session.user.name} - Eyeglass Rx`
              : "My Eyeglass Rx"
          }
          className="mt-1 block w-full px-3 py-2.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black sm:text-sm"
        />
      </div>
      <div>
        <label
          htmlFor="rxFile"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Prescription File <span className="text-red-500">*</span>
        </label>
        <input
          type="file"
          id="rxFile"
          onChange={handleFileUpload}
          accept="image/*,.pdf"
          className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100"
          required
        />
        {uploadedRxFile && (
          <p className="text-xs text-gray-500 mt-1">
            Selected: {uploadedRxFile.name}
          </p>
        )}
      </div>
    </div>
  );

  if (!isOpen) return null;

  const frameDisplayName =
    selectedVariant?.name ||
    selectedVariant?.title ||
    product?.name ||
    "Selected Frame";
  const totalCalculatedPrice = lensCustomizations?.price || 0;

  return (
    <div
      className={`fixed inset-0 z-[100] flex bg-[#f7f6f2] transition-all duration-300 ${isOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}
    >
      {/* Top Navigation / Close (Fixed across the whole modal) */}
      <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-center bg-transparent z-50 pointer-events-none">
        <div className="pointer-events-auto">{/* Logo */}</div>
        <div className="flex bg-white/60 backdrop-blur-md rounded-full p-1 shadow-sm pointer-events-auto border border-gray-200">
          {currentStep !== "initialChoice" && (
            <button
              onClick={handlePrevious}
              disabled={isProcessingPageAction}
              className="p-2.5 text-gray-500 hover:text-gray-900 rounded-full hover:bg-white transition-all disabled:opacity-50"
              title="Go Back"
            >
              <ArrowLeft size={20} />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-2.5 text-gray-500 hover:text-gray-900 rounded-full hover:bg-white transition-all"
            title="Close"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Left Side: Dynamic Image */}
      <div className="hidden lg:flex flex-1 flex-col items-center justify-center relative p-12 bg-[#f4f5f5]">
        <div className="relative w-full max-w-2xl aspect-[16/9] flex items-center justify-center">
          <img
            src={
              selectedVariant?.image?.src ||
              selectedVariant?.imageSrc ||
              product?.images?.[0]?.src ||
              "https://placehold.co/800x600/E2E8F0/4A5568?text=Eyeglasses"
            }
            alt={frameDisplayName}
            className="max-w-full max-h-full object-contain scale-125 saturate-[1.05]"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src =
                "https://placehold.co/800x600/E2E8F0/4A5568?text=Image+Error";
            }}
          />
        </div>
        <div className="absolute bottom-12 left-12">
          <h2 className="text-[34px] font-medium text-gray-900 tracking-tight leading-none mb-2">
            {product?.name || "Frame"}
          </h2>
          <p className="text-[20px] italic font-serif text-gray-700">
            {frameDisplayName}
          </p>
        </div>
        <div className="absolute bottom-12 right-12 text-right">
          <p className="text-sm text-gray-500 uppercase tracking-widest font-semibold mb-1">
            Total
          </p>
          <p className="text-[26px] font-medium text-gray-900 leading-none">
            ${totalCalculatedPrice.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Right Side: Options Panel */}
      <div
        className={`bg-white w-full lg:w-[480px] xl:w-[540px] h-full shadow-2xl flex flex-col transform transition-transform duration-500 ease-out border-l border-gray-200 relative ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex lg:hidden items-center justify-between p-6 border-b border-gray-100 bg-white sticky top-0 z-10">
          <div className="flex items-center gap-2">
            {currentStep !== "initialChoice" && (
              <button
                onClick={handlePrevious}
                aria-label="Go back"
                className="text-gray-500 hover:text-gray-900 p-2 rounded-full hover:bg-gray-100 transition-colors"
                disabled={isProcessingPageAction}
              >
                <ArrowLeft size={18} />
              </button>
            )}
            <h2 className="text-xl font-medium text-gray-900 tracking-tight">
              Prescription
            </h2>
          </div>
          <div className="text-right">
            <p className="text-lg font-medium text-gray-900">
              ${totalCalculatedPrice.toFixed(2)}
            </p>
          </div>
        </div>

        <div className="p-6 lg:px-12 lg:pt-32 overflow-y-auto flex-grow hide-scrollbar pb-32">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3">
              <AlertTriangle
                size={20}
                className="text-red-500 shrink-0 mt-0.5"
              />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 border border-green-100 rounded-xl flex items-start gap-3">
              <CheckCircle
                size={20}
                className="text-green-600 shrink-0 mt-0.5"
              />
              <p className="text-sm text-green-700">{successMessage}</p>
            </div>
          )}

          <div className="transition-opacity duration-300">
            {currentStep === "initialChoice" && renderInitialChoice()}
            {currentStep === "manualInput_patientInfo" &&
              renderManualInputPatientInfo()}
            {currentStep === "manualInput_eyeRx" && renderManualInputEyeRx()}
            {currentStep === "manualInput_pd" && renderManualInputPd()}
            {currentStep === "uploadRx" && renderUploadRx()}
          </div>
        </div>

        {currentStep !== "initialChoice" && (
          <div className="absolute bottom-0 w-full bg-white border-t border-gray-100 p-6 shadow-[0_-10px_40px_rgba(0,0,0,0.03)] z-20">
            {currentStep === "manualInput_pd" || currentStep === "uploadRx" ? (
              <button
                onClick={() =>
                  handleFinalAddToCart(
                    currentStep === "uploadRx" ? "upload" : "manual",
                  )
                }
                disabled={
                  isProcessingPageAction ||
                  cartLoading ||
                  (currentStep === "manualInput_pd" &&
                    !rxDetails.prescriptionConfirmed) ||
                  (currentStep === "uploadRx" && !uploadedRxFile)
                }
                className="w-full flex items-center justify-center bg-black text-white py-4 px-6 rounded-full text-[17px] font-medium hover:bg-gray-800 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                {isProcessingPageAction || cartLoading ? (
                  <Loader2 className="animate-spin h-5 w-5 mr-2" />
                ) : null}
                {currentStep === "uploadRx"
                  ? "Upload & Add to Cart"
                  : "Add to Cart"}
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={isProcessingPageAction}
                className="w-full flex items-center justify-center bg-black text-white py-4 px-6 rounded-full text-[17px] font-medium hover:bg-gray-800 disabled:opacity-50 transition-all shadow-sm"
              >
                Continue <ArrowRight size={18} className="ml-2" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EyeglassesPrescriptionModal;
