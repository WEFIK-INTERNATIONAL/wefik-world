import { Metadata } from 'next';
import Link from 'next/link';
import { Check, X, Shield, Zap, HelpCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'The ThemeForest Alternative for Modern Agencies & Creators | Wefik.world',
  description:
    'Tired of bloated 80MB themes and abandoned plugins on ThemeForest? Discover Wefik.world: single-vendor code, 100/100 speed, lifetime updates, and Indian UPI payments.',
  alternates: {
    canonical: 'https://wefik.world/themeforest-alternative',
  },
};

export default function ThemeForestAlternativePage() {
  return (
    <div className="w-full min-h-screen py-16 bg-soft border-b border-border">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-slate mb-6">
          <Link href="/" className="hover:text-ink transition-colors">Home</Link>
          <span>/</span>
          <span className="text-ink font-semibold">ThemeForest Alternative</span>
        </nav>

        {/* Hero */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-border shadow-xs mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-deep-green">
            Marketplace Comparison
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-ink tracking-tight mt-2 mb-6">
            The ThemeForest Alternative: Why Buying Direct Saves Money & Headaches
          </h1>
          <p className="text-sm sm:text-base text-slate leading-relaxed mb-6 font-normal">
            For over a decade, ThemeForest and Envato have dominated the digital theme market. But as Google tightened its Core Web Vitals algorithms, the cracks in the multi-vendor marketplace model became undeniable: 80MB mega-themes packed with 40 third-party plugins, endless visual builder lock-in, recurring 6-month support renewal fees, and authors who vanish when a critical WordPress security patch lands.
          </p>
          <p className="text-sm sm:text-base text-slate leading-relaxed font-normal">
            Wefik.world was created as the direct antithesis to ThemeForest: a single-vendor marketplace where every theme and plugin is engineered in-house, audited for 95+ mobile PageSpeed scores, and backed by lifetime updates and transparent INR pricing.
          </p>
        </div>

        {/* Head-to-Head Comparison Table */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-border shadow-xs mb-10 overflow-x-auto">
          <h2 className="text-xl font-bold text-ink mb-6">ThemeForest vs. Wefik.world</h2>

          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border text-slate uppercase tracking-wider font-semibold">
                <th className="py-3 pr-4">Evaluation Criteria</th>
                <th className="py-3 px-4 text-center">ThemeForest (Envato)</th>
                <th className="py-3 px-4 text-center bg-lime/10 text-deep-green font-bold rounded-t-xl">
                  Wefik.world
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-ink">
              <tr>
                <td className="py-3.5 pr-4 font-medium">Vendor Architecture</td>
                <td className="py-3.5 px-4 text-center text-slate">Multi-Vendor (Thousands of independent sellers)</td>
                <td className="py-3.5 px-4 text-center bg-lime/10 font-bold text-deep-green">Single-Vendor (100% In-House Team)</td>
              </tr>
              <tr>
                <td className="py-3.5 pr-4 font-medium">Code Bloat & PageSpeed</td>
                <td className="py-3.5 px-4 text-center text-slate">Heavy visual builders, 50-80MB theme archives</td>
                <td className="py-3.5 px-4 text-center bg-lime/10 font-bold text-deep-green">Native Gutenberg, Tailwind CSS, 95+ Score</td>
              </tr>
              <tr>
                <td className="py-3.5 pr-4 font-medium">Support Renewal Fees</td>
                <td className="py-3.5 px-4 text-center text-rose-500 font-medium">6 Months included; paid renewals required</td>
                <td className="py-3.5 px-4 text-center bg-lime/10 font-bold text-deep-green">Lifetime Updates & Ongoing Support</td>
              </tr>
              <tr>
                <td className="py-3.5 pr-4 font-medium">Currency & Payment Options</td>
                <td className="py-3.5 px-4 text-center text-slate">USD with credit card forex conversion surcharges</td>
                <td className="py-3.5 px-4 text-center bg-lime/10 font-bold text-deep-green">Direct INR with Instant UPI (GPay/PhonePe)</td>
              </tr>
              <tr>
                <td className="py-3.5 pr-4 font-medium">All-Access Memberships</td>
                <td className="py-3.5 px-4 text-center text-slate">Separate Elements subscription with limited licenses</td>
                <td className="py-3.5 px-4 text-center bg-lime/10 font-bold text-deep-green">Monthly (₹999) & Lifetime Deal (₹9,999)</td>
              </tr>
              <tr>
                <td className="py-3.5 pr-4 font-medium">Developer Accountability</td>
                <td className="py-3.5 px-4 text-center text-slate">Envato support disclaims author plugin bugs</td>
                <td className="py-3.5 px-4 text-center bg-lime/10 font-bold text-deep-green">Direct developer communication & fast triage</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 4 Reasons Why Agencies Switch */}
        <div className="space-y-4 mb-12">
          <div className="p-6 rounded-2xl bg-white border border-border">
            <h3 className="text-base font-bold text-ink mb-1">1. Zero Visual Page Builder Lock-In</h3>
            <p className="text-xs text-slate leading-relaxed">
              ThemeForest themes almost universally require Elementor or WPBakery to function, generating thousands of nested `&lt;div&gt;` tags that slow down Google indexing. Wefik themes utilize native WordPress block patterns and clean semantic HTML for lightning-fast mobile rendering.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-border">
            <h3 className="text-base font-bold text-ink mb-1">2. No Foreign Transaction Surcharges for India</h3>
            <p className="text-xs text-slate leading-relaxed">
              Indian freelancers and agencies buying from ThemeForest typically pay in USD and suffer an additional 3.5% foreign transaction bank surcharge plus GST discrepancies. Wefik charges in exact Indian Rupees (INR) with native UPI QR code scan checkout.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-border">
            <h3 className="text-base font-bold text-ink mb-1">3. Guaranteed Single-Vendor Accountability</h3>
            <p className="text-xs text-slate leading-relaxed">
              When a theme author on ThemeForest stops maintaining their product, Envato does not issue refunds after 3 months. At Wefik, our core agency team uses these exact themes on client projects every week, guaranteeing proactive maintenance and immediate updates.
            </p>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="p-8 rounded-3xl bg-ink text-white flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-bold">Ready to Experience Bloat-Free Themes?</h3>
            <p className="text-xs text-slate-300 mt-1">
              Start with our free products or explore the marketplace with instant INR checkout.
            </p>
          </div>
          <div className="flex gap-3">
            <Button asChild className="bg-lime hover:bg-lime/90 text-ink font-bold h-11 px-6 rounded-xl text-xs">
              <Link href="/marketplace">Browse Themes</Link>
            </Button>
            <Button asChild variant="outline" className="border-border text-white hover:bg-white/10 h-11 px-6 rounded-xl text-xs">
              <Link href="/freebies">Claim Freebie</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
