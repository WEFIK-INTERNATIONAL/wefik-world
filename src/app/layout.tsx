import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { PostHogProvider } from "@/components/providers/posthog-provider";
import { CartProvider } from "@/lib/cart-context";
import { Header } from "@/components/layout/header";
import { BackToTop } from "@/components/ui/back-to-top";
import { Footer } from "@/components/layout/footer";
import { CartDrawer } from "@/components/checkout/cart-drawer";
import { SmoothScrollProvider } from "@/components/providers/smooth-scroll-provider";
import { TransitionProvider } from "@/components/transitions/transition-provider";
import { UnboxingPreloader } from "@/components/preloader/unboxing-preloader";
import { CommandPalette } from "@/components/search/command-palette";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://wefik.world"),
  title: {
    default: "wefik.world — Premium Digital Products for Agencies & Developers",
    template: "%s | wefik.world",
  },
  description:
    "Curated WordPress themes, plugins, HTML templates, and code starters by Wefik Agency. Single and unlimited commercial licenses with instant downloads.",
  keywords: [
    "WordPress themes",
    "WordPress plugins",
    "HTML templates",
    "Tailwind templates",
    "Digital marketplace India",
    "Agency templates",
    "Developer starters",
  ],
  authors: [{ name: "Wefik", url: "https://wefik.in" }],
  creator: "Wefik",
  openGraph: {
    type: "website",
    locale: "en_IE",
    url: "https://wefik.world",
    title: "wefik.world — Premium Digital Products for Agencies & Developers",
    description:
      "Curated WordPress themes, plugins, HTML templates, and code starters by Wefik Agency. Commercial licenses & instant downloads.",
    siteName: "wefik.world",
  },
  twitter: {
    card: "summary_large_image",
    title: "wefik.world — Premium Digital Products for Agencies & Developers",
    description:
      "Curated WordPress themes, plugins, HTML templates, and code starters by Wefik Agency.",
    creator: "@wefik",
  },
  robots: {
    index: true,
    follow: true,
  },
  ...(process.env.NEXT_PUBLIC_GSC_VERIFICATION || process.env.NEXT_PUBLIC_BING_VERIFICATION
    ? {
        verification: {
          ...(process.env.NEXT_PUBLIC_GSC_VERIFICATION
            ? { google: process.env.NEXT_PUBLIC_GSC_VERIFICATION }
            : {}),
          ...(process.env.NEXT_PUBLIC_BING_VERIFICATION
            ? { other: { "msvalidate.01": process.env.NEXT_PUBLIC_BING_VERIFICATION } }
            : {}),
        },
      }
    : {}),
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Wefik World",
  url: "https://wefik.world",
  potentialAction: {
    "@type": "SearchAction",
    target: "https://wefik.world/marketplace?q={search_term_string}",
    "query-input": "required name=search_term_string",
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Wefik World",
  url: "https://wefik.world",
  logo: "https://wefik.world/logo.png",
  description:
    "Single-vendor digital product marketplace offering production-grade WordPress themes, plugins, and web templates.",
  sameAs: [
    "https://wefik.in",
    "https://twitter.com/wefik",
    "https://github.com/WEFIK-INTERNATIONAL",
    "https://linkedin.com/company/wefik",
  ],
  founder: {
    "@type": "Organization",
    name: "Wefik Agency",
    url: "https://wefik.in",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} font-sans h-full antialiased`}
    >
      <head>
        {/* Google tag (gtag.js) */}
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-CM63W67CQY"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());

              gtag('config', 'G-CM63W67CQY');
            `,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteJsonLd),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd),
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-white text-ink selection:bg-lime/30 selection:text-ink">

        <PostHogProvider>
          <CartProvider>
            <SmoothScrollProvider>
              <TransitionProvider>
                <UnboxingPreloader />
                <CommandPalette />
                <Header />
                <CartDrawer />
                <main className="flex-1">{children}</main>
                <Footer />
                <BackToTop />
                <Toaster
                  position="top-right"
                  toastOptions={{
                    style: {
                      background: "#202124",
                      color: "#FFFFFF",
                      border: "1px solid rgba(163, 230, 53, 0.3)",
                      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5)",
                    },
                    className: "font-sans",
                  }}
                />
                <SpeedInsights />
              </TransitionProvider>
            </SmoothScrollProvider>
          </CartProvider>
        </PostHogProvider>
      </body>
    </html>
  );
}
