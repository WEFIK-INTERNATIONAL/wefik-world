import { unstable_cache } from 'next/cache';
import { createStaticClient } from '@/lib/supabase/static';
import { type ProductData, FALLBACK_PRODUCTS } from './fallback-products';

export type { ProductData };
export { FALLBACK_PRODUCTS };

/**
 * P0-1 FIX — Single normalization boundary for raw Supabase product rows.
 *
 * Root cause: the previous code used `as unknown as ProductData[]` which
 * defeated TypeScript's strict null checks entirely. Any null field from the
 * DB (tagline, tech_stack, gallery_urls, category) passed through unchecked
 * and crashed at runtime when consumer code called .toLowerCase() or .some().
 *
 * This function replaces the unsafe cast with validated parsing.
 * Every nullable field gets a safe default. Consumer code can trust that
 * ProductData fields are always present and correctly typed.
 *
 * Schema note: tagline, tech_stack should be NOT NULL in the DB with
 * backfilled defaults. Until that migration runs, this normalizer catches
 * any nulls at read-time as a safety net.
 */
function normalizeProduct(raw: Record<string, unknown>): ProductData {
  const category = raw.category;
  let normalizedCategory: ProductData['category'] = null;

  if (category && typeof category === 'object' && !Array.isArray(category)) {
    const cat = category as Record<string, unknown>;
    normalizedCategory = {
      id: String(cat.id ?? ''),
      name: String(cat.name ?? 'Uncategorized'),
      slug: String(cat.slug ?? 'uncategorized'),
    };
  } else if (Array.isArray(category) && category.length > 0) {
    const cat = category[0] as Record<string, unknown>;
    normalizedCategory = {
      id: String(cat.id ?? ''),
      name: String(cat.name ?? 'Uncategorized'),
      slug: String(cat.slug ?? 'uncategorized'),
    };
  }

  return {
    id: String(raw.id ?? ''),
    title: String(raw.title ?? 'Untitled Product'),
    slug: String(raw.slug ?? ''),
    tagline: String(raw.tagline ?? ''),
    description: String(raw.description ?? ''),
    price_inr: typeof raw.price_inr === 'number' ? raw.price_inr : 0,
    is_free: Boolean(raw.is_free),
    is_featured: Boolean(raw.is_featured),
    is_bundle: Boolean(raw.is_bundle),
    bundle_product_ids: Array.isArray(raw.bundle_product_ids)
      ? raw.bundle_product_ids.map(String)
      : [],
    thumbnail_url: String(raw.thumbnail_url ?? ''),
    gallery_urls: Array.isArray(raw.gallery_urls)
      ? raw.gallery_urls.filter((u): u is string => typeof u === 'string')
      : [],
    demo_url: raw.demo_url ? String(raw.demo_url) : undefined,
    tech_stack: Array.isArray(raw.tech_stack)
      ? raw.tech_stack.filter((t): t is string => typeof t === 'string')
      : [],
    rating_avg: typeof raw.rating_avg === 'number' ? raw.rating_avg : 0,
    rating_count: typeof raw.rating_count === 'number' ? raw.rating_count : 0,
    download_count: typeof raw.download_count === 'number' ? raw.download_count : 0,
    category: normalizedCategory,
    created_at: raw.created_at ? String(raw.created_at) : undefined,
    updated_at: raw.updated_at ? String(raw.updated_at) : undefined,
    primary_use_case: raw.primary_use_case ? String(raw.primary_use_case) : undefined,
    seo_title: raw.seo_title ? String(raw.seo_title) : undefined,
    seo_description: raw.seo_description ? String(raw.seo_description) : undefined,
  };
}

function withTimeout<T>(promise: PromiseLike<T>, timeoutMs = 2500): Promise<T> {
  return Promise.race([
    Promise.resolve(promise),
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Supabase query timed out after ${timeoutMs}ms`)), timeoutMs)
    ),
  ]);
}

function isPlaceholderConfig(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return !url || url.includes('placeholder-project.supabase.co');
}

/**
 * Fetch products from Supabase with fallback to catalog
 */
async function fetchProductsInternal(optionsKey: string): Promise<ProductData[]> {
  const options = optionsKey ? JSON.parse(optionsKey) : undefined;
  if (isPlaceholderConfig()) {
    return filterFallback(options);
  }

  try {
    const supabase = createStaticClient();
    let query = supabase
      .from('products')
      .select(`
        id,
        title,
        slug,
        tagline,
        description,
        price_inr,
        is_free,
        is_featured,
        is_bundle,
        bundle_product_ids,
        thumbnail_url,
        gallery_urls,
        demo_url,
        tech_stack,
        rating_avg,
        rating_count,
        download_count,
        category:categories(id, name, slug)
      `)
      .eq('status', 'published');

    if (options?.featuredOnly) {
      query = query.eq('is_featured', true);
    }
    if (options?.isFree !== undefined) {
      query = query.eq('is_free', options.isFree);
    }
    if (options?.isBundle !== undefined) {
      query = query.eq('is_bundle', options.isBundle);
    }
    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await withTimeout(query, 2500);
    if (error || !data || data.length === 0) {
      return filterFallback(options);
    }

    // P0-1: validated parsing instead of unsafe `as unknown as ProductData[]`
    return data.map((row) => normalizeProduct(row as Record<string, unknown>));
  } catch {
    return filterFallback(options);
  }
}

const getCachedProducts = unstable_cache(
  async (key: string) => fetchProductsInternal(key),
  ['products-catalog-cache'],
  { revalidate: 3600, tags: ['products'] }
);

/**
 * Fetch products from Supabase with fallback to catalog (cached via ISR/unstable_cache)
 */
export async function getProducts(options?: {
  featuredOnly?: boolean;
  categorySlug?: string;
  isFree?: boolean;
  isBundle?: boolean;
  limit?: number;
}): Promise<ProductData[]> {
  const key = options ? JSON.stringify(options) : '';
  const products = await getCachedProducts(key);
  if (options?.categorySlug) {
    return products.filter((p) => p.category?.slug === options.categorySlug);
  }
  return products;
}

async function fetchProductBySlugInternal(slug: string): Promise<ProductData | null> {
  if (isPlaceholderConfig()) {
    return FALLBACK_PRODUCTS.find((p) => p.slug === slug) || null;
  }

  try {
    const supabase = createStaticClient();
    const query = supabase
      .from('products')
      .select(`
        id,
        title,
        slug,
        tagline,
        description,
        price_inr,
        is_free,
        is_featured,
        is_bundle,
        bundle_product_ids,
        thumbnail_url,
        gallery_urls,
        demo_url,
        tech_stack,
        rating_avg,
        rating_count,
        download_count,
        category:categories(id, name, slug),
        versions:product_versions(version, changelog, is_latest, created_at)
      `)
      .eq('slug', slug)
      .eq('status', 'published')
      .single();

    const { data, error } = await withTimeout(query, 2500);
    if (error || !data) {
      return FALLBACK_PRODUCTS.find((p) => p.slug === slug) || null;
    }

    // P0-1: validated parsing instead of unsafe `as any` cast
    return normalizeProduct(data as Record<string, unknown>);
  } catch {
    return FALLBACK_PRODUCTS.find((p) => p.slug === slug) || null;
  }
}

const getCachedProductBySlug = unstable_cache(
  async (slug: string) => fetchProductBySlugInternal(slug),
  ['product-single-detail-cache'],
  { revalidate: 3600, tags: ['products'] }
);

/**
 * Fetch single product by slug (cached via ISR/unstable_cache)
 */
export async function getProductBySlug(slug: string): Promise<ProductData | null> {
  return getCachedProductBySlug(slug);
}

function filterFallback(options?: {
  featuredOnly?: boolean;
  categorySlug?: string;
  isFree?: boolean;
  isBundle?: boolean;
  limit?: number;
}): ProductData[] {
  let list = [...FALLBACK_PRODUCTS];

  if (options?.featuredOnly) {
    list = list.filter((p) => p.is_featured);
  }
  if (options?.isFree !== undefined) {
    list = list.filter((p) => p.is_free === options.isFree);
  }
  if (options?.isBundle !== undefined) {
    list = list.filter((p) => p.is_bundle === options.isBundle);
  }
  if (options?.categorySlug) {
    list = list.filter((p) => p.category?.slug === options.categorySlug);
  }
  if (options?.limit) {
    list = list.slice(0, options.limit);
  }

  return list;
}

