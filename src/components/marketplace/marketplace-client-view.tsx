'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ProductCard } from '@/components/marketplace/product-card';
import { Search, PackageX, SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RecentlyViewedShelf } from '@/components/marketplace/recently-viewed-shelf';
import type { ProductData } from '@/lib/data/products';

const ADVANCED_FILTER_THRESHOLD = 8;

interface MarketplaceClientViewProps {
  initialProducts: ProductData[];
  isFallback?: boolean;
}

function isFuzzyMatch(query: string, target: string): boolean {
  const q = query.toLowerCase();
  const t = target.toLowerCase();
  if (t.includes(q)) return true;

  const queryWords = q.split(/\s+/).filter(Boolean);
  return queryWords.some((word) => word.length >= 3 && t.includes(word));
}

export function MarketplaceClientView({
  initialProducts,
  isFallback = false,
}: MarketplaceClientViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const q = isFallback ? '' : searchParams?.get('q')?.trim() || '';
  const category = isFallback ? 'all' : searchParams?.get('category') || 'all';
  const type = isFallback ? 'all' : searchParams?.get('type') || 'all';
  const sort = isFallback ? 'featured' : searchParams?.get('sort') || 'featured';
  const tech = isFallback ? 'all' : searchParams?.get('tech') || 'all';
  const priceRange = isFallback ? 'all' : searchParams?.get('price') || 'all';
  const currentPage = isFallback ? 1 : Math.max(1, parseInt(searchParams?.get('page') || '1', 10));
  const itemsPerPage = 12;

  const [searchInput, setSearchInput] = useState(q);
  const [prevQ, setPrevQ] = useState(q);
  if (q !== prevQ) {
    setPrevQ(q);
    setSearchInput(q);
  }
  const [drawerOpen, setDrawerOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const filterButtonRef = useRef<HTMLButtonElement>(null);

  const showAdvancedFilters = initialProducts.length > ADVANCED_FILTER_THRESHOLD;

  const updateUrlParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams?.toString() || '');
      Object.entries(updates).forEach(([key, value]) => {
        if (!value || value === 'all' || (key === 'sort' && value === 'featured')) {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });
      // Reset to page 1 when filters/search change unless page itself is being updated
      if (!('page' in updates)) {
        params.delete('page');
      }
      const qs = params.toString();
      const nextUrl = `/marketplace${qs ? `?${qs}` : ''}`;
      window.history.replaceState(null, '', nextUrl);
    },
    [searchParams]
  );

  // Debounce search input -> URL `q`
  useEffect(() => {
    if (isFallback) return;
    const trimmed = searchInput.trim();
    if (trimmed === q) return;
    const timer = setTimeout(() => {
      updateUrlParams({ q: trimmed || null });
    }, 250);
    return () => clearTimeout(timer);
  }, [searchInput, q, isFallback, updateUrlParams]);

  // Drawer focus trap & Escape to close
  useEffect(() => {
    if (!drawerOpen) return;
    const prevFocused = document.activeElement as HTMLElement | null;
    const drawerEl = drawerRef.current;

    const focusables = drawerEl?.querySelectorAll<HTMLElement>(
      'button, [href], input, select, [tabindex]:not([tabindex="-1"])'
    );
    focusables?.[0]?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setDrawerOpen(false);
        return;
      }
      if (e.key === 'Tab' && focusables && focusables.length > 0) {
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      prevFocused?.focus?.();
    };
  }, [drawerOpen]);

  // Build real categories & platforms from products in data only
  const realCategories = useMemo(() => {
    const map = new Map<string, string>();
    for (const p of initialProducts) {
      if (p.category?.slug && p.category?.name) {
        map.set(p.category.slug, p.category.name);
      }
    }
    return Array.from(map.entries()).map(([slug, label]) => ({ slug, label }));
  }, [initialProducts]);

  const realPlatforms = useMemo(() => {
    const set = new Set<string>();
    for (const p of initialProducts) {
      if (Array.isArray(p.tech_stack)) {
        for (const t of p.tech_stack) {
          if (typeof t === 'string' && t.trim()) {
            set.add(t.trim());
          }
        }
      }
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [initialProducts]);

  // Strict filtering
  const qLower = q.toLowerCase();
  let filtered = initialProducts.filter((p) => {
    if (qLower) {
      const titleMatch = (p.title || '').toLowerCase().includes(qLower);
      const taglineMatch = (p.tagline || '').toLowerCase().includes(qLower);
      const techMatch =
        Array.isArray(p.tech_stack) &&
        p.tech_stack.some((t) => typeof t === 'string' && t.toLowerCase().includes(qLower));
      if (!titleMatch && !taglineMatch && !techMatch) {
        return false;
      }
    }

    if (category !== 'all' && p.category?.slug !== category) {
      return false;
    }

    if (showAdvancedFilters) {
      if (type === 'free' && !p.is_free) return false;
      if (type === 'paid' && p.is_free) return false;
      if (type === 'bundle' && !p.is_bundle) return false;

      if (tech !== 'all') {
        const hasTech =
          Array.isArray(p.tech_stack) &&
          p.tech_stack.some((t) => t.toLowerCase() === tech.toLowerCase());
        if (!hasTech) return false;
      }

      if (priceRange === 'free' && !p.is_free) return false;
      if (priceRange === 'under-1000' && (p.price_inr > 100000 || p.is_free)) return false;
      if (priceRange === '1000-3000' && (p.price_inr < 100000 || p.price_inr > 300000)) return false;
      if (priceRange === 'above-3000' && p.price_inr <= 300000) return false;
    }

    return true;
  });

  // Typo-tolerance fallback
  let isTypoFallback = false;
  if (filtered.length === 0 && qLower) {
    const fuzzyCandidates = initialProducts.filter((p) => {
      const titleFuzzy = isFuzzyMatch(qLower, p.title || '');
      const taglineFuzzy = isFuzzyMatch(qLower, p.tagline || '');
      const descFuzzy = isFuzzyMatch(qLower, p.description || '');
      const techFuzzy =
        Array.isArray(p.tech_stack) && p.tech_stack.some((t) => isFuzzyMatch(qLower, t));
      return titleFuzzy || taglineFuzzy || descFuzzy || techFuzzy;
    });

    if (fuzzyCandidates.length > 0) {
      filtered = fuzzyCandidates;
      isTypoFallback = true;
    }
  }

  // Sort products
  filtered = [...filtered].sort((a, b) => {
    if (sort === 'price-low') return a.price_inr - b.price_inr;
    if (sort === 'price-high') return b.price_inr - a.price_inr;
    if (sort === 'rating') return b.rating_avg - a.rating_avg;
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

  // Active filters list for chips & count badge
  const activeFilters: { key: string; label: string }[] = [];
  if (q) activeFilters.push({ key: 'q', label: `Search: "${q}"` });
  if (category !== 'all') {
    const catName = realCategories.find((c) => c.slug === category)?.label || category;
    activeFilters.push({ key: 'category', label: `Category: ${catName}` });
  }
  if (showAdvancedFilters && type !== 'all') {
    activeFilters.push({ key: 'type', label: `Type: ${type}` });
  }
  if (showAdvancedFilters && tech !== 'all') {
    activeFilters.push({ key: 'tech', label: `Platform: ${tech}` });
  }
  if (showAdvancedFilters && priceRange !== 'all') {
    activeFilters.push({ key: 'price', label: `Price: ${priceRange}` });
  }

  const clearAllFilters = () => {
    setSearchInput('');
    router.replace('/marketplace', { scroll: false });
  };

  const count = initialProducts.length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-[calc(var(--header-height)+1.5rem)] pb-16">
      {/* Page Heading */}
      <header className="mb-6">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-[var(--text-secondary)] mb-2">
          <Link href="/" className="hover:text-[var(--text-primary)] transition-colors">
            Home
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-[var(--text-primary)] font-semibold">Marketplace</span>
        </nav>

        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--text-primary)] text-balance">
          Marketplace
        </h1>

        <p className="text-base text-[var(--text-secondary)] mt-2 max-w-2xl text-pretty">
          {count} {count === 1 ? 'product' : 'products'} available.{' '}
          <Link
            href="/license"
            className="underline underline-offset-4 text-[var(--text-primary)] hover:text-[var(--brand)] transition-colors"
          >
            Licence details
          </Link>
        </p>
      </header>

      {/* Search & Filter Controls */}
      <section aria-label="Search and filters" className="bg-[var(--surface)] p-4 rounded-2xl border border-[var(--border)] mb-6 space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Single Source of Truth Search Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              updateUrlParams({ q: searchInput.trim() || null });
            }}
            className="relative w-full md:max-w-md"
          >
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)] pointer-events-none" aria-hidden="true" />
            <input
              id="marketplace-search"
              ref={searchRef}
              type="search"
              name="q"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  if (searchInput) {
                    e.preventDefault();
                    setSearchInput('');
                    updateUrlParams({ q: null });
                  } else {
                    searchRef.current?.blur();
                  }
                }
              }}
              placeholder="Search products"
              aria-label="Search products"
              className="w-full pl-10 pr-9 py-2.5 bg-[var(--bg)] border border-[var(--border)] rounded-xl text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput('');
                  updateUrlParams({ q: null });
                  searchRef.current?.focus();
                }}
                aria-label="Clear search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </form>

          {/* Right Controls: Mobile Filters Button + Desktop Dropdowns */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Mobile Filters Drawer Trigger */}
            <button
              ref={filterButtonRef}
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-label={`Open filters${activeFilters.length > 0 ? ` (${activeFilters.length} active)` : ''}`}
              className="md:hidden inline-flex items-center gap-2 px-3.5 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-xl text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
            >
              <SlidersHorizontal className="w-4 h-4" aria-hidden="true" />
              <span>Filters</span>
              {activeFilters.length > 0 && (
                <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-[var(--brand)] text-[var(--text-on-brand)] text-xs font-bold inline-flex items-center justify-center">
                  {activeFilters.length}
                </span>
              )}
            </button>

            {/* Desktop Advanced Filters (> 8 products) */}
            {showAdvancedFilters && (
              <>
                <div className="hidden md:flex items-center gap-2">
                  <label htmlFor="filter-price" className="text-sm font-medium text-[var(--text-secondary)]">
                    Price
                  </label>
                  <select
                    id="filter-price"
                    value={priceRange}
                    onChange={(e) => updateUrlParams({ price: e.target.value })}
                    className="bg-[var(--bg)] border border-[var(--border)] text-sm rounded-xl px-3 py-2 text-[var(--text-primary)] font-medium focus:outline-none focus:ring-2 focus:ring-[var(--brand)] cursor-pointer"
                  >
                    <option value="all">All prices</option>
                    <option value="free">Free</option>
                    <option value="under-1000">Under ₹1,000</option>
                    <option value="1000-3000">₹1,000 – ₹3,000</option>
                    <option value="above-3000">Above ₹3,000</option>
                  </select>
                </div>

                <div className="hidden md:flex items-center gap-2">
                  <label htmlFor="filter-type" className="text-sm font-medium text-[var(--text-secondary)]">
                    Type
                  </label>
                  <select
                    id="filter-type"
                    value={type}
                    onChange={(e) => updateUrlParams({ type: e.target.value })}
                    className="bg-[var(--bg)] border border-[var(--border)] text-sm rounded-xl px-3 py-2 text-[var(--text-primary)] font-medium focus:outline-none focus:ring-2 focus:ring-[var(--brand)] cursor-pointer"
                  >
                    <option value="all">All types</option>
                    <option value="paid">Paid</option>
                    <option value="free">Free</option>
                    <option value="bundle">Bundle</option>
                  </select>
                </div>
              </>
            )}

            {/* Sort Control (Always visible) */}
            <div className="flex items-center gap-2">
              <label htmlFor="filter-sort" className="text-sm font-medium text-[var(--text-secondary)]">
                Sort
              </label>
              <select
                id="filter-sort"
                value={sort}
                onChange={(e) => updateUrlParams({ sort: e.target.value })}
                className="bg-[var(--bg)] border border-[var(--border)] text-sm rounded-xl px-3 py-2 text-[var(--text-primary)] font-medium focus:outline-none focus:ring-2 focus:ring-[var(--brand)] cursor-pointer"
              >
                <option value="featured">Sort: Featured</option>
                <option value="price-low">Sort: Price low to high</option>
                <option value="price-high">Sort: Price high to low</option>
                <option value="rating">Sort: Highest rated</option>
              </select>
            </div>
          </div>
        </div>

        {/* Category Chips (Only shown if > 1 real category exists) */}
        {realCategories.length > 1 && (
          <div className="hidden md:block pt-2 border-t border-[var(--border)] space-y-2">
            <span className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
              Category
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => updateUrlParams({ category: null })}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  category === 'all'
                    ? 'bg-[var(--surface-inverted)] text-[var(--text-inverted)]'
                    : 'bg-[var(--bg)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border)]'
                }`}
              >
                All categories
              </button>
              {realCategories.map((cat) => {
                const isActive = category === cat.slug;
                return (
                  <button
                    key={cat.slug}
                    type="button"
                    onClick={() => updateUrlParams({ category: isActive ? null : cat.slug })}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-[var(--surface-inverted)] text-[var(--text-inverted)]'
                        : 'bg-[var(--bg)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border)]'
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Platform / Technology Chips (Only when > 8 products and platforms exist) */}
        {showAdvancedFilters && realPlatforms.length > 0 && (
          <div className="hidden md:block pt-2 border-t border-[var(--border)] space-y-2">
            <span className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
              Platform
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => updateUrlParams({ tech: null })}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  tech === 'all'
                    ? 'bg-[var(--surface-inverted)] text-[var(--text-inverted)]'
                    : 'bg-[var(--bg)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border)]'
                }`}
              >
                All platforms
              </button>
              {realPlatforms.map((platform) => {
                const isActive = tech.toLowerCase() === platform.toLowerCase();
                return (
                  <button
                    key={platform}
                    type="button"
                    onClick={() => updateUrlParams({ tech: isActive ? null : platform })}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-[var(--brand)] text-[var(--text-on-brand)]'
                        : 'bg-[var(--bg)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border)]'
                    }`}
                  >
                    {platform}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* Mobile Filter Drawer */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-50 md:hidden bg-black/50 backdrop-blur-xs flex items-end"
          onClick={() => setDrawerOpen(false)}
        >
          <div
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Filter products"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-h-[85vh] overflow-y-auto bg-[var(--surface)] border-t border-[var(--border)] rounded-t-2xl p-5 space-y-5 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
              <h2 className="text-base font-bold text-[var(--text-primary)]">Filters</h2>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="Close filters"
                className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-2)] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {realCategories.length > 1 && (
              <div className="space-y-2">
                <span className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                  Category
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => updateUrlParams({ category: null })}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium cursor-pointer ${
                      category === 'all'
                        ? 'bg-[var(--surface-inverted)] text-[var(--text-inverted)]'
                        : 'bg-[var(--bg)] text-[var(--text-secondary)] border border-[var(--border)]'
                    }`}
                  >
                    All categories
                  </button>
                  {realCategories.map((cat) => {
                    const isActive = category === cat.slug;
                    return (
                      <button
                        key={cat.slug}
                        type="button"
                        onClick={() => updateUrlParams({ category: isActive ? null : cat.slug })}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium cursor-pointer ${
                          isActive
                            ? 'bg-[var(--surface-inverted)] text-[var(--text-inverted)]'
                            : 'bg-[var(--bg)] text-[var(--text-secondary)] border border-[var(--border)]'
                        }`}
                      >
                        {cat.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {showAdvancedFilters && (
              <>
                <div className="space-y-1.5">
                  <label htmlFor="mobile-filter-price" className="block text-sm font-medium text-[var(--text-secondary)]">
                    Price
                  </label>
                  <select
                    id="mobile-filter-price"
                    value={priceRange}
                    onChange={(e) => updateUrlParams({ price: e.target.value })}
                    className="w-full bg-[var(--bg)] border border-[var(--border)] text-sm rounded-xl px-3 py-2.5 text-[var(--text-primary)]"
                  >
                    <option value="all">All prices</option>
                    <option value="free">Free</option>
                    <option value="under-1000">Under ₹1,000</option>
                    <option value="1000-3000">₹1,000 – ₹3,000</option>
                    <option value="above-3000">Above ₹3,000</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="mobile-filter-type" className="block text-sm font-medium text-[var(--text-secondary)]">
                    Type
                  </label>
                  <select
                    id="mobile-filter-type"
                    value={type}
                    onChange={(e) => updateUrlParams({ type: e.target.value })}
                    className="w-full bg-[var(--bg)] border border-[var(--border)] text-sm rounded-xl px-3 py-2.5 text-[var(--text-primary)]"
                  >
                    <option value="all">All types</option>
                    <option value="paid">Paid</option>
                    <option value="free">Free</option>
                    <option value="bundle">Bundle</option>
                  </select>
                </div>

                {realPlatforms.length > 0 && (
                  <div className="space-y-2">
                    <span className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                      Platform
                    </span>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => updateUrlParams({ tech: null })}
                        className={`px-3 py-1 rounded-lg text-sm font-medium cursor-pointer ${
                          tech === 'all'
                            ? 'bg-[var(--surface-inverted)] text-[var(--text-inverted)]'
                            : 'bg-[var(--bg)] text-[var(--text-secondary)] border border-[var(--border)]'
                        }`}
                      >
                        All platforms
                      </button>
                      {realPlatforms.map((platform) => {
                        const isActive = tech.toLowerCase() === platform.toLowerCase();
                        return (
                          <button
                            key={platform}
                            type="button"
                            onClick={() => updateUrlParams({ tech: isActive ? null : platform })}
                            className={`px-3 py-1 rounded-lg text-sm font-medium cursor-pointer ${
                              isActive
                                ? 'bg-[var(--brand)] text-[var(--text-on-brand)]'
                                : 'bg-[var(--bg)] text-[var(--text-secondary)] border border-[var(--border)]'
                            }`}
                          >
                            {platform}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}

            <div className="flex items-center justify-between gap-3 pt-3 border-t border-[var(--border)]">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  clearAllFilters();
                  setDrawerOpen(false);
                }}
                className="flex-1 text-sm"
              >
                Clear all
              </Button>
              <Button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="flex-1 text-sm"
              >
                Apply
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Typo-Tolerance Notice */}
      {isTypoFallback && (
        <div className="p-3 mb-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] text-sm text-[var(--text-primary)] flex items-center justify-between">
          <span>
            No exact matches for &quot;<strong>{q}</strong>&quot;. Showing closest matches:
          </span>
          <button
            type="button"
            onClick={clearAllFilters}
            className="underline font-semibold ml-2 text-[var(--brand)] cursor-pointer"
          >
            Clear filters
          </button>
        </div>
      )}

      {/* Removable Active Filter Chips */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <span className="text-sm text-[var(--text-secondary)] mr-1">
            {totalItems} {totalItems === 1 ? 'result' : 'results'}
          </span>
          {activeFilters.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => {
                if (f.key === 'q') setSearchInput('');
                updateUrlParams({ [f.key]: null });
              }}
              aria-label={`Remove ${f.label}`}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-sm text-[var(--text-primary)] hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
            >
              <span>{f.label}</span>
              <X className="w-3.5 h-3.5 text-[var(--text-secondary)]" aria-hidden="true" />
            </button>
          ))}
          <button
            type="button"
            onClick={clearAllFilters}
            className="text-sm font-semibold text-[var(--brand)] hover:underline ml-1 cursor-pointer"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Products Grid */}
      {paginatedProducts.length === 0 ? (
        <div className="p-12 sm:p-16 rounded-2xl bg-[var(--surface)] border border-[var(--border)] text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-[var(--bg)] border border-[var(--border)] flex items-center justify-center text-[var(--brand)] mx-auto">
            <PackageX className="w-7 h-7" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[var(--text-primary)]">
              {q ? `No products found for "${q}"` : 'No products found'}
            </h2>
            <p className="text-sm text-[var(--text-secondary)] mt-1 max-w-md mx-auto">
              {q || activeFilters.length > 0
                ? 'Try adjusting your search or clearing the active filters.'
                : 'No products are published yet.'}
            </p>
          </div>

          {activeFilters.length > 0 && (
            <div className="pt-1">
              <Button type="button" variant="outline" onClick={clearAllFilters} className="text-sm h-10 rounded-xl">
                Clear filters
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
        <nav aria-label="Pagination" className="mt-12 flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }).map((_, idx) => {
            const pageNum = idx + 1;
            const isCurrent = pageNum === currentPage;
            return (
              <button
                key={pageNum}
                type="button"
                onClick={() => updateUrlParams({ page: String(pageNum) })}
                aria-current={isCurrent ? 'page' : undefined}
                className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold transition-colors cursor-pointer ${
                  isCurrent
                    ? 'bg-[var(--surface-inverted)] text-[var(--text-inverted)]'
                    : 'bg-[var(--surface)] text-[var(--text-secondary)] border border-[var(--border)] hover:text-[var(--text-primary)]'
                }`}
              >
                {pageNum}
              </button>
            );
          })}
        </nav>
      )}

      <RecentlyViewedShelf />
    </div>
  );
}
