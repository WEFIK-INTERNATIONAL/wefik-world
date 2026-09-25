'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Copy, Check, Globe, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';

interface LicenseItem {
  id: string;
  license_key: string;
  license_type: string;
  status: string;
  activations_count: number;
  allowed_domains: string[];
  product_title: string;
  product_slug: string;
  created_at: string;
}

export function LicenseList({ initialLicenses }: { initialLicenses: LicenseItem[] }) {
  const [licenses, setLicenses] = useState(initialLicenses);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [newDomain, setNewDomain] = useState<{ [licenseId: string]: string }>({});
  const supabase = createClient();

  const handleCopy = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    toast.success('License key copied to clipboard!');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleAddDomain = async (licenseId: string) => {
    const domain = (newDomain[licenseId] || '').trim().toLowerCase();
    if (!domain) return;

    // Validate domain format (e.g. clientagency.com)
    const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/.*$/, '');

    const license = licenses.find((l) => l.id === licenseId);
    if (!license) return;

    if (license.license_type === 'single' && license.allowed_domains.length >= 1) {
      toast.error('Single Site licenses can only be bound to 1 production domain.');
      return;
    }

    if (license.allowed_domains.includes(cleanDomain)) {
      toast.info('Domain is already added.');
      return;
    }

    const updatedDomains = [...license.allowed_domains, cleanDomain];

    try {
      const { error } = await supabase
        .from('licenses')
        .update({ allowed_domains: updatedDomains })
        .eq('id', licenseId);

      if (error) throw error;

      setLicenses((prev) =>
        prev.map((l) => (l.id === licenseId ? { ...l, allowed_domains: updatedDomains } : l))
      );
      setNewDomain((prev) => ({ ...prev, [licenseId]: '' }));
      toast.success(`Domain ${cleanDomain} bound to license`);
    } catch {
      toast.error('Failed to update domain whitelist');
    }
  };

  const handleRemoveDomain = async (licenseId: string, domainToRemove: string) => {
    const license = licenses.find((l) => l.id === licenseId);
    if (!license) return;

    const updatedDomains = license.allowed_domains.filter((d) => d !== domainToRemove);

    try {
      const { error } = await supabase
        .from('licenses')
        .update({ allowed_domains: updatedDomains })
        .eq('id', licenseId);

      if (error) throw error;

      setLicenses((prev) =>
        prev.map((l) => (l.id === licenseId ? { ...l, allowed_domains: updatedDomains } : l))
      );
      toast.success(`Domain ${domainToRemove} removed from whitelist`);
    } catch {
      toast.error('Failed to remove domain');
    }
  };

  if (licenses.length === 0) {
    return (
      <div className="py-12 text-center text-xs text-slate space-y-3">
        <p>No license keys found. Purchase a theme or claim a free template to generate keys.</p>
        <Button asChild className="bg-ink hover:bg-black text-white text-xs rounded-xl h-10">
          <Link href="/marketplace">Browse Products</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 divide-y divide-border">
      {licenses.map((lic) => (
        <div key={lic.id} className="pt-6 first:pt-0 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <Link
                href={`/products/${lic.product_slug}`}
                className="text-base font-bold text-ink hover:text-deep-green transition-colors"
              >
                {lic.product_title}
              </Link>
              <div className="flex items-center gap-2 mt-0.5 text-xs">
                <span className="font-semibold text-deep-green bg-soft px-2 py-0.5 rounded border border-border">
                  {lic.license_type === 'unlimited' ? 'Unlimited Sites License' : 'Single Site License'}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    lic.status === 'active'
                      ? 'bg-lime/30 text-deep-green'
                      : 'bg-error/10 text-error'
                  }`}
                >
                  {lic.status}
                </span>
              </div>
            </div>

            <span className="text-[11px] text-slate">
              Issued {new Date(lic.created_at).toLocaleDateString('en-IN')}
            </span>
          </div>

          {/* Key Display with Copy */}
          <div className="bg-soft p-3.5 rounded-2xl border border-border flex items-center justify-between gap-3">
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-bold text-slate block leading-tight">
                Cryptographic License Key
              </span>
              <span className="font-mono text-xs sm:text-sm font-black text-ink tracking-wider truncate block pt-0.5">
                {lic.license_key}
              </span>
            </div>

            <button
              onClick={() => handleCopy(lic.license_key)}
              className="p-2 rounded-xl bg-[var(--surface)] border border-border text-slate hover:text-ink hover:border-slate shadow-xs transition-colors flex-shrink-0"
              aria-label="Copy license key"
            >
              {copiedKey === lic.license_key ? (
                <Check className="w-4 h-4 text-deep-green" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Domain Whitelist Section */}
          <div className="p-4 rounded-2xl bg-[var(--surface)] border border-border space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-ink flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-deep-green" />
                <span>Authorized Production Domains</span>
              </span>
              <span className="text-[11px] text-slate">
                Activations: {lic.activations_count}
              </span>
            </div>

            {lic.allowed_domains.length === 0 ? (
              <p className="text-[11px] text-slate italic">
                No domains currently bound. Add your production domain below to activate plugin/theme updates.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {lic.allowed_domains.map((dom) => (
                  <span
                    key={dom}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-soft border border-border text-ink font-mono text-[11px]"
                  >
                    <span>{dom}</span>
                    <button
                      onClick={() => handleRemoveDomain(lic.id, dom)}
                      className="text-slate hover:text-error"
                      aria-label={`Remove domain ${dom}`}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Add Domain Input */}
            <div className="flex gap-2 pt-1 max-w-sm">
              <Input
                type="text"
                placeholder="clientdomain.com"
                value={newDomain[lic.id] || ''}
                onChange={(e) =>
                  setNewDomain((prev) => ({ ...prev, [lic.id]: e.target.value }))
                }
                className="h-8 text-xs font-mono rounded-lg"
              />
              <Button
                onClick={() => handleAddDomain(lic.id)}
                size="sm"
                className="h-8 px-3 text-xs rounded-lg bg-ink hover:bg-black text-white font-semibold"
              >
                <Plus className="w-3 h-3 mr-1" />
                Add
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
