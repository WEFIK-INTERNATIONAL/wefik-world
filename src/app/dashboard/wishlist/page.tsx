import React from 'react';
import Link from 'next/link';
import { requireAuth } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { ProductCard } from '@/components/marketplace/product-card';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Saved Wishlist — wefik.world',
};

export default async function WishlistPage() {
  const user = await requireAuth('/dashboard/wishlist');
  const supabase = await createClient();

  const { data: wishlists } = await supabase
    .from('wishlists')
    .select(`
      id,
      product:products(
        id,
        title,
        slug,
        tagline,
        price_inr,
        is_free,
        is_featured,
        is_bundle,
        thumbnail_url,
        tech_stack,
        rating_avg,
        rating_count,
        category:categories(name, slug)
      )
    `)
    .eq('user_id', user.id);

  const wishlistProducts = (wishlists || [])
    .map((w: any) => w.product)
    .filter(Boolean);

  return (
    <div className="bg-white p-6 sm:p-8 rounded-3xl border border-border shadow-xs space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <div>
          <h1 className="text-xl font-black text-ink tracking-tight flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-500 fill-current" />
            <span>Saved Wishlist ({wishlistProducts.length})</span>
          </h1>
          <p className="text-xs text-slate mt-1">
            Products you&apos;ve bookmarked for upcoming agency projects or developer sprints.
          </p>
        </div>
      </div>

      {wishlistProducts.length === 0 ? (
        <div className="py-12 text-center text-xs text-slate space-y-3">
          <p>Your wishlist is currently empty.</p>
          <Button asChild className="bg-ink hover:bg-black text-white text-xs rounded-xl h-10">
            <Link href="/marketplace">Explore Products</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
          {wishlistProducts.map((p: any) => (
            <ProductCard
              key={p.id}
              id={p.id}
              title={p.title}
              slug={p.slug}
              tagline={p.tagline}
              price_inr={p.price_inr}
              is_free={p.is_free}
              is_featured={p.is_featured}
              is_bundle={p.is_bundle}
              thumbnail_url={p.thumbnail_url}
              category={p.category}
              rating_avg={p.rating_avg}
              rating_count={p.rating_count}
              tech_stack={p.tech_stack || []}
              isWishlisted={true}
            />
          ))}
        </div>
      )}
    </div>
  );
}
