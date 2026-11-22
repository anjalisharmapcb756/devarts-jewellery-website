# Vara Jewellery Website

Luxury jewellery e-commerce app built with Next.js (App Router), TypeScript, Tailwind CSS, MongoDB/Mongoose, JWT auth, and Razorpay.

## Stack
- **Framework:** Next.js 16 (App Router), React, TypeScript
- **Styling:** Tailwind CSS v4
- **Database:** MongoDB (Mongoose)
- **Auth:** JWT session cookie (`vara-session`), bcrypt password hashing
- **Payments:** Razorpay (server-side order creation + signature/API verification)
- **Uploads:** Local `public/uploads/products` by default (storage abstraction in `lib/storage.ts`)

## Local Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy env file and fill values:
   ```bash
   cp .env.example .env.local
   ```
3. Set required env vars in `.env.local`:
   - `MONGODB_URI` - MongoDB connection string
   - `AUTH_SECRET` - long random secret for JWT signing
   - `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `NEXT_PUBLIC_RAZORPAY_KEY_ID` - Razorpay test keys
   - `NEXT_PUBLIC_SITE_URL` / `NEXT_PUBLIC_APP_URL` - e.g. `http://localhost:3000`
   - Optional: `NEXT_PUBLIC_ADMIN_API_URL` - separate Express admin backend URL if deployed

4. Run dev server:
   ```bash
   npm.cmd run dev --webpack
   ```
   Open `http://localhost:3000`.

## Admin Access (Single Super Admin)
- Admin routes: `/admin` (protected; only the existing Super Admin can access).
- **Only one Super Admin account is allowed in MongoDB.** A partial unique index enforces this.
- **No public admin registration. No admin creation option in UI/API.**
- Create the Super Admin with the secure seed script:
  ```bash
  # set in .env.local (do not commit real values)
  SEED_ADMIN_EMAIL=you@example.com
  SEED_ADMIN_PASSWORD=your-strong-password
  SEED_ADMIN_NAME=Super Admin

  npm run seed:admin
  ```
- The seed script creates the Super Admin if none exists. If the same Super Admin email exists, it updates the password/name. If a different Super Admin already exists, it refuses to create another.
- Passwords are hashed with bcrypt; auth uses secure JWT session cookies; logout clears the session.

## Key Features
- Storefront: home, category/product pages, cart, wishlist, checkout, order confirmation, account dashboard
- Admin: catalogue/order/customer management
- Auth: register/login/logout, profile update, password reset token flow (dev logs reset link to server console when email provider is not configured)
- Checkout: server-side pricing/quote, Razorpay order creation, signature + API verification, idempotent payment handling, stock checks

## Deployment

See `docs/deployment.md` for hosting inspection, recommended deployment process, and production checklist. Current repo signals indicate **Vercel** for the Next.js app; the separate Express backend in `backend/` should be deployed to a Node host (Render/Railway/Fly/VPS).

## Notes
- **Do not commit `.env.local` or secrets.** Rotate any credentials exposed during development.
- Password reset currently logs reset links to the server console in development; integrate an email provider for production.
- Image uploads default to local filesystem; use S3/Cloudinary/etc. for production deployments.
- Before taking live payments, complete Razorpay test-mode verification and production hardening.

## Scripts
- `npm.cmd run dev --webpack` - start dev server
- `npm.cmd run build` - production build
- `npm.cmd run start` - start production server
- `npm run seed:admin` - create/update first admin from env vars (secure; no hardcoded credentials)
