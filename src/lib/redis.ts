import { Redis } from '@upstash/redis';

// Upstash Redis client singleton
// Can be used for rate-limiting, cart caching, and download token tracking
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || 'https://enhanced-hog-289189.upstash.io',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || 'gQAAAAAABGmlAAIgcDI1MmYzODdlZmU4NGI0OGE4OTc3YjYyNjYzZDY1NDkwYg',
});

/**
 * Basic rate-limiter helper using Upstash Redis
 * Returns { success: boolean, limit: number, remaining: number, reset: number }
 */
export async function checkRateLimit(
  identifier: string,
  limit: number = 60,
  windowSeconds: number = 60
): Promise<{ success: boolean; limit: number; remaining: number }> {
  try {
    const key = `ratelimit:${identifier}`;
    const count = await redis.incr(key);

    if (count === 1) {
      await redis.expire(key, windowSeconds);
    }

    return {
      success: count <= limit,
      limit,
      remaining: Math.max(0, limit - count),
    };
  } catch (error) {
    console.error('Redis rate limit error, bypassing:', error);
    // Graceful degrade if redis is unreachable
    return { success: true, limit, remaining: limit };
  }
}
