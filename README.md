# 🛒 NEXMART — Multi-Vendor Marketplace (Project 16)

A full-stack multi-vendor marketplace built with **MongoDB, Express.js, React.js, Node.js & JSP-style Reports**

---

## 📁 Project Structure

```
marketplace/
├── backend/          ← Node.js + Express + MongoDB API
│   ├── models/       ← MongoDB Schemas (User, Vendor, Product, Order, Commission, Dispute, Cart)
│   ├── routes/       ← API routes (auth, vendors, products, orders, cart, commission, disputes, admin, reports)
│   ├── middleware/   ← JWT Auth middleware
│   ├── server.js     ← Main server entry point
│   ├── seed.js       ← Demo data seeder
│   └── .env          ← Environment variables
└── frontend/         ← React.js frontend
    └── src/
        ├── pages/    ← Home, Login, Register, Products, Cart, Checkout, Orders, Vendor Dashboard, Admin, Disputes
        ├── components/ ← Navbar, Footer
        ├── context/  ← Auth & Cart context
        └── styles/   ← Global CSS
```

---

## ⚙️ STEP 1 — Install Prerequisites

Make sure these are installed on your computer:
- **Node.js** (v16+): https://nodejs.org
- **MongoDB** (Community): https://www.mongodb.com/try/download/community

### Start MongoDB (Windows):
```
net start MongoDB
```
### Start MongoDB (Mac/Linux):
```
brew services start mongodb-community
```

---

## 🚀 STEP 2 — Setup Backend

Open a terminal and run:

```bash
cd marketplace/backend
npm install
```

This installs: express, mongoose, bcryptjs, jsonwebtoken, cors, dotenv, stripe, multer

---

## 🌱 STEP 3 — Seed Demo Data

```bash
cd marketplace/backend
node seed.js
```

This creates:
- ✅ Admin account: admin@nexmart.com / admin123
- ✅ Vendor account: vendor@nexmart.com / vendor123
- ✅ Buyer account: buyer@nexmart.com / buyer123
- ✅ 12 demo products across 3 vendors

---

## ▶️ STEP 4 — Run Backend Server

```bash
cd marketplace/backend
npm run dev
```

Backend runs at: **http://localhost:5000**

---

## 💻 STEP 5 — Setup & Run Frontend

Open a **NEW terminal window** and run:

```bash
cd marketplace/frontend
npm install
npm start
```

Frontend runs at: **http://localhost:3000**

---

## 🌐 STEP 6 — Open in Browser

Go to: **http://localhost:3000**

---

## 🔑 Demo Login Credentials

| Role   | Email                  | Password  |
|--------|------------------------|-----------|
| Admin  | admin@nexmart.com      | admin123  |
| Vendor | vendor@nexmart.com     | vendor123 |
| Buyer  | buyer@nexmart.com      | buyer123  |

---

## 📋 Features Implemented

### Buyer Features
- ✅ Register / Login
- ✅ Browse products across ALL vendors
- ✅ Filter by category, sort by price/rating
- ✅ Search products
- ✅ Add products from MULTIPLE vendors to ONE cart
- ✅ Unified checkout
- ✅ View order history
- ✅ Write product reviews
- ✅ File disputes for orders

### Vendor Features
- ✅ Vendor registration with shop setup
- ✅ Vendor storefront (public page)
- ✅ Add / Edit / Delete products
- ✅ View incoming orders
- ✅ Update order status
- ✅ Commission ledger (10% auto-deducted)
- ✅ Payout statement (JSP-style HTML report)

### Admin Features
- ✅ Dashboard with platform stats
- ✅ Manage all vendors (verify, enable/disable)
- ✅ View all users, orders
- ✅ Dispute resolution module
- ✅ Commission summary report (JSP-style)

### Technical Features
- ✅ MongoDB — all data storage
- ✅ Express.js — REST API with vendor-scoped middleware
- ✅ React.js — storefront + vendor dashboard + admin panel
- ✅ Node.js — Stripe Connect payment routes
- ✅ JSP-style Reports — server-rendered HTML payout statements
- ✅ JWT Authentication
- ✅ Commission auto-calculation engine (10%)

---

## 📄 JSP-Style Reports (View in Browser)

After running the backend:

- **Vendor Payout Statement**: http://localhost:5000/reports/vendor-payout/{vendor_id}
- **Admin Commission Summary**: http://localhost:5000/reports/admin-commission

These are accessible from the vendor dashboard and admin panel via buttons.

---

## 🛠️ API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register user/vendor |
| POST | /api/auth/login | Login |
| GET | /api/products | List all products |
| POST | /api/products | Add product (vendor) |
| GET | /api/vendors | List all vendors |
| GET | /api/vendors/:id | Vendor storefront |
| POST | /api/cart/add | Add to cart |
| POST | /api/orders | Place order |
| GET | /api/orders/vendor | Vendor orders |
| GET | /api/commission/vendor | Vendor commission |
| POST | /api/disputes | Raise dispute |
| GET | /api/admin/dashboard | Admin stats |
| GET | /reports/admin-commission | Commission report (JSP) |

---

