// File: src/app/api/auth/signup/route.ts
import { NextResponse } from "next/server";
import { SignJWT } from "jose";
import { sendVerificationEmail } from "../../../../../utils/email";
import {
  shopifyAdminRequest,
  GET_CUSTOMER_BY_EMAIL_QUERY,
} from "../../../../../utils";

export async function POST(request: Request) {
  try {
    const { email, password, firstName, lastName } = await request.json();

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    if (password.length < 5) {
      return NextResponse.json(
        { message: "Password must be at least 5 characters long" },
        { status: 400 }
      );
    }

    // Check if a customer already exists with this email
    const existingCustomerResponse = await shopifyAdminRequest(
      GET_CUSTOMER_BY_EMAIL_QUERY,
      { email: `email:${email}` }
    );
    if (existingCustomerResponse.data?.customers?.edges?.length > 0) {
      return NextResponse.json(
        {
          message:
            "This email address is already registered. Please try signing in.",
        },
        { status: 409 }
      );
    }

    // Generate a verification token
    const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET);
    const token = await new SignJWT({ email, password, firstName, lastName })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("1h") // Token is valid for 1 hour
      .sign(secret);

    // Send the verification email
    await sendVerificationEmail(email, token);

    return NextResponse.json(
      { message: "Verification email sent. Please check your inbox." },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("[Sign Up API] Error:", error);
    return NextResponse.json(
      { message: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
