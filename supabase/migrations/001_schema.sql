-- ==============================================================================
-- wefik.world — Database Migration: 001_schema.sql
-- Single-vendor digital product marketplace system of record
-- ==============================================================================

-- 1. EXTENSIONS
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";
create extension if not exists "unaccent";

-- 2. PROFILES TABLE
-- Linked to Supabase auth.users. Single vendor model: default 'customer', founder 'admin'
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  avatar_url text,
  role text not null check (role in ('customer', 'admin')) default 'customer',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. CATEGORIES TABLE
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  description text,
  created_at timestamptz not null default now()
);

-- 4. PRODUCTS TABLE
-- Currency: INR only for MVP. Prices in paise (integer).
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  tagline text not null,
  description text not null, -- Markdown content
  category_id uuid references public.categories(id) on delete set null,
  price_inr integer not null default 0, -- In paise (e.g. 199900 = ₹1,999)
  is_free boolean not null default false,
  is_featured boolean not null default false,
  is_bundle boolean not null default false,
  bundle_product_ids uuid[] default '{}',
  thumbnail_url text not null,
  gallery_urls text[] not null default '{}',
  demo_url text,
  tech_stack text[] not null default '{}',
  rating_avg numeric(3,2) not null default 0.00,
  rating_count integer not null default 0,
  download_count integer not null default 0,
  status text not null check (status in ('draft', 'published', 'archived')) default 'published',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 5. PRODUCT VERSIONS TABLE
-- Contains versioned file paths in the private product-files bucket
create table if not exists public.product_versions (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  version text not null, -- e.g. "1.0.0"
  changelog text,
  file_path text not null, -- Path inside private 'product-files' bucket
  is_latest boolean not null default true,
  created_at timestamptz not null default now()
);

-- 6. MEMBERSHIP PLANS TABLE
-- Monthly ₹999/mo (subscription) and Lifetime ₹9,999 (one-time)
create table if not exists public.membership_plans (
  id uuid primary key default gen_random_uuid(),
  plan text unique not null check (plan in ('monthly', 'lifetime')),
  name text not null,
  price_inr integer not null, -- In paise (e.g. 99900 = ₹999, 999900 = ₹9,999)
  interval text not null check (interval in ('month', 'one-time')),
  description text,
  features text[] not null default '{}',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- 7. MEMBERSHIPS TABLE
create table if not exists public.memberships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  plan text not null references public.membership_plans(plan),
  status text not null check (status in ('active', 'cancelled', 'expired')) default 'active',
  razorpay_subscription_id text, -- Used for monthly recurring subscriptions
  current_period_start timestamptz,
  current_period_end timestamptz, -- NULL for lifetime deals
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 8. ORDERS TABLE
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  razorpay_order_id text unique,
  razorpay_payment_id text,
  status text not null check (status in ('pending', 'paid', 'failed', 'refunded')) default 'pending',
  subtotal integer not null, -- In paise
  discount_amount integer not null default 0, -- In paise
  total_amount integer not null, -- In paise
  currency text not null check (currency = 'INR') default 'INR',
  coupon_code text,
  created_at timestamptz not null default now()
);

-- 9. ORDER ITEMS TABLE
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  item_type text not null check (item_type in ('product', 'membership_monthly', 'membership_lifetime')),
  price integer not null, -- In paise
  license_type text not null check (license_type in ('single', 'unlimited')) default 'single',
  created_at timestamptz not null default now()
);

-- 10. LICENSES TABLE
-- Keys format: WFK-XXXX-XXXX-XXXX
create table if not exists public.licenses (
  id uuid primary key default gen_random_uuid(),
  license_key text unique not null,
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  order_id uuid references public.orders(id) on delete set null,
  license_type text not null check (license_type in ('single', 'unlimited')) default 'single',
  status text not null check (status in ('active', 'revoked')) default 'active',
  activated_domains text[] not null default '{}',
  max_activations integer not null default 1, -- 1 for single, 9999 for unlimited
  created_at timestamptz not null default now()
);

-- 11. REVIEWS TABLE
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  review_text text,
  is_approved boolean not null default false,
  created_at timestamptz not null default now(),
  constraint unique_user_product_review unique (user_id, product_id)
);

-- 12. WISHLISTS TABLE
create table if not exists public.wishlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint unique_user_product_wishlist unique (user_id, product_id)
);

-- 13. DOWNLOADS AUDIT LOG TABLE
create table if not exists public.downloads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  version_id uuid references public.product_versions(id) on delete set null,
  ip_address text,
  user_agent text,
  downloaded_at timestamptz not null default now()
);

-- 14. COUPONS TABLE
create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  discount_percent integer not null check (discount_percent between 1 and 100),
  discount_fixed_inr integer, -- Optional fixed paise discount
  valid_from timestamptz not null default now(),
  valid_until timestamptz,
  max_uses integer,
  used_count integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- 15. NEWSLETTER SUBSCRIBERS TABLE
create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  subscribed_at timestamptz not null default now()
);

-- 16. PUSH SUBSCRIPTIONS TABLE (FCM Web Push)
create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  token text unique not null,
  user_agent text,
  created_at timestamptz not null default now()
);

-- ==============================================================================
-- 17. SECURITY & HELPER FUNCTIONS
-- ==============================================================================

-- Admin check: SECURITY DEFINER with SET search_path = public (Fix 6)
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(
    (select role = 'admin' from public.profiles where id = auth.uid()),
    false
  );
$$;

-- Increment coupon usage atomically on successful payment fulfillment
create or replace function public.increment_coupon_use(coupon_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.coupons
  set used_count = used_count + 1
  where id = coupon_id;
$$;

-- Atomic product downloads counter increment
create or replace function public.increment_product_downloads(p_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.products
  set download_count = download_count + 1
  where id = p_id;
$$;

-- ==============================================================================
-- 18. TRIGGERS
-- ==============================================================================

-- Trigger A: Auth User Created -> Insert Profile
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', null),
    coalesce(new.raw_user_meta_data->>'avatar_url', null),
    'customer'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Trigger B: Product Version Inserted -> Ensure is_latest flag consistency (Fix 12)
create or replace function public.handle_new_product_version()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.is_latest = true then
    update public.product_versions
    set is_latest = false
    where product_id = new.product_id and id <> new.id;
  end if;
  return new;
end;
$$;

drop trigger if exists on_product_version_inserted on public.product_versions;
create trigger on_product_version_inserted
  before insert on public.product_versions
  for each row execute function public.handle_new_product_version();

-- Trigger C: Review Rating Aggregation
create or replace function public.handle_review_rating()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target_product_id uuid;
begin
  target_product_id := coalesce(new.product_id, old.product_id);
  
  update public.products
  set 
    rating_avg = coalesce((
      select round(avg(rating)::numeric, 2)
      from public.reviews
      where product_id = target_product_id and is_approved = true
    ), 0.00),
    rating_count = coalesce((
      select count(*)
      from public.reviews
      where product_id = target_product_id and is_approved = true
    ), 0)
  where id = target_product_id;
  
  return coalesce(new, old);
end;
$$;

drop trigger if exists on_review_change on public.reviews;
create trigger on_review_change
  after insert or update or delete on public.reviews
  for each row execute function public.handle_review_rating();

-- ==============================================================================
-- 19. INDEXES (Fix 15)
-- ==============================================================================

-- Btree indexes
create index if not exists idx_products_slug on public.products(slug);
create index if not exists idx_products_status on public.products(status);
create index if not exists idx_products_category_id on public.products(category_id);
create index if not exists idx_product_versions_product_id on public.product_versions(product_id);
create index if not exists idx_orders_user_id on public.orders(user_id);
create index if not exists idx_orders_razorpay_order_id on public.orders(razorpay_order_id);
create index if not exists idx_order_items_order_id on public.order_items(order_id);
create index if not exists idx_licenses_user_id on public.licenses(user_id);
create index if not exists idx_licenses_license_key on public.licenses(license_key);
create index if not exists idx_licenses_product_id on public.licenses(product_id);
create index if not exists idx_memberships_user_id on public.memberships(user_id);
create index if not exists idx_reviews_product_id on public.reviews(product_id);
create index if not exists idx_downloads_user_id on public.downloads(user_id);
create index if not exists idx_coupons_code on public.coupons(code);

-- GIN Trigram index for typo-tolerant fuzzy search
create index if not exists idx_products_title_trgm on public.products using gin (title gin_trgm_ops);
create index if not exists idx_products_tagline_trgm on public.products using gin (tagline gin_trgm_ops);

-- GIN index for full-text search vector
create index if not exists idx_products_search_vector on public.products using gin (
  to_tsvector('english', title || ' ' || tagline || ' ' || description)
);

-- ==============================================================================
-- 20. VIEWS
-- ==============================================================================

-- Public view of products hiding administrative/internal fields
create or replace view public.products_public as
select
  p.id,
  p.title,
  p.slug,
  p.tagline,
  p.description,
  p.category_id,
  c.name as category_name,
  c.slug as category_slug,
  p.price_inr,
  p.is_free,
  p.is_featured,
  p.is_bundle,
  p.bundle_product_ids,
  p.thumbnail_url,
  p.gallery_urls,
  p.demo_url,
  p.tech_stack,
  p.rating_avg,
  p.rating_count,
  p.download_count,
  pv.version as latest_version,
  p.created_at,
  p.updated_at
from public.products p
left join public.categories c on p.category_id = c.id
left join public.product_versions pv on pv.product_id = p.id and pv.is_latest = true
where p.status = 'published';

-- ==============================================================================
-- 21. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_versions enable row level security;
alter table public.membership_plans enable row level security;
alter table public.memberships enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.licenses enable row level security;
alter table public.reviews enable row level security;
alter table public.wishlists enable row level security;
alter table public.downloads enable row level security;
alter table public.coupons enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.push_subscriptions enable row level security;

-- Profiles: Users can read and update their own profile; admins can read/update all
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id or public.is_admin());

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id or public.is_admin());

-- Categories: Public read, admin write
create policy "Anyone can view categories" on public.categories
  for select using (true);

create policy "Admins can manage categories" on public.categories
  for all using (public.is_admin());

-- Products: Anyone can view published products, admins can manage all
create policy "Anyone can view published products" on public.products
  for select using (status = 'published' or public.is_admin());

create policy "Admins can manage products" on public.products
  for all using (public.is_admin());

-- Product Versions: Version info is public for published products, file paths hidden by view
create policy "Anyone can view versions for published products" on public.product_versions
  for select using (
    exists (
      select 1 from public.products
      where id = product_versions.product_id and (status = 'published' or public.is_admin())
    )
  );

create policy "Admins can manage product versions" on public.product_versions
  for all using (public.is_admin());

-- Membership Plans: Public read active plans, admin manage
create policy "Anyone can view active membership plans" on public.membership_plans
  for select using (is_active = true or public.is_admin());

create policy "Admins can manage membership plans" on public.membership_plans
  for all using (public.is_admin());

-- Memberships: Users can view own memberships, admin manage
create policy "Users can view own memberships" on public.memberships
  for select using (auth.uid() = user_id or public.is_admin());

create policy "Admins can manage memberships" on public.memberships
  for all using (public.is_admin());

-- Orders: Users can view own orders, admin manage
create policy "Users can view own orders" on public.orders
  for select using (auth.uid() = user_id or public.is_admin());

create policy "Admins can manage orders" on public.orders
  for all using (public.is_admin());

-- Order Items: Users can view items for own orders
create policy "Users can view own order items" on public.order_items
  for select using (
    exists (
      select 1 from public.orders
      where id = order_items.order_id and (user_id = auth.uid() or public.is_admin())
    )
  );

create policy "Admins can manage order items" on public.order_items
  for all using (public.is_admin());

-- Licenses: Users view own licenses, admin manage
create policy "Users can view own licenses" on public.licenses
  for select using (auth.uid() = user_id or public.is_admin());

create policy "Admins can manage licenses" on public.licenses
  for all using (public.is_admin());

-- Reviews: Approved reviews are public, users view own, users insert own, admin moderate
create policy "Anyone can view approved reviews" on public.reviews
  for select using (is_approved = true or auth.uid() = user_id or public.is_admin());

create policy "Authenticated users can submit reviews" on public.reviews
  for insert with check (auth.uid() = user_id);

create policy "Users can update own reviews" on public.reviews
  for update using (auth.uid() = user_id or public.is_admin());

create policy "Admins can delete reviews" on public.reviews
  for delete using (public.is_admin());

-- Wishlists: Users manage own wishlists
create policy "Users can view own wishlist" on public.wishlists
  for select using (auth.uid() = user_id);

create policy "Users can add to own wishlist" on public.wishlists
  for insert with check (auth.uid() = user_id);

create policy "Users can remove from own wishlist" on public.wishlists
  for delete using (auth.uid() = user_id);

-- Downloads: Users view own downloads
create policy "Users can view own downloads" on public.downloads
  for select using (auth.uid() = user_id or public.is_admin());

create policy "Users can record own downloads" on public.downloads
  for insert with check (auth.uid() = user_id or public.is_admin());

-- Coupons: Public read active coupons (Fix 6: used_count is harmless and public), admin manage
create policy "Anyone can view active coupons" on public.coupons
  for select using (is_active = true or public.is_admin());

create policy "Admins can manage coupons" on public.coupons
  for all using (public.is_admin());

-- Newsletter Subscribers: Anyone can subscribe (insert), admins can view list
create policy "Anyone can subscribe to newsletter" on public.newsletter_subscribers
  for insert with check (true);

create policy "Admins can view newsletter subscribers" on public.newsletter_subscribers
  for select using (public.is_admin());

-- Push Subscriptions: Users manage own push tokens
create policy "Users can manage own push subscription" on public.push_subscriptions
  for all using (auth.uid() = user_id or public.is_admin())
  with check (auth.uid() = user_id or public.is_admin());

-- ==============================================================================
-- 22. STORAGE BUCKETS CONFIGURATION INSTRUCTIONS
-- ==============================================================================
-- Supabase Storage Buckets to create in Supabase Studio:
-- 1. 'product-images' (Public: true) — Thumbnails, screenshots, banners
-- 2. 'avatars' (Public: true) — User profile pictures
-- 3. 'product-files' (Public: false) — Private ZIP files, downloaded via Edge Function signed URLs only
