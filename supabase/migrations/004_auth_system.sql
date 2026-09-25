-- ==============================================================================
-- wefik.world — Database Migration: 004_auth_system.sql
-- Complete Authentication, Account Profiles, Disposable Domain Blocking & RLS
-- ==============================================================================

-- 1. EXTEND PROFILES TABLE WITH ACCOUNT & RECOVERY FIELDS
alter table if exists public.profiles
  add column if not exists display_name text,
  add column if not exists recovery_email text,
  add column if not exists recovery_email_verified_at timestamptz;

-- Ensure RLS on profiles allows users to read and update only their own profile
alter table public.profiles enable row level security;

drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id or public.is_admin());

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id or public.is_admin())
  with check (auth.uid() = id or public.is_admin());

-- 2. UPDATE TRIGGER FUNCTION ON auth.users
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_full_name text;
  v_display_name text;
begin
  v_full_name := coalesce(
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'name',
    null
  );

  v_display_name := coalesce(
    new.raw_user_meta_data->>'display_name',
    new.raw_user_meta_data->>'user_name',
    v_full_name,
    split_part(new.email, '@', 1)
  );

  insert into public.profiles (
    id,
    email,
    full_name,
    display_name,
    avatar_url,
    role
  )
  values (
    new.id,
    new.email,
    v_full_name,
    v_display_name,
    coalesce(new.raw_user_meta_data->>'avatar_url', null),
    'customer'
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = coalesce(public.profiles.full_name, excluded.full_name),
    display_name = coalesce(public.profiles.display_name, excluded.display_name),
    avatar_url = coalesce(public.profiles.avatar_url, excluded.avatar_url),
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 3. BLOCKED EMAIL DOMAINS TABLE
create table if not exists public.blocked_email_domains (
  domain text primary key,
  source text not null default 'disposable-domain-list',
  added_at timestamptz not null default now()
);

alter table public.blocked_email_domains enable row level security;

-- Only service_role and admins can read/manage blocked domains directly
drop policy if exists "Admins can view blocked domains" on public.blocked_email_domains;
create policy "Admins can view blocked domains" on public.blocked_email_domains
  for select using (public.is_admin());

drop policy if exists "Admins can manage blocked domains" on public.blocked_email_domains;
create policy "Admins can manage blocked domains" on public.blocked_email_domains
  for all using (public.is_admin());

-- 4. RPC: check_email_registered (SECURITY DEFINER for service_role only)
-- Powers the email-first login screen
create or replace function public.check_email_registered(p_email text)
returns table (
  registered boolean,
  confirmed boolean,
  has_password boolean,
  oauth_providers text[]
)
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_user_id uuid;
  v_confirmed_at timestamptz;
  v_encrypted_pw text;
  v_providers text[];
begin
  select u.id, u.email_confirmed_at, u.encrypted_password
  into v_user_id, v_confirmed_at, v_encrypted_pw
  from auth.users u
  where lower(u.email) = lower(trim(p_email))
  limit 1;

  if v_user_id is null then
    return query select false, false, false, array[]::text[];
    return;
  end if;

  select coalesce(array_agg(distinct i.provider) filter (where i.provider is not null and i.provider <> 'email'), array[]::text[])
  into v_providers
  from auth.identities i
  where i.user_id = v_user_id;

  return query select
    true,
    (v_confirmed_at is not null),
    (v_encrypted_pw is not null and length(v_encrypted_pw) > 0),
    coalesce(v_providers, array[]::text[]);
end;
$$;

revoke all on function public.check_email_registered(text) from public, anon, authenticated;
grant execute on function public.check_email_registered(text) to service_role;

-- 5. STORAGE BUCKET: avatars
-- Public bucket with 2MB file size limit and strict user-folder isolation
do $$
begin
  if exists (select 1 from information_schema.schemata where schema_name = 'storage') then
    insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    values ('avatars', 'avatars', true, 2097152, array['image/jpeg', 'image/png', 'image/webp'])
    on conflict (id) do update set
      public = true,
      file_size_limit = 2097152,
      allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp'];

    -- Storage policies: authenticated users can only insert/update/delete under their own folder <auth.uid()>/...
    drop policy if exists "Users can upload own avatar" on storage.objects;
    create policy "Users can upload own avatar" on storage.objects
      for insert with check (
        bucket_id = 'avatars'
        and auth.role() = 'authenticated'
        and auth.uid()::text = (storage.foldername(name))[1]
      );

    drop policy if exists "Users can update own avatar" on storage.objects;
    create policy "Users can update own avatar" on storage.objects
      for update using (
        bucket_id = 'avatars'
        and auth.role() = 'authenticated'
        and auth.uid()::text = (storage.foldername(name))[1]
      );

    drop policy if exists "Users can delete own avatar" on storage.objects;
    create policy "Users can delete own avatar" on storage.objects
      for delete using (
        bucket_id = 'avatars'
        and auth.role() = 'authenticated'
        and auth.uid()::text = (storage.foldername(name))[1]
      );

    drop policy if exists "Avatars are publicly readable" on storage.objects;
    create policy "Avatars are publicly readable" on storage.objects
      for select using (bucket_id = 'avatars');
  end if;
end $$;
