// src/context/CartContext.tsx
"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
  useMemo, // Added useMemo
} from "react";
import {
  storeFront,
  CART_CREATE_MUTATION,
  CART_LINES_ADD_MUTATION,
  CART_LINES_UPDATE_MUTATION,
  CART_LINES_REMOVE_MUTATION,
  GET_CART_QUERY,
  CART_BUYER_IDENTITY_UPDATE_MUTATION,
  // CART_FRAGMENT, // Not used directly if types are defined
} from "../../utils"; // Adjust path as needed
import { useSession } from "next-auth/react";

const DONATION_PRODUCT_VARIANT_ID: any =
  "gid://shopify/ProductVariant/46334706581757";

interface CartContextType {
  cart: Cart | null;
  cartId: string | null;
  loading: boolean;
  error: string | null;
  createCart: () => Promise<void>;
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
  const [error, setError] = useState<string | null>(null);
  const { data: session } = useSession();

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

  const checkAndManageDonationProduct = async (
    currentCart: Cart | null
  ): Promise<Cart | null> => {
    if (!currentCart || !currentCart.lines?.edges) return currentCart;
    if (
      DONATION_PRODUCT_VARIANT_ID ===
      "gid://shopify/ProductVariant/YOUR_DONATION_PRODUCT_VARIANT_ID_HERE"
    ) {
      // console.warn("[CartContext] Donation Product Variant ID is a placeholder. Donation management skipped.");
      return currentCart;
    }

    const currentLines = currentCart.lines.edges;
    const donationItemLine = currentLines.find(
      (edge) => edge.node.merchandise.id === DONATION_PRODUCT_VARIANT_ID
    );

    let qualifyingEyeglassesCount = 0;
    let totalContactLensBoxes = 0;

    currentLines.forEach((edge) => {
      if (edge.node.merchandise.id === DONATION_PRODUCT_VARIANT_ID) return;

      const focalProductTypeAttr = edge.node.attributes.find(
        (attr) => attr.key === "FocalProductType"
      );
      if (focalProductTypeAttr?.value === "Eyeglasses") {
        qualifyingEyeglassesCount++;
      } else if (focalProductTypeAttr?.value === "ContactLenses") {
        totalContactLensBoxes += edge.node.quantity;
      }
    });

    const shouldHaveDonation =
      qualifyingEyeglassesCount > 0 || totalContactLensBoxes >= 4;

    if (donationItemLine && !shouldHaveDonation) {
      // console.log("[CartContext] Conditions no longer met. Removing donation product.");
      try {
        const variables = {
          cartId: currentCart.id,
          lineIds: [donationItemLine.node.id],
        };
        const response = await storeFront(
          CART_LINES_REMOVE_MUTATION,
          variables
        );
        if (response.data?.cartLinesRemove?.userErrors?.length > 0) {
          const shopifyError = handleShopifyError(
            response.data.cartLinesRemove,
            "Error removing donation item."
          );
          console.error(
            "[CartContext] Error removing donation item from Shopify:",
            shopifyError
          );
          return currentCart;
        }
        // console.log("[CartContext] Donation product removed successfully from Shopify.");
        return response.data?.cartLinesRemove?.cart || null;
      } catch (e: any) {
        console.error(
          "[CartContext] Exception removing donation item:",
          e.message
        );
        return currentCart;
      }
    }
    return currentCart;
  };

  const fetchCart = useCallback(async (id: string) => {
    if (!id) return;
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
      }
    } catch (err: any) {
      setError(handleShopifyError(err, "Failed to fetch cart."));
      console.error("Fetch cart error:", err);
    } finally {
      setLoading(false);
    }
    // Removed checkAndManageDonationProduct from here as it's called inside
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const createCart = useCallback(async () => {
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
      } else {
        throw new Error(
          handleShopifyError(
            response.data?.cartCreate,
            "Failed to create cart."
          )
        );
      }
    } catch (err: any) {
      setError(err.message);
      console.error("Create cart error:", err);
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    const storedCartId = localStorage.getItem("focalCartId");
    if (storedCartId) {
      fetchCart(storedCartId);
    } else {
      createCart();
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
        console.log(
          "[CartContext] No cartId, attempting to create/fetch cart before adding item."
        );
        await createCart(); // Attempt to create a cart if missing
        currentCartId = localStorage.getItem("focalCartId"); // Check again after creation attempt
        if (!currentCartId) {
          console.error(
            "[CartContext] Failed to create or retrieve cart ID before adding item."
          );
          setError("Cart not initialized. Please try again.");
          return false;
        }
        setCartId(currentCartId); // Ensure cartId state is updated
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
          // Check donation status after adding main items, before setting cart state
          // This is important if the donation is added by Hero/Modal and this addLineItem is for the donation itself
          if (variantId !== DONATION_PRODUCT_VARIANT_ID) {
            // Avoid recursion if this is the donation item
            updatedCart = await checkAndManageDonationProduct(updatedCart);
          }
          setCart(updatedCart);
          return true;
        } else {
          throw new Error(
            handleShopifyError(
              response.data?.cartLinesAdd,
              "Failed to add item to cart."
            )
          );
        }
      } catch (err: any) {
        setError(err.message);
        console.error("Add line item error:", err);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [cartId, createCart] // Removed checkAndManageDonationProduct from here
  );

  // Define removeLineItem BEFORE updateLineItem
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
        const response = await storeFront(
          CART_LINES_REMOVE_MUTATION,
          variables
        );
        if (response.data?.cartLinesRemove?.cart) {
          let updatedCart = response.data.cartLinesRemove.cart;
          updatedCart = await checkAndManageDonationProduct(updatedCart);
          setCart(updatedCart);
        } else {
          throw new Error(
            handleShopifyError(
              response.data?.cartLinesRemove,
              "Failed to remove item from cart."
            )
          );
        }
      } catch (err: any) {
        setError(err.message);
        console.error("Remove line item error:", err);
      } finally {
        setLoading(false);
      }
    },
    [cartId] // Removed checkAndManageDonationProduct from here
  );

  const updateLineItem = useCallback(
    async (lineId: string, quantity: number) => {
      if (!cartId) {
        setError("Cart not initialized.");
        return;
      }
      // If quantity is 0 or less, remove the item instead of updating
      if (quantity <= 0) {
        await removeLineItem(lineId); // Call the already defined removeLineItem
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const variables = { cartId, lines: [{ id: lineId, quantity }] };
        const response = await storeFront(
          CART_LINES_UPDATE_MUTATION,
          variables
        );
        if (response.data?.cartLinesUpdate?.cart) {
          let updatedCart = response.data.cartLinesUpdate.cart;
          updatedCart = await checkAndManageDonationProduct(updatedCart);
          setCart(updatedCart);
        } else {
          throw new Error(
            handleShopifyError(
              response.data?.cartLinesUpdate,
              "Failed to update item quantity."
            )
          );
        }
      } catch (err: any) {
        setError(err.message);
        console.error("Update line item error:", err);
      } finally {
        setLoading(false);
      }
    },
    [cartId, removeLineItem] // Now removeLineItem is defined before this
  );

  const associateCartWithCustomer = useCallback(
    async (customerAccessToken: string) => {
      if (!cartId || !customerAccessToken) {
        console.warn(
          "Cart ID or Customer Access Token missing for association."
        );
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const buyerIdentity = {
          customerAccessToken: customerAccessToken,
          countryCode: "US",
        };
        const variables = { cartId, buyerIdentity };
        const response = await storeFront(
          CART_BUYER_IDENTITY_UPDATE_MUTATION,
          variables
        );
        if (response.data?.cartBuyerIdentityUpdate?.cart) {
          setCart(response.data.cartBuyerIdentityUpdate.cart);
        } else {
          throw new Error(
            handleShopifyError(
              response.data?.cartBuyerIdentityUpdate,
              "Failed to associate cart with customer."
            )
          );
        }
      } catch (err: any) {
        setError(err.message);
        console.error("Associate cart error:", err);
      } finally {
        setLoading(false);
      }
    },
    [cartId]
  );

  const itemCount = useMemo(() => {
    return (
      cart?.lines.edges.reduce((sum, edge) => sum + edge.node.quantity, 0) || 0
    );
  }, [cart]);

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
        associateCartWithCustomer,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
