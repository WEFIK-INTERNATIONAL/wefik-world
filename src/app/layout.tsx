import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { PostHogProvider } from "@/components/providers/posthog-provider";
import { CartProvider } from "@/lib/cart-context";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CartDrawer } from "@/components/checkout/cart-drawer";
import { Toaster } from "@/components/ui/sonner";
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
    "https://github.com/wefikinternational",
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
            <Header />
            <CartDrawer />
            <main className="flex-1">{children}</main>
            <Footer />
            <Toaster richColors position="top-right" />
          </CartProvider>
        </PostHogProvider>
      </body>
    </html>
  );
}
