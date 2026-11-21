# Checkout & Razorpay Setup (Vara)

## Environment Variables

Add to `.env.local` (never commit real secrets):

```env
# Supabase (public)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Supabase server-only (optional but recommended for trusted order/stock writes)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Razorpay (test mode first)
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_test_secret
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
```

- `RAZORPAY_KEY_SECRET` and `SUPABASE_SERVICE_ROLE_KEY` are **server-only**. Never expose them in client code or `NEXT_PUBLIC_*` vars.
- `NEXT_PUBLIC_RAZORPAY_KEY_ID` is the public key used by Razorpay Checkout.

## Database Migrations

Run in Supabase SQL Editor in order (after existing migrations):

1. `supabase/migrations/001_schema.sql`
2. `supabase/migrations/002_rls.sql`
3. `supabase/migrations/003_seed.sql`
4. `supabase/migrations/004_checkout.sql`

`004_checkout.sql` adds coupons, order payment/contact/address snapshot fields, and `payment_transactions`.

## Razorpay Setup

1. Create a Razorpay account and stay in **Test Mode** until fully verified.
2. Generate Test API keys from Razorpay Dashboard.
3. Set `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `NEXT_PUBLIC_RAZORPAY_KEY_ID` in `.env.local`.
4. Restart dev server after env changes.
5. Use Razorpay test payment methods/cards in test mode only.

## Checkout Flow (Implemented)

1. Client sends cart items/selections + contact/address/coupon to server.
2. Server recalculates totals from DB/mock product data (`lib/checkout/server.ts`) - **never trusts browser prices**.
3. Server validates coupon and stock.
4. Server creates Razorpay order via Razorpay API and creates a pending DB order + `payment_transactions` record (`/api/checkout/create-razorpay-order`).
5. Client opens Razorpay Checkout.
6. On success, server verifies HMAC signature and verifies payment with Razorpay API, checks amount/order match, validates stock again, marks order paid/confirmed, decrements stock, records verified transaction (`/api/checkout/verify-payment`).
7. Failed/cancelled payments are recorded via `/api/checkout/payment-failed`.

## Security Notes

- Secret keys are server-only env vars.
- Prices/totals are recalculated server-side.
- Stock is validated before payment order creation and again before finalizing.
- Razorpay signature is verified server-side; payment is also fetched from Razorpay API for amount/status confirmation.
- Orders get unique `order_number`; `razorpay_order_id`/`razorpay_payment_id` have unique DB indexes for idempotency.
- DB order is created as pending and only confirmed/paid after verified payment.

## Before Going Live

- Verify complete test flow: successful payment, failed payment, cancelled payment, stock validation, coupon, duplicate payment/idempotency.
- Configure Razorpay live keys only after test verification.
- Use HTTPS and secure deployment env var management.
- Consider moving order creation/stock decrement into a strict DB transaction/RPC for high concurrency production use.