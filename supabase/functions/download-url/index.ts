import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createAdminClient, getAuthenticatedUser } from "../_shared/supabase.ts";
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
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return new Response(
        JSON.stringify({ error: "Authentication required to download files" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { product_id, version_id } = await req.json();
    if (!product_id) {
      return new Response(
        JSON.stringify({ error: "Product ID required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Rate Limit: 20 downloads per hour per user (Fix 16)
    const rateCheck = await redis.checkRateLimit(`download:${user.id}`, 20, 3600);
    if (!rateCheck.allowed) {
      return new Response(
        JSON.stringify({ error: "Download rate limit exceeded (max 20/hour). Try again later." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createAdminClient();

    // 1. Authorization Check: Active License OR Active Membership
    let isAuthorized = false;

    // Check License for this product
    const { data: license } = await supabase
      .from("licenses")
      .select("id, status")
      .eq("user_id", user.id)
      .eq("product_id", product_id)
      .eq("status", "active")
      .maybeSingle();

    if (license) {
      isAuthorized = true;
    }

    // If no direct license, check active membership
    if (!isAuthorized) {
      const { data: memberships } = await supabase
        .from("memberships")
        .select("plan, status, current_period_end")
        .eq("user_id", user.id)
        .eq("status", "active");

      if (memberships && memberships.length > 0) {
        const now = new Date();
        for (const m of memberships) {
          if (m.plan === "lifetime") {
            // Lifetime deal never expires
            isAuthorized = true;
            break;
          }
          if (m.plan === "monthly") {
            if (m.current_period_end && new Date(m.current_period_end) >= now) {
              isAuthorized = true;
              break;
            }
          }
        }
      }
    }

    if (!isAuthorized) {
      return new Response(
        JSON.stringify({
          error: "You do not own an active license or membership for this item. Access denied.",
        }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Fetch the target file path in private product-files bucket
    let versionQuery = supabase
      .from("product_versions")
      .select("id, version, file_path")
      .eq("product_id", product_id);

    if (version_id) {
      versionQuery = versionQuery.eq("id", version_id);
    } else {
      versionQuery = versionQuery.eq("is_latest", true);
    }

    const { data: versionRow, error: vErr } = await versionQuery.maybeSingle();

    if (vErr || !versionRow) {
      return new Response(
        JSON.stringify({ error: "Version file not found for this product" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. Generate 60-second Signed URL from private 'product-files' bucket
    const { data: signedData, error: signErr } = await supabase.storage
      .from("product-files")
      .createSignedUrl(versionRow.file_path, 60); // 60 seconds TTL

    if (signErr || !signedData?.signedUrl) {
      console.error("Storage signedUrl error:", signErr);
      return new Response(
        JSON.stringify({ error: "Failed to generate secure download link" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 4. Record download in downloads audit table
    const ip = req.headers.get("x-real-ip") || req.headers.get("x-forwarded-for") || "unknown";
    const userAgent = req.headers.get("user-agent") || "unknown";

    await supabase.from("downloads").insert({
      user_id: user.id,
      product_id,
      version_id: versionRow.id,
      ip_address: ip,
      user_agent: userAgent,
    });

    return new Response(
      JSON.stringify({
        download_url: signedData.signedUrl,
        version: versionRow.version,
        expires_in: 60,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("download-url error:", error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
