import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createAdminClient, getAuthenticatedUser } from "../_shared/supabase.ts";
import { generateLicenseKey } from "../_shared/keygen.ts";

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
        JSON.stringify({ error: "Authentication required to claim free items" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { product_id } = await req.json();
    if (!product_id) {
      return new Response(
        JSON.stringify({ error: "Product ID is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createAdminClient();

    // Verify product is published and free
    const { data: product, error: prodErr } = await supabase
      .from("products")
      .select("id, title, is_free, status")
      .eq("id", product_id)
      .single();

    if (prodErr || !product || product.status !== "published") {
      return new Response(
        JSON.stringify({ error: "Product not found or unavailable" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!product.is_free) {
      return new Response(
        JSON.stringify({ error: "This product is not free. Please checkout normally." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if user already claimed a license for this product
    const { data: existingLicense } = await supabase
      .from("licenses")
      .select("id, license_key")
      .eq("user_id", user.id)
      .eq("product_id", product.id)
      .eq("status", "active")
      .maybeSingle();

    if (existingLicense) {
      return new Response(
        JSON.stringify({
          success: true,
          message: "You already claimed this product! License key is in your dashboard.",
          license_key: existingLicense.license_key,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate license key and insert
    const licenseKey = generateLicenseKey();
    const { error: licErr } = await supabase.from("licenses").insert({
      license_key: licenseKey,
      user_id: user.id,
      product_id: product.id,
      order_id: null, // No order for free claims
      license_type: "single",
      status: "active",
      max_activations: 1,
    });

    if (licErr) {
      throw new Error(`Failed to issue free license: ${licErr.message}`);
    }

    // Increment download count
    await supabase.rpc("increment_product_downloads", { p_id: product.id });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Free license claimed successfully!",
        license_key: licenseKey,
        product_id: product.id,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("claim-free error:", error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
