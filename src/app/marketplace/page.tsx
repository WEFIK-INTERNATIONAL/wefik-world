import React from 'react';
import Link from 'next/link';
import { ProductCard } from '@/components/marketplace/product-card';
import { getProducts } from '@/lib/data/products';
import { Search, PackageX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RecentlyViewedShelf } from '@/components/marketplace/recently-viewed-shelf';

export const revalidate = 300;

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
    tech?: string;
    price?: string;
    rating?: string;
  }>;
}

// Typo tolerance similarity helper
function isFuzzyMatch(query: string, target: string): boolean {
  const q = query.toLowerCase();
  const t = target.toLowerCase();
  if (t.includes(q)) return true;

  // Check word permutations
  const queryWords = q.split(/\s+/).filter(Boolean);
  return queryWords.some((word) => word.length >= 3 && t.includes(word));
}

export default async function MarketplacePage({ searchParams }: MarketplacePageProps) {
  const resolvedParams = await searchParams;
  const q = resolvedParams.q?.toLowerCase().trim() || '';
  const category = resolvedParams.category || 'all';
  const type = resolvedParams.type || 'all';
  const sort = resolvedParams.sort || 'featured';
  const tech = resolvedParams.tech || 'all';
  const priceRange = resolvedParams.price || 'all';
  const minRating = resolvedParams.rating || 'all';
  const currentPage = Math.max(1, parseInt(resolvedParams.page || '1', 10));
  const itemsPerPage = 12;

  // Fetch all published products
  const allProducts = await getProducts();

  // 1. Strict filtering
  let filtered = allProducts.filter((p) => {
    // Search query
    if (q) {
      const titleMatch = (p.title || '').toLowerCase().includes(q);
      const taglineMatch = (p.tagline || '').toLowerCase().includes(q);
      const techMatch = Array.isArray(p.tech_stack) && p.tech_stack.some((t) => typeof t === 'string' && t.toLowerCase().includes(q));
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

    // Tech stack filter
    if (tech !== 'all') {
      const hasTech = Array.isArray(p.tech_stack) && p.tech_stack.some((t) => t.toLowerCase() === tech.toLowerCase());
      if (!hasTech) return false;
    }

    // Price range filter
    if (priceRange === 'free' && !p.is_free) return false;
    if (priceRange === 'under-1000' && (p.price_inr > 100000 || p.is_free)) return false;
    if (priceRange === '1000-3000' && (p.price_inr < 100000 || p.price_inr > 300000)) return false;
    if (priceRange === 'above-3000' && p.price_inr <= 300000) return false;

    // Rating filter
    if (minRating === '4' && p.rating_avg < 4.0) return false;
    if (minRating === '4.5' && p.rating_avg < 4.5) return false;

    return true;
  });

  // 2. Typo-tolerance fallback if strict search yields 0 results
  let isTypoFallback = false;
  if (filtered.length === 0 && q) {
    const fuzzyCandidates = allProducts.filter((p) => {
      const titleFuzzy = isFuzzyMatch(q, p.title || '');
      const taglineFuzzy = isFuzzyMatch(q, p.tagline || '');
      const descFuzzy = isFuzzyMatch(q, p.description || '');
      const techFuzzy = Array.isArray(p.tech_stack) && p.tech_stack.some((t) => isFuzzyMatch(q, t));
      return titleFuzzy || taglineFuzzy || descFuzzy || techFuzzy;
    });

    if (fuzzyCandidates.length > 0) {
      filtered = fuzzyCandidates;
      isTypoFallback = true;
    }
  }

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

  const techOptions = ['Gutenberg', 'Tailwind', 'Next.js', 'React', 'PHP', 'TypeScript'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-[calc(var(--header-height)+2rem)] pb-16">
      {/* Top Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
          <Link href="/" className="hover:text-[var(--text)]">Home</Link>
          <span>/</span>
          <span className="text-[var(--text)] font-semibold">Marketplace</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--text)]">
          Digital Products Marketplace
        </h1>
        <p className="text-xs sm:text-sm text-[var(--muted)] mt-1.5 max-w-2xl">
          Curated WordPress themes, plugins, and developer starters with verified commercial rights. Single-vendor engineering by Wefik.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-soft p-4 rounded-3xl border border-border mb-8 space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          {/* Search Input Form */}
          <form method="GET" action="/marketplace" className="relative w-full md:max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Search by keyword, tech, or feature (e.g. Agency, Gutenberg)..."
              className="w-full pl-10 pr-4 py-2.5 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-xs text-[var(--text)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-lime"
            />
            {category !== 'all' && <input type="hidden" name="category" value={category} />}
            {type !== 'all' && <input type="hidden" name="type" value={type} />}
            {sort !== 'featured' && <input type="hidden" name="sort" value={sort} />}
            {tech !== 'all' && <input type="hidden" name="tech" value={tech} />}
            {priceRange !== 'all' && <input type="hidden" name="price" value={priceRange} />}
          </form>

          {/* Sort & Facet Selectors */}
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            {/* Price Filter */}
            <form method="GET" action="/marketplace" className="shrink-0">
              {q && <input type="hidden" name="q" value={q} />}
              {category !== 'all' && <input type="hidden" name="category" value={category} />}
              {type !== 'all' && <input type="hidden" name="type" value={type} />}
              {sort !== 'featured' && <input type="hidden" name="sort" value={sort} />}
              {tech !== 'all' && <input type="hidden" name="tech" value={tech} />}
              <select
                name="price"
                defaultValue={priceRange}
                onChange={(e) => (e.target as HTMLSelectElement).form?.submit()}
                className="bg-[var(--surface)] border border-[var(--border)] text-xs rounded-xl px-3 py-2 text-[var(--text)] font-medium focus:outline-none cursor-pointer"
              >
                <option value="all">Any Price</option>
                <option value="free">Free Only</option>
                <option value="under-1000">Under ₹1,000</option>
                <option value="1000-3000">₹1,000 – ₹3,000</option>
                <option value="above-3000">Above ₹3,000</option>
              </select>
            </form>

            {/* Type Filter */}
            <form method="GET" action="/marketplace" className="shrink-0">
              {q && <input type="hidden" name="q" value={q} />}
              {category !== 'all' && <input type="hidden" name="category" value={category} />}
              {sort !== 'featured' && <input type="hidden" name="sort" value={sort} />}
              {tech !== 'all' && <input type="hidden" name="tech" value={tech} />}
              {priceRange !== 'all' && <input type="hidden" name="price" value={priceRange} />}
              <select
                name="type"
                defaultValue={type}
                onChange={(e) => (e.target as HTMLSelectElement).form?.submit()}
                className="bg-[var(--surface)] border border-[var(--border)] text-xs rounded-xl px-3 py-2 text-[var(--text)] font-medium focus:outline-none cursor-pointer"
              >
                <option value="all">All Types</option>
                <option value="paid">Premium Only</option>
                <option value="free">100% Free</option>
                <option value="bundle">Bundles</option>
              </select>
            </form>

            {/* Sort Selector */}
            <form method="GET" action="/marketplace" className="shrink-0">
              {q && <input type="hidden" name="q" value={q} />}
              {category !== 'all' && <input type="hidden" name="category" value={category} />}
              {type !== 'all' && <input type="hidden" name="type" value={type} />}
              {tech !== 'all' && <input type="hidden" name="tech" value={tech} />}
              {priceRange !== 'all' && <input type="hidden" name="price" value={priceRange} />}
              <select
                name="sort"
                defaultValue={sort}
                onChange={(e) => (e.target as HTMLSelectElement).form?.submit()}
                className="bg-[var(--surface)] border border-[var(--border)] text-xs rounded-xl px-3 py-2 text-[var(--text)] font-medium focus:outline-none cursor-pointer"
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
        <div data-lenis-prevent className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-1">
          {categories.map((cat) => {
            const isActive = category === cat.slug;
            const params = new URLSearchParams();
            if (q) params.set('q', q);
            if (cat.slug !== 'all') params.set('category', cat.slug);
            if (type !== 'all') params.set('type', type);
            if (sort !== 'featured') params.set('sort', sort);
            if (tech !== 'all') params.set('tech', tech);
            if (priceRange !== 'all') params.set('price', priceRange);

            const href = `/marketplace${params.toString() ? `?${params.toString()}` : ''}`;

            return (
              <Link
                key={cat.slug}
                href={href}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-ink text-white'
                    : 'bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--text)] border border-border'
                }`}
              >
                {cat.label}
              </Link>
            );
          })}
        </div>

        {/* Tech Stack Pills (Faceted Filter) */}
        <div data-lenis-prevent className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-1 border-t border-[var(--border)]/60">
          <span className="text-[10px] uppercase font-bold text-[var(--muted)] tracking-wider mr-1">
            Stack:
          </span>
          <Link
            href={`/marketplace?category=${category}&type=${type}&sort=${sort}`}
            className={`px-2 py-0.5 rounded-md text-[11px] font-mono transition-colors ${
              tech === 'all'
                ? 'bg-[var(--text)] text-[var(--surface)] font-bold'
                : 'bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--text)] border border-[var(--border)]'
            }`}
          >
            All
          </Link>
          {techOptions.map((t) => {
            const isActive = tech.toLowerCase() === t.toLowerCase();
            const params = new URLSearchParams();
            if (q) params.set('q', q);
            if (category !== 'all') params.set('category', category);
            if (type !== 'all') params.set('type', type);
            if (sort !== 'featured') params.set('sort', sort);
            if (!isActive) params.set('tech', t);

            return (
              <Link
                key={t}
                href={`/marketplace?${params.toString()}`}
                className={`px-2 py-0.5 rounded-md text-[11px] font-mono transition-colors ${
                  isActive
                    ? 'bg-lime text-black font-bold border border-lime'
                    : 'bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--text)] border border-[var(--border)]'
                }`}
              >
                {t}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Typo-Tolerance Notice */}
      {isTypoFallback && (
        <div className="p-3 mb-6 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-500 flex items-center justify-between">
          <span>
            No exact matches for &quot;<strong>{q}</strong>&quot;. Showing closest relevant items found in catalog:
          </span>
          <Link href="/marketplace" className="underline font-semibold ml-2">
            Reset
          </Link>
        </div>
      )}

      {/* Active Filters Display */}
      {(q || category !== 'all' || type !== 'all' || tech !== 'all' || priceRange !== 'all') && (
        <div className="flex items-center justify-between text-xs text-slate-500 mb-6">
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
        <div className="p-12 sm:p-16 rounded-3xl bg-soft border border-border text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-[var(--surface)] border border-border shadow-xs flex items-center justify-center text-deep-green mx-auto">
            <PackageX className="w-8 h-8 text-deep-green" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[var(--text)]">
              {q ? `No products found for "${q}"` : 'No products found'}
            </h3>
            <p className="text-xs sm:text-sm text-[var(--muted)] mt-1 max-w-md mx-auto">
              {q
                ? "We couldn't find matching assets even with fuzzy matching. Try exploring popular terms below:"
                : "No items match your selected category and filter combination."}
            </p>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-2 max-w-md mx-auto">
            {['WordPress', 'WooCommerce', 'Agency', 'Tailwind', 'Gutenberg', 'Free'].map((term) => (
              <Link
                key={term}
                href={`/marketplace?q=${encodeURIComponent(term.toLowerCase())}`}
                className="px-3 py-1 rounded-full bg-[var(--surface)] border border-border text-xs font-medium text-[var(--text)] hover:border-deep-green hover:text-deep-green transition-colors"
              >
                {term}
              </Link>
            ))}
          </div>

          <div className="pt-2">
            <Button asChild variant="outline" className="text-xs h-10 rounded-xl">
              <Link href="/marketplace">Reset All Filters</Link>
            </Button>
          </div>
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-12 flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }).map((_, idx) => {
            const pageNum = idx + 1;
            const isCurrent = pageNum === currentPage;
            const params = new URLSearchParams();
            if (q) params.set('q', q);
            if (category !== 'all') params.set('category', category);
            if (type !== 'all') params.set('type', type);
            if (sort !== 'featured') params.set('sort', sort);
            if (tech !== 'all') params.set('tech', tech);
            if (priceRange !== 'all') params.set('price', priceRange);
            params.set('page', String(pageNum));

            return (
              <Link
                key={pageNum}
                href={`/marketplace?${params.toString()}`}
                className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold transition-colors ${
                  isCurrent
                    ? 'bg-[var(--text)] text-[var(--surface)]'
                    : 'bg-[var(--surface)] text-[var(--muted)] border border-[var(--border)] hover:text-[var(--text)]'
                }`}
              >
                {pageNum}
              </Link>
            );
          })}
        </div>
      )}

      {/* Recently Viewed Shelf at bottom of marketplace */}
      <RecentlyViewedShelf />
    </div>
  );
}
