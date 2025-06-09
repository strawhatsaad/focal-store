// src/app/api/account/prescriptions/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { google } from "googleapis";
import { Readable } from "stream";
import { setShopifyMetafields, getShopifyCustomerMetafield } from "../../../../../utils";

const GDRIVE_FOLDER_ID = process.env.GOOGLE_DRIVE_PRESCRIPTIONS_FOLDER_ID;

/**
 * Handles fetching existing prescriptions for a customer.
 */
export async function GET(request: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.shopifyCustomerId) {
        return NextResponse.json({ message: "Not authenticated." }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    if (!category) {
        return NextResponse.json({ message: "Category is required." }, { status: 400 });
    }

    const metafieldNamespace = `focal_prescriptions_${category.toLowerCase()}`;
    const metafieldKey = "list";

    try {
        const response = await getShopifyCustomerMetafield(
            session.user.shopifyCustomerId,
            metafieldNamespace,
            metafieldKey
        );

        if (response.data?.customer?.metafield?.value) {
            try {
                // Safely parse the JSON from the metafield
                const prescriptions = JSON.parse(response.data.customer.metafield.value);
                return NextResponse.json({ prescriptions });
            } catch (e) {
                console.error("Failed to parse prescriptions JSON from metafield:", e);
                // If JSON is invalid, return an empty array to prevent client-side errors
                return NextResponse.json({ prescriptions: [] });
            }
        } else {
            // No metafield found, which is normal for a new customer. Return empty array.
            return NextResponse.json({ prescriptions: [] });
        }
    } catch (error: any) {
        console.error("Failed to get prescriptions:", error);
        return NextResponse.json({ message: `Failed to retrieve prescriptions: ${error.message}` }, { status: 500 });
    }
}


/**
 * Configures Google Auth, prioritizing credentials from a JSON environment variable,
 * and falling back to a file path. This is ideal for deployments like Vercel.
 */
const getGoogleAuth = () => {
    if (process.env.GOOGLE_SERVICE_ACCOUNT_CREDS_JSON) {
        // If the JSON content is directly in an environment variable
        const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_CREDS_JSON);
        return new google.auth.GoogleAuth({
            credentials,
            scopes: ["https://www.googleapis.com/auth/drive.file"],
        });
    } else if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH) {
        // Fallback for local development using a file path
        return new google.auth.GoogleAuth({
            keyFile: process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH,
            scopes: ["https://www.googleapis.com/auth/drive.file"],
        });
    } else {
        // If neither is configured, throw an error.
        throw new Error(
            "Google Service Account credentials not configured. Please set either GOOGLE_SERVICE_ACCOUNT_CREDS_JSON or GOOGLE_SERVICE_ACCOUNT_KEY_PATH."
        );
    }
};


/**
 * Uploads a file buffer to Google Drive.
 * @param {Buffer} fileBuffer The file content as a buffer.
 * @param {string} fileName The desired name for the file in Google Drive.
 * @param {string} mimeType The MIME type of the file.
 * @returns {Promise<string>} The ID of the uploaded file.
 */
async function uploadToGoogleDrive(fileBuffer: Buffer, fileName: string, mimeType: string): Promise<string> {
    if (!GDRIVE_FOLDER_ID) {
        throw new Error("Google Drive Folder ID is not configured.");
    }
    
    const auth = getGoogleAuth();
    const drive = google.drive({ version: "v3", auth });

    const fileMetadata = {
        name: fileName,
        parents: [GDRIVE_FOLDER_ID],
    };

    const media = {
        mimeType: mimeType,
        body: Readable.from(fileBuffer),
    };

    const response = await drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: "id",
    });

    if (!response.data.id) {
        throw new Error("File upload to Google Drive failed: No file ID returned.");
    }

    return response.data.id;
}


export async function POST(request: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.shopifyCustomerId) {
        return NextResponse.json({ message: "Not authenticated." }, { status: 401 });
    }

    try {
        const formData = await request.formData();
        const prescriptionFile = formData.get("prescriptionFile") as File | null;
        const label = formData.get("label") as string | null;
        const category = formData.get("category") as string | null;

        if (!prescriptionFile) {
            return NextResponse.json({ message: "No prescription file provided." }, { status: 400 });
        }
        if (!label) {
            return NextResponse.json({ message: "A label for the prescription is required." }, { status: 400 });
        }
        if (!category) {
            return NextResponse.json({ message: "A category (e.g., 'Eyeglasses') is required." }, { status: 400 });
        }

        const fileBuffer = Buffer.from(await prescriptionFile.arrayBuffer());
        const timestamp = new Date().toISOString().replace(/:/g, "-");
        const uniqueFileName = `${session.user.shopifyCustomerId}_${timestamp}_${prescriptionFile.name}`;

        const driveFileId = await uploadToGoogleDrive(fileBuffer, uniqueFileName, prescriptionFile.type);

        const newPrescription = {
            id: driveFileId,
            label: label,
            fileName: prescriptionFile.name,
            uploadDate: new Date().toISOString(),
            storageUrlOrId: `gdrive://${driveFileId}`,
        };

        const metafieldNamespace = `focal_prescriptions_${category.toLowerCase()}`;
        const metafieldKey = "list";

        const existingMetafieldResponse = await getShopifyCustomerMetafield(
            session.user.shopifyCustomerId,
            metafieldNamespace,
            metafieldKey
        );

        let existingPrescriptions = [];
        if (existingMetafieldResponse.data?.customer?.metafield?.value) {
            try {
                existingPrescriptions = JSON.parse(existingMetafieldResponse.data.customer.metafield.value);
            } catch (e) {
                console.error("Failed to parse existing prescriptions metafield:", e);
            }
        }
        
        const updatedPrescriptions = [...existingPrescriptions, newPrescription];

        const metafieldsInput = [{
            key: metafieldKey,
            namespace: metafieldNamespace,
            ownerId: session.user.shopifyCustomerId,
            type: "json_string",
            value: JSON.stringify(updatedPrescriptions)
        }];
        
        await setShopifyMetafields(metafieldsInput);

        return NextResponse.json({ 
            message: "Prescription uploaded successfully.", 
            prescription: newPrescription 
        });

    } catch (error: any) {
        console.error("Prescription upload error:", error);
        return NextResponse.json({ 
            message: `Failed to upload prescription: ${error.message}` 
        }, { status: 500 });
    }
}
