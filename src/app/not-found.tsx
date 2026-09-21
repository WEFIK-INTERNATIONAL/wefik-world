import React from 'react';
import Link from 'next/link';
import { Search, ArrowRight, Compass, Sparkles, ShieldCheck } from 'lucide-react';

export default function NotFound() {
  return (
    <main className="min-h-[75vh] flex flex-col items-center justify-center px-4 py-16 text-center max-w-4xl mx-auto">
      <span className="text-xs font-semibold uppercase tracking-wider text-deep-green bg-lime/20 px-3.5 py-1 rounded-full border border-lime/30 mb-4">
        404 — Page Not Found
      </span>

      <h1 className="text-4xl sm:text-5xl font-extrabold text-ink tracking-tight mb-4">
        Looking for something specific?
      </h1>

      <p className="text-slate max-w-lg text-base mb-8">
        The link you followed may be outdated, moved, or misspelled. Use the search bar below or explore our most popular digital hubs.
      </p>

      {/* Helpful Search Box per Section 9 */}
      <form
        action="/marketplace"
        method="GET"
        className="w-full max-w-md relative mb-10 flex items-center shadow-sm rounded-2xl overflow-hidden border border-border bg-white focus-within:ring-2 focus-within:ring-deep-green"
      >
        <Search className="w-4 h-4 text-slate ml-4 flex-shrink-0" />
        <input
          type="text"
          name="q"
          placeholder="Search WordPress themes, plugins, templates..."
          className="w-full py-3.5 pl-3 pr-24 text-sm text-ink bg-transparent focus:outline-none"
        />
        <button
          type="submit"
          className="absolute right-1.5 top-1.5 bottom-1.5 px-4 bg-deep-green hover:bg-deep-green/90 text-white text-xs font-bold rounded-xl transition-colors"
        >
          Search
        </button>
      </form>

      {/* Popular Links to retain link equity per Section 9 */}
      <div className="w-full bg-soft/50 rounded-3xl p-6 sm:p-8 border border-border/80">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate mb-5">
          Popular Marketplace Categories & Resources
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-left">
          <Link
            href="/wordpress-themes"
            className="p-3.5 bg-white rounded-2xl border border-border/60 hover:border-deep-green/40 hover:shadow-sm transition-all group"
          >
            <span className="text-xs font-bold text-ink group-hover:text-deep-green flex items-center justify-between">
              WordPress Themes
              <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            </span>
            <span className="text-[11px] text-slate block mt-1">Lightweight, FSE block patterns</span>
          </Link>

          <Link
            href="/wordpress-plugins"
            className="p-3.5 bg-white rounded-2xl border border-border/60 hover:border-deep-green/40 hover:shadow-sm transition-all group"
          >
            <span className="text-xs font-bold text-ink group-hover:text-deep-green flex items-center justify-between">
              WordPress Plugins
              <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            </span>
            <span className="text-[11px] text-slate block mt-1">Speed, utility & security</span>
          </Link>

          <Link
            href="/html-templates"
            className="p-3.5 bg-white rounded-2xl border border-border/60 hover:border-deep-green/40 hover:shadow-sm transition-all group"
          >
            <span className="text-xs font-bold text-ink group-hover:text-deep-green flex items-center justify-between">
              HTML Templates
              <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            </span>
            <span className="text-[11px] text-slate block mt-1">Modern CSS & Tailwind</span>
          </Link>

          <Link
            href="/freebies"
            className="p-3.5 bg-white rounded-2xl border border-border/60 hover:border-deep-green/40 hover:shadow-sm transition-all group"
          >
            <span className="text-xs font-bold text-ink group-hover:text-deep-green flex items-center justify-between">
              Free Products
              <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            </span>
            <span className="text-[11px] text-slate block mt-1">100% free with genuine licenses</span>
          </Link>

          <Link
            href="/themeforest-alternative"
            className="p-3.5 bg-white rounded-2xl border border-border/60 hover:border-deep-green/40 hover:shadow-sm transition-all group"
          >
            <span className="text-xs font-bold text-ink group-hover:text-deep-green flex items-center justify-between">
              ThemeForest Alternative
              <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            </span>
            <span className="text-[11px] text-slate block mt-1">Why builders switch to Wefik</span>
          </Link>

          <Link
            href="/pricing"
            className="p-3.5 bg-white rounded-2xl border border-border/60 hover:border-deep-green/40 hover:shadow-sm transition-all group"
          >
            <span className="text-xs font-bold text-ink group-hover:text-deep-green flex items-center justify-between">
              All-Access Membership
              <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            </span>
            <span className="text-[11px] text-slate block mt-1">Unlimited access from ₹999/mo</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
