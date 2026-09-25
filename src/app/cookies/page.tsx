import { Metadata } from 'next';
import Link from 'next/link';
import { ShieldAlert, ShieldCheck } from 'lucide-react';
import { PrintButton } from '@/components/account/print-button';

export const metadata: Metadata = {
  title: 'Cookie Policy — Wefik.world',
  description:
    'Transparent disclosure of essential cookies, theme preferences, and privacy-respecting storage practices on Wefik.world.',
  alternates: {
    canonical: 'https://wefik.world/cookies',
  },
};

export default function CookiesPage() {
  const lastUpdated = 'September 25, 2026';

  const sections = [
    { id: 'what-are-cookies', title: '1. What Are Cookies & Local Storage?' },
    { id: 'cookies-we-use', title: '2. Cookies & Storage Items We Use' },
    { id: 'third-parties', title: '3. Third-Party Analytics Disclosure' },
    { id: 'how-to-control', title: '4. How to Manage & Disable Cookies' },
    { id: 'updates', title: '5. Policy Updates' },
    { id: 'contact', title: '6. Privacy & Inquiries' },
  ];

  return (
    <div className="w-full min-h-screen pt-[calc(var(--header-height)+2rem)] pb-20 bg-[var(--bg)] border-b border-[var(--border)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-[var(--muted)] mb-8 print:hidden">
          <Link href="/" className="hover:text-[var(--text)] transition-colors">Home</Link>
          <span>/</span>
          <span className="text-[var(--text)] font-semibold">Cookie Policy</span>
        </nav>

        {/* Header */}
        <div className="bg-[var(--surface)] rounded-3xl p-8 sm:p-12 border border-[var(--border)] shadow-xs mb-10 print:border-none print:p-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-6 mb-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-deep-green">
                Privacy Disclosure
              </span>
              <h1 className="text-3xl sm:text-5xl font-extrabold text-[var(--text)] tracking-tight mt-1">
                Cookie Policy
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
            At <strong className="text-[var(--text)]">Wefik.world</strong>, we believe in privacy by design. We do not use intrusive third-party cross-site advertising trackers or sell your browsing activity to data brokers. This Cookie Policy explains what small data files (cookies) and browser storage items we use, why they are essential to platform functionality, and how you can control them.
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
          <section id="what-are-cookies" className="space-y-3 scroll-mt-24">
            <h2 className="text-base sm:text-lg font-bold text-[var(--text)]">
              1. What Are Cookies &amp; Local Storage?
            </h2>
            <p>
              Cookies are small text files stored on your device (computer, tablet, or smartphone) by your web browser when you visit a website. Browser Local Storage and Session Storage are modern web mechanisms that allow websites to store small amounts of data locally on your device without transmitting them across the network with every request.
            </p>
          </section>

          <section id="cookies-we-use" className="space-y-3 scroll-mt-24">
            <h2 className="text-base sm:text-lg font-bold text-[var(--text)]">
              2. Cookies &amp; Storage Items We Use
            </h2>
            <p>We use only essential and functional storage items necessary to run our service:</p>

            <div className="space-y-4 pt-2">
              <div className="p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border)]">
                <div className="flex items-center justify-between font-bold text-[var(--text)] text-xs mb-1">
                  <span>Supabase Authentication Cookies (`sb-*-auth-token`)</span>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-lime/20 text-deep-green">
                    Strictly Necessary
                  </span>
                </div>
                <p className="text-xs text-[var(--muted)]">
                  Maintains your encrypted login session, verifies authorization status, and enables seamless navigation across account pages. Without these cookies, you cannot log in or access your purchased digital library.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border)]">
                <div className="flex items-center justify-between font-bold text-[var(--text)] text-xs mb-1">
                  <span>Theme Preference (`theme` in Local Storage)</span>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-sky-500/20 text-sky-600 dark:text-sky-300">
                    Functional
                  </span>
                </div>
                <p className="text-xs text-[var(--muted)]">
                  Remembers whether you selected Dark Mode, Light Mode, or System Default theme, preventing jarring white screen flashes when opening new pages.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border)]">
                <div className="flex items-center justify-between font-bold text-[var(--text)] text-xs mb-1">
                  <span>Cart &amp; Security Nudge (`wefik_cart`, `security_nudge_dismissed`)</span>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-sky-500/20 text-sky-600 dark:text-sky-300">
                    Functional
                  </span>
                </div>
                <p className="text-xs text-[var(--muted)]">
                  Temporarily persists items in your shopping cart drawer during your session and tracks the 30-day dismiss snooze for 2FA security reminders.
                </p>
              </div>
            </div>
          </section>

          <section id="third-parties" className="space-y-3 scroll-mt-24">
            <h2 className="text-base sm:text-lg font-bold text-[var(--text)]">
              3. Third-Party Analytics Disclosure
            </h2>
            <p>
              We prioritize customer privacy and transparency:
            </p>
            <div className="p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border)]">
              <div className="flex items-center gap-2 text-deep-green font-bold text-xs mb-1">
                <ShieldCheck className="w-4 h-4" />
                <span>Zero Third-Party Advertising Trackers</span>
              </div>
              <p className="text-xs text-[var(--muted)]">
                Wefik.world contains <strong className="text-[var(--text)]">no cross-site advertising pixels (such as Meta Pixel or TikTok pixel) and no commercial data brokers</strong>. If first-party aggregated analytics (such as PostHog) are active, they run in privacy-preserving mode without collecting personal names or cross-site behavioral profiles.
              </p>
            </div>
          </section>

          <section id="how-to-control" className="space-y-3 scroll-mt-24">
            <h2 className="text-base sm:text-lg font-bold text-[var(--text)]">
              4. How to Manage &amp; Disable Cookies
            </h2>
            <p>
              You can control and manage cookies through your browser settings. Most modern browsers allow you to view stored cookies, delete existing cookies, or block cookies from specific sites:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-[var(--muted)]">
              <li><strong>Chrome:</strong> Settings &gt; Privacy and Security &gt; Third-party cookies.</li>
              <li><strong>Firefox:</strong> Settings &gt; Privacy &amp; Security &gt; Cookies and Site Data.</li>
              <li><strong>Safari:</strong> Settings &gt; Privacy &gt; Prevent cross-site tracking.</li>
            </ul>
            <p className="text-xs text-[var(--muted)]">
              <em>Please note:</em> If you choose to block all cookies in your browser, you will not be able to log in to your Wefik World account or access your download library, as authenticated sessions require essential cookies.
            </p>
          </section>

          <section id="updates" className="space-y-3 scroll-mt-24">
            <h2 className="text-base sm:text-lg font-bold text-[var(--text)]">
              5. Policy Updates
            </h2>
            <p>
              We may update this Cookie Policy occasionally to reflect adjustments in technical storage mechanisms or legal compliance. Any changes will be published here with an updated date.
            </p>
          </section>

          <section id="contact" className="space-y-3 scroll-mt-24">
            <h2 className="text-base sm:text-lg font-bold text-[var(--text)]">
              6. Privacy &amp; Inquiries
            </h2>
            <p>
              If you have any questions regarding our storage practices or data protection, contact our privacy team at <a href="mailto:hello@wefik.world" className="underline font-semibold text-[var(--text)]">hello@wefik.world</a>.
            </p>
          </section>

          {/* Legal Disclaimer Required by Section 0 */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-3 mt-12">
            <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-bold">Legal Notice</p>
              <p className="mt-0.5">
                Founder must have these reviewed by a lawyer before relying on them. This cookie policy accurately describes the technical cookies in use, but requires statutory verification for international and local privacy compliance.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
