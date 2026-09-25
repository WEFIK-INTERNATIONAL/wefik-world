// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This code is designed to run on Supabase Edge Functions (Deno runtime).

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8";
import { sendEmail, reviewReminderEmailTemplate } from "../_shared/email-templates.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Compute 7 days ago window (7 days to 8 days ago)
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const eightDaysAgo = new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000);

    // Fetch completed orders placed between 7 and 8 days ago
    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select(`
        id,
        user_id,
        created_at,
        order_items (
          product_id,
          products (
            id,
            title,
            slug
          )
        )
      `)
      .eq("status", "completed")
      .gte("created_at", eightDaysAgo.toISOString())
      .lte("created_at", sevenDaysAgo.toISOString());

    if (ordersError) {
      throw ordersError;
    }

    let sentCount = 0;

    for (const order of orders || []) {
      if (!order.user_id) continue;

      // Get user email & profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("email, full_name")
        .eq("id", order.user_id)
        .single();

      if (!profile || !profile.email) continue;

      const items = (order.order_items || []) as any[];

      for (const item of items) {
        const product = item.products;
        if (!product) continue;

        // Check if user already reviewed this product
        const { data: existingReview } = await supabase
          .from("reviews")
          .select("id")
          .eq("user_id", order.user_id)
          .eq("product_id", product.id)
          .maybeSingle();

        if (existingReview) {
          continue; // Already reviewed
        }

        const html = reviewReminderEmailTemplate({
          customerName: profile.full_name || "Valued Creator",
          productTitle: product.title,
          productSlug: product.slug,
        });

        const success = await sendEmail({
          to: profile.email,
          subject: `How is ${product.title} performing? Leave a verified review`,
          html,
        });

        if (success) {
          sentCount++;
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Dispatched ${sentCount} review reminder emails.`,
        sent_count: sentCount,
        orders_checked: orders?.length || 0,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: errorMsg }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
