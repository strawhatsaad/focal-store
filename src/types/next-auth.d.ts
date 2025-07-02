// File: src/types/next-auth.d.ts

import {
  User as DefaultUser,
  Session as DefaultSession,
  JWT as DefaultJWT,
} from "next-auth";

declare module "next-auth/jwt" {
  /**
   * Returned by the `jwt` callback and `getToken`, when using JWT sessions.
   * Extends the default JWT type.
   */
  interface JWT extends DefaultJWT {
    id?: string; // NextAuth's internal ID, often 'sub' from provider, or Shopify Customer GID
    shopifyCustomerId?: string; // Shopify Customer GID, e.g., "gid://shopify/Customer/12345"
    shopifyAccessToken?: string; // Shopify Storefront API customer access token
    shopifyAccessTokenExpiresAt?: string;
    error?: string; // To pass errors from authorize/signIn to session
    isNewUser?: boolean; // Flag for new OAuth users
  }
}

declare module "next-auth" {
  /**
   * Represents the user object in NextAuth.js.
   * Extends the default User type to include Shopify-specific fields.
   */
  interface User extends DefaultUser {
    // DefaultUser includes: id, name?, email?, image?
    // 'id' here will be set to Shopify Customer GID by the authorize callback.
    shopifyCustomerId?: string; // Shopify Customer GID
    shopifyAccessToken?: string; // Shopify Storefront API customer access token
    shopifyAccessTokenExpiresAt?: string;
    isNewUser?: boolean; // Flag for new OAuth users
  }

  /**
   * Represents the session object.
   * Extends the default Session type, ensuring session.user uses our augmented User type.
   */
  interface Session extends DefaultSession {
    user: User; // Use our augmented User type

    // You can also add custom properties directly to the session if needed
    shopifyAccessToken?: string; // Shopify Storefront API customer access token
    shopifyAccessTokenExpiresAt?: string;
    error?: string; // For displaying errors on client
    isNewUser?: boolean; // Flag for new OAuth users
  }
}
