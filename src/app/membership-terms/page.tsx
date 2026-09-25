import { Metadata } from 'next';
import Link from 'next/link';
import { ShieldAlert, Zap, CheckCircle2, RefreshCw, XCircle, ArrowRight } from 'lucide-react';
import { PrintButton } from '@/components/account/print-button';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'All-Access Membership Terms — Wefik.world',
  description:
    'Commercial terms governing Wefik.world All-Access Monthly and Lifetime Deal memberships. Billing, renewals, cancellation rules, and post-expiry license rights.',
  alternates: {
    canonical: 'https://wefik.world/membership-terms',
  },
};

export default function MembershipTermsPage() {
  const lastUpdated = 'September 25, 2026';

  const sections = [
    { id: 'overview', title: '1. Membership Overview & Plans' },
    { id: 'billing', title: '2. Billing Cycles & Automatic Renewal' },
    { id: 'cancellation', title: '3. Cancellation Policy (End-of-Period)' },
    { id: 'post-expiry', title: '4. Post-Expiry License Rights & Downloads' },
    { id: 'fair-use', title: '5. Fair Use & Download Automation Limits' },
    { id: 'upgrades', title: '6. Upgrading from Monthly to Lifetime Deal' },
    { id: 'support', title: '7. Member Support Channels' },
  ];

  return (
    <div className="w-full min-h-screen pt-[calc(var(--header-height)+2rem)] pb-20 bg-[var(--bg)] border-b border-[var(--border)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-[var(--muted)] mb-8 print:hidden">
          <Link href="/" className="hover:text-[var(--text)] transition-colors">Home</Link>
          <span>/</span>
          <span className="text-[var(--text)] font-semibold">Membership Terms</span>
        </nav>

        {/* Header */}
        <div className="bg-[var(--surface)] rounded-3xl p-8 sm:p-12 border border-[var(--border)] shadow-xs mb-10 print:border-none print:p-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-6 mb-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-deep-green">
                Subscription &amp; Pass Agreement
              </span>
              <h1 className="text-3xl sm:text-5xl font-extrabold text-[var(--text)] tracking-tight mt-1">
                Membership Terms
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
            These Membership Terms govern your participation in the <strong className="text-[var(--text)]">Wefik.world All-Access Membership</strong> programs. They supplement our general <Link href="/terms" className="underline font-semibold">Terms &amp; Conditions</Link> and <Link href="/license" className="underline font-semibold">License Agreement</Link>, specifying the rules governing recurring billing, no-friction cancellations, and your perpetual usage rights.
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

        {/* Terms Content */}
        <div className="space-y-12 text-xs sm:text-sm text-[var(--muted)] leading-relaxed">
          <section id="overview" className="space-y-3 scroll-mt-24">
            <h2 className="text-base sm:text-lg font-bold text-[var(--text)]">
              1. Membership Overview &amp; Plans
            </h2>
            <p>
              We provide two All-Access options designed for professional freelancers and digital agencies:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-5 rounded-2xl bg-[var(--surface-2)] border border-[var(--border)] space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Monthly Plan</span>
                <p className="text-base font-bold text-[var(--text)]">All-Access Monthly (₹999 / mo)</p>
                <p className="text-xs text-[var(--muted)]">
                  Billed automatically every 30 days. Includes complete catalog access, new monthly releases, unlimited commercial client project deployments, and priority email support.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[var(--surface-2)] border border-[var(--border)] space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-deep-green">Perpetual Deal</span>
                <p className="text-base font-bold text-[var(--text)]">Lifetime Deal (₹9,999 One-Time)</p>
                <p className="text-xs text-[var(--muted)]">
                  Single one-time payment. Grants perpetual access to all current and future releases forever, with zero recurring charges or annual renewal fees.
                </p>
              </div>
            </div>
          </section>

          <section id="billing" className="space-y-3 scroll-mt-24">
            <h2 className="text-base sm:text-lg font-bold text-[var(--text)]">
              2. Billing Cycles &amp; Automatic Renewal
            </h2>
            <p>
              Monthly memberships are billed every 30 days in advance via Razorpay automated subscription authorizations. By subscribing, you authorize Wefik to charge your payment method on a recurring 30-day basis until you cancel. All charges are in Indian Rupees (INR) with tax included.
            </p>
            <p>
              If a recurring payment attempt fails (e.g., due to an expired card or insufficient funds), Razorpay will automatically retry according to standard banking retry schedules. If the payment cannot be settled, membership access is suspended until payment details are updated.
            </p>
          </section>

          <section id="cancellation" className="space-y-3 scroll-mt-24">
            <h2 className="text-base sm:text-lg font-bold text-[var(--text)]">
              3. Cancellation Policy (End-of-Period)
            </h2>
            <p>
              You can cancel your All-Access Monthly subscription at any time directly through your <Link href="/account/membership" className="underline font-semibold text-[var(--text)]">Account Membership</Link> tab with <strong className="text-[var(--text)]">one click and zero phone calls, surveys, or retention hurdles</strong>.
            </p>
            <div className="p-4 rounded-xl bg-lime/10 border border-lime/30 text-ink dark:text-lime-200">
              <p className="font-bold">Cancellation Rule: Effective at End of Current Period</p>
              <p className="text-xs opacity-90 mt-1">
                When you cancel, your subscription will not renew at the next billing cycle. You retain full All-Access download permissions and support access until the exact end of your current paid billing period (`current_period_end`).
              </p>
            </div>
            <p className="text-[11px] text-[var(--muted)] italic">
              [FOUNDER: Confirm end-of-period cancellation policy without early termination fees]
            </p>
          </section>

          <section id="post-expiry" className="space-y-3 scroll-mt-24">
            <h2 className="text-base sm:text-lg font-bold text-[var(--text)]">
              4. Post-Expiry License Rights &amp; Downloads
            </h2>
            <p>
              What happens to your projects when a monthly membership ends?
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Client Websites Keep Working Legally:</strong> Any website or client deliverable you built and launched using Wefik products during your active membership period remains <strong className="text-[var(--text)]">fully licensed in perpetuity</strong>. You are never required to take down client sites or pay retroactive fees.
              </li>
              <li>
                <strong>Access to Future Updates &amp; Downloads Ceases:</strong> Once your membership expires, your ability to download new product releases, future major version upgrades, or newly added items ceases until your subscription is reactivated.
              </li>
              <li>
                <strong>Already-Downloaded Files:</strong> You may continue using already-downloaded local copies in accordance with the standard commercial license for existing projects.
              </li>
            </ul>
            <p className="text-[11px] text-[var(--muted)] italic">
              [FOUNDER: Confirm post-expiry perpetual license for client sites deployed during active term]
            </p>
          </section>

          <section id="fair-use" className="space-y-3 scroll-mt-24">
            <h2 className="text-base sm:text-lg font-bold text-[var(--text)]">
              5. Fair Use &amp; Download Automation Limits
            </h2>
            <p>
              All-Access memberships provide unlimited downloads for genuine agency and freelance workflows. However, to safeguard cloud storage infrastructure and prevent bulk scraping:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Downloads are rate-limited to 20 product downloads per hour per user via our Edge Function signed-URL generator.</li>
              <li>The use of automated scrapers, headless bots, or bulk download scripts is strictly prohibited. Accounts engaging in automated scraping will be suspended immediately without refund.</li>
              <li>Account sharing with unrelated third parties or posting downloads to public forums constitutes license breach.</li>
            </ul>
          </section>

          <section id="upgrades" className="space-y-3 scroll-mt-24">
            <h2 className="text-base sm:text-lg font-bold text-[var(--text)]">
              6. Upgrading from Monthly to Lifetime Deal
            </h2>
            <p>
              Monthly members who wish to upgrade to the Lifetime Deal can do so anytime via the <Link href="/pricing" className="underline font-semibold">Pricing Page</Link>. Upon purchasing the Lifetime Deal, your recurring monthly billing will be discontinued immediately, and your account will be permanently upgraded to perpetual lifetime ownership.
            </p>
          </section>

          <section id="support" className="space-y-3 scroll-mt-24">
            <h2 className="text-base sm:text-lg font-bold text-[var(--text)]">
              7. Member Support Channels
            </h2>
            <p>
              Members receive priority technical support directly from our engineering team:
            </p>
            <div className="p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] space-y-1 text-xs">
              <p><strong>Member Helpdesk:</strong> <a href="mailto:hello@wefik.world" className="underline">hello@wefik.world</a></p>
              <p><strong>Phone:</strong> <a href="tel:+919609653522" className="underline font-mono">+91 96096 53522</a> (Mon–Fri, 09:00–18:00 IST)</p>
              <p><strong>Management Portal:</strong> <Link href="/account/membership" className="underline">/account/membership</Link></p>
            </div>
          </section>

          {/* Legal Disclaimer Required by Section 0 */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-3 mt-12">
            <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-bold">Legal Notice</p>
              <p className="mt-0.5">
                Founder must have these reviewed by a lawyer before relying on them. These subscription and recurring membership terms require formal legal counsel review for recurring card mandate compliance under RBI regulations.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
