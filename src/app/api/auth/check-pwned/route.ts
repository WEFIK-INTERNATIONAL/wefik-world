// src/app/api/auth/check-pwned/route.ts
import { NextResponse } from 'next/server';
import { isPasswordBreached } from '@/lib/security/hibp';

export async function POST(req: Request) {
  try {
    const { password } = await req.json();
    if (!password || typeof password !== 'string') {
      return NextResponse.json({ breached: false });
    }

    const result = await isPasswordBreached(password);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ breached: false });
  }
}
