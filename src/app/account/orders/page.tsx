// File: src/app/account/orders/page.tsx
"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import {
  Loader2,
  ShoppingBag,
  ArrowLeft,
  PackageSearch,
  AlertCircle,
  UserCircle,
} from "lucide-react";
import { storeFront, GET_CUSTOMER_ORDERS_QUERY } from "../../../../utils"; // Adjust path if your utils is in src, e.g., "@/utils"

interface OrderLineItem {
  node: {
    title: string;
    quantity: number;
    variant: {
      image: {
        url: string;
        altText: string | null;
      } | null;
      priceV2: {
        amount: string;
        currencyCode: string;
      };
    } | null;
  };
}

interface Order {
  node: {
    id: string;
    orderNumber: string;
    processedAt: string;
    financialStatus: string;
    fulfillmentStatus: string;
    totalPriceV2: {
      amount: string;
      currencyCode: string;
    };
    lineItems: {
      edges: OrderLineItem[];
    };
  };
}

const OrderHistoryPage = () => {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (sessionStatus === "loading") return;
    if (!session) {
      router.push("/api/auth/signin?callbackUrl=/account/orders");
      return;
    }

    const fetchOrders = async () => {
      // Ensure shopifyAccessToken is either a string or null.
      // The JSDoc in utils/index.js for storeFront clarifies its third parameter type.
      const token: any = session?.shopifyAccessToken || null;

      if (token) {
        try {
          setIsLoading(true);
          setError(null);
          const variables = {
            customerAccessToken: token, // This token is a string here, matching String! in GQL
            first: 10,
          };
          // The third argument to storeFront is the customerAccessToken for the header.
          // With JSDoc on storeFront, this call should no longer cause the specific type error
          // "Argument of type 'string' is not assignable to parameter of type 'null | undefined'".
          const response = await storeFront(
            GET_CUSTOMER_ORDERS_QUERY,
            variables,
            token
          );

          if (response.data?.customer?.orders?.edges) {
            setOrders(response.data.customer.orders.edges);
          } else if (response.errors) {
            // Error handling improved in storeFront to throw, so this might be less likely to be hit directly
            // unless storeFront is modified to not throw on GraphQL errors.
            console.error("Shopify API errors after call:", response.errors);
            setError(
              `Could not fetch orders. ${response.errors
                .map((e: any) => e.message)
                .join("; ")}`
            );
          } else if (!response.data?.customer) {
            // This can happen if the token is invalid or expired, Shopify returns data: { customer: null }
            console.warn(
              "Customer data not found with the provided access token. Token might be invalid or expired."
            );
            setError(
              "Could not retrieve customer data. Your session might have expired. Please try signing out and signing back in."
            );
            setOrders([]);
          } else {
            setOrders([]); // No orders or unexpected response structure
          }
        } catch (err: any) {
          console.error("Failed to fetch orders (catch block in page):", err);
          setError(
            err.message || "An error occurred while fetching your orders."
          );
        } finally {
          setIsLoading(false);
        }
      } else {
        setError(
          "Could not authenticate with Shopify to fetch orders. Access token is missing."
        );
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [session, sessionStatus, router]);

  if (sessionStatus === "loading" || isLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50 p-4">
        <Loader2 className="h-12 w-12 animate-spin text-black" />
        <p className="ml-3 text-lg font-medium text-gray-700 mt-4">
          Loading your orders...
        </p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50 text-center px-4">
        <UserCircle className="h-16 w-16 text-gray-400 mb-4" />
        <h1 className="text-2xl font-semibold text-gray-700 mb-2">
          Access Denied
        </h1>
        <p className="text-gray-500 mb-6">
          Please sign in to view your order history.
        </p>
        <button
          onClick={() =>
            router.push("/api/auth/signin?callbackUrl=/account/orders")
          }
          className="px-6 py-2.5 bg-black text-white font-medium text-sm rounded-lg shadow-md hover:bg-gray-800 transition-colors"
        >
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 py-8 md:py-12 px-4">
      <div className="container mx-auto max-w-5xl">
        <header className="mb-8 md:mb-10">
          <Link
            href="/account"
            className="flex items-center text-sm text-gray-600 hover:text-black mb-4 group"
          >
            <ArrowLeft
              size={18}
              className="mr-2 group-hover:-translate-x-1 transition-transform duration-200"
            />
            Back to My Account
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-800">
            Order History
          </h1>
        </header>

        {error && (
          <div
            className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md shadow-md mb-6"
            role="alert"
          >
            <div className="flex">
              <div className="py-1">
                <AlertCircle className="h-6 w-6 text-red-500 mr-3" />
              </div>
              <div>
                <p className="font-bold">Error</p>
                <p>{error}</p>
              </div>
            </div>
          </div>
        )}

        {!isLoading && !error && orders.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <PackageSearch className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              No Orders Yet
            </h2>
            <p className="text-gray-500 mb-6">
              You haven't placed any orders with us yet. Time to start shopping!
            </p>
            <Link
              href="/"
              className="px-6 py-2.5 bg-black text-white font-medium text-sm rounded-lg shadow-md hover:bg-gray-800 transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        )}

        {!isLoading && !error && orders.length > 0 && (
          <div className="space-y-6">
            {orders.map(({ node: order }) => (
              <div
                key={order.id}
                className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 pb-4 border-b border-gray-200">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800">
                      Order #{order.orderNumber}
                    </h2>
                    <p className="text-sm text-gray-500">
                      Placed on:{" "}
                      {new Date(order.processedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="mt-2 sm:mt-0 text-left sm:text-right">
                    <p className="text-lg font-bold text-gray-800">
                      {order.totalPriceV2.amount}{" "}
                      {order.totalPriceV2.currencyCode}
                    </p>
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        order.financialStatus === "PAID"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {order.financialStatus
                        .replace("_", " ")
                        .toLowerCase()
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                    </span>
                    <span
                      className={`ml-2 text-xs font-medium px-2 py-0.5 rounded-full ${
                        order.fulfillmentStatus === "FULFILLED"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-orange-100 text-orange-700"
                      }`}
                    >
                      {order.fulfillmentStatus
                        .replace("_", " ")
                        .toLowerCase()
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  {order.lineItems.edges.map((item, index) => (
                    <div key={index} className="flex items-center space-x-4">
                      {item.node.variant?.image && (
                        <Image
                          src={item.node.variant.image.url}
                          alt={
                            item.node.variant.image.altText || item.node.title
                          }
                          width={64}
                          height={64}
                          className="rounded-md border border-gray-200 object-cover"
                        />
                      )}
                      <div className="flex-grow">
                        <p className="font-medium text-gray-700">
                          {item.node.title}
                        </p>
                        <p className="text-sm text-gray-500">
                          Quantity: {item.node.quantity}
                        </p>
                      </div>
                      <p className="text-sm font-medium text-gray-600">
                        {parseFloat(
                          item.node.variant?.priceV2.amount || "0"
                        ).toFixed(2)}{" "}
                        {item.node.variant?.priceV2.currencyCode}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistoryPage;
