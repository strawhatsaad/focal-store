// src/app/api/reorder/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { getShopifyOrderDetailsAdmin, addLinesToShopifyCart } from "../../../../utils";

export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.shopifyCustomerId || !session.shopifyAccessToken) {
        return NextResponse.json({ message: "User not authenticated." }, { status: 401 });
    }

    try {
        const { orderId, cartId } = await request.json();

        if (!orderId) {
            return NextResponse.json({ message: "Shopify Order ID is required." }, { status: 400 });
        }
        if (!cartId) {
            return NextResponse.json({ message: "Current Cart ID is required." }, { status: 400 });
        }

        // --- FIX: Construct the full Shopify GraphQL ID (GID) ---
        // The URL provides a numeric ID, but the Admin API needs the full GID format.
        const fullShopifyOrderId = `gid://shopify/Order/${orderId}`;

        // Step 1: Fetch the original order details using the correctly formatted GID.
        const orderDetailsResponse = await getShopifyOrderDetailsAdmin(fullShopifyOrderId);
        const orderNode = orderDetailsResponse.data?.order;

        if (!orderNode) {
            const errorMsg = orderDetailsResponse.data?.userErrors?.[0]?.message || "Original order not found or you don't have permission to view it.";
            return NextResponse.json({ message: errorMsg }, { status: 404 });
        }

        // Step 2: Prepare line items for the new cart from the old order's data.
        const lineItems = orderNode.lineItems.edges.map((edge: any) => ({
            merchandiseId: edge.node.variant.id,
            quantity: edge.node.quantity,
            attributes: edge.node.customAttributes.map((attr: {key: string, value: string}) => ({
                key: attr.key,
                value: attr.value,
            })),
        }));

        if (lineItems.length === 0) {
            return NextResponse.json({ message: "Original order contains no items to reorder." }, { status: 400 });
        }

        // Step 3: Add these items to the user's current cart using the Storefront API.
        const addLinesResponse = await addLinesToShopifyCart(cartId, lineItems);
        const updatedCart = addLinesResponse.data?.cartLinesAdd?.cart;

        if (updatedCart) {
            // Step 4: Return a success response.
            return NextResponse.json({ success: true, cart: updatedCart });
        } else {
            const userErrors = addLinesResponse.data?.cartLinesAdd?.userErrors;
            const errorMsg = userErrors?.map((e: any) => e.message).join(", ") || "Failed to add items to the cart during reorder.";
            console.error("Reorder - Add to Cart Error:", userErrors);
            return NextResponse.json({ message: errorMsg }, { status: 500 });
        }

    } catch (error: any) {
        console.error("[API Reorder] Error:", error.message);
        return NextResponse.json({ message: error.message || "An unknown error occurred during reorder." }, { status: 500 });
    }
}