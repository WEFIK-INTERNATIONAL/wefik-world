import { Metadata } from 'next';
import Link from 'next/link';
import { ShieldAlert, Printer, Mail, Phone, ExternalLink } from 'lucide-react';
import { PrintButton } from '@/components/account/print-button';

export const metadata: Metadata = {
  title: 'Terms & Conditions — Wefik.world',
  description:
    'Terms of Service and commercial conditions governing accounts, purchases, digital delivery, memberships, and usage of Wefik.world assets.',
  alternates: {
    canonical: 'https://wefik.world/terms',
  },
};

export default function TermsPage() {
  const lastUpdated = 'September 25, 2026';

  const sections = [
    { id: 'introduction', title: '1. Introduction & Acceptance' },
    { id: 'accounts', title: '2. User Accounts & Security' },
    { id: 'orders', title: '3. Orders, Pricing & Razorpay Payments' },
    { id: 'digital-delivery', title: '4. Digital Delivery & Access' },
    { id: 'licenses', title: '5. Software Licenses & Usage Rights' },
    { id: 'memberships', title: '6. All-Access Memberships & Subscriptions' },
    { id: 'acceptable-use', title: '7. Acceptable Use & Prohibitions' },
    { id: 'intellectual-property', title: '8. Intellectual Property Rights' },
    { id: 'termination', title: '9. Account Suspension & Termination' },
    { id: 'liability', title: '10. Limitation of Liability & Warranty Disclaimer' },
    { id: 'governing-law', title: '11. Governing Law & Dispute Resolution' },
    { id: 'changes', title: '12. Modifications to Terms' },
    { id: 'contact', title: '13. Contact & Grievance Officer' },
  ];

  return (
    <div className="w-full min-h-screen pt-[calc(var(--header-height)+2rem)] pb-20 bg-[var(--bg)] border-b border-[var(--border)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-[var(--muted)] mb-8 print:hidden">
          <Link href="/" className="hover:text-[var(--text)] transition-colors">Home</Link>
          <span>/</span>
          <span className="text-[var(--text)] font-semibold">Terms &amp; Conditions</span>
        </nav>

        {/* Header */}
        <div className="bg-[var(--surface)] rounded-3xl p-8 sm:p-12 border border-[var(--border)] shadow-xs mb-10 print:border-none print:p-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-6 mb-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-deep-green">
                Legal Agreement
              </span>
              <h1 className="text-3xl sm:text-5xl font-extrabold text-[var(--text)] tracking-tight mt-1">
                Terms &amp; Conditions
              </h1>
              <p className="text-xs text-[var(--muted)] mt-2">
                Last updated: <span className="font-semibold text-[var(--text)]">{lastUpdated}</span>
              </p>
            </div>
            <div className="print:hidden">
              <PrintButton />
            </div>
          </div>

          <p className="text-sm text-[var(--muted)] leading-relaxed">
            <strong className="text-[var(--text)]">Wefik.world</strong> is the official digital product marketplace operated by <strong className="text-[var(--text)]">Wefik Agency</strong> (referred to as &ldquo;Wefik&rdquo;, &ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;). These Terms and Conditions govern your access to and use of wefik.world, our digital products, software licenses, memberships, and related services. By registering an account, purchasing a product, or accessing our catalog, you agree to be bound by these terms.
          </p>
        </div>

        {/* Table of Contents */}
        <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-xs mb-12 print:hidden">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text)] mb-3">
            Table of Contents
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {sections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="text-[var(--muted)] hover:text-deep-green dark:hover:text-lime transition-colors"
              >
                {s.title}
              </a>
            ))}
          </div>
        </div>

        {/* Legal Text Content */}
        <div className="space-y-12 text-xs sm:text-sm text-[var(--muted)] leading-relaxed">
          <section id="introduction" className="space-y-3 scroll-mt-24">
            <h2 className="text-base sm:text-lg font-bold text-[var(--text)]">
              1. Introduction &amp; Acceptance
            </h2>
            <p>
              These Terms constitute a legally binding agreement between you (whether individually or on behalf of an entity) and Wefik. If you do not agree with any part of these Terms, you must discontinue use of the marketplace immediately. If you are entering into this agreement on behalf of a company or client, you represent that you have legal authority to bind that entity.
            </p>
          </section>

          <section id="accounts" className="space-y-3 scroll-mt-24">
            <h2 className="text-base sm:text-lg font-bold text-[var(--text)]">
              2. User Accounts &amp; Security
            </h2>
            <p>
              To purchase products, claim freebies, or manage licenses, you must register an account using a valid email address. You agree to:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Provide accurate, current, and complete registration information. Disposable or temporary email domains are prohibited and automatically rejected.</li>
              <li>Maintain the confidentiality of your credentials and restrict access to your account.</li>
              <li>Promptly notify us at <a href="mailto:hello@wefik.world" className="underline">hello@wefik.world</a> of any unauthorized account access.</li>
              <li>Optionally configure two-factor authentication (TOTP) and a verified secondary recovery email via your Account Security settings to protect your assets.</li>
            </ul>
          </section>

          <section id="orders" className="space-y-3 scroll-mt-24">
            <h2 className="text-base sm:text-lg font-bold text-[var(--text)]">
              3. Orders, Pricing &amp; Razorpay Payments
            </h2>
            <p>
              All prices on Wefik.world are denominated in Indian Rupees (INR) and computed in exact integer paise. Unless stated otherwise, applicable Goods and Services Tax (GST) is included in the stated checkout price.
            </p>
            <p>
              Payments are processed through our authorized payment partner, <strong className="text-[var(--text)]">Razorpay</strong>. We support Unified Payments Interface (UPI via Google Pay, PhonePe, Paytm, BHIM), Indian NetBanking, RuPay, Visa, and Mastercard. We do not store credit card numbers, CVVs, or UPI PINs on our servers.
            </p>
            <p>
              Orders are confirmed only after successful Razorpay payment authorization and webhook verification. Wefik reserves the right to cancel orders resulting from pricing errors or suspicious activity.
            </p>
          </section>

          <section id="digital-delivery" className="space-y-3 scroll-mt-24">
            <h2 className="text-base sm:text-lg font-bold text-[var(--text)]">
              4. Digital Delivery &amp; Access
            </h2>
            <p>
              Wefik.world sells exclusively digital downloadable assets. There are no physical shipments. Delivery is executed immediately upon confirmed payment:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Digital files become instantly accessible in your <Link href="/account/library" className="underline font-semibold">Account Library</Link>.</li>
              <li>Download links are cryptographically signed URLs with a 60-second validity window to protect cloud storage bandwidth and prevent unauthorized hotlinking.</li>
              <li>For complete delivery protocols, consult our <Link href="/delivery" className="underline font-semibold">Digital Delivery Policy</Link>.</li>
            </ul>
          </section>

          <section id="licenses" className="space-y-3 scroll-mt-24">
            <h2 className="text-base sm:text-lg font-bold text-[var(--text)]">
              5. Software Licenses &amp; Usage Rights
            </h2>
            <p>
              All purchases grant a non-exclusive, non-transferable commercial software license governed by our <Link href="/license" className="underline font-semibold">Commercial License Agreement (EULA)</Link>:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>Single-Site License:</strong> Authorizes installation and use on exactly one (1) production website domain for yourself or one paying client, plus local development and staging environments.</li>
              <li><strong>Unlimited-Site License:</strong> Authorizes deployment across an unlimited number of domains for yourself and paying agency clients.</li>
              <li><strong>Redistribution Prohibition:</strong> Under no circumstance may you resell, redistribute, sub-license, repackage, or offer our source code, themes, plugins, or templates in any digital repository or competing marketplace.</li>
            </ul>
          </section>

          <section id="memberships" className="space-y-3 scroll-mt-24">
            <h2 className="text-base sm:text-lg font-bold text-[var(--text)]">
              6. All-Access Memberships &amp; Subscriptions
            </h2>
            <p>
              We offer All-Access Monthly and Lifetime Deal membership plans. Memberships unlock access to all digital products in our catalog during the active term.
            </p>
            <p>
              Monthly memberships renew automatically every 30 days until cancelled. You may cancel your membership at any time directly through your <Link href="/account/membership" className="underline font-semibold">Account Membership</Link> tab with zero termination fees. Cancellation takes effect at the end of the current billing cycle. Full terms are detailed in our <Link href="/membership-terms" className="underline font-semibold">Membership Terms</Link>.
            </p>
          </section>

          <section id="acceptable-use" className="space-y-3 scroll-mt-24">
            <h2 className="text-base sm:text-lg font-bold text-[var(--text)]">
              7. Acceptable Use &amp; Prohibitions
            </h2>
            <p>You agree that you will not:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Attempt to scrape, reverse engineer, or decompile any part of the marketplace infrastructure or Edge API services.</li>
              <li>Circumvent or tamper with rate limits, token authentication, or signed download URL generators.</li>
              <li>Use our software or digital assets in connection with any illegal, defamatory, fraudulent, or malicious activities.</li>
              <li>Share account credentials or license keys on public forums, warez repositories, or torrent sites.</li>
            </ul>
          </section>

          <section id="intellectual-property" className="space-y-3 scroll-mt-24">
            <h2 className="text-base sm:text-lg font-bold text-[var(--text)]">
              8. Intellectual Property Rights
            </h2>
            <p>
              All digital assets, codebases, documentation, logos, design marks, graphics, and text on Wefik.world are the intellectual property of Wefik Agency and are protected by applicable copyright, trademark, and intellectual property laws of India and international treaties. You purchase a license to use the software; you do not acquire ownership of the underlying intellectual property.
            </p>
          </section>

          <section id="termination" className="space-y-3 scroll-mt-24">
            <h2 className="text-base sm:text-lg font-bold text-[var(--text)]">
              9. Account Suspension &amp; Termination
            </h2>
            <p>
              Wefik reserves the right to suspend or terminate your account and revoke active license keys without refund if we detect a breach of these Terms, software piracy, fraudulent chargebacks, or unauthorized source code redistribution.
            </p>
          </section>

          <section id="liability" className="space-y-3 scroll-mt-24">
            <h2 className="text-base sm:text-lg font-bold text-[var(--text)]">
              10. Limitation of Liability &amp; Warranty Disclaimer
            </h2>
            <p>
              Our products are provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo;. While we rigorously test all themes and plugins for performance, security, and standards compliance, Wefik does not guarantee that our software will operate without interruption or will be compatible with all third-party plugins, server configurations, or outdated PHP versions.
            </p>
            <p>
              To the maximum extent permitted by law, Wefik shall not be liable for any indirect, incidental, punitive, or consequential damages resulting from the use or inability to use our products. Our maximum total liability for any claim shall not exceed the amount actually paid by you for the specific product or membership giving rise to the claim.
            </p>
          </section>

          <section id="governing-law" className="space-y-3 scroll-mt-24">
            <h2 className="text-base sm:text-lg font-bold text-[var(--text)]">
              11. Governing Law &amp; Dispute Resolution
            </h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the Republic of India. Any legal dispute, controversy, or claim arising out of or relating to these Terms shall be subject to the exclusive jurisdiction of the competent courts located in West Bengal, India. <span className="text-[var(--text)]">[FOUNDER: Confirm preferred city/jurisdiction court for litigation]</span>.
            </p>
          </section>

          <section id="changes" className="space-y-3 scroll-mt-24">
            <h2 className="text-base sm:text-lg font-bold text-[var(--text)]">
              12. Modifications to Terms
            </h2>
            <p>
              We reserve the right to revise these Terms from time to time. When changes occur, we will update the &ldquo;Last updated&rdquo; timestamp at the top of this page. Material revisions will be communicated via email to registered account holders or prominent notice on the site. Continued use of our products after changes constitute acceptance of the updated Terms.
            </p>
          </section>

          <section id="contact" className="space-y-3 scroll-mt-24">
            <h2 className="text-base sm:text-lg font-bold text-[var(--text)]">
              13. Contact &amp; Grievance Officer
            </h2>
            <p>
              In accordance with the Information Technology Act 2000 and consumer protection guidelines, any questions, notices, or grievances regarding these Terms should be directed to our designated desk:
            </p>
            <div className="p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] space-y-1 text-xs">
              <p><strong>Entity:</strong> Wefik Agency (wefik.in / wefik.world)</p>
              <p><strong>Grievance Email:</strong> <a href="mailto:hello@wefik.world" className="underline">hello@wefik.world</a></p>
              <p><strong>Phone:</strong> <a href="tel:+919609653522" className="underline font-mono">+91 96096 53522</a></p>
              <p><strong>Hours:</strong> Monday – Friday, 09:00 – 18:00 IST</p>
              <p><strong>Location:</strong> West Bengal, India</p>
            </div>
          </section>

          {/* Legal Disclaimer Required by Section 0 */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-3 mt-12">
            <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-bold">Legal Notice</p>
              <p className="mt-0.5">
                Founder must have these reviewed by a lawyer before relying on them. This document is drafted as a commercial framework and does not constitute formal legal counsel.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
