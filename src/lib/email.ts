import { Resend } from "resend";

// Initialize Resend client with API key from environment
const apiKey = process.env.RESEND_API_KEY || "";
export const resend = new Resend(apiKey);

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
}

/**
 * Send an email via Resend API
 */
export async function sendEmail({
  to,
  subject,
  html,
  from = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
}: SendEmailOptions) {
  if (!apiKey) {
    console.warn("RESEND_API_KEY is not set. Email delivery skipped.");
    return { error: new Error("RESEND_API_KEY is not configured") };
  }

  try {
    const data = await resend.emails.send({
      from,
      to,
      subject,
      html,
    });
    return { data, error: null };
  } catch (error) {
    console.error("Resend delivery failed:", error);
    return { data: null, error };
  }
}

/**
 * Send test onboarding verification email to Wefik World team
 */
export async function sendTestHelloEmail(recipient: string = "wefikworld@gmail.com") {
  return await sendEmail({
    from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
    to: recipient,
    subject: "Hello World",
    html: "<p>Congrats on sending your <strong>first email</strong>!</p>",
  });
}
