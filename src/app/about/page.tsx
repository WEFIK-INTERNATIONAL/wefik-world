import { Metadata } from 'next';
import Link from 'next/link';
import { ShieldCheck, Code2, HeartHandshake, ArrowRight, ExternalLink, Zap, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'About Wefik.world — The Engineering-First Digital Marketplace',
  description:
    'The story of Wefik.world. Built by Wefik Agency engineers to deliver high-performance, bloat-free WordPress themes, plugins, and web templates.',
  alternates: {
    canonical: 'https://wefik.world/about',
  },
};

export default function AboutPage() {
  return (
    <div className="w-full min-h-screen py-16 bg-soft border-b border-border">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-slate mb-6">
          <Link href="/" className="hover:text-ink transition-colors">Home</Link>
          <span>/</span>
          <span className="text-ink font-semibold">About</span>
        </nav>

        {/* Hero */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-border shadow-xs mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-deep-green">
            The Wefik Story
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-ink tracking-tight mt-2 mb-6">
            We Got Tired of Slow Themes and Abandoned Plugins
          </h1>
          <p className="text-sm sm:text-base text-slate leading-relaxed mb-6 font-normal">
            Wefik.world began as the private engineering toolkit of <a href="https://wefik.in" target="_blank" rel="noreferrer" className="text-deep-green font-semibold underline inline-flex items-center gap-0.5">Wefik Agency <ExternalLink className="w-3 h-3" /></a>. Over five years of building enterprise WordPress sites, high-converting SaaS landing pages, and bespoke web apps, our team faced the same recurring frustration: commercial marketplaces like ThemeForest and CodeCanyon were drowning in 80MB bloated themes, mandatory visual page builders that murdered Google PageSpeed scores, and third-party authors who disappeared six months after release.
          </p>
          <p className="text-sm sm:text-base text-slate leading-relaxed mb-8 font-normal">
            In 2026, we decided to open our internal library directly to the public. Every theme, plugin, HTML template, and full-stack starter on Wefik.world is conceived, coded, tested, and maintained by the same engineers who build client projects daily.
          </p>

          {/* Key Facts Box */}
          <div className="p-5 rounded-2xl bg-soft border border-border">
            <h3 className="text-xs font-bold uppercase tracking-wider text-ink mb-3">
              Wefik.world at a Glance
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate">
              <div>• <strong>Founded:</strong> 2026 (Wefik Agency operating since 2021)</div>
              <div>• <strong>Headquarters:</strong> West Bengal, India (Serving Global Creators)</div>
              <div>• <strong>Engineering Philosophy:</strong> Clean semantic code, zero bloat</div>
              <div>• <strong>Commercial Model:</strong> Single vendor, direct support</div>
            </div>
          </div>
        </div>

        {/* 3 Core Values */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="p-6 rounded-2xl bg-white border border-border">
            <div className="w-10 h-10 rounded-xl bg-lime/20 flex items-center justify-center text-deep-green mb-4">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-ink mb-2">Speed as a Feature</h3>
            <p className="text-xs text-slate leading-relaxed">
              We never ship themes wrapped in heavy visual page builders. Everything is styled with modern CSS or Tailwind and scores 95+ on Google Lighthouse.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-border">
            <div className="w-10 h-10 rounded-xl bg-white border border-border flex items-center justify-center text-deep-green mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-ink mb-2">Single-Vendor Support</h3>
            <p className="text-xs text-slate leading-relaxed">
              No buck-passing between third-party authors. When you ask for support, you speak directly with the engineers who authored the codebase.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-border">
            <div className="w-10 h-10 rounded-xl bg-white border border-border flex items-center justify-center text-deep-green mb-4">
              <Code2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-ink mb-2">Transparent Licensing</h3>
            <p className="text-xs text-slate leading-relaxed">
              Clear Single-Site and Unlimited-Site commercial licenses with lifetime updates and zero forced annual renewal penalties.
            </p>
          </div>
        </div>

        {/* CTA Box */}
        <div className="p-8 rounded-3xl bg-ink text-white flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-bold">Explore Our Digital Catalog</h3>
            <p className="text-xs text-slate-300 mt-1">
              Browse WordPress themes, speed plugins, HTML templates, and free starters.
            </p>
          </div>
          <Button asChild className="bg-lime hover:bg-lime/90 text-ink font-bold h-11 px-6 rounded-xl text-xs">
            <Link href="/marketplace">Browse Products</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
