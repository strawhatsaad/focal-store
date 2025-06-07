// src/context/WishlistContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { MappedProduct } from '@/types/product'; // We'll create this type definition

interface WishlistContextType {
  wishlist: MappedProduct[];
  addToWishlist: (product: MappedProduct) => void;
  removeFromWishlist: (productId: string) => void;
  isProductInWishlist: (productId: string) => boolean;
  loading: boolean;
  itemCount: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const { data: session, status } = useSession();
  const [wishlist, setWishlist] = useState<MappedProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = useCallback(async () => {
    if (status === 'authenticated') {
      setLoading(true);
      try {
        const response = await fetch('/api/account/wishlist');
        if (response.ok) {
          const data = await response.json();
          setWishlist(data.wishlist || []);
        } else {
          console.error('Failed to fetch wishlist');
          setWishlist([]);
        }
      } catch (error) {
        console.error('Error fetching wishlist:', error);
        setWishlist([]);
      } finally {
        setLoading(false);
      }
    } else if (status === 'unauthenticated') {
      // For guests, load from localStorage
      const localWishlist = localStorage.getItem('focal-wishlist');
      setWishlist(localWishlist ? JSON.parse(localWishlist) : []);
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const updateWishlist = async (newWishlist: MappedProduct[]) => {
    setWishlist(newWishlist);
    if (status === 'authenticated') {
      await fetch('/api/account/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wishlist: newWishlist }),
      });
    } else {
      localStorage.setItem('focal-wishlist', JSON.stringify(newWishlist));
    }
  };

  const addToWishlist = (product: MappedProduct) => {
    const newWishlist = [...wishlist, product];
    updateWishlist(newWishlist);
  };

  const removeFromWishlist = (productId: string) => {
    const newWishlist = wishlist.filter((item) => item.id !== productId);
    updateWishlist(newWishlist);
  };

  const isProductInWishlist = (productId: string) => {
    return wishlist.some((item) => item.id === productId);
  };

  const itemCount = wishlist.length;

  return (
    <WishlistContext.Provider
      value={{ wishlist, addToWishlist, removeFromWishlist, isProductInWishlist, loading, itemCount }}
    >
      {children}
    </WishlistContext.Provider>
  );
};
