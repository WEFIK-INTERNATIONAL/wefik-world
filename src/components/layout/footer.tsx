'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowRight, ExternalLink, ShieldCheck } from 'lucide-react';

export function Footer() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to subscribe');
      }

      toast.success(data.message || 'Subscribed successfully!');
      setEmail('');
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Error subscribing';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="w-full bg-soft border-t border-border mt-auto pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 4 Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-14">
          {/* Column 1: Brand & Bio (2 cols wide on LG) */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-ink flex items-center justify-center text-lime">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M4 6L8 18L12 9L16 18L20 6"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle cx="12" cy="5" r="1.5" fill="#A3E635" />
                </svg>
              </div>
              <span className="text-xl font-bold tracking-tight text-ink">
                wefik<span className="text-deep-green">.world</span>
              </span>
            </Link>
            <p className="text-xs text-slate leading-relaxed max-w-sm">
              The digital product arm of{' '}
              <a
                href="https://wefik.in"
                target="_blank"
                rel="noreferrer"
                className="text-deep-green font-medium hover:underline inline-flex items-center gap-0.5"
              >
                Wefik Agency <ExternalLink className="w-3 h-3" />
              </a>
              . We craft production-grade WordPress themes, HTML templates, custom plugins, and developer code starters for agencies and ambitious creators worldwide.
            </p>

            <div className="pt-2 flex items-center gap-3 text-slate">
              <a
                href="https://github.com/wefikinternational"
                target="_blank"
                rel="noreferrer"
                aria-label="Wefik on GitHub"
                className="w-8 h-8 rounded-lg bg-white border border-border flex items-center justify-center hover:text-ink hover:border-slate transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
              </a>
              <a
                href="https://twitter.com/wefik"
                target="_blank"
                rel="noreferrer"
                aria-label="Wefik on Twitter"
                className="w-8 h-8 rounded-lg bg-white border border-border flex items-center justify-center hover:text-ink hover:border-slate transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href="https://linkedin.com/company/wefik"
                target="_blank"
                rel="noreferrer"
                aria-label="Wefik on LinkedIn"
                className="w-8 h-8 rounded-lg bg-white border border-border flex items-center justify-center hover:text-ink hover:border-slate transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Column 2: Products */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-ink">Catalog</h3>
            <ul className="space-y-2 text-xs text-slate">
              <li>
                <Link href="/marketplace?category=wordpress-themes" className="hover:text-ink transition-colors">
                  WordPress Themes
                </Link>
              </li>
              <li>
                <Link href="/marketplace?category=html-templates" className="hover:text-ink transition-colors">
                  HTML5 & Tailwind Templates
                </Link>
              </li>
              <li>
                <Link href="/marketplace?category=plugins" className="hover:text-ink transition-colors">
                  WordPress Plugins
                </Link>
              </li>
              <li>
                <Link href="/bundles" className="hover:text-ink transition-colors font-medium text-deep-green">
                  Product Bundles (Save 60%)
                </Link>
              </li>
              <li>
                <Link href="/freebies" className="hover:text-ink transition-colors">
                  Freebies & Starters
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-ink transition-colors">
                  All-Access Memberships
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Resources & Company */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-ink">Company</h3>
            <ul className="space-y-2 text-xs text-slate">
              <li>
                <a href="https://wefik.in" target="_blank" rel="noreferrer" className="hover:text-ink transition-colors">
                  Wefik Agency
                </a>
              </li>
              <li>
                <Link href="/blog" className="hover:text-ink transition-colors">
                  Engineering & Design Blog
                </Link>
              </li>
              <li>
                <Link href="/pricing#faq" className="hover:text-ink transition-colors">
                  Frequently Asked Questions
                </Link>
              </li>
              <li>
                <Link href="/licenses" className="hover:text-ink transition-colors">
                  Commercial License Terms
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-ink transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-ink transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Newsletter Subscription */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-ink">Stay Updated</h3>
            <p className="text-xs text-slate leading-relaxed">
              Get notified of new WordPress releases, freebie drops, and seasonal deals.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="space-y-2">
              <div className="flex gap-1.5">
                <Input
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="h-10 text-xs bg-white border-border rounded-xl"
                />
                <Button
                  type="submit"
                  disabled={loading}
                  className="h-10 px-3 bg-ink hover:bg-black text-white rounded-xl flex-shrink-0"
                  aria-label="Subscribe to newsletter"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <ArrowRight className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </form>
            <div className="flex items-center gap-1 text-[11px] text-slate/80 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-deep-green" />
              <span>Zero spam. Unsubscribe at any time.</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate">
          <p>© {new Date().getFullYear()} Wefik World (Wefik Agency). All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span>Secured by Razorpay</span>
            <span>•</span>
            <span>Prices shown in INR (₹)</span>
            <span>•</span>
            <span className="font-mono text-[10px] bg-white px-2 py-0.5 rounded border border-border">
              v1.0-mvp
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
