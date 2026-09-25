import React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { LibraryView, LibraryItem } from '@/components/account/library-view';

export const revalidate = 0; // Dynamic user library

export default async function AccountLibraryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?next=/account/library');
  }

  // Fetch licenses with product relations
  const { data: licenses } = await (supabase as any)
    .from('licenses')
    .select(`
      id,
      license_key,
      license_type,
      created_at,
      product:products (
        id,
        title,
        slug,
        tagline,
        thumbnail_url
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  // Fetch latest version for products
  const productIds = licenses?.map((l: any) => l.product?.id).filter(Boolean) || [];
  let versionMap: { [productId: string]: { version: string; changelog: string | null } } = {};

  if (productIds.length > 0) {
    const { data: versions } = await (supabase as any)
      .from('product_versions')
      .select('product_id, version, changelog')
      .in('product_id', productIds)
      .eq('is_latest', true);

    if (versions) {
      for (const v of versions) {
        versionMap[v.product_id] = { version: v.version, changelog: v.changelog };
      }
    }
  }

  const items: LibraryItem[] = (licenses || [])
    .filter((l: any) => l.product)
    .map((l: any) => ({
      licenseId: l.id,
      licenseKey: l.license_key,
      licenseType: l.license_type,
      productId: l.product.id,
      productTitle: l.product.title,
      productSlug: l.product.slug,
      productTagline: l.product.tagline,
      productThumbnail: l.product.thumbnail_url,
      version: versionMap[l.product.id]?.version || '1.0.0',
      changelog: versionMap[l.product.id]?.changelog || null,
      createdAt: l.created_at,
    }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold font-display text-[var(--text)]">My Library &amp; Licenses</h2>
        <p className="text-xs sm:text-sm text-slate mt-0.5">
          Access your digital product files, changelogs, and commercial license keys.
        </p>
      </div>

      <LibraryView items={items} />
    </div>
  );
}
