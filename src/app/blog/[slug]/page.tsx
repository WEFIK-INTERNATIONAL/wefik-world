import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { SafeImage } from '@/components/ui/safe-image';
import { Metadata } from 'next';
import { SEED_POSTS } from '@/lib/sanity/seed-posts';
import { ArrowLeft, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  return SEED_POSTS.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = SEED_POSTS.find((p) => p.slug === slug);

  if (!post) {
    return { title: 'Post Not Found' };
  }

  return {
    title: `${post.title} — Wefik World Blog`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [{ url: post.coverImage }],
      type: 'article',
      publishedTime: post.publishedAt,
      authors: [post.author.name],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: [post.coverImage],
    },
  };
}

export default async function BlogPostDetailPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = SEED_POSTS.find((p) => p.slug === slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = SEED_POSTS.filter((p) => p.id !== post.id).slice(0, 2);

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    image: [post.coverImage],
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    author: {
      '@type': 'Person',
      name: post.author.name,
      jobTitle: post.author.role,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Wefik World',
      logo: {
        '@type': 'ImageObject',
        url: 'https://wefik.world/logo.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://wefik.world/blog/${post.slug}`,
    },
  };

  const faqJsonLd = post.faqs && post.faqs.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: post.faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.a,
      },
    })),
  } : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10">
        {/* Back Link */}
        <div>
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-xs text-slate hover:text-ink font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to All Articles</span>
          </Link>
        </div>

        {/* Article Header */}
        <header className="space-y-4">
          <div className="flex items-center gap-2 text-xs">
            <span className="px-2.5 py-1 rounded-full bg-lime/30 text-deep-green font-bold text-[10px] uppercase">
              {post.category}
            </span>
            <span className="text-slate flex items-center gap-1 text-[11px]">
              <Clock className="w-3 h-3" /> {post.readTime}
            </span>
            <span className="text-slate/40">•</span>
            <span className="text-slate text-[11px]">
              {new Date(post.publishedAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-ink tracking-tight leading-tight">
            {post.title}
          </h1>

          <p className="text-sm sm:text-base text-slate leading-relaxed">
            {post.excerpt}
          </p>

          {/* Author Byline */}
          <div className="pt-4 border-t border-border flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-full overflow-hidden bg-soft border border-border flex-shrink-0">
              <SafeImage src={post.author.avatar} alt={post.author.name} fill className="object-cover" />
            </div>
            <div>
              <span className="font-bold text-ink text-xs block">{post.author.name}</span>
              <span className="text-[11px] text-slate">{post.author.role}</span>
            </div>
          </div>
        </header>

        {/* Featured Cover Image */}
        <div className="relative aspect-[16/9] w-full rounded-3xl overflow-hidden bg-surface border border-border shadow-sm">
          <SafeImage
            src={post.coverImage}
            alt={post.title}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 896px"
            className="object-cover"
          />
        </div>

        {/* Article Body Content */}
        <div className="prose prose-sm sm:prose-base max-w-none text-slate leading-relaxed font-sans whitespace-pre-line space-y-6">
          {post.content}
        </div>

        {/* FAQs Section */}
        {post.faqs && post.faqs.length > 0 && (
          <div className="pt-8 border-t border-border space-y-6">
            <h2 className="text-xl font-bold text-ink">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {post.faqs.map((faq, idx) => (
                <div key={idx} className="p-5 rounded-2xl bg-soft border border-border/80 space-y-2">
                  <h3 className="font-bold text-sm text-ink">{faq.q}</h3>
                  <p className="text-xs text-slate leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bottom CTA Banner */}
        <div className="bg-soft p-8 rounded-3xl border border-border text-center space-y-4">
          <h3 className="text-lg font-bold text-ink">Build Production Websites Faster</h3>
          <p className="text-xs text-slate max-w-md mx-auto leading-relaxed">
            Explore our Gutenberg block themes and performance plugins engineered for high-traffic agency projects.
          </p>
          <Button asChild className="bg-ink hover:bg-black text-white text-xs h-10 px-5 rounded-xl font-bold">
            <Link href="/marketplace">Explore Marketplace Catalog</Link>
          </Button>
        </div>

        {/* Related Articles */}
        {relatedPosts.length > 0 && (
          <div className="pt-10 border-t border-border space-y-6">
            <h2 className="text-lg font-bold text-ink">Recommended Reading</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {relatedPosts.map((rel) => (
                <Link
                  key={rel.id}
                  href={`/blog/${rel.slug}`}
                  className="p-5 rounded-2xl bg-[var(--surface)] border border-border hover:border-slate-300 hover:shadow-md transition-all space-y-2 block"
                >
                  <span className="text-[10px] font-bold uppercase text-deep-green block">
                    {rel.category}
                  </span>
                  <h3 className="font-bold text-sm text-ink hover:text-deep-green transition-colors line-clamp-2">
                    {rel.title}
                  </h3>
                  <span className="text-[11px] text-slate block">{rel.readTime}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>
    </>
  );
}
