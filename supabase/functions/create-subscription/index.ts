import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createAdminClient, getAuthenticatedUser } from "../_shared/supabase.ts";
import { razorpay } from "../_shared/razorpay.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return new Response(
        JSON.stringify({ error: "Authentication required to subscribe" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createAdminClient();

    // Check if user already has an active monthly or lifetime membership
    const { data: activeMembership } = await supabase
      .from("memberships")
      .select("id, plan, status")
      .eq("user_id", user.id)
      .eq("status", "active")
      .maybeSingle();

    if (activeMembership) {
      return new Response(
        JSON.stringify({
          error: `You already have an active ${activeMembership.plan === "lifetime" ? "Lifetime Deal" : "Monthly"} membership.`,
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get Razorpay Monthly Plan ID from env
    const planId = Deno.env.get("RAZORPAY_MONTHLY_PLAN_ID");
    let subscriptionData;

    if (razorpay.isConfigured && planId) {
      subscriptionData = await razorpay.createSubscription({
        plan_id: planId,
        total_count: 60, // 5 years monthly
        customer_notify: 1,
        notes: {
          user_id: user.id,
          user_email: user.email ?? "",
          plan: "monthly",
        },
      });
    } else {
      // Mock subscription if in test environment without pre-configured plan
      subscriptionData = {
        id: `sub_mock_${Date.now()}`,
        status: "created",
      };
    }

    // Pre-insert membership record with status pending / inactive until charged webhook
    await supabase.from("memberships").insert({
      user_id: user.id,
      plan: "monthly",
      status: "cancelled", // inactive until subscription.charged webhook fires
      razorpay_subscription_id: subscriptionData.id,
    });

    return new Response(
      JSON.stringify({
        subscription_id: subscriptionData.id,
        key_id: Deno.env.get("RAZORPAY_KEY_ID") || "",
        plan: "monthly",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("create-subscription error:", error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
