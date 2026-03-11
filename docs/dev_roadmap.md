# Verlano Development Roadmap

This document outlines the development plan for building the Verlano ecommerce platform.

Goal: Launch an MVP quickly while maintaining a premium experience.

---

# Project Timeline

Estimated timeline: **4–6 weeks**

Development will be divided into phases.

---

# Phase 1 — Project Setup (Week 1)

## Goal
Initialize the project and establish the development foundation.

## Tasks

### Project Initialization

- Create Next.js project
- Setup TypeScript
- Configure Tailwind CSS
- Install shadcn/ui

### Project Structure

Create folders:

```
/app
/components
/lib
/services
/prisma
/types
```

### Environment Setup

Configure environment variables:

```
DATABASE_URL
RAZORPAY_KEY_ID
RAZORPAY_SECRET
SHIPROCKET_API_KEY
CLOUDINARY_URL
```

### Database Setup

- Install Prisma
- Connect PostgreSQL
- Create initial schema

Tables:

- Users
- Products
- Variants
- Inventory
- Orders
- Cart

---

# Phase 2 — Core UI Development (Week 2)

## Goal
Build the main user interface.

## Pages to build

### Homepage

Sections:

- Hero section
- Featured products
- Collections
- Brand message

### Product Listing Page

Features:

- Grid layout
- Filters
- Pagination

### Product Detail Page

Features:

- Product images
- Description
- Size selection
- Add to cart

### Navigation

Components:

- Header
- Footer
- Mobile menu

---

# Phase 3 — Cart System (Week 3)

## Goal
Implement cart functionality.

Features:

- Add to cart
- Update quantity
- Remove items
- Persistent cart

Components:

- Cart sidebar
- Cart page

Database:

Cart  
CartItems

---

# Phase 4 — Checkout & Payments (Week 4)

## Goal
Enable order placement.

### Checkout Flow

```
Cart
 ↓
Address
 ↓
Payment
 ↓
Order confirmation
```

### Payment Integration

Use Razorpay.

Steps:

- Create payment order
- Handle payment success
- Verify payment via webhook

Database:

Orders  
OrderItems  
Payments

---

# Phase 5 — Shipping Integration (Week 5)

## Goal
Automate shipping workflow.

### Shiprocket Integration

Features:

- Create shipment
- Generate shipping labels
- Track delivery

Order flow:

```
Order placed
 ↓
Create shipment
 ↓
Courier pickup
 ↓
Track shipment
```

---

# Phase 6 — Admin Features (Week 5–6)

## Goal
Enable product and order management.

Admin capabilities:

### Product Management

- Add products
- Edit products
- Upload images

### Inventory Management

- Track stock
- Update quantities

### Order Management

- View orders
- Update order status

---

# Phase 7 — Performance & SEO (Week 6)

## Goal
Optimize the website.

### SEO

- Meta tags
- OpenGraph tags
- Sitemap

### Performance

- Image optimization
- Lazy loading
- CDN caching

### Analytics

Integrate:

- Google Analytics
- Microsoft Clarity

---

# MVP Feature Checklist

Core Features:

- Product catalog
- Product detail pages
- Cart system
- Checkout
- Razorpay payments
- COD support
- Order tracking
- Shipping integration

---

# Post Launch Improvements

After MVP launch:

### Customer Experience

- Wishlist
- Product reviews
- Coupons

### Marketing

- Email notifications
- Discount campaigns

### Growth

- Recommendation engine
- Personalized products

---

# Development Principles

Keep the system:

- Modular
- Simple
- Scalable

Focus on:

- Clean code
- Reusable components
- API separation

---

# Launch Strategy

Step 1  
Launch with **20–50 products**

Step 2  
Test market demand

Step 3  
Improve UX based on feedback

Step 4  
Scale inventory and marketing

---

# Final Goal

Build Verlano into a trusted platform for **premium surplus fashion in India**.

Brand identity:

**Verlano — Luxury within reach**