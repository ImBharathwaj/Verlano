# Verlano — Development status and next steps

This file summarizes what is implemented and what remains for the Verlano MVP. The plan follows `docs/dev_roadmap.md` and `docs/mvp_development.md`.

---

## What’s done

### Phase 1 — Project setup and database

- **Stack:** Next.js (App Router), TypeScript, Tailwind CSS, Prisma, PostgreSQL.
- **Structure:** `src/app`, `src/components`, `src/features`, `src/hooks`, `src/lib`, `src/services`, `src/store`, `src/styles`, `src/types`, `prisma/`.
- **Routes:** `/`, `/shop`, `/product/[slug]`, `/cart`, `/checkout`, `/account`; API folders under `src/app/api/`.
- **Design system:** Colors and typography from `docs/ui_system.md` (white background, black text, no theme switching). Playfair Display (headings), Inter (body). Monochrome palette (ink, ivory, gold, grays).
- **Database:** Prisma schema with `User`, `Product`, `ProductVariant`, `Inventory`, `Cart`, `CartItem`, `Order`, `OrderItem`, `Address`, `Payment`. Migrations applied. Guest carts supported via optional `userId` on `Cart`.
- **Env:** `.env.example` with `DATABASE_URL`, Razorpay, Shiprocket, Cloudinary, NextAuth. App uses `DATABASE_URL` for Prisma.

### Phase 2 — Product system

- **APIs:**
  - `GET /api/products` — list products with pagination (`page`, `pageSize`), includes variants and inventory.
  - `GET /api/products/[slug]` — single product by slug with variants and inventory.
- **UI:**
  - `ProductCard`, `ProductGrid` (brand, title, price, compare price, stock).
  - `/shop` — server-rendered product grid (up to 36 products).
  - `/product/[slug]` — product detail with size selector and add-to-cart (see Phase 3).

### Phase 3 — Cart system

- **APIs:**
  - `GET /api/cart` — current cart and items (cookie `verlano_cart_id`).
  - `POST /api/cart` — add item (`variantId`, `quantity`); creates cart and sets cookie if needed; checks stock.
  - `PATCH /api/cart` — update line quantity (`cartItemId`, `quantity`); remove line if `quantity === 0`.
  - `DELETE /api/cart?cartItemId=...` — remove one cart line.
- **Cart persistence:** Guest cart stored in DB and identified by HTTP-only cookie; `Cart.userId` optional.
- **UI:**
  - `CartDrawer` — slide-over from header with list, summary, “View cart” and “Checkout”.
  - `CartItem` — line with quantity controls and remove.
  - `CartSummary` — subtotal and links to cart/checkout.
  - `CartProvider` + `CartTrigger` in header (cart count, open drawer).
  - `/cart` — full cart page with list and summary, update/remove.
  - Product page: `AddToCart` — size + quantity, POST to cart and open drawer.

### Phase 4 — Checkout and payments

- **Schema:** `Order.userId` optional; shipping fields and `razorpayOrderId` on `Order` for guest checkout and webhook lookup.
- **APIs:**
  - `POST /api/checkout` — body: shipping address. Creates `Order` + `OrderItem`s, creates Razorpay order, returns `orderId`, `razorpayOrderId`, `amount`, `currency`, `key` for client.
  - `GET /api/orders/[id]` — order details for confirmation.
  - `POST /api/orders/[id]/verify-payment` — body: `razorpay_order_id`, `razorpay_payment_id`, `razorpay_signature`. Verifies signature, creates `Payment`, sets `Order.paymentStatus` to `paid`, decrements inventory, clears cart cookie.
  - `POST /api/webhooks/razorpay` — `payment.captured` handler; verifies webhook signature (`RAZORPAY_WEBHOOK_SECRET`), updates payment and order, decrements inventory.
- **Razorpay:** `razorpay` SDK; server creates order (amount in paise); client loads checkout.js and opens Razorpay modal; success handler calls verify-payment; optional webhook for reliability.
- **Pages:**
  - `/checkout` — address form + order summary; “Pay with Razorpay” creates order and opens Razorpay; on success → verify-payment → redirect to success.
  - `/checkout/success?orderId=...` — thank-you page with order id and total.
- **Env:** `RAZORPAY_KEY_ID`, `RAZORPAY_SECRET`, `RAZORPAY_WEBHOOK_SECRET` (optional; in `.env.example`).

---

## What’s next (in order)

### Phase 5 — Shipping integration

- **Schema:** `Order` has `shippingProvider`, `trackingId`, `trackingUrl`, `shippingStatus` for shipment state.
- **Shiprocket (placeholder):** `createShipmentForOrder` in `src/lib/shiprocket.ts` fakes a tracking id when `SHIPROCKET_API_KEY` is set. This keeps the flow working and can be swapped for real Shiprocket calls later.
- **APIs:**
  - `POST /api/orders/[id]/ship` — creates a shipment for an order (after payment), stores tracking id / URL / provider / shippingStatus on `Order`.
  - `GET /api/orders/[id]/tracking` — returns tracking and shipping fields from the order.
- **Usage:** Admin (or automation) can call `/api/orders/[id]/ship` after marking an order ready to ship, then expose `/api/orders/[id]/tracking` or the stored `trackingUrl` in the customer UI.

### Phase 6 — Admin

- **Admin shell & dashboard (done):**
  - `/admin` layout with sidebar (Dashboard, Products, Orders).
  - `/admin` dashboard showing product count, order count, and gross revenue.
- **Product management (done, minimal):**
  - `/admin/products` — list view of products (title, brand, base price, created date) with “New product” and “Edit” actions.
  - `/admin/products/new` — form to create a product (title, slug, brand, base price, compare price, description) with one variant (size, price, initial stock).
  - `/admin/products/[id]` — edit page to update product fields and delete the product. Deletion also cleans up variants, inventory, and related cart/order items.
  - APIs:
    - `GET /api/admin/products` — list products with variants and inventory.
    - `POST /api/admin/products` — create product + variants + inventory.
    - `GET /api/admin/products/[id]` — single product with variants + inventory.
    - `PATCH /api/admin/products/[id]` — update product fields.
    - `DELETE /api/admin/products/[id]` — delete product and its related records.
- **Order management (next):** Admin orders list and detail view (status updates, payment + shipping info).
- **Auth (next):** Protect admin routes (e.g. NextAuth with admin role or env-based secret gate).

### Phase 7 — Performance and SEO

- **SEO:** Meta tags, Open Graph, sitemap.
- **Performance:** Image optimization (Next.js Image, CDN), lazy loading, caching where needed.
- **Analytics:** e.g. Google Analytics, Microsoft Clarity.

---

## How to run the project

1. **Requirements:** Node.js ≥ 20.9, PostgreSQL, `.env` with valid `DATABASE_URL`.
2. **Install and DB:**
   ```bash
   npm install
   npx prisma generate
   npx prisma migrate dev   # if schema changed
   ```
3. **Run dev server:**
   ```bash
   npm run dev
   ```
4. **Seed data (optional):** Add products/variants/inventory via Prisma seed script or admin (once built).

---

## Quick reference

| Area        | Done | Next |
|------------|------|------|
| Setup & DB | ✅   | —    |
| Products   | ✅   | —    |
| Cart       | ✅   | —    |
| Checkout   | ✅   | —    |
| Payments   | ✅   | —    |
| Shipping   | ✅   | —    |
| Admin      | —    | Phase 6 |
| SEO/Perf   | —    | Phase 7 |

See `docs/dev_roadmap.md` and `docs/mvp_development.md` for full task breakdowns.
