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
        const { lineItems, customerInfo } = await request.json();

        if (!lineItems || !Array.isArray(lineItems) || lineItems.length === 0) {
            return Response.json({ message: "Line items are required." }, { status: 400 });
        }

        const draftOrderLineItems = lineItems.map((item: any) => {
            // item from frontend should include:
            // item.variantId (Shopify Product Variant GID, was item.merchandiseId)
            // item.quantity
            // item.customizedPrice (final price for this item including customizations)
            // item.attributes (array of {key, value})
            // item.title (descriptive title from cart)

            if (!item.variantId || typeof item.customizedPrice === 'undefined' || !item.quantity || !item.title) {
                console.error("[API CreateDraftOrder] Invalid line item data received:", item);
                // Depending on desired behavior, you might throw an error or filter out invalid items.
                // For this example, we'll throw, assuming valid items are expected.
                throw new Error("Each line item must have variantId, title, quantity, and customizedPrice.");
            }

            const unitPrice = parsePriceToFloat(item.customizedPrice);

            const lineItemPayload: any = {
                variantId: item.variantId, // *** Crucial: Pass the Shopify Product Variant GID ***
                quantity: parseInt(item.quantity, 10),
                originalUnitPrice: unitPrice.toFixed(2), // Your custom price for this item
                customAttributes: item.attributes || [], // Lens options, Rx details, etc.
                title: item.title, // Custom title for display (Shopify might use variant's title by default)
                requiresShipping: typeof item.requiresShipping === 'boolean' ? item.requiresShipping : true,
            };
            
            // Include SKU if available and needed, though variantId is primary
            if (item.sku) {
                lineItemPayload.sku = item.sku;
            }

            return lineItemPayload;
        });

        const draftOrderInput: any = {
            lineItems: draftOrderLineItems,
        };

        if (session?.user?.shopifyCustomerId) {
            draftOrderInput.customerId = session.user.shopifyCustomerId;
            console.log(`[API CreateDraftOrder] Associating draft order with customerId: ${session.user.shopifyCustomerId}`);
        } else if (customerInfo?.email) {
            // If customer is not logged in but provides email (e.g. guest checkout)
            draftOrderInput.email = customerInfo.email;
             if (customerInfo.firstName && customerInfo.lastName) {
                draftOrderInput.shippingAddress = { // Example: apply to shipping, billing as needed
                    firstName: customerInfo.firstName,
                    lastName: customerInfo.lastName,
                    // Add other address fields if collected
                };
            }
            console.log(`[API CreateDraftOrder] Creating draft order for guest with email: ${customerInfo.email}`);
        }
        // Note: You might also want to add shippingAddress and billingAddress to draftOrderInput
        // if you collect that before this step.

        console.log("[API CreateDraftOrder] Creating draft order with input:", JSON.stringify(draftOrderInput, null, 2));

        const shopifyResponse = await createShopifyDraftOrder(draftOrderInput);

        if (shopifyResponse.data?.draftOrderCreate?.draftOrder?.invoiceUrl) {
            const draftOrder = shopifyResponse.data.draftOrderCreate.draftOrder;
            console.log(`[API CreateDraftOrder] Draft order created successfully. ID: ${draftOrder.id}, Invoice URL: ${draftOrder.invoiceUrl}, Total: ${draftOrder.totalPriceSet?.presentmentMoney?.amount}`);
            
            // Log the line items from the Shopify response to check for images
            if (draftOrder.lineItems && draftOrder.lineItems.edges) {
                console.log("[API CreateDraftOrder] Line items from Shopify response:");
                draftOrder.lineItems.edges.forEach((edge: any, index: number) => {
                    console.log(`  Item ${index + 1}:`);
                    console.log(`    Title: ${edge.node.title}`);
                    console.log(`    Variant Title: ${edge.node.variantTitle}`); // Title of the original variant
                    console.log(`    Variant ID: ${edge.node.variant?.id}`);
                    console.log(`    Variant Image URL: ${edge.node.variant?.image?.url || 'No variant image in response'}`);
                    console.log(`    Line Item Direct Image URL: ${edge.node.image?.url || 'No direct line item image in response'}`);
                });
            }
            
            return Response.json({ invoiceUrl: draftOrder.invoiceUrl, draftOrderId: draftOrder.id });
        } else {
            console.error("[API CreateDraftOrder] Failed to create draft order or invoiceUrl missing. Response:", JSON.stringify(shopifyResponse, null, 2));
            const userErrors = shopifyResponse.data?.draftOrderCreate?.userErrors;
            // More robust error message construction
            let errorMessage = "Failed to create draft order.";
            if (userErrors && userErrors.length > 0) {
                errorMessage = userErrors.map((e: any) => `${e.field ? e.field.join(', ') + ': ' : ''}${e.message}`).join("; ");
            } else if (shopifyResponse.errors && shopifyResponse.errors.length > 0) { // General GraphQL errors
                errorMessage = shopifyResponse.errors.map((e: any) => e.message).join("; ");
            }
            throw new Error(errorMessage);
        }

    } catch (error: any) {
        console.error("[API CreateDraftOrder] Outer catch block error:", error.message, error.stack);
        return Response.json({ message: error.message || "Internal Server Error while creating draft order." }, { status: 500 });
    }
}
