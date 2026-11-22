# Environment Variables (Vara)

Create `.env.local` for local development. In production, set variables in your hosting provider's environment settings. **Never commit real secrets.**

## Next.js app (website + admin)

### Server-only (NEVER expose to client)

| Variable | Required | Description |
|---|---|---|
| `MONGODB_URI` | Yes | MongoDB connection string (use least-privilege user in production) |
| `AUTH_SECRET` | Yes | Long random secret for JWT signing (>= 32 chars) |
| `RAZORPAY_KEY_ID` | Yes for checkout | Razorpay server key ID (`rzp_test_...` for test, live key only after verification) |
| `RAZORPAY_KEY_SECRET` | Yes for checkout | Razorpay server secret |

### Public (safe for browser)

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Yes for checkout | Razorpay public key ID |
| `NEXT_PUBLIC_SITE_URL` | Recommended | Canonical production URL, e.g. `https://your-domain.com` |
| `NEXT_PUBLIC_APP_URL` | Recommended | App base URL; used as fallback for reset links |
| `NEXT_PUBLIC_ADMIN_API_URL` | Optional | Base URL for separate Express admin backend, if deployed |

### Seed script only (do not commit real values)

| Variable | Required | Description |
|---|---|---|
| `SEED_ADMIN_EMAIL` | For seed | Initial admin email |
| `SEED_ADMIN_PASSWORD` | For seed | Initial admin password (strong) |
| `SEED_ADMIN_NAME` | Optional | Initial admin display name |

## Express admin backend (`backend/`)

| Variable | Required | Description |
|---|---|---|
| `PORT` | Platform-provided | Server port (hosting platform usually injects) |
| `NODE_ENV` | Yes | `production` in production |
| `MONGODB_URI` | Yes | MongoDB connection string |
| `CORS_ORIGINS` | Yes | Comma-separated allowed origins, e.g. `https://your-domain.com` |
| `ADMIN_JWT_SECRET` | Yes | Long random secret (>= 16 chars) |
| `SEED_ADMIN_EMAIL` | For seed | First admin email |
| `SEED_ADMIN_PASSWORD` | For seed | First admin password |

## Security rules

- Do **not** prefix secrets with `NEXT_PUBLIC_`.
- Do **not** commit `.env.local`, `.env`, or real credentials.
- Rotate credentials immediately if exposed.
- Use Razorpay test keys until the full test flow is verified.
- Use HTTPS in production; set secure cookies by running with `NODE_ENV=production`.
