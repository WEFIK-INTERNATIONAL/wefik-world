'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/brand/logo';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useLenis } from '@/components/providers/smooth-scroll-provider';
import { Loader2, ArrowRight, ExternalLink, ShieldCheck, Mail, ArrowUp } from 'lucide-react';

export function Footer() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { scrollTo } = useLenis();

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

  const handleBackToTop = (e: React.MouseEvent) => {
    e.preventDefault();
    scrollTo(0);
  };

  return (
    <footer className="w-full bg-[var(--surface)] border-t border-[var(--border)] mt-auto pt-16 pb-12 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Brand & Newsletter Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-12 border-b border-[var(--border)] items-start">
          <div className="lg:col-span-6 space-y-4">
            <Link href="/" className="inline-block">
              <Logo size="md" showWordmark={true} />
            </Link>
            <p className="body-small text-[var(--muted)] max-w-md">
              <strong className="text-[var(--text)]">Wefik.world — the official marketplace of Wefik.</strong>{' '}
              Built and supported in-house by the engineers at{' '}
              <a
                href="https://wefik.in"
                target="_blank"
                rel="noreferrer"
                className="text-[var(--accent)] font-semibold hover:underline inline-flex items-center gap-0.5"
              >
                Wefik Agency <ExternalLink className="w-3 h-3" />
              </a>
              . Fast, semantic WordPress themes, plugins, and web templates crafted with zero page builder bloat.
            </p>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 pt-1 text-xs text-[var(--muted)]">
              <a
                href="mailto:hello@wefik.world"
                className="hover:text-[var(--text)] transition-colors inline-flex items-center gap-1.5"
              >
                <Mail className="w-4 h-4 text-lime" />
                <span>hello@wefik.world</span>
              </a>
              <span className="text-[var(--border)]">•</span>
              <a
                href="tel:+919609653522"
                className="hover:text-[var(--text)] transition-colors font-mono"
              >
                +91 96096 53522
              </a>
              <span className="text-[var(--border)]">•</span>
              <span>Mon–Fri, 09:00–18:00 IST</span>
            </div>
          </div>

          <div className="lg:col-span-6 space-y-3">
            <span className="eyebrow text-[var(--text)]">Stay Ahead</span>
            <p className="body-small text-[var(--muted)]">
              Get notified of new WordPress block patterns, speed plugins, and limited lifetime deals.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="flex gap-2 max-w-md">
              <Input
                type="email"
                placeholder="developer@agency.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="h-10 text-xs bg-[var(--surface-2)] border-[var(--border)] text-[var(--text)] rounded-xl"
              />
              <Button
                type="submit"
                disabled={loading}
                className="h-10 px-4 bg-ink dark:bg-white text-white dark:text-ink hover:bg-black dark:hover:bg-slate-100 rounded-xl flex-shrink-0 text-xs font-semibold"
                aria-label="Subscribe to newsletter"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <span className="flex items-center gap-1.5">
                    <span>Subscribe</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                )}
              </Button>
            </form>
            <div className="flex items-center gap-1.5 text-[11px] text-[var(--muted)] pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-lime" />
              <span>Zero spam. Unsubscribe at any time.</span>
            </div>
          </div>
        </div>

        {/* 4 Columns (Marketplace / Company / Resources / Legal per Section 9) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-12 text-xs">
          {/* Col 1: Marketplace */}
          <div className="space-y-3">
            <h4 className="eyebrow text-[var(--text)]">Marketplace</h4>
            <ul className="space-y-2 text-[var(--muted)]">
              <li>
                <Link href="/marketplace" className="hover:text-[var(--text)] transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/wordpress-themes" className="hover:text-[var(--text)] transition-colors">
                  WordPress Themes
                </Link>
              </li>
              <li>
                <Link href="/wordpress-plugins" className="hover:text-[var(--text)] transition-colors">
                  WordPress Plugins
                </Link>
              </li>
              <li>
                <Link href="/html-templates" className="hover:text-[var(--text)] transition-colors">
                  HTML Templates
                </Link>
              </li>
              <li>
                <Link href="/bundles" className="hover:text-[var(--text)] transition-colors">
                  Curated Bundles (-60%)
                </Link>
              </li>
              <li>
                <Link href="/freebies" className="hover:text-[var(--text)] transition-colors">
                  Free Downloads
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 2: Company */}
          <div className="space-y-3">
            <h4 className="eyebrow text-[var(--text)]">Company</h4>
            <ul className="space-y-2 text-[var(--muted)]">
              <li>
                <a href="https://wefik.in" target="_blank" rel="noreferrer" className="hover:text-[var(--text)] transition-colors flex items-center gap-1">
                  Wefik Agency <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <Link href="/about" className="hover:text-[var(--text)] transition-colors">
                  About Wefik
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-[var(--text)] transition-colors">
                  All-Access Pricing
                </Link>
              </li>
              <li>
                <Link href="/themeforest-alternative" className="hover:text-[var(--text)] transition-colors">
                  ThemeForest Alternative
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[var(--text)] transition-colors">
                  Contact & Support
                </Link>
              </li>
              <li>
                <Link href="/status" className="hover:text-[var(--text)] transition-colors flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-lime animate-pulse" />
                  <span>System Status</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Resources */}
          <div className="space-y-3">
            <h4 className="eyebrow text-[var(--text)]">Resources</h4>
            <ul className="space-y-2 text-[var(--muted)]">
              <li>
                <Link href="/blog" className="hover:text-[var(--text)] transition-colors">
                  Engineering Blog
                </Link>
              </li>
              <li>
                <Link href="/faqs" className="hover:text-[var(--text)] transition-colors">
                  Frequently Asked Questions
                </Link>
              </li>
              <li>
                <Link href="/license" className="hover:text-[var(--text)] transition-colors">
                  Commercial Licensing
                </Link>
              </li>
              <li>
                <a href="/llms.txt" target="_blank" className="hover:text-[var(--text)] transition-colors flex items-center gap-1 font-mono text-[11px] text-[var(--accent)]">
                  /llms.txt (AI Specs)
                </a>
              </li>
              <li>
                <Link href="/sitemap.xml" className="hover:text-[var(--text)] transition-colors">
                  XML Sitemap
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Legal (All 7 Pages) */}
          <div className="space-y-3">
            <h4 className="eyebrow text-[var(--text)]">Legal & Policies</h4>
            <ul className="space-y-2 text-[var(--muted)]">
              <li>
                <Link href="/terms" className="hover:text-[var(--text)] transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-[var(--text)] transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/refunds" className="hover:text-[var(--text)] transition-colors">
                  Refund Policy
                </Link>
              </li>
              <li>
                <Link href="/license" className="hover:text-[var(--text)] transition-colors">
                  License Agreement (EULA)
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="hover:text-[var(--text)] transition-colors">
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link href="/membership-terms" className="hover:text-[var(--text)] transition-colors">
                  Membership Terms
                </Link>
              </li>
              <li>
                <Link href="/delivery" className="hover:text-[var(--text)] transition-colors">
                  Digital Delivery Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright, Socials, Secondary Theme Toggle, Back to Top */}
        <div className="pt-8 border-t border-[var(--border)] flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[var(--muted)]">
          <p>© {new Date().getFullYear()} Wefik World (Wefik Agency). All rights reserved.</p>

          <div className="flex items-center gap-6">
            <a
              href="https://twitter.com/wefik"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[var(--text)] transition-colors"
            >
              Twitter
            </a>
            <a
              href="https://github.com/WEFIK-INTERNATIONAL"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[var(--text)] transition-colors"
            >
              GitHub
            </a>
            <a
              href="https://linkedin.com/company/wefik"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[var(--text)] transition-colors"
            >
              LinkedIn
            </a>

            {/* Secondary Theme Toggle Placement (Section 9) */}
            <div className="flex items-center gap-2 pl-2 border-l border-[var(--border)]">
              <span className="text-[11px] font-mono">Theme:</span>
              <ThemeToggle />
            </div>

            {/* Back to top Link */}
            <button
              onClick={handleBackToTop}
              className="flex items-center gap-1 text-[var(--muted)] hover:text-lime transition-colors"
              aria-label="Back to top"
            >
              <span>Back to top</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
