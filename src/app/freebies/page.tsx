import React from 'react';
import Link from 'next/link';
import { getProducts } from '@/lib/data/products';
import { FreebieClaimCard } from '@/components/marketplace/freebie-claim-card';
import { FreebieMagnetKit } from '@/components/freebies/freebie-magnet-kit';
import { Gift, Zap, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const metadata = {
  title: 'Freebies & Lead Magnets — 100% Free Templates',
  description:
    'Claim high-quality free WordPress themes, HTML templates, and code starters by Wefik. Zero payment, instant license keys, full commercial rights.',
};

export default async function FreebiesPage() {
  const allProducts = await getProducts();
  const freebies = allProducts.filter((p) => p.is_free);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-[calc(var(--header-height)+2.5rem)] pb-16 space-y-16">
      {/* Freebies Hero */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lime/20 text-deep-green text-xs font-bold border border-lime/40">
          <Gift className="w-3.5 h-3.5" />
          <span>Zero Cost • Instant Claim • Commercial Rights</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-ink">
          100% Free Developer Starters & Templates
        </h1>

        <p className="text-sm sm:text-base text-slate max-w-2xl mx-auto leading-relaxed">
          Experience Wefik quality without spending a rupee. Claim verified open-source and
          commercial-ready templates with instant automated license key generation.
        </p>
      </div>

      {/* Freebies Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-ink">Available Freebies ({freebies.length})</h2>
          <span className="text-xs text-slate font-medium">No credit card or payment required</span>
        </div>

        {freebies.length === 0 ? (
          <div className="p-12 text-center bg-soft rounded-2xl border border-border">
            <p className="text-sm text-slate">No freebies available right now. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {freebies.map((product) => (
              <FreebieClaimCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>

      {/* How it Works / Trust Section */}
      <div className="p-8 sm:p-12 rounded-3xl bg-soft border border-border space-y-8">
        <div className="text-center max-w-2xl mx-auto">
          <h3 className="text-xl font-extrabold text-ink">How Our Freebie System Works</h3>
          <p className="text-xs text-slate mt-1">
            Free products bypass payment gateways entirely. Claim with one click, get an official WFK key, and download immediately.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-border space-y-2">
            <div className="w-8 h-8 rounded-full bg-lime/20 text-deep-green flex items-center justify-center font-bold text-xs">
              1
            </div>
            <h4 className="font-bold text-sm text-ink">Click Claim Free</h4>
            <p className="text-xs text-slate leading-relaxed">
              Sign in with your email or Google account and click &quot;Claim Free License&quot;.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-border space-y-2">
            <div className="w-8 h-8 rounded-full bg-lime/20 text-deep-green flex items-center justify-center font-bold text-xs">
              2
            </div>
            <h4 className="font-bold text-sm text-ink">Instant License Key</h4>
            <p className="text-xs text-slate leading-relaxed">
              Our Deno Edge Function generates a secure WFK-XXXX license record in your Supabase account.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-border space-y-2">
            <div className="w-8 h-8 rounded-full bg-lime/20 text-deep-green flex items-center justify-center font-bold text-xs">
              3
            </div>
            <h4 className="font-bold text-sm text-ink">Download & Build</h4>
            <p className="text-xs text-slate leading-relaxed">
              Access clean zip downloads anytime from your user dashboard with commercial usage rights.
            </p>
          </div>
        </div>
      </div>

      {/* Freebie Magnet & Share Kit per Section 10 */}
      <FreebieMagnetKit />
    </div>
  );
}
