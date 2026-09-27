import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.wefik.world';

  // Section 5.1 & Part C — Explicitly allow AI search & citation crawlers
  const aiBots = [
    'GPTBot',
    'ChatGPT-User',
    'OAI-SearchBot',
    'ClaudeBot',
    'PerplexityBot',
    'Perplexity-User',
    'Google-Extended',
    'Bytespider',
    'Diffbot',
    'Applebot-Extended',
  ];

  const publicAllowedPaths = [
    '/',
    '/marketplace',
    '/products/*',
    '/bundles',
    '/freebies',
    '/pricing',
    '/about',
    '/contact',
    '/faqs',
    '/licensing',
    '/license',
    '/terms',
    '/privacy',
    '/refunds',
    '/cookies',
    '/membership-terms',
    '/delivery',
    '/blog',
    '/blog/*',
    '/wordpress-themes',
    '/wordpress-themes/*',
    '/wordpress-plugins',
    '/wordpress-plugins/*',
    '/html-templates',
    '/html-templates/*',
    '/code-snippets',
    '/code-snippets/*',
    '/alternatives/*',
    '/compare/*',
    '/themeforest-alternative',
    '/free/*',
    '/collections/*',
    '/glossary',
    '/glossary/*',
    '/llms.txt',
  ];

  const privateDisallowedPaths = [
    '/dashboard',
    '/dashboard/*',
    '/admin',
    '/admin/*',
    '/checkout',
    '/order-success',
    '/studio',
    '/studio/*',
    '/api/*',
    '/auth/*',
    '/account',
    '/account/*',
  ];

  return {
    rules: [
      {
        userAgent: '*',
        allow: publicAllowedPaths,
        disallow: privateDisallowedPaths,
      },
      ...aiBots.map((bot) => ({
        userAgent: bot,
        allow: publicAllowedPaths,
        disallow: privateDisallowedPaths,
      })),
    ],
    // Canonical sitemap index (child sitemaps are discovered via index)
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
