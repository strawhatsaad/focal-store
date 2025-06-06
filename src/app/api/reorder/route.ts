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

        if (!orderId || !cartId) {
            return NextResponse.json({ message: "Shopify Order ID and current Cart ID are required." }, { status: 400 });
        }

        const fullShopifyOrderId = `gid://shopify/Order/${orderId}`;
        const orderDetailsResponse = await getShopifyOrderDetailsAdmin(fullShopifyOrderId);
        const orderNode = orderDetailsResponse.data?.order;

        if (!orderNode) {
            const errorMsg = orderDetailsResponse.data?.userErrors?.[0]?.message || "Original order not found or you don't have permission to view it.";
            return NextResponse.json({ message: errorMsg }, { status: 404 });
        }

        const lineItemsToAdd = orderNode.lineItems.edges.map((edge: any) => ({
            merchandiseId: edge.node.variant.id,
            quantity: edge.node.quantity,
            attributes: edge.node.customAttributes.map((attr: {key: string, value: string}) => ({ key: attr.key, value: attr.value })),
            title: edge.node.title // Keep title for error reporting
        }));

        if (lineItemsToAdd.length === 0) {
            return NextResponse.json({ message: "Original order contains no items to reorder." }, { status: 400 });
        }

        let currentCartId = cartId;
        const failedItems: { title: string, message: string }[] = [];
        let successfulAdds = 0;
        let finalCartState = null;

        // --- FIX: Process items one by one to handle individual quantity limits ---
        for (const item of lineItemsToAdd) {
            const { title, ...lineItem } = item; // Separate title used for logging/errors
            const response = await addLinesToShopifyCart(currentCartId, [lineItem]);
            
            const cartData = response.data?.cartLinesAdd?.cart;
            const userErrors = response.data?.cartLinesAdd?.userErrors;

            if (userErrors && userErrors.length > 0) {
                const errorMessage = userErrors.map((e: any) => e.message).join(", ");
                failedItems.push({ title: title, message: errorMessage });
            } else if (cartData) {
                successfulAdds++;
                finalCartState = cartData; // Always use the latest cart state
                currentCartId = cartData.id; // The cart ID should not change, but good practice
            } else {
                failedItems.push({ title: title, message: "An unknown error occurred while adding this item." });
            }
        }

        if (successfulAdds === 0) {
            const errorMessage = failedItems.map(f => `${f.title}: ${f.message}`).join('; ');
            return NextResponse.json({ message: `Could not reorder any items. Errors: ${errorMessage}` }, { status: 400 });
        }

        const responsePayload: { success: boolean; cart: any; message?: string } = {
            success: true,
            cart: finalCartState,
        };

        if (failedItems.length > 0) {
            const failedItemsMessage = failedItems.map(f => f.title).join(', ');
            responsePayload.message = `Successfully added ${successfulAdds} item(s). The following could not be added due to quantity limits or other issues: ${failedItemsMessage}.`;
        }

        return NextResponse.json(responsePayload);

    } catch (error: any) {
        console.error("[API Reorder] Error:", error.message);
        return NextResponse.json({ message: error.message || "An unknown error occurred during reorder." }, { status: 500 });
    }
}