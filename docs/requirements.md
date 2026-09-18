# Dukaan ERP — Requirements Document (Chapter 0 deliverable)

## Kya bana hai (implemented, v1)

1. **Auth** — Register/Login/Verify/Refresh/Logout, JWT (access+refresh), bcrypt hashing,
   login rate-limiting. Independent `auth-service`.
2. **Party management** — Customers aur suppliers, ek hi model (`type` field se differentiate),
   phone/address, running `balance`.
3. **Product + Group management** — GST%, HSN code, unit, stock quantity, low-stock threshold,
   purchase/sale price. Groups with local-language name support.
4. **Purchase Entry** — supplier select/create, multi-product line items, cash/udhaar, auto stock increase,
   auto supplier balance update on udhaar.
5. **Sale Entry** — customer select/create, multi-product line items, cash/udhaar, auto stock decrease
   (blocks if insufficient stock), auto customer balance update on udhaar, COGS snapshot for P&L.
6. **Payments (Udhaar tracking)** — "Jama Karo" (customer payment received) and "Chuka Do"
   (payment made to supplier), partial payment support, updates running balance.
7. **Expenses** — category + amount + note + date, CRUD.
8. **Reports** — Daybook (one day's full transaction list), Daily P&L
   (sales − COGS − expenses), Top-selling products, Outstanding udhaar summary, Dashboard.
9. **Frontend** — React app: login/register, dashboard, purchase/sale entry forms, party
   management with quick-settle, product/group management, reports page.

## Not yet built (future chapters)

- Chapter 7: Barcode generation/printing, WhatsApp-shareable bill/receipt PDF
- Chapter 8: Automated tests (Jest), Swagger/Postman docs, deployment (Render/Vercel/Atlas),
  language toggle UI polish, low-stock UI alerts/notifications

## Database choice

**MongoDB** was chosen for v1 (via Mongoose) for faster iteration while learning. The blueprint
notes that ledger/udhaar data is inherently relational, so PostgreSQL is a valid alternative —
worth revisiting in Chapter 8 as a "migrate to Postgres" learning exercise if time permits.
Purchase/Sale creation already use MongoDB multi-document transactions to keep stock updates
and balance updates atomic (see main-app/backend/README.md for the local replica-set requirement).

## Entities (see er-diagram.md for the diagram)

User (auth-service only), Party, Product, Group, Purchase, Sale, Payment, Expense.
