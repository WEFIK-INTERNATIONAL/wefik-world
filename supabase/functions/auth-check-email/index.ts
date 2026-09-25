// supabase/functions/auth-check-email/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createAdminClient } from "../_shared/supabase.ts";
import { redis } from "../_shared/redis.ts";

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

  const startTime = Date.now();

  try {
    const clientIp =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      req.headers.get("cf-connecting-ip") ||
      "127.0.0.1";

    // Rate Limit: 5/min/IP via Upstash
    const rl = await redis.checkRateLimit(`check-email:${clientIp}`, 5, 60);
    if (!rl.allowed) {
      return new Response(
        JSON.stringify({ error: "Too many email check requests. Please try again shortly." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { email } = await req.json();
    if (!email || typeof email !== "string" || !EMAIL_REGEX.test(email.trim())) {
      return new Response(
        JSON.stringify({ error: "Invalid email format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const supabase = createAdminClient();

    const { data, error } = await supabase.rpc("check_email_registered", {
      p_email: normalizedEmail,
    });

    if (error) {
      console.error("RPC check_email_registered error:", error);
      return new Response(
        JSON.stringify({ error: "Internal check failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const row = data && data[0] ? data[0] : {
      registered: false,
      confirmed: false,
      has_password: false,
      oauth_providers: [],
    };

    // Uniform timing guard (minimum 120ms total elapsed time) to mitigate timing enumeration
    const elapsed = Date.now() - startTime;
    if (elapsed < 120) {
      await new Promise((r) => setTimeout(r, 120 - elapsed));
    }

    return new Response(
      JSON.stringify({
        registered: Boolean(row.registered),
        confirmed: Boolean(row.confirmed),
        has_password: Boolean(row.has_password),
        oauth_providers: row.oauth_providers || [],
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("auth-check-email exception:", err);
    return new Response(
      JSON.stringify({ error: "Service unavailable" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
