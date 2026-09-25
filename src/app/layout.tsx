import type { Metadata } from "next";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { PostHogProvider } from "@/components/providers/posthog-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { CartProvider } from "@/lib/cart-context";
import { WishlistProvider } from "@/lib/wishlist-context";
import { CompareProvider } from "@/lib/compare-context";
import { Header } from "@/components/layout/header";
import { BackToTop } from "@/components/ui/back-to-top";
import { Footer } from "@/components/layout/footer";
import { CartDrawer } from "@/components/checkout/cart-drawer";
import { CompareDock } from "@/components/marketplace/compare-dock";
import { CompareModal } from "@/components/marketplace/compare-modal";
import { CookieConsent } from "@/components/trust/cookie-consent";
import { TawkToChat } from "@/components/trust/tawkto-chat";
import { SmoothScrollProvider } from "@/components/providers/smooth-scroll-provider";
import { TransitionProvider } from "@/components/transitions/transition-provider";
import { UnboxingPreloader } from "@/components/preloader/unboxing-preloader";
import dynamic from 'next/dynamic';
import { Toaster } from "sonner";
import "./globals.css";

const CommandPalette = dynamic(
  () => import('@/components/search/command-palette').then((mod) => mod.CommandPalette)
);

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["600", "700"],
  display: "swap",
  preload: true,
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  preload: false,
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["500"],
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  icons: {
    icon: [{ url: "/logo.svg", type: "image/svg+xml" }],
    apple: "/logo.svg",
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://wefik.world"),
  alternates: {
    canonical: "/",
  },
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

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': 'https://www.wefik.in/#organization',
  name: 'Wefik',
  url: 'https://www.wefik.in/',
  logo: 'https://wefik.world/icon.svg',
  description:
    'Wefik is a digital agency specializing in web design, digital products, and full-stack engineering. Creator and single-vendor publisher of the Wefik.world marketplace.',
  telephone: '+91 96096 53522',
  contactPoint: [
    {
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
  ],
  sameAs: [
    'https://wefik.world',
    'https://twitter.com/wefik',
    'https://github.com/WEFIK-INTERNATIONAL',
    'https://linkedin.com/company/wefik',
  ],
};

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': 'https://wefik.world/#website',
  name: 'Wefik World',
  url: 'https://wefik.world',
  description:
    'The official digital marketplace of Wefik. Production-ready WordPress themes, plugins, and web templates built and supported by the Wefik team.',
  publisher: {
    '@id': 'https://www.wefik.in/#organization',
  },
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://wefik.world/marketplace?q={search_term_string}',
    'query-input': 'required name=search_term_string',
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
      className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable} font-sans h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <meta name="color-scheme" content="light dark" />
        <link rel="icon" href="/logo.svg" type="image/svg+xml" />
        {/* Anti-flash inline script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');var s=window.matchMedia('(prefers-color-scheme: dark)').matches;if(t==='dark'||(!t&&s)){document.documentElement.classList.add('dark');}else{document.documentElement.classList.remove('dark');}}catch(e){}})();`,
          }}
        />
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
      <body className="min-h-full flex flex-col bg-[var(--bg)] text-[var(--text)] transition-colors duration-200">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <PostHogProvider>
            <CartProvider>
              <WishlistProvider>
                <CompareProvider>
                  <SmoothScrollProvider>
                    <TransitionProvider>
                      <UnboxingPreloader />
                      <CommandPalette />
                      <Header />
                      <CartDrawer />
                      <main className="flex-1">{children}</main>
                      <CompareDock />
                      <CompareModal />
                      <CookieConsent />
                      <TawkToChat />
                      <Footer />
                      <BackToTop />
                      <Toaster
                        position="top-right"
                        toastOptions={{
                          style: {
                            background: "var(--surface)",
                            color: "var(--text)",
                            border: "1px solid var(--border)",
                            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5)",
                          },
                          className: "font-sans",
                        }}
                      />
                      <SpeedInsights />
                    </TransitionProvider>
                  </SmoothScrollProvider>
                </CompareProvider>
              </WishlistProvider>
            </CartProvider>
          </PostHogProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
