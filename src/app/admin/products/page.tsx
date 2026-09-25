import React from 'react';
import { requireAdmin } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { ProductAdminManager } from '@/components/admin/product-admin-manager';
import { Package } from 'lucide-react';
import { FALLBACK_PRODUCTS } from '@/lib/data/products';

export const metadata = {
  title: 'Products & Version Uploads — Admin',
};

interface DbProductItem {
  id: string;
  title: string;
  slug: string;
  price_inr: number;
  is_free: boolean;
  status: string | null;
  thumbnail_url: string | null;
  versions?: { version: string; is_latest: boolean }[] | null;
}

export default async function AdminProductsPage() {
  await requireAdmin();
  const supabase = await createClient();

  const { data: dbProducts } = await supabase
    .from('products')
    .select(`
      id,
      title,
      slug,
      price_inr,
      is_free,
      status,
      thumbnail_url,
      versions:product_versions(version, is_latest)
    `)
    .order('created_at', { ascending: false })
    .returns<DbProductItem[]>();

  const rawList: (DbProductItem | (typeof FALLBACK_PRODUCTS)[number])[] =
    dbProducts && dbProducts.length > 0 ? dbProducts : FALLBACK_PRODUCTS;

  const products = rawList.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    price_inr: p.price_inr,
    is_free: p.is_free,
    status: ('status' in p && p.status) ? p.status : 'published',
    thumbnail_url: p.thumbnail_url || '',
    versions: ('versions' in p && p.versions && p.versions.length > 0)
      ? p.versions
      : [{ version: 'v1.0.0', is_latest: true }],
  }));

  return (
    <div className="bg-[var(--surface)] p-6 sm:p-8 rounded-3xl border border-border shadow-xs space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <div>
          <h1 className="text-xl font-black text-ink tracking-tight flex items-center gap-2">
            <Package className="w-5 h-5 text-deep-green" />
            <span>Product Catalog & Version Uploads</span>
          </h1>
          <p className="text-xs text-slate mt-1">
            Manage product metadata, upload versioned ZIP packages to private storage, and maintain latest release tags.
          </p>
        </div>
      </div>

      <ProductAdminManager initialProducts={products} />
    </div>
  );
}
