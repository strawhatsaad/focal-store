// File: src/app/api/account/prescriptions/route.ts
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions"; // Adjust path
import {
    setShopifyMetafields,
    getShopifyCustomerMetafield,
    createStagedUploads,
    createShopifyFiles,
    deleteShopifyFile
} from "../../../../../utils"; // Adjust path
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

const PRESCRIPTION_METAFIELD_NAMESPACE = "focal_rx";
const PRESCRIPTION_METAFIELD_KEY = "uploaded_prescriptions";

interface PrescriptionEntry {
    id: string; // UUID for the metafield entry
    fileName: string; // User-facing filename (original or generated)
    fileType: string;
    uploadedAt: string;
    storageUrlOrId: string; // Should be direct CDN URL if available, otherwise GID as fallback
    label?: string;
    fileSize?: number;
    shopifyFileId?: string; // Explicitly store the Shopify File GID
}

const parsePrescriptionsMetafield = (metafieldValue: string | null | undefined): PrescriptionEntry[] => {
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
        return NextResponse.json({ message: "Not authenticated." }, { status: 401 });
    }
    try {
        const customerId = session.user.shopifyCustomerId;
        const response = await getShopifyCustomerMetafield(customerId, PRESCRIPTION_METAFIELD_NAMESPACE, PRESCRIPTION_METAFIELD_KEY);
        if (response.data?.customer?.metafield?.value) {
            const prescriptions = parsePrescriptionsMetafield(response.data.customer.metafield.value);
            return NextResponse.json({ prescriptions });
        } else {
            return NextResponse.json({ prescriptions: [] });
        }
    } catch (error: any) {
        console.error("[API GET Prescriptions] Error fetching prescriptions:", error);
        return NextResponse.json({ message: error.message || "Failed to fetch prescriptions." }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.shopifyCustomerId || !session?.user?.name || !session?.user?.email) {
        return NextResponse.json({ message: "User details not found in session. Cannot process prescription." }, { status: 401 });
    }

    try {
        const formData = await request.formData();
        const file = formData.get("prescriptionFile") as File | null;
        const userLabel = formData.get("label") as string | null;

        if (!file) {
            return NextResponse.json({ message: "No prescription file provided." }, { status: 400 });
        }
        if (file.size > 20 * 1024 * 1024) { // Limit to 20MB
            return NextResponse.json({ message: "File size exceeds 20MB limit." }, { status: 400 });
        }

        const customerId = session.user.shopifyCustomerId;
        const customerName = session.user.name;
        const customerEmail = session.user.email;

        const originalExtension = path.extname(file.name);
        const safeCustomerName = customerName.replace(/[^a-zA-Z0-9\s-]/g, "").replace(/\s+/g, "_");
        const newFileName = `${safeCustomerName}_Prescription_${Date.now()}${originalExtension}`;
        const altText = `${customerName} - ${customerEmail} - Prescription`;

        const stagedUploadInput = [{
            filename: newFileName,
            mimeType: file.type,
            resource: "FILE",
            httpMethod: "POST",
        }];
        const stagedUploadsResponse = await createStagedUploads(stagedUploadInput);

        if (stagedUploadsResponse.data?.stagedUploadsCreate?.userErrors?.length > 0) {
            const errorMsg = stagedUploadsResponse.data.stagedUploadsCreate.userErrors.map((e: any) => e.message).join(", ");
            throw new Error(`Failed to prepare file upload target on Shopify: ${errorMsg}`);
        }
        if (!stagedUploadsResponse.data?.stagedUploadsCreate?.stagedTargets?.[0]) {
            throw new Error("Failed to prepare file upload target on Shopify (no target returned).");
        }

        const target = stagedUploadsResponse.data.stagedUploadsCreate.stagedTargets[0];
        const { url: uploadUrl, resourceUrl, parameters } = target;

        const fileBuffer = await file.arrayBuffer();
        const uploadFormData = new FormData();
        parameters.forEach(({ name, value }: { name: string; value: string }) => {
            uploadFormData.append(name, value);
        });
        uploadFormData.append("file", new Blob([fileBuffer]), newFileName);

        const uploadResponse = await fetch(uploadUrl, { method: "POST", body: uploadFormData });
        if (!uploadResponse.ok) {
            const errorText = await uploadResponse.text();
            throw new Error(`Failed to upload file to Shopify's storage. Server responded with ${uploadResponse.status}. Details: ${errorText}`);
        }

        const fileCreateInput = [{ originalSource: resourceUrl, contentType: "FILE", alt: altText }];
        const fileCreateResponse = await createShopifyFiles(fileCreateInput);

        if (fileCreateResponse.data?.fileCreate?.userErrors?.length > 0) {
            const errorMsg = fileCreateResponse.data.fileCreate.userErrors.map((e: any) => e.message).join(", ");
            throw new Error(`Failed to finalize file on Shopify: ${errorMsg}`);
        }
        if (!fileCreateResponse.data?.fileCreate?.files?.[0]?.id) {
            throw new Error("Failed to finalize file on Shopify (no file ID returned).");
        }

        const createdShopifyFile = fileCreateResponse.data.fileCreate.files[0];
        const shopifyFileId = createdShopifyFile.id; // This is the GID

        let directCdnUrl: string | null = null;
        if (createdShopifyFile.__typename === "GenericFile" && createdShopifyFile.url) {
            directCdnUrl = createdShopifyFile.url;
        } else if (createdShopifyFile.__typename === "MediaImage" && createdShopifyFile.image?.originalSrc) {
            directCdnUrl = createdShopifyFile.image.originalSrc;
        } // Add other types like Video if needed: else if (createdShopifyFile.__typename === "Video" && createdShopifyFile.originalSource?.url) { directCdnUrl = createdShopifyFile.originalSource.url; }

        const finalStorageUrlOrId = directCdnUrl || shopifyFileId; // Prioritize direct URL, fallback to GID

        console.log(`[API POST Prescription] Shopify file created. ID: ${shopifyFileId}, TypeName: ${createdShopifyFile.__typename}, Stored URL/Ref: ${finalStorageUrlOrId}, Direct CDN URL: ${directCdnUrl}`);

        let existingPrescriptions: PrescriptionEntry[] = [];
        const existingMetafieldResponse = await getShopifyCustomerMetafield(customerId, PRESCRIPTION_METAFIELD_NAMESPACE, PRESCRIPTION_METAFIELD_KEY);
        if (existingMetafieldResponse.data?.customer?.metafield?.value) {
            existingPrescriptions = parsePrescriptionsMetafield(existingMetafieldResponse.data.customer.metafield.value);
        }

        const newPrescription: PrescriptionEntry = {
            id: uuidv4(),
            fileName: newFileName,
            fileType: file.type,
            fileSize: file.size,
            uploadedAt: new Date().toISOString(),
            storageUrlOrId: finalStorageUrlOrId,
            label: userLabel || customerName,
            shopifyFileId: shopifyFileId, // Always store the GID
        };

        const updatedPrescriptions = [...existingPrescriptions, newPrescription];
        const metafieldsInput = [{
            ownerId: customerId,
            namespace: PRESCRIPTION_METAFIELD_NAMESPACE,
            key: PRESCRIPTION_METAFIELD_KEY,
            type: "json_string",
            value: JSON.stringify(updatedPrescriptions),
        }];

        const metafieldResponse = await setShopifyMetafields(metafieldsInput);

        if (metafieldResponse.data?.metafieldsSet?.metafields || metafieldResponse.data?.metafieldsSet?.userErrors?.length === 0) {
            return NextResponse.json({
                success: true,
                prescription: newPrescription,
                allPrescriptions: updatedPrescriptions
            });
        } else {
            const userErrors = metafieldResponse.data?.metafieldsSet?.userErrors;
            throw new Error(userErrors?.map((e: any) => e.message).join(", ") || "Failed to save prescription metadata.");
        }

    } catch (error: any) {
        console.error("[API POST Prescription] Error uploading prescription (outer catch):", error.message, error.stack);
        return NextResponse.json({ message: error.message || "Failed to upload prescription." }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.shopifyCustomerId) {
        return NextResponse.json({ message: "Not authenticated." }, { status: 401 });
    }

    try {
        const { prescriptionId } = await request.json();
        if (!prescriptionId) {
            return NextResponse.json({ message: "Prescription ID (for metafield entry) is required." }, { status: 400 });
        }

        const customerId = session.user.shopifyCustomerId;

        const existingMetafieldResponse = await getShopifyCustomerMetafield(customerId, PRESCRIPTION_METAFIELD_NAMESPACE, PRESCRIPTION_METAFIELD_KEY);
        let existingPrescriptions: PrescriptionEntry[] = [];
        if (existingMetafieldResponse.data?.customer?.metafield?.value) {
            existingPrescriptions = parsePrescriptionsMetafield(existingMetafieldResponse.data.customer.metafield.value);
        }

        const prescriptionToDelete = existingPrescriptions.find(p => p.id === prescriptionId);

        if (!prescriptionToDelete) {
            return NextResponse.json({ message: "Prescription entry not found in metafield." }, { status: 404 });
        }

        let shopifyFileToDeleteGid = prescriptionToDelete.shopifyFileId; // Prioritize explicitly stored GID

        if (!shopifyFileToDeleteGid && prescriptionToDelete.storageUrlOrId.startsWith("gid://shopify/File/")) {
            // Fallback for older entries that might only have GID in storageUrlOrId
            shopifyFileToDeleteGid = prescriptionToDelete.storageUrlOrId;
        }

        if (shopifyFileToDeleteGid) {
            try {
                console.log(`[API DELETE Prescription] Attempting to delete Shopify file with GID: ${shopifyFileToDeleteGid}`);
                const deleteFileResponse = await deleteShopifyFile([shopifyFileToDeleteGid]);

                if (deleteFileResponse.data?.fileDelete?.userErrors?.length > 0) {
                    const errorMessages = deleteFileResponse.data.fileDelete.userErrors.map((e: any) => e.message).join(", ");
                    console.warn(`[API DELETE Prescription] User errors while deleting Shopify file ${shopifyFileToDeleteGid}: ${errorMessages}`);
                    // If deletion fails, we might still want to remove from metafield, or handle error differently
                    // For now, we log and proceed. If Shopify deletion is critical, throw new Error(errorMessages);
                } else if (deleteFileResponse.data?.fileDelete?.deletedFileIds?.includes(shopifyFileToDeleteGid)) {
                    console.log(`[API DELETE Prescription] Shopify file ${shopifyFileToDeleteGid} successfully marked for deletion.`);
                } else {
                    console.warn(`[API DELETE Prescription] Shopify file ${shopifyFileToDeleteGid} was not in deletedFileIds. Response:`, deleteFileResponse);
                }
            } catch (fileDeleteError: any) {
                console.error(`[API DELETE Prescription] Error calling deleteShopifyFile for ${shopifyFileToDeleteGid}:`, fileDeleteError.message, fileDeleteError.stack);
            }
        } else {
            console.warn(`[API DELETE Prescription] No Shopify File GID found for prescription entry ID ${prescriptionId} (UUID: ${prescriptionToDelete.id}). Cannot delete from Shopify storage.`);
        }

        const updatedPrescriptions = existingPrescriptions.filter(p => p.id !== prescriptionId);

        const metafieldsInput = [{
            ownerId: customerId,
            namespace: PRESCRIPTION_METAFIELD_NAMESPACE,
            key: PRESCRIPTION_METAFIELD_KEY,
            type: "json_string",
            value: JSON.stringify(updatedPrescriptions),
        }];

        const metafieldResponse = await setShopifyMetafields(metafieldsInput);

        if (metafieldResponse.data?.metafieldsSet?.metafields || (metafieldResponse.data?.metafieldsSet?.userErrors && metafieldResponse.data.metafieldsSet.userErrors.length === 0)) {
            return NextResponse.json({ success: true, message: "Prescription deleted successfully.", remainingPrescriptions: updatedPrescriptions });
        } else {
            const userErrors = metafieldResponse.data?.metafieldsSet?.userErrors;
            const errorMessage = userErrors?.map((e: any) => e.message).join(", ") || "Failed to update prescription metadata after deletion.";
            throw new Error(errorMessage);
        }

    } catch (error: any) {
        console.error("[API DELETE Prescription] Error deleting prescription (outer catch):", error.message, error.stack);
        return NextResponse.json({ message: error.message || "Failed to delete prescription." }, { status: 500 });
    }
}
