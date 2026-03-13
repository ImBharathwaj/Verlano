# Verlano — Entity Relationship Diagram

This document describes the current data model (Prisma schema) for the Verlano e-commerce platform.

---

## ER diagram (Mermaid)

Render this in any Mermaid-compatible viewer (e.g. GitHub, VS Code with Mermaid extension, or [mermaid.live](https://mermaid.live)).

```mermaid
erDiagram
  User ||--o| Cart : "has one"
  User ||--o{ Order : "places"
  User ||--o{ Address : "has"

  Cart ||--o{ CartItem : "contains"
  CartItem }o--|| ProductVariant : "references"

  Product ||--o{ ProductVariant : "has"
  Product ||--o{ ProductImage : "has"
  ProductVariant ||--o| Inventory : "has"

  Order ||--o{ OrderItem : "contains"
  Order ||--o| Payment : "has"
  OrderItem }o--|| ProductVariant : "references"

  User {
    uuid id PK
    string name
    string email UK
    string phone
    string password
    datetime createdAt
  }

  Product {
    uuid id PK
    string title
    string slug UK
    string description
    string brand
    string_array categories
    int price
    int comparePrice
    datetime createdAt
  }

  ProductVariant {
    uuid id PK
    uuid productId FK
    string size
    string color
    string sku UK
    int price
  }

  ProductImage {
    uuid id PK
    uuid productId FK
    string url
    string alt
    int position
    boolean isPrimary
  }

  Inventory {
    uuid id PK
    uuid variantId FK UK
    int stockQuantity
    int reservedQuantity
  }

  Cart {
    uuid id PK
    uuid userId FK UK
    datetime createdAt
  }

  CartItem {
    uuid id PK
    uuid cartId FK
    uuid variantId FK
    int quantity
  }

  Order {
    uuid id PK
    uuid userId FK
    int totalAmount
    string paymentStatus
    string orderStatus
    string shippingName
    string shippingPhone
    string shippingStreet
    string shippingCity
    string shippingState
    string shippingPostalCode
    string razorpayOrderId UK
    string trackingId UK
    string trackingUrl
    string shippingStatus
    datetime createdAt
  }

  OrderItem {
    uuid id PK
    uuid orderId FK
    uuid variantId FK
    int quantity
    int price
  }

  Address {
    uuid id PK
    uuid userId FK
    string name
    string phone
    string street
    string city
    string state
    string postalCode
  }

  Payment {
    uuid id PK
    uuid orderId FK UK
    string paymentProvider
    string paymentStatus
    string transactionId UK
    int amount
  }
```

---

## Entity summary

| Entity          | Purpose |
|-----------------|---------|
| **User**        | Registered user; optional link to Cart and Orders. |
| **Product**     | Catalog product (title, brand, categories, base price). |
| **ProductVariant** | One size/color option of a product; has SKU, price, and links to Inventory. |
| **ProductImage**  | Image URL and metadata per product (position, primary). |
| **Inventory**   | Stock and reserved quantity per variant (1:1 with ProductVariant). |
| **Cart**        | Shopping basket; identified by cookie (guest) or userId (logged-in). |
| **CartItem**    | Line in a cart: variant + quantity (links cart to ProductVariant). |
| **Order**       | Placed order; guest shipping fields, payment and shipping status. |
| **OrderItem**   | Line in an order: variant + quantity + price snapshot. |
| **Address**     | Saved address for a user. |
| **Payment**     | Payment record per order (provider, transaction id, amount). |

---

## Relationships

| From       | To             | Cardinality | Description |
|-----------|----------------|-------------|-------------|
| User      | Cart           | 1:0..1      | A user has at most one cart. |
| User      | Order          | 1:many      | A user can place many orders. |
| User      | Address        | 1:many      | A user can have many addresses. |
| Cart      | CartItem       | 1:many      | A cart has many line items. |
| CartItem  | ProductVariant | N:1         | Each cart line references one variant (size/color). |
| Product   | ProductVariant | 1:many      | A product has many variants (size/color combos). |
| Product   | ProductImage    | 1:many      | A product has many images. |
| ProductVariant | Inventory   | 1:0..1      | Each variant has at most one inventory row. |
| Order     | OrderItem      | 1:many      | An order has many line items. |
| OrderItem | ProductVariant | N:1         | Each order line references one variant. |
| Order     | Payment        | 1:0..1      | An order has at most one payment record. |

---

## Cart ↔ Product connection

Cart items are linked to products only through **ProductVariant**:

- **CartItem.variantId** → **ProductVariant.id**
- **ProductVariant.productId** → **Product.id**

So: **Cart** → **CartItem** → **ProductVariant** → **Product**. The same variant is used for availability (Inventory), cart (CartItem), and orders (OrderItem).

---

## Key constraints

- **Product.slug** — unique (URL-friendly identifier).
- **ProductVariant.sku** — unique (per variant).
- **User.email** — unique.
- **Cart.userId** — unique (one cart per user when linked).
- **Inventory.variantId** — unique (one inventory row per variant).
- **Order.razorpayOrderId**, **Order.trackingId**, **Payment.transactionId**, **Payment.orderId** — unique where defined in schema.
