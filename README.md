# Dukaan ERP — Mini Tally Prime (v1)

Vernacular-friendly accounting/mini-ERP for tier-2/3 India shopkeepers. Learning project:
microservices architecture, JWT auth, MongoDB transactions, React frontend.

## Architecture

```
dukaan-erp/
├── auth-service/        (independent microservice — its own port, its own DB)
├── main-app/
│   ├── backend/         (Express API — parties, products, purchases, sales, payments, reports)
│   └── frontend/        (React + Vite UI)
└── docs/                (requirements.md, er-diagram.md)
```

`main-app/backend` never touches `auth-service`'s code or database — it calls
`GET /verify` over HTTP to validate every request's JWT.

## What works right now (v1)

- Register/login/logout, JWT access+refresh, rate-limited login
- Party (customer/supplier), Product, Group management
- Purchase Entry — auto stock increase, udhaar tracking
- Sale Entry — auto stock decrease (blocks negative stock), udhaar tracking, COGS snapshot
- "Jama Karo" / "Chuka Do" payment settling with partial-payment support
- Expense tracking
- Reports: Dashboard, Daily P&L, Daybook, Top-selling products, Outstanding udhaar
- Full React frontend wired to all of the above

**Not yet built:** barcode printing, WhatsApp bill sharing, automated tests, deployment
configs — these map to Chapters 7 & 8 in `docs/requirements.md`.

## Local setup — full walkthrough

### 1. Prerequisites
| Tool | Check |
|---|---|
| Node.js v18+ | `node -v` |
| npm | `npm -v` |
| MongoDB | see below |
| Postman (optional, for API testing) | — |

### 2. MongoDB — run as a single-node replica set

Purchase/Sale creation use multi-document transactions (so a stock update and a balance
update either both happen or neither does). Plain standalone `mongod` does **not** support
this — you need a one-node replica set, which is still just running on your own laptop:

```bash
mongod --dbpath /path/to/your/data --replSet rs0
```

In a second terminal, run **once**:
```bash
mongosh
> rs.initiate()
```

(If this feels like too much right now, you can strip the `session`/transaction code out of
`purchaseController.js` and `saleController.js` for a simpler non-atomic version — fine for
early learning, just note it as a Chapter 8 TODO.)

### 3. auth-service
```bash
cd auth-service
npm install
cp .env.example .env      # edit JWT secrets if you like
npm run dev
```
Runs on `http://localhost:5000`

### 4. main-app backend
```bash
cd main-app/backend
npm install
cp .env.example .env
npm run dev
```
Runs on `http://localhost:5001`

### 5. main-app frontend
```bash
cd main-app/frontend
npm install
cp .env.example .env
npm run dev
```
Opens on `http://localhost:5173`

### 6. First run
1. Open `http://localhost:5173/register`, create your shop account.
2. Login.
3. Go to **Products** → add a Group + a Product (set stock, sale price, GST).
4. Go to **Parties** → add a customer or supplier (or just add them inline from
   Purchase/Sale Entry).
5. Try a **Purchase Entry** (stock goes up), then a **Sale Entry** (stock goes down).
6. Check **Dashboard** and **Reports** — numbers should update live.

### Common issues
- **"MongoNetworkError" / can't connect** → is `mongod` actually running? Right `MONGO_URI`?
- **Purchase/Sale save fails with a transaction error** → replica set not initiated — redo step 2.
- **401 errors on every request** → `AUTH_SERVICE_URL` in `main-app/backend/.env` wrong, or
  auth-service isn't running.
- **CORS error in browser console** → `CORS_ORIGIN` in both `.env` files should match your
  frontend URL exactly (`http://localhost:5173`).
- **Port already in use** → change `PORT` in the relevant `.env`, or `npx kill-port 5000`.

## Extending this later
See `docs/requirements.md` for what's built vs. pending, and the chapter table in the
original blueprint for the intended build order (barcode/printing, testing, deployment).
