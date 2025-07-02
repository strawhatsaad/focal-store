// src/app/api/upload/route.ts
import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import path from "path";

export async function POST(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const filename = searchParams.get("filename");

  if (!filename) {
    return NextResponse.json(
      { message: "No filename provided" },
      { status: 400 }
    );
  }

  if (!request.body) {
    return NextResponse.json({ message: "No file to upload" }, { status: 400 });
  }

  // Create a unique path for the file
  const fileExtension = path.extname(filename);
  const uniqueFilename = `${path.basename(
    filename,
    fileExtension
  )}-${uuidv4()}${fileExtension}`;

  try {
    const blob = await put(uniqueFilename, request.body, {
      access: "public",
    });

    // Return the blob object which contains the URL
    return NextResponse.json(blob);
  } catch (error: any) {
    console.error("Error uploading to Vercel Blob:", error);
    return NextResponse.json(
      { message: `Failed to upload file: ${error.message}` },
      { status: 500 }
    );
  }
}
