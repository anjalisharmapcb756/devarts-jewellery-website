-- Row Level Security policies for Vara
-- Execute after 001_schema.sql

begin;

-- Helper: is current user an admin?
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated, service_role;

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.gemstones enable row level security;
alter table public.metal_variants enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.product_customization_options enable row level security;
alter table public.wishlist enable row level security;
alter table public.carts enable row level security;
alter table public.cart_items enable row level security;
alter table public.customer_addresses enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.reviews enable row level security;

-- PROFILES
drop policy if exists "profiles_select_own_or_admin" on public.profiles;
create policy "profiles_select_own_or_admin" on public.profiles
for select using (auth.uid() = id or public.is_admin());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
for update using (auth.uid() = id or public.is_admin())
with check (auth.uid() = id or public.is_admin());

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
for insert with check (
  (auth.uid() = id and coalesce(role, 'customer') = 'customer')
  or (public.is_admin() and role = 'customer')
);

-- Prevent customers from escalating role via normal client updates.
-- Admins should change roles using service role / SQL editor only.
revoke update (role) on public.profiles from authenticated;
grant update (role) on public.profiles to service_role;

-- PUBLIC CATALOG READ (active rows only), admin full access
-- Categories
drop policy if exists "categories_public_read" on public.categories;
create policy "categories_public_read" on public.categories
for select using (is_active = true or public.is_admin());
drop policy if exists "categories_admin_write" on public.categories;
create policy "categories_admin_write" on public.categories
for all using (public.is_admin()) with check (public.is_admin());

-- Gemstones
drop policy if exists "gemstones_public_read" on public.gemstones;
create policy "gemstones_public_read" on public.gemstones
for select using (is_active = true or public.is_admin());
drop policy if exists "gemstones_admin_write" on public.gemstones;
create policy "gemstones_admin_write" on public.gemstones
for all using (public.is_admin()) with check (public.is_admin());

-- Metal variants
drop policy if exists "metal_variants_public_read" on public.metal_variants;
create policy "metal_variants_public_read" on public.metal_variants
for select using (is_active = true or public.is_admin());
drop policy if exists "metal_variants_admin_write" on public.metal_variants;
create policy "metal_variants_admin_write" on public.metal_variants
for all using (public.is_admin()) with check (public.is_admin());

-- Products
drop policy if exists "products_public_read" on public.products;
create policy "products_public_read" on public.products
for select using (is_active = true or public.is_admin());
drop policy if exists "products_admin_write" on public.products;
create policy "products_admin_write" on public.products
for all using (public.is_admin()) with check (public.is_admin());

-- Product images
drop policy if exists "product_images_public_read" on public.product_images;
create policy "product_images_public_read" on public.product_images
for select using (
  exists (select 1 from public.products pr where pr.id = product_id and (pr.is_active = true or public.is_admin()))
);
drop policy if exists "product_images_admin_write" on public.product_images;
create policy "product_images_admin_write" on public.product_images
for all using (public.is_admin()) with check (public.is_admin());

-- Product customization options
drop policy if exists "product_customization_public_read" on public.product_customization_options;
create policy "product_customization_public_read" on public.product_customization_options
for select using (
  is_active = true and exists (select 1 from public.products pr where pr.id = product_id and (pr.is_active = true or public.is_admin()))
  or public.is_admin()
);
drop policy if exists "product_customization_admin_write" on public.product_customization_options;
create policy "product_customization_admin_write" on public.product_customization_options
for all using (public.is_admin()) with check (public.is_admin());

-- WISHLIST (owner only)
drop policy if exists "wishlist_owner_select" on public.wishlist;
create policy "wishlist_owner_select" on public.wishlist
for select using (auth.uid() = user_id or public.is_admin());
drop policy if exists "wishlist_owner_insert" on public.wishlist;
create policy "wishlist_owner_insert" on public.wishlist
for insert with check (auth.uid() = user_id or public.is_admin());
drop policy if exists "wishlist_owner_delete" on public.wishlist;
create policy "wishlist_owner_delete" on public.wishlist
for delete using (auth.uid() = user_id or public.is_admin());

-- CARTS (owner only)
drop policy if exists "carts_owner_select" on public.carts;
create policy "carts_owner_select" on public.carts
for select using (auth.uid() = user_id or public.is_admin());
drop policy if exists "carts_owner_insert" on public.carts;
create policy "carts_owner_insert" on public.carts
for insert with check (auth.uid() = user_id or public.is_admin());
drop policy if exists "carts_owner_update" on public.carts;
create policy "carts_owner_update" on public.carts
for update using (auth.uid() = user_id or public.is_admin())
with check (auth.uid() = user_id or public.is_admin());
drop policy if exists "carts_owner_delete" on public.carts;
create policy "carts_owner_delete" on public.carts
for delete using (auth.uid() = user_id or public.is_admin());

-- CART ITEMS (owner via cart)
drop policy if exists "cart_items_owner_select" on public.cart_items;
create policy "cart_items_owner_select" on public.cart_items
for select using (
  exists (select 1 from public.carts c where c.id = cart_id and (c.user_id = auth.uid() or public.is_admin()))
);
drop policy if exists "cart_items_owner_insert" on public.cart_items;
create policy "cart_items_owner_insert" on public.cart_items
for insert with check (
  exists (select 1 from public.carts c where c.id = cart_id and (c.user_id = auth.uid() or public.is_admin()))
);
drop policy if exists "cart_items_owner_update" on public.cart_items;
create policy "cart_items_owner_update" on public.cart_items
for update using (
  exists (select 1 from public.carts c where c.id = cart_id and (c.user_id = auth.uid() or public.is_admin()))
)
with check (
  exists (select 1 from public.carts c where c.id = cart_id and (c.user_id = auth.uid() or public.is_admin()))
);
drop policy if exists "cart_items_owner_delete" on public.cart_items;
create policy "cart_items_owner_delete" on public.cart_items
for delete using (
  exists (select 1 from public.carts c where c.id = cart_id and (c.user_id = auth.uid() or public.is_admin()))
);

-- CUSTOMER ADDRESSES (owner only)
drop policy if exists "addresses_owner_select" on public.customer_addresses;
create policy "addresses_owner_select" on public.customer_addresses
for select using (auth.uid() = user_id or public.is_admin());
drop policy if exists "addresses_owner_insert" on public.customer_addresses;
create policy "addresses_owner_insert" on public.customer_addresses
for insert with check (auth.uid() = user_id or public.is_admin());
drop policy if exists "addresses_owner_update" on public.customer_addresses;
create policy "addresses_owner_update" on public.customer_addresses
for update using (auth.uid() = user_id or public.is_admin())
with check (auth.uid() = user_id or public.is_admin());
drop policy if exists "addresses_owner_delete" on public.customer_addresses;
create policy "addresses_owner_delete" on public.customer_addresses
for delete using (auth.uid() = user_id or public.is_admin());

-- ORDERS (owner read, owner create for initial frontend; admin full)
drop policy if exists "orders_owner_select" on public.orders;
create policy "orders_owner_select" on public.orders
for select using (auth.uid() = user_id or public.is_admin());
drop policy if exists "orders_owner_insert" on public.orders;
create policy "orders_owner_insert" on public.orders
for insert with check (auth.uid() = user_id or public.is_admin());
drop policy if exists "orders_admin_update" on public.orders;
create policy "orders_admin_update" on public.orders
for update using (public.is_admin()) with check (public.is_admin());
drop policy if exists "orders_admin_delete" on public.orders;
create policy "orders_admin_delete" on public.orders
for delete using (public.is_admin());

-- ORDER ITEMS (owner read via order; owner insert with own order; admin full)
drop policy if exists "order_items_owner_select" on public.order_items;
create policy "order_items_owner_select" on public.order_items
for select using (
  exists (select 1 from public.orders o where o.id = order_id and (o.user_id = auth.uid() or public.is_admin()))
);
drop policy if exists "order_items_owner_insert" on public.order_items;
create policy "order_items_owner_insert" on public.order_items
for insert with check (
  exists (select 1 from public.orders o where o.id = order_id and (o.user_id = auth.uid() or public.is_admin()))
);
drop policy if exists "order_items_admin_write" on public.order_items;
create policy "order_items_admin_write" on public.order_items
for update using (public.is_admin()) with check (public.is_admin());
drop policy if exists "order_items_admin_delete" on public.order_items;
create policy "order_items_admin_delete" on public.order_items
for delete using (public.is_admin());

-- REVIEWS
drop policy if exists "reviews_public_read" on public.reviews;
create policy "reviews_public_read" on public.reviews
for select using (is_approved = true or auth.uid() = user_id or public.is_admin());
drop policy if exists "reviews_owner_insert" on public.reviews;
create policy "reviews_owner_insert" on public.reviews
for insert with check (auth.uid() = user_id);
drop policy if exists "reviews_owner_update" on public.reviews;
create policy "reviews_owner_update" on public.reviews
for update using (auth.uid() = user_id or public.is_admin())
with check (auth.uid() = user_id or public.is_admin());
drop policy if exists "reviews_owner_delete" on public.reviews;
create policy "reviews_owner_delete" on public.reviews
for delete using (auth.uid() = user_id or public.is_admin());

-- Owners must not be able to approve their own reviews.
revoke update (is_approved) on public.reviews from authenticated;
grant update (is_approved) on public.reviews to service_role;

-- Database-side guards for fields that must never be client-controlled.
create or replace function public.enforce_profile_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if current_setting('request.jwt.claim.role', true) is distinct from 'service_role' then
    if tg_op = 'INSERT' and coalesce(new.role, 'customer') <> 'customer' then
      raise exception 'Role assignment requires service role';
    end if;
    if tg_op = 'UPDATE' and new.role is distinct from old.role then
      raise exception 'Role changes require service role';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists enforce_profile_role on public.profiles;
create trigger enforce_profile_role
before insert or update on public.profiles
for each row execute function public.enforce_profile_role();

create or replace function public.enforce_order_status()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT'
    and current_setting('request.jwt.claim.role', true) is distinct from 'service_role'
    and (coalesce(new.status, 'pending') <> 'pending' or coalesce(new.payment_status, 'pending') <> 'pending') then
    raise exception 'Orders must start in pending status';
  end if;
  return new;
end;
$$;

drop trigger if exists enforce_order_status on public.orders;
create trigger enforce_order_status
before insert on public.orders
for each row execute function public.enforce_order_status();

create or replace function public.enforce_review_approval()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if current_setting('request.jwt.claim.role', true) is distinct from 'service_role'
    and (tg_op = 'INSERT' and coalesce(new.is_approved, false) is true
      or tg_op = 'UPDATE' and new.is_approved is distinct from old.is_approved) then
    raise exception 'Review approval requires service role';
  end if;
  return new;
end;
$$;

drop trigger if exists enforce_review_approval on public.reviews;
create trigger enforce_review_approval
before insert or update on public.reviews
for each row execute function public.enforce_review_approval();

revoke all on function public.enforce_profile_role() from public;
revoke all on function public.enforce_order_status() from public;
revoke all on function public.enforce_review_approval() from public;

commit;
