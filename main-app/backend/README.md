# main-app / backend

Core Dukaan ERP backend: parties, products, groups, purchases, sales, payments,
expenses, reports. Talks to `auth-service` for login/token verification — never
touches auth-service's code or database directly.

## Run

```bash
cd main-app/backend
npm install
cp .env.example .env
npm run dev
```

Default: `http://localhost:5001`

### ⚠️ MongoDB transactions requirement
Purchase and Sale creation use MongoDB multi-document transactions (so stock
update + udhaar update either both succeed or both fail). A plain standalone
`mongod` does **not** support transactions — you need a single-node replica set:

```bash
mongod --dbpath /your/data/path --replSet rs0
# in a separate terminal, run once:
mongosh
> rs.initiate()
```

If you'd rather skip this for now, that's a fine simplification for early
chapters — just note it as a TODO for Chapter 8 (production hardening).

## API summary

| Resource  | Base path         |
|-----------|--------------------|
| Groups    | `/api/groups`      |
| Products  | `/api/products`    |
| Parties   | `/api/parties`     |
| Purchases | `/api/purchases`   |
| Sales     | `/api/sales`       |
| Payments  | `/api/payments`    |
| Expenses  | `/api/expenses`    |
| Reports   | `/api/reports`     |

All routes (except `/health`) require `Authorization: Bearer <accessToken>`
issued by auth-service's `/login`.
