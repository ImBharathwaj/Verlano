## Verlano Shop Page – Section Plan

This plan defines the structure and sections for a **rich, premium** shop page.

---

### 1. Shop hero strip ✅

- **Goal**: Introduce the catalog and current focus.
- **Content**:
  - Title: “Shop all surplus”.
  - Short copy about curation and pricing.
  - Optional pill filters for “New this week”, “Best sellers”.
- **Layout**:
  - Full-width strip at the top of `/shop`, light border and generous padding.

---

### 2. Filters & sorting bar ✅

- **Goal**: Give users quick control over the catalog.
- **Layout**:
  - Desktop: horizontal bar above the grid.
  - Mobile: compact filter button that opens a sheet/drawer (later).
- **Controls**:
  - Sort dropdown: “Latest”, “Price: low to high”, “Price: high to low”.
  - Compact pills for:
    - Size (S, M, L, XL).
    - Price bands (Under ₹1000, ₹1000–₹2000, ₹2000+).
  - (Filtering logic can be added incrementally after UI).

---

### 3. Left filter column (desktop-only) ✅

- **Goal**: More serious browsing tools for desktop users.
- **Layout**:
  - 2-column grid:
    - Left: narrow column ~260px wide.
    - Right: main product grid.
- **Filter groups**:
  - Size checklist (S, M, L, XL).
  - Price slider or discrete options.
  - Availability (In stock / Sold out).
- **Behavior**:
  - Initially UI-only (no logic), with future wiring to query params.

---

### 4. Product grid enhancements ✅

- **Goal**: Make the grid feel richer and more scannable.
- **Changes**:
  - Maintain 2–3 columns depending on viewport.
  - Slightly larger cards on `/shop` vs homepage.
  - Ensure primary image is visible and clear at typical laptop sizes.
- **Extras**:
  - Subtle “New” badge for recent products (when createdAt is within X days).

---

### 5. Category highlight rows ✅

- **Goal**: Break the grid with focused, horizontal sections.
- **Sections**:
  - “New this week” – 1 row of 4 cards, shown if enough items.
  - “Best value picks” – 1 row of 4 cards (cheaper pieces).
- **Layout**:
  - These appear **above** the main grid as optional rows, similar to homepage featured sections.

---

### 6. Empty state & load feedback ✅

- **Goal**: Handle edge cases gracefully.
- **States**:
  - When no products match: show a bordered card with messaging and a “Clear filters” button (later once filters wired).
  - While loading (if we add client-side filtering): simple skeleton cards or “Loading products…” text.
- **Implemented**:
  - Empty state: when no products match (e.g. category filter), a bordered card shows “No products match your selection” with a “Clear filters / View all” link to `/shop`.
  - Loading: `loading.tsx` for `/shop` shows skeleton placeholders (hero + product grid) while the page loads (Next.js App Router).

---

### 7. Implementation order

1. **Enhance existing `/shop` hero and grid** (Sections 1 & 4). ✅
2. **Add top filters & sort bar** (Section 2, UI first). ✅
3. **Introduce left filter column on desktop** (Section 3, UI shell — later simplified/removed per product decisions). ✅
4. **Add category highlight rows above grid** (Section 5). ✅
5. **Refine empty state and loading feedback** (Section 6). ✅

