// File: src/app/reorder/page.tsx
"use client";

import { useEffect, Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { Loader2 } from 'lucide-react'; // AlertCircle is no longer needed

function ReorderPageContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { cartId, fetchCart } = useCart();
    const [statusMessage, setStatusMessage] = useState('Initializing your cart...');
    const [hasStarted, setHasStarted] = useState(false); // Flag to ensure the process runs only once

    useEffect(() => {
        const reorderCartId = searchParams.get('cart_link_id');

        // Exit if the process has already started or if we're waiting for the cart
        if (hasStarted || !cartId) {
            return;
        }

        // If for some reason the ID is missing, just go to the cart page.
        if (!reorderCartId) {
            router.push('/cart');
            return;
        }

        // Set the flag immediately to prevent this effect from running again
        setHasStarted(true);

        const reorder = async () => {
            try {
                setStatusMessage('Finding previous order...');
                await fetch('/api/reorder', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ cartIdFromUrl: reorderCartId, newCartId: cartId }),
                });

                // Per your request, we don't need to check the response.
                // We'll proceed to the cart page regardless.
                
                setStatusMessage('Updating your cart...');
                await fetchCart(cartId); // Refresh cart state with new items

            } catch (err: any) {
                // Log any critical network errors but don't show them to the user
                console.error("A critical error occurred during reorder:", err.message);
            } finally {
                // **THE FIX**: Always redirect to the cart page after the attempt.
                // The user will see their populated cart, which is the desired outcome.
                router.push('/cart');
            }
        };

        reorder();
    
    // The dependency array is carefully constructed to run this logic once cartId is available.
    }, [router, cartId, fetchCart, hasStarted, searchParams]);

    // This page will now only show a loading state, as it will always redirect.
    return (
        <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50 p-4 text-center">
            <Loader2 className="h-16 w-16 animate-spin text-black mb-4" />
            <h1 className="text-2xl font-semibold text-gray-800">Please Wait</h1>
            <p className="text-gray-600 mt-2">{statusMessage}</p>
        </div>
    );
}

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
