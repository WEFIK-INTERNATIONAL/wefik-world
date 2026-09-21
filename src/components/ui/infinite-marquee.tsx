'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, Zap, CheckCircle2, Shield } from 'lucide-react';
import { TransitionLink } from '@/components/transitions/transition-link';

const MARQUEE_ITEMS = [
  { label: 'Gutenberg Full-Site Editing Themes', href: '/wordpress-themes', tag: '0.8s LCP' },
  { label: 'High-Performance WordPress Plugins', href: '/wordpress-plugins', tag: 'Zero Bloat' },
  { label: 'Modern Tailwind HTML Templates', href: '/html-templates', tag: 'TypeScript Ready' },
  { label: 'ThemeForest Alternative for Agencies', href: '/themeforest-alternative', tag: 'Unlimited Sites' },
  { label: 'Curated Agency Super-Bundles', href: '/bundles', tag: 'Save 60%' },
  { label: '100% Free Production Starters', href: '/freebies', tag: 'Instant License' },
  { label: 'All-Access Flat Rate Membership', href: '/pricing', tag: 'From ₹999/mo' },
];

export function InfiniteMarquee() {
  return (
    <div className="w-full overflow-hidden py-4 bg-soft border-y border-border/80 select-none">
      <div className="animate-marquee flex items-center gap-6 whitespace-nowrap">
        {/* Set 1 */}
        {MARQUEE_ITEMS.map((item, idx) => (
          <TransitionLink
            key={`m1-${idx}`}
            href={item.href}
            className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white border border-border/60 hover:border-deep-green/40 hover:shadow-xs transition-all text-xs font-semibold text-ink group"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-lime" />
            <span className="group-hover:text-deep-green transition-colors">{item.label}</span>
            <span className="text-[10px] font-mono text-slate bg-soft px-2 py-0.5 rounded-full border border-border/60">
              {item.tag}
            </span>
          </TransitionLink>
        ))}

        {/* Set 2 (Duplicate for continuous loop) */}
        {MARQUEE_ITEMS.map((item, idx) => (
          <TransitionLink
            key={`m2-${idx}`}
            href={item.href}
            className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white border border-border/60 hover:border-deep-green/40 hover:shadow-xs transition-all text-xs font-semibold text-ink group"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-lime" />
            <span className="group-hover:text-deep-green transition-colors">{item.label}</span>
            <span className="text-[10px] font-mono text-slate bg-soft px-2 py-0.5 rounded-full border border-border/60">
              {item.tag}
            </span>
          </TransitionLink>
        ))}
      </div>
    </div>
  );
}
