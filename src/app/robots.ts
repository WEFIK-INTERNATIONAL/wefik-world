import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://wefik.world';

  // Section 5.1 & 9 — Explicitly allow major AI search & citation crawlers
  const aiBots = [
    'GPTBot',
    'ChatGPT-User',
    'ClaudeBot',
    'PerplexityBot',
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
    '/faqs',
    '/licensing',
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
    sitemap: [
      `${baseUrl}/sitemap.xml`,
      `${baseUrl}/sitemap-products.xml`,
      `${baseUrl}/sitemap-content.xml`,
      `${baseUrl}/sitemap-programmatic.xml`,
    ],
    host: baseUrl,
  };
}
