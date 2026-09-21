import Link from 'next/link';
import { ArrowRight, CheckCircle, Sparkles, Shield, Zap, Code2, Download, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/marketplace/product-card';
import { Hero3DWrapper } from '@/components/hero/hero-3d-wrapper';
import { MagneticButton } from '@/components/ui/magnetic-button';
import { StatCounter } from '@/components/ui/stat-counter';
import { InfiniteMarquee } from '@/components/ui/infinite-marquee';
import { TransitionLink } from '@/components/transitions/transition-link';
import { getProducts } from '@/lib/data/products';

export default async function HomePage() {
  const featuredProducts = await getProducts({ featuredOnly: true, limit: 3 });
  const allProducts = await getProducts({ limit: 6 });
  const freebies = allProducts.filter((p) => p.is_free);
  const bundleProduct = allProducts.find((p) => p.is_bundle);

  return (
    <div className="flex flex-col w-full min-h-screen">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-20 pb-20 lg:pt-28 lg:pb-24 bg-gradient-to-b from-soft via-white to-white border-b border-border">
        {/* Decorative Grid & Glow */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-lime/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Live Agency Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-border shadow-xs text-xs font-semibold text-deep-green mb-6 animate-in fade-in slide-in-from-bottom-3 duration-500">
            <span className="flex h-2 w-2 rounded-full bg-lime animate-pulse" />
            <span>Curated by Wefik Agency Engineers</span>
            <span className="text-slate/60">•</span>
            <span className="text-slate font-medium">100% Bloat-Free Code</span>
          </div>

          {/* Main Headline (Section 7.1 Spec) */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-ink max-w-4xl mx-auto leading-[1.1] mb-6">
            WordPress Themes, Plugins & Templates for People Who Build the Web
          </h1>

          {/* Subheading (~120 words exact intro per Section 7.1) */}
          <p className="text-sm sm:text-base md:text-lg text-slate max-w-3xl mx-auto mb-8 leading-relaxed font-normal">
            Wefik.world is the digital product marketplace built specifically for freelancers, digital agencies, and independent founders who refuse to compromise on website speed, code semantics, or licensing freedom. Every WordPress theme, performance plugin, responsive HTML template, and full-stack code snippet in our catalog is engineered in-house by Wefik Agency with zero page builder bloat. Choose between flexible Single-Site or commercial Unlimited-Site licenses, save up to 60% with curated product bundles, unlock the entire catalog with our All-Access Membership, or start immediately with 100% free lead magnet products. Tailored for India with transparent INR pricing, integer-paise math, and instant UPI checkout.
          </p>

          {/* Section 5.3 & 7.1 — Key Facts Box (Designed for AI Engine Quoting & Instant Scannability) */}
          <div className="max-w-3xl mx-auto mb-10 p-4 sm:p-5 rounded-2xl bg-white border border-deep-green/30 shadow-sm text-left">
            <div className="flex items-center gap-2 mb-2.5">
              <span className="flex h-2 w-2 rounded-full bg-deep-green" />
              <span className="text-xs font-bold uppercase tracking-wider text-deep-green">
                Key Facts & Marketplace Overview
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-ink">
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-deep-green flex-shrink-0" />
                <span><strong>Pricing:</strong> Products from ₹499 (paise-precise)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-deep-green flex-shrink-0" />
                <span><strong>Licensing:</strong> Single & Unlimited-Site Commercial</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-deep-green flex-shrink-0" />
                <span><strong>Bundles:</strong> Curated packs save up to 60%</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-deep-green flex-shrink-0" />
                <span><strong>Memberships:</strong> Monthly (₹999) & Lifetime (₹9,999)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-deep-green flex-shrink-0" />
                <span><strong>Freebies:</strong> 100% free themes & plugins available</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-deep-green flex-shrink-0" />
                <span><strong>Payments:</strong> Instant UPI, Cards & NetBanking</span>
              </div>
            </div>
          </div>

          {/* Hero CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-14">
            <MagneticButton strength={0.25} className="w-full sm:w-auto">
              <Button
                asChild
                size="lg"
                className="w-full sm:w-auto h-12 px-8 rounded-xl bg-ink hover:bg-black text-white font-semibold text-sm shadow-md transition-shadow hover:shadow-lime/20 hover:shadow-lg"
              >
                <TransitionLink href="/marketplace" className="flex items-center gap-2">
                  <span>Browse Marketplace</span>
                  <ArrowRight className="w-4 h-4" />
                </TransitionLink>
              </Button>
            </MagneticButton>
            <MagneticButton strength={0.15} className="w-full sm:w-auto">
              <Button
                asChild
                variant="outline"
                size="lg"
                className="w-full sm:w-auto h-12 px-8 rounded-xl border-border bg-white text-ink hover:bg-soft font-semibold text-sm"
              >
                <TransitionLink href="/pricing">
                  <span>Get All-Access Membership</span>
                </TransitionLink>
              </Button>
            </MagneticButton>
          </div>

          {/* Three.js Hero Canvas (Gated with Suspense, reduced-motion, and mobile poster per Section 5) */}
          <div className="mb-14 max-w-4xl mx-auto">
            <Hero3DWrapper />
          </div>

          {/* Trust Metrics Bar */}
          <div className="pt-8 border-t border-border/80 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto text-left">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-lime/20 flex items-center justify-center text-deep-green flex-shrink-0 mt-0.5">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-bold text-ink"><StatCounter end={100} duration={1.2} />/100 PageSpeed</p>
                <p className="text-xs text-slate">Zero bulky page builders</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-lime/20 flex items-center justify-center text-deep-green flex-shrink-0 mt-0.5">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-bold text-ink">Commercial Licenses</p>
                <p className="text-xs text-slate">Client & personal projects</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-lime/20 flex items-center justify-center text-deep-green flex-shrink-0 mt-0.5">
                <Code2 className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-bold text-ink"><StatCounter end={150} suffix="+" duration={1.4} /> Agency Deployments</p>
                <p className="text-xs text-slate">Battle-tested in the wild</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-lime/20 flex items-center justify-center text-deep-green flex-shrink-0 mt-0.5">
                <Download className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-bold text-ink">Instant Downloads</p>
                <p className="text-xs text-slate">Direct file access & updates</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* INFINITE MARQUEE STRIP */}
      <InfiniteMarquee />

      {/* 2. CATEGORY BROWSER */}
      <section className="py-16 bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-deep-green">
                Browse By Domain
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-ink mt-1">
                Engineered for speed, scale & conversions
              </h2>
            </div>
            <Link
              href="/marketplace"
              className="text-xs font-bold text-deep-green hover:underline inline-flex items-center gap-1 mt-2 md:mt-0"
            >
              <span>View All Categories</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <Link
              href="/marketplace?category=wordpress-themes"
              className="group p-6 rounded-2xl bg-soft border border-border hover:border-slate-300 hover:shadow-lg transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-white border border-border flex items-center justify-center text-ink group-hover:bg-ink group-hover:text-lime transition-colors mb-4">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-ink group-hover:text-deep-green transition-colors">
                WordPress Themes
              </h3>
              <p className="text-xs text-slate mt-1.5 leading-relaxed">
                Full-site editing block themes with 20+ Gutenberg patterns and zero builder bloat.
              </p>
            </Link>

            <Link
              href="/marketplace?category=wordpress-plugins"
              className="group p-6 rounded-2xl bg-soft border border-border hover:border-slate-300 hover:shadow-lg transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-white border border-border flex items-center justify-center text-ink group-hover:bg-ink group-hover:text-lime transition-colors mb-4">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-ink group-hover:text-deep-green transition-colors">
                WordPress Plugins
              </h3>
              <p className="text-xs text-slate mt-1.5 leading-relaxed">
                Single-purpose performance utilities, caching engines, and automatic WebP image converters.
              </p>
            </Link>

            <Link
              href="/marketplace?category=templates-starters"
              className="group p-6 rounded-2xl bg-soft border border-border hover:border-slate-300 hover:shadow-lg transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-white border border-border flex items-center justify-center text-ink group-hover:bg-ink group-hover:text-lime transition-colors mb-4">
                <Code2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-ink group-hover:text-deep-green transition-colors">
                HTML & Tailwind Starters
              </h3>
              <p className="text-xs text-slate mt-1.5 leading-relaxed">
                Clean Next.js 15 and responsive HTML5 boilerplates with authentic modern typography.
              </p>
            </Link>

            <Link
              href="/bundles"
              className="group p-6 rounded-2xl bg-deep-green text-white hover:bg-deep-green/95 shadow-md transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-lime mb-4">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">Agency Bundles</h3>
                <span className="px-1.5 py-0.5 text-[9px] font-black uppercase bg-lime text-ink rounded">
                  Save 60%
                </span>
              </div>
              <p className="text-xs text-white/80 mt-1.5 leading-relaxed">
                Get our complete suite of themes, plugins, and templates in a single discounted package.
              </p>
            </Link>
          </div>
        </div>
      </section>

      {/* 3. FEATURED PRODUCTS */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-deep-green">
                Handpicked Releases
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-ink mt-1">
                Featured digital products
              </h2>
              <p className="text-xs sm:text-sm text-slate mt-1 max-w-xl">
                Ready-to-deploy digital assets tested on high-traffic client installations across India & globally.
              </p>
            </div>
            <Button asChild variant="outline" className="h-10 rounded-xl mt-4 md:mt-0 text-xs font-semibold">
              <Link href="/marketplace">Explore All Products ({allProducts.length})</Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProducts.map((product) => (
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
        </div>
      </section>

      {/* 4. SPOTLIGHT BUNDLE SECTION */}
      {bundleProduct && (
        <section className="py-20 bg-soft border-y border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-ink text-white rounded-3xl p-8 sm:p-12 lg:p-16 relative overflow-hidden shadow-2xl">
              {/* Background gradient pill */}
              <div className="absolute right-0 top-0 w-96 h-96 bg-lime/15 rounded-full blur-3xl pointer-events-none" />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center relative z-10">
                <div className="space-y-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lime/20 text-lime text-xs font-bold border border-lime/30">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Exclusive Agency Deal • Save ₹1,998</span>
                  </div>

                  <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
                    {bundleProduct.title}
                  </h2>

                  <p className="text-sm text-slate-300 leading-relaxed max-w-lg">
                    {bundleProduct.tagline} Everything you need to craft lightning-fast agency projects and SaaS landings at a fraction of individual costs.
                  </p>

                  <div className="space-y-3 pt-2">
                    <div className="flex items-center gap-2.5 text-xs text-slate-200">
                      <CheckCircle className="w-4 h-4 text-lime flex-shrink-0" />
                      <span>AgencyPro Gutenberg Theme (Single/Unlimited license included)</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs text-slate-200">
                      <CheckCircle className="w-4 h-4 text-lime flex-shrink-0" />
                      <span>SuperFast Cache & WebP Optimizer for WordPress</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs text-slate-200">
                      <CheckCircle className="w-4 h-4 text-lime flex-shrink-0" />
                      <span>SaaSPulse Next.js 15 & Tailwind Boilerplate</span>
                    </div>
                  </div>

                  <div className="pt-4 flex flex-wrap items-center gap-4">
                    <div>
                      <span className="text-xs text-slate-400 line-through mr-2">₹5,997</span>
                      <span className="text-3xl font-extrabold text-lime">
                        ₹{(bundleProduct.price_inr / 100).toLocaleString('en-IN')}
                      </span>
                    </div>

                    <Button
                      asChild
                      className="bg-lime hover:bg-lime/90 text-ink font-bold h-12 px-8 rounded-xl shadow-md"
                    >
                      <Link href={`/products/${bundleProduct.slug}`}>
                        Get Bundle Now
                      </Link>
                    </Button>
                  </div>
                </div>

                <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-zinc-900">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />
                  <img
                    src={bundleProduct.thumbnail_url}
                    alt={bundleProduct.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-4 left-4 z-20">
                    <span className="text-xs font-semibold uppercase tracking-wider text-lime">
                      3-in-1 Agency Suite
                    </span>
                    <p className="text-sm font-bold text-white">Full Commercial Rights Included</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 5. FREEBIES / LEAD MAGNET SECTION */}
      {freebies.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-deep-green">
                  Zero Cost • High Value
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-ink mt-1">
                  100% Free templates & developer starters
                </h2>
                <p className="text-xs sm:text-sm text-slate mt-1 max-w-xl">
                  Test our code quality and responsiveness before investing in premium licenses. Zero credit card needed.
                </p>
              </div>
              <Button asChild variant="outline" className="h-10 rounded-xl mt-4 md:mt-0 text-xs font-semibold">
                <Link href="/freebies">Browse Free Catalog</Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {freebies.map((freebie) => (
                <ProductCard
                  key={freebie.id}
                  id={freebie.id}
                  title={freebie.title}
                  slug={freebie.slug}
                  tagline={freebie.tagline}
                  price_inr={freebie.price_inr}
                  is_free={freebie.is_free}
                  is_featured={freebie.is_featured}
                  is_bundle={freebie.is_bundle}
                  thumbnail_url={freebie.thumbnail_url}
                  category={freebie.category}
                  rating_avg={freebie.rating_avg}
                  rating_count={freebie.rating_count}
                  tech_stack={freebie.tech_stack}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 6. ALL-ACCESS MEMBERSHIP COMPARISON (V1 + V2 Launch) */}
      <section className="py-20 bg-soft border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-deep-green">
            Unlimited Possibilities
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-ink mt-2 mb-4">
            One membership. Every digital product.
          </h2>
          <p className="text-sm sm:text-base text-slate max-w-2xl mx-auto mb-14">
            Freelancers and agencies saving thousands on individual asset purchases with our All-Access passes.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto text-left">
            {/* Monthly Plan */}
            <div className="p-8 rounded-3xl bg-white border border-border hover:border-slate-300 shadow-sm transition-all flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold uppercase text-slate tracking-wider">
                  Flexible Monthly
                </span>
                <h3 className="text-2xl font-bold text-ink mt-1">All-Access Monthly</h3>
                <p className="text-xs text-slate mt-2">
                  Best for active freelance sprints and ongoing client design workflows.
                </p>

                <div className="mt-6 mb-8 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-ink">₹999</span>
                  <span className="text-xs font-semibold text-slate">/ month</span>
                </div>

                <ul className="space-y-3 text-xs text-slate">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-deep-green flex-shrink-0" />
                    <span>Instant access to all current themes & plugins</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-deep-green flex-shrink-0" />
                    <span>New releases added every month included</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-deep-green flex-shrink-0" />
                    <span>Unlimited personal & commercial client use</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-deep-green flex-shrink-0" />
                    <span>One-click subscription cancellation anytime</span>
                  </li>
                </ul>
              </div>

              <Button
                asChild
                className="w-full mt-8 bg-ink hover:bg-black text-white h-11 rounded-xl font-semibold text-xs"
              >
                <Link href="/pricing">Subscribe Monthly (₹999/mo)</Link>
              </Button>
            </div>

            {/* Lifetime Plan (Highlighted) */}
            <div className="p-8 rounded-3xl bg-ink text-white border-2 border-deep-green shadow-xl flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-4 right-4 bg-lime text-ink text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                Most Popular
              </div>

              <div>
                <span className="text-xs font-bold uppercase text-lime tracking-wider">
                  Perpetual Ownership
                </span>
                <h3 className="text-2xl font-bold text-white mt-1">Lifetime Deal</h3>
                <p className="text-xs text-slate-300 mt-2">
                  Pay once, own everything wefik ever creates forever. Zero recurring costs.
                </p>

                <div className="mt-6 mb-8 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-white">₹9,999</span>
                  <span className="text-xs font-semibold text-slate-400">one-time payment</span>
                </div>

                <ul className="space-y-3 text-xs text-slate-200">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-lime flex-shrink-0" />
                    <span>Perpetual access to all current & future releases</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-lime flex-shrink-0" />
                    <span>Unlimited site licenses for unlimited agency clients</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-lime flex-shrink-0" />
                    <span>All major version upgrades included forever</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-lime flex-shrink-0" />
                    <span>Priority developer support & founder Discord</span>
                  </li>
                </ul>
              </div>

              <Button
                asChild
                className="w-full mt-8 bg-deep-green hover:bg-deep-green/90 text-white h-11 rounded-xl font-semibold text-xs shadow-md"
              >
                <Link href="/pricing">Get Lifetime Deal (₹9,999)</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 7. TRUST & ENGINEERING STANDARDS (Real agency facts, zero fake testimonials) */}
      <section className="py-20 bg-white border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-deep-green">
              Engineering Integrity
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight text-ink mt-2">
              Why professional teams choose Wefik World
            </h2>
            <p className="text-xs sm:text-sm text-slate mt-2">
              We run a working digital agency (<a href="https://wefik.in" target="_blank" rel="noreferrer" className="text-deep-green underline">wefik.in</a>). We build tools we actually use on commercial client projects every single day.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-soft border border-border">
              <div className="w-10 h-10 rounded-xl bg-white border border-border flex items-center justify-center text-deep-green mb-4">
                <Code2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-ink mb-2">100% Hand-Crafted Code</h3>
              <p className="text-xs text-slate leading-relaxed">
                No unverified AI hallucinations or bloated code generators. Every line of PHP, TypeScript, and CSS is manually written, reviewed, and audited for security.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-soft border border-border">
              <div className="w-10 h-10 rounded-xl bg-white border border-border flex items-center justify-center text-deep-green mb-4">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-ink mb-2">Clear Commercial Licenses</h3>
              <p className="text-xs text-slate leading-relaxed">
                No ambiguous legal terms or restrictive usage limitations. Single and Unlimited site licenses granting full legal rights to build client websites and bill them freely.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-soft border border-border">
              <div className="w-10 h-10 rounded-xl bg-white border border-border flex items-center justify-center text-deep-green mb-4">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-ink mb-2">Single-Vendor Accountability</h3>
              <p className="text-xs text-slate leading-relaxed">
                Unlike open multi-vendor marketplaces filled with abandoned plugins, Wefik World is single-vendor. If anything breaks, our core engineering team fixes it directly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. HOMEPAGE FAQ SECTION (6 Questions + FAQPage JSON-LD per Section 7.1) */}
      <section className="py-20 bg-soft border-t border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-deep-green">
              Buyer Questions Answered
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight text-ink mt-2">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-slate mt-2">
              Everything you need to know about our products, commercial licenses, and memberships.
            </p>
          </div>

          <div className="space-y-4">
            <details className="group p-5 rounded-2xl bg-white border border-border transition-all">
              <summary className="font-bold text-sm text-ink cursor-pointer list-none flex items-center justify-between">
                <span>What makes Wefik World different from ThemeForest or CodeCanyon?</span>
                <span className="text-deep-green font-bold text-lg transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="text-xs text-slate mt-3 leading-relaxed">
                Wefik World is a single-vendor marketplace run by active agency engineers. Unlike ThemeForest where third-party authors frequently abandon plugins, every product here is maintained in-house. We write clean, bloat-free code with zero visual builder lock-in, optimize for 95+ mobile PageSpeed scores, and provide transparent INR pricing with instant UPI payments.
              </p>
            </details>

            <details className="group p-5 rounded-2xl bg-white border border-border transition-all">
              <summary className="font-bold text-sm text-ink cursor-pointer list-none flex items-center justify-between">
                <span>Can I use these themes and templates for client commercial work?</span>
                <span className="text-deep-green font-bold text-lg transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="text-xs text-slate mt-3 leading-relaxed">
                Yes. Both our Single-Site and Unlimited-Site licenses include full commercial rights. Single-Site allows deployment on one production client domain, while Unlimited-Site permits deployment across infinite client and agency projects. You can bill your clients normally for your services.
              </p>
            </details>

            <details className="group p-5 rounded-2xl bg-white border border-border transition-all">
              <summary className="font-bold text-sm text-ink cursor-pointer list-none flex items-center justify-between">
                <span>How does the All-Access Membership work?</span>
                <span className="text-deep-green font-bold text-lg transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="text-xs text-slate mt-3 leading-relaxed">
                We offer two All-Access options: Monthly (₹999/month, cancel anytime) and Lifetime Deal (₹9,999 one-time payment). Memberships unlock instant downloads of every single WordPress theme, plugin, HTML template, and starter in our catalog, including all new products added in the future.
              </p>
            </details>

            <details className="group p-5 rounded-2xl bg-white border border-border transition-all">
              <summary className="font-bold text-sm text-ink cursor-pointer list-none flex items-center justify-between">
                <span>Do you support Indian payment methods like UPI and NetBanking?</span>
                <span className="text-deep-green font-bold text-lg transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="text-xs text-slate mt-3 leading-relaxed">
                Yes. We process payments via Razorpay with native support for Google Pay, PhonePe, Paytm, BHIM UPI, RuPay cards, Visa, Mastercard, and Indian NetBanking. All prices are calculated in integer paise with zero foreign exchange fees.
              </p>
            </details>

            <details className="group p-5 rounded-2xl bg-white border border-border transition-all">
              <summary className="font-bold text-sm text-ink cursor-pointer list-none flex items-center justify-between">
                <span>Are the free products really 100% free with no catch?</span>
                <span className="text-deep-green font-bold text-lg transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="text-xs text-slate mt-3 leading-relaxed">
                Yes. Products in our Freebies catalog can be claimed instantly without payment details. You receive a cryptographic license key, lifetime access, and clean code that adheres to the exact same engineering standards as our premium items.
              </p>
            </details>

            <details className="group p-5 rounded-2xl bg-white border border-border transition-all">
              <summary className="font-bold text-sm text-ink cursor-pointer list-none flex items-center justify-between">
                <span>How do I receive product updates and download new versions?</span>
                <span className="text-deep-green font-bold text-lg transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="text-xs text-slate mt-3 leading-relaxed">
                You can download the latest release files anytime directly from your customer dashboard. Product updates are lifetime for purchased items, and all files are served via secure 60-second time-limited signed URLs directly from private cloud storage.
              </p>
            </details>
          </div>
        </div>

        {/* Structured Data: FAQPage JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: [
                {
                  "@type": "Question",
                  name: "What makes Wefik World different from ThemeForest or CodeCanyon?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Wefik World is a single-vendor marketplace run by active agency engineers. Every product is maintained in-house with clean, bloat-free code and transparent INR pricing.",
                  },
                },
                {
                  "@type": "Question",
                  name: "Can I use these themes and templates for client commercial work?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Yes. Both Single-Site and Unlimited-Site licenses include full commercial rights for client websites.",
                  },
                },
                {
                  "@type": "Question",
                  name: "How does the All-Access Membership work?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Memberships offer unlimited access to every product in the catalog. Choose Monthly (₹999/mo) or Lifetime Deal (₹9,999 one-time).",
                  },
                },
                {
                  "@type": "Question",
                  name: "Do you support Indian payment methods like UPI and NetBanking?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Yes, native UPI, NetBanking, and RuPay/Visa/Mastercard payments are processed securely via Razorpay in INR.",
                  },
                },
                {
                  "@type": "Question",
                  name: "Are the free products really 100% free with no catch?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Yes. Freebies require zero payment and include instant license keys and clean code.",
                  },
                },
                {
                  "@type": "Question",
                  name: "How do I receive product updates and download new versions?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Latest files can be downloaded anytime from your customer dashboard via secure signed URLs.",
                  },
                },
              ],
            }),
          }}
        />
      </section>
    </div>
  );
}

