// File: src/context/CartContext.tsx
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

const DONATION_PRODUCT_VARIANT_ID: any = "gid://shopify/ProductVariant/46334706581757"; 

interface CartContextType {
  cart: Cart | null;
  cartId: string | null;
  loading: boolean;
  isInitializing: boolean; 
  error: string | null;
  isFirstTimeCustomer: boolean | undefined; // For discount
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

interface CartProviderProps {
  children: ReactNode;
}

interface MoneyV2 {
  amount: string;
  currencyCode: string;
}
interface CartCost {
  subtotalAmount: MoneyV2;
  totalAmount: MoneyV2;
  totalTaxAmount: MoneyV2 | null;
}
interface CartLineMerchandiseProduct {
  title: string;
  handle: string;
}
interface CartLineMerchandiseImage {
  url: string;
  altText: string | null;
}
interface CartLineMerchandise {
  id: string;
  title: string;
  priceV2: MoneyV2;
  image: CartLineMerchandiseImage | null;
  product: CartLineMerchandiseProduct;
}
interface CartLineAttribute {
  key: string;
  value: string;
}
interface CartLineNode {
  id: string;
  quantity: number;
  merchandise: CartLineMerchandise;
  attributes: CartLineAttribute[];
}
interface CartLineEdge {
  node: CartLineNode;
}
interface CartLines {
  edges: CartLineEdge[];
}
interface CartBuyerIdentity {
    email: string | null;
    phone: string | null;
    customer: { id: string } | null;
    countryCode: string | null;
}
interface Cart {
  id: string;
  checkoutUrl: string;
  cost: CartCost;
  lines: CartLines;
  totalQuantity: number;
  buyerIdentity: CartBuyerIdentity;
  note?: string | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

export const CartProvider = ({ children }: CartProviderProps) => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [cartId, setCartId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false); 
  const [isInitializing, setIsInitializing] = useState<boolean>(true); 
  const [error, setError] = useState<string | null>(null);
  const [isFirstTimeCustomer, setIsFirstTimeCustomer] = useState<boolean | undefined>(undefined); // Start as undefined
  const { data: session, status: sessionStatus } = useSession();

  const clearCartError = () => setError(null);

  const handleShopifyError = (
    errorData: any,
    defaultMessage: string
  ): string => {
    if (errorData?.userErrors?.length > 0) {
      return errorData.userErrors.map((e: any) => e.message).join(", ");
    }
    if (errorData?.message) {
      return errorData.message;
    }
    return defaultMessage;
  };

  useEffect(() => {
    const checkStatus = async () => {
        if (sessionStatus === 'loading') {
            return;
        }
        if (sessionStatus === 'unauthenticated') {
            setIsFirstTimeCustomer(true);
            return;
        }
        if (sessionStatus === 'authenticated') {
            try {
                const res = await fetch('/api/account/status');
                const data = await res.json();
                if (res.ok) {
                    setIsFirstTimeCustomer(data.isFirstTimeCustomer);
                } else {
                    setIsFirstTimeCustomer(false);
                }
            } catch {
                setIsFirstTimeCustomer(false);
            }
        }
    };
    checkStatus();
  }, [sessionStatus]);


  const checkAndManageDonationProduct = async (currentCart: Cart | null): Promise<Cart | null> => {
    if (!currentCart || !currentCart.id || !currentCart.lines?.edges) return currentCart;
    if (DONATION_PRODUCT_VARIANT_ID === "gid://shopify/ProductVariant/YOUR_DONATION_PRODUCT_VARIANT_ID_HERE") {
      return currentCart;
    }

    const currentLines = currentCart.lines.edges;
    const donationItemLine = currentLines.find(edge => edge.node.merchandise.id === DONATION_PRODUCT_VARIANT_ID);
    
    let qualifyingEyeglassesCount = 0;
    let totalContactLensBoxes = 0;

    currentLines.forEach(edge => {
      if (edge.node.merchandise.id === DONATION_PRODUCT_VARIANT_ID) return; 

      const isContactLens = edge.node.attributes.some(attr => attr.key === "FocalProductType" && attr.value === "ContactLenses");
      const isEyeglasses = edge.node.attributes.some(attr => attr.key === "FocalProductType" && attr.value === "Eyeglasses");

      if (isEyeglasses) {
        qualifyingEyeglassesCount += edge.node.quantity;
      } else if (isContactLens) {
        totalContactLensBoxes += edge.node.quantity;
      }
    });

    const shouldHaveDonation = (qualifyingEyeglassesCount > 0) || (totalContactLensBoxes >= 4);
    
    // Case 1: Donation item exists but shouldn't. REMOVE IT.
    if (donationItemLine && !shouldHaveDonation) {
      try {
        const variables = { cartId: currentCart.id, lineIds: [donationItemLine.node.id] };
        const response = await storeFront(CART_LINES_REMOVE_MUTATION, variables);
        return response.data?.cartLinesRemove?.cart || currentCart; 
      } catch (e: any) {
        console.error("[CartContext] Exception removing donation item:", e.message);
        return currentCart; 
      }
    } 
    // Case 2: Donation item should exist but doesn't. ADD IT.
    else if (!donationItemLine && shouldHaveDonation) {
        try {
            let donationAttributes = [];
            if (qualifyingEyeglassesCount > 0) {
                 donationAttributes = [{
                    key: "Donation Message",
                    value: "You're Not Just Buying Glasses — You're Giving Someone Their Sight Back. Your purchase has donated a cataract lens to someone who needs it most. Yep, you’re kind of amazing."
                }];
            } else { // This means it was triggered by contact lenses
                 donationAttributes = [{
                    key: "Donation Message",
                    value: "You're Not Just Buying Contacts — You're Giving Someone Their Sight Back. Stock up with 4 boxes, and you donate a cataract lens to someone who needs it most. Yep, you’re kind of amazing."
                }];
            }
            const variables = {
                cartId: currentCart.id,
                lines: [{ merchandiseId: DONATION_PRODUCT_VARIANT_ID, quantity: 1, attributes: donationAttributes }],
            };
            const response = await storeFront(CART_LINES_ADD_MUTATION, variables);
            return response.data?.cartLinesAdd?.cart || currentCart;
        } catch (e: any) {
            console.error("[CartContext] Exception adding donation item:", e.message);
            return currentCart;
        }
    }
    
    // Case 3: State is correct, no change needed.
    return currentCart; 
  };

  const createCart = useCallback(async (): Promise<string | null> => {
    setLoading(true);
    setError(null);
    try {
      const buyerIdentity: any = {};
      if (session?.user?.email) {
        buyerIdentity.email = session.user.email;
      }
      const variables = { input: { buyerIdentity } };
      const response = await storeFront(CART_CREATE_MUTATION, variables);
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
        let updatedCart = response.data.cart;
        updatedCart = await checkAndManageDonationProduct(updatedCart);
        setCart(updatedCart);
        setCartId(updatedCart?.id || null);
      } else {
        localStorage.removeItem("focalCartId");
        setCart(null);
        setCartId(null);
        await createCart(); 
      }
    } catch (err: any) {
      setError(handleShopifyError(err, "Failed to fetch cart."));
      console.error("Fetch cart error:", err);
      localStorage.removeItem("focalCartId");
      await createCart();
    } finally {
      setLoading(false);
      setIsInitializing(false);
    }
  }, [createCart]); 


  useEffect(() => {
    setIsInitializing(true);
    const storedCartId = localStorage.getItem("focalCartId");
    if (storedCartId) {
      fetchCart(storedCartId);
    } else {
      createCart().finally(() => setIsInitializing(false));
    }
  }, [fetchCart, createCart]);


  const addLineItem = useCallback(
    async (
      variantId: string,
      quantity: number,
      attributes?: Array<{ key: string; value: string }>
    ): Promise<boolean> => {
      let currentCartId = cartId;
      if (!currentCartId) {
        const storedId = localStorage.getItem("focalCartId");
        if (storedId) {
            currentCartId = storedId;
            setCartId(storedId); 
        } else {
            currentCartId = await createCart(); 
             if (!currentCartId) {
                console.error("[CartContext] Failed to create or retrieve cart ID before adding item.");
                setError("Cart not initialized. Please try again.");
                return false;
            }
        }
      }

      setLoading(true);
      setError(null);
      try {
        const variables = {
          cartId: currentCartId,
          lines: [{ merchandiseId: variantId, quantity, attributes }],
        };
        const response = await storeFront(CART_LINES_ADD_MUTATION, variables);
        if (response.data?.cartLinesAdd?.cart) {
          let updatedCart = response.data.cartLinesAdd.cart;
          if (variantId !== DONATION_PRODUCT_VARIANT_ID) { 
             updatedCart = await checkAndManageDonationProduct(updatedCart);
          }
          setCart(updatedCart);
          return true;
        } else {
          throw new Error(handleShopifyError(response.data?.cartLinesAdd, "Failed to add item to cart."));
        }
      } catch (err: any) {
        setError(err.message);
        console.error("Add line item error:", err);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [cartId, createCart] 
  );

  const removeLineItem = useCallback(
    async (lineId: string) => {
      if (!cartId) {
        setError("Cart not initialized.");
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const variables = { cartId, lineIds: [lineId] };
        const response = await storeFront(CART_LINES_REMOVE_MUTATION, variables);
        if (response.data?.cartLinesRemove?.cart) {
          let updatedCart = response.data.cartLinesRemove.cart;
          updatedCart = await checkAndManageDonationProduct(updatedCart);
          setCart(updatedCart);
        } else {
          throw new Error(handleShopifyError(response.data?.cartLinesRemove, "Failed to remove item from cart."));
        }
      } catch (err: any) {
        setError(err.message);
        console.error("Remove line item error:", err);
      } finally {
        setLoading(false);
      }
    },
    [cartId] 
  );

  const updateLineItem = useCallback(
    async (lineId: string, quantity: number) => {
      if (!cartId) {
        setError("Cart not initialized.");
        return;
      }
      if (quantity <= 0) { 
        await removeLineItem(lineId); 
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const variables = { cartId, lines: [{ id: lineId, quantity }] };
        const response = await storeFront(CART_LINES_UPDATE_MUTATION, variables);
        if (response.data?.cartLinesUpdate?.cart) {
          let updatedCart = response.data.cartLinesUpdate.cart;
          updatedCart = await checkAndManageDonationProduct(updatedCart);
          setCart(updatedCart);
        } else {
          throw new Error(handleShopifyError(response.data?.cartLinesUpdate, "Failed to update item quantity."));
        }
      } catch (err: any) {
        setError(err.message);
        console.error("Update line item error:", err);
      } finally {
        setLoading(false);
      }
    },
    [cartId, removeLineItem] 
  );
  
  const associateCartWithCustomer = useCallback(async (customerAccessToken: string) => {
    let currentCartId = cartId;
    if (!currentCartId) {
        currentCartId = localStorage.getItem("focalCartId");
    }
    if (!currentCartId || !customerAccessToken) {
      console.warn("Cart ID or Customer Access Token missing for association.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const buyerIdentity = { customerAccessToken: customerAccessToken, countryCode: "US" }; 
      const variables = { cartId: currentCartId, buyerIdentity };
      const response = await storeFront(CART_BUYER_IDENTITY_UPDATE_MUTATION, variables);
      if (response.data?.cartBuyerIdentityUpdate?.cart) {
        setCart(response.data.cartBuyerIdentityUpdate.cart);
      } else if (response.data?.cartBuyerIdentityUpdate?.userErrors?.length > 0) {
        throw new Error(handleShopifyError(response.data.cartBuyerIdentityUpdate, "Failed to associate cart with customer."));
      } else {
         throw new Error("Failed to associate cart with customer due to an unknown error.");
      }
    } catch (err: any) {
      setError(err.message);
      console.error("Associate cart error:", err);
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

  const itemCount = useMemo(() => {
    return cart?.lines.edges.reduce((sum, edge) => sum + edge.node.quantity, 0) || 0;
  }, [cart]);


  return (
    <CartContext.Provider
      value={{
        cart,
        cartId,
        loading,
        isInitializing,
        error,
        isFirstTimeCustomer,
        createCart,
        fetchCart,
        addLineItem,
        updateLineItem,
        removeLineItem,
        clearCartError,
        associateCartWithCustomer,
        itemCount,
        clearCartAndCreateNew, 
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
