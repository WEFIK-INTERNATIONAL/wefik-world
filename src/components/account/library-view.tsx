'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { SafeImage } from '@/components/ui/safe-image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import {
  Download,
  Copy,
  Check,
  Eye,
  EyeOff,
  HelpCircle,
  FileCode,
  Search,
  Inbox,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';

export interface LibraryItem {
  licenseId: string;
  licenseKey: string;
  licenseType: string;
  productId: string;
  productTitle: string;
  productSlug: string;
  productTagline: string;
  productThumbnail: string;
  version: string;
  changelog: string | null;
  createdAt: string;
}

export function LibraryView({ items }: { items: LibraryItem[] }) {
  const [search, setSearch] = useState('');
  const [revealedKeys, setRevealedKeys] = useState<{ [id: string]: boolean }>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const supabase = createClient();

  const toggleReveal = (id: string) => {
    setRevealedKeys((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const copyLicense = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    toast.success('License key copied to clipboard!');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleDownload = async (productId: string, licenseKey: string) => {
    setDownloadingId(productId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-project.supabase.co';
      const res = await fetch(`${supabaseUrl}/functions/v1/download-url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ product_id: productId, license_key: licenseKey }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        toast.error(errorData.error || 'Failed to generate download URL.');
        setDownloadingId(null);
        return;
      }

      const { download_url } = await res.json();
      if (download_url) {
        window.location.href = download_url;
        toast.success('Download started!');
      } else {
        toast.error('Download link unavailable.');
      }
    } catch {
      toast.error('Network error requesting download.');
    } finally {
      setDownloadingId(null);
    }
  };

  const filteredItems = items.filter(
    (item) =>
      item.productTitle.toLowerCase().includes(search.toLowerCase()) ||
      item.productTagline.toLowerCase().includes(search.toLowerCase())
  );

  function maskKey(key: string, isRevealed: boolean) {
    if (isRevealed) return key;
    // Format: WFK-XXXX-XXXX-XXXX -> WFK-••••-••••-XXXX
    const parts = key.split('-');
    if (parts.length === 4) {
      return `${parts[0]}-••••-••••-${parts[3]}`;
    }
    return 'WFK-••••-••••-••••';
  }

  return (
    <div className="space-y-6">
      {/* Search Filter */}
      {items.length > 0 && (
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate absolute left-3.5 top-1/2 -translate-y-1/2" />
            <Input
              type="text"
              placeholder="Search your owned products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-[var(--surface)] border-[var(--border)] text-xs text-[var(--text)]"
            />
          </div>
          <Link href="/marketplace">
            <Button size="sm" variant="outline" className="border-[var(--border)] text-xs">
              Explore More
            </Button>
          </Link>
        </div>
      )}

      {/* Items Grid */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredItems.map((item) => {
            const isRevealed = Boolean(revealedKeys[item.licenseId]);
            const isDownloading = downloadingId === item.productId;

            return (
              <div
                key={item.licenseId}
                className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-xs flex flex-col justify-between hover:border-deep-green/30 transition-all duration-300"
              >
                <div>
                  {/* Thumbnail & Title */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-[var(--surface-2)] shrink-0 border border-[var(--border)]">
                      <SafeImage
                        src={item.productThumbnail}
                        alt={item.productTitle}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-deep-green/10 text-deep-green capitalize">
                          {item.licenseType} License
                        </span>
                        <span className="text-[10px] font-mono text-slate">v{item.version}</span>
                      </div>
                      <h4 className="text-base font-bold text-[var(--text)] truncate font-display">
                        {item.productTitle}
                      </h4>
                      <p className="text-xs text-slate line-clamp-1 mt-0.5">{item.productTagline}</p>
                    </div>
                  </div>

                  {/* License Key Box */}
                  <div className="p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] mb-4">
                    <div className="flex items-center justify-between text-[11px] text-slate mb-1">
                      <span className="font-semibold uppercase tracking-wider text-[10px]">License Key</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => toggleReveal(item.licenseId)}
                          className="hover:text-[var(--text)] transition-colors inline-flex items-center gap-1"
                        >
                          {isRevealed ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          <span>{isRevealed ? 'Mask' : 'Reveal'}</span>
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-2 font-mono text-xs">
                      <span className="text-[var(--text)] font-semibold truncate select-all">
                        {maskKey(item.licenseKey, isRevealed)}
                      </span>
                      <button
                        type="button"
                        onClick={() => copyLicense(item.licenseKey)}
                        className="p-1 rounded-md hover:bg-[var(--surface)] text-slate hover:text-[var(--text)] transition-colors"
                        title="Copy license key"
                        aria-label="Copy license key"
                      >
                        {copiedKey === item.licenseKey ? (
                          <Check className="w-3.5 h-3.5 text-deep-green" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Actions Row */}
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-[var(--border)]">
                  <div className="flex items-center gap-2">
                    {/* How to Activate Modal */}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-xs text-slate hover:text-[var(--text)] p-0 h-auto">
                          <HelpCircle className="w-3.5 h-3.5 mr-1 text-deep-green" />
                          <span>How to activate</span>
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md bg-[var(--surface)] border-[var(--border)]">
                        <DialogHeader>
                          <DialogTitle className="text-lg font-bold font-display text-[var(--text)]">
                            Activating {item.productTitle}
                          </DialogTitle>
                          <DialogDescription className="text-xs text-slate">
                            Follow these steps to activate your commercial license key.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 text-xs text-[var(--text)] pt-2">
                          <div className="p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] space-y-1">
                            <p className="font-bold text-slate uppercase text-[10px]">Your License Key</p>
                            <p className="font-mono font-semibold text-deep-green select-all">{item.licenseKey}</p>
                          </div>
                          <div className="space-y-2">
                            <h5 className="font-bold">WordPress Installation:</h5>
                            <ol className="list-decimal pl-4 space-y-1 text-slate">
                              <li>Download the ZIP file using the button below.</li>
                              <li>Go to <strong>WP Admin → Appearance → Themes</strong> (or Plugins → Add New).</li>
                              <li>Upload and activate the package.</li>
                              <li>Navigate to <strong>Settings → Wefik License</strong> and paste your key.</li>
                            </ol>
                          </div>
                          <div className="space-y-2">
                            <h5 className="font-bold">Next.js / HTML Starter:</h5>
                            <p className="text-slate leading-relaxed">
                              Add your license key to your project&apos;s <code>.env.local</code> file under <code>WEFIK_LICENSE_KEY=your_key</code> for automated update verifications.
                            </p>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                    {item.changelog && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-xs text-slate hover:text-[var(--text)] p-0 h-auto">
                            <FileCode className="w-3.5 h-3.5 mr-1" />
                            <span>Changelog</span>
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md bg-[var(--surface)] border-[var(--border)]">
                          <DialogHeader>
                            <DialogTitle className="text-base font-bold font-display text-[var(--text)]">
                              Changelog (v{item.version})
                            </DialogTitle>
                          </DialogHeader>
                          <div className="p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-xs text-slate whitespace-pre-line font-mono max-h-60 overflow-y-auto">
                            {item.changelog}
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>

                  {/* Download Button */}
                  <Button
                    size="sm"
                    onClick={() => handleDownload(item.productId, item.licenseKey)}
                    disabled={isDownloading}
                    className="bg-deep-green text-white hover:bg-deep-green/90 text-xs font-semibold"
                  >
                    {isDownloading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                    ) : (
                      <Download className="w-3.5 h-3.5 mr-1.5" />
                    )}
                    Download ZIP
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Honest Empty State */
        <div className="p-12 text-center rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-xs space-y-3">
          <div className="mx-auto w-12 h-12 rounded-full bg-[var(--surface-2)] flex items-center justify-center text-slate">
            <Inbox className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-[var(--text)] font-display">
            You haven&apos;t bought or claimed anything yet
          </h3>
          <p className="text-xs text-slate max-w-md mx-auto">
            When you purchase themes, plugins, or claim 100% free developer starters, your downloads and commercial license keys will appear here.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <Link href="/freebies">
              <Button variant="outline" size="sm" className="text-xs border-[var(--border)]">
                Claim Freebies
              </Button>
            </Link>
            <Link href="/marketplace">
              <Button size="sm" className="bg-deep-green hover:bg-deep-green/90 text-white text-xs font-semibold">
                Browse Marketplace
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
