import React, { Suspense } from 'react';
import { getProducts } from '@/lib/data/products';
import { MarketplaceClientView } from '@/components/marketplace/marketplace-client-view';

export const revalidate = 3600;

export const metadata = {
  title: 'Marketplace — Themes, Plugins & Templates',
  description:
    'Browse our curated collection of production-grade WordPress themes, Gutenberg blocks, performance plugins, and Next.js templates.',
  alternates: {
    canonical: 'https://www.wefik.world/marketplace',
  },
};

export default async function MarketplacePage() {
  const allProducts = await getProducts();

  return (
    <Suspense fallback={<MarketplaceClientView initialProducts={allProducts} isFallback />}>
      <MarketplaceClientView initialProducts={allProducts} />
    </Suspense>
  );
}
