import React from 'react';
import { requireAuth } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { LicenseList } from '@/components/dashboard/license-list';
import { KeyRound } from 'lucide-react';

export const metadata = {
  title: 'My License Keys — wefik.world',
};

export default async function LicensesPage() {
  const user = await requireAuth('/dashboard/licenses');
  const supabase = await createClient();

  const { data: licenses } = await supabase
    .from('licenses')
    .select(`
      id,
      license_key,
      license_type,
      status,
      activations_count,
      allowed_domains,
      created_at,
      product:products(title, slug)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  const formattedLicenses = (licenses || []).map((l: any) => ({
    id: l.id,
    license_key: l.license_key,
    license_type: l.license_type,
    status: l.status,
    activations_count: l.activations_count,
    allowed_domains: l.allowed_domains || [],
    product_title: l.product?.title || 'Digital Product',
    product_slug: l.product?.slug || '',
    created_at: l.created_at,
  }));

  return (
    <div className="bg-[var(--surface)] p-6 sm:p-8 rounded-3xl border border-border shadow-xs space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <div>
          <h1 className="text-xl font-black text-ink tracking-tight flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-deep-green" />
            <span>Commercial License Keys</span>
          </h1>
          <p className="text-xs text-slate mt-1">
            Copy your cryptographic license keys and whitelist authorized client production domains.
          </p>
        </div>
      </div>

      <LicenseList initialLicenses={formattedLicenses} />
    </div>
  );
}
