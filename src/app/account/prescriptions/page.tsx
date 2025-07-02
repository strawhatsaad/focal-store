// File: src/app/account/prescriptions/page.tsx
"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState, ChangeEvent, FormEvent } from "react";
import {
  Loader2,
  UploadCloud,
  FileText,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  Trash2,
  ExternalLink,
} from "lucide-react";
import { del } from "@vercel/blob";

type PrescriptionCategory = "ContactLenses" | "Eyeglasses";

interface PrescriptionEntry {
  id: string;
  fileName: string;
  fileType: string;
  uploadedAt: string;
  storageUrlOrId: string;
  label?: string;
  fileSize?: number;
  shopifyFileId?: string | null;
  category?: PrescriptionCategory;
  googleDriveFileId?: string | null;
}

const ManagePrescriptionsPage = () => {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();

  const [prescriptions, setPrescriptions] = useState<PrescriptionEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileLabel, setFileLabel] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState<PrescriptionCategory>("Eyeglasses");
  const [isUploading, setIsUploading] = useState(false);

  const fetchPrescriptions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/account/prescriptions");
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch prescriptions.");
      }
      const data = await response.json();
      setPrescriptions(data.prescriptions || []);
    } catch (err: any) {
      setError(err.message);
      setPrescriptions([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (sessionStatus === "loading") return;
    if (!session) {
      router.push("/api/auth/signin?callbackUrl=/account/prescriptions");
      return;
    }
    if (session?.user?.name && !fileLabel && !selectedFile) {
      setFileLabel(session.user.name);
    }
    fetchPrescriptions();
  }, [session, sessionStatus, router]);

  useEffect(() => {
    if (session?.user?.name && !fileLabel && !selectedFile) {
      setFileLabel(session.user.name);
    }
  }, [session, fileLabel, selectedFile]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const currentFile = e.target.files[0];
      setSelectedFile(currentFile);
      const currentFileNameWithoutExtension = currentFile.name.replace(
        /\.[^/.]+$/,
        ""
      );
      if (!fileLabel || fileLabel === session?.user?.name) {
        setFileLabel(currentFileNameWithoutExtension);
      }
    } else {
      setSelectedFile(null);
      if (fileLabel !== session?.user?.name) {
        setFileLabel(session?.user?.name || "");
      }
    }
  };

  const handleUploadSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setError("Please select a file to upload.");
      return;
    }
    if (!selectedCategory) {
      setError("Please select a prescription category.");
      return;
    }
    setIsUploading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Step 1: Upload the file to Vercel Blob via our new API route
      const uploadResponse = await fetch(
        `/api/upload?filename=${selectedFile.name}`,
        {
          method: "POST",
          body: selectedFile,
        }
      );

      if (!uploadResponse.ok) {
        const errorResult = await uploadResponse.json();
        throw new Error(errorResult.message || "File upload failed.");
      }

      const blob = await uploadResponse.json();

      // Step 2: Send the blob URL and metadata to the prescriptions API
      const metadataResponse = await fetch("/api/account/prescriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          blobUrl: blob.url,
          fileName: selectedFile.name,
          fileType: selectedFile.type,
          fileSize: selectedFile.size,
          label: fileLabel || selectedFile.name.replace(/\.[^/.]+$/, ""),
          category: selectedCategory,
        }),
      });

      if (!metadataResponse.ok) {
        const errorResult = await metadataResponse.json();
        // If metadata fails, try to delete the orphaned blob
        await del(blob.url);
        throw new Error(
          errorResult.message || "Failed to save prescription metadata."
        );
      }

      setSuccessMessage("Prescription uploaded successfully!");
      fetchPrescriptions(); // Refresh the list

      // Reset form
      setSelectedFile(null);
      setFileLabel(session?.user?.name || "");
      setSelectedCategory("Eyeglasses");
      const fileInput = document.getElementById(
        "prescriptionFile"
      ) as HTMLInputElement | null;
      if (fileInput) fileInput.value = "";
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeletePrescription = async (prescriptionId: string) => {
    if (!session?.user?.shopifyCustomerId) {
      setError("Authentication error. Please sign in again.");
      return;
    }
    if (
      !window.confirm(
        "Are you sure you want to delete this prescription? This action cannot be undone."
      )
    ) {
      return;
    }
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const response = await fetch(`/api/account/prescriptions`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prescriptionId: prescriptionId }),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.message || "Failed to delete prescription.");
      setSuccessMessage("Prescription deleted successfully!");
      setPrescriptions((prev) => prev.filter((p) => p.id !== prescriptionId));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getFileViewUrl = (storageUrlOrId: string): string | null => {
    if (
      storageUrlOrId &&
      (storageUrlOrId.startsWith("http://") ||
        storageUrlOrId.startsWith("https://"))
    ) {
      return storageUrlOrId;
    }
    return null;
  };

  if (
    sessionStatus === "loading" ||
    (isLoading && prescriptions.length === 0 && !error)
  ) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50 p-4">
        <Loader2 className="h-12 w-12 animate-spin text-black" />
        <p className="mt-4 text-lg font-medium text-gray-700">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 py-8 md:py-12 px-4">
      <div className="container mx-auto max-w-3xl">
        <header className="mb-8 md:mb-10">
          <Link
            href="/account"
            className="flex items-center text-sm text-gray-600 hover:text-black mb-4 group"
          >
            <ArrowLeft
              size={18}
              className="mr-2 group-hover:-translate-x-1 transition-transform duration-200"
            />
            Back to My Account
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-800">
            Manage Prescriptions
          </h1>
        </header>

        {error && (
          <div
            className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md shadow-sm mb-6"
            role="alert"
          >
            <div className="flex items-center">
              {" "}
              <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />{" "}
              <p>{error}</p>{" "}
            </div>
          </div>
        )}
        {successMessage && (
          <div
            className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-md shadow-sm mb-6"
            role="alert"
          >
            <div className="flex items-center">
              {" "}
              <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />{" "}
              <p>{successMessage}</p>{" "}
            </div>
          </div>
        )}

        <form
          onSubmit={handleUploadSubmit}
          className="bg-white p-6 rounded-lg shadow-md space-y-6 mb-8"
        >
          <h3 className="text-xl font-semibold text-gray-700 mb-1">
            {" "}
            Upload New Prescription{" "}
          </h3>

          <div>
            <label
              htmlFor="prescriptionCategory"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Prescription Category <span className="text-red-500">*</span>
            </label>
            <select
              id="prescriptionCategory"
              value={selectedCategory}
              onChange={(e) =>
                setSelectedCategory(e.target.value as PrescriptionCategory)
              }
              required
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-black focus:border-black sm:text-sm rounded-md"
            >
              <option value="Eyeglasses">Eyeglasses</option>
              <option value="ContactLenses">Contact Lenses</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="fileLabel"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Prescription Label{" "}
              <span className="text-xs text-gray-500">
                (Optional, defaults to filename)
              </span>
            </label>
            <input
              type="text"
              id="fileLabel"
              value={fileLabel}
              onChange={(e) => setFileLabel(e.target.value)}
              placeholder={
                selectedFile
                  ? selectedFile.name.replace(/\.[^/.]+$/, "")
                  : session?.user?.name
                  ? `${session.user.name} - Rx`
                  : "e.g., Dr. Smith - Jan 2024"
              }
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black sm:text-sm"
            />
          </div>
          <div>
            <label
              htmlFor="prescriptionFile"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Choose File{" "}
              <span className="text-xs text-gray-500">
                {" "}
                (PDF, JPG, PNG) Max 20MB{" "}
              </span>
            </label>
            <input
              type="file"
              id="prescriptionFile"
              onChange={handleFileChange}
              accept=".pdf,.jpg,.jpeg,.png,image/jpeg,image/png,application/pdf"
              required
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-black file:text-white hover:file:bg-gray-700 disabled:opacity-50"
              disabled={isUploading}
            />
            {selectedFile && (
              <p className="text-xs text-gray-500 mt-1">
                {" "}
                Selected: {selectedFile.name} (
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB){" "}
              </p>
            )}
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isUploading || !selectedFile}
              className="flex items-center justify-center gap-2 px-6 py-2.5 bg-black text-white font-semibold rounded-lg shadow-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 transition-colors duration-150 ease-in-out disabled:opacity-50"
            >
              {isUploading ? (
                <Loader2 className="animate-spin h-5 w-5" />
              ) : (
                <UploadCloud size={20} />
              )}
              {isUploading ? "Uploading..." : "Upload Prescription"}
            </button>
          </div>
        </form>

        <div>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4 mt-10">
            {" "}
            Your Uploaded Prescriptions{" "}
          </h2>
          {isLoading && prescriptions.length === 0 && !error ? (
            <div className="text-center py-10">
              {" "}
              <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto" />{" "}
            </div>
          ) : !isLoading && prescriptions.length === 0 && !error ? (
            <div className="text-center py-10 bg-white rounded-lg shadow-sm">
              {" "}
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />{" "}
              <p className="text-gray-600">
                {" "}
                You haven&apos;t uploaded any prescriptions yet.{" "}
              </p>{" "}
            </div>
          ) : prescriptions.length > 0 ? (
            <ul className="space-y-4">
              {prescriptions.map((rx) => {
                const viewUrl = getFileViewUrl(rx.storageUrlOrId);
                return (
                  <li
                    key={rx.id}
                    className="bg-white p-4 rounded-lg shadow flex items-center justify-between hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center overflow-hidden">
                      <FileText className="h-8 w-8 text-black mr-3 flex-shrink-0" />
                      <div className="overflow-hidden">
                        <p
                          className="font-medium text-gray-800 truncate"
                          title={rx.label || rx.fileName}
                        >
                          {" "}
                          {rx.label || rx.fileName}{" "}
                        </p>
                        <p className="text-xs text-gray-500">
                          Uploaded:{" "}
                          {new Date(rx.uploadedAt).toLocaleDateString()}
                          {rx.category && (
                            <span className="italic">
                              {" "}
                              (
                              {rx.category === "ContactLenses"
                                ? "Contacts"
                                : "Eyeglasses"}
                              )
                            </span>
                          )}
                          {rx.fileSize
                            ? ` | Size: ${(rx.fileSize / 1024 / 1024).toFixed(
                                2
                              )} MB`
                            : ""}
                        </p>
                        {/* Display the Vercel Blob link */}
                        {viewUrl ? (
                          <a
                            href={viewUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline truncate block"
                            title={rx.storageUrlOrId}
                          >
                            View/Download Prescription
                          </a>
                        ) : (
                          <p
                            className="text-xs text-gray-400 truncate max-w-xs sm:max-w-sm md:max-w-md"
                            title={rx.storageUrlOrId}
                          >
                            Ref: {rx.storageUrlOrId}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
                      <button
                        onClick={() => handleDeletePrescription(rx.id)}
                        title="Delete Prescription"
                        disabled={isLoading}
                        className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full disabled:opacity-50"
                      >
                        {" "}
                        <Trash2 size={18} />{" "}
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default ManagePrescriptionsPage;
