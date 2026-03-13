# Verlano — Application Review & Next Development Plan

This document summarizes the current state of the application and proposes a prioritized plan for the next set of development tasks.

---

## 1. Application Review Summary

### What’s Built (✅)

| Area | Features |
|------|----------|
| **Shop** | Category filter (dropdown), sort (latest/price), search, pagination, empty state |
| **Product** | Detail page, gallery, variants, add-to-cart, wishlist, related products, JSON-LD |
| **Cart** | Drawer + full page, guest + logged-in persistence, cart merge on login |
| **Checkout** | Razorpay integration, guest shipping, order creation, payment verification, webhook |
| **Orders** | Order history, order detail, tracking page (by email + order ID) |
| **Auth** | Sign up, login, OAuth (Google), password reset, email verification |
| **Account** | Profile, addresses, order history |
| **Admin** | Products CRUD, orders list/detail, bulk actions, low-stock alerts, dashboard metrics |
| **Shipping** | Shiprocket integration, create shipment, tracking |
| **SEO** | Meta tags, Open Graph, sitemap, robots.txt |
| **Other** | Newsletter, analytics (Plausible/GA4), inventory reservations, error boundaries |

### Gaps & Incomplete Items

| Gap | Location | Impact |
|-----|----------|--------|
| ~~**“New this week” / “Best value picks” buttons**~~ ✅ | Shop hero strip | Wired to filter params |
| ~~**“Best value picks” section**~~ ✅ | Shop grid | Second highlight row added |
| ~~**Size / Price / Availability filters**~~ ✅ | Shop | ShopFilters component in sort bar |
| ~~**“New” badge on product cards**~~ ✅ | ProductCard | Badge for products created in last 7 days |
| ~~**Discounts / coupons**~~ ✅ | Checkout | Coupon model, validate API, checkout UI |
| ~~**COD (Cash on Delivery)**~~ ✅ | Checkout | Payment method selection, COD order flow |
| ~~**Admin audit log**~~ ✅ | Admin | AuditLog model, logAudit in order/product APIs |
| ~~**Mobile filter sheet**~~ ✅ | Shop | ShopFilterSheet drawer on mobile |

---

## 2. Recommended Next Steps (Prioritized)

### Tier 1 — Quick Wins (1–2 days) ✅ Done

| # | Task | Why | Files |
|---|------|-----|-------|
| 1 | ~~**Wire "New this week" button**~~ ✅ | Filters to products created in last 7 days | `shop/page.tsx`, `getProducts()` |
| 2 | ~~**Wire "Best value picks" button**~~ ✅ | Filters to lower-priced products | `shop/page.tsx`, `getProducts()` |
| 3 | ~~**Add “Best value picks” section**~~ ✅ | Second highlight row above grid (cheapest 4 products) | `shop/page.tsx` |
| 4 | ~~**Add “New” badge on ProductCard**~~ ✅ | Show badge when `createdAt` within last 7–14 days | `ProductCard.tsx` |

### Tier 2 — Conversion & Revenue (3–5 days) ✅ Done

| # | Task | Why | Scope |
|---|------|-----|-------|
| 5 | ~~**Discounts / coupons**~~ ✅ | Common e-commerce expectation; supports promos | `Coupon` model, `POST /api/checkout` validation, checkout UI |
| 6 | ~~**COD support**~~ ✅ | In product reqs; expands payment options | Checkout flow, order status handling, Shiprocket COD |

### Tier 3 — Discovery & UX (2–3 days) ✅ Done

| # | Task | Why | Scope |
|---|------|-----|-------|
| 7 | ~~**Size filter**~~ ✅ | Filter by variant size (S, M, L, XL) | `getProducts()` + size param, ShopFilters |
| 8 | ~~**Price range filter**~~ ✅ | Filter by price bands (Under ₹1000, ₹1000–2000, ₹2000+) | `getProducts()` + price param, ShopFilters |
| 9 | ~~**Availability filter**~~ ✅ | In stock / Sold out toggle | `getProducts()` + availability param, ShopFilters |
| 10 | ~~**Mobile filter sheet**~~ ✅ | Better mobile UX for filters | ShopFilterSheet drawer, Filters button on mobile |

### Tier 4 — Operations & Polish (2–4 days) ✅ Done

| # | Task | Why | Scope |
|---|------|-----|-------|
| 11 | ~~**Admin audit log**~~ ✅ | Track order/product changes for support | `AuditLog` model, `logAudit` in admin APIs, `GET /api/admin/audit-logs` |
| 12 | ~~**Brand filter**~~ ✅ | Filter by brand on shop page | `getProducts()` + brand param, ShopFilters brand dropdown |

---

## 3. Implementation Notes

### Tier 1 — Quick Wins

**1. “New this week” button**

- Add `filter=new` (or similar) query param.
- In `getProducts()`, when `filter === "new"`, add `where: { createdAt: { gte: sevenDaysAgo } }`.

**2. “Best value picks” button**

- Add `filter=value` query param.
- In `getProducts()`, when `filter === "value"`, order by `price: "asc"` and optionally cap by a price threshold.

**3. “Best value picks” section**

- Query 4 cheapest products (separate query or reuse with `take: 4`, `orderBy: { price: "asc" }`).
- Render a second row above the main grid, similar to “New this week”, when `!category && page === 1`.

**4. “New” badge**

- In `ProductCard`, compute `isNew = product.createdAt >= sevenDaysAgo`.
- Render a small “New” pill/badge when `isNew`.

### Tier 2 — Discounts ✅ Done

- **Schema**: `Coupon` (code, type: percent|fixed, value, minOrderAmount?, maxUses?, usedCount, expiresAt).
- **API**: `POST /api/coupon/validate`; checkout validates and applies. Admin: `POST/GET /api/admin/coupons`.
- **UI**: Coupon input + “Apply” in checkout; show discounted total.

### Tier 2 — COD ✅ Done

- **Checkout**: Cash on Delivery option; skips Razorpay when selected.
- **Order**: `paymentStatus: "cod"`; inventory decremented at order creation.

### Tier 4 — Audit log ✅ Done

- **Schema**: `AuditLog` (entityType, entityId, action, field, oldValue, newValue).
- **lib/audit-log.ts**: `logAudit()` for create/update/delete.
- **Integration**: Order PATCH (single + bulk), Product PATCH, Product DELETE.
- **API**: `GET /api/admin/audit-logs` to list logs.

### Tier 4 — Brand filter ✅ Done

- Added `brand` to shop `searchParams`; `getProducts()` filters by brand (case-insensitive).
- `getBrands()` fetches distinct brands from products.
- ShopFilters and ShopFilterSheet include brand dropdown.

### Tier 3 — Filters ✅ Done

- Added `size`, `price`, `availability` to shop `searchParams`.
- `getProducts()` filters by variant size, price bands (Under ₹1000, ₹1000–2000, ₹2000+), and availability.
- ShopFilters (desktop) and ShopFilterSheet (mobile) in sort bar.

---

## 4. Suggested Order of Execution

1. **Tier 1** — Wire “New this week” and “Best value picks” buttons, add “Best value picks” section, add “New” badge.  
   *Rationale: Small changes, visible impact, no schema changes.*

2. ~~**Tier 2**~~ ✅ — Implement coupons first (higher impact), then COD if needed.  
   *Done: Coupon model, validate API, checkout UI; COD payment option.*

3. ~~**Tier 3**~~ ✅ — Add size, price, and availability filters; then mobile filter sheet.  
   *Done: ShopFilters + ShopFilterSheet.*

4. ~~**Tier 4**~~ ✅ — Audit log and brand filter as capacity allows.  
   *Done: AuditLog model, logAudit in admin APIs; Brand filter in ShopFilters.*

---

## 5. References

- `docs/next_steps_plan.md` — Full feature checklist (most items done)
- `docs/shop_page_plan.md` — Shop sections and filter plan
- `docs/ERD.md` — Data model
- `docs/feature_breakdown.md` — Module breakdown
