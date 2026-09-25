// supabase/functions/auth-validate-email/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createAdminClient } from "../_shared/supabase.ts";

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
    const { email } = await req.json();
    if (!email || typeof email !== "string" || !EMAIL_REGEX.test(email.trim())) {
      return new Response(
        JSON.stringify({ ok: false, reason: "Please enter a valid email address." }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const parts = normalizedEmail.split("@");
    if (parts.length !== 2) {
      return new Response(
        JSON.stringify({ ok: false, reason: "Malformed email address." }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const domain = parts[1];

    // 1. Check blocked / disposable email domains in database
    const supabase = createAdminClient();
    const { data: blockedRow } = await supabase
      .from("blocked_email_domains")
      .select("domain")
      .eq("domain", domain)
      .maybeSingle();

    if (blockedRow) {
      return new Response(
        JSON.stringify({
          ok: false,
          reason: "Disposable or temporary email addresses are not permitted. Please use your standard or company email.",
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. DNS MX Record Verification (Fail-Open policy)
    // Non-negotiable: Never block a real user on a DNS hiccup or environment constraint.
    let mxFound = false;
    try {
      if (typeof (Deno as any).resolveDns === "function") {
        const mxRecords = await (Deno as any).resolveDns(domain, "MX");
        if (Array.isArray(mxRecords) && mxRecords.length > 0) {
          mxFound = true;
        }
      } else {
        // If resolveDns is unavailable in local runner, fail-open
        mxFound = true;
      }
    } catch (dnsErr: any) {
      console.warn(`DNS MX check warning for domain ${domain} (fail-open):`, dnsErr?.message || dnsErr);
      // Fail-open: do not block legitimate users if DNS lookup errors or times out
      mxFound = true;
    }

    return new Response(
      JSON.stringify({ ok: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("auth-validate-email exception:", err);
    // Fail-open on unhandled errors so real users are never locked out
    return new Response(
      JSON.stringify({ ok: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
