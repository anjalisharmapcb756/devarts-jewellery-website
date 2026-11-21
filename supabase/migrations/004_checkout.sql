-- Checkout, payments, coupons, and transaction records
-- Execute after 003_seed.sql

begin;

-- Coupons
create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  description text,
  discount_type text not null check (discount_type in ('percentage', 'fixed')),
  discount_value numeric(12,2) not null check (discount_value > 0),
  min_order_inr numeric(12,2) not null default 0 check (min_order_inr >= 0),
  max_discount_inr numeric(12,2) check (max_discount_inr >= 0),
  starts_at timestamptz,
  ends_at timestamptz,
  usage_limit int check (usage_limit is null or usage_limit > 0),
  used_count int not null default 0 check (used_count >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger coupons_set_updated_at before update on public.coupons
for each row execute function public.set_updated_at();

-- Extend orders for checkout/payment tracking
alter table public.orders
  add column if not exists customer_email text,
  add column if not exists customer_phone text,
  add column if not exists shipping_address_snapshot jsonb,
  add column if not exists billing_address_snapshot jsonb,
  add column if not exists coupon_id uuid references public.coupons(id) on delete set null,
  add column if not exists coupon_code text,
  add column if not exists coupon_discount_inr numeric(12,2) not null default 0 check (coupon_discount_inr >= 0),
  add column if not exists razorpay_order_id text,
  add column if not exists razorpay_payment_id text,
  add column if not exists payment_method text,
  add column if not exists paid_at timestamptz;

create unique index if not exists orders_razorpay_order_id_uidx on public.orders(razorpay_order_id) where razorpay_order_id is not null;
create unique index if not exists orders_razorpay_payment_id_uidx on public.orders(razorpay_payment_id) where razorpay_payment_id is not null;

-- Payment transactions (audit trail / idempotency / failure records)
create table if not exists public.payment_transactions (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete set null,
  user_id uuid references auth.users(id) on delete set null,
  provider text not null default 'razorpay',
  provider_order_id text,
  provider_payment_id text,
  provider_signature text,
  amount_inr numeric(12,2) not null check (amount_inr >= 0),
  currency text not null default 'INR',
  status text not null check (status in ('created','authorized','captured','failed','cancelled','refunded','verified')),
  payment_method text,
  error_code text,
  error_description text,
  raw_payload jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists payment_transactions_order_id_idx on public.payment_transactions(order_id);
create index if not exists payment_transactions_provider_order_idx on public.payment_transactions(provider_order_id);
create index if not exists payment_transactions_provider_payment_idx on public.payment_transactions(provider_payment_id);

create trigger payment_transactions_set_updated_at before update on public.payment_transactions
for each row execute function public.set_updated_at();

-- RLS
alter table public.coupons enable row level security;
alter table public.payment_transactions enable row level security;

drop policy if exists "coupons_public_read_active" on public.coupons;
create policy "coupons_public_read_active" on public.coupons
for select using (is_active = true or public.is_admin());

drop policy if exists "coupons_admin_write" on public.coupons;
create policy "coupons_admin_write" on public.coupons
for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "payment_transactions_owner_read" on public.payment_transactions;
create policy "payment_transactions_owner_read" on public.payment_transactions
for select using (auth.uid() = user_id or public.is_admin());

drop policy if exists "payment_transactions_admin_write" on public.payment_transactions;
create policy "payment_transactions_admin_write" on public.payment_transactions
for all using (public.is_admin()) with check (public.is_admin());

-- No direct client insert/update of payment transactions; server should use service role or controlled RPC.
-- Customers can read their own via policy above.

-- Seed a test coupon
insert into public.coupons (code, description, discount_type, discount_value, min_order_inr, max_discount_inr, is_active)
values ('VARA10', '10% off on orders above ₹50,000', 'percentage', 10, 50000, 10000, true)
on conflict (code) do update set description=excluded.description, discount_type=excluded.discount_type, discount_value=excluded.discount_value, min_order_inr=excluded.min_order_inr, max_discount_inr=excluded.max_discount_inr, is_active=excluded.is_active;

commit;
