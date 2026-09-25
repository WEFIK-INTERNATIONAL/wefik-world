import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs/config";

const nextConfig: NextConfig = {
  // MDX support
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],

  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "plus.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
        pathname: "/**",
      },
    ],
  },

  // Permanent redirects (P1-9: /faq -> /faqs, Phase 3: /signup -> /login, Legal & Category Aliases)
  async redirects() {
    return [
      {
        source: "/faq",
        destination: "/faqs",
        permanent: true,
      },
      {
        source: "/signup",
        destination: "/login",
        permanent: true,
      },
      {
        source: "/refund",
        destination: "/refunds",
        permanent: true,
      },
      {
        source: "/licensing",
        destination: "/license",
        permanent: true,
      },
      {
        source: "/plugins",
        destination: "/wordpress-plugins",
        permanent: true,
      },
      {
        source: "/terms-of-service",
        destination: "/terms",
        permanent: true,
      },
      {
        source: "/privacy-policy",
        destination: "/privacy",
        permanent: true,
      },
    ];
  },

  // Security headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG || "wefik",
  project: process.env.SENTRY_PROJECT || "wefik-world",
  silent: !process.env.CI,
  widenClientFileUpload: true,
  sourcemaps: {
    disable: !process.env.SENTRY_AUTH_TOKEN,
  },
});
