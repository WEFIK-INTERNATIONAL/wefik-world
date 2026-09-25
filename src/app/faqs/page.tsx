import { Metadata } from 'next';
import Link from 'next/link';
import { HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Frequently Asked Questions — Licenses, Billing & Support | Wefik.world',
  description:
    'Answers to all your questions about commercial licenses, lifetime updates, payment options, memberships, and technical support on Wefik.world.',
  alternates: {
    canonical: 'https://wefik.world/faqs',
  },
};

const faqs = [
  {
    category: 'Licensing & Usage',
    q: 'What is the difference between a Single-Site and Unlimited-Site license?',
    a: 'A Single-Site license permits installation and active use on exactly one production domain (plus one local or staging environment). An Unlimited-Site license grants rights to install the product on an infinite number of client and personal domains. Both tiers include lifetime product updates and commercial rights.',
  },
  {
    category: 'Licensing & Usage',
    q: 'Can I use these themes and templates for client commercial projects?',
    a: 'Yes. All paid products and memberships grant commercial usage rights. You can build websites for paying clients, charge for your design and development work, and transfer the final site to your client without requiring them to purchase an additional license.',
  },
  {
    category: 'Licensing & Usage',
    q: 'Can I resell or redistribute the theme and plugin files?',
    a: 'No. You may not resell, redistribute, sub-license, or share the raw source files or license keys on any other platform, forum, or asset store. The license is granted to you or your agency for completed deliverables.',
  },
  {
    category: 'Licensing & Usage',
    q: 'Are your WordPress themes and plugins GPL compatible?',
    a: 'Yes. All PHP code interacting directly with the WordPress core is licensed under the GNU General Public License (GPL). Any proprietary CSS, JavaScript, HTML, and design assets remain protected under Wefik commercial license terms.',
  },
  {
    category: 'Licensing & Usage',
    q: 'How does domain activation and whitelist management work?',
    a: 'Every purchase generates a unique WFK-XXXX license key. For Single-Site licenses, the first production domain activated is locked to that key. You can update or transfer your authorized domain anytime directly from your customer dashboard under the Licenses tab.',
  },
  {
    category: 'Downloads & Updates',
    q: 'How do downloads work and how long are links valid?',
    a: 'Downloads are generated securely via our download-url Edge Function. Links are cryptographically signed and valid for 60 seconds. You can generate fresh download links anytime by logging into your dashboard.',
  },
  {
    category: 'Downloads & Updates',
    q: 'Do I get free lifetime product updates?',
    a: 'Yes. All purchased individual products, bundles, and active memberships receive lifetime updates for bug fixes, security patches, and compatibility with new WordPress and Next.js major versions.',
  },
  {
    category: 'Downloads & Updates',
    q: 'What is your release schedule for new versions and changelogs?',
    a: 'We maintain an active release schedule with detailed semver changelogs published on every product detail page. Critical security updates are deployed within 24 hours of discovery.',
  },
  {
    category: 'Memberships',
    q: 'How does the All-Access Monthly Membership work?',
    a: 'The All-Access Monthly Membership costs ₹999/month and is billed automatically via Razorpay Subscriptions. You gain instant access to download every single theme, plugin, HTML template, and starter in our catalog for as long as your membership is active.',
  },
  {
    category: 'Memberships',
    q: 'What happens to my downloads if I cancel my monthly membership?',
    a: 'You keep all files and websites you have already downloaded and deployed. If you cancel your monthly membership, you will no longer receive new product downloads or updates, but existing client sites will continue functioning normally without interruption.',
  },
  {
    category: 'Memberships',
    q: 'What does the All-Access Lifetime Deal include?',
    a: 'The All-Access Lifetime Deal is a one-time payment of ₹9,999 with zero recurring fees. You receive perpetual access to all current products, all future releases forever, unlimited client site activations, and lifetime updates.',
  },
  {
    category: 'Billing & Payments',
    q: 'Which payment methods do you accept?',
    a: 'We accept all major Indian and international payment options via Razorpay: UPI (Google Pay, PhonePe, Paytm, BHIM), RuPay, Visa, Mastercard, American Express, and Indian NetBanking from 50+ banks.',
  },
  {
    category: 'Billing & Payments',
    q: 'Why are all prices listed in Indian Rupees (INR)?',
    a: 'Wefik is based in India, and we are an India-first digital marketplace. Storing and processing transactions in integer paise eliminates currency conversion markups, international transaction surcharges, and unpredictability for Indian creators.',
  },
  {
    category: 'Billing & Payments',
    q: 'Can I get a GST tax invoice for my business?',
    a: 'Yes. Upon successful checkout, an official tax invoice containing transaction reference, order ID, and breakdown is automatically generated and downloadable from your customer dashboard under Purchases.',
  },
  {
    category: 'Billing & Payments',
    q: 'What is your refund policy for digital downloads?',
    a: 'Because digital products and source code are delivered immediately upon payment, we cannot offer unconditional refunds. However, if a product is provably defective or fails to work as advertised and our engineering team cannot resolve it within 48 hours, we will issue a full refund.',
  },
  {
    category: 'Technical & Engineering',
    q: 'Do your themes require heavy page builders like Elementor or Divi?',
    a: 'No. We deliberately build our themes using clean, native Gutenberg block patterns and semantic CSS/Tailwind. This ensures zero visual builder bloat, effortless editing, and 95+ mobile Google PageSpeed scores out of the box.',
  },
  {
    category: 'Technical & Engineering',
    q: 'How fast do websites built with Wefik themes load?',
    a: 'Our products are engineered to achieve sub-1.0s Largest Contentful Paint (LCP) and 100/100 Core Web Vitals on standard cloud hosting. We eliminate redundant JavaScript libraries, purge unused CSS, and optimize all asset delivery.',
  },
  {
    category: 'Technical & Engineering',
    q: 'What is your technical support policy and response time?',
    a: 'We provide direct developer-level support for all active purchases and memberships. Our support covers installation assistance, bug reports, and theme compatibility questions with average response times under 12 hours on business days.',
  },
  {
    category: 'Freebies & Lead Magnets',
    q: 'Can I use free products on commercial client websites?',
    a: 'Yes. Free products on Wefik.world include commercial usage rights. They are provided as lead magnets to demonstrate our engineering quality and code standards.',
  },
  {
    category: 'Freebies & Lead Magnets',
    q: 'How do I report a security issue or vulnerability?',
    a: 'We take security very seriously. If you identify a potential security vulnerability in any Wefik product, please report it immediately to security@wefik.world. Valid reports receive priority engineering triage within 4 hours.',
  },
];

export default function FAQsPage() {
  const categories = Array.from(new Set(faqs.map((f) => f.category)));

  return (
    <div className="w-full min-h-screen py-16 bg-soft border-b border-border">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-slate mb-6">
          <Link href="/" className="hover:text-ink transition-colors">Home</Link>
          <span>/</span>
          <span className="text-ink font-semibold">Frequently Asked Questions</span>
        </nav>

        {/* Hero */}
        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-deep-green">
            Help Center & Knowledge Base
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-ink tracking-tight mt-2 mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-sm sm:text-base text-slate max-w-2xl mx-auto leading-relaxed">
            Everything you need to know about our commercial licenses, lifetime updates, payment options, memberships, and code quality standards.
          </p>
        </div>

        {/* FAQs grouped by Category */}
        <div className="space-y-10">
          {categories.map((cat) => (
            <div key={cat} className="space-y-4">
              <h2 className="text-lg font-bold text-ink border-b border-border pb-2 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-deep-green" />
                <span>{cat}</span>
              </h2>

              <div className="space-y-3">
                {faqs
                  .filter((f) => f.category === cat)
                  .map((faq, idx) => (
                    <details
                      key={idx}
                      className="group p-5 rounded-2xl bg-[var(--surface)] border border-border shadow-2xs transition-all"
                    >
                      <summary className="font-bold text-sm text-ink cursor-pointer list-none flex items-center justify-between">
                        <span>{faq.q}</span>
                        <span className="text-deep-green font-bold text-lg transition-transform group-open:rotate-45">
                          +
                        </span>
                      </summary>
                      <p className="text-xs text-slate mt-3 leading-relaxed">
                        {faq.a}
                      </p>
                    </details>
                  ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 p-8 rounded-3xl bg-[var(--surface)] border border-border text-center">
          <h3 className="text-lg font-bold text-ink mb-1">Still have questions?</h3>
          <p className="text-xs text-slate mb-6">
            Our engineering team is ready to answer any custom licensing or technical questions.
          </p>
          <div className="flex justify-center gap-3">
            <Button asChild className="bg-ink hover:bg-black text-white rounded-xl text-xs h-10 px-6 font-semibold">
              <a href="mailto:support@wefik.world">Contact Engineering Support</a>
            </Button>
            <Button asChild variant="outline" className="border-border rounded-xl text-xs h-10 px-6 font-semibold">
              <Link href="/licensing">Read Licensing Terms</Link>
            </Button>
          </div>
        </div>

        {/* FAQPage JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: faqs.map((f) => ({
                "@type": "Question",
                name: f.q,
                acceptedAnswer: {
                  "@type": "Answer",
                  text: f.a,
                },
              })),
            }),
          }}
        />
      </div>
    </div>
  );
}
