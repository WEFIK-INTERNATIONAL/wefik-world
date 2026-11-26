import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit } from '@/lib/redis';

export async function POST(request: Request) {
  try {
    // Rate limit: 3 subscribe attempts per minute per IP
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded?.split(',')[0]?.trim() || 'unknown';
    const rl = await checkRateLimit(`newsletter:${ip}`, 3, 60);
    if (!rl.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const email = typeof body?.email === 'string' ? body.email : null;

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email address is required.' }, { status: 400 });
    }

    const supabase = await createClient();

    // Insert into newsletter_subscribers table
    const { error } = await supabase
      .from('newsletter_subscribers')
      .insert([{ email: email.toLowerCase().trim() }]);

    if (error) {
      // 23505 is unique_violation in Postgres
      if (error.code === '23505') {
        return NextResponse.json({ message: 'You are already subscribed to our newsletter!' }, { status: 200 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Thank you for subscribing to Wefik World updates!' }, { status: 200 });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Subscription failed';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
