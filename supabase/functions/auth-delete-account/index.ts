// supabase/functions/auth-delete-account/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createAdminClient, getAuthenticatedUser } from "../_shared/supabase.ts";

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
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { confirm_email } = await req.json();
    if (!confirm_email || confirm_email.trim().toLowerCase() !== (user.email || "").toLowerCase()) {
      return new Response(
        JSON.stringify({ error: "Email confirmation does not match your account email." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createAdminClient();

    // 1. Check for active recurring membership
    const { data: activeMembership } = await supabase
      .from("memberships")
      .select("id, plan, status")
      .eq("user_id", user.id)
      .eq("status", "active")
      .maybeSingle();

    if (activeMembership) {
      return new Response(
        JSON.stringify({
          error:
            "Active membership detected. Please cancel your membership before deleting your account to ensure your billing is cleanly terminated.",
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Remove avatar files from avatars bucket
    try {
      const { data: avatarFiles } = await supabase.storage
        .from("avatars")
        .list(user.id);

      if (avatarFiles && avatarFiles.length > 0) {
        const filePaths = avatarFiles.map((f) => `${user.id}/${f.name}`);
        await supabase.storage.from("avatars").remove(filePaths);
      }
    } catch (storageErr) {
      console.warn("Avatar cleanup notice:", storageErr);
    }

    // 3. Anonymize profile data while preserving order relations for legal & tax accounting
    await supabase
      .from("profiles")
      .update({
        full_name: "Deleted User",
        display_name: "Deleted User",
        avatar_url: null,
        recovery_email: null,
        recovery_email_verified_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    // 4. Delete user from auth.users via Supabase Admin
    const { error: deleteErr } = await supabase.auth.admin.deleteUser(user.id);
    if (deleteErr) {
      console.error("auth.admin.deleteUser error:", deleteErr);
      return new Response(
        JSON.stringify({ error: "Failed to delete auth user." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        ok: true,
        message: "Your account has been deleted and profile data anonymized.",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("auth-delete-account exception:", err);
    return new Response(
      JSON.stringify({ error: "Service unavailable." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
