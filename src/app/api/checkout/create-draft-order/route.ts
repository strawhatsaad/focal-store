// File: src/app/api/checkout/create-draft-order/route.ts
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions"; // Adjust path if necessary
import { createShopifyDraftOrder } from "../../../../../utils"; // Adjust path if necessary

// Helper to parse price string to float, robustly
const parsePriceToFloat = (priceStr: string | number | undefined | null): number => {
    if (priceStr === null || priceStr === undefined) return 0.0;
    if (typeof priceStr === 'number') return isNaN(priceStr) ? 0.0 : priceStr;
    const numericString = String(priceStr).replace(/[^0-9.]/g, ""); // Allow dot for decimals
    const parsed = parseFloat(numericString);
    return isNaN(parsed) ? 0.0 : parsed;
};


export async function POST(request: Request) {
    const session = await getServerSession(authOptions);

    try {
        const { lineItems, customerInfo, cartToken } = await request.json(); // Using cartToken

        if (!lineItems || !Array.isArray(lineItems) || lineItems.length === 0) {
            return Response.json({ message: "Line items are required." }, { status: 400 });
        }

        const draftOrderLineItems = lineItems.map((item: any) => {
            if (!item.variantId || typeof item.customizedPrice === 'undefined' || !item.quantity || !item.title) {
                throw new Error("Each line item must have variantId, title, quantity, and customizedPrice.");
            }

            const unitPrice = parsePriceToFloat(item.customizedPrice);

            const lineItemPayload: any = {
                variantId: item.variantId,
                quantity: parseInt(item.quantity, 10),
                originalUnitPrice: unitPrice.toFixed(2),
                customAttributes: item.attributes || [],
                title: item.title,
                requiresShipping: typeof item.requiresShipping === 'boolean' ? item.requiresShipping : true,
            };
            
            if (item.sku) {
                lineItemPayload.sku = item.sku;
            }

            return lineItemPayload;
        });

        const draftOrderInput: any = {
            lineItems: draftOrderLineItems,
        };

        // Add a shortened, unique tag for future reordering.
        if (cartToken) {
            // Shopify tags have a 40 character limit. A cart token can be ~35 chars.
            // We create a shorter, prefixed tag to be safe and specific.
            const uniquePart = cartToken.substring(cartToken.length - 16); // Get the last 16 chars for uniqueness
            const reorderTag = `reorder-id-${uniquePart}`; // e.g., reorder-id-a1b2c3d4e5f6g7h8. Total length is 27 chars.
            draftOrderInput.tags = [reorderTag];
        }

        if (session?.user?.shopifyCustomerId) {
            draftOrderInput.customerId = session.user.shopifyCustomerId;
        } else if (customerInfo?.email) {
            draftOrderInput.email = customerInfo.email;
             if (customerInfo.firstName && customerInfo.lastName) {
                draftOrderInput.shippingAddress = { 
                    firstName: customerInfo.firstName,
                    lastName: customerInfo.lastName,
                };
            }
        }

        const shopifyResponse = await createShopifyDraftOrder(draftOrderInput);

        if (shopifyResponse.data?.draftOrderCreate?.draftOrder?.invoiceUrl) {
            const draftOrder = shopifyResponse.data.draftOrderCreate.draftOrder;
            return Response.json({ invoiceUrl: draftOrder.invoiceUrl, draftOrderId: draftOrder.id });
        } else {
            console.error("[API CreateDraftOrder] Failed to create draft order. Response:", JSON.stringify(shopifyResponse, null, 2));
            const userErrors = shopifyResponse.data?.draftOrderCreate?.userErrors;
            let errorMessage = "Failed to create draft order.";
            if (userErrors && userErrors.length > 0) {
                errorMessage = userErrors.map((e: any) => `${e.field ? e.field.join(', ') + ': ' : ''}${e.message}`).join("; ");
            } else if (shopifyResponse.errors && shopifyResponse.errors.length > 0) {
                errorMessage = shopifyResponse.errors.map((e: any) => e.message).join("; ");
            }
            throw new Error(errorMessage);
        }

    } catch (error: any) {
        console.error("[API CreateDraftOrder] Outer catch block error:", error.message, error.stack);
        return Response.json({ message: error.message || "Internal Server Error while creating draft order." }, { status: 500 });
    }
}
