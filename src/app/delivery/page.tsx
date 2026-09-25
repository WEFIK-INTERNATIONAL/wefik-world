import { Metadata } from 'next';
import Link from 'next/link';
import { ShieldAlert, Download, Clock, CheckCircle2, AlertCircle, Mail, Phone } from 'lucide-react';
import { PrintButton } from '@/components/account/print-button';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Digital Delivery Policy — Wefik.world',
  description:
    'Instant electronic delivery policy for digital software, themes, plugins, and templates purchased on Wefik.world.',
  alternates: {
    canonical: 'https://wefik.world/delivery',
  },
};

export default function DigitalDeliveryPage() {
  const lastUpdated = 'September 25, 2026';

  const sections = [
    { id: 'electronic-delivery', title: '1. Instant Electronic Delivery' },
    { id: 'how-to-access', title: '2. How to Access Your Downloads' },
    { id: 'delivery-timeframe', title: '3. Delivery Timeframe & Verification' },
    { id: 'shipping-costs', title: '4. Shipping Fees (Zero Physical Delivery)' },
    { id: 'download-issues', title: '5. Troubleshooting Failed Downloads' },
    { id: 'license-activation', title: '6. License Key Issuance' },
    { id: 'contact', title: '7. Delivery Support Desk' },
  ];

  return (
    <div className="w-full min-h-screen pt-[calc(var(--header-height)+2rem)] pb-20 bg-[var(--bg)] border-b border-[var(--border)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-[var(--muted)] mb-8 print:hidden">
          <Link href="/" className="hover:text-[var(--text)] transition-colors">Home</Link>
          <span>/</span>
          <span className="text-[var(--text)] font-semibold">Digital Delivery Policy</span>
        </nav>

        {/* Header */}
        <div className="bg-[var(--surface)] rounded-3xl p-8 sm:p-12 border border-[var(--border)] shadow-xs mb-10 print:border-none print:p-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-6 mb-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-deep-green">
                Fulfillment Protocol
              </span>
              <h1 className="text-3xl sm:text-5xl font-extrabold text-[var(--text)] tracking-tight mt-1">
                Digital Delivery Policy
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
            All products and services offered on <strong className="text-[var(--text)]">Wefik.world</strong> (WordPress themes, utility plugins, HTML templates, Next.js starters, and All-Access passes) are delivered exclusively in digital electronic format. This policy outlines our automated delivery protocols, timelines, and resolution procedures for payment processors including Razorpay.
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

        {/* Content */}
        <div className="space-y-12 text-xs sm:text-sm text-[var(--muted)] leading-relaxed">
          <section id="electronic-delivery" className="space-y-3 scroll-mt-24">
            <h2 className="text-base sm:text-lg font-bold text-[var(--text)]">
              1. Instant Electronic Delivery
            </h2>
            <p>
              Wefik.world operates an automated digital fulfillment system. Upon confirmation of successful payment by Razorpay (or immediate 1-click claim for Freebies), your order is fulfilled electronically in real time. We do not dispatch physical parcels, CD-ROMs, USB drives, or printed paper licenses.
            </p>
          </section>

          <section id="how-to-access" className="space-y-3 scroll-mt-24">
            <h2 className="text-base sm:text-lg font-bold text-[var(--text)]">
              2. How to Access Your Downloads
            </h2>
            <p>You can access your purchased software assets via three concurrent channels:</p>
            <ol className="list-decimal pl-5 space-y-2">
              <li>
                <strong>Instant Order Confirmation Screen:</strong> Immediately following checkout, you are redirected to `/order-success`, displaying your active download links and generated license keys.
              </li>
              <li>
                <strong>Account Download Library:</strong> All acquired assets remain permanently accessible under your customer <Link href="/account/library" className="underline font-semibold text-[var(--text)]">Account Library</Link> whenever you log in.
              </li>
              <li>
                <strong>Email Receipt:</strong> An automated confirmation receipt containing order details and direct library access links is dispatched to your registered email address via Resend.
              </li>
            </ol>
          </section>

          <section id="delivery-timeframe" className="space-y-3 scroll-mt-24">
            <h2 className="text-base sm:text-lg font-bold text-[var(--text)]">
              3. Delivery Timeframe &amp; Verification
            </h2>
            <p>
              Digital delivery is normally complete within <strong className="text-[var(--text)]">10 to 60 seconds</strong> of payment authorization. In rare instances where an Indian bank takes extra time to confirm an asynchronous UPI mandate or NetBanking transaction, delivery occurs automatically the moment Razorpay transmits the successful `payment.captured` webhook.
            </p>
          </section>

          <section id="shipping-costs" className="space-y-3 scroll-mt-24">
            <h2 className="text-base sm:text-lg font-bold text-[var(--text)]">
              4. Shipping Fees (Zero Physical Delivery)
            </h2>
            <p>
              Because all fulfillment is electronic, <strong className="text-[var(--text)]">shipping fees are ₹0.00</strong> across all products and categories. You will never be charged shipping, handling, packaging, or postal customs fees on Wefik.world.
            </p>
          </section>

          <section id="download-issues" className="space-y-3 scroll-mt-24">
            <h2 className="text-base sm:text-lg font-bold text-[var(--text)]">
              5. Troubleshooting Failed Downloads
            </h2>
            <p>
              Download links on Wefik.world are cryptographically signed URLs valid for 60 seconds from generation to prevent unauthorized hotlinking. If a download fails or times out:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Refresh your <Link href="/account/library" className="underline font-semibold">Account Library</Link> page and click &ldquo;Download Latest Version&rdquo; again to generate a fresh 60-second secure URL.</li>
              <li>Ensure your browser is not blocking popup downloads or background file streams.</li>
              <li>Confirm your email address has been verified under <Link href="/account/settings" className="underline">Account Settings</Link>, as unverified accounts may be restricted from downloading files.</li>
              <li>If you still cannot download your files, email our support team at <a href="mailto:hello@wefik.world" className="underline font-mono">hello@wefik.world</a> with your Order ID. We guarantee manual file delivery within 1 business day.</li>
            </ul>
          </section>

          <section id="license-activation" className="space-y-3 scroll-mt-24">
            <h2 className="text-base sm:text-lg font-bold text-[var(--text)]">
              6. License Key Issuance
            </h2>
            <p>
              Each purchase automatically issues a cryptographic license key in the format `WFK-XXXX-XXXX-XXXX`. This key is tied to your account and visible in masked format (`WFK-••••-••••-XXXX`) with a reveal-and-copy control under <Link href="/account/library" className="underline font-semibold">Account Library</Link>. You can enter this key in your WordPress admin panel to receive automated software updates.
            </p>
          </section>

          <section id="contact" className="space-y-3 scroll-mt-24">
            <h2 className="text-base sm:text-lg font-bold text-[var(--text)]">
              7. Delivery Support Desk
            </h2>
            <p>
              For delivery assistance or manual order fulfillment:
            </p>
            <div className="p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] space-y-1 text-xs">
              <p><strong>Fulfillment Desk:</strong> Wefik Agency Engineering Support</p>
              <p><strong>Email:</strong> <a href="mailto:hello@wefik.world" className="underline">hello@wefik.world</a></p>
              <p><strong>Direct Line:</strong> <a href="tel:+919609653522" className="underline font-mono">+91 96096 53522</a></p>
              <p><strong>Hours:</strong> Monday – Friday, 09:00 – 18:00 IST</p>
            </div>
          </section>

          {/* Legal Disclaimer Required by Section 0 */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-3 mt-12">
            <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-bold">Legal Notice</p>
              <p className="mt-0.5">
                Founder must have these reviewed by a lawyer before relying on them. This digital delivery statement fulfills payment gateway merchant standards (Razorpay) and consumer disclosure rules, but requires formal legal review.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
