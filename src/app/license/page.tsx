import { Metadata } from 'next';
import Link from 'next/link';
import { ShieldAlert, Check, X, ShieldCheck, Printer, ArrowRight } from 'lucide-react';
import { PrintButton } from '@/components/account/print-button';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Commercial License Agreement (EULA) — Wefik.world',
  description:
    'Single-Site and Unlimited-Site commercial license terms for themes, plugins, and web templates purchased on Wefik.world.',
  alternates: {
    canonical: 'https://wefik.world/license',
  },
};

export default function LicensePage() {
  const lastUpdated = 'September 25, 2026';

  const sections = [
    { id: 'grant', title: '1. Grant of License' },
    { id: 'single-site', title: '2. Single-Site License Scope' },
    { id: 'unlimited-site', title: '3. Unlimited-Site License Scope' },
    { id: 'membership-scope', title: '4. Membership License Terms' },
    { id: 'client-handoff', title: '5. Client Projects & Billing Rights' },
    { id: 'modifications', title: '6. Source Code Modification' },
    { id: 'prohibitions', title: '7. Prohibitions & Redistribution Ban' },
    { id: 'updates-support', title: '8. Product Updates & Technical Support' },
    { id: 'termination', title: '9. License Revocation & Termination' },
    { id: 'contact', title: '10. Licensing Desk Contact' },
  ];

  return (
    <div className="w-full min-h-screen pt-[calc(var(--header-height)+2rem)] pb-20 bg-[var(--bg)] border-b border-[var(--border)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-[var(--muted)] mb-8 print:hidden">
          <Link href="/" className="hover:text-[var(--text)] transition-colors">Home</Link>
          <span>/</span>
          <span className="text-[var(--text)] font-semibold">License Agreement</span>
        </nav>

        {/* Header */}
        <div className="bg-[var(--surface)] rounded-3xl p-8 sm:p-12 border border-[var(--border)] shadow-xs mb-10 print:border-none print:p-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-6 mb-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-deep-green">
                Commercial Software Agreement
              </span>
              <h1 className="text-3xl sm:text-5xl font-extrabold text-[var(--text)] tracking-tight mt-1">
                License Agreement (EULA)
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
            This End User License Agreement (&ldquo;Agreement&rdquo;) is a legal contract between you (the &ldquo;Licensee&rdquo;) and <strong className="text-[var(--text)]">Wefik Agency</strong> (the &ldquo;Licensor&rdquo;) governing the commercial use of digital assets, including WordPress themes, plugins, HTML templates, Next.js starters, and code snippets acquired through <strong className="text-[var(--text)]">Wefik.world</strong>.
          </p>
        </div>

        {/* Comparison Table */}
        <div className="bg-[var(--surface)] rounded-3xl p-6 sm:p-8 border border-[var(--border)] shadow-xs mb-10 overflow-x-auto print:border print:p-4">
          <h2 className="text-base font-bold text-[var(--text)] mb-4">
            Commercial License Rights Comparison
          </h2>

          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[var(--border)] text-[var(--muted)] uppercase tracking-wider font-semibold">
                <th className="py-3 pr-4">Permission / Right</th>
                <th className="py-3 px-4 text-center">Single-Site</th>
                <th className="py-3 px-4 text-center bg-lime/10 text-deep-green font-bold rounded-t-xl">
                  Unlimited-Site
                </th>
                <th className="py-3 pl-4 text-center">All-Access Pass</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)] text-[var(--text)]">
              <tr>
                <td className="py-3 pr-4 font-medium">Production Website Deployments</td>
                <td className="py-3 px-4 text-center font-mono">1 Domain</td>
                <td className="py-3 px-4 text-center bg-lime/10 font-bold text-deep-green">Unlimited</td>
                <td className="py-3 pl-4 text-center font-bold text-deep-green">Unlimited</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-medium">Local &amp; Staging Environments</td>
                <td className="py-3 px-4 text-center"><Check className="w-4 h-4 text-deep-green mx-auto" /></td>
                <td className="py-3 px-4 text-center bg-lime/10"><Check className="w-4 h-4 text-deep-green mx-auto" /></td>
                <td className="py-3 pl-4 text-center"><Check className="w-4 h-4 text-deep-green mx-auto" /></td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-medium">Deploy on Paying Client Websites</td>
                <td className="py-3 px-4 text-center"><Check className="w-4 h-4 text-deep-green mx-auto" /></td>
                <td className="py-3 px-4 text-center bg-lime/10"><Check className="w-4 h-4 text-deep-green mx-auto" /></td>
                <td className="py-3 pl-4 text-center"><Check className="w-4 h-4 text-deep-green mx-auto" /></td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-medium">Client Billing for Design &amp; Development</td>
                <td className="py-3 px-4 text-center"><Check className="w-4 h-4 text-deep-green mx-auto" /></td>
                <td className="py-3 px-4 text-center bg-lime/10"><Check className="w-4 h-4 text-deep-green mx-auto" /></td>
                <td className="py-3 pl-4 text-center"><Check className="w-4 h-4 text-deep-green mx-auto" /></td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-medium">Full Source Code Modification</td>
                <td className="py-3 px-4 text-center"><Check className="w-4 h-4 text-deep-green mx-auto" /></td>
                <td className="py-3 px-4 text-center bg-lime/10"><Check className="w-4 h-4 text-deep-green mx-auto" /></td>
                <td className="py-3 pl-4 text-center"><Check className="w-4 h-4 text-deep-green mx-auto" /></td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-medium">Lifetime Updates for Purchased Product</td>
                <td className="py-3 px-4 text-center"><Check className="w-4 h-4 text-deep-green mx-auto" /></td>
                <td className="py-3 px-4 text-center bg-lime/10"><Check className="w-4 h-4 text-deep-green mx-auto" /></td>
                <td className="py-3 pl-4 text-center"><Check className="w-4 h-4 text-deep-green mx-auto" /></td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-medium">Reselling or Redistributing Source Code</td>
                <td className="py-3 px-4 text-center"><X className="w-4 h-4 text-rose-500 mx-auto" /></td>
                <td className="py-3 px-4 text-center bg-lime/10"><X className="w-4 h-4 text-rose-500 mx-auto" /></td>
                <td className="py-3 pl-4 text-center"><X className="w-4 h-4 text-rose-500 mx-auto" /></td>
              </tr>
            </tbody>
          </table>
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

        {/* Full Agreement Text */}
        <div className="space-y-12 text-xs sm:text-sm text-[var(--muted)] leading-relaxed">
          <section id="grant" className="space-y-3 scroll-mt-24">
            <h2 className="text-base sm:text-lg font-bold text-[var(--text)]">
              1. Grant of License
            </h2>
            <p>
              Upon receipt of valid payment, Wefik grants you a worldwide, non-exclusive, non-transferable, revocable license to download, install, and customize the purchased software in accordance with the specific license tier selected at checkout.
            </p>
          </section>

          <section id="single-site" className="space-y-3 scroll-mt-24">
            <h2 className="text-base sm:text-lg font-bold text-[var(--text)]">
              2. Single-Site License Scope
            </h2>
            <p>
              The <strong>Single-Site License</strong> authorizes the installation and operation of the digital product on exactly <strong className="text-[var(--text)]">one (1) live production website domain</strong>.
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>You may install the software on unlimited localhost, staging, or private development servers solely for building and testing that single production site.</li>
              <li>You may use this license for your own website or deploy it for one paying client website.</li>
              <li>If you wish to deploy the same product on a second production website, you must purchase an additional Single-Site License or upgrade to Unlimited-Site.</li>
            </ul>
          </section>

          <section id="unlimited-site" className="space-y-3 scroll-mt-24">
            <h2 className="text-base sm:text-lg font-bold text-[var(--text)]">
              3. Unlimited-Site License Scope
            </h2>
            <p>
              The <strong>Unlimited-Site License</strong> authorizes the installation and operation of the digital product on <strong className="text-[var(--text)]">an unlimited number of production domains</strong> owned by you or your paying agency clients.
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Ideal for freelance developers, digital marketing studios, and web design agencies building numerous client sites.</li>
              <li>Includes unlimited local, staging, and live production deployments with zero additional per-domain licensing fees.</li>
            </ul>
          </section>

          <section id="membership-scope" className="space-y-3 scroll-mt-24">
            <h2 className="text-base sm:text-lg font-bold text-[var(--text)]">
              4. Membership License Terms
            </h2>
            <p>
              Products acquired under an <strong className="text-[var(--text)]">All-Access Monthly</strong> or <strong className="text-[var(--text)]">Lifetime Deal</strong> membership carry full Unlimited-Site commercial rights.
            </p>
            <p>
              For Monthly memberships, your right to receive software updates and download new products continues while your subscription remains active. If your monthly subscription expires or is cancelled, <strong className="text-[var(--text)]">all client websites deployed during the active membership continue to operate legally in perpetuity under their commercial license</strong>. You are not forced to remove themes or plugins from client sites upon subscription expiry.
            </p>
          </section>

          <section id="client-handoff" className="space-y-3 scroll-mt-24">
            <h2 className="text-base sm:text-lg font-bold text-[var(--text)]">
              5. Client Projects &amp; Billing Rights
            </h2>
            <p>
              You are explicitly permitted to incorporate our themes, plugins, and templates into completed digital deliverables for your paying clients and bill your clients for your design, engineering, and customization services.
            </p>
            <p>
              When handing off a completed site to a client, you may transfer the customized implementation. However, the client does not acquire standalone redistribution rights to the raw Wefik source code.
            </p>
          </section>

          <section id="modifications" className="space-y-3 scroll-mt-24">
            <h2 className="text-base sm:text-lg font-bold text-[var(--text)]">
              6. Source Code Modification
            </h2>
            <p>
              You have complete freedom to modify, edit, extend, and restyle our source code (PHP, TypeScript, JavaScript, CSS, HTML) to suit your project requirements. Any derivative code you author remains governed by this Agreement.
            </p>
          </section>

          <section id="prohibitions" className="space-y-3 scroll-mt-24">
            <h2 className="text-base sm:text-lg font-bold text-[var(--text)]">
              7. Prohibitions &amp; Redistribution Ban
            </h2>
            <p>The following actions represent serious copyright infringement and are strictly prohibited:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>No Redistribution:</strong> You may not sell, rent, sub-license, donate, or distribute the raw source files, assets, or documentation to any third party.</li>
              <li><strong>No Competing Marketplaces:</strong> You may not upload our assets or any modified derivative to ThemeForest, Creative Market, Envato Elements, GitHub public repositories, or any competing digital store.</li>
              <li><strong>No Source Code Bundling in Commercial SaaS:</strong> You may not package our themes or templates into an on-demand website builder or SaaS generator where end-users can export or access the raw source files, without a written enterprise agreement from Wefik.</li>
            </ul>
          </section>

          <section id="updates-support" className="space-y-3 scroll-mt-24">
            <h2 className="text-base sm:text-lg font-bold text-[var(--text)]">
              8. Product Updates &amp; Technical Support
            </h2>
            <p>
              Individual product purchases include lifetime access to security patches, bug fixes, and WordPress compatibility updates published for that item. Technical support covers defect remediation, documentation clarification, and installation guidance via our support desk.
            </p>
          </section>

          <section id="termination" className="space-y-3 scroll-mt-24">
            <h2 className="text-base sm:text-lg font-bold text-[var(--text)]">
              9. License Revocation &amp; Termination
            </h2>
            <p>
              This Agreement automatically terminates if you fail to comply with any of its terms. Upon termination, you must destroy all copies of the software in your possession, and Wefik reserves the right to revoke associated cryptographic license keys and pursue legal remedies under copyright law.
            </p>
          </section>

          <section id="contact" className="space-y-3 scroll-mt-24">
            <h2 className="text-base sm:text-lg font-bold text-[var(--text)]">
              10. Licensing Desk Contact
            </h2>
            <p>
              For commercial enterprise licensing, extended SaaS bundling permissions, or license inquiries:
            </p>
            <div className="p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] space-y-1 text-xs">
              <p><strong>Licensing Desk:</strong> Wefik Agency</p>
              <p><strong>Email:</strong> <a href="mailto:hello@wefik.world" className="underline">hello@wefik.world</a></p>
              <p><strong>Direct Telephone:</strong> <a href="tel:+919609653522" className="underline font-mono">+91 96096 53522</a></p>
            </div>
          </section>

          {/* Legal Disclaimer Required by Section 0 */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-3 mt-12">
            <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-bold">Legal Notice</p>
              <p className="mt-0.5">
                Founder must have these reviewed by a lawyer before relying on them. This commercial software license agreement must be validated by intellectual property counsel for full jurisdictional enforcement.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
