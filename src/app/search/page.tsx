// src/app/search/page.tsx
"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2, Search, Package } from 'lucide-react';
import ProductsSection from '@/sections/Products/Products';
import { MappedProduct } from '@/types/product';
import { useCart } from '@/context/CartContext';

function SearchPageContent() {
    const searchParams = useSearchParams();
    const [searchTerm, setSearchTerm] = useState('');
    const [products, setProducts] = useState<MappedProduct[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const { isFirstTimeCustomer } = useCart();

    const query = searchParams.get('q');

    useEffect(() => {
        if (query) {
            setSearchTerm(query);
            performSearch(query);
        }
    }, [query]);

    const performSearch = async (currentSearchTerm: string) => {
        if (!currentSearchTerm.trim()) {
            setProducts([]);
            setSearched(true);
            return;
        }
        setIsLoading(true);
        setSearched(true);
        try {
            const response = await fetch(`/api/products/search?q=${encodeURIComponent(currentSearchTerm)}`);
            if (response.ok) {
                const data = await response.json();
                setProducts(data.products || []);
            } else {
                setProducts([]);
            }
        } catch (error) {
            console.error('Search error:', error);
            setProducts([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        window.history.pushState(null, '', `?q=${encodeURIComponent(searchTerm)}`);
        performSearch(searchTerm);
    };

    return (
        <main className="min-h-screen bg-gray-50 py-8 sm:py-12">
            <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                <header className="mb-8 text-center">
                    <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900">
                        Search Products
                    </h1>
                    <p className="mt-3 text-lg text-gray-600">
                        Find eyewear, contact lenses, and more.
                    </p>
                </header>

                <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-10">
                    <div className="relative">
                        <input
                            type="search"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search by product name or tag"
                            className="w-full pl-12 pr-4 py-3 text-base border-gray-300 rounded-lg shadow-sm focus:ring-black focus:border-black"
                        />
                        <button type="submit" className="absolute left-4 top-1/2 -translate-y-1/2">
                           <Search className="h-5 w-5 text-gray-400" />
                        </button>
                    </div>
                </form>

                {isLoading ? (
                    <div className="flex justify-center items-center pt-16">
                        <Loader2 className="h-12 w-12 animate-spin text-black" />
                    </div>
                ) : searched && products.length === 0 ? (
                    <div className="text-center py-16 px-6 bg-white rounded-lg shadow-md">
                        <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-gray-700 mb-2">
                           No Products Found
                        </h2>
                        <p className="text-gray-500">
                           We couldn&apos;t find anything matching &quot;{query}&quot;. Try a different search term.
                        </p>
                    </div>
                ) : products.length > 0 ? (
                    <ProductsSection
                        products={products}
                        heading={`Results for "${query}"`}
                        isFirstTimeCustomer={isFirstTimeCustomer}
                    />
                ) : null}
            </div>
        </main>
    );
}


export default function SearchPage() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center min-h-screen"><Loader2 className="h-12 w-12 animate-spin"/></div>}>
            <SearchPageContent />
        </Suspense>
    );
}
