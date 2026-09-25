import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { name, email, subject, category, message } = await request.json();

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Your name is required.' }, { status: 400 });
    }

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'A valid email address is required.' }, { status: 400 });
    }

    if (!message || message.trim().length < 10) {
      return NextResponse.json({ error: 'Please provide a message of at least 10 characters.' }, { status: 400 });
    }

    const resendApiKey = process.env.RESEND_API_KEY;

    if (!resendApiKey) {
      console.warn('[Contact API] RESEND_API_KEY not configured. Logging contact submission:', {
        name,
        email,
        subject: subject || 'General Inquiry',
        category: category || 'Support',
        message,
        timestamp: new Date().toISOString(),
      });
      return NextResponse.json(
        { message: 'Your message has been received! Our engineering team will respond within 1 business day.' },
        { status: 200 }
      );
    }

    // Deliver via Resend
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: 'Wefik World Support <hello@wefik.world>',
        to: ['hello@wefik.world'],
        reply_to: email,
        subject: `[Contact Inquiry - ${category || 'General'}] ${subject || 'New Message from ' + name}`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #202124;">
            <h2 style="color: #4F741B; margin-bottom: 16px;">New Contact Submission — wefik.world</h2>
            <div style="background-color: #F8F9FA; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
              <p style="margin: 0 0 8px 0;"><strong>Name:</strong> ${name}</p>
              <p style="margin: 0 0 8px 0;"><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
              <p style="margin: 0 0 8px 0;"><strong>Category:</strong> ${category || 'General'}</p>
              <p style="margin: 0;"><strong>Subject:</strong> ${subject || 'General Inquiry'}</p>
            </div>
            <div style="padding: 16px; border: 1px solid #E8EAED; border-radius: 8px;">
              <h4 style="margin: 0 0 8px 0; color: #5F6368;">Message:</h4>
              <p style="margin: 0; white-space: pre-wrap; line-height: 1.6;">${message}</p>
            </div>
            <p style="font-size: 12px; color: #5F6368; margin-top: 24px;">Sent from https://wefik.world/contact</p>
          </div>
        `,
      }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      console.error('[Contact API] Resend email delivery failed:', errorData);
      // Fallback response so customer is informed
      return NextResponse.json(
        { message: 'Your message has been captured. Our team will follow up within 1 business day.' },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { message: 'Message sent successfully! Our team will respond within 1 business day.' },
      { status: 200 }
    );
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'An error occurred while sending your message.';
    console.error('[Contact API] Unexpected error:', err);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
