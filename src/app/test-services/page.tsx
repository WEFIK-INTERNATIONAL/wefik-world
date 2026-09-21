'use client';

import { useState } from 'react';
import { CldImage } from 'next-cloudinary';
import { analytics } from '@/lib/posthog';

export default function TestServicesPage() {
  const [redisStatus, setRedisStatus] = useState<string>('idle');
  const [redisValue, setRedisValue] = useState<string | null>(null);
  const [posthogStatus, setPosthogStatus] = useState<string>('idle');

  async function testRedis() {
    setRedisStatus('testing');
    try {
      const res = await fetch('/api/health');
      const data = await res.json();
      setRedisStatus(data.services.redis.status);
      setRedisValue(data.services.redis.response || 'OK');
    } catch (e) {
      setRedisStatus('error');
      setRedisValue((e as Error).message);
    }
  }

  function testPosthog() {
    analytics.trackProductView({
      id: 'test-item-1',
      title: 'Sample Test Product',
      price_inr: 999,
      slug: 'sample-test-product',
    });
    setPosthogStatus('captured event: product_viewed');
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-8 flex flex-col items-center">
      <div className="max-w-3xl w-full space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Services & Infrastructure Verification
          </h1>
          <p className="text-zinc-400 mt-2">
            Verifying Cloudinary, PostHog, Upstash Redis, and Sentry integrations.
          </p>
        </div>

        {/* Cloudinary Section */}
        <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">1. Cloudinary CldImage</h2>
            <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-500/20">
              Cloud: ash7ockb
            </span>
          </div>
          <p className="text-sm text-zinc-400">
            Rendering sample image with auto-crop, auto-format, and auto-quality via Cloudinary CDN:
          </p>
          <div className="flex justify-center p-4 bg-black/40 rounded-lg border border-zinc-800/80">
            <CldImage
              src="cld-sample-5"
              width="400"
              height="400"
              alt="Cloudinary sample image"
              className="rounded-lg shadow-lg"
              crop={{
                type: 'auto',
                source: true,
              }}
            />
          </div>
        </section>

        {/* PostHog Section */}
        <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">2. PostHog Product Funnel</h2>
            <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-500/20">
              US Cloud (621174)
            </span>
          </div>
          <p className="text-sm text-zinc-400">
            PostHog tracks: Product View → Add to Cart → Checkout Initiated → Order Paid.
          </p>
          <div className="flex items-center gap-4">
            <button
              onClick={testPosthog}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition"
            >
              Trigger Test Analytics Event
            </button>
            <span className="text-xs text-zinc-400 font-mono">
              Status: {posthogStatus}
            </span>
          </div>
        </section>

        {/* Upstash Redis Section */}
        <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">3. Upstash Redis Caching & Rate-Limit</h2>
            <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-500/20">
              enhanced-hog-289189
            </span>
          </div>
          <p className="text-sm text-zinc-400">
            High-speed serverless KV store configured for session/cart caching and rate limiting.
          </p>
          <div className="flex items-center gap-4">
            <button
              onClick={testRedis}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition"
            >
              Ping Redis API
            </button>
            <span className="text-xs text-zinc-400 font-mono">
              Status: {redisStatus} {redisValue ? `(${redisValue})` : ''}
            </span>
          </div>
        </section>

        {/* Sentry Section */}
        <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">4. Sentry Error Tracking</h2>
            <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-500/20">
              Org: wefik / wefik-world
            </span>
          </div>
          <p className="text-sm text-zinc-400">
            Sentry Next.js SDK instrumented in client, server, and edge runtimes via <code className="text-zinc-200">sentry.*.config.ts</code> and <code className="text-zinc-200">instrumentation.ts</code>.
          </p>
        </section>
      </div>
    </div>
  );
}
