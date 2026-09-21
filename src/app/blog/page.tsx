import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { SEED_POSTS } from '@/lib/sanity/seed-posts';
import { BookOpen, ArrowRight, Clock, User, Calendar } from 'lucide-react';

export const metadata = {
  title: 'Engineering & Design Blog — wefik.world',
  description:
    'In-depth technical guides on WordPress Full-Site Editing, Gutenberg block patterns, performance optimization, and Next.js templates by Wefik engineers.',
};

export default function BlogIndexPage() {
  const posts = SEED_POSTS;
  const featuredPost = posts[0];
  const remainingPosts = posts.slice(1);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-16">
      {/* Blog Hero */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-deep-green/10 text-deep-green text-xs font-bold border border-deep-green/20">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Engineering Insights & Web Architecture</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-ink">
          The Wefik World Journal
        </h1>

        <p className="text-sm sm:text-base text-slate max-w-2xl mx-auto leading-relaxed">
          Deep architectural guides, benchmarks, and real agency lessons on building high-performance WordPress themes and developer web starters.
        </p>
      </div>

      {/* Featured Post Hero Card */}
      {featuredPost && (
        <div className="bg-white rounded-3xl border border-border shadow-md overflow-hidden hover:border-slate-300 transition-all">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-7 relative aspect-[16/10] w-full bg-surface">
              <Link href={`/blog/${featuredPost.slug}`}>
                <Image
                  src={featuredPost.coverImage}
                  alt={featuredPost.title}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  className="object-cover hover:scale-105 transition-transform duration-500"
                />
              </Link>
            </div>

            <div className="lg:col-span-5 p-6 sm:p-10 space-y-4">
              <div className="flex items-center gap-2 text-xs">
                <span className="px-2.5 py-1 rounded-full bg-lime/30 text-deep-green font-bold text-[10px] uppercase">
                  {featuredPost.category}
                </span>
                <span className="text-slate flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {featuredPost.readTime}
                </span>
              </div>

              <Link href={`/blog/${featuredPost.slug}`}>
                <h2 className="text-xl sm:text-2xl font-black text-ink hover:text-deep-green transition-colors leading-tight">
                  {featuredPost.title}
                </h2>
              </Link>

              <p className="text-xs sm:text-sm text-slate leading-relaxed line-clamp-3">
                {featuredPost.excerpt}
              </p>

              <div className="pt-4 flex items-center justify-between border-t border-border text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="relative w-8 h-8 rounded-full overflow-hidden bg-soft border border-border flex-shrink-0">
                    <Image src={featuredPost.author.avatar} alt={featuredPost.author.name} fill className="object-cover" />
                  </div>
                  <div>
                    <span className="font-bold text-ink block">{featuredPost.author.name}</span>
                    <span className="text-[10px] text-slate">{featuredPost.author.role}</span>
                  </div>
                </div>

                <Link
                  href={`/blog/${featuredPost.slug}`}
                  className="font-bold text-deep-green hover:underline inline-flex items-center gap-1"
                >
                  <span>Read Article</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Articles Grid */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-ink">Recent Articles</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {remainingPosts.map((post) => (
            <article
              key={post.id}
              className="bg-white rounded-2xl border border-border overflow-hidden hover:border-slate-300 hover:shadow-lg transition-all flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-[16/9] w-full bg-surface">
                  <Link href={`/blog/${post.slug}`}>
                    <Image
                      src={post.coverImage}
                      alt={post.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover hover:scale-105 transition-transform duration-500"
                    />
                  </Link>
                </div>

                <div className="p-6 space-y-3">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="px-2 py-0.5 rounded-md bg-soft text-ink font-semibold text-[10px]">
                      {post.category}
                    </span>
                    <span className="text-slate flex items-center gap-1 text-[11px]">
                      <Clock className="w-3 h-3" /> {post.readTime}
                    </span>
                  </div>

                  <Link href={`/blog/${post.slug}`}>
                    <h3 className="text-base sm:text-lg font-bold text-ink hover:text-deep-green transition-colors leading-snug">
                      {post.title}
                    </h3>
                  </Link>

                  <p className="text-xs text-slate line-clamp-3 leading-relaxed">
                    {post.excerpt}
                  </p>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-border flex items-center justify-between text-xs mt-auto">
                <span className="text-slate font-medium">{post.author.name}</span>
                <Link
                  href={`/blog/${post.slug}`}
                  className="font-bold text-deep-green hover:underline inline-flex items-center gap-1"
                >
                  <span>Read More</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
