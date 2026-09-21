import { createClient } from '@/lib/supabase/server';
import { type ProductData, FALLBACK_PRODUCTS } from './fallback-products';

export type { ProductData };
export { FALLBACK_PRODUCTS };

/**
 * Fetch products from Supabase with fallback to catalog
 */
export async function getProducts(options?: {
  featuredOnly?: boolean;
  categorySlug?: string;
  isFree?: boolean;
  isBundle?: boolean;
  limit?: number;
}): Promise<ProductData[]> {
  try {
    const supabase = await createClient();
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

    const { data, error } = await query;
    if (error || !data || data.length === 0) {
      return filterFallback(options);
    }

    return (data as unknown as ProductData[]).map((p) => ({
      ...p,
      category: Array.isArray(p.category) ? p.category[0] : p.category,
    }));
  } catch {
    return filterFallback(options);
  }
}

/**
 * Fetch single product by slug
 */
export async function getProductBySlug(slug: string): Promise<ProductData | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
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

    if (error || !data) {
      return FALLBACK_PRODUCTS.find((p) => p.slug === slug) || null;
    }

    const raw = data as any;
    return {
      ...(raw as ProductData),
      category: Array.isArray(raw?.category) ? raw.category[0] : raw?.category,
    };
  } catch {
    return FALLBACK_PRODUCTS.find((p) => p.slug === slug) || null;
  }
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
