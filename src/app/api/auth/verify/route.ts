// File: src/app/api/auth/verify/route.ts
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import {
  storeFront,
  shopifyAdminRequest,
  CREATE_SHOPIFY_CUSTOMER_MUTATION,
  CUSTOMER_UPDATE_MUTATION,
} from "../../../../../utils";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(
      new URL("/auth/verify?status=error&message=Missing_token", request.url)
    );
  }

  try {
    const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET);
    const { payload } = await jwtVerify(token, secret);

    const { email, password, firstName, lastName } = payload as any;

    if (!email || !password || !firstName || !lastName) {
      throw new Error("Invalid token payload.");
    }

    // Step 1: Create the customer using the Storefront API, which accepts a password.
    const createInput = {
      email,
      password,
      firstName,
      lastName,
    };

    const storefrontResponse = await storeFront(
      CREATE_SHOPIFY_CUSTOMER_MUTATION,
      { input: createInput }
    );

    if (storefrontResponse.data?.customerCreate?.customer) {
      // Step 2: If successful, add the 'verified' tag using the Admin API.
      const customerId = storefrontResponse.data.customerCreate.customer.id;
      await shopifyAdminRequest(CUSTOMER_UPDATE_MUTATION, {
        input: {
          id: customerId,
          tags: ["verified"],
        },
      });

      // Redirect to sign-in page with a success message
      return NextResponse.redirect(
        new URL("/auth/signin?verified=true", request.url)
      );
    } else if (
      storefrontResponse.data?.customerCreate?.customerUserErrors?.length > 0
    ) {
      const errors = storefrontResponse.data.customerCreate.customerUserErrors;
      if (errors.some((err: any) => err.code === "TAKEN")) {
        // If email is taken, it's possible they verified already. Redirect to signin.
        return NextResponse.redirect(
          new URL(
            "/auth/signin?verified=true&message=Account_already_exists",
            request.url
          )
        );
      }
      const errorMessage =
        errors.map((e: any) => e.message).join(", ") ||
        "Failed to create customer.";
      throw new Error(errorMessage);
    } else {
      throw new Error("Unknown error during customer creation.");
    }
  } catch (error: any) {
    console.error("[Verify API] Error:", error);
    let message = "Invalid_or_expired_token";
    if (error.code === "ERR_JWT_EXPIRED") {
      message = "Token_has_expired";
    } else if (error.message) {
      // Pass a generic error message to avoid exposing details
      message = "Verification_failed";
    }
    return NextResponse.redirect(
      new URL(`/auth/verify?status=error&message=${message}`, request.url)
    );
  }
}
