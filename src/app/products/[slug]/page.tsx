import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Metadata } from 'next';
import { getProductBySlug, getProducts } from '@/lib/data/products';
import { ProductDetailView } from '@/components/marketplace/product-detail-view';
import { ProductCard } from '@/components/marketplace/product-card';
import { ArrowLeft } from 'lucide-react';

export const revalidate = 3600;

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((p) => ({
    slug: p.slug,
  }));
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: 'Product Not Found',
    };
  }

  const categoryName = product.category?.name || (product.is_bundle ? 'Bundle' : 'Digital Product');
  const priceFormatted = product.is_free ? 'Free' : `₹${Math.round(product.price_inr / 100)}`;
  const primaryUseCase = product.primary_use_case || 'Agencies & Professionals';
  const fallbackTitle = `${product.title} – ${categoryName} for ${primaryUseCase} | Wefik.world`;
  const fallbackDescription = `${product.tagline || product.title}. Single & unlimited licenses from ${priceFormatted}. Instant download, lifetime updates.`;

  const title = product.seo_title || fallbackTitle;
  const description = product.seo_description || fallbackDescription;
  const canonicalUrl = `https://wefik.world/products/${product.slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      images: [{ url: product.thumbnail_url }],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [product.thumbnail_url],
    },
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  // Fetch related products from same category or fallback
  const allProducts = await getProducts();
  const relatedProducts = allProducts
    .filter((p) => p.id !== product.id && p.category?.slug === product.category?.slug)
    .slice(0, 3);

  // Fallback if less than 3 in category
  const fillProducts =
    relatedProducts.length < 3
      ? allProducts.filter((p) => p.id !== product.id).slice(0, 3)
      : relatedProducts;

  // JSON-LD Schemas
  const productJsonLd = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: product.title,
    image: [product.thumbnail_url, ...(product.gallery_urls || [])],
    description: product.tagline,
    sku: product.id,
    brand: {
      '@type': 'Brand',
      name: 'Wefik World',
    },
    offers: {
      '@type': 'Offer',
      url: `https://wefik.world/products/${product.slug}`,
      priceCurrency: 'INR',
      price: (product.price_inr / 100).toFixed(2),
      availability: 'https://schema.org/InStock',
    },
    ...(product.rating_count > 0
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: product.rating_avg.toFixed(1),
            reviewCount: product.rating_count,
          },
        }
      : {}),
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://wefik.world',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Marketplace',
        item: 'https://wefik.world/marketplace',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: product.title,
        item: `https://wefik.world/products/${product.slug}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {/* Breadcrumb Navigation */}
        <div className="mb-8 flex items-center justify-between">
          <Link
            href="/marketplace"
            className="inline-flex items-center gap-1.5 text-xs text-slate hover:text-ink font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Marketplace</span>
          </Link>

          <div className="flex items-center gap-2 text-xs text-slate">
            <Link href="/" className="hover:text-ink">Home</Link>
            <span>/</span>
            <Link href="/marketplace" className="hover:text-ink">Marketplace</Link>
            <span>/</span>
            <span className="text-[var(--text-primary)] font-bold truncate max-w-[160px] sm:max-w-[280px] md:max-w-[400px] inline-block align-bottom" title={product.title}>{product.title}</span>
          </div>
        </div>

        {/* Interactive Client Product View */}
        <ProductDetailView product={product} />

        {/* Related Products Grid */}
        <div className="mt-20 pt-12 border-t border-border space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-extrabold text-ink tracking-tight">
                Related Digital Products
              </h2>
              <p className="text-xs text-slate mt-1">
                More tools and templates designed to complement {product.title}.
              </p>
            </div>
            <Link
              href="/marketplace"
              className="text-xs font-bold text-deep-green hover:underline"
            >
              Browse All Products
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {fillProducts.map((rel) => (
              <ProductCard
                key={rel.id}
                id={rel.id}
                title={rel.title}
                slug={rel.slug}
                tagline={rel.tagline}
                price_inr={rel.price_inr}
                is_free={rel.is_free}
                is_featured={rel.is_featured}
                is_bundle={rel.is_bundle}
                thumbnail_url={rel.thumbnail_url}
                category={rel.category}
                rating_avg={rel.rating_avg}
                rating_count={rel.rating_count}
                tech_stack={rel.tech_stack}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
