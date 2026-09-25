import React from 'react';
import { requireAuth } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { DownloadList } from '@/components/dashboard/download-list';
import { Download } from 'lucide-react';
import { FALLBACK_PRODUCTS } from '@/lib/data/products';

export const metadata = {
  title: 'My Downloads — wefik.world',
};

export default async function DownloadsPage() {
  const user = await requireAuth('/dashboard/downloads');
  const supabase = await createClient();

  // Check if user has an active membership (monthly or lifetime)
  const { data: membership } = await supabase
    .from('memberships')
    .select('plan, status, current_period_end')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .maybeSingle<any>();

  const isMember =
    membership &&
    (membership.plan === 'lifetime' ||
      (membership.current_period_end && new Date(membership.current_period_end) > new Date()));

  let downloadableProducts: any[] = [];

  if (isMember) {
    // Member has access to all published products!
    const { data: allProds } = await supabase
      .from('products')
      .select('id, title, slug, thumbnail_url, versions:product_versions(version)')
      .eq('status', 'published');

    if (allProds && allProds.length > 0) {
      downloadableProducts = allProds.map((p: any) => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        thumbnail_url: p.thumbnail_url,
        version: p.versions?.[0]?.version || 'v1.0.0',
        license_type: 'All-Access Member',
      }));
    } else {
      downloadableProducts = FALLBACK_PRODUCTS.map((p) => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        thumbnail_url: p.thumbnail_url,
        version: 'v1.0.0',
        license_type: 'All-Access Member',
      }));
    }
  } else {
    // Normal user: fetch licensed products
    const { data: licenses } = await supabase
      .from('licenses')
      .select(`
        id,
        product_id,
        license_type,
        product:products(id, title, slug, thumbnail_url, versions:product_versions(version))
      `)
      .eq('user_id', user.id)
      .eq('status', 'active');

    downloadableProducts = (licenses || []).map((l: any) => ({
      id: l.product?.id || l.product_id,
      title: l.product?.title || 'Product',
      slug: l.product?.slug || '',
      thumbnail_url: l.product?.thumbnail_url || '',
      version: l.product?.versions?.[0]?.version || 'v1.0.0',
      license_type: l.license_type,
    }));
  }

  return (
    <div className="bg-[var(--surface)] p-6 sm:p-8 rounded-3xl border border-border shadow-xs space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <div>
          <h1 className="text-xl font-black text-ink tracking-tight flex items-center gap-2">
            <Download className="w-5 h-5 text-deep-green" />
            <span>My Product Downloads</span>
          </h1>
          <p className="text-xs text-slate mt-1">
            {isMember
              ? 'All-Access Pass Active: You can download every product and version in our catalog.'
              : 'Download production ZIP packages and child themes for your licensed products.'}
          </p>
        </div>
      </div>

      <DownloadList products={downloadableProducts} />
    </div>
  );
}
