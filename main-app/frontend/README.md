# main-app / frontend

React (Vite) frontend for Dukaan ERP.

## Run

```bash
cd main-app/frontend
npm install
cp .env.example .env
npm run dev
```

Opens at `http://localhost:5173`

## Pages
- `/login`, `/register` — auth (talks directly to auth-service)
- `/` — Dashboard (today's sale/purchase/profit, low stock, udhaar totals)
- `/purchase` — Purchase Entry (select/create supplier, add products, cash/udhaar)
- `/sale` — Sale Entry (select/create customer, add products, cash/udhaar, blocks negative stock)
- `/parties` — Customers/Suppliers list with udhaar balance + "Jama Karo"/"Chuka Do" quick settle
- `/products` — Product + Group management
- `/reports` — Daily P&L, top products, daybook

## Notes
- Access token stored in `localStorage`, auto-attached to every backend request.
- On 401, automatically tries `/refresh-token` once before logging out.
- Not yet built (Chapter 7/8 territory): barcode printing, WhatsApp bill sharing, deployment configs.
