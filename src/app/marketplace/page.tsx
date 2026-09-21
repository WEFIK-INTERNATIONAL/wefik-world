import React from 'react';
import Link from 'next/link';
import { ProductCard } from '@/components/marketplace/product-card';
import { getProducts, FALLBACK_PRODUCTS, ProductData } from '@/lib/data/products';
import { Search, SlidersHorizontal, ArrowLeft, ArrowRight, PackageX } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Marketplace — Themes, Plugins & Templates',
  description:
    'Browse our curated collection of production-grade WordPress themes, Gutenberg blocks, performance plugins, and Next.js templates.',
};

interface MarketplacePageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    type?: string;
    sort?: string;
    page?: string;
  }>;
}

export default async function MarketplacePage({ searchParams }: MarketplacePageProps) {
  const resolvedParams = await searchParams;
  const q = resolvedParams.q?.toLowerCase().trim() || '';
  const category = resolvedParams.category || 'all';
  const type = resolvedParams.type || 'all';
  const sort = resolvedParams.sort || 'featured';
  const currentPage = Math.max(1, parseInt(resolvedParams.page || '1', 10));
  const itemsPerPage = 12;

  // Fetch all published products
  const allProducts = await getProducts();

  // Filter products in-memory for resilience & instant search
  let filtered = allProducts.filter((p) => {
    // Search query
    if (q) {
      const titleMatch = p.title.toLowerCase().includes(q);
      const taglineMatch = p.tagline.toLowerCase().includes(q);
      const techMatch = p.tech_stack.some((t) => t.toLowerCase().includes(q));
      if (!titleMatch && !taglineMatch && !techMatch) {
        return false;
      }
    }

    // Category filter
    if (category !== 'all') {
      if (p.category?.slug !== category) {
        return false;
      }
    }

    // Type filter
    if (type === 'free' && !p.is_free) return false;
    if (type === 'paid' && p.is_free) return false;
    if (type === 'bundle' && !p.is_bundle) return false;

    return true;
  });

  // Sort products
  filtered.sort((a, b) => {
    if (sort === 'price-low') {
      return a.price_inr - b.price_inr;
    }
    if (sort === 'price-high') {
      return b.price_inr - a.price_inr;
    }
    if (sort === 'rating') {
      return b.rating_avg - a.rating_avg;
    }
    // Default: featured first
    if (a.is_featured && !b.is_featured) return -1;
    if (!a.is_featured && b.is_featured) return 1;
    return 0;
  });

  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const paginatedProducts = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const categories = [
    { label: 'All Products', slug: 'all' },
    { label: 'WordPress Themes', slug: 'wordpress-themes' },
    { label: 'WordPress Plugins', slug: 'wordpress-plugins' },
    { label: 'HTML & Tailwind', slug: 'templates-starters' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      {/* Top Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs text-slate mb-2">
          <Link href="/" className="hover:text-ink">Home</Link>
          <span>/</span>
          <span className="text-ink font-semibold">Marketplace</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-ink">
          Digital Products Marketplace
        </h1>
        <p className="text-xs sm:text-sm text-slate mt-1.5 max-w-2xl">
          Curated WordPress themes, plugins, and developer starters with verified commercial rights.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-soft p-4 rounded-2xl border border-border mb-8 space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          {/* Search Input Form */}
          <form method="GET" action="/marketplace" className="relative w-full md:max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate" />
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Search by keyword, technology, or feature..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-border rounded-xl text-xs text-ink placeholder:text-slate focus:outline-none focus:ring-2 focus:ring-lime"
            />
            {category !== 'all' && <input type="hidden" name="category" value={category} />}
            {type !== 'all' && <input type="hidden" name="type" value={type} />}
            {sort !== 'featured' && <input type="hidden" name="sort" value={sort} />}
          </form>

          {/* Sort & Type Selectors */}
          <div className="flex items-center gap-2.5 w-full md:w-auto">
            {/* Type Filter */}
            <form method="GET" action="/marketplace" className="w-1/2 md:w-auto">
              {q && <input type="hidden" name="q" value={q} />}
              {category !== 'all' && <input type="hidden" name="category" value={category} />}
              {sort !== 'featured' && <input type="hidden" name="sort" value={sort} />}
              <select
                name="type"
                defaultValue={type}
                onChange={(e) => (e.target as HTMLSelectElement).form?.submit()}
                className="w-full bg-white border border-border text-xs rounded-xl px-3 py-2.5 text-ink font-medium focus:outline-none focus:ring-1 focus:ring-lime cursor-pointer"
              >
                <option value="all">All Types</option>
                <option value="paid">Premium Only</option>
                <option value="free">100% Free</option>
                <option value="bundle">Bundles (Deals)</option>
              </select>
            </form>

            {/* Sort Selector */}
            <form method="GET" action="/marketplace" className="w-1/2 md:w-auto">
              {q && <input type="hidden" name="q" value={q} />}
              {category !== 'all' && <input type="hidden" name="category" value={category} />}
              {type !== 'all' && <input type="hidden" name="type" value={type} />}
              <select
                name="sort"
                defaultValue={sort}
                onChange={(e) => (e.target as HTMLSelectElement).form?.submit()}
                className="w-full bg-white border border-border text-xs rounded-xl px-3 py-2.5 text-ink font-medium focus:outline-none focus:ring-1 focus:ring-lime cursor-pointer"
              >
                <option value="featured">Featured First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </form>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-1">
          {categories.map((cat) => {
            const isActive = category === cat.slug;
            const params = new URLSearchParams();
            if (q) params.set('q', q);
            if (cat.slug !== 'all') params.set('category', cat.slug);
            if (type !== 'all') params.set('type', type);
            if (sort !== 'featured') params.set('sort', sort);

            const href = `/marketplace${params.toString() ? `?${params.toString()}` : ''}`;

            return (
              <Link
                key={cat.slug}
                href={href}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-ink text-white'
                    : 'bg-white text-slate hover:text-ink border border-border'
                }`}
              >
                {cat.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Active Filters Display */}
      {(q || category !== 'all' || type !== 'all') && (
        <div className="flex items-center justify-between text-xs text-slate mb-6">
          <span>
            Found <strong>{totalItems}</strong> {totalItems === 1 ? 'product' : 'products'}
            {q && <> for &quot;<strong>{q}</strong>&quot;</>}
          </span>
          <Link href="/marketplace" className="text-deep-green font-semibold hover:underline">
            Clear All Filters
          </Link>
        </div>
      )}

      {/* Products Grid */}
      {paginatedProducts.length === 0 ? (
        <div className="p-16 rounded-3xl bg-soft border border-border text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-white border border-border flex items-center justify-center text-slate mx-auto">
            <PackageX className="w-7 h-7 stroke-1" />
          </div>
          <div>
            <h3 className="text-base font-bold text-ink">No products found</h3>
            <p className="text-xs text-slate mt-1 max-w-sm mx-auto">
              We couldn&apos;t find anything matching your current filters or search terms.
            </p>
          </div>
          <Button asChild variant="outline" className="text-xs h-10 rounded-xl">
            <Link href="/marketplace">Reset Filters</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {paginatedProducts.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              title={product.title}
              slug={product.slug}
              tagline={product.tagline}
              price_inr={product.price_inr}
              is_free={product.is_free}
              is_featured={product.is_featured}
              is_bundle={product.is_bundle}
              thumbnail_url={product.thumbnail_url}
              category={product.category}
              rating_avg={product.rating_avg}
              rating_count={product.rating_count}
              tech_stack={product.tech_stack}
            />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="mt-14 pt-6 border-t border-border flex items-center justify-between text-xs">
          <div className="text-slate">
            Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
          </div>

          <div className="flex items-center gap-2">
            {currentPage > 1 ? (
              <Button asChild variant="outline" size="sm" className="h-9 rounded-xl gap-1">
                <Link
                  href={`/marketplace?${new URLSearchParams({
                    ...(q ? { q } : {}),
                    ...(category !== 'all' ? { category } : {}),
                    ...(type !== 'all' ? { type } : {}),
                    ...(sort !== 'featured' ? { sort } : {}),
                    page: String(currentPage - 1),
                  }).toString()}`}
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </Link>
              </Button>
            ) : (
              <Button variant="outline" size="sm" disabled className="h-9 rounded-xl gap-1">
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </Button>
            )}

            {currentPage < totalPages ? (
              <Button asChild variant="outline" size="sm" className="h-9 rounded-xl gap-1">
                <Link
                  href={`/marketplace?${new URLSearchParams({
                    ...(q ? { q } : {}),
                    ...(category !== 'all' ? { category } : {}),
                    ...(type !== 'all' ? { type } : {}),
                    ...(sort !== 'featured' ? { sort } : {}),
                    page: String(currentPage + 1),
                  }).toString()}`}
                >
                  <span>Next</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </Button>
            ) : (
              <Button variant="outline" size="sm" disabled className="h-9 rounded-xl gap-1">
                <span>Next</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
