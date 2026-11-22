# Vara Admin Backend (Express)

Secure Node.js/Express backend for Vara admin operations. Uses MongoDB, bcrypt password hashing, JWT auth (Bearer token or httpOnly cookie), and role-based access control.

## Setup

1. Install dependencies:
   ```bash
   cd backend
   npm install
   ```
2. Create env file:
   ```bash
   cp .env.example .env
   ```
3. Fill `.env` values (do not commit secrets):
   - `MONGODB_URI`
   - `ADMIN_JWT_SECRET` (long random string, >=16 chars)
   - `CORS_ORIGINS` (comma-separated allowed frontend origins)
   - `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD` (used only by seed script)

4. Create the first admin (secure seed script; no public registration route):
   ```bash
   npm run seed
   ```

5. Run in development:
   ```bash
   npm run dev
   ```

## API Endpoints

- `GET /health` - service health
- `GET /health/db` - MongoDB connection state
- `POST /api/v1/auth/login` - admin login (email/password), returns JWT and sets httpOnly cookie
- `POST /api/v1/auth/logout` - clears admin auth cookie
- `GET /api/v1/auth/me` - current admin (protected)
- `GET /api/v1/admin/dashboard` - dashboard metrics (protected, admin roles)
- `GET /api/v1/admin/products?page=1&limit=20` - paginated products (protected)
- `GET /api/v1/admin/orders?page=1&limit=20` - paginated orders (protected)

## Security Notes

- **No hardcoded credentials.** Admin credentials come from env/DB only; first admin is created via `npm run seed`.
- **No public admin registration route.**
- Passwords are hashed with bcrypt (`bcryptjs`).
- Auth supports JWT Bearer token and secure httpOnly cookie (`admin_token`).
- Protected routes use `requireAdmin`; role-based access uses `requireRole(...)`.
- CORS is restricted to `CORS_ORIGINS`; Helmet, request size limits, Zod validation, and centralized error handling are enabled.
- For production: use HTTPS, strong secrets, least-privilege MongoDB user, rate limiting, audit logs, and MFA.
