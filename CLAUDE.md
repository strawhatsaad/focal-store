# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # next dev (local development)
npm run build    # next build (production build)
npm run start    # next start (run the built app)
npm run lint     # next lint (ESLint via next/core-web-vitals)
```

No test runner is configured in this project.

## Architecture

This is a Next.js 14 **App Router** storefront for Focal Optical (contact lenses, eyeglasses, sunglasses) that is fully backed by Shopify. The frontend renders in Next.js but all commerce state — customers, products, carts, orders, addresses, prescriptions — lives in Shopify and is reached through two APIs:

- **Storefront API** (client-safe, public access token) — used for product queries, cart mutations, customer login/registration, addresses, order history. Called via `storeFront()` in [utils/index.js](utils/index.js) from both the browser and server.
- **Admin API** (server-only, private access token) — used for draft orders, customer lookup/tagging, metafields, file uploads, product search. Called via `shopifyAdminRequest()` in [utils/index.js](utils/index.js). **Never call this from a client component** — it would leak the admin token.

All GraphQL queries, mutations, and helper wrappers are centralized in [utils/index.js](utils/index.js). When adding a new Shopify operation, add the query/mutation there and export a typed helper rather than inlining GraphQL at call sites.

### Authentication (NextAuth + Shopify)

[src/lib/authOptions.ts](src/lib/authOptions.ts) bridges NextAuth to Shopify customers. Two providers:

- **Credentials** — calls `customerAccessTokenCreate` on the Storefront API; rejects customers whose Shopify tags don't include `"verified"`.
- **Google** — on sign-in, looks up the customer by email via Admin API; if missing, creates one tagged `"verified"`; if found without the tag, adds it.

The session object is augmented (see [src/types/next-auth.d.ts](src/types/next-auth.d.ts)) to carry `shopifyCustomerId` (GID like `gid://shopify/Customer/…`) and a `shopifyAccessToken` used for customer-scoped Storefront calls.

**Email verification flow** for the Credentials path: [/api/auth/signup](src/app/api/auth/signup/route.ts) does *not* create the Shopify customer — it signs a JWT (jose, 1h TTL) carrying `{ email, password, firstName, lastName }` and emails a link. [/api/auth/verify](src/app/api/auth/verify/route.ts) verifies the JWT, then creates the customer via Storefront API and tags them `"verified"` via Admin API.

### Cart state ([src/context/CartContext.tsx](src/context/CartContext.tsx))

- Cart ID is persisted in `localStorage` as `focalCartId`. On mount the provider refetches that cart from Shopify, or creates a new one.
- **Donation product auto-management**: after every cart mutation, `checkAndManageDonationProduct` inspects line-item `FocalProductType` attributes and ensures the donation variant (`DONATION_PRODUCT_VARIANT_ID`, hard-coded) is present iff the cart contains eyeglasses or ≥4 contact-lens boxes. Any new code that adds/removes cart lines must set the `FocalProductType` attribute (`"Eyeglasses"` or `"ContactLenses"`) or this logic will misfire.
- After checkout begins, the client writes `pendingCheckout: { draftOrderId, cartId }` to localStorage. On next mount the provider polls [/api/checkout/order-status](src/app/api/checkout/order-status/route.ts); if the draft order is `COMPLETED`, it clears the cart and starts a fresh one.
- `isFirstTimeCustomer` is resolved from [/api/account/status](src/app/api/account/status/route.ts) (guests default to `true`).

### Checkout (draft-order based, not the standard Shopify checkout)

[/api/checkout/create-draft-order](src/app/api/checkout/create-draft-order/route.ts) builds a draft order with `originalUnitPrice` set to the client-supplied `customizedPrice` (per-line, because lens/prescription add-ons produce prices that differ from the Shopify variant price). A 20% first-time-customer `appliedDiscount` is added when `numberOfOrders === 0`. The returned `invoiceUrl` is where the user actually pays. The draft order's `note` is set to `reorder_token:<cartToken>` so reorder links can later find the order.

### Reorder flow

[src/middleware.ts](src/middleware.ts) rewrites `GET /cart?cart_link_id=…` to `/reorder` (URL stays the same in the browser). The [/api/reorder](src/app/api/reorder/route.ts) endpoint finds the previous order by querying for `note:"reorder_token:<id>"` via Admin API, verifies the authenticated user owns it, and adds its line items (with attributes preserved) to the user's current cart. It also infers a missing `FocalProductType` attribute from legacy line items before copying them over.

### Prescription storage

Prescriptions are uploaded client-side to **Vercel Blob** (via [/api/upload](src/app/api/upload/route.ts)), then the returned blob URL plus metadata is posted to [/api/account/prescriptions](src/app/api/account/prescriptions/route.ts), which stores the full list as a JSON-string value on the customer's `focal_rx.uploaded_prescriptions` metafield (Admin API). Deletion removes both the metafield entry and the underlying blob. If metafield save fails after upload, the route deletes the blob to avoid orphans — preserve that pattern when editing.

### Product pages — two routes

Two distinct product detail routes exist and must stay in sync:

- [src/app/products/\[slug\]/page.tsx](src/app/products/[slug]/page.tsx) — **generic / contact lenses**. Fetches contact-lens-specific metafields (`diameter_dia`, `base_curve_b_c`, `add`, `axis`, `cylinder_cyl`) and renders the shared `Hero`.
- [src/app/products/eyewear/\[slug\]/page.tsx](src/app/products/eyewear/[slug]/page.tsx) — **eyeglasses / sunglasses**. Renders `EyewearHero` (different flow with frame selection + Rx method).

When linking to products elsewhere, route eyewear/sunglasses to `/products/eyewear/<handle>` and contact lenses to `/products/<handle>` — see the branching in `RelatedProducts` mapping logic.

### Path alias and SVG handling

- `@/*` in [tsconfig.json](tsconfig.json) → `./src/*`. Note `utils/` and `lib/` are at the repo root, *outside* `src/`, so they're imported with long relative paths like `../../utils` rather than `@/utils`.
- [next.config.mjs](next.config.mjs) configures `@svgr/webpack` so `import Logo from './x.svg'` gives a React component. For a URL string, import with `./x.svg?url`.
- Remote image hosts are whitelisted: `cdn.shopify.com`, `placehold.co`, `lh3.googleusercontent.com` — add to `next.config.mjs` before using new hosts with `next/image`.

### Tailwind

Custom breakpoints are `sm: 375px`, `md: 768px`, `lg: 1200px` (not Tailwind defaults). Default font is DM Sans via the `--font-dm-sans` CSS variable wired in [src/app/layout.tsx](src/app/layout.tsx).

## Required environment variables

No `.env.example` is committed. At minimum:

- Shopify: `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_STOREFRONT_ACCESS_TOKEN`, `SHOPIFY_SHOP_NAME`, `SHOPIFY_ADMIN_API_ACCESS_TOKEN`, `SHOPIFY_ADMIN_API_VERSION` (defaults to `2024-07`)
- NextAuth: `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- Email (nodemailer, SMTPS): `EMAIL_SERVER_HOST`, `EMAIL_SERVER_PORT`, `EMAIL_SERVER_USER`, `EMAIL_SERVER_PASSWORD`, `EMAIL_FROM`
- Vercel Blob: `BLOB_READ_WRITE_TOKEN` (implicit via `@vercel/blob`)
