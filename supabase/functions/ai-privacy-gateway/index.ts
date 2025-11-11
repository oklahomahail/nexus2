/**
 * AI Privacy Gateway Edge Function
 *
 * CRITICAL SECURITY LAYER: All AI requests MUST pass through this gateway
 *
 * Enforces:
 * - JWT authentication
 * - Allowlist-only fields by category
 * - PII detection and blocking
 * - Privacy threshold validation for analytics
 * - No request body logging
 */

import { createClient } from "jsr:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";
import { validateAIPayload, type AICategory } from "../_shared/scrub.ts";

// ============================================================================
// TYPES
// ============================================================================

interface PrivacyGatewayRequest {
  category: AICategory;
  payload: any;
}

interface PrivacyGatewayResponse {
  ok: boolean;
  data?: any;
  error?: string;
  blocked_reason?: string;
}

// ============================================================================
// PRIVACY METRICS (for observability)
// ============================================================================

const metrics = {
  total_requests: 0,
  blocked_pii: 0,
  blocked_privacy_threshold: 0,
  blocked_invalid: 0,
  allowed: 0,
};

// ============================================================================
// MAIN HANDLER
// ============================================================================

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  metrics.total_requests++;

  try {
    // ========== AUTHENTICATION ==========

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      metrics.blocked_invalid++;
      return new Response(
        JSON.stringify({ ok: false, error: "Missing authorization header" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const token = authHeader.replace("Bearer ", "");

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

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      metrics.blocked_invalid++;
      return new Response(
        JSON.stringify({ ok: false, error: "Invalid or expired token" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // ========== REQUEST PARSING ==========

    let body: PrivacyGatewayRequest;
    try {
      body = await req.json();
    } catch (e) {
      metrics.blocked_invalid++;
      return new Response(
        JSON.stringify({ ok: false, error: "Invalid JSON payload" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const { category, payload } = body;

    if (!category || !payload) {
      metrics.blocked_invalid++;
      return new Response(
        JSON.stringify({ ok: false, error: "Missing category or payload" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    if (!["campaign", "analytics"].includes(category)) {
      metrics.blocked_invalid++;
      return new Response(
        JSON.stringify({
          ok: false,
          error: "Invalid category (must be campaign or analytics)",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // ========== PRIVACY THRESHOLD CHECK (ANALYTICS ONLY) ==========

    if (category === "analytics") {
      // Check if upstream analytics already flagged privacy violation
      if (
        payload?.result?.error &&
        typeof payload.result.error === "string" &&
        payload.result.error.includes("Privacy threshold not met")
      ) {
        metrics.blocked_privacy_threshold++;
        console.warn("[Privacy Gateway] Blocked: Privacy threshold not met");
        return new Response(
          JSON.stringify({
            ok: false,
            error: "privacy_threshold_not_met",
            blocked_reason: "Cohort size below minimum (N < 50)",
          }),
          {
            status: 403,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }
    }

    // ========== ALLOWLIST + PII VALIDATION ==========

    const validation = validateAIPayload(payload, category);

    if (!validation.safe) {
      metrics.blocked_pii++;
      console.warn(`[Privacy Gateway] Blocked: ${validation.reason}`);
      return new Response(
        JSON.stringify({
          ok: false,
          error: "pii_detected_blocked",
          blocked_reason: validation.reason,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const safePayload = validation.payload;

    // ========== LOG METRICS (NO BODIES) ==========

    console.log(`[Privacy Gateway] ${category} request passed validation`);
    console.log(
      `[Privacy Gateway] Metrics: ${JSON.stringify({ total: metrics.total_requests, blocked_pii: metrics.blocked_pii, blocked_privacy: metrics.blocked_privacy_threshold, blocked_invalid: metrics.blocked_invalid, allowed: metrics.allowed })}`,
    );

    // ========== FORWARD TO AI PROVIDER ==========

    // Extract provider-specific fields
    const system = safePayload.system || "You are a helpful assistant.";
    const turns = safePayload.turns || [];

    // Call Claude API (or other provider)
    const claudeApiKey = Deno.env.get("CLAUDE_API_KEY");
    if (!claudeApiKey) {
      console.error("[Privacy Gateway] CLAUDE_API_KEY not configured");
      return new Response(
        JSON.stringify({ ok: false, error: "AI service not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    let aiResponse: any;

    if (category === "campaign") {
      // Campaign generation: use full turns
      aiResponse = await callClaude(claudeApiKey, system, turns);
    } else if (category === "analytics") {
      // Analytics: generate narrative summary only
      const summaryPrompt = buildAnalyticsSummaryPrompt(safePayload);
      aiResponse = await callClaude(claudeApiKey, system, [
        { role: "user", content: summaryPrompt },
      ]);
    }

    metrics.allowed++;

    // ========== RETURN RESPONSE ==========

    return new Response(
      JSON.stringify({
        ok: true,
        data: aiResponse,
      } as PrivacyGatewayResponse),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (err) {
    console.error("[Privacy Gateway] Unexpected error:", err);

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

// ============================================================================
// CLAUDE API HELPER
// ============================================================================

async function callClaude(
  apiKey: string,
  system: string,
  messages: Array<{ role: "user" | "assistant"; content: string }>,
) {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 4096,
      temperature: 0.7,
      system,
      messages,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("[Privacy Gateway] Claude API error:", errorText);
    throw new Error(`Claude API error: ${response.status}`);
  }

  return await response.json();
}

// ============================================================================
// ANALYTICS SUMMARY PROMPT BUILDER
// ============================================================================

function buildAnalyticsSummaryPrompt(payload: any): string {
  const metric = payload.metric || "unknown";
  const data = payload.data || [];

  let prompt = `You are a nonprofit fundraising analyst. Provide a brief, actionable narrative summary (2-3 sentences) of the following anonymized donor analytics.\n\n`;

  prompt += `**Metric**: ${metric}\n\n`;

  if (Array.isArray(data) && data.length > 0) {
    prompt += `**Data**: ${JSON.stringify(data.slice(0, 10), null, 2)}\n\n`;
    if (data.length > 10) {
      prompt += `(Showing first 10 of ${data.length} records)\n\n`;
    }
  } else {
    prompt += `**Data**: ${JSON.stringify(data)}\n\n`;
  }

  prompt += `Provide a concise summary focusing on key insights and actionable recommendations. Do not request or reference any personally identifiable information.`;

  return prompt;
}
