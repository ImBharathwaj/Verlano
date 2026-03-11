# Verlano E-Commerce Database Schema

This document defines the database structure for the Verlano online store.

Database: PostgreSQL  
ORM: Prisma

---

# Core Entities

The system is built around these main entities:

- Users
- Products
- Product Variants
- Inventory
- Orders
- Order Items
- Cart
- Cart Items
- Addresses
- Payments

---

# Users

Stores customer information.

| Field | Type | Description |
|-----|-----|-------------|
| id | UUID | Primary key |
| name | String | Customer name |
| email | String | Unique email |
| phone | String | Phone number |
| password | String | Hashed password |
| created_at | Timestamp | Account creation time |

---

# Products

Represents a product in the store.

| Field | Type | Description |
|-----|-----|-------------|
| id | UUID | Product ID |
| title | String | Product name |
| slug | String | URL slug |
| description | Text | Product description |
| brand | String | Brand name |
| price | Integer | Selling price |
| compare_price | Integer | Original price |
| category_id | UUID | Category reference |
| created_at | Timestamp | Created date |

Example:

```
Premium Cotton Shirt
Brand: Zara
Price: ₹999
Compare Price: ₹2999
```

---

# Product Variants

Handles size or color variations.

| Field | Type | Description |
|-----|-----|-------------|
| id | UUID | Variant ID |
| product_id | UUID | Product reference |
| size | String | S / M / L / XL |
| color | String | Color variant |
| sku | String | Stock keeping unit |
| price | Integer | Variant price |

Example:

```
Product: Premium Shirt
Variant:
Size: M
Color: Black
```

---

# Inventory

Tracks stock levels.

| Field | Type | Description |
|-----|-----|-------------|
| id | UUID | Inventory ID |
| variant_id | UUID | Variant reference |
| stock_quantity | Integer | Available quantity |
| reserved_quantity | Integer | Reserved in cart |

---

# Cart

Temporary shopping cart for customers.

| Field | Type | Description |
|-----|-----|-------------|
| id | UUID | Cart ID |
| user_id | UUID | User reference |
| created_at | Timestamp | Created time |

---

# Cart Items

Items inside the cart.

| Field | Type | Description |
|-----|-----|-------------|
| id | UUID | Cart item ID |
| cart_id | UUID | Cart reference |
| variant_id | UUID | Variant reference |
| quantity | Integer | Item quantity |

---

# Orders

Represents a completed order.

| Field | Type | Description |
|-----|-----|-------------|
| id | UUID | Order ID |
| user_id | UUID | Customer reference |
| total_amount | Integer | Order total |
| payment_status | String | paid / pending |
| order_status | String | processing / shipped |
| created_at | Timestamp | Order time |

---

# Order Items

Items purchased in an order.

| Field | Type | Description |
|-----|-----|-------------|
| id | UUID | Order item ID |
| order_id | UUID | Order reference |
| variant_id | UUID | Product variant |
| quantity | Integer | Purchased quantity |
| price | Integer | Price at purchase |

---

# Addresses

Stores customer shipping addresses.

| Field | Type | Description |
|-----|-----|-------------|
| id | UUID | Address ID |
| user_id | UUID | User reference |
| name | String | Receiver name |
| phone | String | Contact number |
| street | String | Address line |
| city | String | City |
| state | String | State |
| postal_code | String | Zip code |

---

# Payments

Stores payment transaction data.

| Field | Type | Description |
|-----|-----|-------------|
| id | UUID | Payment ID |
| order_id | UUID | Order reference |
| payment_provider | String | Razorpay |
| payment_status | String | success / failed |
| transaction_id | String | Payment gateway ID |
| amount | Integer | Paid amount |

---

# Relationships

```
User
 ├── Cart
 │    └── Cart Items
 │
 ├── Orders
 │    └── Order Items
 │
 └── Addresses

Product
 └── Product Variants
      └── Inventory
```

---

# Optional Future Tables

These can be added later:

- Reviews
- Coupons
- Wishlists
- Returns
- Refunds
- Product Recommendations

---

# Summary

Core Tables:

- Users
- Products
- Product Variants
- Inventory
- Cart
- Cart Items
- Orders
- Order Items
- Addresses
- Payments

This schema supports:

- Product variants (size/color)
- Inventory tracking
- Cart management
- Order processing
- Payment integration