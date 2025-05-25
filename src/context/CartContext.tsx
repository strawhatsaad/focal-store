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
import { useSession } from "next-auth/react";
import {
  createShopifyCart,
  getShopifyCart,
  addLinesToShopifyCart,
  updateLinesInShopifyCart,
  removeLinesFromShopifyCart,
  // Removed associateCartWithCustomer as we'll handle merge differently
} from "../../utils/index";

// Define types for Cart and Line Items
interface CartImage {
  url: string;
  altText?: string | null;
}

interface CartPrice {
  amount: string;
  currencyCode: string;
}

interface CartMerchandise {
  id: string;
  title: string;
  priceV2: CartPrice;
  image?: CartImage | null;
  product: {
    title: string;
    handle: string;
  };
}

interface CartLineNode {
  id: string;
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
  buyerIdentity: {
    customerAccessToken: string | null; // This field is not on the returned CartBuyerIdentity object
    email: string | null;
    customer?: { id: string } | null; // Nested customer object
    countryCode?: string | null;
  };
}

interface CartContextType {
  cart: ShopifyCart | null;
  cartId: string | null;
  loading: boolean;
  error: string | null;
  fetchCartById: (id: string, isUserCart?: boolean) => Promise<void>;
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
  const { data: session, status: sessionStatus } = useSession();
  const [cart, setCart] = useState<ShopifyCart | null>(null);
  const [cartId, setCartId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const clearCartError = () => setError(null);

  const initializeAnonymousCart =
    useCallback(async (): Promise<ShopifyCart | null> => {
      console.log("[CartContext] Initializing anonymous cart...");
      setLoading(true);
      setError(null);
      try {
        const response = await createShopifyCart({});
        if (response.data?.cartCreate?.cart) {
          const newCart = response.data.cartCreate.cart as ShopifyCart;
          setCart(newCart);
          setCartId(newCart.id);
          localStorage.setItem("shopify_cart_id", newCart.id);
          console.log("[CartContext] New anonymous cart created:", newCart.id);
          return newCart;
        } else {
          const errorMsg =
            response.data?.cartCreate?.userErrors?.[0]?.message ||
            "Failed to create anonymous cart.";
          throw new Error(errorMsg);
        }
      } catch (err: any) {
        console.error("[CartContext] Error creating anonymous cart:", err);
        setError(err.message || "Failed to create anonymous cart.");
        localStorage.removeItem("shopify_cart_id");
        return null;
      } finally {
        setLoading(false);
      }
    }, []);

  const retrieveOrCreateCustomerCart = useCallback(
    async (
      customerAccessToken: string,
      customerEmail?: string | null
    ): Promise<ShopifyCart | null> => {
      console.log(
        "[CartContext] Retrieving or creating customer cart for email:",
        customerEmail
      );
      setLoading(true);
      setError(null);
      try {
        const cartInput: any = {
          buyerIdentity: { customerAccessToken },
        };
        if (customerEmail) {
          cartInput.buyerIdentity.email = customerEmail;
        }
        // countryCode can also be added if available/needed
        // cartInput.buyerIdentity.countryCode = "US";

        const response = await createShopifyCart(cartInput);
        console.log(
          "[CartContext] Response from createShopifyCart (for customer):",
          JSON.stringify(response, null, 2)
        );

        if (response.data?.cartCreate?.cart) {
          const customerCart = response.data.cartCreate.cart as ShopifyCart;
          setCart(customerCart);
          setCartId(customerCart.id);
          console.log(
            "[CartContext] Customer cart initialized/retrieved:",
            customerCart.id,
            "Total Quantity:",
            customerCart.totalQuantity
          );
          return customerCart;
        } else {
          const userErrors = response.data?.cartCreate?.userErrors;
          const errorMsg =
            userErrors?.[0]?.message ||
            "Failed to initialize customer cart. Unexpected response.";
          console.error(
            "[CartContext] Error initializing customer cart (Shopify userErrors):",
            errorMsg,
            userErrors
          );
          throw new Error(errorMsg);
        }
      } catch (err: any) {
        console.error(
          "[CartContext] Error initializing customer cart (catch block):",
          err
        );
        setError(err.message || "Failed to load or create customer cart.");
        setCart(null);
        setCartId(null);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const fetchCartById = useCallback(
    async (id: string, isUserCart: boolean = false) => {
      if (!id) {
        console.warn("[CartContext] fetchCartById called with no ID.");
        if (!isUserCart) await initializeAnonymousCart();
        return;
      }
      console.log(
        `[CartContext] Fetching cart by ID: ${id}. Is user cart: ${isUserCart}`
      );
      setLoading(true);
      setError(null);
      try {
        const response = await getShopifyCart(id);
        if (response?.data?.cart) {
          const fetchedCart = response.data.cart as ShopifyCart;
          setCart(fetchedCart);
          setCartId(fetchedCart.id);
          console.log(
            "[CartContext] Cart fetched successfully by ID:",
            fetchedCart.id,
            "Total Quantity:",
            fetchedCart.totalQuantity
          );
          if (!isUserCart && !fetchedCart.buyerIdentity?.customer?.id) {
            // Check for customer association
            localStorage.setItem("shopify_cart_id", fetchedCart.id);
          }
        } else {
          console.warn(
            `[CartContext] Cart with ID ${id} not found or error fetching. Response:`,
            response
          );
          if (!isUserCart) {
            localStorage.removeItem("shopify_cart_id");
            await initializeAnonymousCart();
          } else {
            if (session?.user && session.shopifyAccessToken) {
              console.log(
                "[CartContext] User cart not found by ID, attempting to retrieve/create new one for customer."
              );
              await retrieveOrCreateCustomerCart(
                session.shopifyAccessToken,
                session.user.email
              );
            } else {
              setCart(null);
              setCartId(null);
            }
          }
        }
      } catch (err: any) {
        console.error("[CartContext] Error fetching cart by ID:", err);
        setError(err.message || "Failed to fetch cart.");
        if (!isUserCart) {
          localStorage.removeItem("shopify_cart_id");
          await initializeAnonymousCart();
        } else {
          if (session?.user && session.shopifyAccessToken) {
            await retrieveOrCreateCustomerCart(
              session.shopifyAccessToken,
              session.user.email
            );
          } else {
            setCart(null);
            setCartId(null);
          }
        }
      } finally {
        setLoading(false);
      }
    },
    [initializeAnonymousCart, retrieveOrCreateCustomerCart, session]
  );

  // Effect to handle session changes (login/logout)
  useEffect(() => {
    console.log(
      "[CartContext] Session effect. Status:",
      sessionStatus,
      "Session:",
      !!session
    );
    if (sessionStatus === "loading") {
      setLoading(true);
      return;
    }

    const handleSessionChange = async () => {
      setLoading(true);
      if (session?.user && session.shopifyAccessToken) {
        console.log(
          "[CartContext] User authenticated. Processing customer cart logic."
        );
        const anonCartIdFromStorage = localStorage.getItem("shopify_cart_id");
        let linesToMerge: CartLineEdge[] = [];

        if (anonCartIdFromStorage) {
          console.log(
            `[CartContext] Anonymous cart ${anonCartIdFromStorage} found in localStorage.`
          );
          try {
            const anonCartResponse = await getShopifyCart(
              anonCartIdFromStorage
            );
            if (anonCartResponse?.data?.cart) {
              const anCart = anonCartResponse.data.cart as ShopifyCart;
              if (anCart.lines.edges.length > 0) {
                linesToMerge = anCart.lines.edges;
                console.log(
                  `[CartContext] Anonymous cart ${anonCartIdFromStorage} has ${linesToMerge.length} line items to merge.`
                );
              } else {
                console.log(
                  `[CartContext] Anonymous cart ${anonCartIdFromStorage} is empty. No lines to merge.`
                );
              }
            } else {
              console.warn(
                `[CartContext] Could not fetch anonymous cart ${anonCartIdFromStorage} for merging.`
              );
            }
          } catch (fetchErr) {
            console.error(
              `[CartContext] Error fetching anonymous cart ${anonCartIdFromStorage} for merging:`,
              fetchErr
            );
          }
        }

        // Always retrieve or create the canonical customer cart
        const customerCart = await retrieveOrCreateCustomerCart(
          session.shopifyAccessToken,
          session.user.email
        );

        if (customerCart && linesToMerge.length > 0) {
          console.log(
            `[CartContext] Merging ${linesToMerge.length} lines into customer cart ${customerCart.id}`
          );
          const lineInputs = linesToMerge.map((edge) => ({
            merchandiseId: edge.node.merchandise.id,
            quantity: edge.node.quantity,
            attributes: edge.node.attributes,
          }));
          try {
            const mergeResponse = await addLinesToShopifyCart(
              customerCart.id,
              lineInputs
            );
            if (mergeResponse.data?.cartLinesAdd?.cart) {
              setCart(mergeResponse.data.cartLinesAdd.cart as ShopifyCart);
              setCartId(mergeResponse.data.cartLinesAdd.cart.id);
              console.log(
                "[CartContext] Lines merged successfully into customer cart."
              );
            } else {
              console.error(
                "[CartContext] Failed to merge lines into customer cart. Errors:",
                mergeResponse.data?.cartLinesAdd?.userErrors
              );
              // Fallback to the customer cart without merged items if merge fails
              setCart(customerCart);
              setCartId(customerCart.id);
            }
          } catch (mergeError) {
            console.error(
              "[CartContext] Error merging lines into customer cart:",
              mergeError
            );
            setCart(customerCart); // Fallback
            setCartId(customerCart.id);
          }
        } else if (customerCart) {
          // No lines to merge, or customerCart retrieval failed earlier (setCart/cartId already handled)
          console.log(
            "[CartContext] No lines to merge, using retrieved/created customer cart."
          );
        }

        if (anonCartIdFromStorage) {
          localStorage.removeItem("shopify_cart_id"); // Clean up anonymous cart ID after attempting merge/retrieval
          console.log(
            `[CartContext] Removed anonymous cart ID ${anonCartIdFromStorage} from localStorage.`
          );
        }
      } else {
        // User logged out or no session
        console.log(
          "[CartContext] User not authenticated. Handling anonymous cart."
        );
        setCart(null);
        setCartId(null);
        const storedAnonCartId = localStorage.getItem("shopify_cart_id");
        if (storedAnonCartId) {
          console.log(
            "[CartContext] Found anonymous cart ID for logged-out user:",
            storedAnonCartId
          );
          await fetchCartById(storedAnonCartId, false);
        } else {
          console.log(
            "[CartContext] No anonymous cart ID for logged-out user. Creating new one."
          );
          await initializeAnonymousCart();
        }
      }
      setLoading(false);
    };

    handleSessionChange();
  }, [
    sessionStatus,
    session,
    retrieveOrCreateCustomerCart,
    fetchCartById,
    initializeAnonymousCart,
  ]);

  const addLineItem = async (
    merchandiseId: string,
    quantity: number,
    attributes?: Array<{ key: string; value: string }>
  ) => {
    setError(null);
    let cartToUseId = cartId;

    if (!cartToUseId) {
      setLoading(true);
      console.log(
        "[CartContext] addLineItem: No cart ID. Ensuring cart exists..."
      );
      try {
        let ensuredCart: ShopifyCart | null = null;
        if (session?.user && session.shopifyAccessToken) {
          ensuredCart = await retrieveOrCreateCustomerCart(
            session.shopifyAccessToken,
            session.user.email
          );
        } else {
          const storedAnonCartId = localStorage.getItem("shopify_cart_id");
          if (storedAnonCartId) {
            const currentCartState = cart;
            if (currentCartState && currentCartState.id === storedAnonCartId) {
              ensuredCart = currentCartState;
            } else {
              const fetchResponse = await getShopifyCart(storedAnonCartId);
              if (fetchResponse?.data?.cart)
                ensuredCart = fetchResponse.data.cart as ShopifyCart;
            }
          }
          if (!ensuredCart) {
            ensuredCart = await initializeAnonymousCart();
          }
        }

        if (ensuredCart?.id) {
          cartToUseId = ensuredCart.id;
          if (!cart || cart.id !== ensuredCart.id) setCart(ensuredCart);
          if (cartId !== ensuredCart.id) setCartId(ensuredCart.id);
        } else {
          throw new Error(
            "Failed to initialize/retrieve cart for adding item."
          );
        }
      } catch (initError: any) {
        console.error(
          "[CartContext] addLineItem: Error ensuring cart:",
          initError
        );
        setError(initError.message || "Cart not available. Please try again.");
        setLoading(false);
        return false;
      }
    }

    if (!cartToUseId) {
      console.error(
        "[CartContext] addLineItem: Still no cart ID after initialization attempt."
      );
      setError("Cart could not be initialized. Please refresh and try again.");
      setLoading(false);
      return false;
    }

    setLoading(true);
    console.log(`[CartContext] Adding line item to cart ID: ${cartToUseId}`);
    try {
      const lines = [{ merchandiseId, quantity, attributes }];
      const response = await addLinesToShopifyCart(cartToUseId, lines);
      if (response.data?.cartLinesAdd?.cart) {
        const updatedCart = response.data.cartLinesAdd.cart as ShopifyCart;
        setCart(updatedCart);
        setCartId(updatedCart.id);
        console.log(
          "[CartContext] Item added successfully. New cart state:",
          updatedCart
        );
        if (
          !updatedCart.buyerIdentity?.customer?.id &&
          sessionStatus !== "authenticated"
        ) {
          localStorage.setItem("shopify_cart_id", updatedCart.id);
        }
        return true;
      } else {
        const errorMsg =
          response.data?.cartLinesAdd?.userErrors?.[0]?.message ||
          "Failed to add item to cart.";
        throw new Error(errorMsg);
      }
    } catch (err: any) {
      console.error("[CartContext] Error adding line item:", err);
      setError(err.message || "Failed to add item.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateLineItem = async (lineId: string, quantity: number) => {
    if (!cartId) {
      setError("Cart ID is missing. Cannot update item.");
      return false;
    }
    if (quantity <= 0) {
      return removeLineItem(lineId);
    }
    setLoading(true);
    setError(null);
    console.log(
      `[CartContext] Updating line item ${lineId} in cart ID: ${cartId}`
    );
    try {
      const lines = [{ id: lineId, quantity }];
      const response = await updateLinesInShopifyCart(cartId, lines);
      if (response.data?.cartLinesUpdate?.cart) {
        const updatedCart = response.data.cartLinesUpdate.cart as ShopifyCart;
        setCart(updatedCart);
        setCartId(updatedCart.id);
        if (
          !updatedCart.buyerIdentity?.customer?.id &&
          sessionStatus !== "authenticated"
        ) {
          localStorage.setItem("shopify_cart_id", updatedCart.id);
        }
        return true;
      } else {
        const errorMsg =
          response.data?.cartLinesUpdate?.userErrors?.[0]?.message ||
          "Failed to update item in cart.";
        throw new Error(errorMsg);
      }
    } catch (err: any) {
      console.error("[CartContext] Error updating line item:", err);
      setError(err.message || "Failed to update item.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const removeLineItem = async (lineId: string) => {
    if (!cartId) {
      setError("Cart ID is missing. Cannot remove item.");
      return false;
    }
    setLoading(true);
    setError(null);
    console.log(
      `[CartContext] Removing line item ${lineId} from cart ID: ${cartId}`
    );
    try {
      const response = await removeLinesFromShopifyCart(cartId, [lineId]);
      if (response.data?.cartLinesRemove?.cart) {
        const updatedCart = response.data.cartLinesRemove.cart as ShopifyCart;
        setCart(updatedCart);
        setCartId(updatedCart.id);
        if (
          !updatedCart.buyerIdentity?.customer?.id &&
          sessionStatus !== "authenticated"
        ) {
          localStorage.setItem("shopify_cart_id", updatedCart.id);
        }
        return true;
      } else {
        const errorMsg =
          response.data?.cartLinesRemove?.userErrors?.[0]?.message ||
          "Failed to remove item from cart.";
        throw new Error(errorMsg);
      }
    } catch (err: any) {
      console.error("[CartContext] Error removing line item:", err);
      setError(err.message || "Failed to remove item.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        cartId,
        loading,
        error,
        fetchCartById,
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
