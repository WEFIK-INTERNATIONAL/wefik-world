-- ==============================================================================
-- wefik.world — 03-storage-buckets-and-policies.sql
-- ==============================================================================
-- PURPOSE:
--   Creates or updates all 3 required Supabase Storage buckets (product-images,
--   avatars, product-files) and enforces least-privilege storage.objects policies.
--
-- PRECONDITIONS:
--   02-auth-profiles-and-rls.sql applied (public.is_admin() exists).
--   Check: SELECT EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'storage');
--   -- Expected: true
--
-- WHAT IT CHANGES:
--   - Ensures 'product-images' (public = true) exists; public read, admin write.
--   - Ensures 'avatars' (public = true, 2MB limit) exists; public read, user-folder write.
--   - Ensures 'product-files' (public = false) exists; NO public read, admin-only write/read
--     (customer downloads go through download-url Edge Function signed URLs).
--
-- VERIFICATION QUERY:
--   SELECT id, public, file_size_limit FROM storage.buckets
--   WHERE id IN ('product-images', 'avatars', 'product-files') ORDER BY id;
--   -- Expected: 3 rows: avatars (true), product-files (false), product-images (true).
--
-- ROLLBACK:
--   Drop the created policies on storage.objects by name; do NOT delete buckets
--   that already contain uploaded files.
-- ==============================================================================

BEGIN;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'storage') THEN

    -- 1. product-images (public)
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES (
      'product-images',
      'product-images',
      true,
      5242880, -- 5 MB
      ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    )
    ON CONFLICT (id) DO UPDATE SET
      public = true,
      file_size_limit = 5242880,
      allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

    DROP POLICY IF EXISTS "Product images are publicly readable" ON storage.objects;
    CREATE POLICY "Product images are publicly readable" ON storage.objects
      FOR SELECT USING (bucket_id = 'product-images');

    DROP POLICY IF EXISTS "Admins can manage product images" ON storage.objects;
    CREATE POLICY "Admins can manage product images" ON storage.objects
      FOR ALL USING (bucket_id = 'product-images' AND public.is_admin())
      WITH CHECK (bucket_id = 'product-images' AND public.is_admin());

    -- 2. avatars (public, 2MB, user-folder isolation)
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES (
      'avatars',
      'avatars',
      true,
      2097152, -- 2 MB
      ARRAY['image/jpeg', 'image/png', 'image/webp']
    )
    ON CONFLICT (id) DO UPDATE SET
      public = true,
      file_size_limit = 2097152,
      allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

    DROP POLICY IF EXISTS "Avatars are publicly readable" ON storage.objects;
    CREATE POLICY "Avatars are publicly readable" ON storage.objects
      FOR SELECT USING (bucket_id = 'avatars');

    DROP POLICY IF EXISTS "Users can upload own avatar" ON storage.objects;
    CREATE POLICY "Users can upload own avatar" ON storage.objects
      FOR INSERT WITH CHECK (
        bucket_id = 'avatars'
        AND auth.role() = 'authenticated'
        AND auth.uid()::text = (storage.foldername(name))[1]
      );

    DROP POLICY IF EXISTS "Users can update own avatar" ON storage.objects;
    CREATE POLICY "Users can update own avatar" ON storage.objects
      FOR UPDATE USING (
        bucket_id = 'avatars'
        AND auth.role() = 'authenticated'
        AND auth.uid()::text = (storage.foldername(name))[1]
      );

    DROP POLICY IF EXISTS "Users can delete own avatar" ON storage.objects;
    CREATE POLICY "Users can delete own avatar" ON storage.objects
      FOR DELETE USING (
        bucket_id = 'avatars'
        AND auth.role() = 'authenticated'
        AND auth.uid()::text = (storage.foldername(name))[1]
      );

    -- 3. product-files (PRIVATE: NO public read; signed URLs via service_role only)
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('product-files', 'product-files', false)
    ON CONFLICT (id) DO UPDATE SET public = false;

    DROP POLICY IF EXISTS "Admins can manage product files" ON storage.objects;
    CREATE POLICY "Admins can manage product files" ON storage.objects
      FOR ALL USING (bucket_id = 'product-files' AND public.is_admin())
      WITH CHECK (bucket_id = 'product-files' AND public.is_admin());

  END IF;
END $$;

COMMIT;
