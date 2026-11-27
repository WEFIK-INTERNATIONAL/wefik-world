export interface ProductData {
  id: string;
  title: string;
  slug: string;
  tagline: string;
  description: string;
  price_inr: number;
  is_free: boolean;
  is_featured: boolean;
  is_bundle: boolean;
  bundle_product_ids?: string[];
  thumbnail_url: string;
  gallery_urls?: string[];
  demo_url?: string;
  tech_stack: string[];
  rating_avg: number;
  rating_count: number;
  download_count: number;
  category?: {
    id?: string;
    name: string;
    slug: string;
  } | null;
  versions?: {
    version: string;
    changelog: string;
    is_latest: boolean;
    created_at: string;
  }[];
  created_at?: string;
  updated_at?: string;
  primary_use_case?: string;
  seo_title?: string;
  seo_description?: string;
}

/**
 * Fallback product list when Supabase is unavailable or unseeded.
 * Kept empty so no demo or fake products are ever shown in production.
 */
export const FALLBACK_PRODUCTS: ProductData[] = [];
