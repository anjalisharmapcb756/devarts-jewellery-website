# Vara Supabase Backend Integration

This project uses Supabase for authentication and database-driven catalogue/account data. Frontend code falls back to local mock product data when Supabase env vars are not configured, preserving local development and existing UI functionality.

## Environment Variables

Create `.env.local` (never commit real secrets):

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Only the public anon key is used in frontend/server app code. Do **not** expose the Supabase service role key in client code.

## SQL Migrations

Migration files are in `supabase/migrations/`:

1. `001_schema.sql` - schema, enums, tables, FKs, indexes, triggers, stock helper, review stats trigger.
2. `002_rls.sql` - Row Level Security, admin helper, policies, role-escalation guard.
3. `003_seed.sql` - seed categories, gemstones, metal variants, 24 products, images, customization options.

## How to Execute in Supabase

### Option A: Supabase SQL Editor (recommended for quick setup)
1. Create/open a Supabase project.
2. Go to **SQL Editor**.
3. Run `supabase/migrations/001_schema.sql`.
4. Run `supabase/migrations/002_rls.sql`.
5. Run `supabase/migrations/003_seed.sql`.
6. Verify tables in **Table Editor** and policies in **Authentication > Policies** / table RLS.

### Option B: Supabase CLI
1. Install and login: `npm i -g supabase` and `supabase login`.
2. Link project: `supabase link --project-ref <your-project-ref>`.
3. Push migrations: `supabase db push` (if using Supabase CLI migration workflow), or run SQL files manually through `supabase db query`.
4. For local dev: `supabase start` then apply SQL files against local DB.

> If you use the CLI migration history system, place these files in the CLI-managed migrations format/timestamps as needed.

## Database Schema

### Core tables
- **profiles** - customer profile extending `auth.users` (id FK to `auth.users`, role `customer/admin`, name, phone). Auto-created on signup via trigger.
- **categories** - product categories (Rings, Earrings, etc.).
- **products** - catalogue products; FK to categories, default gemstone, default metal; includes pricing, stock, specs, badge, rating.
- **product_images** - product gallery/primary/hover images; FK to products.
- **gemstones** - master gemstone options.
- **metal_variants** - master metal options.
- **product_customization_options** - per-product customization options (metal/gemstone/gemstone_size/ring_size) with price deltas.
- **wishlist** - user-product wishlist, unique per user+product.
- **carts / cart_items** - user cart and configured cart line items with selection snapshot.
- **customer_addresses** - saved customer addresses.
- **orders / order_items** - order header and line-item snapshots (price/name/image/selection captured at purchase time).
- **reviews** - product reviews, one per user per product.

### Relationships
- `profiles.id -> auth.users.id`
- `products.category_id -> categories.id`
- `products.default_gemstone_id -> gemstones.id`
- `products.default_metal_id -> metal_variants.id`
- `product_images.product_id -> products.id`
- `product_customization_options.product_id -> products.id`
- `product_customization_options.metal_variant_id -> metal_variants.id`
- `product_customization_options.gemstone_id -> gemstones.id`
- `wishlist.user_id -> auth.users.id`, `wishlist.product_id -> products.id`
- `carts.user_id -> auth.users.id`
- `cart_items.cart_id -> carts.id`, `cart_items.product_id -> products.id`
- `customer_addresses.user_id -> auth.users.id`
- `orders.user_id -> auth.users.id`, `orders.address_id -> customer_addresses.id`
- `order_items.order_id -> orders.id`, `order_items.product_id -> products.id` (nullable SET NULL for history)
- `reviews.product_id -> products.id`, `reviews.user_id -> auth.users.id`

## Row Level Security (RLS)

RLS is enabled on all public tables. Policies:

- **Public catalog read**: active categories/gemstones/metal variants/products/images/customization options/reviews are readable by anyone.
- **Customer-owned data**: profiles, wishlist, carts/cart_items, customer_addresses, orders/order_items (read/insert own) restricted to `auth.uid() = user_id`.
- **Reviews**: public can read approved reviews; authenticated users can insert/update/delete own reviews.
- **Admin**: `public.is_admin()` grants admin full access on catalog and management tables; admins can read/update all records where policies allow.
- **Role escalation guard**: authenticated users cannot update `profiles.role`; role updates should be done by service role/SQL admin.

### Make a user admin
Run in SQL Editor (service/admin context):

```sql
update public.profiles set role = 'admin' where email = 'admin@example.com';
```

## Stock Management

- `products.stock_quantity` tracks available units.
- `products.is_in_stock` is a generated column (`stock_quantity > 0`).
- `public.decrement_product_stock(product_id, quantity)` is a `SECURITY DEFINER` helper that atomically decrements stock and raises if insufficient.
- In production, call stock decrement/order creation from a trusted server action/route using service role or a controlled SQL function transaction.

## Frontend Integration

- `lib/data/products-db.ts` fetches products from Supabase when configured; falls back to `lib/data/products.ts` mock data.
- Home, catalogue, category, and product detail pages use async DB fetch.
- Cart/wishlist UI receives DB/fetched products and keeps existing localStorage behavior for guest cart/wishlist.
- Existing pricing/customization UI is preserved by mapping DB customization options to the current `Product` type.

## Notes

- No production credentials are included.
- Seed image URLs use existing local `/images/references/*` assets.
- For production order/payment flows, create orders and decrement stock server-side in a transaction (service role) rather than trusting client writes.