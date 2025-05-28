// File: src/app/api/checkout/create-draft-order/route.ts
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions"; // Adjust path
import { createShopifyDraftOrder } from "../../../../../utils"; // Adjust path

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
        const { lineItems, customerInfo } = await request.json();

        if (!lineItems || !Array.isArray(lineItems) || lineItems.length === 0) {
            return Response.json({ message: "Line items are required." }, { status: 400 });
        }

        const draftOrderLineItems = lineItems.map((item: any) => {
            if (typeof item.customizedPrice === 'undefined' || !item.quantity || !item.title) {
                console.error("Invalid line item data for custom item:", item);
                throw new Error("Each custom line item must have at least title, quantity, and customizedPrice.");
            }

            const unitPrice = parsePriceToFloat(item.customizedPrice);

            const lineItemPayload: any = {
                title: item.title,
                quantity: parseInt(item.quantity, 10),
                originalUnitPrice: unitPrice.toFixed(2), // CORRECTED: Use originalUnitPrice for custom items too
                customAttributes: item.attributes || [],
                requiresShipping: typeof item.requiresShipping === 'boolean' ? item.requiresShipping : true,
            };

            if (item.sku) {
                lineItemPayload.sku = item.sku;
            }

            // No variantId is provided, making this a custom line item.
            // Shopify will use the title and originalUnitPrice provided.

            return lineItemPayload;
        });

        const draftOrderInput: any = {
            lineItems: draftOrderLineItems,
        };

        if (session?.user?.shopifyCustomerId) {
            draftOrderInput.customerId = session.user.shopifyCustomerId;
            console.log(`[API CreateDraftOrder] Associating draft order with customerId: ${session.user.shopifyCustomerId}`);
        } else if (customerInfo?.email) {
            draftOrderInput.email = customerInfo.email;
            console.log(`[API CreateDraftOrder] Creating draft order for guest with email: ${customerInfo.email}`);
        }

        console.log("[API CreateDraftOrder] Creating draft order with (custom item) input:", JSON.stringify(draftOrderInput, null, 2));

        const shopifyResponse = await createShopifyDraftOrder(draftOrderInput);

        if (shopifyResponse.data?.draftOrderCreate?.draftOrder?.invoiceUrl) {
            const draftOrder = shopifyResponse.data.draftOrderCreate.draftOrder;
            console.log(`[API CreateDraftOrder] Draft order created successfully. ID: ${draftOrder.id}, Invoice URL: ${draftOrder.invoiceUrl}, Total: ${draftOrder.totalPriceSet?.presentmentMoney?.amount}`);
            return Response.json({ invoiceUrl: draftOrder.invoiceUrl, draftOrderId: draftOrder.id });
        } else {
            console.error("[API CreateDraftOrder] Failed to create draft order or invoiceUrl missing. Response:", JSON.stringify(shopifyResponse, null, 2));
            const userErrors = shopifyResponse.data?.draftOrderCreate?.userErrors;
            const errorMessage = userErrors?.map((e: any) => e.message).join(", ") || "Failed to create draft order.";
            throw new Error(errorMessage);
        }

    } catch (error: any) {
        console.error("[API CreateDraftOrder] Error creating draft order:", error.message);
        return Response.json({ message: error.message || "Internal Server Error while creating draft order." }, { status: 500 });
    }
}
