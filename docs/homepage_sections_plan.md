## Verlano Homepage – Premium Section Plan

This plan is inspired by layouts like `tjmaxx.com`, adapted to Verlano’s **minimal, luxury** brand.

---

### 1. Hero + Primary CTA (already present, to refine) ✅

- **Goal**: Clearly communicate value (“Luxury surplus fashion, insider prices”) with a strong primary CTA.
- **Content**:
  - Large typography hero (Playfair) with supporting copy.
  - Primary button: “Shop collection”.
  - Secondary button: “New arrivals”.
- **Refinements**:
  - Add subtle background texture or very light gradient (still mostly white).
  - Ensure generous whitespace above/below hero.

---

### 2. Highlighted Benefits Strip ✅

- **Goal**: Build trust quickly with 3–4 key benefits.
- **Layout**: Full-width strip under hero with 3 or 4 columns.
- **Items** (examples):
  - “Up to 70% off retail”
  - “Authentic surplus from premium brands”
  - “Fast shipping via Shiprocket”
  - “Easy returns (coming soon)”
- **Style**:
  - Subtle border, ivory background, plenty of vertical padding.

---

### 3. Featured Collections Row ✅

- **Goal**: Give users clear entry points into key collections.
- **Layout**: 2–3 large tiles in a row.
- **Examples**:
  - “New this week”
  - “Workwear essentials”
  - “Weekend / casual”
- **Behavior**:
  - Each tile links to a filtered `/shop` view.
- **Style**:
  - Large imagery (once product images are ready), minimal overlay text.

---

### 4. Featured Products Grid ✅

- **Goal**: Showcase a curated subset of products directly on the homepage.
- **Source**:
  - API: e.g. `GET /api/products?featured=true` or a “featured” flag later.
- **Layout**:
  - 2 rows × 4 cards (8 products), using existing `ProductCard`.
- **Style**:
  - Extra spacing between rows (32–40px).
  - Section heading: “Featured picks”.

---

### 5. Category Carousel / Strips ✅

- **Goal**: Mimic TJMaxx-style “shop by category” bands.
- **Layout**:
  - Horizontal scroll or stacked rows for:
    - “Shop by category” – Tops, Bottoms, Dresses, Outerwear.
    - Potential future row: “Shop by brand”.
- **Behavior**:
  - Each pill/tile navigates to `/shop` with a category filter.
- **Style**:f
  - Rounded category pills or small cards, monochrome with subtle hover states.

---

### 6. Editorial / Story Section ✅

- **Goal**: Elevate brand, not just products.
- **Content**:
  - Short block about Verlano’s story:
    - “Luxury within reach”
    - How surplus sourcing works.
  - Optional link: “Learn more about Verlano”.
- **Layout**:
  - 2-column: text on left, simple graphic or photo on right (when assets exist).
- **Style**:
  - Lots of whitespace, smaller typography, more “magazine” feel.

---

### 7. Email Capture / Early Access ✅

- **Goal**: Start building an email list before launch.
- **Layout**:
  - Narrow band near footer.
  - Simple form: email input + “Get early access” button.
- **Backend**:
  - Initially: POST to `/api/newsletter` that stores email in DB (to be added later).
- **Style**:
  - Thin border, clear copy, not intrusive.

---

### 8. Footer Enhancements ✅

- **Goal**: Make footer feel more complete and trustworthy.
- **Additions**:
  - Links: “About”, “Shipping”, “Returns”, “Contact”.
  - Social icons (placeholders until accounts exist).
- **Style**:
  - Keep current monochrome look; slightly increase vertical padding.

---

### Implementation Order

1. **Refine hero + benefits strip** (Sections 1–2).
2. **Featured collections + featured products grid** (Sections 3–4).
3. **Category strips / carousel** (Section 5).
4. **Editorial story block** (Section 6).
5. **Email capture + footer polish** (Sections 7–8).

Each step can be implemented as a separate section on the homepage (`src/app/page.tsx`), reusing existing components where possible and keeping spacing consistent with `docs/ui_system.md`.

