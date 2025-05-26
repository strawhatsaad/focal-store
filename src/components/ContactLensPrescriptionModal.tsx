// src/components/ContactLensPrescriptionModal.tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  X,
  ArrowRight,
  ArrowLeft,
  UploadCloud,
  CheckCircle,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { useSession } from "next-auth/react";

export interface ContactLensPrescriptionData {
  odValues: PrescriptionValues;
  osValues: PrescriptionValues;
  prescriptionReferenceType: "existing" | "new" | "none";
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
}

interface ContactLensPrescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: any;
  selectedVariant: any;
  onComplete: (data: ContactLensPrescriptionData) => void;
}

const generateSphOptions = (isAstigmatismProduct: boolean): string[] => {
  const options: string[] = [];
  const negativeLimit = isAstigmatismProduct ? -9.0 : -12.0;
  const positiveLimit = 8.0;
  const step = 0.25;
  options.push("0.00");
  for (let i = -step; i >= negativeLimit; i -= step) {
    options.unshift(i.toFixed(2));
  }
  for (let i = step; i <= positiveLimit; i += step) {
    options.push(`+${i.toFixed(2)}`);
  }
  return options.sort((a, b) => parseFloat(a) - parseFloat(b));
};

const generateCylOptions = (): string[] => {
  const options: string[] = [];
  for (let i = -0.75; i >= -2.25; i -= 0.5) {
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
  // Remove surrounding quotes
  if (
    (cleaned.startsWith('"') && cleaned.endsWith('"')) ||
    (cleaned.startsWith("'") && cleaned.endsWith("'"))
  ) {
    cleaned = cleaned.substring(1, cleaned.length - 1);
  }
  // Remove surrounding square brackets (though less likely for individual items after split/parse)
  if (cleaned.startsWith("[") && cleaned.endsWith("]")) {
    cleaned = cleaned.substring(1, cleaned.length - 1);
  }
  return cleaned.trim(); // Trim again after potential modifications
};

const parseMetafieldOptions = (metafieldValue?: string): string[] => {
  if (!metafieldValue || metafieldValue.trim() === "") return [];

  const trimmedValue = metafieldValue.trim();

  // Attempt to parse as JSON array first
  if (trimmedValue.startsWith("[") && trimmedValue.endsWith("]")) {
    try {
      const parsedArray = JSON.parse(trimmedValue);
      if (Array.isArray(parsedArray)) {
        return parsedArray
          .map((item) => cleanOptionString(String(item)))
          .filter((s) => s.length > 0);
      }
    } catch (e) {
      // Not a valid JSON array string, proceed to comma splitting
      console.warn(
        `Metafield value looked like JSON array but failed to parse: "${trimmedValue}". Falling back to comma split. Error: ${e}`
      );
    }
  }

  // Fallback to comma splitting for non-JSON strings or if JSON parsing failed
  return trimmedValue
    .split(",")
    .map((s) => cleanOptionString(s))
    .filter((s) => s.length > 0);
};

const ContactLensPrescriptionModal: React.FC<
  ContactLensPrescriptionModalProps
> = ({ isOpen, onClose, product, selectedVariant, onComplete }) => {
  const { data: session } = useSession();
  const [currentModalStep, setCurrentModalStep] = useState<
    "OD" | "OS" | "VERIFY"
  >("OD");
  const [odValues, setOdValues] = useState<PrescriptionValues>({});
  const [osValues, setOsValues] = useState<PrescriptionValues>({});

  const [existingPrescriptions, setExistingPrescriptions] = useState<
    PrescriptionEntry[]
  >([]);
  const [selectedExistingRxId, setSelectedExistingRxId] = useState<string>("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadLabel, setUploadLabel] = useState("");

  const [isLoadingExistingRx, setIsLoadingExistingRx] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && product) {
      // console.log("[Modal Opened] Product received:", product.name);
      // console.log("[Modal Opened] Product Metafields (raw from props):", JSON.stringify(product.metafields, null, 2));
    }
  }, [isOpen, product]);

  const isAstigmatismProduct = useMemo(() => {
    const axisMetafield = product.metafields?.find(
      (mf: any) => mf && mf.key === "axis"
    );
    const cylMetafield = product.metafields?.find(
      (mf: any) => mf && mf.key === "cylinder_cyl"
    );
    const isAxisTrue =
      axisMetafield?.value?.toString().toLowerCase() === "true";
    const isCylTrue = cylMetafield?.value?.toString().toLowerCase() === "true";
    return isAxisTrue || isCylTrue;
  }, [product.metafields]);

  const isMultifocalProduct = useMemo(() => {
    const addMetafield = product.metafields?.find(
      (mf: any) => mf && mf.key === "add"
    );
    const result = !!addMetafield?.value && addMetafield.value.trim() !== "";
    return result;
  }, [product.metafields]);

  const sphOptions = useMemo(
    () => generateSphOptions(isAstigmatismProduct),
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
    if (isOpen && session) {
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
          console.error(e);
        } finally {
          setIsLoadingExistingRx(false);
        }
      };
      fetchExistingPrescriptions();

      setCurrentModalStep("OD");
      setOdValues({});
      setOsValues({});
      setSelectedExistingRxId("");
      setUploadedFile(null);
      setUploadLabel(
        session.user?.name
          ? `${session.user.name} - Contact Lens Rx`
          : "Contact Lens Rx"
      );
      setError(null);
      setIsSubmitting(false);
    }
  }, [isOpen, session]);

  const handleValueChange = (
    eye: "OD" | "OS",
    field: keyof PrescriptionValues,
    value: string
  ) => {
    const setter = eye === "OD" ? setOdValues : setOsValues;
    setter((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

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
    if (currentModalStep === "OD") {
      if (!isStepComplete(odValues)) {
        setError("Please select all required values for the Right Eye (OD).");
        return;
      }
      setCurrentModalStep("OS");
    } else if (currentModalStep === "OS") {
      if (!isStepComplete(osValues)) {
        setError("Please select all required values for the Left Eye (OS).");
        return;
      }
      setCurrentModalStep("VERIFY");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
      setSelectedExistingRxId("");
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
    setUploadLabel(
      session?.user?.name
        ? `${session.user.name} - Contact Lens Rx`
        : "Contact Lens Rx"
    );
    setError(null);
  };

  const handleConfirmPrescription = () => {
    setError(null);
    if (!selectedExistingRxId && !uploadedFile) {
      setError("Please select an existing prescription or upload a new one.");
      return;
    }

    let refValue = "";
    let refType: "existing" | "new" | "none" = "none";

    if (selectedExistingRxId) {
      const selectedRx = existingPrescriptions.find(
        (rx) => rx.id === selectedExistingRxId
      );
      refValue =
        selectedRx?.label || selectedRx?.fileName || selectedExistingRxId;
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
      uploadedFile: uploadedFile,
    };
    onComplete(prescriptionData);
  };

  const renderSelect = (
    label: string,
    value: string | undefined,
    onChange: (val: string) => void,
    options: string[],
    isRequired: boolean = true,
    disabled: boolean = false
  ) => (
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
      {isRequired &&
        options.length > 0 &&
        (!value || value === "") &&
        currentModalStep !== "VERIFY" && (
          <p className="text-xs text-red-500 mt-1">This field is required.</p>
        )}
    </div>
  );

  const renderEyeForm = (eye: "OD" | "OS", values: PrescriptionValues) => (
    <div className="space-y-3">
      <h3 className="text-xl font-semibold mb-4 text-gray-900 border-b pb-2">
        {eye === "OD" ? "Right Eye (OD)" : "Left Eye (OS)"} Prescription
      </h3>
      {renderSelect(
        "Sphere (SPH/PWR)",
        values.sph,
        (val) => handleValueChange(eye, "sph", val),
        sphOptions,
        true
      )}
      {isAstigmatismProduct &&
        renderSelect(
          "Cylinder (CYL)",
          values.cyl,
          (val) => handleValueChange(eye, "cyl", val),
          cylOptions,
          isAstigmatismProduct
        )}
      {isAstigmatismProduct &&
        renderSelect(
          "Axis",
          values.axis,
          (val) => handleValueChange(eye, "axis", val),
          axisOptions,
          isAstigmatismProduct
        )}
      {isMultifocalProduct &&
        renderSelect(
          "ADD Power",
          values.add,
          (val) => handleValueChange(eye, "add", val),
          addPowerOptions,
          isMultifocalProduct && addPowerOptions.length > 0
        )}
      {renderSelect(
        "Base Curve (BC)",
        values.bc,
        (val) => handleValueChange(eye, "bc", val),
        bcOptions,
        bcOptions.length > 0
      )}
      {renderSelect(
        "Diameter (DIA)",
        values.dia,
        (val) => handleValueChange(eye, "dia", val),
        diaOptions,
        diaOptions.length > 0
      )}
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-75 p-4 transition-opacity duration-300 ease-in-out">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md sm:max-w-lg max-h-[90vh] flex flex-col transform transition-all duration-300 ease-in-out scale-100">
        <div className="flex items-center justify-between p-4 sm:p-5 border-b sticky top-0 bg-white z-10">
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
            <div className="p-3 text-sm bg-red-50 text-red-700 rounded-md border border-red-200 flex items-center gap-2">
              {" "}
              <AlertTriangle size={18} className="flex-shrink-0" />{" "}
              <span className="break-words">{error}</span>{" "}
            </div>
          )}

          {currentModalStep === "OD" && renderEyeForm("OD", odValues)}
          {currentModalStep === "OS" && renderEyeForm("OS", osValues)}

          {currentModalStep === "VERIFY" && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-900 border-b pb-2">
                Prescription Verification
              </h3>
              <p className="text-sm text-gray-600">
                Please ensure you are uploading a valid{" "}
                <strong className="font-medium">
                  Contact Lens Prescription
                </strong>
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
                    isLoadingExistingRx || existingPrescriptions.length === 0
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
                  disabled={isSubmitting || isLoadingExistingRx}
                />
                <input
                  type="file"
                  id="prescriptionFileModal"
                  onChange={handleFileChange}
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="block w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100 disabled:opacity-50"
                  disabled={isSubmitting || isLoadingExistingRx}
                />
                {uploadedFile && (
                  <p className="text-xs text-gray-500 mt-1">
                    Selected: {uploadedFile.name}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="p-4 sm:p-5 border-t flex justify-between items-center sticky bottom-0 bg-gray-50 z-10 rounded-b-lg">
          {(currentModalStep === "OS" || currentModalStep === "VERIFY") && (
            <button
              onClick={() =>
                setCurrentModalStep(currentModalStep === "OS" ? "OD" : "OS")
              }
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors flex items-center disabled:opacity-70"
              disabled={isSubmitting || isLoadingExistingRx}
            >
              <ArrowLeft size={16} className="mr-1.5" /> Previous
            </button>
          )}
          <div className="flex-grow"></div>

          {currentModalStep !== "VERIFY" ? (
            <button
              onClick={handleNextStep}
              disabled={
                isLoadingExistingRx ||
                (currentModalStep === "OD" && !isStepComplete(odValues)) ||
                (currentModalStep === "OS" && !isStepComplete(osValues))
              }
              className="px-6 py-2 text-sm font-semibold text-white bg-black rounded-md hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              Continue <ArrowRight size={16} className="ml-1.5" />
            </button>
          ) : (
            <button
              onClick={handleConfirmPrescription}
              disabled={
                isSubmitting ||
                isLoadingExistingRx ||
                (!selectedExistingRxId && !uploadedFile)
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
