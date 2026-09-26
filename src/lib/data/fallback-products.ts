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

export const FALLBACK_PRODUCTS: ProductData[] = [
  {
    id: 'p0000000-0000-0000-0000-000000000001',
    title: 'AgencyPro — Modern Agency WordPress Theme',
    slug: 'agencypro-theme',
    tagline: 'Ultra-fast full-site editing theme with 20+ pre-designed block patterns for creative agencies.',
    description: `### AgencyPro WordPress Theme

AgencyPro is a high-performance Full Site Editing (FSE) block theme conceived, coded, and battle-tested by the engineering team at Wefik Agency (wefik.in). Designed specifically for digital agencies, creative studios, and freelance designers, AgencyPro eliminates the multi-megabyte JavaScript overhead and database bloat associated with visual drag-and-drop builders like Elementor or Divi.

Every layout is built natively using WordPress core Gutenberg block patterns and semantic HTML5, allowing lightning-fast sub-second Largest Contentful Paint (LCP) times and effortless 95+ scores on mobile Google PageSpeed Insights. The theme includes 20+ bespoke block patterns, dynamic client case study filters, testimonial grids, customizable pricing tables, and interactive portfolio galleries.

#### Technical Specifications & System Requirements
- **WordPress Core:** WordPress 6.4 or higher (FSE Block Theme architecture)
- **PHP Compatibility:** PHP 8.1, 8.2, and 8.3 fully tested with strict type checking
- **CSS Architecture:** Native Gutenberg theme.json styling with Tailwind CSS utility extensions
- **Builder Dependencies:** 100% Core Gutenberg; zero external page builder plugins required
- **Database Overhead:** Zero custom database tables; clean uninstallation guaranteed

#### Licensing & Commercial Rights
All purchases include immediate commercial deployment rights under our Single-Site or Unlimited-Site licenses (/license), lifetime security updates, and direct technical support from our in-house engineering team.`,
    price_inr: 249900,
    is_free: false,
    is_featured: true,
    is_bundle: false,
    thumbnail_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80',
    gallery_urls: [
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=1200&auto=format&fit=crop&q=80'
    ],
    demo_url: 'https://demo.wefik.in/agencypro',
    tech_stack: ['WordPress 6.4+', 'Gutenberg FSE', 'PHP 8.2', 'Tailwind CSS'],
    rating_avg: 0,
    rating_count: 0,
    download_count: 0,
    category: { name: 'WordPress Themes', slug: 'wordpress-themes' },
    versions: [
      {
        version: '1.0.0',
        changelog: 'Initial stable release with 20+ FSE block patterns, dark mode support, and 95+ PageSpeed optimization.',
        is_latest: true,
        created_at: '2026-09-20T00:00:00Z',
      },
    ],
  },
  {
    id: 'p0000000-0000-0000-0000-000000000002',
    title: 'SuperFast Cache & WebP Optimizer',
    slug: 'superfast-cache-plugin',
    tagline: 'Lightweight WordPress caching, CSS/JS minification, and automatic WebP image conversion.',
    description: `### SuperFast Cache & WebP Optimizer

SuperFast Cache & Optimizer is a lightweight, zero-configuration WordPress performance utility engineered by Wefik Agency to solve real-world website slowness without the bloat, upsell notices, and complex configuration screens of legacy caching plugins.

Operating with strict single-vendor discipline, SuperFast Cache writes clean static HTML cache files directly to your server storage, bypassing costly PHP processing and MySQL database queries for returning visitors. On media uploads, it automatically generates modern WebP images while preserving original master copies, slashing page weights by up to 70%. It also handles asynchronous CSS/JS asset deferral and critical stylesheet preloading.

#### Technical Specifications & System Requirements
- **WordPress Compatibility:** Tested through WordPress 6.6+
- **PHP Compatibility:** PHP 8.1 to 8.3 with GD or Imagick extension for WebP processing
- **Web Server Support:** Apache, Nginx, LiteSpeed, and OpenLiteSpeed
- **Admin Footprint:** Zero promotional banners, zero telemetry trackers, and zero admin dashboard slowdown
- **Clean Uninstallation:** Complete database cleanup routine leaves zero orphaned options

#### Licensing & Support
Includes commercial usage rights on client sites under Single or Unlimited licensing (/license), lifetime compatibility updates, and direct support from Wefik engineers.`,
    price_inr: 149900,
    is_free: false,
    is_featured: true,
    is_bundle: false,
    thumbnail_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80',
    gallery_urls: ['https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&auto=format&fit=crop&q=80'],
    demo_url: 'https://demo.wefik.in/superfast-cache',
    tech_stack: ['WordPress Plugin', 'PHP 8.2', 'WebP Conversion', 'Object Cache'],
    rating_avg: 0,
    rating_count: 0,
    download_count: 0,
    category: { name: 'WordPress Plugins', slug: 'wordpress-plugins' },
    versions: [
      {
        version: '1.0.0',
        changelog: 'Initial production release featuring static page caching, automated WebP image conversion, and script deferral.',
        is_latest: true,
        created_at: '2026-09-20T00:00:00Z',
      },
    ],
  },
  {
    id: 'p0000000-0000-0000-0000-000000000003',
    title: 'SaaSPulse — Modern Next.js 15 SaaS Starter',
    slug: 'saaspulse-nextjs-template',
    tagline: 'Complete SaaS marketing template with pricing tables, feature grids, and dashboard mockups.',
    description: `### SaaSPulse Next.js 15 SaaS Template

SaaSPulse is a production-ready marketing and dashboard starter kit designed for indie hackers, software founders, and digital agencies building high-converting web applications. Built on modern Next.js 15 App Router architecture with React 19, SaaSPulse eliminates weeks of boilerplate frontend development.

The template includes 12 modular landing page sections: high-impact hero variations, feature grids, interactive comparison tables, multi-tier pricing toggles, customer testimonial cards, and an integrated blog shell. Styled with Tailwind CSS and accessible shadcn/ui component primitives, every component supports built-in dark and light theme switching.

#### Technical Specifications & System Requirements
- **Framework:** Next.js 15 (App Router, Server Components & Suspense boundaries)
- **Language & Runtime:** TypeScript strict mode, Node.js 18.18+ or Node 20+
- **Styling:** Tailwind CSS v3/v4 with CSS variables and shadcn/ui primitives
- **SEO & Performance:** Pre-configured JSON-LD structured data, dynamic OpenGraph metadata, and 100/100 Core Web Vitals
- **Deployment:** Zero-config 1-click deployment on Vercel, Netlify, or Cloudflare Pages

#### Commercial License
Deploy on client deliverables or your own SaaS startups with full commercial rights (/license) and zero royalty obligations.`,
    price_inr: 199900,
    is_free: false,
    is_featured: true,
    is_bundle: false,
    thumbnail_url: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=80',
    gallery_urls: ['https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=1200&auto=format&fit=crop&q=80'],
    demo_url: 'https://demo.wefik.in/saaspulse',
    tech_stack: ['Next.js 15', 'TypeScript', 'Tailwind CSS', 'shadcn/ui'],
    rating_avg: 0,
    rating_count: 0,
    download_count: 0,
    category: { name: 'HTML Templates', slug: 'templates-starters' },
    versions: [
      {
        version: '1.0.0',
        changelog: 'Initial release with Next.js 15 App Router, TypeScript strict mode, and 12 pre-built marketing sections.',
        is_latest: true,
        created_at: '2026-09-20T00:00:00Z',
      },
    ],
  },
  {
    id: 'p0000000-0000-0000-0000-000000000004',
    title: 'Minimal Portfolio — Free HTML & Tailwind Template',
    slug: 'minimal-portfolio-free',
    tagline: 'Clean, distraction-free one-page portfolio template for designers, developers, and photographers.',
    description: `### Minimal Portfolio (Free Edition)

Minimal Portfolio is an elegant, distraction-free one-page website template designed for freelance software developers, UX/UI designers, creative photographers, and technical consultants looking to showcase their work cleanly.

Crafted with clean semantic HTML5 and modern Tailwind CSS, this template weighs less than 40KB in total payload and renders instantaneously on mobile networks. It features a concise personal bio section, a responsive work showcase grid with lightbox image support, skills badges, and an accessible contact form shell compatible with modern serverless endpoints like Resend or Formspree.

#### Technical Specifications & System Requirements
- **Core Technology:** Clean semantic HTML5, Vanilla JavaScript (ES6+), zero heavy frameworks
- **Styling:** Tailwind CSS with responsive breakpoints and automated dark mode adaptation
- **Browser Compatibility:** Google Chrome, Apple Safari, Mozilla Firefox, Microsoft Edge (modern standards)
- **External Dependencies:** Zero npm build dependencies required for basic static hosting

#### 100% Free Commercial Rights
Claim this product with zero credit card entry. Includes a verified cryptographic license key (\`WFK-XXXX\`) and commercial rights to build and deploy for paying clients (/license).`,
    price_inr: 0,
    is_free: true,
    is_featured: false,
    is_bundle: false,
    thumbnail_url: 'https://images.unsplash.com/photo-1481487196290-c152efe083f5?w=800&auto=format&fit=crop&q=80',
    gallery_urls: ['https://images.unsplash.com/photo-1481487196290-c152efe083f5?w=1200&auto=format&fit=crop&q=80'],
    demo_url: 'https://demo.wefik.in/minimal-portfolio',
    tech_stack: ['HTML5', 'Tailwind CSS', 'Vanilla JS'],
    rating_avg: 0,
    rating_count: 0,
    download_count: 0,
    category: { name: 'HTML Templates', slug: 'templates-starters' },
    versions: [
      {
        version: '1.0.0',
        changelog: 'Initial open-source release with responsive layout, clean typography, and zero framework dependencies.',
        is_latest: true,
        created_at: '2026-09-20T00:00:00Z',
      },
    ],
  },
  {
    id: 'p0000000-0000-0000-0000-000000000005',
    title: 'The Complete Agency Growth Bundle',
    slug: 'agency-growth-bundle',
    tagline: 'Save 40%: AgencyPro Theme + SuperFast Cache Plugin + SaaSPulse Next.js Starter in one package.',
    description: `### The Complete Agency Growth Bundle

The Complete Agency Growth Bundle is our flagship 3-in-1 digital product suite, packaging our most popular themes, performance utilities, and frontend starters into a single discounted kit. Built for digital agencies and freelancers who build websites for paying clients, this bundle saves over 40% compared to purchasing individual licenses.

#### What’s Included in This Bundle:
1. **AgencyPro WordPress Theme (₹2,499 value):** High-speed Gutenberg Full Site Editing theme with 20+ agency block patterns and sub-second loading speeds.
2. **SuperFast Cache & WebP Optimizer (₹1,499 value):** Lightweight caching and automatic WebP image converter utility for WordPress.
3. **SaaSPulse Next.js 15 SaaS Template (₹1,999 value):** Complete React 19 / Next.js 15 marketing landing page and dashboard shell.

*Total individual item value: ₹5,997. Bundle price: ₹3,999.*

#### Technical Standards & Single-Vendor Assurance
Every item in this bundle is engineered in-house by Wefik Agency (wefik.in). Unlike multi-vendor platforms where bundled assets from different authors conflict and cause fatal errors, our products are built with coordinated coding standards. All items include individual commercial license keys, lifetime compatibility updates, and direct support under our Commercial License Agreement (/license).`,
    price_inr: 399900,
    is_free: false,
    is_featured: true,
    is_bundle: true,
    bundle_product_ids: [
      'p0000000-0000-0000-0000-000000000001',
      'p0000000-0000-0000-0000-000000000002',
      'p0000000-0000-0000-0000-000000000003',
    ],
    thumbnail_url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=80',
    gallery_urls: ['https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&auto=format&fit=crop&q=80'],
    demo_url: 'https://demo.wefik.in/agencypro',
    tech_stack: ['WordPress 6.4+', 'Next.js 15', 'Tailwind CSS', 'PHP 8.2'],
    rating_avg: 0,
    rating_count: 0,
    download_count: 0,
    category: { name: 'Bundles', slug: 'bundles' },
    versions: [
      {
        version: '1.0.0',
        changelog: 'Initial bundle package comprising AgencyPro v1.0, SuperFast Cache v1.0, and SaaSPulse v1.0.',
        is_latest: true,
        created_at: '2026-09-20T00:00:00Z',
      },
    ],
  },
  {
    id: 'p0000000-0000-0000-0000-000000000006',
    title: 'LeadCraft — High-Converting Landing Page Starter',
    slug: 'leadcraft-landing-page',
    tagline: 'Lightweight, conversion-optimized HTML & Tailwind landing page with A/B test ready hero sections.',
    description: `### LeadCraft Landing Page Starter

LeadCraft is a conversion-engineered HTML5 and Tailwind CSS landing page template designed for performance marketers, paid media consultants, and growth agencies running Google Ads, Meta Ads, and LinkedIn campaigns.

Built with a laser focus on mobile conversion rates, LeadCraft loads in under 400ms and achieves a clean 100/100 score on Core Web Vitals. It comes equipped with 5 modular hero section variations designed for rapid A/B split testing, social proof quote carousels, FAQ accordions, feature highlight matrices, and pre-wired lead generation forms with client-side validation.

#### Technical Specifications & System Requirements
- **Markup & Styling:** Clean semantic HTML5, Tailwind CSS with minimal CSS payload
- **Scripting:** Pure Vanilla JavaScript for mobile navigation toggles and form validation; zero jQuery overhead
- **Analytics Ready:** Pre-configured data attributes and script slots for Google Tag Manager (GTM), GA4, and PostHog
- **Cross-Browser Verification:** Tested across mobile Chrome, iOS Safari, desktop Firefox, Edge, and Samsung Internet

#### Commercial Licensing & Guarantee
Deploy across unlimited client marketing campaigns with our Unlimited-Site License (/license). Backed by our 7-Day Refund Policy (/refunds) if the code does not perform as documented.`,
    price_inr: 99900,
    is_free: false,
    is_featured: false,
    is_bundle: false,
    thumbnail_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80',
    gallery_urls: ['https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&auto=format&fit=crop&q=80'],
    demo_url: 'https://demo.wefik.in/leadcraft',
    tech_stack: ['HTML5', 'Tailwind CSS', 'Vanilla JS', 'Analytics Ready'],
    rating_avg: 0,
    rating_count: 0,
    download_count: 0,
    category: { name: 'HTML Templates', slug: 'templates-starters' },
    versions: [
      {
        version: '1.0.0',
        changelog: 'Initial release featuring 5 hero variants, form validation, and 100/100 mobile PageSpeed optimization.',
        is_latest: true,
        created_at: '2026-09-20T00:00:00Z',
      },
    ],
  },
];
