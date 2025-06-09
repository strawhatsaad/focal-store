// src/app/api/checkout/order-status/route.ts
import { NextResponse } from 'next/server';
import { shopifyAdminRequest, DRAFT_ORDER_STATUS_QUERY } from '../../../../../utils';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const draftOrderId = searchParams.get('id');

  if (!draftOrderId) {
    return NextResponse.json({ message: 'Draft Order ID is required' }, { status: 400 });
  }

  try {
    const response = await shopifyAdminRequest(DRAFT_ORDER_STATUS_QUERY, { id: draftOrderId });
    
    const status = response.data?.draftOrder?.status;

    const isCompleted = status === 'COMPLETED';

    return NextResponse.json({ isCompleted, status });
  } catch (error: any) {
    console.error(`[Order Status] Failed to fetch status for draft order ${draftOrderId}:`, error);
    return NextResponse.json({ message: `Failed to fetch order status: ${error.message}` }, { status: 500 });
  }
}
