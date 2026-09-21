import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createAdminClient } from "../_shared/supabase.ts";
import { redis } from "../_shared/redis.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const ip = req.headers.get("x-real-ip") || req.headers.get("x-forwarded-for") || "unknown";

    // Rate limit: 100 requests / hour per IP
    const rateCheck = await redis.checkRateLimit(`lic_val:${ip}`, 100, 3600);
    if (!rateCheck.allowed) {
      return new Response(
        JSON.stringify({ valid: false, error: "Rate limit exceeded (max 100/hr). Please wait." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { license_key, domain } = await req.json();
    if (!license_key) {
      return new Response(
        JSON.stringify({ valid: false, error: "License key is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createAdminClient();

    // Query license record
    const { data: license, error: licErr } = await supabase
      .from("licenses")
      .select("id, status, license_type, max_activations, activated_domains, products(title, slug)")
      .eq("license_key", license_key.trim().toUpperCase())
      .maybeSingle();

    if (licErr || !license) {
      return new Response(
        JSON.stringify({ valid: false, error: "Invalid license key" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (license.status !== "active") {
      return new Response(
        JSON.stringify({
          valid: false,
          error: `License is ${license.status}. Please contact support.`,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const normalizedDomain = domain ? domain.toLowerCase().trim().replace(/^https?:\/\//, "").replace(/\/.*$/, "") : null;
    let activatedDomains = license.activated_domains || [];

    if (normalizedDomain) {
      if (!activatedDomains.includes(normalizedDomain)) {
        // Check activation capacity
        if (activatedDomains.length >= license.max_activations) {
          return new Response(
            JSON.stringify({
              valid: false,
              error: `Activation limit reached (${activatedDomains.length}/${license.max_activations}). Upgrade to Unlimited license.`,
              activated_domains: activatedDomains,
            }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Add domain
        activatedDomains.push(normalizedDomain);
        await supabase
          .from("licenses")
          .update({ activated_domains: activatedDomains })
          .eq("id", license.id);
      }
    }

    return new Response(
      JSON.stringify({
        valid: true,
        license_type: license.license_type,
        max_activations: license.max_activations,
        activations_count: activatedDomains.length,
        activated_domains: activatedDomains,
        product: (license as any).products?.title || "Digital Product",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("license-validate error:", error);
    return new Response(
      JSON.stringify({ valid: false, error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
