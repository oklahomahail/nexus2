/**
 * analyze-donor-data Edge Function
 *
 * Securely invokes donor intelligence RPC functions with privacy enforcement
 * Requires JWT authentication and validates client access
 */

import { createClient } from "jsr:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

// ============================================================================
// TYPES
// ============================================================================

export interface MetricRequest {
  metric: "retained_donors" | "yoy_upgrade" | "gift_velocity" | "seasonality";
  filters?: {
    num_years?: number;
    year_from?: number;
    year_to?: number;
    year?: number;
  };
  client_id?: string;
}

export interface MetricResponse {
  ok: boolean;
  metric: string;
  data?: unknown;
  error?: string;
  privacy_enforced?: boolean;
}

// ============================================================================
// MAIN HANDLER
// ============================================================================

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // ========== AUTHENTICATION ==========

    // Extract JWT from Authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ ok: false, error: "Missing authorization header" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const token = authHeader.replace("Bearer ", "");

    // Create Supabase client with user's JWT
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: authHeader },
      },
      auth: {
        persistSession: false,
      },
    });

    // Verify JWT and get user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ ok: false, error: "Invalid or expired token" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // ========== REQUEST VALIDATION ==========

    const body: MetricRequest = await req.json();
    const { metric, filters = {}, client_id } = body;

    // Validate metric name
    const validMetrics = [
      "retained_donors",
      "yoy_upgrade",
      "gift_velocity",
      "seasonality",
    ];
    if (!validMetrics.includes(metric)) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: `Invalid metric. Valid options: ${validMetrics.join(", ")}`,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Validate required filters per metric
    if (metric === "yoy_upgrade") {
      if (!filters.year_from || !filters.year_to) {
        return new Response(
          JSON.stringify({
            ok: false,
            error: "yoy_upgrade requires year_from and year_to filters",
          }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }
    }

    // ========== CLIENT ACCESS CHECK ==========

    // If client_id provided, verify user has access
    if (client_id) {
      const { data: membership, error: membershipError } = await supabase
        .from("client_memberships")
        .select("id")
        .eq("client_id", client_id)
        .eq("user_id", user.id)
        .single();

      if (membershipError || !membership) {
        return new Response(
          JSON.stringify({
            ok: false,
            error: "Access denied: user is not a member of this client",
          }),
          {
            status: 403,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }
    }

    // ========== EXECUTE METRIC COMPUTATION ==========

    const { data, error } = await supabase.rpc("compute_metric", {
      p_metric_name: metric,
      p_filters: filters,
      p_client_id: client_id || null,
    });

    if (error) {
      console.error("RPC error:", error);

      // Check if privacy threshold violation
      const isPrivacyError = error.message?.includes(
        "Privacy threshold not met",
      );

      return new Response(
        JSON.stringify({
          ok: false,
          metric,
          error: error.message,
          privacy_enforced: isPrivacyError,
        }),
        {
          status: isPrivacyError ? 403 : 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // ========== SUCCESS RESPONSE ==========

    return new Response(
      JSON.stringify({
        ok: true,
        metric,
        data: data || [],
        privacy_enforced: true,
      } as MetricResponse),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (err) {
    console.error("Unexpected error:", err);

    return new Response(
      JSON.stringify({
        ok: false,
        error:
          err instanceof Error ? err.message : "An unexpected error occurred",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
