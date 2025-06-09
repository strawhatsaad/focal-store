// File: src/app/api/checkout/create-draft-order/route.ts
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { createShopifyDraftOrder, shopifyAdminRequest } from "../../../../../utils";
import { NextResponse } from "next/server";

const parsePriceToFloat = (priceStr: string | number | undefined | null): number => {
    if (priceStr === null || priceStr === undefined) return 0.0;
    if (typeof priceStr === 'number') return isNaN(priceStr) ? 0.0 : priceStr;
    const numericString = String(priceStr).replace(/[^0-9.]/g, "");
    const parsed = parseFloat(numericString);
    return isNaN(parsed) ? 0.0 : parsed;
};

// Admin query to check order count
const CUSTOMER_ORDER_COUNT_QUERY = `
  query customerOrderCount($id: ID!) {
    customer(id: $id) {
      numberOfOrders
    }
  }
`;

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    let isFirstTimeCustomer = false;

    try {
        const { lineItems, customerInfo, cartToken } = await request.json();

        if (!lineItems || !Array.isArray(lineItems) || lineItems.length === 0) {
            return Response.json({ message: "Line items are required." }, { status: 400 });
        }

        // Determine if the customer is eligible for the first-time discount
        if (session?.user?.shopifyCustomerId) {
            const orderCountResponse = await shopifyAdminRequest(CUSTOMER_ORDER_COUNT_QUERY, { id: session.user.shopifyCustomerId });
            if (parseInt(String(orderCountResponse.data?.customer?.numberOfOrders), 10) === 0) {
                isFirstTimeCustomer = true;
            }
        } else {
             // Guest users are considered first-time customers
             isFirstTimeCustomer = true;
        }

        const draftOrderLineItems = lineItems.map((item: any) => {
            if (!item.variantId || typeof item.customizedPrice === 'undefined' || !item.quantity || !item.title) {
                throw new Error("Each line item must have variantId, title, quantity, and customizedPrice.");
            }
            
            const originalUnitPrice = parsePriceToFloat(item.customizedPrice);

            return {
                variantId: item.variantId,
                quantity: parseInt(item.quantity, 10),
                originalUnitPrice: originalUnitPrice.toFixed(2), 
                customAttributes: item.attributes || [],
                title: item.title,
                requiresShipping: typeof item.requiresShipping === 'boolean' ? item.requiresShipping : true,
                ...(item.sku && { sku: item.sku }),
            };
        });

        const draftOrderInput: any = {
            lineItems: draftOrderLineItems,
        };
        
        if (cartToken) {
            draftOrderInput.note = `reorder_token:${cartToken}`;
        }

        // Apply an order-level discount if the customer is eligible
        if (isFirstTimeCustomer) {
            draftOrderInput.appliedDiscount = {
                title: "First-Time Customer Discount",
                description: "20% off for your first order!",
                value: 20.0,
                valueType: "PERCENTAGE",
            };
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
            console.error("[Create Draft Order] Shopify User Errors:", userErrors);
            throw new Error(errorMessage);
        }

    } catch (error: any) {
        console.error("[Create Draft Order] Server Error:", error);
        return Response.json({ message: error.message || "Internal Server Error." }, { status: 500 });
    }
}
