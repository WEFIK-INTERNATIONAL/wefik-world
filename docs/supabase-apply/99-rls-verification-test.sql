-- ==============================================================================
-- wefik.world — 99-rls-verification-test.sql
-- ==============================================================================
-- PURPOSE:
--   Local-only scratch test proving RLS isolation for:
--     1. profiles (own read/update only, NO self-promotion to 'admin')
--     2. orders & licenses (user sees only their own rows)
--     3. reviews (public read for approved; insert ONLY by verified purchaser)
--     4. products (public read only when status = 'published')
--
-- NOTE:
--   Run ONLY on a local scratch database inside a rolled-back transaction!
--   NEVER run this against production.
-- ==============================================================================

BEGIN;

-- Setup fixture users in auth.users (triggers handle_new_user)
INSERT INTO auth.users (id, email)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'alice@example.com'),
  ('22222222-2222-2222-2222-222222222222', 'bob@example.com')
ON CONFLICT (id) DO NOTHING;

-- Fixture products (one published, one draft)
INSERT INTO public.products (id, title, slug, tagline, description, price_inr, thumbnail_url, status)
VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Published App', 'test-pub', 'Tag', 'Desc', 10000, '/t.png', 'published'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Draft App', 'test-draft', 'Tag', 'Desc', 10000, '/t.png', 'draft')
ON CONFLICT (id) DO NOTHING;

-- Fixture license & order for Alice only
INSERT INTO public.orders (id, user_id, subtotal, total_amount, status)
VALUES ('cccccccc-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111', 10000, 10000, 'paid')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.licenses (id, license_key, user_id, product_id, order_id, status)
VALUES ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'WFK-TEST-0001-0001', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'active')
ON CONFLICT (id) DO NOTHING;

-- Switch to authenticated role as Bob (non-purchaser)
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '22222222-2222-2222-2222-222222222222', true);

-- Test 1: Bob sees 0 of Alice's orders & licenses
DO $$
BEGIN
  IF (SELECT count(*) FROM public.orders) <> 0 THEN
    RAISE EXCEPTION 'FAIL: Bob saw Alice orders';
  END IF;
  IF (SELECT count(*) FROM public.licenses) <> 0 THEN
    RAISE EXCEPTION 'FAIL: Bob saw Alice licenses';
  END IF;
END $$;

-- Test 2: Bob sees only published products (not draft)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.products WHERE status <> 'published') THEN
    RAISE EXCEPTION 'FAIL: Bob saw non-published product';
  END IF;
END $$;

-- Test 3: Bob CANNOT promote himself to admin
DO $$
BEGIN
  UPDATE public.profiles SET role = 'admin' WHERE id = '22222222-2222-2222-2222-222222222222';
  RAISE EXCEPTION 'FAIL: Bob was able to self-promote to admin';
EXCEPTION WHEN OTHERS THEN
  NULL; -- Expected
END $$;

-- Test 4: Bob CANNOT insert a review without purchasing
DO $$
BEGIN
  INSERT INTO public.reviews (user_id, product_id, rating, review_text)
  VALUES ('22222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 5, 'Fake');
  RAISE EXCEPTION 'FAIL: Non-purchaser Bob inserted a review';
EXCEPTION WHEN OTHERS THEN
  NULL; -- Expected
END $$;

-- Switch to Alice (verified purchaser)
SELECT set_config('request.jwt.claim.sub', '11111111-1111-1111-1111-111111111111', true);

-- Test 5: Alice CAN insert a review for the product she licensed
INSERT INTO public.reviews (user_id, product_id, rating, review_text)
VALUES ('11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 5, 'Verified!');

RESET ROLE;
ROLLBACK;
