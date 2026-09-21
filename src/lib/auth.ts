import { redirect } from 'next/navigation';
import { createClient } from './supabase/server';
import type { Database } from '@/types/database';

export type UserProfile = Database['public']['Tables']['profiles']['Row'];

/**
 * Get current authenticated user session from Supabase
 */
export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  // Fetch profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single<UserProfile>();

  return {
    ...user,
    profile: profile || null,
  };
}

/**
 * Check if the currently authenticated user has the 'admin' role
 */
export async function isAdmin(): Promise<boolean> {
  const user = await getCurrentUser();
  return user?.profile?.role === 'admin';
}

/**
 * Require authentication for server components / server actions
 * Redirects to /login if unauthenticated
 */
export async function requireAuth(returnUrl?: string) {
  const user = await getCurrentUser();

  if (!user) {
    const loginUrl = returnUrl
      ? `/login?redirect=${encodeURIComponent(returnUrl)}`
      : '/login';
    redirect(loginUrl);
  }

  return user;
}

/**
 * Require admin role for server components / server actions
 * Throws or redirects to 403 if authenticated but not admin
 */
export async function requireAdmin() {
  const user = await requireAuth();

  if (user.profile?.role !== 'admin') {
    redirect('/403');
  }

  return user;
}
