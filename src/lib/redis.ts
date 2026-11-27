import { Redis } from '@upstash/redis';

const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;

// Upstash Redis client singleton (null if unconfigured; never hardcode credentials)
export const redis: Redis | null =
  upstashUrl && upstashToken
    ? new Redis({
        url: upstashUrl,
        token: upstashToken,
      })
    : null;

/**
 * Rate-limiter helper using Upstash Redis.
 * Fails closed when Redis is unconfigured or unreachable.
 */
export async function checkRateLimit(
  identifier: string,
  limit: number = 60,
  windowSeconds: number = 60
): Promise<{ success: boolean; limit: number; remaining: number }> {
  if (!redis) {
    console.error('Redis is not configured; rate limit failing closed.');
    return { success: false, limit, remaining: 0 };
  }

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
    console.error('Redis rate limit error, failing closed:', error);
    return { success: false, limit, remaining: 0 };
  }
}
