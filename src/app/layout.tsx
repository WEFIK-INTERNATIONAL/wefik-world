import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { PostHogProvider } from "@/components/providers/posthog-provider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "wefik.world — Digital Product Marketplace",
  description:
    "Curated WordPress themes, plugins, HTML templates, and code starters for developers and agencies.",
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
      <body className="min-h-full flex flex-col bg-white text-ink">
        <PostHogProvider>{children}</PostHogProvider>
      </body>
    </html>
  );
}
