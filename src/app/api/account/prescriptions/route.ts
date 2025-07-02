// src/app/api/account/prescriptions/route.ts
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import {
  setShopifyMetafields,
  getShopifyCustomerMetafield,
} from "../../../../../utils";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { del } from "@vercel/blob";

const PRESCRIPTION_METAFIELD_NAMESPACE = "focal_rx";
const PRESCRIPTION_METAFIELD_KEY = "uploaded_prescriptions";

type PrescriptionCategory = "ContactLenses" | "Eyeglasses";

interface PrescriptionEntry {
  id: string;
  fileName: string;
  fileType: string;
  uploadedAt: string;
  storageUrlOrId: string; // This will now store the Vercel Blob URL
  label?: string;
  fileSize?: number;
  category?: PrescriptionCategory;
}

const parsePrescriptionsMetafield = (
  metafieldValue: string | null | undefined
): PrescriptionEntry[] => {
  if (!metafieldValue) return [];
  try {
    const parsed = JSON.parse(metafieldValue);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Error parsing prescriptions metafield JSON:", error);
    return [];
  }
};

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.shopifyCustomerId) {
    return NextResponse.json(
      { message: "Not authenticated or Shopify Customer ID missing." },
      { status: 401 }
    );
  }
  const { searchParams } = new URL(request.url);
  const categoryFilter = searchParams.get(
    "category"
  ) as PrescriptionCategory | null;
  try {
    const ownerShopifyId = session.user.shopifyCustomerId;
    const response = await getShopifyCustomerMetafield(
      ownerShopifyId,
      PRESCRIPTION_METAFIELD_NAMESPACE,
      PRESCRIPTION_METAFIELD_KEY
    );
    let prescriptions: PrescriptionEntry[] = [];
    if (response.data?.customer?.metafield?.value) {
      prescriptions = parsePrescriptionsMetafield(
        response.data.customer.metafield.value
      );
    }
    if (categoryFilter) {
      prescriptions = prescriptions.filter(
        (p) => p.category === categoryFilter
      );
    }
    return NextResponse.json({ prescriptions });
  } catch (error: any) {
    console.error(
      "[API GET Prescriptions] Error fetching prescriptions:",
      error
    );
    return NextResponse.json(
      { message: error.message || "Failed to fetch prescriptions." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.shopifyCustomerId) {
    return NextResponse.json(
      { message: "User not authenticated." },
      { status: 401 }
    );
  }

  try {
    // This route now expects a JSON body with the blob URL from the client
    const { blobUrl, fileName, fileType, fileSize, label, category } =
      await request.json();

    if (!blobUrl || !fileName || !fileType || !fileSize || !category) {
      return NextResponse.json(
        { message: "Missing required prescription data in request." },
        { status: 400 }
      );
    }

    const ownerShopifyId = session.user.shopifyCustomerId;

    let existingPrescriptions: PrescriptionEntry[] = [];
    const existingMetafieldResponse = await getShopifyCustomerMetafield(
      ownerShopifyId,
      PRESCRIPTION_METAFIELD_NAMESPACE,
      PRESCRIPTION_METAFIELD_KEY
    );
    if (existingMetafieldResponse.data?.customer?.metafield?.value) {
      existingPrescriptions = parsePrescriptionsMetafield(
        existingMetafieldResponse.data.customer.metafield.value
      );
    }

    const newPrescription: PrescriptionEntry = {
      id: uuidv4(),
      fileName: fileName,
      fileType: fileType,
      fileSize: fileSize,
      uploadedAt: new Date().toISOString(),
      storageUrlOrId: blobUrl, // Use the URL from Vercel Blob
      label: label || fileName.replace(/\.[^/.]+$/, ""),
      category: category,
    };

    const updatedPrescriptions = [...existingPrescriptions, newPrescription];
    const metafieldsInput = [
      {
        ownerId: ownerShopifyId,
        namespace: PRESCRIPTION_METAFIELD_NAMESPACE,
        key: PRESCRIPTION_METAFIELD_KEY,
        type: "json_string",
        value: JSON.stringify(updatedPrescriptions),
      },
    ];

    const metafieldResponse = await setShopifyMetafields(metafieldsInput);

    if (metafieldResponse.data?.metafieldsSet?.userErrors?.length > 0) {
      // If saving metafield fails, try to delete the uploaded blob to avoid orphaned files
      await del(blobUrl);
      const userErrors = metafieldResponse.data.metafieldsSet.userErrors;
      const errorMessage = userErrors
        .map((e: any) => `Field: ${e.field.join("/")}, Message: ${e.message}`)
        .join("; ");
      throw new Error(`Failed to save prescription metadata: ${errorMessage}`);
    }

    return NextResponse.json({
      success: true,
      prescription: newPrescription,
      allPrescriptions: updatedPrescriptions,
    });
  } catch (error: any) {
    console.error("[API POST Prescriptions] Error:", error.message);
    return NextResponse.json(
      { message: error.message || "Failed to save prescription metadata." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.shopifyCustomerId) {
    return NextResponse.json(
      { message: "Not authenticated." },
      { status: 401 }
    );
  }
  try {
    const { prescriptionId } = await request.json();
    if (!prescriptionId) {
      return NextResponse.json(
        { message: "Prescription ID is required." },
        { status: 400 }
      );
    }
    const ownerShopifyId = session.user.shopifyCustomerId;

    const existingMetafieldResponse = await getShopifyCustomerMetafield(
      ownerShopifyId,
      PRESCRIPTION_METAFIELD_NAMESPACE,
      PRESCRIPTION_METAFIELD_KEY
    );
    let existingPrescriptions: PrescriptionEntry[] = [];
    if (existingMetafieldResponse.data?.customer?.metafield?.value) {
      existingPrescriptions = parsePrescriptionsMetafield(
        existingMetafieldResponse.data.customer.metafield.value
      );
    }

    const prescriptionToDelete = existingPrescriptions.find(
      (p) => p.id === prescriptionId
    );
    if (!prescriptionToDelete) {
      return NextResponse.json(
        { message: "Prescription not found." },
        { status: 404 }
      );
    }

    // Delete the file from Vercel Blob storage
    if (prescriptionToDelete.storageUrlOrId) {
      try {
        await del(prescriptionToDelete.storageUrlOrId);
      } catch (blobDeleteError: any) {
        console.error(
          `[API DELETE Prescription] Error deleting Vercel Blob file ${prescriptionToDelete.storageUrlOrId}:`,
          blobDeleteError.message
        );
        // Decide if you want to stop the process if blob deletion fails.
        // For now, we'll proceed to remove the metafield entry regardless.
      }
    }

    const updatedPrescriptions = existingPrescriptions.filter(
      (p) => p.id !== prescriptionId
    );
    const metafieldsInput = [
      {
        ownerId: ownerShopifyId,
        namespace: PRESCRIPTION_METAFIELD_NAMESPACE,
        key: PRESCRIPTION_METAFIELD_KEY,
        type: "json_string",
        value: JSON.stringify(updatedPrescriptions),
      },
    ];

    await setShopifyMetafields(metafieldsInput);

    return NextResponse.json({
      success: true,
      message: "Prescription deleted successfully.",
    });
  } catch (error: any) {
    console.error("[API DELETE Prescription] Error:", error.message);
    return NextResponse.json(
      { message: error.message || "Failed to delete prescription." },
      { status: 500 }
    );
  }
}
