// File: src/app/api/reorder/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { 
    GET_ORDER_BY_NOTE_QUERY, 
    shopifyAdminRequest, 
    storeFront, 
    CART_LINES_ADD_MUTATION 
} from "../../../../utils";

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.shopifyCustomerId || !session.shopifyAccessToken) {
        return NextResponse.json({ message: "Not authenticated or Shopify Customer ID missing." }, { status: 401 });
    }

    try {
        const { cartIdFromUrl, newCartId } = await request.json();

        if (!cartIdFromUrl) {
            return NextResponse.json({ message: "Original cart identifier from URL is required." }, { status: 400 });
        }
        if (!newCartId) {
            return NextResponse.json({ message: "A new, active cart ID is required." }, { status: 400 });
        }

        const orderQueryString = `note:"reorder_token:${cartIdFromUrl}"`;

        const orderResponse = await shopifyAdminRequest(GET_ORDER_BY_NOTE_QUERY, { query: orderQueryString });

        const orderData = orderResponse.data?.orders?.edges?.[0]?.node;

        if (!orderData) {
            return NextResponse.json({ message: "Could not find a previous order associated with this link." }, { status: 404 });
        }

        if (orderData.customer?.id !== session.user.shopifyCustomerId) {
            return NextResponse.json({ message: "You are not authorized to reorder these items." }, { status: 403 });
        }

        const lineItemsFromOrder = orderData.lineItems.edges;
        if (!lineItemsFromOrder || lineItemsFromOrder.length === 0) {
            return NextResponse.json({ message: "No items found in the previous order to reorder." }, { status: 404 });
        }

        const newCartLines = lineItemsFromOrder.map((edge: any) => {
            if (!edge.node.variant?.id) {
                console.warn("Skipping line item from previous order with missing variant ID:", edge.node);
                return null;
            }

            // Copy existing attributes
            const attributes = edge.node.customAttributes.map((attr: { key: string; value: string }) => ({
                key: attr.key,
                value: attr.value,
            }));

            // **THE FIX**: Check if FocalProductType attribute exists. If not, infer it.
            const hasProductTypeAttr = attributes.some((attr:any) => attr.key === 'FocalProductType');

            if (!hasProductTypeAttr) {
                // Infer if it's a contact lens based on other common attributes
                const isContactLens = attributes.some((attr:any) => attr.key.includes('(OD)') || attr.key.includes('(OS)') || attr.key === 'Eye');
                if (isContactLens) {
                    attributes.push({ key: 'FocalProductType', value: 'ContactLenses' });
                }
                
                // Infer if it's eyeglasses
                const isEyeglasses = attributes.some((attr:any) => attr.key === 'Rx Method' || attr.key === 'Frame');
                if (isEyeglasses) {
                    attributes.push({ key: 'FocalProductType', value: 'Eyeglasses' });
                }
            }

            return {
                merchandiseId: edge.node.variant.id,
                quantity: edge.node.quantity,
                attributes: attributes, // Use the potentially modified attributes array
            };
        }).filter(Boolean);


        if (newCartLines.length === 0) {
            return NextResponse.json({ message: "No valid items could be reordered from the previous order." }, { status: 400 });
        }

        const addLinesResponse = await storeFront(
            CART_LINES_ADD_MUTATION,
            {
                cartId: newCartId,
                lines: newCartLines,
            },
            session.shopifyAccessToken
        );

        if (addLinesResponse.data?.cartLinesAdd?.userErrors?.length > 0) {
             const errorMessage = addLinesResponse.data.cartLinesAdd.userErrors.map((e: any) => e.message).join(", ");
             throw new Error(`Failed to add items to cart: ${errorMessage}`);
        }

        if (!addLinesResponse.data?.cartLinesAdd?.cart) {
            throw new Error("Failed to add items to the new cart. The cart may no longer be valid.");
        }

        return NextResponse.json({ success: true, cart: addLinesResponse.data.cartLinesAdd.cart });

    } catch (error: any) {
        console.error("[API Reorder] Error:", error.message);
        return NextResponse.json({ message: error.message || "An internal server error occurred." }, { status: 500 });
    }
}
