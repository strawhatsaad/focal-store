// src/app/api/account/prescriptions/route.ts
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import {
    setShopifyMetafields,
    getShopifyCustomerMetafield,
    deleteShopifyFile
} from "../../../../../utils";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { google, drive_v3 } from 'googleapis';
import stream from 'stream';

const PRESCRIPTION_METAFIELD_NAMESPACE = "focal_rx";
const PRESCRIPTION_METAFIELD_KEY = "uploaded_prescriptions";
const GDRIVE_FOLDER_ID = process.env.GOOGLE_DRIVE_PRESCRIPTIONS_FOLDER_ID;

type PrescriptionCategory = 'ContactLenses' | 'Eyeglasses';

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

/**
 * Configures Google Auth, prioritizing credentials from a JSON environment variable,
 * and falling back to a file path. This is ideal for deployments like Vercel.
 */
const getGoogleAuth = (scopes: string | string[]) => {
    const credsJson = process.env.GOOGLE_SERVICE_ACCOUNT_CREDS_JSON;
    const keyFilePath = process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH;

    if (credsJson) {
        // Use JSON credentials directly from the environment variable
        const credentials = JSON.parse(credsJson);
        return new google.auth.GoogleAuth({ credentials, scopes });
    } else if (keyFilePath) {
        // Fallback to the key file path for local development
        return new google.auth.GoogleAuth({ keyFile: keyFilePath, scopes });
    } else {
        // If neither is configured, throw an error
        throw new Error(
            "Google Service Account credentials not configured. Please set either GOOGLE_SERVICE_ACCOUNT_CREDS_JSON or GOOGLE_SERVICE_ACCOUNT_KEY_PATH."
        );
    }
};

async function getOrCreateCustomerFolder(drive: drive_v3.Drive, parentFolderId: string, customerFolderName: string): Promise<string> {
    try {
        const sanitizedFolderName = customerFolderName.replace(/'/g, "\\'");
        const query = `mimeType='application/vnd.google-apps.folder' and name='${sanitizedFolderName}' and '${parentFolderId}' in parents and trashed=false`;
        const res = await drive.files.list({
            q: query,
            fields: 'files(id, name)',
            spaces: 'drive',
        });

        if (res.data.files && res.data.files.length > 0) {
            return res.data.files[0].id!;
        } else {
            const fileMetadata = {
                name: customerFolderName,
                mimeType: 'application/vnd.google-apps.folder',
                parents: [parentFolderId],
            };
            const folder = await drive.files.create({
                requestBody: fileMetadata,
                fields: 'id',
            });
            if (!folder.data.id) {
                throw new Error("Failed to get ID for newly created Google Drive folder.");
            }
            return folder.data.id!;
        }
    } catch (error: any) {
        console.error(`[Google Drive] Error finding or creating customer folder "${customerFolderName}":`, error.message, error.errors);
        throw new Error(`Could not find or create customer folder in Google Drive: ${error.message}`);
    }
}

async function uploadToGoogleDrive(
    fileBuffer: ArrayBuffer,
    fileNameInDrive: string,
    mimeType: string,
    customerName: string,
    customerEmail: string
): Promise<{ fileId: string; webViewLink: string }> {
    try {
        if (!GDRIVE_FOLDER_ID) throw new Error("Google Drive Main Prescriptions Folder ID not configured.");

        const auth = getGoogleAuth(['https://www.googleapis.com/auth/drive']);
        const drive = google.drive({ version: 'v3', auth });

        const safeCustomerName = customerName.replace(/[^a-zA-Z0-9\s-_]/g, '_');
        const safeCustomerEmail = customerEmail.replace(/[^a-zA-Z0-9@._-]/g, '_');
        const customerFolderName = `${safeCustomerName} - ${safeCustomerEmail}`;

        const customerSpecificFolderId = await getOrCreateCustomerFolder(drive, GDRIVE_FOLDER_ID, customerFolderName);

        const fileMetadata = {
            name: fileNameInDrive,
            parents: [customerSpecificFolderId],
        };

        const bufferStream = new stream.PassThrough();
        bufferStream.end(Buffer.from(fileBuffer));

        const media = {
            mimeType: mimeType,
            body: bufferStream,
        };

        const response = await drive.files.create({
            requestBody: fileMetadata,
            media: media,
            fields: 'id, webViewLink, webContentLink',
        });

        const fileId = response.data.id;
        const webViewLink = response.data.webViewLink;

        if (!fileId || !webViewLink) {
            console.error("[Google Drive] Upload response missing ID or webViewLink:", response.data);
            throw new Error('Failed to get file ID or link from Google Drive response.');
        }

        await drive.permissions.create({
            fileId: fileId,
            requestBody: {
                role: 'reader',
                type: 'anyone',
            },
        });

        return { fileId, webViewLink: webViewLink || `https://drive.google.com/file/d/${fileId}/view?usp=sharing` };

    } catch (driveError: any) {
        let detailedMessage = driveError.message;
        if (driveError.errors && Array.isArray(driveError.errors) && driveError.errors.length > 0) {
            detailedMessage += ` Details: ${driveError.errors.map((e: any) => e.message).join(', ')}`;
        }
        throw new Error(`Failed to upload prescription to Google Drive: ${detailedMessage}`);
    }
}

export async function GET(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.shopifyCustomerId) {
        return NextResponse.json({ message: "Not authenticated or Shopify Customer ID missing." }, { status: 401 });
    }
    const { searchParams } = new URL(request.url);
    const categoryFilter = searchParams.get('category') as PrescriptionCategory | null;
    try {
        const ownerShopifyId = session.user.shopifyCustomerId;
        const response = await getShopifyCustomerMetafield(ownerShopifyId, PRESCRIPTION_METAFIELD_NAMESPACE, PRESCRIPTION_METAFIELD_KEY);
        let prescriptions: PrescriptionEntry[] = [];
        if (response.data?.customer?.metafield?.value) {
            prescriptions = parsePrescriptionsMetafield(response.data.customer.metafield.value);
        }
        if (categoryFilter) {
            prescriptions = prescriptions.filter(p => p.category === categoryFilter);
        }
        return NextResponse.json({ prescriptions });
    } catch (error: any) {
        console.error("[API GET Prescriptions] Error fetching prescriptions:", error);
        return NextResponse.json({ message: error.message || "Failed to fetch prescriptions." }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.shopifyCustomerId || !session?.user?.name || !session?.user?.email) {
        return NextResponse.json({ message: "User details (Shopify Customer ID, name, or email) not found in session. Cannot process prescription." }, { status: 401 });
    }

    try {
        const formData = await request.formData();
        const file = formData.get("prescriptionFile") as File | null;
        const userLabel = formData.get("label") as string | null;
        const category = formData.get("category") as PrescriptionCategory | undefined;

        if (!category) {
            return NextResponse.json({ message: "Prescription category is required." }, { status: 400 });
        }
        if (!file) {
            return NextResponse.json({ message: "No prescription file provided." }, { status: 400 });
        }
        if (file.size > 20 * 1024 * 1024) {
            return NextResponse.json({ message: "File size exceeds 20MB limit." }, { status: 400 });
        }

        const ownerShopifyId = session.user.shopifyCustomerId;
        const customerName = session.user.name;
        const customerEmail = session.user.email;

        const originalExtension = path.extname(file.name);
        const safeOriginalFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const uniqueFileNameForDrive = `${safeOriginalFileName}_${uuidv4()}${originalExtension}`;

        const fileBuffer = await file.arrayBuffer();

        const { fileId: googleDriveFileId, webViewLink: googleDriveLink } = await uploadToGoogleDrive(
            fileBuffer,
            uniqueFileNameForDrive,
            file.type,
            customerName,
            customerEmail
        );

        let existingPrescriptions: PrescriptionEntry[] = [];
        const existingMetafieldResponse = await getShopifyCustomerMetafield(ownerShopifyId, PRESCRIPTION_METAFIELD_NAMESPACE, PRESCRIPTION_METAFIELD_KEY);
        if (existingMetafieldResponse.data?.customer?.metafield?.value) {
            existingPrescriptions = parsePrescriptionsMetafield(existingMetafieldResponse.data.customer.metafield.value);
        }

        const newPrescription: PrescriptionEntry = {
            id: uuidv4(),
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
            uploadedAt: new Date().toISOString(),
            storageUrlOrId: googleDriveLink,
            label: userLabel || file.name.replace(/\.[^/.]+$/, ""),
            shopifyFileId: null,
            category: category,
            googleDriveFileId: googleDriveFileId,
        };

        const updatedPrescriptions = [...existingPrescriptions, newPrescription];
        const metafieldsInput = [{
            ownerId: ownerShopifyId,
            namespace: PRESCRIPTION_METAFIELD_NAMESPACE,
            key: PRESCRIPTION_METAFIELD_KEY,
            type: "json_string",
            value: JSON.stringify(updatedPrescriptions),
        }];

        const metafieldResponse = await setShopifyMetafields(metafieldsInput);

        if (metafieldResponse.data?.metafieldsSet?.userErrors?.length > 0) {
            const userErrors = metafieldResponse.data.metafieldsSet.userErrors;
            const errorMessage = userErrors.map((e: any) => `Field: ${e.field.join('/')}, Message: ${e.message}`).join("; ");
            throw new Error(`Failed to save prescription metadata: ${errorMessage}`);
        }

        if (metafieldResponse.data?.metafieldsSet?.metafields) {
            return NextResponse.json({
                success: true,
                prescription: newPrescription,
                allPrescriptions: updatedPrescriptions
            });
        } else {
            throw new Error("Failed to save prescription metadata (unknown error after metafieldsSet).");
        }

    } catch (error: any) {
        return NextResponse.json({ message: error.message || "Failed to upload prescription." }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.shopifyCustomerId) {
        return NextResponse.json({ message: "Not authenticated or Shopify Customer ID missing." }, { status: 401 });
    }
    try {
        const { prescriptionId } = await request.json();
        if (!prescriptionId) {
            return NextResponse.json({ message: "Prescription ID (for metafield entry) is required." }, { status: 400 });
        }
        const ownerShopifyId = session.user.shopifyCustomerId;
        const existingMetafieldResponse = await getShopifyCustomerMetafield(ownerShopifyId, PRESCRIPTION_METAFIELD_NAMESPACE, PRESCRIPTION_METAFIELD_KEY);
        let existingPrescriptions: PrescriptionEntry[] = [];
        if (existingMetafieldResponse.data?.customer?.metafield?.value) {
            existingPrescriptions = parsePrescriptionsMetafield(existingMetafieldResponse.data.customer.metafield.value);
        }
        const prescriptionToDelete = existingPrescriptions.find(p => p.id === prescriptionId);
        if (!prescriptionToDelete) {
            return NextResponse.json({ message: "Prescription entry not found in metafield." }, { status: 404 });
        }

        if (prescriptionToDelete.googleDriveFileId) {
            try {
                const auth = getGoogleAuth(['https://www.googleapis.com/auth/drive.file']);
                const drive = google.drive({ version: 'v3', auth });
                await drive.files.delete({ fileId: prescriptionToDelete.googleDriveFileId });
            } catch (driveDeleteError: any) {
                console.error(`[API DELETE Prescription] Error deleting Google Drive file ${prescriptionToDelete.googleDriveFileId}:`, driveDeleteError.message);
            }
        }

        if (prescriptionToDelete.shopifyFileId) { 
            try {
                await deleteShopifyFile([prescriptionToDelete.shopifyFileId]);
            } catch (e) { console.error("Error deleting Shopify file:", e); }
        }

        const updatedPrescriptions = existingPrescriptions.filter(p => p.id !== prescriptionId);
        const metafieldsInput = [{ ownerId: ownerShopifyId, namespace: PRESCRIPTION_METAFIELD_NAMESPACE, key: PRESCRIPTION_METAFIELD_KEY, type: "json_string", value: JSON.stringify(updatedPrescriptions), }];

        const metafieldResponse = await setShopifyMetafields(metafieldsInput);

        if (metafieldResponse.data?.metafieldsSet?.userErrors?.length > 0) {
            const userErrors = metafieldResponse.data.metafieldsSet.userErrors;
            const errorMessage = userErrors.map((e: any) => `Field: ${e.field.join('/')}, Message: ${e.message}`).join("; ");
            throw new Error(`Failed to update prescription metadata after deletion: ${errorMessage}`);
        }

        if (metafieldResponse.data?.metafieldsSet?.metafields || (metafieldResponse.data?.metafieldsSet?.userErrors && metafieldResponse.data.metafieldsSet.userErrors.length === 0)) {
            return NextResponse.json({ success: true, message: "Prescription deleted successfully.", remainingPrescriptions: updatedPrescriptions });
        } else {
            throw new Error("Failed to update prescription metadata after deletion (unknown error after metafieldsSet).");
        }
    } catch (error: any) {
        console.error("[API DELETE Prescription] Error deleting prescription (outer catch):", error.message, error.stack);
        return NextResponse.json({ message: error.message || "Failed to delete prescription." }, { status: 500 });
    }
}
