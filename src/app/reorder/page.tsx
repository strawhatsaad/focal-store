"use client";

import { useEffect, Suspense, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { Loader2, AlertCircle } from 'lucide-react';

function ReorderPageContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { cartId, fetchCart } = useCart();
    const [error, setError] = useState<string | null>(null);
    const [statusMessage, setStatusMessage] = useState('Recreating your order, please wait...');

    useEffect(() => {
        const reorderOrderId = searchParams.get('order_id');

        if (!reorderOrderId) {
            setError('No order ID provided. Redirecting to your account...');
            setTimeout(() => router.push('/account/orders'), 3000);
            return;
        }

        if (!cartId) {
            // Wait for cartId to be initialized by CartProvider
            setStatusMessage('Initializing your cart...');
            return;
        }

        const reorder = async () => {
            try {
                setStatusMessage('Fetching previous order details...');
                const response = await fetch('/api/reorder', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ orderId: reorderOrderId, cartId: cartId }),
                });

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result.message || 'Failed to recreate the order.');
                }

                setStatusMessage('Adding items to your cart...');
                await fetchCart(cartId); // Refresh the cart data

                setStatusMessage('Redirecting to your cart...');
                router.push('/cart');

            } catch (err: any) {
                setError(err.message);
                setStatusMessage('Could not recreate order.');
            }
        };

        reorder();
    }, [searchParams, router, cartId, fetchCart]);

    return (
        <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50 p-4 text-center">
            {error ? (
                <>
                    <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
                    <h1 className="text-2xl font-semibold text-gray-800 mb-2">Error</h1>
                    <p className="text-gray-600">{error}</p>
                    <button onClick={() => router.push('/account/orders')} className="mt-6 px-6 py-2 bg-black text-white rounded-md">
                        Back to Orders
                    </button>
                </>
            ) : (
                <>
                    <Loader2 className="h-16 w-16 animate-spin text-black mb-4" />
                    <h1 className="text-2xl font-semibold text-gray-800">Processing Your &ldquo;Buy Again&rdquo; Request</h1>
                    <p className="text-gray-600 mt-2">{statusMessage}</p>
                </>
            )}
        </div>
    );
}

// Suspense boundary for useSearchParams is crucial for Next.js App Router
export default function ReorderPage() {
    return (
        <Suspense fallback={
            <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50 p-4 text-center">
                <Loader2 className="h-16 w-16 animate-spin text-black mb-4" />
                <h1 className="text-2xl font-semibold text-gray-800">Loading...</h1>
            </div>
        }>
            <ReorderPageContent />
        </Suspense>
    );
}
