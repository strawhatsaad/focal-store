// File: src/app/api/reorder/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { getShopifyOrderLineItems, storeFront, CART_LINES_ADD_MUTATION } from "../../../../utils";

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.shopifyCustomerId || !session.shopifyAccessToken) {
        return NextResponse.json({ message: "Not authenticated or Shopify Customer ID missing." }, { status: 401 });
    }

    try {
        const { orderId, cartId } = await request.json();

        if (!orderId) {
            return NextResponse.json({ message: "Order ID is required." }, { status: 400 });
        }
        if (!cartId) {
            return NextResponse.json({ message: "Cart ID is required." }, { status: 400 });
        }

        // 1. Fetch the previous order details using Admin API
        const orderResponse = await getShopifyOrderLineItems(orderId);

        const orderData = orderResponse.data?.order;
        if (!orderData) {
            throw new Error("Order not found or could not be retrieved.");
        }

        // 2. Security Check: Ensure the order belongs to the logged-in customer
        if (orderData.customer?.id !== session.user.shopifyCustomerId) {
            return NextResponse.json({ message: "Unauthorized access to this order." }, { status: 403 });
        }

        const lineItemsFromOrder = orderData.lineItems.edges;
        if (!lineItemsFromOrder || lineItemsFromOrder.length === 0) {
            return NextResponse.json({ message: "No items found in the specified order to reorder." }, { status: 404 });
        }

        // 3. Prepare line items for the new cart
        const newCartLines = lineItemsFromOrder.map((edge: any) => {
            if (!edge.node.variant?.id) {
                console.warn("Skipping line item with missing variant ID:", edge.node);
                return null;
            }
            return {
                merchandiseId: edge.node.variant.id,
                quantity: edge.node.quantity,
                attributes: edge.node.customAttributes.map((attr: { key: string; value: string }) => ({
                    key: attr.key,
                    value: attr.value,
                })),
            };
        }).filter(Boolean); // Filter out any null items

        if (newCartLines.length === 0) {
            return NextResponse.json({ message: "No valid items could be reordered." }, { status: 400 });
        }

        // 4. Add items to the user's current cart using Storefront API
        const addLinesResponse = await storeFront(
            CART_LINES_ADD_MUTATION,
            {
                cartId: cartId,
                lines: newCartLines,
            },
            session.shopifyAccessToken
        );

        if (addLinesResponse.data?.cartLinesAdd?.userErrors?.length > 0) {
             const errorMessage = addLinesResponse.data.cartLinesAdd.userErrors.map((e: any) => e.message).join(", ");
             throw new Error(`Failed to add items to cart: ${errorMessage}`);
        }

        if (!addLinesResponse.data?.cartLinesAdd?.cart) {
            throw new Error("Failed to add items to the cart. The cart may no longer be valid.");
        }

        return NextResponse.json({ success: true, cart: addLinesResponse.data.cartLinesAdd.cart });

    } catch (error: any) {
        console.error("[API Reorder] Error:", error.message);
        return NextResponse.json({ message: error.message || "An internal server error occurred." }, { status: 500 });
    }
}
