// File: app/api/auth/[...nextauth]/route.ts

import NextAuth, { NextAuthOptions, User as NextAuthUser, Account, Profile } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import AppleProvider from "next-auth/providers/apple";
import { storeFront } from "../../../../../utils/index"; // Adjust path as necessary

// Define a type for the Shopify Customer Access Token
interface ShopifyCustomerAccessToken {
    accessToken: string;
    expiresAt: string;
}

// Define a type for the Shopify Customer
interface ShopifyCustomer {
    id: string;
    email?: string;
    firstName?: string;
    lastName?: string;
}

// Extend NextAuth's JWT and Session types
declare module "next-auth/jwt" {
    interface JWT {
        id?: string;
        shopifyCustomerId?: string;
        shopifyAccessToken?: string;
        shopifyAccessTokenExpiresAt?: string;
        accessToken?: string; // OAuth access token from provider
        idToken?: string; // OAuth ID token from provider
        error?: string; // To pass error messages
        shopifyLinkFailed?: boolean; // Flag if Shopify interaction failed post-OAuth
        shopifyAccountExists?: boolean; // Flag if Shopify account with this email exists
    }
}

declare module "next-auth" {
    interface Session {
        user: {
            id?: string;
            name?: string | null;
            email?: string | null;
            image?: string | null;
            shopifyCustomerId?: string;
        };
        shopifyAccessToken?: string;
        shopifyAccessTokenExpiresAt?: string;
        error?: string;
        shopifyLinkFailed?: boolean;
        shopifyAccountExists?: boolean;
    }

    interface User extends NextAuthUser {
        shopifyCustomerId?: string;
        shopifyAccessToken?: string;
        shopifyAccessTokenExpiresAt?: string;
        shopifyLinkFailed?: boolean; // For passing status to JWT
        shopifyAccountExists?: boolean;
    }
}

const CREATE_CUSTOMER_MUTATION = `
  mutation customerCreate($input: CustomerCreateInput!) {
    customerCreate(input: $input) {
      customer {
        id
        firstName
        lastName
        email
      }
      customerUserErrors {
        code
        field
        message
      }
    }
  }
`;

const CUSTOMER_ACCESS_TOKEN_CREATE_MUTATION = `
  mutation customerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) {
    customerAccessTokenCreate(input: $input) {
      customerAccessToken {
        accessToken
        expiresAt
      }
      customerUserErrors {
        code
        field
        message
      }
    }
  }
`;

const GET_CUSTOMER_INFO_QUERY = `
  query getCustomerInfo($customerAccessToken: String!) {
    customer(customerAccessToken: $customerAccessToken) {
      id
      email
      firstName
      lastName
    }
  }
`;


export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email", placeholder: "john.doe@example.com" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials, req) {
                if (!credentials?.email || !credentials?.password) {
                    console.log("[NextAuth Credentials] Missing email or password.");
                    throw new Error("Please enter both email and password.");
                }
                console.log(`[NextAuth Credentials] Attempting Shopify login for: ${credentials.email}`);
                try {
                    const tokenResponse = await storeFront(CUSTOMER_ACCESS_TOKEN_CREATE_MUTATION, {
                        input: {
                            email: credentials.email,
                            password: credentials.password,
                        },
                    });

                    if (tokenResponse.data?.customerAccessTokenCreate?.customerAccessToken) {
                        const shopifyToken = tokenResponse.data.customerAccessTokenCreate.customerAccessToken;
                        console.log("[NextAuth Credentials] Shopify login successful, fetching customer info.");

                        const customerInfoResponse = await storeFront(
                            GET_CUSTOMER_INFO_QUERY,
                            { customerAccessToken: shopifyToken.accessToken },
                            shopifyToken.accessToken
                        );

                        if (customerInfoResponse.data?.customer) {
                            const shopifyCustomer = customerInfoResponse.data.customer;
                            console.log("[NextAuth Credentials] Shopify customer info fetched:", shopifyCustomer);
                            return {
                                id: shopifyCustomer.id,
                                email: shopifyCustomer.email,
                                name: `${shopifyCustomer.firstName || ''} ${shopifyCustomer.lastName || ''}`.trim() || shopifyCustomer.email,
                                image: null,
                                shopifyCustomerId: shopifyCustomer.id,
                                shopifyAccessToken: shopifyToken.accessToken,
                                shopifyAccessTokenExpiresAt: shopifyToken.expiresAt,
                            };
                        } else {
                            console.error("[NextAuth Credentials] Shopify: Failed to fetch customer info after login:", customerInfoResponse.errors);
                            throw new Error("Login successful, but failed to retrieve customer details.");
                        }
                    } else {
                        const errors = tokenResponse.data?.customerAccessTokenCreate?.customerUserErrors;
                        const errorMessage = errors?.map((e: any) => e.message).join(", ") || "Invalid credentials or Shopify error.";
                        console.warn("[NextAuth Credentials] Shopify login failed:", errorMessage);
                        throw new Error(errorMessage);
                    }
                } catch (error: any) {
                    console.error("[NextAuth Credentials] Error in authorize:", error);
                    throw new Error(error.message || "An unexpected error occurred during login.");
                }
            }
        }),
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        }),
        AppleProvider({
            clientId: process.env.APPLE_ID as string,
            clientSecret: process.env.APPLE_SECRET as string,
        }),
    ],
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: '/auth/signin',
        error: '/auth/error',
    },
    callbacks: {
        async signIn({ user, account, profile }: { user: NextAuthUser | any, account: Account | null, profile?: Profile | any }) {
            if (account?.provider === "credentials") {
                return true; // Credentials provider handles its own Shopify logic in authorize
            }

            // OAuth Provider Logic (Google, Apple)
            if (!account || !profile || !user.email) {
                console.error("[NextAuth OAuth SignIn] Missing account, profile, or email.");
                return false; // Block NextAuth sign-in if essential OAuth info is missing
            }
            console.log(`[NextAuth OAuth SignIn] Attempting for email: ${user.email} via ${account.provider}`);

            let shopifyCustomerId: string | undefined;
            let shopifyAccessToken: string | undefined;
            let shopifyAccessTokenExpiresAt: string | undefined;
            let shopifyLinkFailed = false;
            let shopifyAccountExists = false; // New flag

            let generatedPassword = `social_${account.provider}_${user.email}_${Date.now().toString(36)}`;
            const maxLength = 40;
            const minLength = 8;
            if (generatedPassword.length > maxLength) {
                generatedPassword = generatedPassword.substring(0, maxLength);
            }
            while (generatedPassword.length < minLength) {
                generatedPassword += "0";
            }
            console.log(`[NextAuth OAuth SignIn] Generated Shopify password (length ${generatedPassword.length}): ${generatedPassword.substring(0, 5)}...`);

            try {
                // Attempt to create the customer in Shopify
                console.log(`[NextAuth OAuth SignIn] Attempting to create Shopify customer for: ${user.email}`);
                const createInput = {
                    email: user.email,
                    firstName: profile.given_name || profile.name?.split(" ")[0] || user.name?.split(" ")[0] || "User",
                    lastName: profile.family_name || profile.name?.split(" ").slice(1).join(" ") || "",
                    password: generatedPassword,
                    acceptsMarketing: false,
                };
                const createCustomerResponse = await storeFront(CREATE_CUSTOMER_MUTATION, { input: createInput });

                const customerUserErrors = createCustomerResponse.data?.customerCreate?.customerUserErrors;
                const hasEmailTakenError = customerUserErrors?.some((err: any) => err.code === "TAKEN" && err.field?.includes("email"));

                if (createCustomerResponse.data?.customerCreate?.customer) {
                    // Successfully created a new Shopify customer
                    const createdShopifyCustomer = createCustomerResponse.data.customerCreate.customer;
                    shopifyCustomerId = createdShopifyCustomer.id;
                    console.log(`[NextAuth OAuth SignIn] Shopify customer CREATED: ID ${shopifyCustomerId}`);

                    // Now, get an access token for this new customer
                    console.log(`[NextAuth OAuth SignIn] Attempting token for new customer: ${user.email}`);
                    const tokenInput = { email: user.email, password: generatedPassword };
                    const tokenResponse = await storeFront(CUSTOMER_ACCESS_TOKEN_CREATE_MUTATION, { input: tokenInput });

                    if (tokenResponse.data?.customerAccessTokenCreate?.customerAccessToken) {
                        const accToken = tokenResponse.data.customerAccessTokenCreate.customerAccessToken;
                        shopifyAccessToken = accToken.accessToken;
                        shopifyAccessTokenExpiresAt = accToken.expiresAt;
                        console.log(`[NextAuth OAuth SignIn] Shopify access token OBTAINED for new customer.`);
                    } else {
                        console.error("[NextAuth OAuth SignIn] Shopify: Failed to get token after new customer creation:", tokenResponse.data?.customerAccessTokenCreate?.customerUserErrors);
                        shopifyLinkFailed = true;
                    }
                } else if (hasEmailTakenError) {
                    // Shopify customer with this email already exists
                    shopifyAccountExists = true; // Set the flag
                    console.log(`[NextAuth OAuth SignIn] Shopify email ${user.email} TAKEN. Account exists.`);
                    shopifyLinkFailed = true; // Mark as true because we can't get a Shopify token for them in this flow without their original password or Multipass
                    console.warn(`[NextAuth OAuth SignIn] Existing Shopify account for ${user.email}. A Shopify access token was NOT generated in this flow for the pre-existing account. NextAuth session will be established.`);
                    // Note: We cannot reliably get shopifyCustomerId or a fresh shopifyAccessToken here for the pre-existing account
                    // without their original password or a more complex account linking flow.
                    // The user will be logged into NextAuth, but Shopify-specific actions requiring a fresh token might be limited.
                } else {
                    // Other errors during customerCreate (including throttling or general GraphQL errors)
                    const shopifyErrors = createCustomerResponse.errors || customerUserErrors;
                    console.error("[NextAuth OAuth SignIn] Shopify: Failed to create or process customer:", JSON.stringify(shopifyErrors, null, 2));
                    shopifyLinkFailed = true;
                    if (shopifyErrors?.some((err: any) => err.extensions?.code === "THROTTLED" || err.code === "THROTTLED")) {
                        console.warn("[NextAuth OAuth SignIn] Shopify customer creation throttled. Allowing NextAuth sign-in, but Shopify linkage failed.");
                    } else {
                        console.warn("[NextAuth OAuth SignIn] Other Shopify customer creation error. Allowing NextAuth sign-in, but Shopify linkage failed.");
                    }
                }
            } catch (error: any) {
                console.error("[NextAuth OAuth SignIn] General error in Shopify interaction:", error.message);
                (user as any).error = error.message; // Pass error to JWT
                shopifyLinkFailed = true; // Mark Shopify interaction as failed
            }

            // Update user object for JWT callback
            if (shopifyCustomerId) (user as any).shopifyCustomerId = shopifyCustomerId;
            if (shopifyAccessToken) (user as any).shopifyAccessToken = shopifyAccessToken;
            if (shopifyAccessTokenExpiresAt) (user as any).shopifyAccessTokenExpiresAt = shopifyAccessTokenExpiresAt;
            (user as any).shopifyLinkFailed = shopifyLinkFailed;
            (user as any).shopifyAccountExists = shopifyAccountExists;

            return true; // Allow NextAuth sign-in if Google/Apple auth was successful
        },
        async jwt({ token, user }) {
            if (user) { // user is only passed on initial sign-in
                token.id = user.id;
                if ((user as any).shopifyCustomerId) token.shopifyCustomerId = (user as any).shopifyCustomerId;
                if ((user as any).shopifyAccessToken) token.shopifyAccessToken = (user as any).shopifyAccessToken;
                if ((user as any).shopifyAccessTokenExpiresAt) token.shopifyAccessTokenExpiresAt = (user as any).shopifyAccessTokenExpiresAt;
                if ((user as any).error) token.error = (user as any).error;
                token.shopifyLinkFailed = (user as any).shopifyLinkFailed; // Always update this from user obj
                token.shopifyAccountExists = (user as any).shopifyAccountExists;
            }
            return token;
        },
        async session({ session, token }) {
            if (token.id) session.user.id = token.id;
            if (token.shopifyCustomerId) session.user.shopifyCustomerId = token.shopifyCustomerId;
            if (token.shopifyAccessToken) session.shopifyAccessToken = token.shopifyAccessToken;
            if (token.shopifyAccessTokenExpiresAt) session.shopifyAccessTokenExpiresAt = token.shopifyAccessTokenExpiresAt;
            if (token.error) session.error = token.error;
            session.shopifyLinkFailed = token.shopifyLinkFailed;
            session.shopifyAccountExists = token.shopifyAccountExists;
            return session;
        },
    },
    debug: process.env.NODE_ENV === 'development',
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
