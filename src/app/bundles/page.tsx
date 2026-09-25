import React from 'react';
import Link from 'next/link';
import { SafeImage } from '@/components/ui/safe-image';
import { getProducts } from '@/lib/data/products';
import { ProductCard } from '@/components/marketplace/product-card';
import { Sparkles, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DEFAULT_BLUR_DATA_URL } from '@/lib/image-placeholder';

export const metadata = {
  title: 'Agency Product Bundles — Save up to 60%',
  description:
    'Complete collections of WordPress themes, performance plugins, and Next.js templates bundled at high discounts for freelance developers and digital agencies.',
  alternates: {
    canonical: 'https://wefik.world/bundles',
  },
};

export default async function BundlesPage() {
  const allProducts = await getProducts();
  const bundles = allProducts.filter((p) => p.is_bundle);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-[calc(var(--header-height)+2.5rem)] pb-16 space-y-16">
      {/* Bundles Hero with Substantive Copy */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-deep-green/10 text-deep-green text-xs font-bold border border-deep-green/20">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Curated Agency Toolkits • Save 40% to 60%</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-ink">
          Curated Production Bundles for Agencies
        </h1>

        <div className="text-xs sm:text-sm text-slate max-w-2xl mx-auto leading-relaxed space-y-3 text-left sm:text-center">
          <p>
            Equip your entire web studio or freelance practice with unified collections of our flagship WordPress themes, caching plugins, and Next.js boilerplates. Purchasing a Wefik World bundle saves between 40% and 60% compared to purchasing individual items separately, providing your development pipeline with coordinated tools designed to work together without conflicts.
          </p>
          <p>
            Every tool in each bundle is authored and maintained in-house by the engineers at <a href="https://wefik.in" target="_blank" rel="noreferrer" className="text-deep-green font-semibold underline">Wefik Agency</a>. You receive individual license keys for every product in the bundle, continuous software updates, and direct engineering support. All bundles include commercial rights to deploy client websites under our <Link href="/license" className="underline font-semibold text-deep-green">Commercial License Agreement</Link>, backed by our <Link href="/refunds" className="underline font-semibold text-deep-green">7-Day Refund Policy</Link>.
          </p>
        </div>
      </div>

      {/* Featured Bundle Spotlight Banner */}
      {bundles.length > 0 && (
        <div className="bg-[#141714] text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden shadow-2xl border border-white/10 dark:border-[var(--border)]">
          <div className="absolute right-0 top-0 w-96 h-96 bg-lime/10 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center relative z-10">
            <div className="space-y-6">
              <span className="px-3 py-1 rounded-full bg-lime text-[#0a0f0a] text-xs font-extrabold uppercase">
                Featured Agency Suite
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                {bundles[0].title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {bundles[0].tagline} Complete agency suite crafted for rapid delivery of client web projects.
              </p>

              <div className="space-y-2.5 pt-2">
                <div className="flex items-center gap-2 text-xs text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-lime flex-shrink-0" />
                  <span>3 Flagship products included with commercial license</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-lime flex-shrink-0" />
                  <span>Single or Unlimited site deployment options</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-lime flex-shrink-0" />
                  <span>Direct founder support and documentation</span>
                </div>
              </div>

              <div className="pt-4 flex items-center gap-4">
                <div className="text-2xl sm:text-3xl font-black text-lime">
                  ₹{(bundles[0].price_inr / 100).toLocaleString('en-IN')}
                </div>
                <Button
                  asChild
                  className="bg-lime hover:bg-[#8fd32b] text-[#0a0f0a] font-bold h-11 px-6 rounded-xl shadow-md text-xs transition-all"
                >
                  <Link href={`/products/${bundles[0].slug}`}>
                    View Bundle Details
                  </Link>
                </Button>
              </div>
            </div>

            <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/10 shadow-lg bg-zinc-900">
              <SafeImage
                src={bundles[0].thumbnail_url}
                alt={bundles[0].title}
                fill
                placeholder="blur"
                blurDataURL={DEFAULT_BLUR_DATA_URL}
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      )}

      {/* Bundles Grid */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-ink">All Available Bundles ({bundles.length})</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {bundles.map((bundle) => (
            <ProductCard
              key={bundle.id}
              id={bundle.id}
              title={bundle.title}
              slug={bundle.slug}
              tagline={bundle.tagline}
              price_inr={bundle.price_inr}
              is_free={bundle.is_free}
              is_featured={bundle.is_featured}
              is_bundle={bundle.is_bundle}
              thumbnail_url={bundle.thumbnail_url}
              category={bundle.category}
              rating_avg={bundle.rating_avg}
              rating_count={bundle.rating_count}
              tech_stack={bundle.tech_stack}
            />
          ))}
        </div>
      </div>

      {/* Value Proposition Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-10 border-t border-border">
        <div className="p-6 rounded-2xl bg-soft border border-border space-y-2">
          <ShieldCheck className="w-6 h-6 text-deep-green" />
          <h3 className="font-bold text-sm text-ink">Full Commercial Rights</h3>
          <p className="text-xs text-slate">
            Every product inside a bundle includes independent licenses for client websites and commercial projects.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-soft border border-border space-y-2">
          <Sparkles className="w-6 h-6 text-deep-green" />
          <h3 className="font-bold text-sm text-ink">Zero Subscription Lock-In</h3>
          <p className="text-xs text-slate">
            Pay once and own the bundle forever. No unexpected recurring credit card charges.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-soft border border-border space-y-2">
          <CheckCircle2 className="w-6 h-6 text-deep-green" />
          <h3 className="font-bold text-sm text-ink">Separate Version Updates</h3>
          <p className="text-xs text-slate">
            Each item in the bundle receives regular version upgrades and security patches independently.
          </p>
        </div>
      </div>
    </div>
  );
}
