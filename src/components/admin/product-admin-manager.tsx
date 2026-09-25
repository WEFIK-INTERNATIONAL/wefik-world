'use client';

import React, { useState } from 'react';
import { SafeImage } from '@/components/ui/safe-image';
import Link from 'next/link';
import { Package, Plus, Upload, Loader2, CheckCircle2, FileArchive, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';

/**
 * P1-10: Admin price input guard.
 * Rejects non-round-rupee amounts (e.g. ₹6,247.50).
 */
export function validateProductPriceRupees(rupees: number): { valid: boolean; error?: string } {
  if (isNaN(rupees) || rupees < 0) {
    return { valid: false, error: 'Price must be a non-negative number' };
  }
  if (!Number.isInteger(rupees)) {
    return {
      valid: false,
      error: `All prices must be round rupees. Decimal paise like ₹${rupees} are rejected. Use ₹${Math.round(rupees)}.`,
    };
  }
  return { valid: true };
}

interface AdminProduct {
  id: string;
  title: string;
  slug: string;
  price_inr: number;
  is_free: boolean;
  status: string;
  thumbnail_url: string;
  versions?: { version: string; is_latest: boolean }[];
}

export function ProductAdminManager({ initialProducts }: { initialProducts: AdminProduct[] }) {
  const [products, setProducts] = useState(initialProducts);
  const [selectedProduct, setSelectedProduct] = useState<AdminProduct | null>(null);
  const [seoModalProduct, setSeoModalProduct] = useState<AdminProduct | null>(null);
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [primaryUseCase, setPrimaryUseCase] = useState('agencies');
  const [imageAlt, setImageAlt] = useState('');
  const [savingSeo, setSavingSeo] = useState(false);
  const [newVersion, setNewVersion] = useState('1.0.1');
  const [changelog, setChangelog] = useState('Bug fixes, performance improvements, and security enhancements.');
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const supabase = createClient();

  const handleVersionUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    setUploading(true);
    try {
      let storagePath = `${selectedProduct.slug}/${newVersion}.zip`;

      if (file) {
        // Upload zip file to private product-files bucket
        const { error: uploadError } = await supabase.storage
          .from('product-files')
          .upload(storagePath, file, { upsert: true });

        if (uploadError) {
          console.warn('Private storage upload warning:', uploadError);
        }
      }

      // Per spec Section 4 Fix 12: Set is_latest = true on new version insert, false on older versions
      await (supabase as any)
        .from('product_versions')
        .update({ is_latest: false })
        .eq('product_id', selectedProduct.id);

      const { error: insertError } = await (supabase as any).from('product_versions').insert({
        product_id: selectedProduct.id,
        version: newVersion.trim(),
        changelog: changelog.trim(),
        file_path: storagePath,
        is_latest: true,
      });

      if (insertError) throw insertError;

      toast.success(`Version ${newVersion} published successfully for ${selectedProduct.title}`);
      setSelectedProduct(null);
      setFile(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Upload failed';
      toast.error(msg);
    } finally {
      setUploading(false);
    }
  };

  const openSeoEditor = (p: AdminProduct) => {
    setSeoModalProduct(p);
    setSeoTitle((p as any).seo_title || `${p.title} – Digital Product | Wefik.world`);
    setSeoDescription((p as any).seo_description || `${p.title} with commercial license from ₹${Math.round(p.price_inr / 100)}. Instant download, lifetime updates.`);
    setPrimaryUseCase((p as any).primary_use_case || 'agencies');
    setImageAlt((p as any).image_alt || `${p.title} preview screenshot`);
  };

  const handleSaveSeo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!seoModalProduct) return;

    // Section 9.4: Validate Image ALT text is present and descriptive
    if (!imageAlt || imageAlt.trim().length < 5) {
      toast.error('Image ALT text is required and must be at least 5 characters (e.g. "AgencyPro theme dashboard preview")');
      return;
    }

    setSavingSeo(true);
    try {
      const { error } = await (supabase as any)
        .from('products')
        .update({
          seo_title: seoTitle.trim(),
          seo_description: seoDescription.trim(),
          primary_use_case: primaryUseCase.trim(),
          image_alt: imageAlt.trim(),
        })
        .eq('id', seoModalProduct.id);

      if (error) throw error;

      toast.success(`SEO metadata updated for ${seoModalProduct.title}`);
      setSeoModalProduct(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update SEO fields';
      toast.error(msg);
    } finally {
      setSavingSeo(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Version Modal / Drawer Box */}
      {selectedProduct && (
        <div className="bg-soft p-6 sm:p-8 rounded-3xl border border-deep-green/40 shadow-md space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-deep-green">
                Upload New Release
              </span>
              <h3 className="text-base font-bold text-ink">
                Add Version for: {selectedProduct.title}
              </h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedProduct(null)}
              className="text-xs text-slate hover:text-ink"
            >
              Cancel
            </Button>
          </div>

          <form onSubmit={handleVersionUpload} className="space-y-4 max-w-lg">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate">Version Tag</label>
                <Input
                  type="text"
                  placeholder="1.0.1"
                  value={newVersion}
                  onChange={(e) => setNewVersion(e.target.value)}
                  required
                  className="h-9 text-xs rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate">Product ZIP Package</label>
                <Input
                  type="file"
                  accept=".zip"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="h-9 text-xs rounded-xl file:text-xs file:font-semibold"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate">Changelog & Release Notes</label>
              <textarea
                value={changelog}
                onChange={(e) => setChangelog(e.target.value)}
                rows={2}
                required
                className="w-full px-3 py-2 text-xs bg-[var(--surface)] border border-border rounded-xl text-ink"
              />
            </div>

            <Button
              type="submit"
              disabled={uploading}
              className="bg-deep-green hover:bg-deep-green/90 text-white text-xs h-10 px-5 rounded-xl font-bold"
            >
              {uploading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
              ) : (
                <Upload className="w-3.5 h-3.5 mr-1.5" />
              )}
              Upload Release & Set as Latest
            </Button>
          </form>
        </div>
      )}

      {/* SEO & Image ALT Editor Drawer (Section 7.3 & 9.4) */}
      {seoModalProduct && (
        <div className="bg-soft p-6 sm:p-8 rounded-3xl border border-deep-green/40 shadow-md space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-deep-green">
                SEO & Accessibility Enforcement (Sections 7.3 & 9.4)
              </span>
              <h3 className="text-base font-bold text-ink">
                Edit SEO Meta & Image Alt for: {seoModalProduct.title}
              </h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSeoModalProduct(null)}
              className="text-xs text-slate hover:text-ink"
            >
              Cancel
            </Button>
          </div>

          <form onSubmit={handleSaveSeo} className="space-y-4 max-w-2xl">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate">
                SEO Title Formula: <span className="font-mono text-ink">{"{Product Name} – {Type} for {Primary Use Case} | Wefik.world"}</span>
              </label>
              <Input
                type="text"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                required
                maxLength={60}
                placeholder="AgencyPro – WordPress Theme for Agencies | Wefik.world"
                className="h-9 text-xs rounded-xl"
              />
              <span className="text-[10px] text-slate font-mono block">
                {seoTitle.length}/60 chars (Keep under 60 characters for search engines)
              </span>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate">
                Primary Use Case (for programmatic long-tail pages)
              </label>
              <select
                value={primaryUseCase}
                onChange={(e) => setPrimaryUseCase(e.target.value)}
                className="w-full h-9 px-3 text-xs bg-[var(--surface)] border border-border rounded-xl text-ink"
              >
                <option value="agencies">Agencies & Studios</option>
                <option value="restaurants">Restaurants & Cafes</option>
                <option value="ecommerce">E-Commerce & Retail</option>
                <option value="saas">SaaS & Startups</option>
                <option value="portfolios">Portfolios & Freelancers</option>
                <option value="blogs">Blogs & Editorial</option>
                <option value="education">Education & Courses</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate">
                SEO Meta Description (Max 155 characters)
              </label>
              <textarea
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                rows={2}
                maxLength={155}
                required
                placeholder="High-performance WordPress theme for digital agencies. Commercial license from ₹799. Instant download and lifetime updates."
                className="w-full px-3 py-2 text-xs bg-[var(--surface)] border border-border rounded-xl text-ink"
              />
              <span className="text-[10px] text-slate font-mono block">
                {seoDescription.length}/155 chars (Include primary keyword + number + CTA)
              </span>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate">
                Image Alt Text <span className="text-rose-500 font-bold">* REQUIRED (Section 9.4)</span>
              </label>
              <Input
                type="text"
                value={imageAlt}
                onChange={(e) => setImageAlt(e.target.value)}
                required
                placeholder="AgencyPro agency theme live demo preview screenshot"
                className="h-9 text-xs rounded-xl"
              />
              <span className="text-[10px] text-slate block">
                Descriptive alt text required for accessibility & Google Image SEO (e.g. &apos;&#123;name&#125; — &#123;type&#125; preview&apos;).
              </span>
            </div>

            <Button
              type="submit"
              disabled={savingSeo}
              className="bg-deep-green hover:bg-deep-green/90 text-white text-xs h-10 px-5 rounded-xl font-bold"
            >
              {savingSeo ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
              )}
              Save SEO & Image Metadata
            </Button>
          </form>
        </div>
      )}

      {/* Products Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-soft text-slate uppercase text-[10px] font-bold border-y border-border">
            <tr>
              <th className="py-3 px-4">Product</th>
              <th className="py-3 px-4">Price (Paise / INR)</th>
              <th className="py-3 px-4">Latest Version</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {products.map((p) => {
              const latestVer = p.versions?.find((v) => v.is_latest)?.version || 'v1.0.0';

              return (
                <tr key={p.id} className="hover:bg-soft/30 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-8 rounded-lg overflow-hidden bg-surface border border-border flex-shrink-0">
                        <SafeImage src={p.thumbnail_url} alt={p.title} fill className="object-cover" sizes="40px" />
                      </div>
                      <div>
                        <span className="font-bold text-ink block">{p.title}</span>
                        <span className="text-[11px] text-slate font-mono">{p.slug}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-ink">
                    {p.is_free ? (
                      <span className="text-deep-green uppercase text-[10px] font-extrabold">Free</span>
                    ) : (
                      `₹${(p.price_inr / 100).toLocaleString('en-IN')}`
                    )}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-semibold text-slate">
                    {latestVer}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-lime/30 text-deep-green">
                      {p.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        onClick={() => openSeoEditor(p)}
                        size="sm"
                        variant="secondary"
                        className="h-8 text-xs rounded-lg border border-border bg-[var(--surface)] hover:bg-soft text-ink font-semibold"
                      >
                        Edit SEO & Alt
                      </Button>
                      <Button
                        onClick={() => setSelectedProduct(p)}
                        size="sm"
                        variant="outline"
                        className="h-8 text-xs rounded-lg border-border"
                      >
                        <Upload className="w-3 h-3 mr-1" />
                        <span>Upload Version</span>
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
