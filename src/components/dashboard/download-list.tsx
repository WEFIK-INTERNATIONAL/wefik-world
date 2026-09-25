'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';

interface DownloadProduct {
  id: string;
  title: string;
  slug: string;
  thumbnail_url: string;
  version: string;
  category?: string;
  license_type?: string;
}

export function DownloadList({ products }: { products: DownloadProduct[] }) {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const supabase = createClient();

  const handleDownload = async (product: DownloadProduct) => {
    setDownloadingId(product.id);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        toast.error('Session expired. Please sign in again.');
        return;
      }

      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-project.supabase.co';
      const res = await fetch(`${supabaseUrl}/functions/v1/download-url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ product_id: product.id }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Download generation failed');
      }

      toast.success(`Download ready for ${product.title}`);
      window.location.assign(data.download_url);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to download';
      toast.error(msg);
    } finally {
      setDownloadingId(null);
    }
  };

  if (products.length === 0) {
    return (
      <div className="py-12 text-center text-xs text-slate space-y-3">
        <p>No downloadable products found in your account.</p>
        <Button asChild className="bg-ink hover:bg-black text-white text-xs rounded-xl h-10">
          <Link href="/marketplace">Browse Products</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 divide-y divide-border">
      {products.map((product) => (
        <div key={product.id} className="pt-4 first:pt-0 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="relative w-14 h-12 rounded-xl overflow-hidden bg-surface border border-border flex-shrink-0">
              <Image
                src={product.thumbnail_url}
                alt={product.title}
                fill
                sizes="56px"
                className="object-cover"
              />
            </div>
            <div>
              <Link href={`/products/${product.slug}`} className="font-bold text-sm text-ink hover:text-deep-green transition-colors">
                {product.title}
              </Link>
              <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate">
                <span className="font-mono bg-soft px-1.5 py-0.5 rounded border border-border">
                  {product.version || 'v1.0.0'}
                </span>
                {product.license_type && (
                  <span>• {product.license_type === 'unlimited' ? 'Unlimited Sites' : 'Single Site'}</span>
                )}
              </div>
            </div>
          </div>

          <Button
            onClick={() => handleDownload(product)}
            disabled={downloadingId === product.id}
            size="sm"
            className="bg-ink hover:bg-black text-white text-xs h-9 px-4 rounded-xl font-semibold flex items-center gap-1.5"
          >
            {downloadingId === product.id ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            <span>Download ZIP</span>
          </Button>
        </div>
      ))}
    </div>
  );
}
