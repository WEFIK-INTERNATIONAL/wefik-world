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
}

export const FALLBACK_PRODUCTS: ProductData[] = [
  {
    id: 'p0000000-0000-0000-0000-000000000001',
    title: 'AgencyPro — Modern Agency WordPress Theme',
    slug: 'agencypro-theme',
    tagline: 'Ultra-fast full-site editing theme with 20+ pre-designed block patterns for creative agencies.',
    description: `### AgencyPro WordPress Theme\n\nAgencyPro is engineered specifically for digital agencies and freelancers who demand speed and flexibility without bulky page builders.\n\n- **100/100 Google PageSpeed score** out of the box.\n- **Full Site Editing (FSE)** with 20+ Gutenberg block patterns.\n- **Dynamic Case Studies** with interactive filtering.\n- One-click demo importer in 60 seconds.`,
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
    tech_stack: ['WordPress', 'Gutenberg', 'FSE', 'Tailwind CSS', 'PHP 8.2'],
    rating_avg: 4.95,
    rating_count: 28,
    download_count: 342,
    category: { name: 'WordPress Themes', slug: 'wordpress-themes' },
  },
  {
    id: 'p0000000-0000-0000-0000-000000000002',
    title: 'SuperFast Cache & WebP Optimizer',
    slug: 'superfast-cache-plugin',
    tagline: 'Lightweight WordPress caching, CSS/JS minification, and automatic WebP image conversion.',
    description: `### SuperFast Cache & Optimizer\n\nA lightweight, zero-configuration WordPress performance plugin that eliminates bloat and makes pages load in under 500ms.\n\n- **Static Page Caching** for lightning-quick TTFB.\n- **Automated WebP Conversion** on image uploads.\n- **Asset Minification** and deferral.`,
    price_inr: 149900,
    is_free: false,
    is_featured: true,
    is_bundle: false,
    thumbnail_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80',
    gallery_urls: ['https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&auto=format&fit=crop&q=80'],
    demo_url: 'https://demo.wefik.in/superfast-cache',
    tech_stack: ['WordPress Plugin', 'PHP 8.2', 'Redis Cache', 'WebP'],
    rating_avg: 4.88,
    rating_count: 19,
    download_count: 512,
    category: { name: 'WordPress Plugins', slug: 'wordpress-plugins' },
  },
  {
    id: 'p0000000-0000-0000-0000-000000000003',
    title: 'SaaSPulse — Modern Next.js 15 SaaS Starter',
    slug: 'saaspulse-nextjs-template',
    tagline: 'Complete SaaS marketing template with pricing tables, feature grids, and dashboard mockups.',
    description: `### SaaSPulse Next.js 15 SaaS Template\n\nThe ultimate landing page and dashboard template for indie hackers and developers launching their next software product.\n\n- Built with **Next.js 15 App Router** and **React 19**.\n- Styled with **Tailwind CSS** and **shadcn/ui**.\n- 12 pre-built marketing sections + dashboard shell.`,
    price_inr: 199900,
    is_free: false,
    is_featured: true,
    is_bundle: false,
    thumbnail_url: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=80',
    gallery_urls: ['https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=1200&auto=format&fit=crop&q=80'],
    demo_url: 'https://demo.wefik.in/saaspulse',
    tech_stack: ['Next.js 15', 'TypeScript', 'Tailwind CSS', 'shadcn/ui'],
    rating_avg: 5.0,
    rating_count: 14,
    download_count: 215,
    category: { name: 'HTML Templates', slug: 'templates-starters' },
  },
  {
    id: 'p0000000-0000-0000-0000-000000000004',
    title: 'Minimal Portfolio — Free HTML & Tailwind Template',
    slug: 'minimal-portfolio-free',
    tagline: 'Clean, distraction-free one-page portfolio template for designers, developers, and photographers.',
    description: `### Minimal Portfolio (Free Edition)\n\nA free, elegant one-page portfolio template built with clean HTML5 and Tailwind CSS. Perfect for showing off work and capturing client inquiries.\n\n- **100% Free** for personal and commercial client work.\n- One-click instant claim.\n- Fully responsive layout.`,
    price_inr: 0,
    is_free: true,
    is_featured: false,
    is_bundle: false,
    thumbnail_url: 'https://images.unsplash.com/photo-1481487196290-c152efe083f5?w=800&auto=format&fit=crop&q=80',
    gallery_urls: ['https://images.unsplash.com/photo-1481487196290-c152efe083f5?w=1200&auto=format&fit=crop&q=80'],
    demo_url: 'https://demo.wefik.in/minimal-portfolio',
    tech_stack: ['HTML5', 'Tailwind CSS', 'Vanilla JS'],
    rating_avg: 4.91,
    rating_count: 45,
    download_count: 1240,
    category: { name: 'HTML Templates', slug: 'templates-starters' },
  },
  {
    id: 'p0000000-0000-0000-0000-000000000005',
    title: 'The Complete Agency Growth Bundle',
    slug: 'agency-growth-bundle',
    tagline: 'Save 40%: AgencyPro Theme + SuperFast Cache Plugin + SaaSPulse Next.js Starter in one package.',
    description: `### The Complete Agency Growth Bundle\n\nEverything you need to build, optimize, and market client websites at scale.\n\n1. **AgencyPro WordPress Theme** (₹2,499 value)\n2. **SuperFast Cache & WebP Optimizer** (₹1,499 value)\n3. **SaaSPulse Next.js 15 Starter** (₹1,999 value)\n\n*Total individual value: ₹5,997. Bundle price: ₹3,999.*`,
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
    tech_stack: ['WordPress', 'Next.js 15', 'Tailwind CSS', 'PHP 8.2'],
    rating_avg: 5.0,
    rating_count: 32,
    download_count: 180,
    category: { name: 'Bundles', slug: 'bundles' },
  },
  {
    id: 'p0000000-0000-0000-0000-000000000006',
    title: 'LeadCraft — High-Converting Landing Page Starter',
    slug: 'leadcraft-landing-page',
    tagline: 'Lightweight, conversion-optimized HTML & Tailwind landing page with A/B test ready hero sections.',
    description: `### LeadCraft Landing Page\n\nBuilt specifically for performance marketers and agencies generating leads.\n\n- Sub-second load times.\n- Pre-wired with form validation and Google Analytics 4 tags.\n- 5 alternative hero variations.`,
    price_inr: 99900,
    is_free: false,
    is_featured: false,
    is_bundle: false,
    thumbnail_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80',
    gallery_urls: ['https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&auto=format&fit=crop&q=80'],
    demo_url: 'https://demo.wefik.in/leadcraft',
    tech_stack: ['HTML5', 'Tailwind CSS', 'JavaScript'],
    rating_avg: 4.86,
    rating_count: 11,
    download_count: 98,
    category: { name: 'HTML Templates', slug: 'templates-starters' },
  },
];
