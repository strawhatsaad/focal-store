// File: src/types/next-auth.d.ts
// (Create this new directory and file if they don't exist)

import { User as DefaultUser, Session as DefaultSession, JWT as DefaultJWT } from "next-auth";

declare module "next-auth/jwt" {
    /**
     * Returned by the `jwt` callback and `getToken`, when using JWT sessions.
     * Extends the default JWT type.
     */
    interface JWT extends DefaultJWT {
        id?: string; // Often 'sub' from provider, or your Shopify customer ID
        shopifyCustomerId?: string;
        shopifyAccessToken?: string;
        shopifyAccessTokenExpiresAt?: string;
        error?: string;
        shopifyLinkFailed?: boolean;
        shopifyAccountExists?: boolean;
        // Default JWT properties (name, email, picture, sub etc.) are inherited from DefaultJWT
    }
}

declare module "next-auth" {
    /**
     * Represents the user object in NextAuth.js.
     * Extends the default User type to include Shopify-specific fields.
     */
    interface User extends DefaultUser {
        // DefaultUser includes: id, name?, email?, image?
        // Add your custom properties:
        shopifyCustomerId?: string;
        shopifyAccessToken?: string;
        shopifyAccessTokenExpiresAt?: string;
        shopifyLinkFailed?: boolean;
        shopifyAccountExists?: boolean;
        // You can add other properties that your authorize/signIn callbacks might add to the user object
    }

    /**
     * Represents the session object.
     * Extends the default Session type, ensuring session.user uses our augmented User type.
     */
    interface Session extends DefaultSession {
        user: User; // Use our augmented User type

        // You can also add custom properties directly to the session if needed
        shopifyAccessToken?: string;
        shopifyAccessTokenExpiresAt?: string;
        error?: string;
        shopifyLinkFailed?: boolean;
        shopifyAccountExists?: boolean;
    }
}
