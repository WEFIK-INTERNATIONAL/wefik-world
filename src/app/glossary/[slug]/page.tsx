import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { BookOpen, Code2, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/marketplace/product-card';
import { getProducts } from '@/lib/data/products';
import { GLOSSARY_TERMS } from '@/lib/seo/programmatic-data';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return Object.keys(GLOSSARY_TERMS).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const term = GLOSSARY_TERMS[slug];

  if (!term) return {};

  return {
    title: `${term.term}: Definition & Practical Guide | Wefik.world`,
    description: term.definition.slice(0, 155),
    alternates: {
      canonical: `https://wefik.world/glossary/${slug}`,
    },
  };
}

export default async function GlossaryTermPage({ params }: Props) {
  const { slug } = await params;
  const term = GLOSSARY_TERMS[slug];

  if (!term) {
    notFound();
  }

  const allProducts = await getProducts();
  const relatedProducts = allProducts
    .filter((p) => {
      const pCat = p.category?.slug || '';
      return pCat.includes(term.relatedCategory) || term.relatedCategory.includes(pCat);
    })
    .slice(0, 3);

  const displayProducts = relatedProducts.length > 0 ? relatedProducts : allProducts.slice(0, 3);
  const otherTerms = Object.values(GLOSSARY_TERMS).filter((t) => t.slug !== slug).slice(0, 6);

  return (
    <div className="w-full min-h-screen py-12 bg-soft border-b border-border">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-slate mb-6">
          <Link href="/" className="hover:text-ink transition-colors">Home</Link>
          <span>/</span>
          <Link href="/glossary" className="hover:text-ink transition-colors">Glossary</Link>
          <span>/</span>
          <span className="text-ink font-semibold">{term.term}</span>
        </nav>

        {/* Hero Card */}
        <article className="bg-[var(--surface)] rounded-3xl p-8 sm:p-12 border border-border shadow-xs mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lime/20 text-deep-green text-xs font-bold uppercase tracking-wider mb-4">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Developer Glossary & Guide</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-ink tracking-tight mb-6">
            {term.term}
          </h1>

          {/* Featured Definition Box */}
          <div className="p-5 rounded-2xl bg-soft border-l-4 border-deep-green text-sm sm:text-base text-ink font-medium leading-relaxed mb-8">
            {term.definition}
          </div>

          {/* Deep Dive (150+ words) */}
          <div className="prose prose-slate text-sm sm:text-base text-slate leading-relaxed mb-8">
            <h2 className="text-xl font-bold text-ink mb-3">Technical Explanation & Importance</h2>
            <p className="mb-4">{term.deepDive}</p>
          </div>

          {/* Code Example (if available) */}
          {term.codeExample && (
            <div className="mb-8">
              <h3 className="text-xs font-bold uppercase tracking-wider text-ink mb-2 flex items-center gap-1.5">
                <Code2 className="w-4 h-4 text-deep-green" />
                <span>Code Implementation Example</span>
              </h3>
              <pre className="p-4 rounded-xl bg-ink text-lime font-mono text-xs overflow-x-auto">
                <code>{term.codeExample}</code>
              </pre>
            </div>
          )}

          {/* Quick Key Facts */}
          <div className="p-4 rounded-2xl bg-soft border border-border">
            <h4 className="text-xs font-bold uppercase tracking-wider text-ink mb-2">
              Key Engineering Takeaway
            </h4>
            <p className="text-xs text-slate">
              Understanding {term.term} is critical for engineering production-grade, bloat-free websites. All Wefik themes, plugins, and templates implement these standards natively.
            </p>
          </div>
        </article>

        {/* Real Product Recommendations */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-ink">
                Related Marketplace Products ({displayProducts.length})
              </h2>
              <p className="text-xs text-slate mt-0.5">
                Production-grade products implementing clean architecture.
              </p>
            </div>
            <Button asChild variant="outline" size="sm" className="rounded-xl text-xs">
              <Link href="/marketplace">View Marketplace</Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayProducts.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        </div>

        {/* FAQs */}
        {term.faqs && term.faqs.length > 0 && (
          <div className="bg-[var(--surface)] rounded-3xl p-6 sm:p-8 border border-border shadow-xs mb-10">
            <h2 className="text-xl font-bold text-ink mb-6 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-deep-green" />
              <span>Questions About {term.term}</span>
            </h2>
            <div className="space-y-3">
              {term.faqs.map((faq, idx) => (
                <details key={idx} className="group p-4 rounded-2xl bg-soft border border-border">
                  <summary className="font-bold text-xs sm:text-sm text-ink cursor-pointer list-none flex items-center justify-between">
                    <span>{faq.q}</span>
                    <span className="text-deep-green font-bold text-base transition-transform group-open:rotate-45">+</span>
                  </summary>
                  <p className="text-xs text-slate mt-2 leading-relaxed">{faq.a}</p>
                </details>
              ))}
            </div>

            {/* FAQPage Schema */}
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                  "@context": "https://schema.org",
                  "@type": "FAQPage",
                  mainEntity: term.faqs.map((f) => ({
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
        )}

        {/* Sibling Glossary Terms */}
        <div className="bg-[var(--surface)] rounded-3xl p-6 sm:p-8 border border-border shadow-xs">
          <h3 className="text-xs font-bold uppercase tracking-wider text-ink mb-4">
            Related Glossary Terms
          </h3>
          <div className="flex flex-wrap gap-2">
            {otherTerms.map((ot) => (
              <Link
                key={ot.slug}
                href={`/glossary/${ot.slug}`}
                className="px-3 py-1.5 rounded-xl bg-soft border border-border text-xs text-ink hover:border-deep-green transition-colors"
              >
                {ot.term}
              </Link>
            ))}
          </div>
        </div>

        {/* DefinedTerm JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "DefinedTerm",
              name: term.term,
              description: term.definition,
              inDefinedTermSet: "https://wefik.world/glossary",
            }),
          }}
        />
      </div>
    </div>
  );
}
