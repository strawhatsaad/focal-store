// File: src/context/CartContext.tsx
"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import {
  createShopifyCart,
  getShopifyCart,
  addLinesToShopifyCart,
  updateLinesInShopifyCart,
  removeLinesFromShopifyCart,
} from "../../utils/index"; // Assuming utils/index.js is in src/utils

// Define types for Cart and Line Items based on your Shopify Storefront API structure
// These are simplified; you might want to make them more detailed.
interface CartImage {
  url: string;
  altText?: string | null;
}

interface CartPrice {
  amount: string;
  currencyCode: string;
}

interface CartMerchandise {
  id: string; // ProductVariant ID
  title: string; // Variant title
  priceV2: CartPrice;
  image?: CartImage | null;
  product: {
    title: string;
    handle: string;
  };
}

interface CartLineNode {
  id: string; // Line item ID
  quantity: number;
  merchandise: CartMerchandise;
  attributes: Array<{ key: string; value: string }>;
}

interface CartLineEdge {
  node: CartLineNode;
}

export interface ShopifyCart {
  id: string;
  checkoutUrl: string;
  cost: {
    subtotalAmount: CartPrice;
    totalAmount: CartPrice;
    totalTaxAmount?: CartPrice | null;
  };
  lines: {
    edges: CartLineEdge[];
  };
  totalQuantity: number;
}

interface CartContextType {
  cart: ShopifyCart | null;
  cartId: string | null;
  loading: boolean;
  error: string | null;
  createCart: () => Promise<void>;
  fetchCart: (id: string) => Promise<void>;
  addLineItem: (
    merchandiseId: string,
    quantity: number,
    attributes?: Array<{ key: string; value: string }>
  ) => Promise<boolean>;
  updateLineItem: (lineId: string, quantity: number) => Promise<boolean>;
  removeLineItem: (lineId: string) => Promise<boolean>;
  clearCartError: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cart, setCart] = useState<ShopifyCart | null>(null);
  const [cartId, setCartId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const clearCartError = () => setError(null);

  // Load cartId from localStorage on initial mount
  useEffect(() => {
    const storedCartId = localStorage.getItem("shopify_cart_id");
    if (storedCartId) {
      setCartId(storedCartId);
      fetchCart(storedCartId);
    } else {
      // If no cart ID, we might create one immediately or wait for an action
      // createCart(); // Optionally create a cart immediately
      setLoading(false); // No cart to load initially
    }
  }, []);

  const fetchCart = useCallback(async (id: string) => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const response = await getShopifyCart(id);
      if (response?.data?.cart) {
        setCart(response.data.cart);
        setCartId(response.data.cart.id);
        localStorage.setItem("shopify_cart_id", response.data.cart.id);
      } else if (response?.errors || !response?.data?.cart) {
        // Cart might not exist (e.g., expired or invalid ID)
        console.warn(
          "Failed to fetch cart, or cart does not exist:",
          response?.errors
        );
        localStorage.removeItem("shopify_cart_id"); // Clear invalid cart ID
        setCart(null);
        setCartId(null);
        // Optionally create a new cart here if the old one was invalid
        // await createCart();
      }
    } catch (err: any) {
      console.error("Error fetching cart:", err);
      setError(err.message || "Failed to fetch cart.");
      // If fetching fails for an existing ID, it might be invalid
      localStorage.removeItem("shopify_cart_id");
      setCart(null);
      setCartId(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const createCart = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await createShopifyCart({}); // Create an empty cart
      if (response.data?.cartCreate?.cart) {
        const newCart = response.data.cartCreate.cart;
        setCart(newCart);
        setCartId(newCart.id);
        localStorage.setItem("shopify_cart_id", newCart.id);
        console.log("New cart created:", newCart.id);
      } else {
        throw new Error(
          response.data?.cartCreate?.userErrors?.[0]?.message ||
            "Failed to create cart."
        );
      }
    } catch (err: any) {
      console.error("Error creating cart:", err);
      setError(err.message || "Failed to create cart.");
    } finally {
      setLoading(false);
    }
  };

  const addLineItem = async (
    merchandiseId: string,
    quantity: number,
    attributes?: Array<{ key: string; value: string }>
  ) => {
    setLoading(true);
    setError(null);
    let currentCartId: any = cartId;

    if (!currentCartId) {
      try {
        const createResponse = await createShopifyCart({});
        if (createResponse.data?.cartCreate?.cart) {
          currentCartId = createResponse.data.cartCreate.cart.id;
          setCart(createResponse.data.cartCreate.cart);
          setCartId(currentCartId);
          localStorage.setItem("shopify_cart_id", currentCartId);
        } else {
          throw new Error(
            createResponse.data?.cartCreate?.userErrors?.[0]?.message ||
              "Failed to create cart before adding item."
          );
        }
      } catch (err: any) {
        console.error("Error creating cart for addLineItem:", err);
        setError(err.message || "Failed to initialize cart.");
        setLoading(false);
        return false;
      }
    }

    if (!currentCartId) {
      // Should not happen if creation was successful
      setError("Cart ID is missing.");
      setLoading(false);
      return false;
    }

    try {
      const lines = [{ merchandiseId, quantity, attributes }];
      const response = await addLinesToShopifyCart(currentCartId, lines);
      if (response.data?.cartLinesAdd?.cart) {
        setCart(response.data.cartLinesAdd.cart);
        setLoading(false);
        return true;
      } else {
        throw new Error(
          response.data?.cartLinesAdd?.userErrors?.[0]?.message ||
            "Failed to add item to cart."
        );
      }
    } catch (err: any) {
      console.error("Error adding line item:", err);
      setError(err.message || "Failed to add item.");
      setLoading(false);
      return false;
    }
  };

  const updateLineItem = async (lineId: string, quantity: number) => {
    if (!cartId) {
      setError("Cart ID is missing.");
      return false;
    }
    if (quantity <= 0) {
      // Shopify typically handles removal for quantity 0, but explicit remove is cleaner
      return removeLineItem(lineId);
    }
    setLoading(true);
    setError(null);
    try {
      const lines = [{ id: lineId, quantity }];
      const response = await updateLinesInShopifyCart(cartId, lines);
      if (response.data?.cartLinesUpdate?.cart) {
        setCart(response.data.cartLinesUpdate.cart);
        setLoading(false);
        return true;
      } else {
        throw new Error(
          response.data?.cartLinesUpdate?.userErrors?.[0]?.message ||
            "Failed to update item in cart."
        );
      }
    } catch (err: any) {
      console.error("Error updating line item:", err);
      setError(err.message || "Failed to update item.");
      setLoading(false);
      return false;
    }
  };

  const removeLineItem = async (lineId: string) => {
    if (!cartId) {
      setError("Cart ID is missing.");
      return false;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await removeLinesFromShopifyCart(cartId, [lineId]);
      if (response.data?.cartLinesRemove?.cart) {
        setCart(response.data.cartLinesRemove.cart);
        setLoading(false);
        return true;
      } else {
        throw new Error(
          response.data?.cartLinesRemove?.userErrors?.[0]?.message ||
            "Failed to remove item from cart."
        );
      }
    } catch (err: any) {
      console.error("Error removing line item:", err);
      setError(err.message || "Failed to remove item.");
      setLoading(false);
      return false;
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        cartId,
        loading,
        error,
        createCart,
        fetchCart,
        addLineItem,
        updateLineItem,
        removeLineItem,
        clearCartError,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
