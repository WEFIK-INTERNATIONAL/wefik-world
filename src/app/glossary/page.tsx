import { Metadata } from 'next';
import Link from 'next/link';
import { BookOpen, ArrowRight } from 'lucide-react';
import { GLOSSARY_TERMS } from '@/lib/seo/programmatic-data';

export const metadata: Metadata = {
  title: 'Web Development & WordPress Glossary — Complete Index | Wefik.world',
  description:
    'Comprehensive technical glossary of web development, WordPress architecture, speed optimization, and licensing terms for developers and agencies.',
  alternates: {
    canonical: 'https://wefik.world/glossary',
  },
};

export default function GlossaryIndexPage() {
  const terms = Object.values(GLOSSARY_TERMS);

  return (
    <div className="w-full min-h-screen py-16 bg-soft border-b border-border">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center gap-2 text-xs text-slate mb-6">
          <Link href="/" className="hover:text-ink transition-colors">Home</Link>
          <span>/</span>
          <span className="text-ink font-semibold">Glossary</span>
        </nav>

        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-deep-green">
            Developer Knowledge Base
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-ink tracking-tight mt-2 mb-4">
            Web Development & WordPress Glossary
          </h1>
          <p className="text-sm sm:text-base text-slate max-w-2xl mx-auto leading-relaxed">
            Clear, authoritative definitions and practical code implementations of modern web engineering, licensing, and optimization concepts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {terms.map((t) => (
            <Link
              key={t.slug}
              href={`/glossary/${t.slug}`}
              className="p-6 rounded-2xl bg-[var(--surface)] border border-border hover:border-deep-green shadow-2xs hover:shadow-xs transition-all group flex flex-col justify-between"
            >
              <div>
                <h2 className="text-base font-bold text-ink group-hover:text-deep-green transition-colors mb-2">
                  {t.term}
                </h2>
                <p className="text-xs text-slate line-clamp-3 leading-relaxed mb-4">
                  {t.definition}
                </p>
              </div>
              <span className="text-xs font-bold text-deep-green flex items-center gap-1">
                <span>Read Full Guide</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
