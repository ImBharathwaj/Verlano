# Verlano Project Structure

This document defines the recommended project folder structure for the Verlano ecommerce platform.

The goal is to keep the project:

- Clean
- Scalable
- Maintainable
- Easy for future contributors

---

# Root Structure

```
verlano/
│
├── public/
├── src/
├── prisma/
├── docs/
├── .env
├── package.json
└── README.md
```

---

# Public Folder

Stores static assets.

```
public/
│
├── images/
│   ├── products/
│   └── banners/
│
├── icons/
└── favicon.ico
```

---

# Source Folder

All application code lives inside `src`.

```
src/
│
├── app/
├── components/
├── features/
├── hooks/
├── lib/
├── services/
├── store/
├── styles/
└── types/
```

---

# App Directory (Next.js App Router)

Handles routing and page layouts.

```
src/app/
│
├── layout.tsx
├── page.tsx
│
├── shop/
│   └── page.tsx
│
├── product/
│   └── [slug]/
│       └── page.tsx
│
├── cart/
│   └── page.tsx
│
├── checkout/
│   └── page.tsx
│
├── account/
│   └── page.tsx
│
└── api/
    ├── auth/
    ├── products/
    ├── cart/
    ├── orders/
    └── payments/
```

---

# Components

Reusable UI components.

```
src/components/
│
├── layout/
│   ├── Header.tsx
│   ├── Footer.tsx
│   └── Container.tsx
│
├── product/
│   ├── ProductCard.tsx
│   ├── ProductGrid.tsx
│   ├── ProductGallery.tsx
│   └── SizeSelector.tsx
│
├── cart/
│   ├── CartDrawer.tsx
│   ├── CartItem.tsx
│   └── CartSummary.tsx
│
├── checkout/
│   ├── AddressForm.tsx
│   ├── PaymentMethod.tsx
│   └── OrderSummary.tsx
│
└── ui/
    ├── Button.tsx
    ├── Input.tsx
    ├── Modal.tsx
    └── Badge.tsx
```

---

# Features

Feature-specific modules.

```
src/features/
│
├── auth/
├── products/
├── cart/
├── checkout/
└── orders/
```

Each feature contains:

- API calls
- hooks
- business logic

---

# Hooks

Reusable React hooks.

```
src/hooks/
│
├── useCart.ts
├── useAuth.ts
└── useProducts.ts
```

---

# Lib

Utility libraries and configurations.

```
src/lib/
│
├── prisma.ts
├── razorpay.ts
├── shiprocket.ts
├── cloudinary.ts
└── utils.ts
```

---

# Services

External service integrations.

```
src/services/
│
├── paymentService.ts
├── shippingService.ts
└── productService.ts
```

---

# State Management

Global application state.

```
src/store/
│
├── cartStore.ts
├── userStore.ts
└── orderStore.ts
```

Recommended tools:

- Zustand
- React Context

---

# Styles

Global styling.

```
src/styles/
│
├── globals.css
└── theme.css
```

Tailwind CSS configuration lives in:

```
tailwind.config.ts
```

---

# Types

TypeScript interfaces and types.

```
src/types/
│
├── product.ts
├── order.ts
├── user.ts
└── cart.ts
```

---

# Database

Database schema and migrations.

```
prisma/
│
├── schema.prisma
└── migrations/
```

---

# Documentation

All project documentation.

```
docs/
│
├── TECH_STACK.md
├── DATABASE_SCHEMA.md
├── API_SPEC.md
├── SYSTEM_ARCHITECTURE.md
├── PRODUCT_REQUIREMENTS.md
├── DEVELOPMENT_ROADMAP.md
├── UI_SYSTEM.md
├── COMPONENT_ARCHITECTURE.md
└── FEATURE_BREAKDOWN.md
```

---

# Environment Variables

Example `.env`

```
DATABASE_URL=
RAZORPAY_KEY_ID=
RAZORPAY_SECRET=
SHIPROCKET_API_KEY=
CLOUDINARY_URL=
NEXTAUTH_SECRET=
```

---

# Code Organization Principles

1. Separate UI and business logic
2. Keep components small and reusable
3. Group code by feature
4. Maintain strict typing
5. Use hooks for shared logic

---

# Future Improvements

As the project scales:

- introduce microservices
- add caching layer (Redis)
- add search engine (Meilisearch / Algolia)
- implement background jobs

---

# Final Goal

Maintain a scalable codebase that allows Verlano to grow into a full-scale ecommerce platform while keeping the developer experience clean and efficient.