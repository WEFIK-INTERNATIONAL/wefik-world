import { NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/redis';
import { escapeHtml } from '@/lib/sanitize';

/** Minimal validation for the contact form request body. */
function validateContactBody(body: unknown): {
  valid: boolean;
  error?: string;
  data?: { name: string; email: string; subject: string; category: string; message: string };
} {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Invalid request body' };
  }
  const { name, email, subject, category, message } = body as Record<string, unknown>;
  if (!name || typeof name !== 'string' || !name.trim()) {
    return { valid: false, error: 'Your name is required.' };
  }
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return { valid: false, error: 'A valid email address is required.' };
  }
  if (typeof message !== 'string' || message.trim().length < 10) {
    return { valid: false, error: 'Please provide a message of at least 10 characters.' };
  }
  return {
    valid: true,
    data: {
      name: name.trim(),
      email: email.trim(),
      subject: typeof subject === 'string' ? subject.trim() : '',
      category: typeof category === 'string' ? category.trim() : 'General',
      message: message.trim(),
    },
  };
}

export async function POST(request: Request) {
  try {
    // Rate limit: 5 contact submissions per minute per IP
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded?.split(',')[0]?.trim() || 'unknown';
    const rl = await checkRateLimit(`contact:${ip}`, 5, 60);
    if (!rl.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const validation = validateContactBody(body);
    if (!validation.valid || !validation.data) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { name, email, subject, category, message } = validation.data;

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

    // Escape all user input before interpolating into HTML email
    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeCategory = escapeHtml(category || 'General');
    const safeSubject = escapeHtml(subject || 'General Inquiry');
    const safeMessage = escapeHtml(message);

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
        subject: `[Contact Inquiry - ${safeCategory}] ${safeSubject || 'New Message from ' + safeName}`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #202124;">
            <h2 style="color: #4F741B; margin-bottom: 16px;">New Contact Submission — wefik.world</h2>
            <div style="background-color: #F8F9FA; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
              <p style="margin: 0 0 8px 0;"><strong>Name:</strong> ${safeName}</p>
              <p style="margin: 0 0 8px 0;"><strong>Email:</strong> <a href="mailto:${safeEmail}">${safeEmail}</a></p>
              <p style="margin: 0 0 8px 0;"><strong>Category:</strong> ${safeCategory}</p>
              <p style="margin: 0;"><strong>Subject:</strong> ${safeSubject}</p>
            </div>
            <div style="padding: 16px; border: 1px solid #E8EAED; border-radius: 8px;">
              <h4 style="margin: 0 0 8px 0; color: #5F6368;">Message:</h4>
              <p style="margin: 0; white-space: pre-wrap; line-height: 1.6;">${safeMessage}</p>
            </div>
            <p style="font-size: 12px; color: #5F6368; margin-top: 24px;">Sent from https://www.wefik.world/contact</p>
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
