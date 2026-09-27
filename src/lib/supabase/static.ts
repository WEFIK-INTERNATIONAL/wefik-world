import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

/**
 * Public, cookie-free Supabase client for build-time static generation (SSG)
 * and Incremental Static Regeneration (ISR).
 *
 * CRITICAL PERFORMANCE GUARANTEE:
 * Does NOT call next/headers `cookies()`. This allows marketing pages,
 * catalog listings, sitemaps, and pricing to be prerendered as static HTML
 * and cached at the Vercel Edge CDN with X-Vercel-Cache: HIT.
 */
export function createStaticClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-project.supabase.co';
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder';

  return createSupabaseClient<Database>(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
