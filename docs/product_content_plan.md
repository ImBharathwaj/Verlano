## Verlano Product Content – Data & Images Plan

This plan tracks how we will **store and manage product data and images** end-to-end for Verlano.

---

### 1. Product data model review ✅

- **Goal**: Confirm the existing Prisma schema supports all product content needs.
- **Current models** (from `prisma/schema.prisma`):
  - `Product`: title, slug, description, brand, price, comparePrice.
  - `ProductVariant`: size, color, sku, price, relation to `Inventory`.
  - `Inventory`: stockQuantity, reservedQuantity.
- **Outcome**:
  - Model is sufficient for basic catalog.
  - **Images and rich metadata** will be added in the next steps.

---

### 2. Extend schema for product media (images) – ✅

- **Goal**: Allow multiple images per product, with ordering and captions.
- **Changes**:
  - Added `ProductImage` model with:
    - `id`, `productId`, `url`, `alt`, `position`, `isPrimary`.
  - Added relation: `Product` 1 — N `ProductImage` via `images` field.
- **DB tasks**:
  - `prisma/schema.prisma` has been updated.
  - **Next step in your terminal**: run
    - `npx prisma migrate dev --name add_product_images`

---

### 3. Decide on image storage strategy – ✅

- **Goal**: Choose where images live and how URLs are stored.
- **Options**:
  - **Short-term**: Direct uploads to `public/` during development (no upload UI).
  - **Production-ready**: Use `CLOUDINARY_URL` (already in `.env.example`) and store Cloudinary URLs in `ProductImage.url`.
- **Plan**:
  - Start with Cloudinary-style URLs in the DB so we don’t need schema changes later.
  - During development, we can manually paste URLs or use placeholder images.

---

### 4. Admin: product image management APIs – ✅

- **Goal**: Allow the admin UI to create/update/delete product images.
- **Endpoints to extend**:
  - `POST /api/admin/products`
    - Accept an optional `images` array (URL, alt, isPrimary, position).
  - `PATCH /api/admin/products/[id]`
    - Allow full replacement of the `images` array (upsert + delete removed ones).
- **Implementation**:
  - Use `prisma.productImage.createMany` / delete-by-not-in-list pattern.
  - Enforce at most one `isPrimary = true` per product.

---

### 5. Admin UI: product form with image fields – ✅

- **Goal**: Let the admin add and reorder product images.
- **Pages to update**:
  - `src/app/admin/products/new/page.tsx`
  - `src/app/admin/products/[id]/page.tsx`
- **UI elements**:
  - Section “Product images” with:
    - Repeater rows for `image URL`, `alt text`, `primary` checkbox.
    - Up/down buttons or drag handle to reorder (update `position`).
- **Behavior**:
  - On submit, send full `images` array to the admin product API.

---

### 6. Customer UI: display product images – ✅

- **Goal**: Show primary + gallery images on the product detail page.
- **Page to update**:
  - `src/app/product/[slug]/page.tsx`
- **Layout**:
  - Gallery column with:
    - Main large image (uses `isPrimary` or first in `position` order).
    - Thumbnails row/column to switch active image.
- **Implementation**:
  - Include `images: true` in Prisma query for product.
  - Use Next.js `Image` with `object-cover`, respect existing monochrome styling.

---

### 7. Product cards: use primary image – ✅

- **Goal**: Show product images in grids (home, shop).
- **Components to update**:
  - `ProductCard` and `ProductGrid`.
- **Behavior**:
  - Each `ProductCard` shows:
    - Primary product image (fallback to placeholder if none).
    - Existing text content (brand, title, price).

---

### 8. Data seeding & migration strategy – ✅

- **Goal**: Ensure existing products get images without breaking current data.
- **Steps**:
  - Create a small seed script (or manual SQL/Prisma script) to:
    - Attach at least one image to each existing product.
  - Use predictable filenames or Cloudinary URLs.
- **Tracking**:
  - Document how many products have images and which ones need manual additions.

---

### 9. Future enhancements (optional) – BACKLOG

- **Not in initial scope, but good next steps**:
  - Per-variant images (e.g. different colors).
  - Zoom / fullscreen lightbox on product detail images.
  - Responsive image sets (`srcset`) and lazy loading.
  - Alt-text quality checks for accessibility.

