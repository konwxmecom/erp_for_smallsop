# auth-service

Standalone JWT authentication microservice for Dukaan ERP. Runs independently
on its own port with its own MongoDB connection.

## Run standalone

```bash
cd auth-service
npm install
cp .env.example .env      # fill in real secrets
npm run dev                # nodemon, auto-restart
# or: npm start
```

Default: `http://localhost:5000`

## Endpoints

| Method | Path             | Body                                          | Notes                          |
|--------|------------------|------------------------------------------------|---------------------------------|
| POST   | /register        | shopName, name, email, password                | creates a new owner account     |
| POST   | /login           | email, password                                 | rate-limited (10/15min per IP)  |
| GET    | /verify          | header: `Authorization: Bearer <accessToken>`  | used by main-app's checkAuth    |
| POST   | /refresh-token   | refreshToken                                    | issues new access token         |
| POST   | /logout          | refreshToken                                    | invalidates stored refresh token|

## Notes
- Passwords hashed with bcrypt (12 salt rounds).
- Access token short-lived (15m default), refresh token long-lived (7d default) — configurable in `.env`.
- Never commit `.env` — only `.env.example` is tracked.
