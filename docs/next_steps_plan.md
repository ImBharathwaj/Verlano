# Verlano — Plan for Adding More to the Application

Use this doc when you want to add more features but aren’t sure where to start. Tasks are grouped by area and ordered by impact and dependency.

---

## Where to start (quick wins)

Pick **one** of these to begin; each is scoped and builds on what you already have.

| Priority | Area               | First task to do |
|----------|--------------------|------------------|
| 1        | **Shop**           | Wire **Sort** dropdown (Latest / Price low–high / Price high–low) to the product query so the grid actually reorders. |
| 2        | **Customer auth**  | Add **customer sign-up and login** (register + login pages, session cookie, protect `/account`). |
| 3        | **Customer**       | Add **Order history** on `/account`: list the user’s orders (after you have auth) or show “Sign in to see orders” and a simple order lookup by email + order ID. |
| 4        | **Admin**          | Harden **admin auth**: ensure all `/admin/*` and `/api/admin/*` routes require login (cookie/session or env-based gate). |
| 5        | **Discovery**      | Add **meta tags** and **Open Graph** for homepage, `/shop`, and `/product/[slug]` (title, description, image). |
| 6        | **Polish**         | Add a **sitemap** (`/sitemap.xml`) and optional **robots.txt** for SEO. |

---

## 1. Customer experience

Improve how customers browse, buy, and get support.

### 1.1 Shop page

- [ ] **Sort**  
  - Wire the existing Sort dropdown to the products query (e.g. `orderBy` by `createdAt` or `price` asc/desc).  
  - **Start:** In `getProducts()` in `src/app/shop/page.tsx`, read a `sort` search param and pass it to Prisma `orderBy`.

- [ ] **Pagination**  
  - Add “Load more” or page numbers so customers can see more than the first N products.  
  - **Start:** Add `page` (and maybe `pageSize`) to the shop query and to the URL; optionally add a “Load more” button that fetches the next page.

- [ ] **Search**  
  - Simple search by product title/brand (e.g. query param `q` and Prisma `contains`/`mode: 'insensitive'`).  
  - **Start:** Add a search input that navigates to `/shop?q=...` and filter in `getProducts()`.

### 1.2 Product detail

- [ ] **Wishlist / Save for later**  
  - Let users save products (e.g. in `localStorage` or in DB after you have auth).  
  - **Start:** localStorage key `verlano_wishlist` with array of product IDs; toggle button on PDP and a simple “Saved” page or drawer.

- [ ] **Related products**  
  - Show “You may also like” with real data (e.g. same category or random from same brand).  
  - **Start:** In `src/app/product/[slug]/page.tsx`, query 4 products by `categories` overlap or `brand`, excluding current product, and pass to the existing aside.

### 1.3 Cart & checkout

- [ ] **Cart persistence for logged-in users**  
  - When a user logs in, merge guest cart (cookie) with their account cart or replace guest cart with account cart.  
  - **Start:** After implementing auth, in login callback call an API that merges `verlano_cart_id` cart into the user’s cart and clear the cookie.

- [ ] **Order confirmation email**  
  - Send a simple email after payment success (order summary + link to track).  
  - **Start:** Use Resend, SendGrid, or Nodemailer; call from payment success flow (e.g. after verify-payment or webhook) with order details.

### 1.4 Orders & support

- [ ] **Order history**  
  - List orders for the current user on `/account` (requires auth).  
  - **Start:** `GET /api/orders` (filter by `userId` from session) and a simple table or list on account page.

- [ ] **Order tracking on a public page**  
  - Page or section where anyone can enter order ID + email and see status and tracking link.  
  - **Start:** `GET /api/orders/by-email?orderId=...&email=...` (validate email matches order) and a minimal “Track order” page.

- [ ] **Contact / help**  
  - Simple contact form or “Help” page with email or link to support.  
  - **Start:** Static page with mailto or embed a form that POSTs to an API and sends an email.

---

## 2. Admin & operations

Make it easier to run the store and fulfill orders.

### 2.1 Admin auth

- [ ] **Stable admin login**  
  - All `/admin/*` and `/api/admin/*` routes require a logged-in admin (session or env-based).  
  - **Start:** Review `requireAdmin` and login flow; ensure cookie/session is set and checked on every admin route and redirect to `/admin/login` when not authenticated.

### 2.2 Orders

- [ ] **Order list filters**  
  - Filter by status (e.g. pending, paid, shipped), date range, and maybe payment status.  
  - **Start:** Add query params to `GET /api/admin/orders` and filters in the admin orders list UI.

- [ ] **Bulk actions**  
  - e.g. “Mark selected as shipped” or “Export selected”.  
  - **Start:** Checkboxes on order rows, then a small API like `PATCH /api/admin/orders/bulk` with `{ ids, action }`.

- [ ] **Shipment creation from admin**  
  - Button “Create shipment” on order detail that calls `POST /api/orders/[id]/ship` and shows tracking.  
  - **Start:** Add button on `/admin/orders/[id]` that calls the existing ship API and displays tracking ID/URL.

### 2.3 Products & inventory

- [ ] **Low-stock alerts**  
  - Show products or variants with stock below a threshold (e.g. &lt; 5) on dashboard or products list.  
  - **Start:** Query variants where `inventory.stockQuantity < 5` and show count or list on `/admin` or `/admin/products`.

- [ ] **Bulk edit products**  
  - e.g. update category or brand for multiple products.  
  - **Start:** Select multiple products and a single “Update category” or “Update brand” action with one PATCH request.

### 2.4 Reporting

- [ ] **Simple dashboard metrics**  
  - Revenue today/week/month, orders count, top products.  
  - **Start:** Add Prisma queries on `/admin` for `Order` (sum totalAmount, count) grouped by day/week; optional top products from OrderItems.

---

## 3. Customer authentication & account

Customer auth lets shoppers sign up, sign in, and use account-only features (orders, addresses, profile). Checkout stays guest-friendly; if the user is logged in you can attach the order to their account.

### 3.1 Customer auth (sign up, sign in, sign out)

- [ ] **Customer registration (sign up)**  
  - Public sign-up page (e.g. `/login` or `/signup`) and `POST /api/auth/register`. Create `User` with hashed password (e.g. bcrypt), then create session and set cookie.  
  - **Start:** Use existing Prisma `User` model; add `POST /api/auth/register` (validate email uniqueness, hash password, create user, call same session logic as login); add sign-up form that POSTs to it.

- [ ] **Customer login (sign in)**  
  - Login page and `POST /api/auth/login` (email + password, verify password, create session, set HTTP-only cookie).  
  - **Start:** NextAuth with Credentials provider (store user id in session), or custom: `POST /api/auth/login` that sets a signed cookie (e.g. `verlano_session`) with `userId` and expiry; middleware or layout reads it to know current user.

- [ ] **Session handling**  
  - Every request that needs “current user” should read the session (cookie or NextAuth `getServerSession`). Expose “current user” in layout or a small `GET /api/auth/session` for the header.  
  - **Start:** If custom cookie: create `lib/session.ts` to sign/verify cookie and `getCurrentUser()`; use in layout and in APIs that need `userId`.

- [ ] **Sign out**  
  - Sign-out link in header/account that clears the session (e.g. `POST /api/auth/logout` or NextAuth `signOut()`).  
  - **Start:** Button that calls logout API or `signOut()` and redirects to `/` or `/shop`.

- [ ] **Password reset (forgot password)**  
  - “Forgot password?” on login page; flow: enter email → send reset link (token in DB or JWT) → reset page with new password → update User, invalidate token.  
  - **Start:** `POST /api/auth/forgot-password` (create reset token + expiry in DB or sign JWT, send email with link); `/reset-password?token=...` page and `POST /api/auth/reset-password` to set new password.

- [ ] **Optional: email verification**  
  - After register, send “Confirm your email” link; mark user as verified when they click.  
  - **Start:** Add `emailVerifiedAt` (or `isEmailVerified`) on User; send verification link from register API; `GET /api/auth/verify-email?token=...` sets it and redirects to account.

- [ ] **Optional: OAuth (Google, etc.)**  
  - “Sign in with Google” using NextAuth OAuth provider.  
  - **Start:** Add Google provider in NextAuth; ensure OAuth user is created/linked in `User` table and session contains `userId`.

### 3.2 Protecting account and linking checkout

- [ ] **Protect `/account`**  
  - If no valid session, redirect to login (and optional `?redirect=/account`). After login, show account dashboard (Overview, Orders, Addresses, Profile).  
  - **Start:** In account layout or page, call `getCurrentUser()`; if null, `redirect('/login?redirect=/account')`; else render account UI.

- [ ] **Header: show “Account” vs “Sign in”**  
  - When logged in: “Account” link to `/account` and “Sign out”. When guest: “Sign in” link to `/login`.  
  - **Start:** In header, read session (client-side via `GET /api/auth/session` or server component); conditionally render Account + Sign out or Sign in.

- [ ] **Attach order to user at checkout**  
  - If user is logged in at checkout, set `Order.userId` when creating the order so it appears in their order history.  
  - **Start:** In `POST /api/checkout`, if session has `userId`, pass it into `Order.userId` when creating the order.

### 3.3 Account features (after auth)

- [ ] **Saved addresses**  
  - CRUD for `Address` tied to the current user; use in checkout.  
  - **Start:** `GET/POST/PATCH/DELETE /api/account/addresses` and a small “Addresses” section on account.

- [ ] **Profile edit**  
  - Update name, email, phone.  
  - **Start:** Form on account that PATCHes `User` via something like `PATCH /api/account/profile`.

---

## 4. Discovery & SEO

Help customers and search engines find your pages.

- [ ] **Meta tags**  
  - Per-page `<title>`, `<meta name="description">`, and Open Graph tags for `/`, `/shop`, `/product/[slug]`.  
  - **Start:** Use Next.js `metadata` (and `generateMetadata` for product) in the app layout and page files.

- [ ] **Sitemap**  
  - `/sitemap.xml` with homepage, `/shop`, and all product URLs.  
  - **Start:** Add `app/sitemap.ts` that returns the URL list (products from Prisma).

- [ ] **robots.txt**  
  - Allow crawlers and point to sitemap.  
  - **Start:** Add `app/robots.ts` or `public/robots.txt`.

- [ ] **Structured data**  
  - JSON-LD for Product on PDP (name, image, price, availability).  
  - **Start:** Add a `<script type="application/ld+json">` in the product page with Product schema.

---

## 5. Performance & polish

Make the app faster and more reliable.

- [ ] **Image optimization**  
  - Use Next.js `Image` where possible; ensure MinIO (or CDN) URLs are in `remotePatterns`; consider responsive `sizes`.  
  - **Start:** Audit PDP and shop grid; use `next/image` for non-MinIO images; keep `<img>` for MinIO if needed for private URLs.

- [ ] **Loading states**  
  - You have `loading.tsx` for shop; add the same for `/product/[slug]`, `/cart`, `/checkout` if needed.  
  - **Start:** Add `loading.tsx` in `app/product/[slug]`, `app/cart`, `app/checkout` with skeletons or spinners.

- [ ] **Error boundaries**  
  - `error.tsx` for key routes so failures show a friendly message and retry.  
  - **Start:** Add `error.tsx` in `app` and in `app/shop` or `app/product/[slug]`.

- [ ] **Analytics**  
  - Optional: Google Analytics, Plausible, or Microsoft Clarity.  
  - **Start:** Add script or component in layout for one provider and basic page view tracking.

---

## 6. Backlog (later)

Ideas to park for when the above is in place.

- **Reviews & ratings** — Product reviews (schema, form, display).
- **Discounts / coupons** — Coupon codes at checkout; store in DB and validate in checkout API.
- **Multi-currency** — Show prices in another currency (e.g. USD) or switch locale.
- **Email marketing** — Capture email on homepage or checkout and send to Mailchimp/Resend list.
- **Inventory reservations** — Reserve stock for X minutes when “Add to cart” or at checkout start.
- **Admin audit log** — Log who changed what (e.g. order status, product price) for support.

---

## How to use this plan

1. **Pick one “Where to start” item** and do it end-to-end (API + UI if needed).
2. **Mark it done** in this file (e.g. change `- [ ]` to `- [x]`) and optionally add a one-line “Done: …” under the task.
3. **Move to the next** item in the same section or switch to another section.
4. **Refer to existing docs** when relevant: `DEVELOPMENT.md`, `docs/shop_page_plan.md`, `docs/ERD.md`, `docs/feature_breakdown.md`.

If you tell me which area you want to focus on first (e.g. “Customer auth”, “Shop sort”, “Order history”, “Admin auth”, “SEO”), I can break that into concrete steps and suggest exact files and code changes.
