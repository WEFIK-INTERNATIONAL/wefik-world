import { Metadata } from 'next';
import Link from 'next/link';
import { ShieldAlert, CheckCircle2 } from 'lucide-react';
import { PrintButton } from '@/components/account/print-button';

export const metadata: Metadata = {
  title: 'Refund Policy — Wefik.world',
  description:
    'Clear, fair refund policy for digital themes, plugins, templates, and All-Access memberships on Wefik.world.',
  alternates: {
    canonical: 'https://wefik.world/refunds',
  },
};

export default function RefundsPage() {
  const lastUpdated = 'September 25, 2026';

  const sections = [
    { id: 'principle', title: '1. The Digital Goods Standard' },
    { id: 'eligibility', title: '2. Eligible Refund Conditions (7-Day Guarantee)' },
    { id: 'ineligible', title: '3. Ineligible Refund Scenarios' },
    { id: 'memberships', title: '4. Membership Refund Rules' },
    { id: 'request-process', title: '5. How to Request a Refund' },
    { id: 'reversal', title: '6. Payment Reversal Timelines' },
    { id: 'contact', title: '7. Support & Inquiries' },
  ];

  return (
    <div className="w-full min-h-screen pt-[calc(var(--header-height)+2rem)] pb-20 bg-[var(--bg)] border-b border-[var(--border)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-[var(--muted)] mb-8 print:hidden">
          <Link href="/" className="hover:text-[var(--text)] transition-colors">Home</Link>
          <span>/</span>
          <span className="text-[var(--text)] font-semibold">Refund Policy</span>
        </nav>

        {/* Header */}
        <div className="bg-[var(--surface)] rounded-3xl p-8 sm:p-12 border border-[var(--border)] shadow-xs mb-10 print:border-none print:p-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-6 mb-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-deep-green">
                Customer Protection
              </span>
              <h1 className="text-3xl sm:text-5xl font-extrabold text-[var(--text)] tracking-tight mt-1">
                Refund Policy
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
            At <strong className="text-[var(--text)]">Wefik.world</strong>, we believe software commerce should be transparent and fair. Because our products are irrevocable digital assets (source code, WordPress themes, plugins, and web templates) that cannot be &ldquo;returned&rdquo; in the traditional physical sense, we maintain a straightforward, customer-first refund policy designed to protect buyers from defective code while preventing software piracy.
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

        {/* Policy Content */}
        <div className="space-y-12 text-xs sm:text-sm text-[var(--muted)] leading-relaxed">
          <section id="principle" className="space-y-3 scroll-mt-24">
            <h2 className="text-base sm:text-lg font-bold text-[var(--text)]">
              1. The Digital Goods Standard
            </h2>
            <p>
              When you purchase a theme, plugin, or template on Wefik.world, you receive immediate access to download the full, uncompiled or production-ready source code. As a single-vendor marketplace, we author and maintain 100% of our catalog. We stand behind our work, and if something does not perform as documented, we fix it or refund you.
            </p>
          </section>

          <section id="eligibility" className="space-y-3 scroll-mt-24">
            <h2 className="text-base sm:text-lg font-bold text-[var(--text)]">
              2. Eligible Refund Conditions (7-Day Guarantee)
            </h2>
            <p>
              You are entitled to a full refund within <strong className="text-[var(--text)]">seven (7) calendar days</strong> of purchase under the following circumstances:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-lime/10 border border-lime/30 text-ink dark:text-lime-200">
                <div className="flex items-center gap-2 font-bold mb-1">
                  <CheckCircle2 className="w-4 h-4 text-deep-green dark:text-lime" />
                  <span>Defective or Broken Product</span>
                </div>
                <p className="text-xs opacity-90">
                  The product has a reproducible technical bug, fatal error, or broken core feature that our engineering support team cannot resolve within 2 business days of your report.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-lime/10 border border-lime/30 text-ink dark:text-lime-200">
                <div className="flex items-center gap-2 font-bold mb-1">
                  <CheckCircle2 className="w-4 h-4 text-deep-green dark:text-lime" />
                  <span>Material Description Mismatch</span>
                </div>
                <p className="text-xs opacity-90">
                  The delivered product lacks a core feature or functionality explicitly promised in the official product page description.
                </p>
              </div>
            </div>
            <p className="text-[11px] text-[var(--muted)] italic mt-2">
              [FOUNDER: Confirm 7-day technical defect refund guarantee default]
            </p>
          </section>

          <section id="ineligible" className="space-y-3 scroll-mt-24">
            <h2 className="text-base sm:text-lg font-bold text-[var(--text)]">
              3. Ineligible Refund Scenarios
            </h2>
            <p>Refunds will <strong className="text-[var(--text)]">not</strong> be granted in the following cases:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                <strong>Change of Mind:</strong> You simply changed your mind, no longer need the item, or decided on a different visual style after downloading the files.
              </li>
              <li>
                <strong>Third-Party Incompatibility:</strong> The product conflicts with an unmaintained third-party plugin, server environment below our documented requirements (e.g. PHP &lt; 8.1), or custom modifications made to the source code by you or your developer.
              </li>
              <li>
                <strong>Lack of Expertise:</strong> Inability or lack of technical knowledge to install a WordPress theme, configure an FSE block, or execute a Node.js build command where the product functions correctly in standard environments.
              </li>
              <li>
                <strong>Refusal to Allow Support:</strong> Requesting a refund for a suspected bug without providing relevant error logs or allowing our engineers a reasonable opportunity to troubleshoot.
              </li>
              <li>
                <strong>Fraudulent Activity or License Abuse:</strong> Accounts found engaging in license scraping, warez distribution, or chargeback fraud.
              </li>
            </ul>
          </section>

          <section id="memberships" className="space-y-3 scroll-mt-24">
            <h2 className="text-base sm:text-lg font-bold text-[var(--text)]">
              4. All-Access Membership Refund Rules
            </h2>
            <p>Our All-Access Monthly (₹999/mo) and Lifetime Deal (₹9,999) memberships are subject to specific refund terms:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                <strong>Unused Membership (7 Days):</strong> If you purchase a Monthly or Lifetime membership and have <strong className="text-[var(--text)]">not downloaded any digital products or claimed any premium licenses</strong>, you may request a full refund within 7 calendar days of initial payment.
              </li>
              <li>
                <strong>Active / Downloaded Memberships:</strong> Once any digital product is downloaded or a commercial license key is activated under the membership, the membership becomes non-refundable.
              </li>
              <li>
                <strong>Monthly Subscription Renewals:</strong> Monthly renewals are non-refundable. You can cancel your membership at any time in your <Link href="/account/membership" className="underline font-semibold">Account Membership</Link> tab before your next renewal date.
              </li>
            </ul>
          </section>

          <section id="request-process" className="space-y-3 scroll-mt-24">
            <h2 className="text-base sm:text-lg font-bold text-[var(--text)]">
              5. How to Request a Refund
            </h2>
            <p>To initiate a refund request, follow these steps:</p>
            <ol className="list-decimal pl-5 space-y-2">
              <li>
                Visit our <Link href="/contact" className="underline font-semibold">Contact Page</Link> or email <a href="mailto:hello@wefik.world" className="underline font-mono">hello@wefik.world</a> using your registered account email.
              </li>
              <li>Include your Order ID (available under <Link href="/account/orders" className="underline">Account Orders</Link>).</li>
              <li>Provide a clear description of the defect, including screenshots, steps to reproduce, or PHP/browser error console logs.</li>
              <li>Our engineering team will review your report within 1 business day. If we cannot resolve the issue within 2 business days, your refund will be authorized immediately.</li>
            </ol>
          </section>

          <section id="reversal" className="space-y-3 scroll-mt-24">
            <h2 className="text-base sm:text-lg font-bold text-[var(--text)]">
              6. Payment Reversal Timelines
            </h2>
            <p>
              Once a refund is authorized by Wefik, it is processed via Razorpay directly back to your original payment method (UPI account, bank account, or debit/credit card).
            </p>
            <p>
              Depending on your bank and Razorpay settlement processing, funds typically appear in your account within <strong className="text-[var(--text)]">5 to 7 business days</strong>. Wefik will automatically deactivate associated license keys and revoke download permissions for the refunded item.
            </p>
          </section>

          <section id="contact" className="space-y-3 scroll-mt-24">
            <h2 className="text-base sm:text-lg font-bold text-[var(--text)]">
              7. Support &amp; Inquiries
            </h2>
            <p>
              If you have any questions before making a purchase or need technical assistance with an existing order, reach out to our team:
            </p>
            <div className="p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] space-y-1 text-xs">
              <p><strong>Support Email:</strong> <a href="mailto:hello@wefik.world" className="underline">hello@wefik.world</a></p>
              <p><strong>Phone:</strong> <a href="tel:+919609653522" className="underline font-mono">+91 96096 53522</a></p>
              <p><strong>Operating Hours:</strong> Monday – Friday, 09:00 – 18:00 IST</p>
            </div>
          </section>

          {/* Legal Disclaimer Required by Section 0 */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-3 mt-12">
            <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-bold">Legal Notice</p>
              <p className="mt-0.5">
                Founder must have these reviewed by a lawyer before relying on them. This refund policy specifies the recommended digital goods standard, but requires formal legal and business sign-off.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
