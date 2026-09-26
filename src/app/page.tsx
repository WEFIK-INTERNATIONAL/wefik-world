import Link from 'next/link';
import { ArrowRight, CheckCircle, Shield, Zap, Code2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/marketplace/product-card';
import { HeroLightweight } from '@/components/hero/hero-lightweight';
import { StatCounter } from '@/components/ui/stat-counter';
import { InfiniteMarquee } from '@/components/ui/infinite-marquee';
import { Icon3DWordPress, Icon3DPlugin, Icon3DTemplate, Icon3DBundle } from '@/components/ui/three-d-icons';
import { getProducts } from '@/lib/data/products';

export const revalidate = 300;

export default async function HomePage() {
  // P0-4: Single fetch for listing data, deriving featured and freebies without duplicate roundtrips
  const allProducts = await getProducts({ limit: 12 });
  const featuredProducts = allProducts.filter((p) => p.is_featured).slice(0, 3);
  const freebies = allProducts.filter((p) => p.is_free);

  return (
    <div className="flex flex-col w-full min-h-screen">
      {/* 1. HERO SECTION (Lightweight Edition - Section 6) */}
      <section className="relative overflow-hidden bg-[var(--bg)] border-b border-[var(--border)]">
        <HeroLightweight />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          {/* Engineering Standards & Principles (No prices in hero) */}
          <div className="max-w-3xl mx-auto mb-10 p-4 sm:p-5 rounded-2xl bg-[var(--surface)] border border-deep-green/30 shadow-sm text-left">
            <div className="flex items-center gap-2 mb-2.5">
              <span className="flex h-2 w-2 rounded-full bg-deep-green" />
              <span className="eyebrow text-xs text-deep-green">
                Engineering Standards &amp; Principles
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[var(--text)]">
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-deep-green flex-shrink-0" />
                <span><strong>Code Quality:</strong> 100% hand-crafted, zero builder bloat</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-deep-green flex-shrink-0" />
                <span><strong>Licensing:</strong> Commercial rights for client projects</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-deep-green flex-shrink-0" />
                <span><strong>Accountability:</strong> Single-vendor team, direct support</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-deep-green flex-shrink-0" />
                <span><strong>Tech Stack:</strong> WordPress 6.4+, PHP 8.1–8.3, Next.js 15</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-deep-green flex-shrink-0" />
                <span><strong>Generosity First:</strong> 100% free starters &amp; plugins available</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-deep-green flex-shrink-0" />
                <span><strong>Ownership:</strong> Clean code you download and keep forever</span>
              </div>
            </div>
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
                <p className="text-xs text-slate">Client &amp; personal projects</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-lime/20 flex items-center justify-center text-deep-green flex-shrink-0 mt-0.5">
                <Code2 className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-bold text-ink">Single-Vendor Model</p>
                <p className="text-xs text-slate">100% built by Wefik engineers</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-lime/20 flex items-center justify-center text-deep-green flex-shrink-0 mt-0.5">
                <Download className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-bold text-ink">Instant Downloads</p>
                <p className="text-xs text-slate">Direct file access &amp; updates</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* INFINITE MARQUEE STRIP */}
      <InfiniteMarquee />

      {/* 2. FREE PRODUCTS SPOTLIGHT (Psychological Anchor: Generosity First per Part C1) */}
      {freebies.length > 0 && (
        <section id="free-products" className="py-20 bg-[var(--surface)] border-b border-[var(--border)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-deep-green">
                  Generosity First • Zero Cost
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-ink mt-1">
                  Start free. No account needed.
                </h2>
                <p className="text-xs sm:text-sm text-slate mt-1 max-w-xl">
                  Download production-ready templates and plugins. Verify our code quality on your local machine before buying anything.
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

      {/* 3. CATEGORY BROWSER */}
      <section className="py-16 bg-[var(--bg)] border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-deep-green">
                Browse By Domain
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-ink mt-1">
                Engineered for speed, scale &amp; conversions
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
              className="group p-6 rounded-2xl bg-[var(--surface-2)] border border-[var(--border)] hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-lg transition-all"
            >
              <div className="mb-4">
                <Icon3DWordPress size={44} />
              </div>
              <h3 className="font-bold text-base text-ink group-hover:text-deep-green dark:group-hover:text-lime transition-colors">
                WordPress Themes
              </h3>
              <p className="text-xs text-slate mt-1.5 leading-relaxed">
                Full-site editing block themes with 20+ Gutenberg patterns and zero builder bloat.
              </p>
            </Link>

            <Link
              href="/marketplace?category=wordpress-plugins"
              className="group p-6 rounded-2xl bg-[var(--surface-2)] border border-[var(--border)] hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-lg transition-all"
            >
              <div className="mb-4">
                <Icon3DPlugin size={44} />
              </div>
              <h3 className="font-bold text-base text-ink group-hover:text-deep-green dark:group-hover:text-lime transition-colors">
                WordPress Plugins
              </h3>
              <p className="text-xs text-slate mt-1.5 leading-relaxed">
                Single-purpose performance utilities, caching engines, and automatic WebP image converters.
              </p>
            </Link>

            <Link
              href="/marketplace?category=templates-starters"
              className="group p-6 rounded-2xl bg-[var(--surface-2)] border border-[var(--border)] hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-lg transition-all"
            >
              <div className="mb-4">
                <Icon3DTemplate size={44} />
              </div>
              <h3 className="font-bold text-base text-ink group-hover:text-deep-green dark:group-hover:text-lime transition-colors">
                HTML &amp; Tailwind Starters
              </h3>
              <p className="text-xs text-slate mt-1.5 leading-relaxed">
                Clean Next.js 15 and responsive HTML5 boilerplates with authentic modern typography.
              </p>
            </Link>

            <Link
              href="/bundles"
              className="group p-6 rounded-2xl bg-[#141714] text-white border border-white/10 dark:border-[var(--border)] hover:border-lime/60 shadow-md transition-all"
            >
              <div className="mb-4">
                <Icon3DBundle size={44} />
              </div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">Agency Bundles</h3>
                <span className="px-1.5 py-0.5 text-[9px] font-black uppercase bg-lime text-[#0a0f0a] rounded">
                  Packs
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                Complete suites of themes, plugins, and templates curated for agency client workflows.
              </p>
            </Link>
          </div>
        </div>
      </section>

      {/* 4. MARKETPLACE PREVIEW: Featured Products (Plain prices, calm CTAs) */}
      <section className="py-20 bg-[var(--surface)] border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-deep-green">
                Curated Releases
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-ink mt-1">
                Featured digital products
              </h2>
              <p className="text-xs sm:text-sm text-slate mt-1 max-w-xl">
                Ready-to-deploy digital assets tested on high-traffic client installations across India &amp; globally.
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

      {/* 5. MISSION SECTION: Why We Exist (2-3 short lines, human, warm, no hype) */}
      <section className="py-16 bg-[var(--bg)] border-b border-[var(--border)] text-center">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="eyebrow text-xs text-deep-green font-bold">Why We Exist</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text)] mt-2 mb-4">
            Built to serve developers, not lock you into subscriptions.
          </h2>
          <p className="body-base text-sm sm:text-base text-[var(--muted)] leading-relaxed max-w-2xl mx-auto">
            We run a working digital agency (<a href="https://wefik.in" target="_blank" rel="noreferrer" className="text-deep-green underline">wefik.in</a>) and got tired of abandoned marketplace plugins. Everything here is hand-coded by our team, priced fairly, and yours forever once downloaded.
          </p>
        </div>
      </section>

      {/* 6. MEMBERSHIP TEASER (Compact panel, not screaming per Part C1) */}
      <section className="py-16 bg-[var(--surface-2)] border-b border-[var(--border)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-10 rounded-3xl bg-[var(--surface)] border border-[var(--border)] shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-left">
              <span className="eyebrow text-xs text-deep-green font-bold">All-Access Pass</span>
              <h3 className="text-xl sm:text-2xl font-bold text-[var(--text)]">
                Want everything? One membership unlocks it all — and supports the project.
              </h3>
              <p className="text-xs sm:text-sm text-[var(--muted)] max-w-xl">
                Get unlimited access to every current and upcoming theme, plugin, and template with commercial licenses.
              </p>
            </div>
            <Button asChild variant="primary" className="h-11 px-6 rounded-xl font-semibold text-xs whitespace-nowrap flex-shrink-0">
              <Link href="/pricing">View Membership Plans</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* 7. TRUST & ENGINEERING STANDARDS (Real agency facts, zero fake testimonials) */}
      <section className="py-20 bg-[var(--bg)] border-t border-[var(--border)]">
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
              <div className="w-10 h-10 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center text-deep-green mb-4">
                <Code2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-ink mb-2">100% Hand-Crafted Code</h3>
              <p className="text-xs text-slate leading-relaxed">
                No unverified AI hallucinations or bloated code generators. Every line of PHP, TypeScript, and CSS is manually written, reviewed, and audited for security.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-soft border border-border">
              <div className="w-10 h-10 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center text-deep-green mb-4">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-ink mb-2">Clear Commercial Licenses</h3>
              <p className="text-xs text-slate leading-relaxed">
                No ambiguous legal terms or restrictive usage limitations. Single and Unlimited site licenses granting full legal rights to build client websites and bill them freely.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-soft border border-border">
              <div className="w-10 h-10 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center text-deep-green mb-4">
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
            <details className="group p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] transition-all">
              <summary className="font-bold text-sm text-ink cursor-pointer list-none flex items-center justify-between">
                <span>What makes Wefik World different from ThemeForest or CodeCanyon?</span>
                <span className="text-deep-green font-bold text-lg transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="text-xs text-slate mt-3 leading-relaxed">
                Wefik World is a single-vendor marketplace run by active agency engineers. Unlike ThemeForest where third-party authors frequently abandon plugins, every product here is maintained in-house. We write clean, bloat-free code with zero visual builder lock-in, optimize for 95+ mobile PageSpeed scores, and provide transparent INR pricing with instant UPI payments.
              </p>
            </details>

            <details className="group p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] transition-all">
              <summary className="font-bold text-sm text-ink cursor-pointer list-none flex items-center justify-between">
                <span>Can I use these themes and templates for client commercial work?</span>
                <span className="text-deep-green font-bold text-lg transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="text-xs text-slate mt-3 leading-relaxed">
                Yes. Both our Single-Site and Unlimited-Site licenses include full commercial rights. Single-Site allows deployment on one production client domain, while Unlimited-Site permits deployment across infinite client and agency projects. You can bill your clients normally for your services.
              </p>
            </details>

            <details className="group p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] transition-all">
              <summary className="font-bold text-sm text-ink cursor-pointer list-none flex items-center justify-between">
                <span>How does the All-Access Membership work?</span>
                <span className="text-deep-green font-bold text-lg transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="text-xs text-slate mt-3 leading-relaxed">
                We offer two All-Access options: Monthly (₹999/month, cancel anytime) and Lifetime Deal (₹9,999 one-time payment). Memberships unlock instant downloads of every single WordPress theme, plugin, HTML template, and starter in our catalog, including all new products added in the future.
              </p>
            </details>

            <details className="group p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] transition-all">
              <summary className="font-bold text-sm text-ink cursor-pointer list-none flex items-center justify-between">
                <span>Do you support Indian payment methods like UPI and NetBanking?</span>
                <span className="text-deep-green font-bold text-lg transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="text-xs text-slate mt-3 leading-relaxed">
                Yes. We process payments via Razorpay with native support for Google Pay, PhonePe, Paytm, BHIM UPI, RuPay cards, Visa, Mastercard, and Indian NetBanking. All prices are calculated in integer paise with zero foreign exchange fees.
              </p>
            </details>

            <details className="group p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] transition-all">
              <summary className="font-bold text-sm text-ink cursor-pointer list-none flex items-center justify-between">
                <span>Are the free products really 100% free with no catch?</span>
                <span className="text-deep-green font-bold text-lg transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="text-xs text-slate mt-3 leading-relaxed">
                Yes. Products in our Freebies catalog can be claimed instantly without payment details. You receive a cryptographic license key, lifetime access, and clean code that adheres to the exact same engineering standards as our premium items.
              </p>
            </details>

            <details className="group p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] transition-all">
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

      {/* 9. FINAL CTA: Start with the free stuff per Part C1 */}
      <section className="py-20 bg-[var(--surface)] border-t border-[var(--border)] text-center">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="eyebrow text-xs text-deep-green font-bold">Generosity First</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text)] mt-2 mb-3">
            Start with the free stuff.
          </h2>
          <p className="body-base text-sm sm:text-base text-[var(--muted)] max-w-xl mx-auto mb-8">
            Grab a starter or plugin. Test the code in your own workflow. Zero account needed to download.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button asChild variant="primary" size="lg" className="h-11 px-8 rounded-xl font-semibold text-sm">
              <Link href="/freebies">Explore Free Products</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-11 px-8 rounded-xl font-semibold text-sm">
              <Link href="/marketplace">Browse Full Catalog</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

