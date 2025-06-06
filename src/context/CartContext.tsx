// src/context/CartContext.tsx
"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
  useMemo,
} from "react";
import {
  storeFront,
  CART_CREATE_MUTATION,
  CART_LINES_ADD_MUTATION,
  CART_LINES_UPDATE_MUTATION,
  CART_LINES_REMOVE_MUTATION,
  GET_CART_QUERY,
  CART_BUYER_IDENTITY_UPDATE_MUTATION,
} from "../../utils";
import { useSession } from "next-auth/react";

const DONATION_PRODUCT_VARIANT_ID: any =
  "gid://shopify/ProductVariant/46334706581757";

interface Cart {
  id: string;
  checkoutUrl: string;
  cost: {
    subtotalAmount: { amount: string; currencyCode: string };
    totalAmount: { amount: string; currencyCode: string };
    totalTaxAmount: { amount: string; currencyCode: string } | null;
  };
  lines: {
    edges: {
      node: {
        id: string;
        quantity: number;
        merchandise: {
          id: string;
          title: string;
          priceV2: { amount: string; currencyCode: string };
          image: { url: string; altText: string | null } | null;
          product: { title: string; handle: string };
        };
        attributes: { key: string; value: string }[];
      };
    }[];
  };
  totalQuantity: number;
  buyerIdentity: {
    email: string | null;
    phone: string | null;
    customer: { id: string } | null;
    countryCode: string | null;
  };
  note?: string | null;
}

interface CartContextType {
  cart: Cart | null;
  cartId: string | null;
  loading: boolean;
  isInitializing: boolean;
  error: string | null;
  createCart: () => Promise<string | null>;
  fetchCart: (id: string) => Promise<void>;
  addLineItem: (
    variantId: string,
    quantity: number,
    attributes?: Array<{ key: string; value: string }>
  ) => Promise<boolean>;
  updateLineItem: (lineId: string, quantity: number) => Promise<void>;
  removeLineItem: (lineId: string) => Promise<void>;
  clearCartError: () => void;
  associateCartWithCustomer: (customerAccessToken: string) => Promise<void>;
  itemCount: number;
  clearCartAndCreateNew: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [cartId, setCartId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { data: session } = useSession();

  const clearCartError = () => setError(null);

  const handleShopifyError = (errorData: any, defaultMessage: string): string => {
    if (errorData?.userErrors?.length > 0) {
      return errorData.userErrors.map((e: any) => e.message).join(", ");
    }
    if (errorData?.message) return errorData.message;
    return defaultMessage;
  };

  const checkAndManageDonationProduct = async (currentCart: Cart | null): Promise<Cart | null> => {
    if (!currentCart || !currentCart.id || !currentCart.lines?.edges) return currentCart;
    if (DONATION_PRODUCT_VARIANT_ID === "gid://shopify/ProductVariant/YOUR_DONATION_PRODUCT_VARIANT_ID_HERE") return currentCart;

    const currentLines = currentCart.lines.edges;
    const donationItemLine = currentLines.find(edge => edge.node.merchandise.id === DONATION_PRODUCT_VARIANT_ID);
    
    let qualifyingEyeglassesCount = 0;
    let totalContactLensBoxes = 0;

    currentLines.forEach(edge => {
      if (edge.node.merchandise.id === DONATION_PRODUCT_VARIANT_ID) return;
      const focalProductTypeAttr = edge.node.attributes.find(attr => attr.key === "FocalProductType");
      if (focalProductTypeAttr?.value === "Eyeglasses") qualifyingEyeglassesCount++;
      else if (focalProductTypeAttr?.value === "ContactLenses") totalContactLensBoxes += edge.node.quantity;
    });

    const shouldHaveDonation = (qualifyingEyeglassesCount > 0) || (totalContactLensBoxes >= 4);
    
    if (donationItemLine && !shouldHaveDonation) {
      try {
        const response = await storeFront(CART_LINES_REMOVE_MUTATION, { cartId: currentCart.id, lineIds: [donationItemLine.node.id] });
        if (response.data?.cartLinesRemove?.userErrors?.length > 0) {
          console.error("[CartContext] Error removing donation item:", handleShopifyError(response.data.cartLinesRemove, ""));
          return currentCart; 
        }
        return response.data?.cartLinesRemove?.cart || null; 
      } catch (e: any) {
        console.error("[CartContext] Exception removing donation:", e.message);
        return currentCart; 
      }
    }
    return currentCart; 
  };

  const createCart = useCallback(async (): Promise<string | null> => {
    setLoading(true);
    setError(null);
    try {
      const buyerIdentity: any = {};
      if (session?.user?.email) buyerIdentity.email = session.user.email;
      const response = await storeFront(CART_CREATE_MUTATION, { input: { buyerIdentity } });
      if (response.data?.cartCreate?.cart) {
        const newCart = response.data.cartCreate.cart;
        setCart(newCart);
        setCartId(newCart.id);
        localStorage.setItem("focalCartId", newCart.id);
        return newCart.id;
      } else {
        throw new Error(handleShopifyError(response.data?.cartCreate, "Failed to create cart."));
      }
    } catch (err: any) {
      setError(err.message);
      console.error("Create cart error:", err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [session]);

  const fetchCart = useCallback(async (id: string) => {
    if (!id) {
      setIsInitializing(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await storeFront(GET_CART_QUERY, { id });
      if (response.data?.cart) {
        let updatedCart = await checkAndManageDonationProduct(response.data.cart);
        setCart(updatedCart);
        setCartId(updatedCart?.id || null);
        localStorage.setItem("focalCartId", updatedCart!.id);
      } else {
        localStorage.removeItem("focalCartId");
        setCartId(null);
        setCart(null);
        throw new Error(`Cart with ID ${id} could not be found or has expired.`);
      }
    } catch (err: any) {
      const errorMessage = handleShopifyError(err, "Failed to fetch cart.");
      setError(errorMessage);
      console.error("Fetch cart error:", err);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
      setIsInitializing(false);
    }
  }, []);

  useEffect(() => {
    const storedCartId = localStorage.getItem("focalCartId");
    if (storedCartId) {
      fetchCart(storedCartId).catch(() => {
        // If fetching the stored cart fails (e.g., expired), create a new one.
        createCart();
      });
    } else {
      createCart();
    }
  }, []);

  const addLineItem = useCallback(async (variantId: string, quantity: number, attributes?: Array<{ key: string; value: string }>): Promise<boolean> => {
    let currentCartId = cartId;
    if (!currentCartId) {
      const newCartId = await createCart();
      if (!newCartId) {
        setError("Could not create a new cart. Please try again.");
        return false;
      }
      currentCartId = newCartId;
    }
    
    setLoading(true);
    setError(null);
    try {
      const response = await storeFront(CART_LINES_ADD_MUTATION, { cartId: currentCartId, lines: [{ merchandiseId: variantId, quantity, attributes }] });
      if (response.data?.cartLinesAdd?.cart) {
        let updatedCart = await checkAndManageDonationProduct(response.data.cartLinesAdd.cart);
        setCart(updatedCart);
        return true;
      } else {
        throw new Error(handleShopifyError(response.data?.cartLinesAdd, "Failed to add item to cart."));
      }
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [cartId, createCart]);

  const removeLineItem = useCallback(async (lineId: string) => {
    if (!cartId) return;
    setLoading(true);
    setError(null);
    try {
      const response = await storeFront(CART_LINES_REMOVE_MUTATION, { cartId, lineIds: [lineId] });
      if (response.data?.cartLinesRemove?.cart) {
        let updatedCart = await checkAndManageDonationProduct(response.data.cartLinesRemove.cart);
        setCart(updatedCart);
      } else {
        throw new Error(handleShopifyError(response.data?.cartLinesRemove, "Failed to remove item."));
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [cartId]);

  const updateLineItem = useCallback(async (lineId: string, quantity: number) => {
    if (!cartId) return;
    if (quantity <= 0) {
      await removeLineItem(lineId);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await storeFront(CART_LINES_UPDATE_MUTATION, { cartId, lines: [{ id: lineId, quantity }] });
      if (response.data?.cartLinesUpdate?.cart) {
        let updatedCart = await checkAndManageDonationProduct(response.data.cartLinesUpdate.cart);
        setCart(updatedCart);
      } else {
        throw new Error(handleShopifyError(response.data?.cartLinesUpdate, "Failed to update item."));
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [cartId, removeLineItem]);

  const associateCartWithCustomer = useCallback(async (customerAccessToken: string) => {
    let currentCartId = cartId || localStorage.getItem("focalCartId");
    if (!currentCartId || !customerAccessToken) return;
    setLoading(true);
    setError(null);
    try {
      const response = await storeFront(CART_BUYER_IDENTITY_UPDATE_MUTATION, { cartId: currentCartId, buyerIdentity: { customerAccessToken, countryCode: "US" } });
      if (response.data?.cartBuyerIdentityUpdate?.cart) {
        setCart(response.data.cartBuyerIdentityUpdate.cart);
      } else {
        throw new Error(handleShopifyError(response.data.cartBuyerIdentityUpdate, "Failed to associate cart."));
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [cartId]);

  const clearCartAndCreateNew = useCallback(async () => {
    localStorage.removeItem("focalCartId");
    setCart(null);
    setCartId(null);
    setIsInitializing(true);
    await createCart().finally(() => setIsInitializing(false));
  }, [createCart]);

  const itemCount = useMemo(() => cart?.totalQuantity || 0, [cart]);

  // The loadCartFromId function was removed as it's part of a flawed approach.
  // The correct approach is to use the reorder API.
  return (
    <CartContext.Provider value={{ cart, cartId, loading, isInitializing, error, createCart, fetchCart, addLineItem, updateLineItem, removeLineItem, clearCartError, associateCartWithCustomer, itemCount, clearCartAndCreateNew } as CartContextType}>
      {children}
    </CartContext.Provider>
  );
};