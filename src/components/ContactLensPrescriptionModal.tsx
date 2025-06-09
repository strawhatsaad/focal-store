// src/components/ContactLensPrescriptionModal.tsx
"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  X,
  ArrowRight,
  ArrowLeft,
  UploadCloud,
  CheckCircle,
  AlertTriangle,
  Loader2,
  ChevronDown,
} from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";

export interface ContactLensPrescriptionData {
  odValues: PrescriptionValues;
  osValues: PrescriptionValues;
  prescriptionReferenceType: "existing" | "new" | "later" | "none";
  prescriptionReferenceValue: string;
  uploadedFile?: File | null;
}

interface PrescriptionValues {
  sph?: string;
  cyl?: string;
  axis?: string;
  add?: string;
  bc?: string;
  dia?: string;
}

interface PrescriptionEntry {
  id: string;
  fileName: string;
  label?: string;
  category?: "ContactLenses" | "Eyeglasses";
  storageUrlOrId: string;
  googleDriveFileId?: string | null;
}

interface ContactLensPrescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: any;
  selectedVariant: any;
  onComplete: (data: ContactLensPrescriptionData) => void;
}

interface SphOptionsSeparated {
  negative: string[];
  zero: string;
  positive: string[];
}

const generateSphOptionsSeparated = (
  isAstigmatismProduct: boolean
): SphOptionsSeparated => {
  const negativeOptions: string[] = [];
  const positiveOptions: string[] = [];
  const zeroOption = "0.00";
  const negativeLimit = isAstigmatismProduct ? -9.0 : -12.0;
  const positiveLimit = 8.0;
  const step = 0.25;
  for (let i = -step; i >= negativeLimit; i -= step) {
    negativeOptions.unshift(i.toFixed(2));
  }
  for (let i = step; i <= positiveLimit; i += step) {
    positiveOptions.push(`+${i.toFixed(2)}`);
  }
  return {
    negative: negativeOptions.sort((a, b) => parseFloat(b) - parseFloat(a)),
    zero: zeroOption,
    positive: positiveOptions.sort((a, b) => parseFloat(a) - parseFloat(b)),
  };
};

const generateCylOptions = (): string[] => {
  const options: string[] = [];
  for (let i = -0.75; i >= -2.75; i -= 0.5) {
    options.push(i.toFixed(2));
  }
  return options.sort((a, b) => parseFloat(a) - parseFloat(b));
};

const generateAxisOptions = (): string[] => {
  const options: string[] = [];
  for (let i = 10; i <= 180; i += 10) {
    options.push(`${i}°`);
  }
  return options;
};

const cleanOptionString = (str: string): string => {
  let cleaned = str.trim();
  if (
    (cleaned.startsWith('"') && cleaned.endsWith('"')) ||
    (cleaned.startsWith("'") && cleaned.endsWith("'"))
  ) {
    cleaned = cleaned.substring(1, cleaned.length - 1);
  }
  if (cleaned.startsWith("[") && cleaned.endsWith("]")) {
    cleaned = cleaned.substring(1, cleaned.length - 1);
  }
  return cleaned.trim();
};

const parseMetafieldOptions = (metafieldValue?: string): string[] => {
  if (!metafieldValue || metafieldValue.trim() === "") return [];
  const trimmedValue = metafieldValue.trim();
  if (trimmedValue.startsWith("[") && trimmedValue.endsWith("]")) {
    try {
      const parsedArray = JSON.parse(trimmedValue);
      if (Array.isArray(parsedArray)) {
        return parsedArray
          .map((item) => cleanOptionString(String(item)))
          .filter((s) => s.length > 0);
      }
    } catch (e) {
      // console.warn(`Metafield value looked like JSON array but failed to parse...`);
    }
  }
  return trimmedValue
    .split(",")
    .map((s) => cleanOptionString(s))
    .filter((s) => s.length > 0);
};

const ContactLensPrescriptionModal: React.FC<
  ContactLensPrescriptionModalProps
> = ({ isOpen, onClose, product, selectedVariant, onComplete }) => {
  const { data: session } = useSession();
  const [currentStep, setCurrentStep] = useState(0); // 0: Intro, 1: OD, 2: OS, 3: Verify
  const [odValues, setOdValues] = useState<PrescriptionValues>({});
  const [osValues, setOsValues] = useState<PrescriptionValues>({});

  const [existingPrescriptions, setExistingPrescriptions] = useState<
    PrescriptionEntry[]
  >([]);
  const [selectedExistingRxId, setSelectedExistingRxId] = useState<string>("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadLabel, setUploadLabel] = useState("");
  const [willProvideRxLater, setWillProvideRxLater] = useState(false);

  const [isLoadingExistingRx, setIsLoadingExistingRx] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isSphSelectOpen, setIsSphSelectOpen] = useState(false);
  const sphSelectRef = useRef<HTMLDivElement>(null);

  const isAstigmatismProduct = useMemo(() => {
    const axisMetafield = product.metafields?.find(
      (mf: any) => mf && mf.key === "axis"
    );
    const cylMetafield = product.metafields?.find(
      (mf: any) => mf && mf.key === "cylinder_cyl"
    );
    return (
      axisMetafield?.value?.toString().toLowerCase() === "true" ||
      cylMetafield?.value?.toString().toLowerCase() === "true"
    );
  }, [product.metafields]);

  const isMultifocalProduct = useMemo(() => {
    const addMetafield = product.metafields?.find(
      (mf: any) => mf && mf.key === "add"
    );
    return !!addMetafield?.value && addMetafield.value.trim() !== "";
  }, [product.metafields]);

  const sphOptionsSeparated = useMemo(
    () => generateSphOptionsSeparated(isAstigmatismProduct),
    [isAstigmatismProduct]
  );
  const cylOptions = useMemo(
    () => (isAstigmatismProduct ? generateCylOptions() : []),
    [isAstigmatismProduct]
  );
  const axisOptions = useMemo(
    () => (isAstigmatismProduct ? generateAxisOptions() : []),
    [isAstigmatismProduct]
  );

  const addPowerOptions = useMemo(() => {
    if (!isMultifocalProduct) return [];
    const addMetafield = product.metafields?.find(
      (mf: any) => mf && mf.key === "add"
    );
    return parseMetafieldOptions(addMetafield?.value);
  }, [product.metafields, isMultifocalProduct]);

  const bcOptions = useMemo(() => {
    const bcMetafield = product.metafields?.find(
      (mf: any) => mf && mf.key === "base_curve_b_c"
    );
    return parseMetafieldOptions(bcMetafield?.value);
  }, [product.metafields]);

  const diaOptions = useMemo(() => {
    const diaMetafield = product.metafields?.find(
      (mf: any) => mf && mf.key === "diameter_dia"
    );
    return parseMetafieldOptions(diaMetafield?.value);
  }, [product.metafields]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        sphSelectRef.current &&
        !sphSelectRef.current.contains(event.target as Node)
      ) {
        setIsSphSelectOpen(false);
      }
    };
    if (isSphSelectOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSphSelectOpen]);

  const handleValueChange = (
    eye: "OD" | "OS",
    field: keyof PrescriptionValues,
    value: string
  ) => {
    const setter = eye === "OD" ? setOdValues : setOsValues;
    setter((prev) => ({ ...prev, [field]: value }));
    setError(null);
    if (field === "sph") setIsSphSelectOpen(false);
  };

  useEffect(() => {
    const currentEyeValues = currentStep === 1 ? odValues : osValues;
    const eyeSetter = currentStep === 1 ? setOdValues : setOsValues;

    if (currentStep === 1 || currentStep === 2) {
      if (bcOptions.length === 1 && currentEyeValues.bc !== bcOptions[0]) {
        eyeSetter((prev) => ({ ...prev, bc: bcOptions[0] }));
      }
      if (diaOptions.length === 1 && currentEyeValues.dia !== diaOptions[0]) {
        eyeSetter((prev) => ({ ...prev, dia: diaOptions[0] }));
      }
      if (
        isMultifocalProduct &&
        addPowerOptions.length === 1 &&
        currentEyeValues.add !== addPowerOptions[0]
      ) {
        eyeSetter((prev) => ({ ...prev, add: addPowerOptions[0] }));
      }
    }
  }, [
    currentStep,
    bcOptions,
    diaOptions,
    addPowerOptions,
    isMultifocalProduct,
    odValues,
    osValues,
  ]);

  useEffect(() => {
    if (isOpen && session && currentStep === 3) {
      const fetchExistingPrescriptions = async () => {
        setIsLoadingExistingRx(true);
        setError(null);
        try {
          const res = await fetch(
            "/api/account/prescriptions?category=ContactLenses"
          );
          if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.message || "Failed to fetch prescriptions");
          }
          const data = await res.json();
          setExistingPrescriptions(data.prescriptions || []);
        } catch (e: any) {
          setError(`Could not load existing prescriptions: ${e.message}`);
        } finally {
          setIsLoadingExistingRx(false);
        }
      };
      fetchExistingPrescriptions();
    }
  }, [isOpen, session, currentStep]);

  // This effect resets the modal to its initial state only when it is opened.
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
      setOdValues({});
      setOsValues({});
      setSelectedExistingRxId("");
      setUploadedFile(null);
      setWillProvideRxLater(false);
      setError(null);
      setIsSubmitting(false);
      setIsSphSelectOpen(false);
    }
  }, [isOpen]);

  // This effect sets the default label for a new prescription upload.
  // It's separate to avoid resetting the entire form if the session reloads.
  useEffect(() => {
    if (isOpen) {
      setUploadLabel(
        session?.user?.name
          ? `${session.user.name} - Contact Lens Rx`
          : "Contact Lens Rx"
      );
    }
  }, [isOpen, session]);

  const isStepComplete = (values: PrescriptionValues): boolean => {
    if (!values.sph || values.sph === "") return false;
    if (bcOptions.length > 0 && (!values.bc || values.bc === "")) return false;
    if (diaOptions.length > 0 && (!values.dia || values.dia === ""))
      return false;
    if (
      isAstigmatismProduct &&
      (!values.cyl || values.cyl === "" || !values.axis || values.axis === "")
    )
      return false;
    if (
      isMultifocalProduct &&
      addPowerOptions.length > 0 &&
      (!values.add || values.add === "")
    )
      return false;
    return true;
  };

  const handleNextStep = () => {
    setError(null);
    if (currentStep === 1 && !isStepComplete(odValues)) {
      setError("Please select all required values for the Right Eye (OD).");
      return;
    }
    if (currentStep === 2 && !isStepComplete(osValues)) {
      setError("Please select all required values for the Left Eye (OS).");
      return;
    }
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBackStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      onClose();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
      setSelectedExistingRxId("");
      setWillProvideRxLater(false);
      if (
        !uploadLabel ||
        uploadLabel ===
          (session?.user?.name
            ? `${session.user.name} - Contact Lens Rx`
            : "Contact Lens Rx")
      ) {
        setUploadLabel(e.target.files[0].name.replace(/\.[^/.]+$/, ""));
      }
      setError(null);
    } else {
      setUploadedFile(null);
    }
  };

  const handleExistingRxSelection = (rxId: string) => {
    setSelectedExistingRxId(rxId);
    setUploadedFile(null);
    setWillProvideRxLater(false);
    setUploadLabel(
      session?.user?.name
        ? `${session.user.name} - Contact Lens Rx`
        : "Contact Lens Rx"
    );
    setError(null);
  };

  const handleWillProvideRxLaterChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const checked = e.target.checked;
    setWillProvideRxLater(checked);
    if (checked) {
      setSelectedExistingRxId("");
      setUploadedFile(null);
      setUploadLabel(
        session?.user?.name
          ? `${session.user.name} - Contact Lens Rx`
          : "Contact Lens Rx"
      );
    }
    setError(null);
  };

  const handleConfirmPrescription = () => {
    setError(null);
    if (!selectedExistingRxId && !uploadedFile && !willProvideRxLater) {
      setError(
        "Please select an existing prescription, upload a new one, or choose to add it later."
      );
      return;
    }

    let refValue = "";
    let refType: "existing" | "new" | "later" | "none" = "none";

    if (willProvideRxLater) {
      refType = "later";
      refValue = "Will Provide Later";
    } else if (selectedExistingRxId) {
      const selectedRx = existingPrescriptions.find(
        (rx) => rx.id === selectedExistingRxId
      );
      refValue =
        selectedRx?.storageUrlOrId ||
        `Existing Rx: ${
          selectedRx?.label || selectedRx?.fileName || selectedExistingRxId
        }`;
      refType = "existing";
    } else if (uploadedFile) {
      refValue = uploadLabel || uploadedFile.name.replace(/\.[^/.]+$/, "");
      refType = "new";
    }

    const prescriptionData: ContactLensPrescriptionData = {
      odValues,
      osValues,
      prescriptionReferenceType: refType,
      prescriptionReferenceValue: refValue,
      uploadedFile: refType === "new" ? uploadedFile : null,
    };
    onComplete(prescriptionData);
  };

  const renderSelectOrText = (
    label: string,
    value: string | undefined,
    onChange: (val: string) => void,
    options: string[],
    isRequired: boolean = true,
    disabled: boolean = false
  ): React.ReactNode => {
    if (options.length === 1 && !disabled) {
      return (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            {label}
          </label>
          <p className="mt-1 block w-full pl-3 py-2.5 text-sm text-gray-700 bg-gray-50 border border-gray-300 rounded-md shadow-sm">
            {options[0]}
          </p>
        </div>
      );
    }
    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}{" "}
          {isRequired && options.length > 0 && (
            <span className="text-red-500">*</span>
          )}
        </label>
        <select
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled || options.length === 0}
          className="mt-1 block w-full pl-3 pr-10 py-2.5 text-sm border-gray-300 focus:outline-none focus:ring-black focus:border-black rounded-md shadow-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          <option value="" disabled>
            {options.length === 0 ? "N/A for this product" : `Select ${label}`}
          </option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>
    );
  };

  const renderCustomSphSelect = (
    eye: "OD" | "OS",
    currentValue: string | undefined,
    options: SphOptionsSeparated,
    isRequired: boolean = true
  ): React.ReactNode => {
    return (
      <div className="mb-4 relative" ref={sphSelectRef}>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Sphere (SPH/PWR){" "}
          {isRequired && <span className="text-red-500">*</span>}
        </label>
        <button
          type="button"
          onClick={() => setIsSphSelectOpen((prev) => !prev)}
          className="mt-1 block w-full pl-3 pr-10 py-2.5 text-sm text-left bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black focus:border-black rounded-md shadow-sm flex justify-between items-center"
        >
          <span>{currentValue || `Select Sphere`}</span>
          <ChevronDown
            size={16}
            className={`text-gray-500 transition-transform ${
              isSphSelectOpen ? "rotate-180" : ""
            }`}
          />
        </button>
        {isSphSelectOpen && (
          <div className="absolute z-20 mt-1 w-full max-h-60 bg-white border border-gray-300 rounded-md shadow-lg flex flex-col overflow-hidden">
            <div
              key={options.zero}
              onClick={() => handleValueChange(eye, "sph", options.zero)}
              className="col-span-2 px-3 py-2 text-sm text-gray-800 hover:bg-gray-100 cursor-pointer text-center font-medium border-b flex-shrink-0"
            >
              {options.zero}
            </div>
            <div className="grid grid-cols-2 overflow-y-auto flex-grow">
              <div className="border-r border-gray-200">
                {options.negative.map((opt) => (
                  <div
                    key={`neg-${opt}`}
                    onClick={() => handleValueChange(eye, "sph", opt)}
                    className="px-3 py-2 text-sm text-gray-800 hover:bg-gray-100 cursor-pointer text-center"
                  >
                    {opt}
                  </div>
                ))}
              </div>
              <div>
                {options.positive.map((opt) => (
                  <div
                    key={`pos-${opt}`}
                    onClick={() => handleValueChange(eye, "sph", opt)}
                    className="px-3 py-2 text-sm text-gray-800 hover:bg-gray-100 cursor-pointer text-center"
                  >
                    {opt}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderEyeForm = (eye: "OD" | "OS", values: PrescriptionValues) => (
    <div className="space-y-3">
      <h3 className="text-xl font-semibold mb-4 text-gray-900 border-b pb-2">
        {eye === "OD" ? "Right Eye (OD)" : "Left Eye (OS)"} Prescription
      </h3>
      {renderCustomSphSelect(eye, values.sph, sphOptionsSeparated, true)}
      {isAstigmatismProduct &&
        renderSelectOrText(
          "Cylinder (CYL)",
          values.cyl,
          (val) => handleValueChange(eye, "cyl", val),
          cylOptions,
          isAstigmatismProduct
        )}
      {isAstigmatismProduct &&
        renderSelectOrText(
          "Axis",
          values.axis,
          (val) => handleValueChange(eye, "axis", val),
          axisOptions,
          isAstigmatismProduct
        )}
      {isMultifocalProduct &&
        renderSelectOrText(
          "ADD Power",
          values.add,
          (val) => handleValueChange(eye, "add", val),
          addPowerOptions,
          isMultifocalProduct && addPowerOptions.length > 0
        )}
      {renderSelectOrText(
        "Base Curve (BC)",
        values.bc,
        (val) => handleValueChange(eye, "bc", val),
        bcOptions,
        bcOptions.length > 0
      )}
      {renderSelectOrText(
        "Diameter (DIA)",
        values.dia,
        (val) => handleValueChange(eye, "dia", val),
        diaOptions,
        diaOptions.length > 0
      )}
    </div>
  );

  if (!isOpen) return null;

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-center text-gray-800">
              Before You Begin
            </h2>
            <div className="my-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 rounded-r-lg">
              <div className="flex">
                <div className="py-1">
                  <AlertTriangle className="h-6 w-6 text-yellow-500 mr-4" />
                </div>
                <div>
                  <p className="font-semibold">Accuracy is Key!</p>
                  <p className="text-sm">
                    Entering your prescription values correctly is crucial for
                    your eye health and getting the right lenses.
                  </p>
                </div>
              </div>
            </div>
            <p className="text-center text-gray-600">
              If you need help understanding your prescription, we've got you
              covered.
            </p>
            <Link
              href="/how-to-read-prescriptions"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center mt-3 text-blue-600 hover:text-blue-800 underline font-medium"
            >
              Click here for our guide on how to read your prescription.
            </Link>
          </div>
        );
      case 1:
        return renderEyeForm("OD", odValues);
      case 2:
        return renderEyeForm("OS", osValues);
      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-900 border-b pb-2">
              Prescription Verification
            </h3>
            <p className="text-sm text-gray-600">
              Please ensure you are uploading a valid{" "}
              <strong className="font-medium">Contact Lens Prescription</strong>
              . Eyeglass prescriptions cannot be used for contact lenses.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Select Existing Prescription (Contact Lenses)
              </label>
              <select
                value={selectedExistingRxId}
                onChange={(e) => handleExistingRxSelection(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2.5 text-sm border-gray-300 focus:outline-none focus:ring-black focus:border-black rounded-md shadow-sm disabled:bg-gray-100"
                disabled={
                  isLoadingExistingRx ||
                  existingPrescriptions.length === 0 ||
                  willProvideRxLater
                }
              >
                <option value="">
                  {isLoadingExistingRx
                    ? "Loading..."
                    : existingPrescriptions.length === 0
                    ? "No contact lens Rx found"
                    : "Select an existing Rx"}
                </option>
                {existingPrescriptions.map((rx) => (
                  <option key={rx.id} value={rx.id}>
                    {rx.label || rx.fileName}
                  </option>
                ))}
              </select>
            </div>
            <div className="relative my-4">
              {" "}
              <div
                className="absolute inset-0 flex items-center"
                aria-hidden="true"
              >
                {" "}
                <div className="w-full border-t border-gray-300" />{" "}
              </div>{" "}
              <div className="relative flex justify-center">
                {" "}
                <span className="bg-white px-2 text-sm text-gray-500">
                  OR
                </span>{" "}
              </div>{" "}
            </div>
            <div className="space-y-2">
              <label
                htmlFor="prescriptionFileModal"
                className="block text-sm font-medium text-gray-700"
              >
                {" "}
                Upload New Contact Lens Prescription{" "}
              </label>
              <input
                type="text"
                value={uploadLabel}
                onChange={(e) => setUploadLabel(e.target.value)}
                placeholder="Prescription Label (e.g., My Contact Lens Rx)"
                className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black"
                disabled={
                  isSubmitting || isLoadingExistingRx || willProvideRxLater
                }
              />
              <input
                type="file"
                id="prescriptionFileModal"
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png"
                className="block w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-black file:text-white hover:file:bg-black/70 disabled:opacity-50"
                disabled={
                  isSubmitting || isLoadingExistingRx || willProvideRxLater
                }
              />
              {uploadedFile && !willProvideRxLater && (
                <p className="text-xs text-gray-500 mt-1">
                  Selected: {uploadedFile.name}
                </p>
              )}
            </div>
            <div className="relative my-4">
              {" "}
              <div
                className="absolute inset-0 flex items-center"
                aria-hidden="true"
              >
                {" "}
                <div className="w-full border-t border-gray-300" />{" "}
              </div>{" "}
              <div className="relative flex justify-center">
                {" "}
                <span className="bg-white px-2 text-sm text-gray-500">
                  OR
                </span>{" "}
              </div>{" "}
            </div>
            <div className="flex items-center">
              <input
                id="willProvideRxLater"
                name="willProvideRxLater"
                type="checkbox"
                checked={willProvideRxLater}
                onChange={handleWillProvideRxLaterChange}
                className="h-4 w-4 text-black border-gray-300 rounded focus:ring-black"
              />
              <label
                htmlFor="willProvideRxLater"
                className="ml-2 block text-sm text-gray-700"
              >
                I&apos;ll add my prescription later
              </label>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-75 p-4 transition-opacity duration-300 ease-in-out">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md sm:max-w-lg max-h-[90vh] flex flex-col transform transition-all duration-300 ease-in-out scale-100">
        <div className="flex items-center justify-between p-4 sm:p-5 border-b sticky top-0 bg-white z-10">
          <button
            onClick={handleBackStep}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <ArrowLeft className="h-6 w-6 text-gray-600" />
          </button>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 truncate pr-2">
            {product?.name} ({selectedVariant?.name}) - Rx
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X size={22} />
          </button>
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto flex-grow space-y-4">
          {error && (
            <div className="p-3 text-sm bg-red-100 text-red-700 rounded-md border border-red-200 flex items-center gap-2">
              <AlertTriangle size={18} className="flex-shrink-0" />
              <span className="break-words">{error}</span>
            </div>
          )}

          {renderStepContent()}
        </div>

        <div className="p-4 sm:p-5 border-t flex justify-end items-center sticky bottom-0 bg-gray-50 z-10 rounded-b-lg">
          {currentStep < 3 ? (
            <button
              onClick={handleNextStep}
              className="px-6 py-2 text-sm font-semibold text-white bg-black rounded-md hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center"
              disabled={
                (currentStep === 1 && !isStepComplete(odValues)) ||
                (currentStep === 2 && !isStepComplete(osValues))
              }
            >
              {currentStep === 0 ? "Continue" : "Next"}{" "}
              <ArrowRight size={16} className="ml-1.5" />
            </button>
          ) : (
            <button
              onClick={handleConfirmPrescription}
              disabled={
                isSubmitting ||
                isLoadingExistingRx ||
                (!selectedExistingRxId && !uploadedFile && !willProvideRxLater)
              }
              className="px-6 py-2 text-sm font-semibold text-white bg-green-600 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              {isSubmitting ? (
                <Loader2 size={16} className="animate-spin mr-1.5" />
              ) : (
                <CheckCircle size={16} className="mr-1.5" />
              )}
              Confirm Prescription
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactLensPrescriptionModal;
