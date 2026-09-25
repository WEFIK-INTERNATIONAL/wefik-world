import { Metadata } from 'next';
import Link from 'next/link';
import { Phone, Mail, Clock, ShieldCheck, ExternalLink, HelpCircle } from 'lucide-react';
import { ContactForm } from '@/components/contact/contact-form';

export const metadata: Metadata = {
  title: 'Contact Wefik World Support & Inquiries',
  description:
    'Direct support from the engineering team that builds Wefik World products. Phone: +91 96096 53522, Email: hello@wefik.world, Hours: Mon-Fri 09:00-18:00 IST.',
  alternates: {
    canonical: 'https://wefik.world/contact',
  },
};

const contactJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ContactPage',
  name: 'Contact Wefik World',
  url: 'https://wefik.world/contact',
  mainEntity: {
    '@type': 'Organization',
    '@id': 'https://www.wefik.in/#organization',
    name: 'Wefik',
    telephone: '+91 96096 53522',
    email: 'hello@wefik.world',
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+91 96096 53522',
      email: 'hello@wefik.world',
      contactType: 'customer support',
      availableLanguage: ['English', 'Hindi'],
      hoursAvailable: {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '09:00',
        closes: '18:00',
      },
    },
  },
};

export default function ContactPage() {
  return (
    <div className="w-full min-h-screen pt-[calc(var(--header-height)+2rem)] pb-16 bg-[var(--bg)] border-b border-[var(--border)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactJsonLd) }}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-[var(--muted)] mb-8">
          <Link href="/" className="hover:text-[var(--text)] transition-colors">Home</Link>
          <span>/</span>
          <span className="text-[var(--text)] font-semibold">Contact</span>
        </nav>

        {/* Header */}
        <div className="max-w-2xl mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-deep-green">
            Direct Engineering Support
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-[var(--text)] tracking-tight mt-2 mb-4">
            Speak Directly with the People Who Built It
          </h1>
          <p className="text-sm sm:text-base text-[var(--muted)] leading-relaxed">
            Have a question about a theme, plugin, commercial license, or need custom development from{' '}
            <a href="https://wefik.in" target="_blank" rel="noreferrer" className="text-[var(--accent)] underline inline-flex items-center gap-0.5">
              Wefik Agency <ExternalLink className="w-3 h-3" />
            </a>
            ? Reach out to our team directly. We do not use offshore call centers or AI chatbots for support.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left: Contact Form */}
          <div className="lg:col-span-7">
            <ContactForm />
          </div>

          {/* Right: Contact Details & Promises */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-xs space-y-5">
              <h3 className="text-sm font-bold text-[var(--text)] uppercase tracking-wider">
                Support Channels
              </h3>

              <div className="space-y-4 text-xs">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-lime/10 text-deep-green flex items-center justify-center flex-shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-[var(--text)]">Direct Phone Support</p>
                    <a href="tel:+919609653522" className="text-[var(--muted)] hover:text-[var(--text)] font-mono text-sm">
                      +91 96096 53522
                    </a>
                    <p className="text-[11px] text-[var(--muted)] mt-0.5">Direct line to our technical desk</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-lime/10 text-deep-green flex items-center justify-center flex-shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-[var(--text)]">Email Support</p>
                    <a href="mailto:hello@wefik.world" className="text-[var(--muted)] hover:text-[var(--text)] text-sm">
                      hello@wefik.world
                    </a>
                    <p className="text-[11px] text-[var(--muted)] mt-0.5">Monitored during business hours</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-lime/10 text-deep-green flex items-center justify-center flex-shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-[var(--text)]">Operating Hours</p>
                    <p className="text-[var(--muted)]">Monday through Friday</p>
                    <p className="font-mono text-xs text-[var(--text)]">09:00 – 18:00 IST</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-lime/10 text-deep-green flex items-center justify-center flex-shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-[var(--text)]">Response Time Promise</p>
                    <p className="text-[var(--muted)]">
                      All tickets and inquiries receive a response from our engineering team{' '}
                      <strong className="text-[var(--text)]">within 1 business day</strong>.
                    </p>
                    <p className="text-[10px] text-[var(--muted)] mt-0.5">[FOUNDER: Confirm support response SLA promise]</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Need Custom Agency Services */}
            <div className="p-6 rounded-2xl bg-[var(--surface-2)] border border-[var(--border)] text-xs text-[var(--muted)] space-y-2.5">
              <div className="flex items-center gap-1.5 text-[var(--text)] font-bold text-sm">
                <HelpCircle className="w-4 h-4 text-deep-green" />
                <span>Need Custom Development?</span>
              </div>
              <p className="leading-relaxed">
                Looking for bespoke web design, custom SaaS platforms, or headless Shopify development? Our parent agency takes on select commercial client engagements.
              </p>
              <div className="pt-1">
                <a
                  href="https://wefik.in"
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-[var(--accent)] hover:underline inline-flex items-center gap-1"
                >
                  <span>Visit Wefik Agency (wefik.in)</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
