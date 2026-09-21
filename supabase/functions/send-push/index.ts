import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createAdminClient } from "../_shared/supabase.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
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
