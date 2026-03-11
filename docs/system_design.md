# Verlano System Architecture

This document describes the high-level system architecture of the Verlano ecommerce platform.

The architecture is designed to be:

- Scalable
- Maintainable
- Performance optimized
- Developer friendly

---

# Architecture Overview

Verlano follows a **Headless Ecommerce Architecture**.

Frontend and backend are separated, and external services handle payments, shipping, and media delivery.

```
            ┌─────────────────────┐
            │      Customer       │
            │      Browser        │
            └──────────┬──────────┘
                       │
                       ▼
              ┌─────────────────┐
              │     Frontend    │
              │   Next.js App   │
              │ (Vercel CDN)    │
              └─────────┬───────┘
                        │ API
                        ▼
               ┌──────────────────┐
               │ Backend API Layer│
               │  Next.js / NestJS│
               └─────────┬────────┘
                         │
          ┌──────────────┼──────────────┐
          ▼              ▼              ▼
   ┌────────────┐ ┌────────────┐ ┌──────────────┐
   │ PostgreSQL │ │ Cloudinary │ │   Sanity CMS │
   │  Database  │ │ Image CDN  │ │ Content Mgmt │
   └────────────┘ └────────────┘ └──────────────┘
          │
          ▼
   ┌────────────────────────────┐
   │ External Integrations      │
   │                            │
   │ Razorpay (Payments)       │
   │ Shiprocket (Shipping)     │
   │ Google Analytics          │
   │ Microsoft Clarity         │
   └────────────────────────────┘
```

---

# Core Components

## 1 Frontend Layer

Technology

- Next.js
- Tailwind CSS
- shadcn/ui

Responsibilities

- Render UI
- Fetch product data
- Manage cart
- Handle checkout flow
- Communicate with backend APIs

Hosting

- Vercel

Benefits

- Global CDN
- Edge caching
- Fast page load

---

# Backend Layer

Technology

- Next.js API Routes (initial)
- NestJS (future scaling)

Responsibilities

- Product APIs
- Cart logic
- Order creation
- Payment verification
- Shipping integration
- Inventory updates

Architecture style

REST API

---

# Database Layer

Database

PostgreSQL

ORM

Prisma

Stores

- Users
- Products
- Product variants
- Inventory
- Orders
- Cart
- Addresses
- Payments

Benefits

- ACID compliance
- Relational integrity
- Scalable queries

---

# Media Storage

Provider

Cloudinary

Responsibilities

- Product image storage
- Image resizing
- CDN delivery
- Image optimization

Benefits

- Faster page load
- Automatic responsive images

---

# CMS Layer

Provider

Sanity

Responsibilities

- Product content
- Homepage banners
- Collection pages
- Marketing content

Benefits

- Headless CMS
- Real-time editing
- Structured content

---

# Payment System

Provider

Razorpay

Supported methods

- UPI
- Debit/Credit cards
- Net banking
- Wallets

Flow

```
Customer Checkout
      ↓
Create Razorpay Order
      ↓
User Completes Payment
      ↓
Webhook Confirmation
      ↓
Order Marked as Paid
```

---

# Shipping System

Provider

Shiprocket

Responsibilities

- Courier selection
- Shipping label generation
- COD support
- Shipment tracking

Available couriers

- Delhivery
- Blue Dart
- XpressBees
- Ecom Express

Flow

```
Order Created
     ↓
Shipment Created in Shiprocket
     ↓
Courier Pickup
     ↓
Tracking Updates
```

---

# Analytics & Monitoring

Tools

Google Analytics

Used for

- traffic analysis
- conversion tracking

Microsoft Clarity

Used for

- session replay
- heatmaps
- user behavior analysis

---

# Deployment Architecture

Frontend

Vercel

Backend

Vercel / Node server

Database

Managed PostgreSQL

Media

Cloudinary

Domain

verlano.in

---

# Security Considerations

- HTTPS enforced
- Secure payment handling via Razorpay
- JWT or session authentication
- Rate limiting for APIs
- Input validation

---

# Scalability Strategy

Future improvements

Move backend to NestJS microservices

Add

- Redis caching
- Search engine (Meilisearch / Algolia)
- Queue system (BullMQ)

Scale database

- Read replicas
- Connection pooling

---

# Future Architecture Enhancements

- AI product recommendation
- Personalized shopping experience
- Mobile application
- Loyalty program
- Advanced analytics

---

# Summary

Architecture Type

Headless Ecommerce

Core Stack

Frontend  
Next.js + Tailwind

Backend  
Next.js API / NestJS

Database  
PostgreSQL + Prisma

Payments  
Razorpay

Shipping  
Shiprocket

Media  
Cloudinary

CMS  
Sanity

Hosting  
Vercel