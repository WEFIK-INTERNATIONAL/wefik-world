import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

export async function GET() {
  let redisStatus = 'disconnected';
  let redisPing = null;

  try {
    const ping = await redis.ping();
    redisStatus = 'connected';
    redisPing = ping;
  } catch (error) {
    redisStatus = `error: ${(error as Error).message}`;
  }

  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      redis: {
        status: redisStatus,
        response: redisPing,
      },
      cloudinary: {
        cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'ash7ockb',
      },
      posthog: {
        configured: Boolean(process.env.NEXT_PUBLIC_POSTHOG_KEY),
      },
      sentry: {
        project: process.env.SENTRY_PROJECT || 'wefik-world',
      },
    },
  });
}
