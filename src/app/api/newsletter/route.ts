import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

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
