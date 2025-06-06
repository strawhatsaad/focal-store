// src/app/api/reorder/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { getShopifyOrderDetailsAdmin, createShopifyCheckout } from "../../../../utils";

export async function GET(request: NextRequest) {
    const session = await getServerSession(authOptions);

    // If the user is not authenticated, redirect them to the sign-in page.
    // After they sign in, they will be returned to the reorder flow.
    if (!session?.user?.shopifyCustomerId || !session.shopifyAccessToken) {
        const reorderUrl = request.nextUrl.clone();
        const loginUrl = new URL('/auth/signin', request.nextUrl.origin);
        loginUrl.searchParams.set('callbackUrl', reorderUrl.href);
        return NextResponse.redirect(loginUrl);
    }

    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("orderId");

    if (!orderId) {
        return NextResponse.json({ message: "Shopify Order ID is required." }, { status: 400 });
    }

    try {
        // Step 1: Fetch the original order details using the Shopify Admin API.
        // This is necessary to get the exact variant IDs, quantities, and custom attributes.
        const orderDetailsResponse = await getShopifyOrderDetailsAdmin(orderId);

        const orderNode = orderDetailsResponse.data?.order;

        if (!orderNode) {
            const errorMsg = orderDetailsResponse.data?.userErrors?.[0]?.message || "Original order not found or you don't have permission to view it.";
            throw new Error(errorMsg);
        }

        // Prepare line items for the new checkout from the old order's data.
        const lineItems = orderNode.lineItems.edges.map((edge: any) => ({
            variantId: edge.node.variant.id,
            quantity: edge.node.quantity,
            customAttributes: edge.node.customAttributes.map((attr: {key: string, value: string}) => ({
                key: attr.key,
                value: attr.value,
            })),
        }));

        if (lineItems.length === 0) {
            throw new Error("The original order has no line items to reorder.");
        }

        // Step 2: Create a new checkout with these line items using the Storefront API.
        const checkoutInput = {
            lineItems,
            allowPartialAddresses: true,
        };
        
        // Associate the new checkout with the logged-in customer.
        // This pre-fills their shipping and billing information.
        const checkoutResponse = await createShopifyCheckout(checkoutInput, session.shopifyAccessToken);

        if (checkoutResponse.data?.checkoutCreate?.checkout?.webUrl) {
            const checkoutUrl = checkoutResponse.data.checkoutCreate.checkout.webUrl;
            // Step 3: Redirect the user directly to the new, pre-filled Shopify checkout page.
            return NextResponse.redirect(checkoutUrl);
        } else {
            const userErrors = checkoutResponse.data?.checkoutCreate?.checkoutUserErrors;
            const errorMsg = userErrors?.map((e: any) => e.message).join(", ") || "Failed to create a new checkout for reorder.";
            console.error("Reorder Checkout Creation Error:", userErrors);
            throw new Error(errorMsg);
        }

    } catch (error: any) {
        console.error("[API Reorder] Error:", error);
        // In case of an error, redirect the user to the homepage with an error message.
        const errorPageUrl = new URL('/', request.nextUrl.origin);
        errorPageUrl.searchParams.set('error', 'reorder-failed');
        errorPageUrl.searchParams.set('message', error.message || 'An unknown error occurred during reorder.');
        return NextResponse.redirect(errorPageUrl);
    }
}
