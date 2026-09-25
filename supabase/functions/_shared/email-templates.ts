/**
 * Transactional email sender & templates via Resend (Deno runtime)
 */

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailParams): Promise<boolean> {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  if (!apiKey) {
    console.warn("RESEND_API_KEY missing. Skipping email send to:", to);
    return false;
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: Deno.env.get("RESEND_FROM_EMAIL") || "onboarding@resend.dev",
        to: [to],
        subject,
        html,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Resend API error:", err);
      return false;
    }
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
}

/**
 * 1. Welcome Email Template
 */
export function welcomeEmailTemplate(name: string): string {
  const greeting = name ? `Hi ${name},` : "Hi there,";
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Welcome to wefik.world</title></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8f9fa; margin: 0; padding: 40px 20px;">
  <div style="max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 14px; border: 1px solid #e8eaed; overflow: hidden; padding: 32px;">
    <div style="border-bottom: 2px solid #a3e635; padding-bottom: 16px; margin-bottom: 24px;">
      <h2 style="margin: 0; color: #202124; font-size: 22px; font-weight: 700;">wefik<span style="color: #4f741b;">.world</span></h2>
    </div>
    <h1 style="font-size: 20px; font-weight: 700; color: #202124; margin-bottom: 16px;">Welcome to the family!</h1>
    <p style="color: #5f6368; line-height: 1.6; font-size: 15px;">${greeting}</p>
    <p style="color: #5f6368; line-height: 1.6; font-size: 15px;">
      Thanks for joining wefik.world — the home of curated, battle-tested WordPress themes, plugins, and developer code starters crafted by the Wefik digital agency team.
    </p>
    <p style="color: #5f6368; line-height: 1.6; font-size: 15px;">
      Here is what you can do next:
    </p>
    <ul style="color: #5f6368; line-height: 1.8; font-size: 14px; padding-left: 20px;">
      <li>Explore our free templates and themes in the <a href="https://wefik.world/freebies" style="color: #4f741b; text-decoration: underline;">Freebies section</a>.</li>
      <li>Check out the <a href="https://wefik.world/pricing" style="color: #4f741b; text-decoration: underline;">All-Access Membership</a> to unlock everything we build.</li>
      <li>Manage your downloads and license keys anytime from your <a href="https://wefik.world/dashboard" style="color: #4f741b; text-decoration: underline;">Customer Dashboard</a>.</li>
    </ul>
    <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #e8eaed; color: #9aa0a6; font-size: 12px; text-align: center;">
      &copy; ${new Date().getFullYear()} wefik.world by Wefik. All rights reserved.
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * 2. Purchase Receipt & License Keys Email Template
 */
export function purchaseReceiptTemplate(params: {
  customerName: string;
  orderId: string;
  totalAmountPaise: number;
  items: Array<{ title: string; pricePaise: number; licenseKey?: string; licenseType?: string }>;
}): string {
  const formattedTotal = (params.totalAmountPaise / 100).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });

  const itemsHtml = params.items
    .map(
      (item) => `
    <tr style="border-bottom: 1px solid #e8eaed;">
      <td style="padding: 12px 8px; font-size: 14px; color: #202124;">
        <strong>${item.title}</strong>
        ${
          item.licenseKey
            ? `<div style="margin-top: 6px;">
                <span style="font-size: 11px; background: #f8f9fa; border: 1px solid #e8eaed; padding: 3px 8px; border-radius: 6px; font-family: monospace; color: #202124;">
                  License: ${item.licenseKey}
                </span>
                <span style="font-size: 11px; color: #5f6368; margin-left: 6px;">(${item.licenseType || "single"})</span>
              </div>`
            : ""
        }
      </td>
      <td style="padding: 12px 8px; font-size: 14px; color: #202124; text-align: right; font-weight: 600;">
        ₹${(item.pricePaise / 100).toLocaleString("en-IN")}
      </td>
    </tr>`
    )
    .join("");

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Order Receipt — wefik.world</title></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8f9fa; margin: 0; padding: 40px 20px;">
  <div style="max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 14px; border: 1px solid #e8eaed; overflow: hidden; padding: 32px;">
    <div style="border-bottom: 2px solid #a3e635; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center;">
      <h2 style="margin: 0; color: #202124; font-size: 22px; font-weight: 700;">wefik<span style="color: #4f741b;">.world</span></h2>
      <span style="font-size: 12px; color: #5f6368; font-family: monospace;">Receipt #${params.orderId.slice(0, 8)}</span>
    </div>

    <h1 style="font-size: 20px; font-weight: 700; color: #202124; margin-bottom: 8px;">Payment Confirmed!</h1>
    <p style="color: #5f6368; font-size: 14px; margin-bottom: 24px;">
      Hi ${params.customerName || "there"}, thank you for your purchase. Your digital items and license keys are ready.
    </p>

    <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
      <thead>
        <tr style="border-bottom: 2px solid #e8eaed; text-align: left;">
          <th style="padding: 8px; font-size: 12px; color: #5f6368; text-transform: uppercase;">Item</th>
          <th style="padding: 8px; font-size: 12px; color: #5f6368; text-transform: uppercase; text-align: right;">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
      <tfoot>
        <tr>
          <td style="padding: 16px 8px; font-size: 15px; font-weight: 700; color: #202124;">Total Paid</td>
          <td style="padding: 16px 8px; font-size: 18px; font-weight: 700; color: #4f741b; text-align: right;">${formattedTotal}</td>
        </tr>
      </tfoot>
    </table>

    <div style="background: #f8f9fa; border-radius: 10px; padding: 16px; margin-bottom: 24px; text-align: center;">
      <p style="margin: 0 0 12px 0; font-size: 14px; color: #202124; font-weight: 600;">Access your files and documentation:</p>
      <a href="https://wefik.world/dashboard/downloads" style="display: inline-block; background: #202124; color: #ffffff; text-decoration: none; padding: 10px 24px; border-radius: 10px; font-weight: 600; font-size: 14px;">
        Go to Downloads
      </a>
    </div>

    <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #e8eaed; color: #9aa0a6; font-size: 12px; text-align: center;">
      Need help? Reach out to support at <a href="mailto:support@wefik.world" style="color: #4f741b;">support@wefik.world</a>.<br>
      &copy; ${new Date().getFullYear()} wefik.world by Wefik.
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * 3. New Version Notification Email Template
 */
export function newVersionNotificationTemplate(params: {
  productTitle: string;
  version: string;
  changelog: string;
}): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>New Update Available — ${params.productTitle}</title></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8f9fa; margin: 0; padding: 40px 20px;">
  <div style="max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 14px; border: 1px solid #e8eaed; overflow: hidden; padding: 32px;">
    <div style="border-bottom: 2px solid #a3e635; padding-bottom: 16px; margin-bottom: 24px;">
      <h2 style="margin: 0; color: #202124; font-size: 22px; font-weight: 700;">wefik<span style="color: #4f741b;">.world</span></h2>
    </div>

    <span style="display: inline-block; background: #eef9d6; color: #4f741b; border: 1px solid #d9f99d; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 700; margin-bottom: 12px;">
      Update v${params.version}
    </span>
    <h1 style="font-size: 20px; font-weight: 700; color: #202124; margin-bottom: 12px;">${params.productTitle} has been updated!</h1>
    <p style="color: #5f6368; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
      A new release is ready for download in your dashboard. Here are the highlights of what's new in this version:
    </p>

    <div style="background: #f8f9fa; border: 1px solid #e8eaed; border-radius: 10px; padding: 16px; margin-bottom: 24px; font-size: 13px; color: #202124; line-height: 1.6;">
      <h3 style="margin: 0 0 8px 0; font-size: 13px; text-transform: uppercase; color: #5f6368;">Changelog:</h3>
      <div style="white-space: pre-line;">${params.changelog || "Performance improvements and bug fixes."}</div>
    </div>

    <div style="text-align: center; margin-bottom: 24px;">
      <a href="https://wefik.world/dashboard/downloads" style="display: inline-block; background: #202124; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 10px; font-weight: 600; font-size: 14px;">
        Download v${params.version}
      </a>
    </div>

    <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #e8eaed; color: #9aa0a6; font-size: 12px; text-align: center;">
      You received this because you own an active license or membership for this item.<br>
      &copy; ${new Date().getFullYear()} wefik.world by Wefik.
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * 4. Recovery Email Reset Link Template
 */
export function recoveryResetEmailTemplate(params: {
  accountEmail: string;
  resetUrl: string;
}): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Reset password for ${params.accountEmail}</title></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8f9fa; margin: 0; padding: 40px 20px;">
  <div style="max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 14px; border: 1px solid #e8eaed; overflow: hidden; padding: 32px;">
    <div style="border-bottom: 2px solid #a3e635; padding-bottom: 16px; margin-bottom: 24px;">
      <h2 style="margin: 0; color: #202124; font-size: 22px; font-weight: 700;">wefik<span style="color: #4f741b;">.world</span></h2>
    </div>
    <h1 style="font-size: 20px; font-weight: 700; color: #202124; margin-bottom: 16px;">Password Reset via Recovery Email</h1>
    <p style="color: #5f6368; line-height: 1.6; font-size: 14px; margin-bottom: 16px;">
      A password reset request was initiated for your wefik.world account (<strong>${params.accountEmail}</strong>) directed to this verified recovery address.
    </p>
    <div style="text-align: center; margin: 28px 0;">
      <a href="${params.resetUrl}" style="display: inline-block; background: #202124; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 10px; font-weight: 600; font-size: 14px;">
        Reset Account Password
      </a>
    </div>
    <p style="color: #5f6368; font-size: 13px; line-height: 1.5;">
      If you did not request this reset, your primary account remains secure and no changes were made.
    </p>
    <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #e8eaed; color: #9aa0a6; font-size: 12px; text-align: center;">
      &copy; ${new Date().getFullYear()} wefik.world by Wefik.
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * 5. MFA / 2FA Reset OTP Template (Sent to Recovery Email)
 */
export function mfaResetOtpTemplate(params: {
  accountEmail: string;
  code: string;
}): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Reset Two-Factor Authentication</title></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8f9fa; margin: 0; padding: 40px 20px;">
  <div style="max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 14px; border: 1px solid #e8eaed; overflow: hidden; padding: 32px;">
    <div style="border-bottom: 2px solid #a3e635; padding-bottom: 16px; margin-bottom: 24px;">
      <h2 style="margin: 0; color: #202124; font-size: 22px; font-weight: 700;">wefik<span style="color: #4f741b;">.world</span></h2>
    </div>
    <h1 style="font-size: 20px; font-weight: 700; color: #202124; margin-bottom: 16px;">Two-Factor Authentication Reset</h1>
    <p style="color: #5f6368; line-height: 1.6; font-size: 14px; margin-bottom: 16px;">
      Use the following 6-digit verification code to reset the two-factor authenticator app for your account (<strong>${params.accountEmail}</strong>):
    </p>
    <div style="background: #f8f9fa; border: 1px solid #e8eaed; border-radius: 10px; padding: 20px; text-align: center; margin: 24px 0;">
      <span style="font-family: monospace; font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #202124;">
        ${params.code}
      </span>
      <p style="margin: 8px 0 0 0; color: #5f6368; font-size: 12px;">This code expires in 10 minutes.</p>
    </div>
    <p style="color: #d93025; font-size: 13px; line-height: 1.5;">
      ⚠️ Confirming this code will unenroll all active authenticator apps on your account. You will need to re-enroll your authenticator after logging in.
    </p>
    <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #e8eaed; color: #9aa0a6; font-size: 12px; text-align: center;">
      &copy; ${new Date().getFullYear()} wefik.world by Wefik.
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * 6. Recovery Email Verification OTP Template
 */
export function recoveryEmailOtpTemplate(code: string): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Verify your recovery email</title></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8f9fa; margin: 0; padding: 40px 20px;">
  <div style="max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 14px; border: 1px solid #e8eaed; overflow: hidden; padding: 32px;">
    <div style="border-bottom: 2px solid #a3e635; padding-bottom: 16px; margin-bottom: 24px;">
      <h2 style="margin: 0; color: #202124; font-size: 22px; font-weight: 700;">wefik<span style="color: #4f741b;">.world</span></h2>
    </div>
    <h1 style="font-size: 20px; font-weight: 700; color: #202124; margin-bottom: 16px;">Verify Recovery Email Address</h1>
    <p style="color: #5f6368; line-height: 1.6; font-size: 14px; margin-bottom: 16px;">
      Please enter the following 6-digit code to verify this address as the secondary recovery email for your wefik.world account:
    </p>
    <div style="background: #f8f9fa; border: 1px solid #e8eaed; border-radius: 10px; padding: 20px; text-align: center; margin: 24px 0;">
      <span style="font-family: monospace; font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #202124;">
        ${code}
      </span>
      <p style="margin: 8px 0 0 0; color: #5f6368; font-size: 12px;">This code expires in 10 minutes.</p>
    </div>
    <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #e8eaed; color: #9aa0a6; font-size: 12px; text-align: center;">
      &copy; ${new Date().getFullYear()} wefik.world by Wefik.
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * 7. Security Alert Template (Always On)
 */
export function securityAlertEmailTemplate(params: {
  title: string;
  description: string;
  details?: Record<string, string>;
}): string {
  const detailRows = params.details
    ? Object.entries(params.details)
        .map(
          ([k, v]) => `<tr><td style="padding: 6px 0; color: #5f6368; font-size: 13px;">${k}:</td><td style="padding: 6px 0; color: #202124; font-weight: 600; font-size: 13px;">${v}</td></tr>`
        )
        .join("")
    : "";

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Security Alert: ${params.title}</title></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8f9fa; margin: 0; padding: 40px 20px;">
  <div style="max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 14px; border: 1px solid #e8eaed; overflow: hidden; padding: 32px;">
    <div style="border-bottom: 2px solid #a3e635; padding-bottom: 16px; margin-bottom: 24px;">
      <h2 style="margin: 0; color: #202124; font-size: 22px; font-weight: 700;">wefik<span style="color: #4f741b;">.world</span></h2>
    </div>
    <div style="display: inline-block; background: #fee2e2; color: #b91c1c; border: 1px solid #fecaca; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 700; margin-bottom: 12px;">
      Security Notification
    </div>
    <h1 style="font-size: 20px; font-weight: 700; color: #202124; margin-bottom: 12px;">${params.title}</h1>
    <p style="color: #5f6368; line-height: 1.6; font-size: 14px; margin-bottom: 20px;">
      ${params.description}
    </p>
    ${
      params.details
        ? `<table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; background: #f8f9fa; border-radius: 8px; padding: 12px;">${detailRows}</table>`
        : ""
    }
    <p style="color: #5f6368; font-size: 13px; line-height: 1.5;">
      If you performed this action, no further steps are needed. If this wasn't you, please immediately <a href="https://wefik.world/forgot-password" style="color: #4f741b; font-weight: 600;">reset your password</a> and reach out to our team at support@wefik.world.
    </p>
    <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #e8eaed; color: #9aa0a6; font-size: 12px; text-align: center;">
      &copy; ${new Date().getFullYear()} wefik.world by Wefik.
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * 8. 7-Day Verified Purchase Review Request Template
 */
export function reviewReminderEmailTemplate(params: {
  customerName: string;
  productTitle: string;
  productSlug: string;
}): string {
  const greeting = params.customerName ? `Hi ${params.customerName},` : 'Hi there,';
  const reviewUrl = `https://wefik.world/products/${params.productSlug}#reviews`;

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>How is ${params.productTitle} working for you?</title></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8f9fa; margin: 0; padding: 40px 20px;">
  <div style="max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 14px; border: 1px solid #e8eaed; overflow: hidden; padding: 32px;">
    <div style="border-bottom: 2px solid #a3e635; padding-bottom: 16px; margin-bottom: 24px;">
      <h2 style="margin: 0; color: #202124; font-size: 22px; font-weight: 700;">wefik<span style="color: #4f741b;">.world</span></h2>
    </div>
    <div style="display: inline-block; background: #f0fdf4; color: #166534; border: 1px solid #bbf7d0; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 700; margin-bottom: 12px;">
      Verified Buyer Follow-up
    </div>
    <h1 style="font-size: 20px; font-weight: 700; color: #202124; margin-bottom: 12px;">How is ${params.productTitle} performing?</h1>
    <p style="color: #5f6368; line-height: 1.6; font-size: 15px;">${greeting}</p>
    <p style="color: #5f6368; line-height: 1.6; font-size: 14px;">
      It has been 7 days since you downloaded <strong>${params.productTitle}</strong>. We hope it helped you launch your project or client site faster!
    </p>
    <p style="color: #5f6368; line-height: 1.6; font-size: 14px;">
      As a single-vendor marketplace where every theme and plugin is engineered in-house, your real feedback helps us prioritize new block patterns, performance updates, and bugfixes.
    </p>
    <div style="text-align: center; margin: 28px 0;">
      <a href="${reviewUrl}" style="display: inline-block; background: #202124; color: #ffffff; padding: 12px 28px; border-radius: 10px; font-size: 14px; font-weight: 700; text-decoration: none;">
        Leave a Verified Review &rarr;
      </a>
    </div>
    <p style="color: #9aa0a6; font-size: 12px; line-height: 1.5; text-align: center;">
      Need technical support or found a bug? Reply directly to this email or reach us at support@wefik.world.
    </p>
    <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #e8eaed; color: #9aa0a6; font-size: 12px; text-align: center;">
      &copy; ${new Date().getFullYear()} wefik.world by Wefik (wefik.in).
    </div>
  </div>
</body>
</html>
  `.trim();
}


