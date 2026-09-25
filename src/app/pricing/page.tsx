import React from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { MembershipPricingCards } from '@/components/pricing/membership-pricing-cards';
import { ShieldCheck, HelpCircle, ArrowRight, Zap, Code2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'All-Access Memberships & Pricing — wefik.world',
  description:
    'Join our All-Access membership. Monthly and Lifetime options with unlimited downloads, commercial licenses, and priority developer support.',
};

export default async function PricingPage() {
  const supabase = await createClient();

  // Fetch plans from membership_plans DB table
  const { data: plansData } = await supabase
    .from('membership_plans')
    .select('plan, name, price_inr, interval, description, features')
    .eq('is_active', true);

  const fallbackPlans = [
    {
      plan: 'monthly' as const,
      name: 'All-Access Monthly',
      price_inr: 99900,
      interval: 'month',
      description: 'Unrestricted access to all current and future themes, plugins, and templates.',
      features: [
        'Access to all current digital products',
        'All new monthly releases included',
        'Unlimited personal & commercial project use',
        'Discord & priority email support',
        'Cancel anytime with one click',
      ],
    },
    {
      plan: 'lifetime' as const,
      name: 'Lifetime Deal',
      price_inr: 999900,
      interval: 'one-time',
      description: 'Pay once, get perpetual access to everything wefik ever builds. Zero renewals.',
      features: [
        'Perpetual access to all current & future products',
        'All major version upgrades included forever',
        'Unlimited site licenses for agency client work',
        'Direct founder Discord access & priority support',
        'Zero recurring bills or subscription fatigue',
      ],
    },
  ];

  const plans = (plansData && plansData.length > 0 ? plansData : fallbackPlans) as typeof fallbackPlans;

  const faqs = [
    {
      q: 'Can I use these products on client projects?',
      a: 'Yes! Both Single and Unlimited licenses (and All-Access memberships) include commercial usage rights. You can build, deploy, and charge clients for websites built with our themes and templates.',
    },
    {
      q: 'How does the All-Access Monthly subscription work?',
      a: 'When you subscribe to All-Access Monthly (₹999/mo), you can download any product in the store with an active subscription. Payments recur automatically via Razorpay Subscriptions every month, and you can cancel anytime with one click from your dashboard.',
    },
    {
      q: 'What happens if I cancel my monthly membership?',
      a: 'If you cancel, you will maintain full access until the end of your billing cycle. After expiry, previous client sites continue functioning legally, but new product downloads and updates require an active membership.',
    },
    {
      q: 'What is included in the Lifetime Deal?',
      a: 'The Lifetime Deal (₹9,999 one-time) grants permanent access to every current product AND all future products wefik releases. It never expires, never recurs, and includes unlimited site licenses forever.',
    },
    {
      q: 'Do you offer refunds?',
      a: 'Because digital products and license keys are delivered instantly upon purchase, we cannot offer unconditional refunds. However, if a product does not work as advertised and our support team cannot resolve it within 7 days, we issue a full refund.',
    },
    {
      q: 'Are updates and bug fixes included?',
      a: 'Yes. All active monthly members and lifetime members receive all version updates, Gutenberg block updates, and security patches immediately via their dashboard.',
    },
  ];

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.a,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-[calc(var(--header-height)+2.5rem)] pb-20 space-y-20">
        {/* Header with Substantive Copy */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lime/20 text-deep-green text-xs font-bold border border-lime/40">
            <Zap className="w-3.5 h-3.5" />
            <span>Single-Vendor All-Access Pass • Zero Renewal Traps</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-ink">
            One Membership. Every Current &amp; Future Asset.
          </h1>

          <div className="text-xs sm:text-sm text-slate max-w-2xl mx-auto leading-relaxed space-y-3 text-left sm:text-center">
            <p>
              The Wefik World All-Access Membership is built specifically for freelance web developers, creative agencies, and indie founders who need high-performance digital tools without subscription bloat. Instead of paying thousands of dollars across fragmented marketplaces for single themes and plugins that get abandoned after six months, you get an all-inclusive passport to everything our engineering studio builds.
            </p>
            <p>
              Every WordPress block theme, utility plugin, and Next.js starter in our catalog is authored, battle-tested on commercial client installations, and supported directly by the core engineering team at <a href="https://wefik.in" target="_blank" rel="noreferrer" className="text-deep-green font-semibold underline">Wefik Agency</a>. You receive unrestricted commercial usage rights to build and deploy paying client sites, backed by transparent policies: one-click monthly cancellation at the end of your billing period, and perpetual legal rights for every client site launched while your membership was active.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-xs font-semibold text-deep-green">
              <Link href="/membership-terms" className="underline hover:text-ink">
                Review Membership Terms &rarr;
              </Link>
              <span>•</span>
              <Link href="/license" className="underline hover:text-ink">
                Commercial License EULA &rarr;
              </Link>
              <span>•</span>
              <Link href="/refunds" className="underline hover:text-ink">
                7-Day Refund Policy &rarr;
              </Link>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <MembershipPricingCards plans={plans} />

        {/* FAQ Section */}
        <div id="faq" className="max-w-4xl mx-auto space-y-10 pt-10">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-deep-green">
              Got Questions?
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-slate">
              Everything you need to know about our digital product licensing and memberships.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {faqs.map((faq, i) => (
              <div key={i} className="p-6 rounded-2xl bg-soft border border-border space-y-2">
                <h3 className="font-bold text-sm text-ink">{faq.q}</h3>
                <p className="text-xs text-slate leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Support Callout */}
        <div className="bg-[#141714] text-white border border-white/10 dark:border-[var(--border)] p-8 sm:p-12 rounded-3xl text-center max-w-4xl mx-auto space-y-4 shadow-xl">
          <h3 className="text-xl sm:text-2xl font-bold">Have custom agency requirements?</h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
            Need custom WordPress plugin development or enterprise white-label solutions? Our agency team is ready to assist.
          </p>
          <div className="pt-2">
            <Button asChild className="bg-lime hover:bg-[#8fd32b] text-[#0a0f0a] font-bold text-xs h-10 px-6 rounded-xl shadow-md transition-all">
              <a href="https://wefik.in" target="_blank" rel="noreferrer">
                Contact Agency Team
              </a>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
