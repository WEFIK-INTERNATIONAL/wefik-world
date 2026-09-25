import React from 'react';
import Link from 'next/link';
import { Check, X, Shield, ArrowRight, Star, HelpCircle, Layers, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/marketplace/product-card';
import { ProductData } from '@/lib/data/products';
import { ProgrammaticPageData } from '@/lib/seo/programmatic-data';

interface ProgrammaticPageViewProps {
  data: ProgrammaticPageData;
  products: ProductData[];
  canonicalUrl: string;
  categoryLabel?: string;
}

export function ProgrammaticPageView({
  data,
  products,
  canonicalUrl,
  categoryLabel,
}: ProgrammaticPageViewProps) {
  const matchingProducts = products.filter((p) => {
    if (data.freeOnly && !p.is_free) return false;
    if (data.priceFilterMax && p.price_inr > data.priceFilterMax) return false;
    if (data.targetCategory) {
      const pCat = p.category?.slug || '';
      return pCat === data.targetCategory || (data.targetCategory === 'plugins' && pCat.includes('plugin'));
    }
    return true;
  });

  // Fallback to at least 2 real products from catalog if narrow filter produces <2
  const displayProducts = matchingProducts.length >= 1 ? matchingProducts : products.slice(0, 3);

  return (
    <div className="w-full min-h-screen py-12 bg-soft border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs text-slate mb-6 flex-wrap">
          <Link href="/" className="hover:text-ink transition-colors">Home</Link>
          <span>/</span>
          {data.parentHub ? (
            <>
              <Link href={data.parentHub.url} className="hover:text-ink transition-colors">
                {data.parentHub.label}
              </Link>
              <span>/</span>
            </>
          ) : categoryLabel ? (
            <>
              <Link href="/marketplace" className="hover:text-ink transition-colors">
                Marketplace
              </Link>
              <span>/</span>
            </>
          ) : null}
          <span className="text-ink font-semibold">{data.h1}</span>
        </nav>

        {/* 1. Header Section */}
        <div className="bg-[var(--surface)] rounded-3xl p-8 sm:p-12 border border-border shadow-xs mb-10">
          <div className="max-w-4xl">
            <span className="inline-block text-xs font-bold uppercase tracking-wider text-deep-green mb-2 px-3 py-1 rounded-full bg-lime/20">
              Verified Marketplace Catalog
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-ink tracking-tight mb-6">
              {data.h1}
            </h1>
            <p className="text-sm sm:text-base text-slate leading-relaxed font-normal mb-8">
              {data.intro}
            </p>

            {/* AI Key Facts Box */}
            <div className="p-4 sm:p-5 rounded-2xl bg-soft border border-border">
              <h3 className="text-xs font-bold uppercase tracking-wider text-ink mb-2">
                Quick Facts & Key Specifications
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs text-slate">
                <div>• <strong>License:</strong> Single & Unlimited Commercial</div>
                <div>• <strong>Performance:</strong> 95+ PageSpeed Guarantee</div>
                <div>• <strong>Updates:</strong> Free Lifetime Version Access</div>
                <div>• <strong>Code Quality:</strong> Zero Page-Builder Bloat</div>
                <div>• <strong>Payments:</strong> Instant UPI & Cards (INR)</div>
                <div>• <strong>Support:</strong> Direct In-House Engineers</div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Competitor Comparison Table (if applicable) */}
        {data.competitorComparison && (
          <div className="bg-[var(--surface)] rounded-3xl p-6 sm:p-8 border border-border shadow-xs mb-10 overflow-x-auto">
            <div className="mb-6">
              <span className="text-xs font-bold uppercase tracking-wider text-deep-green">
                Head-to-Head Analysis
              </span>
              <h2 className="text-2xl font-bold text-ink mt-1">
                Wefik.world vs. {data.competitorComparison.competitorName}
              </h2>
            </div>

            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border text-slate uppercase tracking-wider font-semibold">
                  <th className="py-3 pr-4">Evaluation Factor</th>
                  <th className="py-3 px-4 text-center">{data.competitorComparison.competitorName}</th>
                  <th className="py-3 px-4 text-center bg-lime/10 text-deep-green font-bold rounded-t-xl">
                    Wefik.world Alternative
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-ink">
                {data.competitorComparison.comparisonRows.map((row, idx) => (
                  <tr key={idx}>
                    <td className="py-3.5 pr-4 font-medium">{row.criteria}</td>
                    <td className="py-3.5 px-4 text-center text-slate">{row.competitor}</td>
                    <td className="py-3.5 px-4 text-center bg-lime/10 font-bold text-deep-green">
                      {row.ourProduct}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 3. Real Product Catalog Grid */}
        <div className="mb-14">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-ink">
                Recommended Products & Starters ({displayProducts.length})
              </h2>
              <p className="text-xs text-slate mt-1">
                Live products from our verified catalog with instant downloads.
              </p>
            </div>
            <Button asChild variant="outline" size="sm" className="rounded-xl text-xs">
              <Link href="/marketplace">View Full Catalog</Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayProducts.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        </div>

        {/* 4. Sibling & Internal Linking Module (Quotas: ≥5 Out / ≥3 In) */}
        <div className="bg-[var(--surface)] rounded-3xl p-6 sm:p-8 border border-border shadow-xs mb-10">
          <h3 className="text-sm font-bold uppercase tracking-wider text-ink mb-4">
            Related Collections & Hubs
          </h3>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/wordpress-themes"
              className="px-3 py-1.5 rounded-xl bg-soft border border-border text-xs font-semibold text-ink hover:border-deep-green transition-colors"
            >
              WordPress Themes
            </Link>
            <Link
              href="/wordpress-plugins"
              className="px-3 py-1.5 rounded-xl bg-soft border border-border text-xs font-semibold text-ink hover:border-deep-green transition-colors"
            >
              WordPress Plugins
            </Link>
            <Link
              href="/html-templates"
              className="px-3 py-1.5 rounded-xl bg-soft border border-border text-xs font-semibold text-ink hover:border-deep-green transition-colors"
            >
              HTML Templates
            </Link>
            <Link
              href="/bundles"
              className="px-3 py-1.5 rounded-xl bg-soft border border-border text-xs font-semibold text-deep-green hover:border-deep-green transition-colors"
            >
              Agency Super-Bundles (60% Off)
            </Link>
            <Link
              href="/pricing"
              className="px-3 py-1.5 rounded-xl bg-soft border border-border text-xs font-semibold text-ink hover:border-deep-green transition-colors"
            >
              All-Access Memberships
            </Link>
            <Link
              href="/freebies"
              className="px-3 py-1.5 rounded-xl bg-soft border border-border text-xs font-semibold text-ink hover:border-deep-green transition-colors"
            >
              100% Free Products
            </Link>
            {data.siblingLinks?.map((sibling, idx) => (
              <Link
                key={idx}
                href={sibling.url}
                className="px-3 py-1.5 rounded-xl bg-soft border border-border text-xs font-semibold text-ink hover:border-deep-green transition-colors"
              >
                {sibling.label}
              </Link>
            ))}
          </div>
        </div>

        {/* 5. Frequently Asked Questions Section + FAQPage Schema */}
        {data.faqs && data.faqs.length > 0 && (
          <div className="bg-[var(--surface)] rounded-3xl p-6 sm:p-10 border border-border shadow-xs mb-10">
            <div className="mb-8">
              <span className="text-xs font-bold uppercase tracking-wider text-deep-green">
                Got Questions?
              </span>
              <h2 className="text-2xl font-bold text-ink mt-1">Frequently Asked Questions</h2>
            </div>

            <div className="space-y-4">
              {data.faqs.map((faq, idx) => (
                <details
                  key={idx}
                  className="group p-5 rounded-2xl bg-soft border border-border transition-all"
                >
                  <summary className="font-bold text-sm text-ink cursor-pointer list-none flex items-center justify-between">
                    <span>{faq.q}</span>
                    <span className="text-deep-green font-bold text-lg transition-transform group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="text-xs text-slate mt-3 leading-relaxed">
                    {faq.a}
                  </p>
                </details>
              ))}
            </div>

            {/* FAQPage JSON-LD */}
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                  "@context": "https://schema.org",
                  "@type": "FAQPage",
                  mainEntity: data.faqs.map((f) => ({
                    "@type": "Question",
                    name: f.q,
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: f.a,
                    },
                  })),
                }),
              }}
            />
          </div>
        )}

        {/* BreadcrumbList JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              itemListElement: [
                {
                  "@type": "ListItem",
                  position: 1,
                  name: "Home",
                  item: "https://wefik.world",
                },
                {
                  "@type": "ListItem",
                  position: 2,
                  name: data.h1,
                  item: canonicalUrl,
                },
              ],
            }),
          }}
        />

        {/* ItemList JSON-LD for products */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ItemList",
              name: data.h1,
              itemListElement: displayProducts.map((p, idx) => ({
                "@type": "ListItem",
                position: idx + 1,
                name: p.title,
                url: `https://wefik.world/products/${p.slug}`,
              })),
            }),
          }}
        />
      </div>
    </div>
  );
}
