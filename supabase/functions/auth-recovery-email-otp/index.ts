// supabase/functions/auth-recovery-email-otp/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createAdminClient, getAuthenticatedUser } from "../_shared/supabase.ts";
import { redis } from "../_shared/redis.ts";
import {
  sendEmail,
  recoveryEmailOtpTemplate,
  securityAlertEmailTemplate,
} from "../_shared/email-templates.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { action, recovery_email, code } = await req.json();
    const supabase = createAdminClient();

    if (action === "request") {
      if (!recovery_email || !EMAIL_REGEX.test(recovery_email.trim())) {
        return new Response(
          JSON.stringify({ error: "Please enter a valid recovery email address." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const normRecovery = recovery_email.trim().toLowerCase();
      if (normRecovery === (user.email || "").toLowerCase()) {
        return new Response(
          JSON.stringify({ error: "Recovery email must be different from your primary account email." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Check blocked domains
      const domain = normRecovery.split("@")[1];
      const { data: blockedRow } = await supabase
        .from("blocked_email_domains")
        .select("domain")
        .eq("domain", domain)
        .maybeSingle();

      if (blockedRow) {
        return new Response(
          JSON.stringify({ error: "Disposable or temporary email addresses are not permitted." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Rate limit OTP requests (5 per hour per user)
      const rl = await redis.checkRateLimit(`rec-otp-req:${user.id}`, 5, 3600);
      if (!rl.allowed) {
        return new Response(
          JSON.stringify({ error: "Too many verification requests. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Generate 6-digit OTP
      const array = new Uint32Array(1);
      crypto.getRandomValues(array);
      const otp = (100000 + (array[0] % 900000)).toString();

      // Store in Redis with 10-minute TTL
      await redis.set(`rec-otp:${user.id}:${normRecovery}`, otp, 600);

      // Send OTP
      await sendEmail({
        to: normRecovery,
        subject: "Verify your wefik.world recovery email",
        html: recoveryEmailOtpTemplate(otp),
      });

      return new Response(
        JSON.stringify({ ok: true, message: `Verification code sent to ${normRecovery}.` }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "verify") {
      if (!recovery_email || !code) {
        return new Response(
          JSON.stringify({ error: "Recovery email and verification code are required." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const normRecovery = recovery_email.trim().toLowerCase();
      const cleanCode = code.trim();

      const savedOtp = await redis.get(`rec-otp:${user.id}:${normRecovery}`);
      if (!savedOtp || savedOtp !== cleanCode) {
        return new Response(
          JSON.stringify({ error: "Invalid or expired verification code." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Save to profiles
      const { error: updateErr } = await supabase
        .from("profiles")
        .update({
          recovery_email: normRecovery,
          recovery_email_verified_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (updateErr) {
        console.error("Profile update error:", updateErr);
        return new Response(
          JSON.stringify({ error: "Failed to update profile." }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Clear OTP
      await redis.set(`rec-otp:${user.id}:${normRecovery}`, "", 1);

      // Send Security Alert to primary email
      if (user.email) {
        await sendEmail({
          to: user.email,
          subject: "Security Alert: Recovery Email Added",
          html: securityAlertEmailTemplate({
            title: "Recovery Email Configured",
            description: `A secondary recovery email (${normRecovery}) has been successfully verified on your account.`,
            details: {
              "Recovery Email": normRecovery,
              Time: new Date().toUTCString(),
            },
          }),
        });
      }

      return new Response(
        JSON.stringify({ ok: true, message: "Recovery email verified and enabled successfully." }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "remove") {
      const { error: removeErr } = await supabase
        .from("profiles")
        .update({
          recovery_email: null,
          recovery_email_verified_at: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (removeErr) {
        return new Response(
          JSON.stringify({ error: "Failed to remove recovery email." }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (user.email) {
        await sendEmail({
          to: user.email,
          subject: "Security Alert: Recovery Email Removed",
          html: securityAlertEmailTemplate({
            title: "Recovery Email Removed",
            description: "The secondary recovery email on your account has been removed.",
            details: {
              Time: new Date().toUTCString(),
            },
          }),
        });
      }

      return new Response(
        JSON.stringify({ ok: true, message: "Recovery email removed." }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action." }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("auth-recovery-email-otp exception:", err);
    return new Response(
      JSON.stringify({ error: "Service unavailable." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
