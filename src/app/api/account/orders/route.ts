// File: src/app/api/account/orders/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { storeFront, GET_CUSTOMER_ORDERS_QUERY } from "../../../../../utils";

export async function GET(request: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !session.shopifyAccessToken) {
        return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    try {
        const response = await storeFront(
            GET_CUSTOMER_ORDERS_QUERY,
            { customerAccessToken: session.shopifyAccessToken, first: 20 },
            session.shopifyAccessToken
        );

        if (response.data?.customer?.orders?.edges) {
            return NextResponse.json({ orders: response.data.customer.orders.edges });
        } else {
            // Handle cases where token might be expired or invalid
            return NextResponse.json({ orders: [], error: "Could not retrieve orders. Session might be invalid." });
        }
    } catch (error: any) {
        console.error("[API Get Orders] Error:", error.message);
        return NextResponse.json({ message: 'Failed to fetch orders' }, { status: 500 });
    }
}
