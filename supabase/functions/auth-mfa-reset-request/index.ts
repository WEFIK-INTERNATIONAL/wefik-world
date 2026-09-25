// supabase/functions/auth-mfa-reset-request/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createAdminClient } from "../_shared/supabase.ts";
import { redis } from "../_shared/redis.ts";
import { sendEmail, mfaResetOtpTemplate } from "../_shared/email-templates.ts";

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

    const { account_email } = await req.json();
    if (!account_email || typeof account_email !== "string") {
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const normAccount = account_email.trim().toLowerCase();

    // Rate Limit: 5 requests per hour
    const rl = await redis.checkRateLimit(`mfa-reset-req:${clientIp}:${normAccount}`, 5, 3600);
    if (!rl.allowed) {
      return new Response(
        JSON.stringify({ error: "Too many reset requests. Please wait an hour before trying again." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createAdminClient();
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, email, recovery_email, recovery_email_verified_at")
      .ilike("email", normAccount)
      .maybeSingle();

    if (profile && profile.recovery_email && profile.recovery_email_verified_at) {
      // Generate 6-digit OTP
      const array = new Uint32Array(1);
      crypto.getRandomValues(array);
      const code = (100000 + (array[0] % 900000)).toString();

      // Store in Redis with 10-minute (600s) TTL
      await redis.set(`mfa-otp:${normAccount}`, code, 600);

      // Send email to recovery email
      await sendEmail({
        to: profile.recovery_email,
        subject: `Reset 2FA Authenticator Code for ${normAccount}`,
        html: mfaResetOtpTemplate({
          accountEmail: normAccount,
          code,
        }),
      });
    }

    return new Response(
      JSON.stringify({
        ok: true,
        message: "If an account with a verified recovery email exists, a 6-digit reset code has been sent.",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("auth-mfa-reset-request exception:", err);
    return new Response(
      JSON.stringify({
        ok: true,
        message: "If an account with a verified recovery email exists, a 6-digit reset code has been sent.",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
