// File: src/app/api/account/status/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { shopifyAdminRequest } from "../../../../../utils";

// This query is lightweight and only asks for the number of orders.
const CUSTOMER_ORDER_COUNT_QUERY = `
  query customerOrderCount($id: ID!) {
    customer(id: $id) {
      numberOfOrders
    }
  }
`;

export async function GET(request: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.shopifyCustomerId) {
        return NextResponse.json({ isFirstTimeCustomer: true });
    }

    try {
        const variables = { id: session.user.shopifyCustomerId };
        const response = await shopifyAdminRequest(CUSTOMER_ORDER_COUNT_QUERY, variables);
        
        const customerData = response.data?.customer;

        if (customerData === null) {
            console.warn(`[API Status] Customer with Shopify ID ${session.user.shopifyCustomerId} not found in Shopify. Returning isFirstTimeCustomer: true`);
            return NextResponse.json({ isFirstTimeCustomer: true });
        }
        
        if (customerData && typeof customerData.numberOfOrders !== 'undefined') {
            const numberOfOrders = parseInt(String(customerData.numberOfOrders), 10);

            if (!isNaN(numberOfOrders)) {
                const isFirstTime = numberOfOrders === 0;
                return NextResponse.json({ isFirstTimeCustomer: isFirstTime });
            }
        }
        
        console.error("[API Status] Could not determine a valid number for order count. Response:", customerData);
        return NextResponse.json({ isFirstTimeCustomer: false, error: "Could not determine order count." });

    } catch (error: any) {
        console.error("[API Status] Error:", error.message);
        return NextResponse.json({ isFirstTimeCustomer: false, message: 'Failed to fetch customer status' }, { status: 500 });
    }
}
