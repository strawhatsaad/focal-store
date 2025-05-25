// File: src/lib/authOptions.ts

import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
// Removed GoogleProvider and AppleProvider
import { storeFront } from "../../utils"; // Ensure this path is correct

// Type definitions are augmented globally via src/types/next-auth.d.ts

// GraphQL Constants
// CREATE_CUSTOMER_MUTATION is used by your /api/auth/signup route, so it's kept.
const CREATE_CUSTOMER_MUTATION = `
  mutation customerCreate($input: CustomerCreateInput!) {
    customerCreate(input: $input) {
      customer { id firstName lastName email }
      customerUserErrors { code field message }
    }
  }
`;
const CUSTOMER_ACCESS_TOKEN_CREATE_MUTATION = `
  mutation customerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) {
    customerAccessTokenCreate(input: $input) {
      customerAccessToken { accessToken expiresAt }
      customerUserErrors { code field message }
    }
  }
`;
const GET_CUSTOMER_INFO_QUERY = `
  query getCustomerInfo($customerAccessToken: String!) {
    customer(customerAccessToken: $customerAccessToken) { id email firstName lastName }
  }
`;

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials): Promise<import("next-auth").User | null> {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Please enter both email and password.");
                }
                try {
                    const tokenResponse = await storeFront(CUSTOMER_ACCESS_TOKEN_CREATE_MUTATION, {
                        input: { email: credentials.email, password: credentials.password },
                    });

                    if (tokenResponse.data?.customerAccessTokenCreate?.customerAccessToken) {
                        const shopifyToken = tokenResponse.data.customerAccessTokenCreate.customerAccessToken;
                        const customerInfoResponse = await storeFront(
                            GET_CUSTOMER_INFO_QUERY,
                            { customerAccessToken: shopifyToken.accessToken },
                            shopifyToken.accessToken
                        );

                        if (customerInfoResponse.data?.customer) {
                            const shopifyCustomer = customerInfoResponse.data.customer;
                            return { // This is the User object NextAuth expects
                                id: shopifyCustomer.id, // Use Shopify customer GID as NextAuth user id
                                email: shopifyCustomer.email,
                                name: `${shopifyCustomer.firstName || ''} ${shopifyCustomer.lastName || ''}`.trim() || shopifyCustomer.email,
                                image: null, // You can add a default image or fetch from profile if available
                                shopifyCustomerId: shopifyCustomer.id,
                                shopifyAccessToken: shopifyToken.accessToken, // Storefront access token
                                shopifyAccessTokenExpiresAt: shopifyToken.expiresAt,
                                // Removed OAuth specific flags
                            };
                        }
                        throw new Error("Login successful, but failed to retrieve customer details from Shopify.");
                    }

                    const errors = tokenResponse.data?.customerAccessTokenCreate?.customerUserErrors;
                    // Provide more specific error messages if available
                    if (errors && errors.length > 0) {
                        const message = errors.map((e: any) => e.message).join(", ");
                        // Check for common error messages like "Unidentified customer"
                        if (message.toLowerCase().includes("unidentified customer")) {
                            throw new Error("Invalid email or password.");
                        }
                        throw new Error(message);
                    }
                    throw new Error("Invalid email or password."); // Generic fallback

                } catch (error: any) {
                    console.error("[NextAuth Credentials] Error in authorize:", error.message);
                    // Propagate the error message to be displayed on the sign-in page
                    throw new Error(error.message || "An error occurred during login.");
                }
            }
        }),
        // GoogleProvider and AppleProvider removed
    ],
    session: { strategy: "jwt" },
    pages: {
        signIn: '/auth/signin',
        error: '/auth/signin', // Redirect to sign-in page on error, error query param will be present
    },
    callbacks: {
        async signIn({ user, account, profile }) {
            // This callback is still useful for logging or additional checks if needed,
            // but primary Shopify interaction for credentials is in `authorize`.
            // For OAuth, this was where Shopify account creation/linking happened.
            // Since OAuth is removed, this can be simplified or even removed if not needed.
            if (account?.provider === "credentials") {
                return true; // Credentials already authorized
            }
            // If other providers were to be added later, their logic would go here.
            return false; // Block other unintended sign-in methods if any slip through
        },

        async jwt({ token, user }) {
            const internalUser = user as import("next-auth").User; // User type from next-auth.d.ts
            if (internalUser) {
                // When user object is present (on sign in or session update with user data)
                token.id = internalUser.id; // NextAuth's internal ID for the token, usually 'sub'
                token.name = internalUser.name;
                token.email = internalUser.email;
                token.picture = internalUser.image;

                // Shopify specific details from the User object populated by `authorize`
                token.shopifyCustomerId = internalUser.shopifyCustomerId;
                token.shopifyAccessToken = internalUser.shopifyAccessToken; // Storefront access token
                token.shopifyAccessTokenExpiresAt = internalUser.shopifyAccessTokenExpiresAt;

                // Remove OAuth specific flags
                delete token.requiresPasswordUpdate;
                delete token.isNewOAuthUser;
                delete token.shopifyLinkFailed;
                delete token.shopifyAccountExists;
            }
            return token;
        },

        async session({ session, token }) {
            if (!session.user) session.user = {} as import("next-auth").Session["user"];

            // Standard NextAuth fields from token
            if (token.id) session.user.id = token.id as string; // Use token.id (which we set from user.id)
            if (token.name) session.user.name = token.name;
            if (token.email) session.user.email = token.email;
            if (token.picture) session.user.image = token.picture;

            // Custom Shopify fields from token
            session.user.shopifyCustomerId = token.shopifyCustomerId as string | undefined;

            // Pass Storefront access token to the session directly for client-side Shopify API calls if needed
            session.shopifyAccessToken = token.shopifyAccessToken as string | undefined;
            session.shopifyAccessTokenExpiresAt = token.shopifyAccessTokenExpiresAt as string | undefined;

            if (token.error) session.error = token.error as string | undefined;

            // Remove OAuth specific flags from session
            delete (session.user as any).requiresPasswordUpdate;
            delete (session as any).isNewOAuthUser;
            delete (session as any).shopifyLinkFailed;
            delete (session as any).shopifyAccountExists;

            return session;
        },
    },
    debug: process.env.NODE_ENV === 'development',
};
