# 🛒 Grocery Booking System

A production-ready RESTful API for a grocery booking system built with Node.js, Express, TypeScript, Prisma, and PostgreSQL. Features role-based access control, JWT authentication, transactional order processing with inventory management, and Docker containerization.

---

## 📋 Table of Contents

- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Run with Docker](#run-with-docker)
  - [Run Locally](#run-locally)
- [API Documentation](#api-documentation)
  - [Auth Endpoints](#auth-endpoints)
  - [Admin Endpoints](#admin-endpoints)
  - [User Endpoints](#user-endpoints)
- [Database Schema](#database-schema)
- [Key Design Decisions](#key-design-decisions)
- [Test Credentials](#test-credentials)

---

## 🛠 Tech Stack

| Layer      | Technology               |
| ---------- | ------------------------ |
| Runtime    | Node.js v22              |
| Language   | TypeScript (strict mode) |
| Framework  | Express.js               |
| ORM        | Prisma 7                 |
| Database   | PostgreSQL 16            |
| Auth       | JWT + bcrypt             |
| Validation | Zod v4                   |
| Container  | Docker + Docker Compose  |

---

## 🏗 Architecture

The project follows a **modular layered architecture** with clear separation of concerns:

```
src/
├── config/         → Environment variable validation
├── lib/            → Prisma client singleton
├── middlewares/    → Auth, role, validation, error handling
├── modules/
│   ├── auth/       → Register, login
│   ├── grocery/    → Grocery item management
│   └── order/      → Order booking with transactions
├── routes/         → Master router
├── types/          → TypeScript type extensions
└── app.ts          → Express app entry point
```

**Layers:**

- **Controller** → Handles HTTP request/response only
- **Service** → Contains all business logic
- **Middleware** → Cross-cutting concerns (auth, validation, errors)

---

## 🚀 Getting Started

### Prerequisites

- Docker + Docker Compose (recommended)
- OR Node.js v22 + PostgreSQL 16

### Run with Docker

This is the recommended way. One command runs everything:

```bash
# Clone the repository
git clone https://github.com/imsaikatsen/grocery-booking-system
cd grocery-booking-system

# Copy environment variables
cp .env.example .env

# Start the application
docker compose up --build
```

The API will be available at `http://localhost:3000`

**Seed the database with test data:**

```bash
docker exec grocery_api npx ts-node prisma/seed.ts
```

### Run Locally

```bash
# Install dependencies
npm install

# Copy environment variables and update with your DB credentials
cp .env.example .env

# Run database migrations
npm run db:migrate

# Generate Prisma client
npm run db:generate

# Seed the database
npm run db:seed

# Start development server
npm run dev
```

---

## 📡 API Documentation

### Base URL

http://localhost:3000/api

### Health Check

GET /health

---

### Auth Endpoints

#### Register

POST /api/auth/register

Request:

```json
{
  "name": "Saikat Sen",
  "email": "saikat@example.com",
  "password": "password123",
  "role": "USER"
}
```

#### Login

POST /api/auth/login

Request:

```json
{
  "email": "saikat@example.com",
  "password": "password123"
}
```

Response:

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { "id": 1, "name": "Saikat Sen", "role": "USER" },
    "token": "eyJhbGc..."
  }
}
```

---

### Admin Endpoints

> All admin routes require `Authorization: Bearer <token>` with ADMIN role

#### Add Grocery Item

POST /api/admin/groceries

```json
{
  "name": "Basmati Rice",
  "description": "Premium quality rice",
  "price": 5.99,
  "inventory": 100
}
```

#### View All Grocery Items

GET /api/admin/groceries

#### Update Grocery Item

PUT /api/admin/groceries/:id

```json
{
  "name": "Premium Basmati Rice",
  "price": 6.99
}
```

#### Remove Grocery Item

DELETE /api/admin/groceries/:id

#### Update Inventory

PATCH /api/admin/groceries/:id/inventory

```json
{
  "inventory": 150
}
```

---

### User Endpoints

> All user routes require `Authorization: Bearer <token>` with USER role

#### View Available Grocery Items

GET /api/user/groceries

Returns only active items with inventory > 0.

#### Place an Order

POST /api/user/orders

```json
{
  "items": [
    { "groceryItemId": 1, "quantity": 2 },
    { "groceryItemId": 3, "quantity": 1 }
  ]
}
```

#### View All Orders

GET /api/user/orders/:id

---

## 🗄 Database Schema

users
id, name, email (unique), password (hashed), role (ADMIN|USER)
grocery_items
id, name, description, price (Decimal), inventory, isActive
orders
id, userId (FK), totalAmount (Decimal), status (CONFIRMED)
order_items
id, orderId (FK), groceryItemId (FK), quantity, unitPrice (snapshot)

---

## 🧠 Key Design Decisions

### 1. Transactional Order Processing

Orders use PostgreSQL transactions with `SELECT FOR UPDATE` row-level locking to prevent race conditions and overselling. If any item has insufficient stock, the entire order is rolled back atomically.

### 2. Soft Delete for Grocery Items

Grocery items are never permanently deleted. Setting `isActive: false` hides items from users while preserving historical order data integrity. Hard deletion would break order history.

### 3. Price Snapshot in OrderItems

`unitPrice` is stored at the time of purchase in the `order_items` table. This ensures order history always reflects the correct price paid, regardless of future price changes.

### 4. Decimal for Money

All monetary values use PostgreSQL `DECIMAL(10,2)` instead of `FLOAT` to avoid floating point precision errors in financial calculations.

### 5. Centralized Error Handling

All errors flow through a single `errorMiddleware`. Services throw typed `AppError` instances with HTTP status codes. Controllers never handle error responses directly.

### 6. No Repository Pattern

Prisma already serves as the data access abstraction layer. Adding a repository layer would abstract an abstraction, adding complexity without meaningful benefit at this scale. In a larger codebase with multiple developers or database swap requirements, the repository pattern would be introduced with interfaces.

### 7. Multi-stage Docker Build

The Dockerfile uses a multi-stage build — a builder stage compiles TypeScript, and the production stage copies only the compiled output with production dependencies, resulting in a significantly smaller final image.

---

## 🔑 Test Credentials

After running the seed command:

| Role  | Email             | Password |
| ----- | ----------------- | -------- |
| Admin | admin@grocery.com | admin123 |
| User  | user@grocery.com  | user123  |

**Sample Data:** 10 grocery items created (9 in stock, 1 intentionally out of stock for testing inventory filters)

---

## 📜 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Compile TypeScript
npm run start        # Start production server
npm run db:migrate   # Run database migrations
npm run db:generate  # Generate Prisma client
npm run db:seed      # Seed database with test data
npm run db:studio    # Open Prisma Studio (DB GUI)
```
