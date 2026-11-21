# Environment Variables (Vara)

Create `.env.local` in the project root for local development. In Vercel, add these in **Project Settings > Environment Variables**. Never commit real secrets.

## Public (safe for browser)

| Variable | Required | Description | Example |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL | `https://xxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon/public key (RLS still applies) | `eyJ...` |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Yes for checkout | Razorpay public key. Use `rzp_test_...` in test mode | `rzp_test_xxxxxxxxxxxxx` |
| `NEXT_PUBLIC_SITE_URL` | Recommended | Canonical site URL for SEO/sitemap/robots/OG | `https://your-domain.com` |

## Server-only (NEVER expose to client)

| Variable | Required | Description | Example |
|---|---|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` | Recommended | Supabase service role key for trusted server-side order/stock/admin operations. Bypasses RLS - use only in server code. | `eyJ...` |
| `RAZORPAY_KEY_ID` | Yes for checkout | Razorpay key ID for server API calls | `rzp_test_xxxxxxxxxxxxx` |
| `RAZORPAY_KEY_SECRET` | Yes for checkout | Razorpay secret for order creation/signature verification. **Secret**. | `xxxxxxxx` |

## Security Rules

- Do **not** prefix secrets with `NEXT_PUBLIC_`.
- Do **not** commit `.env.local` or real credentials.
- Use Razorpay **test** keys until the full test flow is verified; only then switch to live keys.
- `SUPABASE_SERVICE_ROLE_KEY` must only be used in server routes/actions/server modules.
- Rotate keys immediately if exposed.

## Vercel Setup

1. Import the Git repository into Vercel.
2. Add all required env vars for Production/Preview/Development as needed.
3. Build command: `npm run build` (uses `next build --webpack` in this repo; compatible with Vercel). Output: default Next.js.
4. Ensure Supabase URL/keys and Razorpay test keys are configured before testing checkout.
5. Set `NEXT_PUBLIC_SITE_URL` to the deployed domain for correct sitemap/robots/canonical URLs.
