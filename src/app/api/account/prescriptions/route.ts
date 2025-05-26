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
import path from 'path'; // Import path module for extension

const PRESCRIPTION_METAFIELD_NAMESPACE = "focal_rx";
const PRESCRIPTION_METAFIELD_KEY = "uploaded_prescriptions";

interface PrescriptionEntry {
    id: string;
    fileName: string; // This will store the original filename for display or the new one
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
        if (file.size > 20 * 1024 * 1024) { // Example: Limit to 20MB
            return NextResponse.json({ message: "File size exceeds 20MB limit." }, { status: 400 });
        }

        const customerId = session.user.shopifyCustomerId;
        const customerName = session.user.name;
        const customerEmail = session.user.email;

        // Generate a new filename
        const originalExtension = path.extname(file.name);
        const safeCustomerName = customerName.replace(/[^a-zA-Z0-9\s]/g, "").replace(/\s+/g, "_");
        const newFileName = `${safeCustomerName}_Prescription_${Date.now()}${originalExtension}`;
        const altText = `${customerName} - ${customerEmail}`;


        // Step 1: Create a Staged Upload target on Shopify
        console.log(`[API POST Prescription] Creating staged upload for: ${newFileName} (original: ${file.name})`);
        const stagedUploadInput = [{
            filename: newFileName, // Use the new filename
            mimeType: file.type,
            resource: "FILE",
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

        // Step 2: Upload the file to the Shopify-provided URL
        console.log(`[API POST Prescription] Uploading file to Shopify's staged target: ${uploadUrl}`);
        const fileBuffer = await file.arrayBuffer();
        const uploadFormData = new FormData();
        parameters.forEach(({ name, value }: { name: string; value: string }) => {
            uploadFormData.append(name, value);
        });
        uploadFormData.append("file", new Blob([fileBuffer]), newFileName); // Use newFileName for the blob as well

        const uploadResponse = await fetch(uploadUrl, {
            method: "POST",
            body: uploadFormData,
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
            alt: altText, // Set the alt text
        }];
        const fileCreateResponse = await createShopifyFiles(fileCreateInput);

        if (!fileCreateResponse.data?.fileCreate?.files?.[0]?.id) {
            console.error("[API POST Prescription] Failed to create Shopify file record. Response:", fileCreateResponse);
            const errorMsg = fileCreateResponse.data?.fileCreate?.userErrors?.[0]?.message || "Failed to finalize file on Shopify.";
            throw new Error(errorMsg);
        }

        const createdShopifyFile = fileCreateResponse.data.fileCreate.files[0];
        const shopifyFileId = createdShopifyFile.id;

        let finalStorageUrlOrId = `gid_ref:${shopifyFileId}`; // Default to GID
        if (createdShopifyFile.url) { // For GenericFile
            finalStorageUrlOrId = createdShopifyFile.url;
        } else if (createdShopifyFile.image?.url) { // For MediaImage
            finalStorageUrlOrId = createdShopifyFile.image.url;
        } else if (createdShopifyFile.sources?.[0]?.url) { // For VideoFile (example)
            finalStorageUrlOrId = createdShopifyFile.sources[0].url;
        }

        console.log(`[API POST Prescription] Shopify file created successfully. ID: ${shopifyFileId}, Stored URL/Ref: ${finalStorageUrlOrId}`);

        // --- Now update metafield ---
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
            fileName: newFileName, // Store the new, customer-specific filename
            fileType: file.type,
            fileSize: file.size,
            uploadedAt: new Date().toISOString(),
            storageUrlOrId: finalStorageUrlOrId, // Store the CDN URL or GID
            label: userLabel || customerName, // Use customer name as default label if no userLabel
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
            throw new Error(errorMessage);
        }

    } catch (error: any) {
        console.error("[API POST Prescription] Error uploading prescription (outer catch):", error);
        return NextResponse.json({ message: error.message || "Failed to upload prescription." }, { status: 500 });
    }
}
