// File: src/app/api/auth/signup/route.ts
import { NextResponse } from 'next/server';
import { storeFront, CREATE_SHOPIFY_CUSTOMER_MUTATION } from '../../../../../utils/index'; // Adjust path

export async function POST(request: Request) {
    try {
        const { email, password, firstName, lastName } = await request.json();

        if (!email || !password || !firstName || !lastName) {
            return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
        }

        // Basic password validation (example)
        if (password.length < 8) {
            return NextResponse.json({ message: 'Password must be at least 8 characters long' }, { status: 400 });
        }

        const createInput = {
            email,
            password,
            firstName,
            lastName,
            acceptsMarketing: false, // Or get from form
        };

        console.log("[Sign Up API] Attempting to create Shopify customer:", email);
        const shopifyResponse = await storeFront(CREATE_SHOPIFY_CUSTOMER_MUTATION, { input: createInput });

        if (shopifyResponse.data?.customerCreate?.customer) {
            console.log("[Sign Up API] Shopify customer created successfully:", shopifyResponse.data.customerCreate.customer.id);
            return NextResponse.json({ message: 'Customer created successfully in Shopify' }, { status: 201 });
        } else if (shopifyResponse.data?.customerCreate?.customerUserErrors?.length > 0) {
            const errors = shopifyResponse.data.customerCreate.customerUserErrors;
            console.error("[Sign Up API] Shopify customer creation errors:", errors);
            // Check for specific errors like EMAIL_TAKEN
            if (errors.some((err: any) => err.code === "EMAIL_TAKEN")) {
                return NextResponse.json({ message: 'This email address is already registered. Please try signing in.' }, { status: 409 }); // Conflict
            }
            return NextResponse.json({ message: errors.map((e: any) => e.message).join(', ') || 'Failed to create customer in Shopify' }, { status: 400 });
        } else if (shopifyResponse.errors) {
            console.error("[Sign Up API] Shopify GraphQL errors:", shopifyResponse.errors);
            return NextResponse.json({ message: shopifyResponse.errors.map((e: any) => e.message).join(', ') || 'GraphQL error during customer creation' }, { status: 500 });
        }

        console.error("[Sign Up API] Unknown error during Shopify customer creation.");
        return NextResponse.json({ message: 'An unknown error occurred during sign up' }, { status: 500 });

    } catch (error: any) {
        console.error('[Sign Up API] Error:', error);
        return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
