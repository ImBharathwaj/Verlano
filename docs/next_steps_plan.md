# Verlano — Plan for Adding More to the Application

Use this doc when you want to add more features but aren’t sure where to start. Tasks are grouped by area and ordered by impact and dependency.

---

## Where to start (quick wins)

Pick **one** of these to begin; each is scoped and builds on what you already have.

| Priority | Area               | First task to do |
|----------|--------------------|------------------|
| 1        | **Shop**           | Wire **Sort** dropdown (Latest / Price low–high / Price high–low) to the product query so the grid actually reorders. |
| 2        | **Customer auth**  | ~~Add **customer sign-up and login**~~ ✅ Done: `/login`, `/signup`, session cookie, protect `/account`, header Account/Sign out vs Sign in, checkout attaches `userId`. |
| 3        | **Customer**       | ~~Add **Order history** on `/account`~~ ✅ Done: `GET /api/orders` (auth), order list + detail on account, `/account/orders/[id]`. |
| 4        | **Admin**          | ~~Harden **admin auth**~~ ✅ Done: middleware redirects unauthenticated `/admin/*` to `/admin/login`; `requireAdmin` used on all admin API handlers (cookie or `x-admin-secret`); GET orders/[id] and products/[id] now guarded; admin layout Sign out. |
| 5        | **Discovery**      | ~~Add **meta tags** and **Open Graph**~~ ✅ Done: root layout `metadataBase`/OG/twitter; `/shop` and `/product/[slug]` metadata + `generateMetadata` for product. |
| 6        | **Polish**         | ~~Add **sitemap** and **robots.txt**~~ ✅ Done: `app/sitemap.ts` (/, /shop, all product URLs), `app/robots.ts` (allow /, disallow admin/account/api, sitemap). |

---

## 1. Customer experience

Improve how customers browse, buy, and get support.

### 1.1 Shop page

- [x] **Sort**  
  - Wire the existing Sort dropdown to the products query (e.g. `orderBy` by `createdAt` or `price` asc/desc).  
  - **Start:** In `getProducts()` in `src/app/shop/page.tsx`, read a `sort` search param and pass it to Prisma `orderBy`.  
  - **Done:** `sort` search param added; `getProducts(category, sort)` uses `orderBy` for latest / price-asc / price-desc; Sort dropdown is a GET form that submits on change and preserves category.

- [x] **Pagination**  
  - Add “Load more” or page numbers so customers can see more than the first N products.  
  - **Start:** Add `page` (and maybe `pageSize`) to the shop query and to the URL; optionally add a “Load more” button that fetches the next page.

- [x] **Search**  
  - Simple search by product title/brand (e.g. query param `q` and Prisma `contains`/`mode: 'insensitive'`).  
  - **Done:** Search input in shop hero (GET form to `/shop`); `getProducts(category, sort, q)` filters by title/brand (OR, case-insensitive); category/sort preserved via hidden inputs.

### 1.2 Product detail

- [x] **Wishlist / Save for later**  
  - Let users save products (e.g. in `localStorage` or in DB after you have auth).  
  - **Start:** localStorage key `verlano_wishlist` with array of product IDs; toggle button on PDP and a simple “Saved” page or drawer.

- [x] **Related products**  
  - Show “You may also like” with real data (e.g. same category or random from same brand).  
  - **Done:** Product page queries up to 4 related products by `categories` (hasSome) or `brand`, excludes current; aside uses `ProductGrid` to render them.

### 1.3 Cart & checkout

- [x] **Cart persistence for logged-in users**  
  - When a user logs in, merge guest cart (cookie) with their account cart or replace guest cart with account cart.  
  - **Done:** Login route merges guest cart into user’s cart via `mergeGuestCartIntoUserCart()`; response sets cart cookie to user’s cart id. GET/POST `/api/cart` resolve cart by session when no cookie (logged-in user on new device). `lib/cart.ts` has `mergeGuestCartIntoUserCart` and cart cookie is set on login response.

- [x] **Order confirmation email**  
  - Send a simple email after payment success (order summary + link to track).  
  - **Done:** `lib/order-email.ts` uses Resend; `sendOrderConfirmationEmail(orderId)` called from verify-payment and Razorpay webhook (fire-and-forget). No-op if `RESEND_API_KEY` not set. `.env.example` documents `RESEND_API_KEY` and `RESEND_FROM`.

### 1.4 Orders & support

- [x] **Order history**  
  - List orders for the current user on `/account` (requires auth).  
  - **Done:** `GET /api/orders` (filter by session `userId`), order list on account page with link to `/account/orders/[id]`; order detail page shows items, total, shipping, tracking.

- [x] **Order tracking on a public page**  
  - Page or section where anyone can enter order ID + email and see status and tracking link.  
  - **Done:** `GET /api/orders/by-email?orderId=...&email=...` (validates email against `order.shippingEmail` or `user.email`); `/track-order` page with form and status/tracking display; `Order.shippingEmail` added and collected at checkout; footer link “Track order”.

- [x] **Contact / help**  
  - Simple contact form or “Help” page with email or link to support.  
  - **Done:** `/contact` page with mailto and order tracking link; metadata.

---

## 2. Admin & operations

Make it easier to run the store and fulfill orders.

### 2.1 Admin auth

- [x] **Stable admin login**  
  - All `/admin/*` and `/api/admin/*` routes require a logged-in admin (session or env-based).  
  - **Done:** Middleware redirects unauthenticated `/admin/*` (except `/admin/login`) to `/admin/login`. All admin API handlers call `requireAdmin` (cookie or `x-admin-secret`); GET for orders/[id] and products/[id] now guarded. `requireAdmin` no longer allows all when `ADMIN_SECRET` is unset. Admin layout includes Sign out.

### 2.2 Orders

- [x] **Order list filters**  
  - Filter by status (e.g. pending, paid, shipped), date range, and maybe payment status.  
  - **Done:** Admin orders page uses `searchParams` (orderStatus, paymentStatus); `AdminOrderFilters` client component with dropdowns; Prisma `where` filters orders.

- [x] **Bulk actions**  
  - e.g. “Mark selected as shipped” or “Export selected”.  
  - **Done:** Checkboxes on admin order rows; `PATCH /api/admin/orders/bulk` with `{ ids, action }` (mark_processing, mark_shipped, mark_delivered); `AdminOrdersTable` client component with selection and bulk action bar; `router.refresh()` after success.

- [x] **Shipment creation from admin**  
  - Button “Create shipment” on order detail that calls `POST /api/orders/[id]/ship` and shows tracking.  
  - **Done:** Admin order detail already has "Create shipment" button and tracking display.

### 2.3 Products & inventory

- [x] **Low-stock alerts**  
  - Show products or variants with stock below a threshold (e.g. &lt; 5) on dashboard or products list.  
  - **Done:** Admin dashboard queries variants with no inventory or `stockQuantity < 5`; shows a “Low stock” card with count and up to 10 links to edit product (product title, size, color, qty left).

- [x] **Bulk edit products**  
  - e.g. update category or brand for multiple products.  
  - **Done:** `PATCH /api/admin/products/bulk` with `{ ids, brand?, categories? }`; admin products page uses `AdminProductsTable` with checkboxes and bulk bar (“Update brand” / “Update categories”); categories use shared `CATEGORY_OPTIONS`.

### 2.4 Reporting

- [x] **Simple dashboard metrics**  
  - Revenue today/week/month, orders count, top products.  
  - **Done:** Admin dashboard shows products count, total orders, all-time revenue; plus Today / Last 7 days / Last 30 days (orders count + paid revenue).

---

## 3. Customer authentication & account

Customer auth lets shoppers sign up, sign in, and use account-only features (orders, addresses, profile). Checkout stays guest-friendly; if the user is logged in you can attach the order to their account.

### 3.1 Customer auth (sign up, sign in, sign out)

- [x] **Customer registration (sign up)**  
  - Public sign-up page (e.g. `/login` or `/signup`) and `POST /api/auth/register`. Create `User` with hashed password (e.g. bcrypt), then create session and set cookie.  
  - **Done:** `/signup` page, `POST /api/auth/register` (scrypt hash, session cookie), link from login.

- [x] **Customer login (sign in)**  
  - Login page and `POST /api/auth/login` (email + password, verify password, create session, set HTTP-only cookie).  
  - **Done:** `/login` page, `POST /api/auth/login`, signed cookie `verlano_customer_session` (AUTH_SECRET), `?redirect=` support.

- [x] **Session handling**  
  - Every request that needs “current user” should read the session (cookie or NextAuth `getServerSession`). Expose “current user” in layout or a small `GET /api/auth/session` for the header.  
  - **Done:** `lib/customer-auth.ts` (sign/verify cookie, `getCurrentUser`, `getCurrentUserFromCookieValue`), `GET /api/auth/session`.

- [x] **Sign out**  
  - Sign-out link in header/account that clears the session (e.g. `POST /api/auth/logout` or NextAuth `signOut()`).  
  - **Done:** `POST /api/auth/logout`, “Sign out” button in header.

- [x] **Password reset (forgot password)**  
  - “Forgot password?” on login page; flow: enter email → send reset link (token in DB or JWT) → reset page with new password → update User, invalidate token.  
  - **Done:** `PasswordResetToken` model (userId, token, expiresAt); `POST /api/auth/forgot-password` (create token, send link via Resend); `sendPasswordResetEmail` in `lib/password-reset-email.ts`; `/forgot-password` and `/reset-password?token=...` pages; `POST /api/auth/reset-password` (validate token, hash new password, delete token); “Forgot password?” link on login page. Requires `RESEND_API_KEY` for email.

- [x] **Optional: email verification**  
  - After register, send “Confirm your email” link; mark user as verified when they click.  
  - **Done:** `emailVerifiedAt` on User; `EmailVerificationToken` model; `sendVerificationEmail` in `lib/verification-email.ts`; register creates token and sends link (fire-and-forget); `GET /api/auth/verify-email?token=...` validates token, sets `emailVerifiedAt`, deletes token, redirects to `/account`; signup page note about verifying.

- [x] **Optional: OAuth (Google, etc.)**  
  - “Sign in with Google” using NextAuth OAuth provider.  
  - **Done:** NextAuth with Google provider; OAuth users created/linked in `User` table by email; session contains `userId`. "Sign in with Google" on login and signup; post-OAuth cart merge at `/api/auth/merge-cart`. Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `.env`; use `NEXTAUTH_SECRET` or `AUTH_SECRET`.

### 3.2 Protecting account and linking checkout

- [x] **Protect `/account`**  
  - If no valid session, redirect to login (and optional `?redirect=/account`). After login, show account dashboard (Overview, Orders, Addresses, Profile).  
  - **Done:** `account/layout.tsx` uses `getCurrentUserFromCookieValue` and `redirect('/login?redirect=/account')` when not logged in; account page shows overview.

- [x] **Header: show “Account” vs “Sign in”**  
  - When logged in: “Account” link to `/account` and “Sign out”. When guest: “Sign in” link to `/login`.  
  - **Done:** Header fetches `GET /api/auth/session` and shows Account + Sign out or Sign in.

- [x] **Attach order to user at checkout**  
  - If user is logged in at checkout, set `Order.userId` when creating the order so it appears in their order history.  
  - **Done:** `POST /api/checkout` calls `getCurrentUser(request)` and uses `currentUser?.id ?? cart.userId` for `Order.userId`.

### 3.3 Account features (after auth)

- [x] **Saved addresses**  
  - CRUD for `Address` tied to the current user; use in checkout.  
  - **Done:** `GET/POST /api/account/addresses`, `PATCH/DELETE /api/account/addresses/[id]`; “Addresses” section on account page with `AddressesSection` (list, add, edit, remove).

- [x] **Profile edit**  
  - Update name, email, phone.  
  - **Done:** `GET/PATCH /api/account/profile`; “Profile” section on account with `ProfileForm` (name, email, phone; unique email check on update).

---

## 4. Discovery & SEO

Help customers and search engines find your pages.

- [x] **Meta tags**  
  - Per-page `<title>`, `<meta name="description">`, and Open Graph tags for `/`, `/shop`, `/product/[slug]`.  
  - **Done:** Root layout `metadataBase`, default title/description, openGraph, twitter; `/shop` and `/product/[slug]` metadata; product page uses `generateMetadata` with title, description, image.

- [x] **Sitemap**  
  - `/sitemap.xml` with homepage, `/shop`, and all product URLs.  
  - **Done:** `app/sitemap.ts` returns static routes (/, /shop) and product URLs from Prisma.

- [x] **robots.txt**  
  - Allow crawlers and point to sitemap.  
  - **Done:** `app/robots.ts` allows `/`, disallows `/admin/`, `/account/`, `/api/`, `/login`, `/signup`, `/checkout/`, sitemap URL.

- [x] **Structured data**  
  - JSON-LD for Product on PDP (name, image, price, availability).  
  - **Done:** Product page includes `<script type="application/ld+json">` with Product schema (name, description, image, brand, offers with price, priceCurrency INR, availability, url).

---

## 5. Performance & polish

Make the app faster and more reliable.

- [x] **Image optimization**  
  - Use Next.js `Image` where possible; ensure MinIO (or CDN) URLs are in `remotePatterns`; consider responsive `sizes`.  
  - **Done:** `OptimizedProductImage` used for ProductCard, ProductGallery (main + thumbnails); MinIO URLs (10.42.0.221, 127.0.0.1, localhost) in `remotePatterns` and optimized; HeroCarousel, BrandsCarousel, homepage editorial already use `next/image` with `sizes`.

- [x] **Loading states**  
  - You have `loading.tsx` for shop; add the same for `/product/[slug]`, `/cart`, `/checkout` if needed.  
  - **Done:** `loading.tsx` added for product detail, cart, and checkout with skeleton placeholders.

- [x] **Error boundaries**  
  - `error.tsx` for key routes so failures show a friendly message and retry.  
  - **Done:** `app/error.tsx`, `app/shop/error.tsx`, and `app/product/[slug]/error.tsx` with friendly message, “Try again” (reset), and link to shop/home.

- [x] **Analytics**  
  - Optional: Google Analytics, Plausible, or Microsoft Clarity.  
  - **Done:** `Analytics` client component; supports Plausible (`NEXT_PUBLIC_PLAUSIBLE_DOMAIN`) or GA4 (`NEXT_PUBLIC_GA_MEASUREMENT_ID`); loads via `next/script`; `.env.example` documents both.

---

## 6. Backlog (later)

Ideas to park for when the above is in place.

- ~~**Reviews & ratings**~~ — Not needed.
- **Discounts / coupons** — Coupon codes at checkout; store in DB and validate in checkout API.
- **Multi-currency** — Show prices in another currency (e.g. USD) or switch locale.
- [x] **Email marketing** — Capture email on homepage or checkout and send to Resend list. **Done:** `NewsletterSubscriber` model; `POST /api/newsletter` (stores in DB, syncs to Resend contacts); homepage "Early access" form; checkout opt-in checkbox; `lib/newsletter.ts` for Resend sync. Requires `RESEND_API_KEY`.
- [x] **Inventory reservations** — **Done:** Reserve stock for 15 min when “Add to cart” or at checkout start.
- **Admin audit log** — Log who changed what (e.g. order status, product price) for support.

---

## How to use this plan

1. **Pick one “Where to start” item** and do it end-to-end (API + UI if needed).
2. **Mark it done** in this file (e.g. change `- [ ]` to `- [x]`) and optionally add a one-line “Done: …” under the task.
3. **Move to the next** item in the same section or switch to another section.
4. **Refer to existing docs** when relevant: `DEVELOPMENT.md`, `docs/shop_page_plan.md`, `docs/ERD.md`, `docs/feature_breakdown.md`.
5. **See [docs/development_plan_next.md](./development_plan_next.md)** for a full application review and prioritized next steps.

If you tell me which area you want to focus on first (e.g. “Customer auth”, “Shop sort”, “Order history”, “Admin auth”, “SEO”), I can break that into concrete steps and suggest exact files and code changes.
