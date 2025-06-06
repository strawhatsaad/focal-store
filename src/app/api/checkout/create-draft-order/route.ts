// File: src/app/api/checkout/create-draft-order/route.ts
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { createShopifyDraftOrder } from "../../../../../utils";

const parsePriceToFloat = (priceStr: string | number | undefined | null): number => {
    if (priceStr === null || priceStr === undefined) return 0.0;
    if (typeof priceStr === 'number') return isNaN(priceStr) ? 0.0 : priceStr;
    const numericString = String(priceStr).replace(/[^0-9.]/g, "");
    const parsed = parseFloat(numericString);
    return isNaN(parsed) ? 0.0 : parsed;
};

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);

    try {
        const { lineItems, customerInfo, cartToken } = await request.json();

        if (!lineItems || !Array.isArray(lineItems) || lineItems.length === 0) {
            return Response.json({ message: "Line items are required." }, { status: 400 });
        }

        const draftOrderLineItems = lineItems.map((item: any) => {
            if (!item.variantId || typeof item.customizedPrice === 'undefined' || !item.quantity || !item.title) {
                throw new Error("Each line item must have variantId, title, quantity, and customizedPrice.");
            }
            const unitPrice = parsePriceToFloat(item.customizedPrice);
            return {
                variantId: item.variantId,
                quantity: parseInt(item.quantity, 10),
                originalUnitPrice: unitPrice.toFixed(2),
                customAttributes: item.attributes || [],
                title: item.title,
                requiresShipping: typeof item.requiresShipping === 'boolean' ? item.requiresShipping : true,
                ...(item.sku && { sku: item.sku }),
            };
        });

        const draftOrderInput: any = {
            lineItems: draftOrderLineItems,
        };
        
        // **FIX**: Store the reorder identifier in the order's note field.
        if (cartToken) {
            draftOrderInput.note = `reorder_token:${cartToken}`;
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
            const userErrors = shopifyResponse.data?.draftOrderCreate?.userErrors;
            let errorMessage = "Failed to create draft order.";
            if (userErrors?.length > 0) {
                errorMessage = userErrors.map((e: any) => e.message).join("; ");
            }
            throw new Error(errorMessage);
        }

    } catch (error: any) {
        return Response.json({ message: error.message || "Internal Server Error." }, { status: 500 });
    }
}