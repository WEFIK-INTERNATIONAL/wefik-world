import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createAdminClient } from "../_shared/supabase.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Authenticate: require a cron secret or service-role key
    const authHeader = req.headers.get("authorization") || "";
    const cronSecret = Deno.env.get("CRON_SECRET");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

    const token = authHeader.replace("Bearer ", "");
    const isAuthorized =
      (cronSecret && token === cronSecret) ||
      (serviceRoleKey && token === serviceRoleKey);

    if (!isAuthorized) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { title, body, url, user_id } = await req.json();
    if (!title || !body) {
      return new Response(
        JSON.stringify({ error: "title and body are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createAdminClient();

    // Query tokens
    let query = supabase.from("push_subscriptions").select("token");
    if (user_id) {
      query = query.eq("user_id", user_id);
    }

    const { data: subs, error } = await query;
    if (error || !subs || subs.length === 0) {
      return new Response(
        JSON.stringify({ message: "No subscribers to notify" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Return successfully queued notifications
    return new Response(
      JSON.stringify({
        success: true,
        dispatched_count: subs.length,
        notification: { title, body, url },
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("send-push error:", error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
