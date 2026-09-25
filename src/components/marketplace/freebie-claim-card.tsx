'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { SafeImage } from '@/components/ui/safe-image';
import { useRouter } from 'next/navigation';
import { Download, Loader2, ArrowUpRight, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { ProductData } from '@/lib/data/products';
import { DEFAULT_BLUR_DATA_URL } from '@/lib/image-placeholder';

export function FreebieClaimCard({ product }: { product: ProductData }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleClaim = async () => {
    setLoading(true);
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      toast.error('Please sign in to claim this free download', {
        action: {
          label: 'Sign In',
          onClick: () => router.push(`/login?redirect=/freebies`),
        },
      });
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/claim-free`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ product_id: product.id }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Claim failed');
      }

      toast.success('Successfully claimed! Your free license key is ready.');
      router.push('/dashboard/licenses');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Claim failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col bg-[var(--surface)] rounded-2xl border border-[var(--border)] overflow-hidden hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-xl transition-all duration-300">
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-[var(--surface-2)]">
        <Link href={`/products/${product.slug}`} className="block w-full h-full">
          <SafeImage
            src={product.thumbnail_url}
            alt={product.title}
            fill
            placeholder="blur"
            blurDataURL={DEFAULT_BLUR_DATA_URL}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover hover:scale-105 transition-transform duration-500"
          />
        </Link>
        <div className="absolute top-3 left-3 flex gap-2">
          <Badge className="bg-lime text-ink font-extrabold text-[10px] border-0">
            100% FREE
          </Badge>
          {product.category && (
            <Badge variant="secondary" className="bg-[var(--surface)]/90 backdrop-blur-sm text-[var(--text)] text-[10px] border border-[var(--border)]">
              {product.category.name}
            </Badge>
          )}
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-[var(--muted)] mb-1.5">
            {product.rating_count > 0 ? (
              <>
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span className="font-bold text-[var(--text)]">{product.rating_avg.toFixed(1)}</span>
                <span className="text-[var(--muted)] opacity-60">({product.rating_count} ratings)</span>
              </>
            ) : (
              <span className="text-[11px] italic">No reviews yet</span>
            )}
            <span className="text-[var(--muted)] opacity-40">•</span>
            <span className="text-deep-green font-semibold">{product.download_count} claims</span>
          </div>

          <Link href={`/products/${product.slug}`}>
            <h3 className="font-bold text-base text-ink hover:text-deep-green transition-colors">
              {product.title}
            </h3>
          </Link>
          <p className="text-xs text-slate mt-1 line-clamp-2">
            {product.tagline}
          </p>
        </div>

        <div className="pt-3 border-t border-border flex items-center justify-between gap-2">
          <Button
            onClick={handleClaim}
            disabled={loading}
            className="flex-1 bg-deep-green hover:bg-deep-green/90 text-white text-xs h-10 rounded-xl font-bold shadow-sm"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
            ) : (
              <Download className="w-4 h-4 mr-1.5" />
            )}
            Claim Free License
          </Button>

          <Button
            asChild
            variant="outline"
            size="sm"
            className="h-10 w-10 p-0 rounded-xl border-border text-slate hover:text-ink"
            aria-label={`View ${product.title}`}
          >
            <Link href={`/products/${product.slug}`}>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
