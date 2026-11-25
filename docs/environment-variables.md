# Environment Variables (Vara)

Create `.env.local` for the legacy Next.js app and `backend/.env` for the Express API. Never commit real secrets. The canonical deployed stack is:

- **Frontend:** Vite SPA in `frontend/` (Netlify)
- **Backend:** Express API in `backend/` (Render)

## Vite storefront (`frontend/`)

Create `frontend/.env.local` for local development.

| Variable | Required | Description |
|---|---|---|
| `VITE_API_BASE_URL` | Yes | Local: `/api` (proxied to `http://localhost:5000`). Deployed: `https://<render-service>.onrender.com/api`. |

Notes:

- The frontend always sends `credentials: "include"`.
- No Razorpay key belongs in the Vite frontend. `/api/checkout/config` and `/api/checkout/create-razorpay-order` return the public key ID after the backend creates the order.
- Netlify must publish `frontend/dist` with the SPA fallback in `frontend/public/_redirects`.

## Express backend (`backend/.env`)

| Variable | Required | Description |
|---|---|---|
| `NODE_ENV` | Yes | `development` locally; `production` on Render. |
| `PORT` | Local only | Default `5000`. Leave unset on Render so the platform injects it. |
| `MONGODB_URI` | Yes | MongoDB connection string. Use a least-privilege user in production. |
| `CORS_ORIGINS` | Yes | Comma-separated allowed origins. Include the Netlify URL and local `http://localhost:5173`. |
| `FRONTEND_URL` | Yes | Absolute frontend origin used to build password-reset links, e.g. `http://localhost:5173`. |
| `AUTH_SECRET` | Yes | Customer JWT secret, at least 16 chars. Must differ from `ADMIN_JWT_SECRET`. |
| `ADMIN_JWT_SECRET` | Yes | Admin JWT secret, at least 16 chars. |
| `RAZORPAY_KEY_ID` | For online payments | Server key ID. If absent, only COD is enabled. |
| `RAZORPAY_KEY_SECRET` | For online payments | Server-only secret. Never prefix with `VITE_`. |
| `RAZORPAY_WEBHOOK_SECRET` | Future | Webhook signature secret; no webhook endpoint is enabled yet. |
| `RATE_LIMIT_ENABLED` | No | Defaults to `true`; set `false` for tests only. |
| `RATE_LIMIT_WINDOW_MS` | No | Default `60000`. |
| `RATE_LIMIT_MAX` | No | Default `60`. |
| `RATE_LIMIT_AUTH_MAX` | No | Default `10`. |
| `RATE_LIMIT_CHECKOUT_MAX` | No | Default `30`. |
| `RATE_LIMIT_NEWSLETTER_MAX` | No | Default `5`. |
| `SEED_ADMIN_EMAIL` | For seed | First super-admin email. |
| `SEED_ADMIN_PASSWORD` | For seed | Strong initial password. |
| `SEED_ADMIN_NAME` | Optional | Admin display name. |

Security notes:

- Customer and admin tokens use different secrets, audiences, and `typ` claims. Existing tokens are invalidated when the claim changes.
- State-changing requests with an `Origin` header are checked against `CORS_ORIGINS`.
- Password-reset links are no longer logged. A production email provider must be configured before reset emails can be delivered; do not invent credentials.

## Legacy Next.js app (root)

The root Next.js app is retained for compatibility but is not the deployed storefront.

| Variable | Required | Description |
|---|---|---|
| `MONGODB_URI` | Yes | MongoDB connection string. |
| `AUTH_SECRET` | Yes | JWT secret, at least 16 chars. There is no `MONGODB_URI` fallback and no hardcoded dev secret. |
| `NEXT_PUBLIC_SITE_URL` | Production | Canonical absolute URL used by `sitemap.ts`; required in production. |
| `RAZORPAY_KEY_ID` | For online payments | Server key ID. |
| `RAZORPAY_KEY_SECRET` | For online payments | Server-only secret. |
| `SEED_ADMIN_EMAIL` | For seed | Initial admin email. |
| `SEED_ADMIN_PASSWORD` | For seed | Initial admin password. |
| `SEED_ADMIN_NAME` | Optional | Initial admin display name. |

`NEXT_PUBLIC_RAZORPAY_KEY_ID` is no longer required: the checkout form uses the key ID returned by the API.

## Supabase (documented, not connected)

Supabase schemas and RLS migrations exist in `supabase/`, but the deployed app does **not** use Supabase. If it is enabled later, set `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` server-side only. Live RLS verification requires Supabase credentials.

## Security rules

- Do not prefix secrets with `NEXT_PUBLIC_` or `VITE_`.
- Do not commit `.env.local`, `.env`, or real credentials.
- Rotate any credential that was previously exposed.
- Use Razorpay test keys until the full payment flow is verified.
- If Razorpay keys are absent, checkout remains usable through Cash on Delivery.
- Use HTTPS in production; secure cookies are enabled by `NODE_ENV=production`.
