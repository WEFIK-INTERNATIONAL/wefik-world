import { Metadata } from 'next';
import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';
import { PrintButton } from '@/components/account/print-button';

export const metadata: Metadata = {
  title: 'Privacy Policy — Wefik.world',
  description:
    'Privacy Policy and data protection framework for Wefik.world. Details on account data, payment processors, security practices, and rights under India DPDP Act 2023.',
  alternates: {
    canonical: 'https://wefik.world/privacy',
  },
};

export default function PrivacyPage() {
  const lastUpdated = 'September 25, 2026';

  const sections = [
    { id: 'overview', title: '1. Overview & Data Fiduciary' },
    { id: 'data-collected', title: '2. Information We Collect' },
    { id: 'purpose', title: '3. Purposes of Processing' },
    { id: 'processors', title: '4. Third-Party Service Processors' },
    { id: 'cookies', title: '5. Cookies & Local Storage' },
    { id: 'dpdp-rights', title: '6. User Rights (India DPDP Act 2023)' },
    { id: 'retention', title: '7. Data Retention & Anonymization' },
    { id: 'security', title: '8. Security Architecture' },
    { id: 'children', title: '9. Children’s Personal Data' },
    { id: 'contact', title: '10. Data Protection & Grievance Contact' },
  ];

  return (
    <div className="w-full min-h-screen pt-[calc(var(--header-height)+2rem)] pb-20 bg-[var(--bg)] border-b border-[var(--border)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-[var(--muted)] mb-8 print:hidden">
          <Link href="/" className="hover:text-[var(--text)] transition-colors">Home</Link>
          <span>/</span>
          <span className="text-[var(--text)] font-semibold">Privacy Policy</span>
        </nav>

        {/* Header */}
        <div className="bg-[var(--surface)] rounded-3xl p-8 sm:p-12 border border-[var(--border)] shadow-xs mb-10 print:border-none print:p-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-6 mb-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-deep-green">
                Data Protection
              </span>
              <h1 className="text-3xl sm:text-5xl font-extrabold text-[var(--text)] tracking-tight mt-1">
                Privacy Policy
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
            At <strong className="text-[var(--text)]">Wefik.world</strong> (operated by <strong className="text-[var(--text)]">Wefik Agency</strong>), we respect your privacy and handle personal data transparently. This Privacy Policy explains what personal information we collect, why we collect it, how it is processed by our infrastructure partners, and how you can exercise your statutory rights under the <strong className="text-[var(--text)]">Digital Personal Data Protection (DPDP) Act, 2023</strong> of India and applicable global standards.
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
          <section id="overview" className="space-y-3 scroll-mt-24">
            <h2 className="text-base sm:text-lg font-bold text-[var(--text)]">
              1. Overview &amp; Data Fiduciary
            </h2>
            <p>
              Under the Digital Personal Data Protection Act, 2023, <strong className="text-[var(--text)]">Wefik Agency</strong> acts as the Data Fiduciary regarding the personal information collected via wefik.world. We determine the purpose and means of data processing solely to provide our digital marketplace services, authenticate users, fulfill software downloads, manage licenses, and safeguard platform security.
            </p>
          </section>

          <section id="data-collected" className="space-y-3 scroll-mt-24">
            <h2 className="text-base sm:text-lg font-bold text-[var(--text)]">
              2. Information We Collect
            </h2>
            <p>We collect only the minimum personal data required to operate our service:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Account &amp; Identity Data:</strong> Your email address, full name, display name, optional avatar image, and optional secondary recovery email.
              </li>
              <li>
                <strong>Authentication &amp; Security Data:</strong> Encrypted password hashes (managed exclusively by Supabase Auth; we never store plain text passwords), two-factor authentication (TOTP) enrollment status, active login session timestamps, and client user-agent strings to display your active devices.
              </li>
              <li>
                <strong>Transaction &amp; Order Data:</strong> Order IDs, products purchased, license tier, amount in paise, timestamp, and Razorpay payment identifiers. We do not collect or store credit card numbers, CVVs, or UPI PINs.
              </li>
              <li>
                <strong>Licensing &amp; Technical Usage Data:</strong> Cryptographically generated license keys (`WFK-XXXX`), domain names you whitelist for license activation, and signed download request timestamps to enforce rate limits.
              </li>
              <li>
                <strong>Communications:</strong> Messages and details submitted via our contact and feedback forms.
              </li>
            </ul>
          </section>

          <section id="purpose" className="space-y-3 scroll-mt-24">
            <h2 className="text-base sm:text-lg font-bold text-[var(--text)]">
              3. Purposes of Processing
            </h2>
            <p>We process your personal data for the following legitimate purposes:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>To create and manage your customer account and authenticate your sign-in.</li>
              <li>To fulfill orders, issue cryptographic license keys, and generate secure time-limited download URLs.</li>
              <li>To transmit transactional emails: order receipts, password resets, 2FA security alerts, and recovery OTPs.</li>
              <li>To enforce sliding-window rate limits and prevent brute-force attacks and abuse.</li>
              <li>To comply with statutory financial, tax, and accounting reporting requirements.</li>
            </ul>
          </section>

          <section id="processors" className="space-y-3 scroll-mt-24">
            <h2 className="text-base sm:text-lg font-bold text-[var(--text)]">
              4. Third-Party Service Processors
            </h2>
            <p>
              We do not sell, rent, or trade your personal data. We share specific data elements only with vetted cloud processors necessary to deliver our services:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border)]">
                <p className="font-bold text-[var(--text)]">Supabase (PostgreSQL &amp; Auth)</p>
                <p className="text-xs text-[var(--muted)] mt-1">
                  Provides our secure user database, authentication engine, and user-isolated cloud storage for avatar assets. Governed by strict Row-Level Security (RLS).
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border)]">
                <p className="font-bold text-[var(--text)]">Razorpay</p>
                <p className="text-xs text-[var(--muted)] mt-1">
                  Authorized payment gateway handling UPI, card, and NetBanking transactions in compliance with Reserve Bank of India (RBI) tokenization guidelines.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border)]">
                <p className="font-bold text-[var(--text)]">Resend</p>
                <p className="text-xs text-[var(--muted)] mt-1">
                  Transactional email delivery infrastructure used to dispatch order confirmations, password reset links, and critical account security alerts.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border)]">
                <p className="font-bold text-[var(--text)]">Upstash Redis</p>
                <p className="text-xs text-[var(--muted)] mt-1">
                  Low-latency memory cache used exclusively for sliding-window rate limiting and temporary 10-minute MFA/recovery OTP verification codes.
                </p>
              </div>
            </div>
          </section>

          <section id="cookies" className="space-y-3 scroll-mt-24">
            <h2 className="text-base sm:text-lg font-bold text-[var(--text)]">
              5. Cookies &amp; Local Storage
            </h2>
            <p>
              We use strictly necessary cookies to maintain authenticated user sessions and persist your UI theme preferences (dark mode vs. light mode). We do not load invasive third-party cross-site advertising trackers or sell browsing data to data brokers. For comprehensive details, see our <Link href="/cookies" className="underline font-semibold">Cookie Policy</Link>.
            </p>
          </section>

          <section id="dpdp-rights" className="space-y-3 scroll-mt-24">
            <h2 className="text-base sm:text-lg font-bold text-[var(--text)]">
              6. User Rights (India DPDP Act 2023)
            </h2>
            <p>
              As a data principal under the Digital Personal Data Protection Act, 2023, you have clear legal rights regarding your personal data:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>Right to Access:</strong> You can review your profile, licenses, and order history anytime in your <Link href="/account" className="underline">Account Center</Link>.</li>
              <li><strong>Right to Correction:</strong> You can update your full name, display name, avatar, and recovery email directly under <Link href="/account/settings" className="underline">Settings</Link>.</li>
              <li><strong>Right to Erasure (Account Deletion):</strong> You may permanently delete your account in the Danger Zone of your Security settings. Active memberships must be cancelled first. Upon deletion, personal profile data and avatars are expunged.</li>
              <li><strong>Right to Grievance Redressal:</strong> You may register concerns regarding your data processing directly with our Grievance Officer.</li>
            </ul>
          </section>

          <section id="retention" className="space-y-3 scroll-mt-24">
            <h2 className="text-base sm:text-lg font-bold text-[var(--text)]">
              7. Data Retention &amp; Anonymization
            </h2>
            <p>
              We retain personal data only for as long as your account remains active. When you delete your account, your profile and authentication records are deleted from active systems.
            </p>
            <p>
              However, in compliance with Indian tax legislation and commercial accounting regulations, completed financial order records (`orders`, `order_items`) are retained in an anonymized format for statutory statutory auditing periods. <span className="text-[var(--text)]">[FOUNDER: Confirm tax and financial records retention window, standard is 7-8 years under Indian tax laws]</span>.
            </p>
          </section>

          <section id="security" className="space-y-3 scroll-mt-24">
            <h2 className="text-base sm:text-lg font-bold text-[var(--text)]">
              8. Security Architecture
            </h2>
            <p>We employ enterprise-grade security controls to protect your data:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>All web traffic is forced over HTTPS using 256-bit TLS encryption.</li>
              <li>PostgreSQL database tables and avatar cloud buckets enforce Row-Level Security (RLS) policies. User A cannot view User B’s data.</li>
              <li>Passwords must meet strict entropy rules and are automatically checked against the HaveIBeenPwned k-anonymity database to block compromised passwords.</li>
              <li>Zero-trust Edge Functions running in Deno handle privileged operations using isolated server-side credentials.</li>
            </ul>
          </section>

          <section id="children" className="space-y-3 scroll-mt-24">
            <h2 className="text-base sm:text-lg font-bold text-[var(--text)]">
              9. Children’s Personal Data
            </h2>
            <p>
              Wefik.world is a commercial software platform for professional developers, agencies, and businesses. We do not knowingly collect or solicit personal data from children under the age of 18. If we become aware that a child has registered an account without parental consent, we will delete the account promptly.
            </p>
          </section>

          <section id="contact" className="space-y-3 scroll-mt-24">
            <h2 className="text-base sm:text-lg font-bold text-[var(--text)]">
              10. Data Protection &amp; Grievance Contact
            </h2>
            <p>
              For data access inquiries, DPDP Act rights execution, or privacy concerns, contact our designated Grievance Desk:
            </p>
            <div className="p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] space-y-1 text-xs">
              <p><strong>Data Fiduciary:</strong> Wefik Agency (wefik.in / wefik.world)</p>
              <p><strong>Grievance &amp; Privacy Officer:</strong> Technical &amp; Compliance Team</p>
              <p><strong>Email:</strong> <a href="mailto:hello@wefik.world" className="underline">hello@wefik.world</a></p>
              <p><strong>Phone:</strong> <a href="tel:+919609653522" className="underline font-mono">+91 96096 53522</a></p>
              <p><strong>Address:</strong> West Bengal, India <span className="text-[var(--text)]">[FOUNDER: Add exact legal address for formal privacy correspondence]</span></p>
            </div>
          </section>

          {/* Legal Disclaimer Required by Section 0 */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-3 mt-12">
            <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-bold">Legal Notice</p>
              <p className="mt-0.5">
                Founder must have these reviewed by a lawyer before relying on them. This privacy policy is drafted to reflect modern engineering architecture and the DPDP Act 2023, but requires formal legal review for jurisdictional compliance.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
