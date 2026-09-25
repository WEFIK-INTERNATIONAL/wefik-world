// supabase/functions/auth-mfa-reset-confirm/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createAdminClient } from "../_shared/supabase.ts";
import { redis } from "../_shared/redis.ts";
import { sendEmail, securityAlertEmailTemplate } from "../_shared/email-templates.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const clientIp =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      req.headers.get("cf-connecting-ip") ||
      "127.0.0.1";

    const { account_email, code } = await req.json();
    if (!account_email || !code) {
      return new Response(
        JSON.stringify({ error: "Missing email or code" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const normAccount = account_email.trim().toLowerCase();
    const cleanCode = code.trim();

    // Rate Limit: 5 confirmation attempts per 10 minutes
    const rl = await redis.checkRateLimit(`mfa-reset-conf:${clientIp}:${normAccount}`, 5, 600);
    if (!rl.allowed) {
      return new Response(
        JSON.stringify({ error: "Too many attempts. Please try again in 10 minutes." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify OTP from Redis
    const savedCode = await redis.get(`mfa-otp:${normAccount}`);
    if (!savedCode || savedCode !== cleanCode) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired verification code." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createAdminClient();

    // Look up user by email
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, email, recovery_email")
      .ilike("email", normAccount)
      .maybeSingle();

    if (!profile) {
      return new Response(
        JSON.stringify({ error: "Account not found." }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Unenroll all MFA factors for this user
    try {
      // Supabase Auth Admin listFactors
      const { data: factors, error: factorsErr } = await (supabase.auth.admin as any).mfa.listFactorsForUser({
        userId: profile.id,
      });

      if (!factorsErr && factors && factors.factors) {
        for (const factor of factors.factors) {
          await (supabase.auth.admin as any).mfa.deleteFactor({
            userId: profile.id,
            id: factor.id,
          });
        }
      }
    } catch (mfaErr) {
      console.warn("MFA factors removal notice:", mfaErr);
    }

    // Delete OTP key from Redis
    await redis.set(`mfa-otp:${normAccount}`, "", 1);

    // Send security notification to primary email
    await sendEmail({
      to: profile.email,
      subject: "Security Alert: Two-Factor Authentication Was Reset",
      html: securityAlertEmailTemplate({
        title: "Two-Factor Authentication Reset",
        description: "Two-factor authentication (TOTP) was successfully reset on your account via your verified recovery email.",
        details: {
          Time: new Date().toUTCString(),
          Method: "Recovery Email Verification",
        },
      }),
    });

    if (profile.recovery_email) {
      await sendEmail({
        to: profile.recovery_email,
        subject: "Security Alert: Two-Factor Authentication Was Reset",
        html: securityAlertEmailTemplate({
          title: "Two-Factor Authentication Reset",
          description: `Two-factor authentication was reset for account ${profile.email} using this recovery address.`,
          details: {
            Time: new Date().toUTCString(),
          },
        }),
      });
    }

    return new Response(
      JSON.stringify({
        ok: true,
        message: "Two-factor authentication has been reset. You may now log in with your password and re-enroll your authenticator.",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("auth-mfa-reset-confirm exception:", err);
    return new Response(
      JSON.stringify({ error: "Failed to reset two-factor authentication." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
