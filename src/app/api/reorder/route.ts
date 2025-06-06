// src/app/api/reorder/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { getShopifyOrderDetailsAdmin, createShopifyCheckout } from "../../../../utils";

export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions);

    // If the user is not authenticated, return a 401 error.
    // The frontend will handle redirecting to the sign-in page.
    if (!session?.user?.shopifyCustomerId || !session.shopifyAccessToken) {
        return NextResponse.json({ message: "User not authenticated." }, { status: 401 });
    }

    try {
        const { orderId } = await request.json();

        if (!orderId) {
            return NextResponse.json({ message: "Shopify Order ID is required." }, { status: 400 });
        }

        // Step 1: Fetch the original order details using the Shopify Admin API.
        const orderDetailsResponse = await getShopifyOrderDetailsAdmin(orderId);
        const orderNode = orderDetailsResponse.data?.order;

        if (!orderNode) {
            const errorMsg = orderDetailsResponse.data?.userErrors?.[0]?.message || "Original order not found or you don't have permission to view it.";
            return NextResponse.json({ message: errorMsg }, { status: 404 });
        }

        // Step 2: Prepare line items for the new checkout from the old order's data.
        const lineItems = orderNode.lineItems.edges.map((edge: any) => ({
            variantId: edge.node.variant.id,
            quantity: edge.node.quantity,
            customAttributes: edge.node.customAttributes.map((attr: {key: string, value: string}) => ({
                key: attr.key,
                value: attr.value,
            })),
        }));

        if (lineItems.length === 0) {
            return NextResponse.json({ message: "Original order contains no items to reorder." }, { status: 400 });
        }

        // Step 3: Create a new checkout with these line items using the Storefront API.
        const checkoutInput = {
            lineItems,
            allowPartialAddresses: true,
        };
        
        // Associate the new checkout with the logged-in customer.
        const checkoutResponse = await createShopifyCheckout(checkoutInput, session.shopifyAccessToken);

        const checkoutUrl = checkoutResponse.data?.checkoutCreate?.checkout?.webUrl;

        if (checkoutUrl) {
            // Step 4: Return the new checkout URL to the frontend.
            return NextResponse.json({ checkoutUrl });
        } else {
            const userErrors = checkoutResponse.data?.checkoutCreate?.checkoutUserErrors;
            const errorMsg = userErrors?.map((e: any) => e.message).join(", ") || "Failed to create a new checkout for reorder.";
            console.error("Reorder Checkout Creation Error:", userErrors);
            return NextResponse.json({ message: errorMsg }, { status: 500 });
        }

    } catch (error: any) {
        console.error("[API Reorder] Error:", error.message);
        return NextResponse.json({ message: error.message || "An unknown error occurred during reorder." }, { status: 500 });
    }
}
