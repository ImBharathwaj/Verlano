# Verlano E-Commerce API Specification

This document defines the backend API endpoints for the Verlano ecommerce platform.

Base URL

/api/v1

All responses are returned in JSON format.

---

# Authentication

Authentication is handled using session tokens or JWT.

## Login

POST /auth/login

Request

{
  "email": "user@example.com",
  "password": "password"
}

Response

{
  "token": "jwt_token",
  "user": {
    "id": "user_id",
    "name": "John Doe"
  }
}

---

## Register

POST /auth/register

Request

{
  "name": "John Doe",
  "email": "user@example.com",
  "phone": "9876543210",
  "password": "password"
}

---

# Products

## Get All Products

GET /products

Query Parameters

page  
limit  
category  
brand  

Example

GET /products?page=1&limit=20

Response

{
  "products": []
}

---

## Get Product Details

GET /products/:slug

Example

GET /products/premium-cotton-shirt

Response

{
  "id": "product_id",
  "title": "Premium Cotton Shirt",
  "brand": "Zara",
  "price": 999,
  "compare_price": 2999,
  "variants": []
}

---

# Cart

## Get Cart

GET /cart

Response

{
  "items": []
}

---

## Add Item to Cart

POST /cart

Request

{
  "variant_id": "variant_id",
  "quantity": 1
}

---

## Update Cart Item

PATCH /cart/:item_id

Request

{
  "quantity": 2
}

---

## Remove Cart Item

DELETE /cart/:item_id

---

# Checkout

## Create Checkout Session

POST /checkout

Request

{
  "address_id": "address_id",
  "payment_method": "razorpay"
}

Response

{
  "order_id": "order_id",
  "payment_url": "razorpay_checkout_url"
}

---

# Orders

## Get User Orders

GET /orders

Response

{
  "orders": []
}

---

## Get Order Details

GET /orders/:order_id

Response

{
  "id": "order_id",
  "status": "processing",
  "items": []
}

---

# Addresses

## Add Address

POST /addresses

Request

{
  "name": "John",
  "phone": "9876543210",
  "street": "Street name",
  "city": "Chennai",
  "state": "Tamil Nadu",
  "postal_code": "600001"
}

---

## Get User Addresses

GET /addresses

---

# Payments

Payment processing is handled through Razorpay.

## Create Payment Order

POST /payments/create

Response

{
  "razorpay_order_id": "order_id"
}

---

## Payment Webhook

POST /webhooks/razorpay

Used to update payment status.

---

# Shipping

Shipping integration handled through Shiprocket.

## Create Shipment

POST /shipping/create

## Track Shipment

GET /shipping/track/:shipment_id

---

# Admin APIs

(Admin authentication required)

---

## Create Product

POST /admin/products

---

## Update Product

PUT /admin/products/:id

---

## Delete Product

DELETE /admin/products/:id

---

## Get All Orders

GET /admin/orders

---

# API Status Codes

200 OK  
201 Created  
400 Bad Request  
401 Unauthorized  
404 Not Found  
500 Internal Server Error

---

# Future API Extensions

Wishlist APIs  
Reviews APIs  
Coupons APIs  
Returns APIs  
Recommendation APIs

---

# Summary

Core API Modules

Authentication  
Products  
Cart  
Checkout  
Orders  
Addresses  
Payments  
Shipping  
Admin

These APIs support the full ecommerce flow:

Browse → Add to Cart → Checkout → Payment → Order → Shipping