// File: src/lib/authOptions.ts

import { NextAuthOptions, User as NextAuthUserOriginal, Account, Profile } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import AppleProvider from "next-auth/providers/apple";
// Removed getShopifyCustomerByEmail as it's not a valid Storefront API approach for general lookup
import { storeFront } from "../../utils";

// Type definitions for Shopify data
interface ShopifyCustomerAccessToken {
    accessToken: string;
    expiresAt: string;
}

interface ShopifyCustomer {
    id: string;
    email?: string;
    firstName?: string;
    lastName?: string;
}

// The User, Session, and JWT types are augmented globally via src/types/next-auth.d.ts

// GraphQL Constants
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
                            return {
                                id: shopifyCustomer.id,
                                email: shopifyCustomer.email,
                                name: `${shopifyCustomer.firstName || ''} ${shopifyCustomer.lastName || ''}`.trim() || shopifyCustomer.email,
                                image: null,
                                shopifyCustomerId: shopifyCustomer.id,
                                shopifyAccessToken: shopifyToken.accessToken,
                                shopifyAccessTokenExpiresAt: shopifyToken.expiresAt,
                                shopifyLinkFailed: false,
                                shopifyAccountExists: true,
                            };
                        }
                        throw new Error("Login successful, but failed to retrieve customer details.");
                    }
                    const errors = tokenResponse.data?.customerAccessTokenCreate?.customerUserErrors;
                    throw new Error(errors?.map((e: any) => e.message).join(", ") || "Invalid credentials.");
                } catch (error: any) {
                    console.error("[NextAuth Credentials] Error in authorize:", error.message);
                    throw new Error(error.message || "Login error.");
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
    session: { strategy: "jwt" },
    pages: { signIn: '/auth/signin', error: '/auth/error' },
    callbacks: {
        async signIn({ user, account, profile }) {
            const internalUser = user as import("next-auth").User;

            if (account?.provider === "credentials") {
                return true;
            }

            if (!account || !profile || !internalUser.email) {
                console.error("[NextAuth OAuth SignIn] Missing account, profile, or email.");
                return false;
            }
            console.log(`[NextAuth OAuth SignIn] Attempting for email: ${internalUser.email} via ${account.provider}`);

            let shopifyCustomerId: string | undefined;
            let shopifyAccessToken: string | undefined;
            let shopifyAccessTokenExpiresAt: string | undefined;
            let shopifyLinkFailed = false;
            let shopifyAccountExists = false;

            let generatedPassword = `social_${account.provider}_${internalUser.email}_${Date.now().toString(36)}`;
            const maxLength = 40; const minLength = 8;
            if (generatedPassword.length > maxLength) generatedPassword = generatedPassword.substring(0, maxLength);
            while (generatedPassword.length < minLength) generatedPassword += "0";

            try {
                const createInput = {
                    email: internalUser.email,
                    firstName: (profile as any).given_name || internalUser.name?.split(" ")[0] || "User",
                    lastName: (profile as any).family_name || internalUser.name?.split(" ").slice(1).join(" ") || "",
                    password: generatedPassword, acceptsMarketing: false,
                };

                console.log(`[NextAuth OAuth SignIn] Attempting to create Shopify customer for: ${internalUser.email}`);
                const createCustomerResponse = await storeFront(CREATE_CUSTOMER_MUTATION, { input: createInput });

                const customerUserErrors = createCustomerResponse.data?.customerCreate?.customerUserErrors;
                const emailTakenError = customerUserErrors?.find((err: any) => err.code === "TAKEN" && Array.isArray(err.field) && err.field.includes("email"));

                if (createCustomerResponse.data?.customerCreate?.customer) {
                    const createdShopifyCustomer = createCustomerResponse.data.customerCreate.customer;
                    shopifyCustomerId = createdShopifyCustomer.id;
                    shopifyAccountExists = true;
                    console.log(`[NextAuth OAuth SignIn] Shopify customer CREATED: ID ${shopifyCustomerId}`);

                    console.log(`[NextAuth OAuth SignIn] Attempting token for new customer: ${internalUser.email}`);
                    const tokenInput = { email: internalUser.email, password: generatedPassword };
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
                } else if (emailTakenError) {
                    shopifyAccountExists = true;
                    console.log(`[NextAuth OAuth SignIn] Shopify email ${internalUser.email} TAKEN (Error: ${emailTakenError.message}). Account exists.`);
                    // Cannot reliably fetch shopifyCustomerId here for a pre-existing account with Storefront API alone
                    // if it wasn't created via this social flow initially.
                    // The getShopifyCustomerByEmail using a general 'customers' query was invalid.
                    // shopifyCustomerId will remain undefined in this branch for this specific sign-in.
                    shopifyLinkFailed = true;
                    console.warn(`[NextAuth OAuth SignIn] Existing Shopify account for ${internalUser.email}. A Shopify access token and specific customer ID were NOT obtained in this flow for the pre-existing account. NextAuth session will be established.`);
                } else {
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
                console.error("[NextAuth OAuth SignIn] General error in Shopify interaction (outer catch):", error.message);

                if (error.message && (error.message.toLowerCase().includes("email has already been taken") || error.message.toLowerCase().includes("taken"))) {
                    shopifyAccountExists = true;
                    console.log(`[NextAuth OAuth SignIn] Caught 'Email Taken' error for ${internalUser.email} in outer catch.`);
                }

                (internalUser as any).error = error.message;
                shopifyLinkFailed = true;
            }

            internalUser.shopifyCustomerId = shopifyCustomerId;
            internalUser.shopifyAccessToken = shopifyAccessToken;
            internalUser.shopifyAccessTokenExpiresAt = shopifyAccessTokenExpiresAt;
            internalUser.shopifyLinkFailed = shopifyLinkFailed;
            internalUser.shopifyAccountExists = shopifyAccountExists;

            return true;
        },
        async jwt({ token, user }) {
            if (user) {
                const internalUser = user as import("next-auth").User;
                token.id = internalUser.id;
                token.name = internalUser.name;
                token.email = internalUser.email;
                token.picture = internalUser.image;

                token.shopifyCustomerId = internalUser.shopifyCustomerId;
                token.shopifyAccessToken = internalUser.shopifyAccessToken;
                token.shopifyAccessTokenExpiresAt = internalUser.shopifyAccessTokenExpiresAt;
                token.shopifyLinkFailed = internalUser.shopifyLinkFailed;
                token.shopifyAccountExists = internalUser.shopifyAccountExists;
                if ((internalUser as any).error) token.error = (internalUser as any).error;
            }
            return token;
        },
        async session({ session, token }) {
            if (!session.user) session.user = {} as import("next-auth").Session["user"];

            if (token.sub) session.user.id = token.sub;
            if (token.name) session.user.name = token.name;
            if (token.email) session.user.email = token.email;
            if (token.picture) session.user.image = token.picture;

            session.user.shopifyCustomerId = token.shopifyCustomerId as string | undefined;

            session.shopifyAccessToken = token.shopifyAccessToken as string | undefined;
            session.shopifyAccessTokenExpiresAt = token.shopifyAccessTokenExpiresAt as string | undefined;
            session.error = token.error as string | undefined;
            session.shopifyLinkFailed = token.shopifyLinkFailed as boolean | undefined;
            session.shopifyAccountExists = token.shopifyAccountExists as boolean | undefined;

            return session;
        },
    },
    debug: process.env.NODE_ENV === 'development',
};
