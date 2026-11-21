-- Vara jewellery e-commerce schema
-- Execute in Supabase SQL Editor or via Supabase CLI.
-- Prerequisites: Supabase project with Auth enabled (auth.users exists).

begin;

-- Extensions
create extension if not exists pgcrypto;

-- Enums
do $$ begin
  create type public.user_role as enum ('customer', 'admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.order_status as enum ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.payment_status as enum ('pending', 'paid', 'failed', 'refunded');
exception when duplicate_object then null; end $$;

-- Updated-at trigger helper
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- 1) Customer profiles (extends Supabase auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  full_name text,
  phone text,
  role public.user_role not null default 'customer',
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    'customer'
  )
  on conflict (id) do update
    set email = excluded.email,
        full_name = coalesce(nullif(excluded.full_name, ''), public.profiles.full_name),
        updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- 2) Categories
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  image_url text,
  display_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger categories_set_updated_at
before update on public.categories
for each row execute function public.set_updated_at();

-- 3) Gemstones (master)
create table if not exists public.gemstones (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null unique,
  color_hex text,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger gemstones_set_updated_at
before update on public.gemstones
for each row execute function public.set_updated_at();

-- 4) Metal variants (master)
create table if not exists public.metal_variants (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null unique,
  purity text,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger metal_variants_set_updated_at
before update on public.metal_variants
for each row execute function public.set_updated_at();

-- 5) Products
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text not null default '',
  details text,
  category_id uuid not null references public.categories(id) on delete restrict,
  default_gemstone_id uuid references public.gemstones(id) on delete set null,
  default_metal_id uuid references public.metal_variants(id) on delete set null,
  occasion text,
  price_inr numeric(12,2) not null check (price_inr >= 0),
  original_price_inr numeric(12,2) check (original_price_inr >= 0),
  currency text not null default 'INR',
  sku text unique,
  stock_quantity int not null default 0 check (stock_quantity >= 0),
  is_in_stock boolean generated always as (stock_quantity > 0) stored,
  badge text,
  rating numeric(2,1) not null default 0 check (rating >= 0 and rating <= 5),
  review_count int not null default 0 check (review_count >= 0),
  metal_purity text,
  metal_weight text,
  gemstone_weight text,
  gemstone_quality text,
  setting text,
  certification text,
  shipping_info text,
  return_policy text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_category_id_idx on public.products(category_id);
create index if not exists products_slug_idx on public.products(slug);
create index if not exists products_active_idx on public.products(is_active);

create trigger products_set_updated_at
before update on public.products
for each row execute function public.set_updated_at();

-- 6) Product images
create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  url text not null,
  alt_text text,
  sort_order int not null default 0,
  is_primary boolean not null default false,
  is_hover boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists product_images_product_id_idx on public.product_images(product_id);
create unique index if not exists product_images_unique_idx on public.product_images(product_id, url, sort_order);

-- 7) Product customization options
-- Supports metal, gemstone, gemstone size, ring size options with price deltas.
create table if not exists public.product_customization_options (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  option_type text not null check (option_type in ('metal', 'gemstone', 'gemstone_size', 'ring_size')),
  label text not null,
  value_key text not null, -- stable key, e.g. yellow-gold, diamond, 1.00-ct, US-7
  metal_variant_id uuid references public.metal_variants(id) on delete set null,
  gemstone_id uuid references public.gemstones(id) on delete set null,
  price_delta_inr numeric(12,2) not null default 0,
  sort_order int not null default 0,
  is_default boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (product_id, option_type, value_key)
);

create index if not exists product_customization_product_idx on public.product_customization_options(product_id);
create index if not exists product_customization_type_idx on public.product_customization_options(product_id, option_type);

create trigger product_customization_set_updated_at
before update on public.product_customization_options
for each row execute function public.set_updated_at();

-- 8) Wishlist
create table if not exists public.wishlist (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);

create index if not exists wishlist_user_id_idx on public.wishlist(user_id);

-- 9) Cart (one active cart per user; guests can be handled client-side initially)
create table if not exists public.carts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  currency text not null default 'INR',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger carts_set_updated_at
before update on public.carts
for each row execute function public.set_updated_at();

create table if not exists public.cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references public.carts(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  quantity int not null default 1 check (quantity > 0),
  unit_price_inr numeric(12,2) not null check (unit_price_inr >= 0),
  -- Selected customization snapshot
  metal text,
  gemstone text,
  gemstone_size text,
  ring_size text,
  selection_key text not null, -- stable dedupe key for same config
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (cart_id, selection_key)
);

create index if not exists cart_items_cart_id_idx on public.cart_items(cart_id);
create index if not exists cart_items_product_id_idx on public.cart_items(product_id);

create trigger cart_items_set_updated_at
before update on public.cart_items
for each row execute function public.set_updated_at();

-- 10) Customer addresses
create table if not exists public.customer_addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  label text not null default 'Home',
  full_name text not null,
  phone text not null,
  line1 text not null,
  line2 text,
  city text not null,
  state text not null,
  postal_code text not null,
  country text not null default 'India',
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists customer_addresses_user_id_idx on public.customer_addresses(user_id);

create trigger customer_addresses_set_updated_at
before update on public.customer_addresses
for each row execute function public.set_updated_at();

-- 11) Orders
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete restrict,
  address_id uuid references public.customer_addresses(id) on delete set null,
  order_number text not null unique,
  status public.order_status not null default 'pending',
  payment_status public.payment_status not null default 'pending',
  currency text not null default 'INR',
  subtotal_inr numeric(12,2) not null default 0 check (subtotal_inr >= 0),
  discount_inr numeric(12,2) not null default 0 check (discount_inr >= 0),
  shipping_inr numeric(12,2) not null default 0 check (shipping_inr >= 0),
  total_inr numeric(12,2) not null default 0 check (total_inr >= 0),
  notes text,
  placed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orders_user_id_idx on public.orders(user_id);
create index if not exists orders_status_idx on public.orders(status);

create trigger orders_set_updated_at
before update on public.orders
for each row execute function public.set_updated_at();

-- 12) Order items
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  product_slug text,
  product_image_url text,
  quantity int not null check (quantity > 0),
  unit_price_inr numeric(12,2) not null check (unit_price_inr >= 0),
  line_total_inr numeric(12,2) not null check (line_total_inr >= 0),
  metal text,
  gemstone text,
  gemstone_size text,
  ring_size text,
  created_at timestamptz not null default now()
);

create index if not exists order_items_order_id_idx on public.order_items(order_id);

-- 13) Reviews
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  rating int not null check (rating >= 1 and rating <= 5),
  title text,
  content text not null,
  is_verified_purchase boolean not null default false,
  is_approved boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (product_id, user_id)
);

create index if not exists reviews_product_id_idx on public.reviews(product_id);
create index if not exists reviews_user_id_idx on public.reviews(user_id);

create trigger reviews_set_updated_at
before update on public.reviews
for each row execute function public.set_updated_at();

-- Stock management helper: decrement stock when order is placed (call from trusted server/service role).
create or replace function public.decrement_product_stock(p_product_id uuid, p_quantity int)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_quantity <= 0 then
    raise exception 'Quantity must be positive';
  end if;

  update public.products
  set stock_quantity = stock_quantity - p_quantity,
      updated_at = now()
  where id = p_product_id
    and stock_quantity >= p_quantity;

  if not found then
    raise exception 'Insufficient stock for product %', p_product_id;
  end if;
end;
$$;

-- Keep product rating/review_count in sync
create or replace function public.refresh_product_review_stats()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target_product uuid;
begin
  target_product := coalesce(new.product_id, old.product_id);
  update public.products p
  set rating = coalesce(stats.avg_rating, 0),
      review_count = coalesce(stats.cnt, 0),
      updated_at = now()
  from (
    select avg(rating)::numeric(2,1) as avg_rating, count(*)::int as cnt
    from public.reviews
    where product_id = target_product and is_approved = true
  ) stats
  where p.id = target_product;
  return coalesce(new, old);
end;
$$;

drop trigger if exists reviews_refresh_stats on public.reviews;
create trigger reviews_refresh_stats
after insert or update or delete on public.reviews
for each row execute function public.refresh_product_review_stats();

commit;
