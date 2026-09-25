// supabase/functions/auth-recovery-reset/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createAdminClient } from "../_shared/supabase.ts";
import { redis } from "../_shared/redis.ts";
import { sendEmail, recoveryResetEmailTemplate } from "../_shared/email-templates.ts";

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

    const { account_email, recovery_email } = await req.json();

    if (!account_email || !recovery_email) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const normAccount = account_email.trim().toLowerCase();
    const normRecovery = recovery_email.trim().toLowerCase();

    // Rate Limit: 5/hr per account/IP
    const rl = await redis.checkRateLimit(`recovery-reset:${clientIp}:${normAccount}`, 5, 3600);
    if (!rl.allowed) {
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded. Please wait before requesting another recovery link." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createAdminClient();

    // Check profile with matching verified recovery email
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, email, recovery_email, recovery_email_verified_at")
      .ilike("email", normAccount)
      .maybeSingle();

    if (
      profile &&
      profile.recovery_email &&
      profile.recovery_email.toLowerCase() === normRecovery &&
      profile.recovery_email_verified_at
    ) {
      // Generate recovery link using Supabase Auth Admin
      const { data: linkData, error: linkErr } = await supabase.auth.admin.generateLink({
        type: "recovery",
        email: profile.email,
        options: {
          redirectTo: `${Deno.env.get("NEXT_PUBLIC_APP_URL") || "https://wefik.world"}/reset-password`,
        },
      });

      if (!linkErr && linkData?.properties?.action_link) {
        await sendEmail({
          to: normRecovery,
          subject: `Password Reset for your wefik.world account (${normAccount})`,
          html: recoveryResetEmailTemplate({
            accountEmail: normAccount,
            resetUrl: linkData.properties.action_link,
          }),
        });
      } else {
        console.error("Failed to generate recovery link:", linkErr);
      }
    }

    // Always return generic success to avoid enumeration
    return new Response(
      JSON.stringify({
        ok: true,
        message: "If an account exists with this verified recovery email, a password reset link has been dispatched.",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("auth-recovery-reset exception:", err);
    return new Response(
      JSON.stringify({
        ok: true,
        message: "If an account exists with this verified recovery email, a password reset link has been dispatched.",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
