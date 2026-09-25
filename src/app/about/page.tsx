import { Metadata } from 'next';
import Link from 'next/link';
import { ShieldCheck, Code2, ArrowRight, ExternalLink, Zap, Phone, Mail, Clock, MapPin, Building2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'About Wefik.world — The Official Digital Marketplace of Wefik',
  description:
    'The story of Wefik.world. Built and supported directly by the engineering team at Wefik Agency (wefik.in). Single-vendor themes, plugins, and web templates.',
  alternates: {
    canonical: 'https://wefik.world/about',
  },
};

const aboutJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  name: 'About Wefik.world',
  url: 'https://wefik.world/about',
  mainEntity: {
    '@type': 'Organization',
    '@id': 'https://www.wefik.in/#organization',
    name: 'Wefik',
    url: 'https://www.wefik.in/',
    telephone: '+91 96096 53522',
    description: 'Digital agency specializing in web design, digital products, and full-stack development.',
    sameAs: [
      'https://wefik.world',
      'https://twitter.com/wefik',
      'https://github.com/WEFIK-INTERNATIONAL',
      'https://linkedin.com/company/wefik',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+91 96096 53522',
      contactType: 'customer service',
      availableLanguage: ['English', 'Hindi'],
      hoursAvailable: {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '09:00',
        closes: '18:00',
      },
    },
  },
};

export default function AboutPage() {
  return (
    <div className="w-full min-h-screen pt-[calc(var(--header-height)+2rem)] pb-16 bg-[var(--bg)] border-b border-[var(--border)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutJsonLd) }}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-[var(--muted)] mb-8">
          <Link href="/" className="hover:text-[var(--text)] transition-colors">Home</Link>
          <span>/</span>
          <span className="text-[var(--text)] font-semibold">About</span>
        </nav>

        {/* Hero Section */}
        <div className="bg-[var(--surface)] rounded-3xl p-8 sm:p-12 border border-[var(--border)] shadow-xs mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lime/10 text-deep-green text-xs font-bold border border-lime/30 mb-4">
            <Building2 className="w-3.5 h-3.5" />
            <span>The Official Marketplace of Wefik Agency</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-[var(--text)] tracking-tight mb-6">
            Built by Engineers Who Ship Client Work Every Day
          </h1>

          <p className="text-sm sm:text-base text-[var(--muted)] leading-relaxed mb-6 font-normal">
            <strong className="text-[var(--text)]">Wefik.world</strong> is the official digital product marketplace of{' '}
            <a
              href="https://wefik.in"
              target="_blank"
              rel="noreferrer"
              className="text-[var(--accent)] font-semibold underline inline-flex items-center gap-0.5"
            >
              Wefik (wefik.in) <ExternalLink className="w-3 h-3" />
            </a>
            , a full-service digital agency whose mission is captured in its founding ethos: <em>&ldquo;Turning Your Ideas into Digital Reality&rdquo;</em> (and <em>&ldquo;Real Life Genie of Your Idea&rdquo;</em>).
          </p>

          <p className="text-sm sm:text-base text-[var(--muted)] leading-relaxed mb-6 font-normal">
            At Wefik Agency, our day-to-day work spans bespoke web design, custom software platforms, mobile applications, Next.js &amp; React engineering, headless Shopify architectures, complex API integrations, branding, and digital growth campaigns. In executing client projects for enterprises and startups, our engineering team repeatedly faced the shortcomings of legacy multi-vendor marketplaces: multi-gigabyte themes bundled with slow visual page builders, abandoned third-party plugins, and customer support that vanished months after purchase.
          </p>

          <p className="text-sm sm:text-base text-[var(--muted)] leading-relaxed font-normal">
            We built Wefik.world to solve this permanently. Every WordPress theme, performance plugin, HTML template, and full-stack starter in this catalog is single-vendor software: conceived, coded, tested, and maintained in-house by the exact same engineers who build client software at Wefik.
          </p>
        </div>

        {/* Single-Vendor vs Multi-Vendor Comparison */}
        <div className="bg-[var(--surface)] rounded-3xl p-8 sm:p-10 border border-[var(--border)] shadow-xs mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-deep-green">
            The Single-Vendor Difference
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--text)] tracking-tight mt-1 mb-6">
            What Single-Vendor Means for You
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-[var(--muted)]">
            <div className="p-5 rounded-2xl bg-[var(--surface-2)] border border-[var(--border)] space-y-3">
              <div className="flex items-center gap-2 text-[var(--text)] font-bold text-sm">
                <ShieldCheck className="w-4 h-4 text-deep-green" />
                <span>One Responsible Team</span>
              </div>
              <p className="leading-relaxed">
                On multi-vendor platforms, hundreds of anonymous authors sell unvetted code. If a theme breaks your site, the marketplace blames the author and the author blames WordPress. At Wefik.world, there is no buck-passing. One team writes the code, and one team supports it.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[var(--surface-2)] border border-[var(--border)] space-y-3">
              <div className="flex items-center gap-2 text-[var(--text)] font-bold text-sm">
                <Zap className="w-4 h-4 text-deep-green" />
                <span>Production-Tested in the Wild</span>
              </div>
              <p className="leading-relaxed">
                Our templates and tools are extracted from real commercial client builds. Before a block pattern or caching algorithm lands in our marketplace, it has already been deployed and tested on live high-traffic installations.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[var(--surface-2)] border border-[var(--border)] space-y-3">
              <div className="flex items-center gap-2 text-[var(--text)] font-bold text-sm">
                <Code2 className="w-4 h-4 text-deep-green" />
                <span>Clean Code &amp; Zero Builder Bloat</span>
              </div>
              <p className="leading-relaxed">
                We never ship themes wrapped in proprietary visual builders that lock you in or destroy your Core Web Vitals. Everything is built natively with Gutenberg Full Site Editing (FSE), modern CSS, or Tailwind CSS.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[var(--surface-2)] border border-[var(--border)] space-y-3">
              <div className="flex items-center gap-2 text-[var(--text)] font-bold text-sm">
                <CheckCircle2 className="w-4 h-4 text-deep-green" />
                <span>Fair Commercial Rights</span>
              </div>
              <p className="leading-relaxed">
                We provide clear Single-Site and Unlimited-Site commercial licenses without arbitrary annual support paywalls or surprise price hikes. You can deploy our assets for your paying clients with full confidence.
              </p>
            </div>
          </div>
        </div>

        {/* Agency Track Record (Factual Only) */}
        <div className="bg-[var(--surface)] rounded-3xl p-8 sm:p-10 border border-[var(--border)] shadow-xs mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-deep-green">
            Agency Track Record
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--text)] tracking-tight mt-1 mb-4">
            Proven Commercial Experience
          </h2>
          <p className="text-xs sm:text-sm text-[var(--muted)] leading-relaxed mb-6">
            Wefik Agency has delivered successful digital platforms, high-converting web applications, and brand identities for diverse commercial and institutional clients. These real client relationships represent our agency track record:
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { name: 'Niva Homeo', type: 'Healthcare Platform' },
              { name: 'ADSOC 6.0', type: 'Institutional Campaign' },
              { name: 'MarketDojo', type: 'SaaS Platform Development' },
              { name: 'StoryFinder', type: 'Digital Media Application' },
              { name: 'Corporate Legal Firm', type: 'Legal Services Web Portal' },
            ].map((client) => (
              <div
                key={client.name}
                className="p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-left"
              >
                <p className="text-xs font-bold text-[var(--text)]">{client.name}</p>
                <p className="text-[11px] text-[var(--muted)] mt-0.5">{client.type}</p>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-[var(--muted)] mt-4 italic">
            Note: Listed entities are client engagements of Wefik Agency (wefik.in), cited strictly as agency track record and not as product reviews.
          </p>
        </div>

        {/* Contact Block with Real Facts */}
        <div className="bg-[var(--surface)] rounded-3xl p-8 sm:p-10 border border-[var(--border)] shadow-xs mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-deep-green">
            Direct Contact Information
          </span>
          <h2 className="text-2xl font-bold text-[var(--text)] tracking-tight mt-1 mb-6">
            Get in Touch with Our Team
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-[var(--muted)]">
            <div className="flex items-start gap-3">
              <Phone className="w-4 h-4 text-deep-green mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-bold text-[var(--text)]">Telephone</p>
                <a href="tel:+919609653522" className="hover:text-[var(--accent)] font-mono">
                  +91 96096 53522
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="w-4 h-4 text-deep-green mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-bold text-[var(--text)]">Email Inquiries</p>
                <a href="mailto:hello@wefik.world" className="hover:text-[var(--accent)]">
                  hello@wefik.world
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="w-4 h-4 text-deep-green mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-bold text-[var(--text)]">Business Hours</p>
                <p>Monday through Friday: 09:00 – 18:00 IST</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-deep-green mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-bold text-[var(--text)]">Corporate Registered Office</p>
                <p>Wefik Agency, West Bengal, India</p>
                <p className="text-[11px] text-[var(--muted)]">[FOUNDER: Add exact street address and corporate CIN/GSTIN details]</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="p-8 sm:p-10 rounded-3xl bg-ink text-white flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-bold">Explore Our Digital Products</h3>
            <p className="text-xs text-slate-300 mt-1">
              Browse WordPress themes, speed plugins, HTML starters, and agency toolkits.
            </p>
          </div>
          <Button asChild className="bg-lime hover:bg-lime/90 text-ink font-bold h-11 px-6 rounded-xl text-xs flex-shrink-0">
            <Link href="/marketplace" className="inline-flex items-center gap-1.5">
              <span>Browse Marketplace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
