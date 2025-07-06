// File: src/lib/authOptions.ts

import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import {
  storeFront,
  shopifyAdminRequest,
  CREATE_SHOPIFY_CUSTOMER_MUTATION,
  CUSTOMER_ACCESS_TOKEN_CREATE_MUTATION,
  GET_CUSTOMER_INFO_QUERY,
  GET_CUSTOMER_BY_EMAIL_QUERY,
  CREATE_CUSTOMER_ADMIN_MUTATION,
  CUSTOMER_UPDATE_MUTATION, // Import the update mutation
} from "../../utils"; // Ensure this path is correct

// Type definitions are augmented globally via src/types/next-auth.d.ts

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials): Promise<import("next-auth").User | null> {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please enter both email and password.");
        }
        try {
          const tokenResponse = await storeFront(
            CUSTOMER_ACCESS_TOKEN_CREATE_MUTATION,
            {
              input: {
                email: credentials.email,
                password: credentials.password,
              },
            }
          );

          if (
            tokenResponse.data?.customerAccessTokenCreate?.customerAccessToken
          ) {
            const shopifyToken =
              tokenResponse.data.customerAccessTokenCreate.customerAccessToken;
            const customerInfoResponse = await storeFront(
              GET_CUSTOMER_INFO_QUERY,
              { customerAccessToken: shopifyToken.accessToken },
              shopifyToken.accessToken
            );

            if (customerInfoResponse.data?.customer) {
              const shopifyCustomer = customerInfoResponse.data.customer;

              // **Verification Check**
              if (!shopifyCustomer.tags.includes("verified")) {
                throw new Error(
                  "Account not verified. Please check your email for a verification link."
                );
              }

              return {
                id: shopifyCustomer.id,
                email: shopifyCustomer.email,
                name:
                  `${shopifyCustomer.firstName || ""} ${
                    shopifyCustomer.lastName || ""
                  }`.trim() || shopifyCustomer.email,
                image: null,
                shopifyCustomerId: shopifyCustomer.id,
                shopifyAccessToken: shopifyToken.accessToken,
                shopifyAccessTokenExpiresAt: shopifyToken.expiresAt,
                emailVerified: true,
              };
            }
            throw new Error(
              "Login successful, but failed to retrieve customer details from Shopify."
            );
          }

          const errors =
            tokenResponse.data?.customerAccessTokenCreate?.customerUserErrors;
          if (errors && errors.length > 0) {
            const message = errors.map((e: any) => e.message).join(", ");
            if (message.toLowerCase().includes("unidentified customer")) {
              throw new Error("Invalid email or password.");
            }
            throw new Error(message);
          }
          throw new Error("Invalid email or password.");
        } catch (error: any) {
          console.error(
            "[NextAuth Credentials] Error in authorize:",
            error.message
          );
          throw new Error(error.message || "An error occurred during login.");
        }
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/signin",
    // A page to show after email verification
    verifyRequest: "/auth/verify-request",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        if (!profile?.email) {
          throw new Error("No email returned from Google");
        }

        try {
          const customerResponse = await shopifyAdminRequest(
            GET_CUSTOMER_BY_EMAIL_QUERY,
            { email: `email:${profile.email}` }
          );
          let shopifyCustomer =
            customerResponse.data?.customers?.edges[0]?.node;

          let isNewUser = false;

          if (!shopifyCustomer) {
            const nameParts = profile.name?.split(" ") || [];
            const firstName = nameParts[0] || "";
            const lastName = nameParts.slice(1).join(" ") || "";

            const createCustomerResponse = await shopifyAdminRequest(
              CREATE_CUSTOMER_ADMIN_MUTATION,
              {
                input: {
                  email: profile.email,
                  firstName,
                  lastName,
                  // **Automatically verify Google sign-ups**
                  tags: ["verified"],
                },
              }
            );

            if (createCustomerResponse.data?.customerCreate?.customer) {
              shopifyCustomer =
                createCustomerResponse.data.customerCreate.customer;
              isNewUser = true;
            } else {
              const errorMessages =
                createCustomerResponse.data?.customerCreate?.userErrors
                  .map((e: any) => e.message)
                  .join(", ") || "Failed to create Shopify customer.";
              throw new Error(errorMessages);
            }
          } else {
            // If user exists, ensure they are marked as verified
            if (!shopifyCustomer.tags.includes("verified")) {
              await shopifyAdminRequest(CUSTOMER_UPDATE_MUTATION, {
                input: {
                  id: shopifyCustomer.id,
                  tags: [...shopifyCustomer.tags, "verified"],
                },
              });
            }
          }

          user.shopifyCustomerId = shopifyCustomer.id;
          user.isNewUser = isNewUser;
          user.name = profile.name;
          user.email = profile.email;
          user.image = profile.image;
          user.emailVerified = true;
        } catch (error: any) {
          console.error("Error during Google sign-in:", error);
          throw new Error(`An error occurred during sign-in: ${error.message}`);
        }
      }
      return true;
    },

    async jwt({ token, user, account }) {
      const internalUser = user as import("next-auth").User;
      if (internalUser) {
        token.id = internalUser.id;
        token.name = internalUser.name;
        token.email = internalUser.email;
        token.picture = internalUser.image;
        token.shopifyCustomerId = internalUser.shopifyCustomerId;
        token.isNewUser = internalUser.isNewUser;
        token.emailVerified = internalUser.emailVerified;
      }

      if (
        account?.provider === "google" &&
        token.shopifyCustomerId &&
        !token.shopifyAccessToken
      ) {
        try {
          token.shopifyAccessToken = undefined;
          token.shopifyAccessTokenExpiresAt = undefined;
        } catch (e) {
          console.error("Error creating access token for Google user", e);
          token.error = "Could not create a Shopify session.";
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (!session.user)
        session.user = {} as import("next-auth").Session["user"];

      if (token.id) session.user.id = token.id as string;
      if (token.name) session.user.name = token.name;
      if (token.email) session.user.email = token.email;
      if (token.picture) session.user.image = token.picture;

      session.user.shopifyCustomerId = token.shopifyCustomerId as
        | string
        | undefined;
      session.user.emailVerified = token.emailVerified as boolean | undefined;
      session.shopifyAccessToken = token.shopifyAccessToken as
        | string
        | undefined;
      session.shopifyAccessTokenExpiresAt =
        token.shopifyAccessTokenExpiresAt as string | undefined;
      session.isNewUser = token.isNewUser as boolean | undefined;

      if (token.error) session.error = token.error as string | undefined;

      return session;
    },
  },
  debug: process.env.NODE_ENV === "development",
};
