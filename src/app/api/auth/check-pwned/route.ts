// src/app/api/auth/check-pwned/route.ts
import { NextResponse } from 'next/server';
import { isPasswordBreached } from '@/lib/security/hibp';
import { checkRateLimit } from '@/lib/redis';

export async function POST(req: Request) {
  try {
    // Rate limit: 10 checks per minute per IP
    const forwarded = req.headers.get('x-forwarded-for');
    const ip = forwarded?.split(',')[0]?.trim() || 'unknown';
    const rl = await checkRateLimit(`check-pwned:${ip}`, 10, 60);
    if (!rl.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const password = typeof body?.password === 'string' ? body.password : null;
    if (!password) {
      return NextResponse.json({ breached: false });
    }

    const result = await isPasswordBreached(password);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ breached: false });
  }
}
