// File: src/app/api/account/prescriptions/route.ts
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions"; // Adjust path
import {
    setShopifyMetafields,
    getShopifyCustomerMetafield,
    createStagedUploads, // New import
    createShopifyFiles   // New import
} from "../../../../../utils"; // Adjust path
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from 'uuid';

const PRESCRIPTION_METAFIELD_NAMESPACE = "focal_rx";
const PRESCRIPTION_METAFIELD_KEY = "uploaded_prescriptions";

interface PrescriptionEntry {
    id: string;
    fileName: string;
    fileType: string;
    uploadedAt: string;
    storageUrlOrId: string; // Will now be Shopify File GID or its CDN URL
    label?: string;
    fileSize?: number; // Optional: store file size
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

    if (!session?.user?.shopifyCustomerId) {
        return NextResponse.json({ message: "Not authenticated." }, { status: 401 });
    }

    try {
        const formData = await request.formData();
        const file = formData.get("prescriptionFile") as File | null;
        const userLabel = formData.get("label") as string | null;

        if (!file) {
            return NextResponse.json({ message: "No prescription file provided." }, { status: 400 });
        }
        if (file.size > 20 * 1024 * 1024) { // Example: Limit to 20MB
            return NextResponse.json({ message: "File size exceeds 20MB limit." }, { status: 400 });
        }

        const customerId = session.user.shopifyCustomerId;

        // Step 1: Create a Staged Upload target on Shopify
        console.log(`[API POST Prescription] Creating staged upload for: ${file.name}`);
        const stagedUploadInput = [{
            filename: file.name,
            mimeType: file.type,
            resource: "FILE", // For generic files; use "IMAGE" or "VIDEO" if specific
            httpMethod: "POST",
        }];
        const stagedUploadsResponse = await createStagedUploads(stagedUploadInput);

        if (!stagedUploadsResponse.data?.stagedUploadsCreate?.stagedTargets?.[0]) {
            console.error("[API POST Prescription] Failed to create staged upload target. Response:", stagedUploadsResponse);
            const errorMsg = stagedUploadsResponse.data?.stagedUploadsCreate?.userErrors?.[0]?.message || "Failed to prepare file upload target on Shopify.";
            throw new Error(errorMsg);
        }

        const target = stagedUploadsResponse.data.stagedUploadsCreate.stagedTargets[0];
        const { url: uploadUrl, resourceUrl, parameters } = target;

        // Step 2: Upload the file to the Shopify-provided URL (from your server)
        console.log(`[API POST Prescription] Uploading file to Shopify's staged target: ${uploadUrl}`);
        const fileBuffer = await file.arrayBuffer();
        const uploadFormData = new FormData();
        parameters.forEach(({ name, value }: { name: string; value: string }) => {
            uploadFormData.append(name, value);
        });
        uploadFormData.append("file", new Blob([fileBuffer]), file.name); // 'file' is usually the required key

        const uploadResponse = await fetch(uploadUrl, {
            method: "POST",
            body: uploadFormData,
            // Do NOT set Content-Type header here, let fetch do it for FormData
        });

        if (!uploadResponse.ok) {
            const errorText = await uploadResponse.text();
            console.error(`[API POST Prescription] Failed to upload file to Shopify staged target. Status: ${uploadResponse.status}, Response: ${errorText}`);
            throw new Error(`Failed to upload file to Shopify's storage. Server responded with ${uploadResponse.status}.`);
        }
        console.log("[API POST Prescription] File successfully uploaded to staged target.");

        // Step 3: Create the File record in Shopify using the resourceUrl
        console.log(`[API POST Prescription] Creating Shopify file record with resourceUrl: ${resourceUrl}`);
        const fileCreateInput = [{
            originalSource: resourceUrl,
            contentType: "FILE", // Or "IMAGE", "VIDEO" matching the resource in stagedUploadsCreate
            // alt: userLabel || file.name, // Optionally set alt text if it's an image
        }];
        const fileCreateResponse = await createShopifyFiles(fileCreateInput);

        if (!fileCreateResponse.data?.fileCreate?.files?.[0]?.id) {
            console.error("[API POST Prescription] Failed to create Shopify file record. Response:", fileCreateResponse);
            const errorMsg = fileCreateResponse.data?.fileCreate?.userErrors?.[0]?.message || "Failed to finalize file on Shopify.";
            throw new Error(errorMsg);
        }

        const createdShopifyFile = fileCreateResponse.data.fileCreate.files[0];
        const shopifyFileId = createdShopifyFile.id; // This is the GID, e.g., "gid://shopify/File/12345"
        // Try to get URL from common structures
        const cdnUrl = (createdShopifyFile as any).url || (createdShopifyFile as any).image?.url || `gid_ref:${shopifyFileId}`;

        console.log(`[API POST Prescription] Shopify file created successfully. ID: ${shopifyFileId}, URL/Ref: ${cdnUrl}`);

        // --- Now update metafield with the Shopify File GID or URL ---
        let existingPrescriptions: PrescriptionEntry[] = [];
        try {
            const existingMetafieldResponse = await getShopifyCustomerMetafield(customerId, PRESCRIPTION_METAFIELD_NAMESPACE, PRESCRIPTION_METAFIELD_KEY);
            if (existingMetafieldResponse.data?.customer?.metafield?.value) {
                existingPrescriptions = parsePrescriptionsMetafield(existingMetafieldResponse.data.customer.metafield.value);
            }
        } catch (fetchError) {
            console.warn("[API POST Prescription] Could not fetch existing prescriptions meta, starting fresh. Error:", fetchError);
        }

        const newPrescription: PrescriptionEntry = {
            id: uuidv4(),
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
            uploadedAt: new Date().toISOString(),
            storageUrlOrId: shopifyFileId, // Store the Shopify File GID for future reference/retrieval
            label: userLabel || file.name.replace(/\.[^/.]+$/, ""),
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

        if (metafieldResponse.data?.metafieldsSet?.metafields) {
            console.log("[API POST Prescription] Metafield updated successfully for customer:", customerId);
            return NextResponse.json({
                success: true,
                prescription: newPrescription,
                allPrescriptions: updatedPrescriptions
            });
        } else {
            const userErrors = metafieldResponse.data?.metafieldsSet?.userErrors;
            const errorMessage = userErrors?.map((e: any) => e.message).join(", ") || "Failed to save prescription metadata.";
            console.error("[API POST Prescription] Error setting metafield:", errorMessage, userErrors);
            // Note: At this point, the file is uploaded to Shopify, but linking it via metafield failed.
            // You might want to implement cleanup logic for the uploaded Shopify file if metafield saving fails.
            throw new Error(errorMessage);
        }

    } catch (error: any) {
        console.error("[API POST Prescription] Error uploading prescription (outer catch):", error);
        return NextResponse.json({ message: error.message || "Failed to upload prescription." }, { status: 500 });
    }
}
