# Verlano Component Architecture

This document defines the frontend component structure for the Verlano ecommerce platform.

Goal:

- Maintain reusable components
- Keep the codebase modular
- Ensure scalability as the project grows

---

# Frontend Framework

Framework

Next.js (App Router)

Styling

Tailwind CSS

Component Library

shadcn/ui

---

# Project Structure

Recommended folder structure

```

src/
│
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── shop/
│   ├── product/
│   ├── cart/
│   └── checkout/
│
├── components/
│
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── Container.tsx
│
│   ├── product/
│   │   ├── ProductCard.tsx
│   │   ├── ProductGrid.tsx
│   │   ├── ProductGallery.tsx
│   │   └── SizeSelector.tsx
│
│   ├── cart/
│   │   ├── CartDrawer.tsx
│   │   ├── CartItem.tsx
│   │   └── CartSummary.tsx
│
│   ├── checkout/
│   │   ├── AddressForm.tsx
│   │   ├── PaymentMethod.tsx
│   │   └── OrderSummary.tsx
│
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   └── Badge.tsx
│
├── lib/
│   ├── api.ts
│   ├── utils.ts
│   └── constants.ts
│
├── hooks/
│   ├── useCart.ts
│   └── useAuth.ts
│
└── types/
    ├── product.ts
    ├── order.ts
    └── user.ts

```

---

# Layout Components

Layout components control the overall page structure.

## Header

Responsibilities:

- Navigation
- Logo
- Search
- Cart icon
- User account

Component

Header.tsx

---

## Footer

Responsibilities

- Brand information
- Links
- Newsletter signup
- Social links

Component

Footer.tsx

---

## Container

Used to maintain consistent page width.

Max width

1200px

Component

Container.tsx

---

# Product Components

These components power the product catalog.

## ProductCard

Used in product grids.

Displays

- Product image
- Product name
- Price
- Compare price

Example

```
<ProductCard
  title="Premium Shirt"
  price={999}
  image="/shirt.jpg"
/>
```

---

## ProductGrid

Displays a collection of products.

Features

- Responsive grid
- Pagination
- Lazy loading

---

## ProductGallery

Used on product detail pages.

Features

- Image carousel
- Zoom functionality
- Thumbnail navigation

---

## SizeSelector

Allows customers to choose clothing sizes.

Example sizes

S  
M  
L  
XL

---

# Cart Components

Cart components manage the shopping cart UI.

## CartDrawer

Side panel that appears when user adds an item.

Features

- List of cart items
- Quick checkout
- Cart total

---

## CartItem

Displays a single item in the cart.

Includes

- Product image
- Name
- Quantity controls
- Remove button

---

## CartSummary

Shows

- Subtotal
- Shipping estimate
- Checkout button

---

# Checkout Components

## AddressForm

Collects customer shipping details.

Fields

- Name
- Phone
- Address
- City
- State
- Postal code

---

## PaymentMethod

Allows user to choose payment method.

Options

- Razorpay
- COD

---

## OrderSummary

Displays final order breakdown.

Includes

- Items
- Subtotal
- Shipping
- Total price

---

# UI Components

Reusable design components.

Examples

Button  
Input  
Modal  
Badge

Guidelines

- Keep components generic
- Avoid business logic inside UI components

---

# Hooks

Reusable React hooks.

## useCart

Handles cart logic.

Functions

- addItem
- removeItem
- updateQuantity
- clearCart

---

## useAuth

Handles authentication state.

Functions

- login
- logout
- getCurrentUser

---

# Types

TypeScript interfaces.

Examples

## Product

```
interface Product {
  id: string
  title: string
  price: number
  images: string[]
}
```

---

## Order

```
interface Order {
  id: string
  total: number
  status: string
}
```

---

# Component Principles

1. Components should be reusable
2. Avoid deeply nested components
3. Separate logic from UI
4. Use hooks for shared logic
5. Keep components small

---

# Future Improvements

As the project grows, introduce:

- component testing
- design tokens
- storybook for UI documentation

---

# Final Goal

Maintain a clean component architecture that allows Verlano to scale while keeping the codebase easy to maintain.