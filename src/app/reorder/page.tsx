// File: src/app/reorder/page.tsx
"use client";

import { useEffect, Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { Loader2 } from 'lucide-react';

function ReorderPageContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { cartId, fetchCart } = useCart();
    const [statusMessage, setStatusMessage] = useState('Recreating your order, please wait...');

    useEffect(() => {
        const reorderCartId = searchParams.get('cart_link_id');

        if (!reorderCartId) {
            // If the reorder ID is missing, just go straight to the cart.
            router.push('/cart');
            return;
        }

        if (!cartId) {
            // Wait for the cart to be initialized before proceeding
            setStatusMessage('Initializing your cart...');
            return;
        }

        const reorder = async () => {
            try {
                setStatusMessage('Finding previous order...');
                const response = await fetch('/api/reorder', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ cartIdFromUrl: reorderCartId, newCartId: cartId }),
                });

                if (!response.ok) {
                    const result = await response.json();
                    console.warn('Reorder API failed but proceeding to cart.', result.message);
                }
                
                setStatusMessage('Updating cart...');
                await fetchCart(cartId); // Refresh the cart state with potentially new items

            } catch (err: any) {
                console.error("A critical error occurred during reorder:", err.message);
            } finally {
                // **THE FIX**: Always redirect to the cart page after the attempt.
                setStatusMessage('Redirecting to your cart...');
                router.push('/cart');
            }
        };

        reorder();
        // The dependency array ensures this runs only once when cartId becomes available.
    }, [searchParams, router, cartId, fetchCart]);

    // This page will only show a loading state, as it always redirects.
    return (
        <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50 p-4 text-center">
            <Loader2 className="h-16 w-16 animate-spin text-black mb-4" />
            <h1 className="text-2xl font-semibold text-gray-800">Please Wait</h1>
            <p className="text-gray-600 mt-2">{statusMessage}</p>
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