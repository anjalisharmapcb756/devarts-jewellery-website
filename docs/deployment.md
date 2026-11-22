# Production Deployment (Vara)

## Hosting inspection (current repo)

**Observed signals:**
- Git remote: `origin=https://github.com/anjalisharmapcb756/vara-jewellery-website.git` (branch `main`)
- `.gitignore` ignores `.vercel`
- Existing docs referenced Vercel setup
- No `Dockerfile`, `netlify.toml`, `render.yaml`, `fly.toml`, or GitHub Actions workflows found
- App is a **Next.js 16 (App Router)** project with standard `build`/`start` scripts - compatible with Vercel

**Conclusion:** The primary hosting provider for the website is **Vercel** (Next.js). The separate Express admin backend in `backend/` is a standalone Node/Express service and should be deployed on a Node host such as **Render, Railway, Fly.io, or a VPS/container platform**.

> Known issue from prior context: Vercel may be connected to the wrong repo (`anjalisharmapcb756/vara-jewelleryv-website`). Confirm the Vercel project imports `anjalisharmapcb756/vara-jewellery-website`.

## Recommended deployment process

### A. Next.js website + built-in admin (recommended primary)

Deploy this repo to **Vercel**. It includes the storefront, auth, admin UI, and Next.js API routes/server actions.

1. **Fix Vercel repo connection**
   - In Vercel Dashboard, ensure the project is connected to `anjalisharmapcb756/vara-jewellery-website`.
   - If connected to the wrong repo, disconnect/reconnect or create a new Vercel project from the correct repo.
2. **Configure environment variables** (Vercel Project Settings > Environment Variables)
   - `MONGODB_URI`
   - `AUTH_SECRET` (long random secret)
   - `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `NEXT_PUBLIC_RAZORPAY_KEY_ID` (test keys first)
   - `NEXT_PUBLIC_SITE_URL=https://your-domain.com`
   - `NEXT_PUBLIC_APP_URL=https://your-domain.com`
   - Optional: `NEXT_PUBLIC_ADMIN_API_URL=https://your-admin-api-domain.com`
3. **Build settings**
   - Framework: Next.js
   - Build command: `npm run build` (repo uses `next build --webpack`)
   - Install command: `npm install`
   - Output: default Next.js
4. **Deploy and verify**
   - Confirm HTTPS domain is active.
   - Run seed script locally/securely against production DB only when intended: `npm run seed:admin` with production env vars set in a secure shell (do not commit secrets).
   - Test admin login at `/login?next=/admin`.
5. **Post-deploy checks**
   - Admin login/logout, protected `/admin` routes
   - Product/category/order/customer management
   - Settings save (`/api/admin/settings`)
   - Checkout Razorpay test flow (no live payments until verified)
   - Password reset flow (configure email provider before production use)

### B. Express admin backend (`backend/`) - separate service

Deploy `backend/` to **Render/Railway/Fly.io** (or any Node host with HTTPS).

1. Create a new service from the same repo, **root directory `backend`**.
2. Build command: `npm install && npm run build`
3. Start command: `npm run start`
4. Set env vars:
   - `NODE_ENV=production`
   - `PORT` (platform-provided)
   - `MONGODB_URI`
   - `ADMIN_JWT_SECRET`
   - `CORS_ORIGINS=https://your-domain.com` (include admin/frontend domains only)
   - `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD` for initial seed (run once securely)
5. Run seed once: `npm run seed`
6. Verify:
   - `GET /health`
   - `GET /health/db`
   - `POST /api/v1/auth/login`
   - `GET /api/v1/auth/me` with Bearer token/cookie

## Security checklist

- [ ] No secrets in frontend code or committed `.env` files
- [ ] `AUTH_SECRET` and `ADMIN_JWT_SECRET` are long random values
- [ ] MongoDB credentials rotated if ever exposed; use least-privilege DB user
- [ ] HTTPS enabled on all domains
- [ ] CORS restricted to exact production origins
- [ ] Admin seed run through secure env vars; no public admin registration
- [ ] Razorpay live keys only after test-mode verification
- [ ] Local/demo file uploads replaced with object storage for production
- [ ] Rate limiting/audit logging/MFA considered for admin backend

## Notes

- The Next.js app already contains a functional admin dashboard. The Express backend is an additional secure API service; deploy it only if you need it as a separate admin API.
- If using both, keep CORS strict and configure `NEXT_PUBLIC_ADMIN_API_URL` in the Next.js app.
- Never enable live payments before Razorpay test-mode verification.
