/**
 * campaign-designer Edge Function
 *
 * AI-powered campaign generation with Claude
 * Generates blueprint, direct mail, and digital content based on brand context
 */

import { createClient } from "jsr:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

// ============================================================================
// TYPES
// ============================================================================

interface CampaignDesignerRequest {
  system: string;
  turns: Array<{
    role: "user";
    content: string;
  }>;
  params: {
    client_id: string;
    brand_id: string;
    name: string;
    type: string;
    season: string;
    audience: string;
    goal: string;
    tone: string;
    channels: { direct_mail: boolean; email: boolean; social: boolean };
    durationWeeks: number;
  };
}

interface CampaignDesignerResponse {
  ok: boolean;
  blueprint_json?: any;
  blueprint_prose?: string;
  direct_mail_md?: string;
  digital_json?: {
    emails: Array<{
      id: number;
      subject: string;
      preheader: string;
      body: string;
      cta: string;
    }>;
    social: Array<{
      id: number;
      short: string;
      long: string;
      imagePrompt: string;
    }>;
  };
  digital_md?: string;
  error?: string;
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
      return new Response(
        JSON.stringify({ ok: false, error: "Invalid or expired token" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // ========== REQUEST VALIDATION ==========

    const body: CampaignDesignerRequest = await req.json();
    const { system, turns, params } = body;

    if (!system || !turns || turns.length === 0) {
      return new Response(
        JSON.stringify({ ok: false, error: "Missing system prompt or turns" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Verify client access
    const { data: membership, error: membershipError } = await supabase
      .from("client_memberships")
      .select("id")
      .eq("client_id", params.client_id)
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

    // ========== CLAUDE API CONFIGURATION ==========

    const claudeApiKey = Deno.env.get("CLAUDE_API_KEY");
    if (!claudeApiKey) {
      console.error("CLAUDE_API_KEY not set");
      return new Response(
        JSON.stringify({ ok: false, error: "AI service not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // ========== GENERATE CAMPAIGN ==========

    const result: CampaignDesignerResponse = { ok: true };

    // Turn 1: Blueprint
    if (turns[0]) {
      const blueprintResponse = await callClaude(claudeApiKey, system, [
        turns[0],
      ]);
      const blueprintText = blueprintResponse.content[0].text;

      // Try to extract JSON
      const jsonMatch = blueprintText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          result.blueprint_json = JSON.parse(jsonMatch[0]);
        } catch (e) {
          console.warn("Failed to parse blueprint JSON:", e);
        }
      }

      // Extract prose (everything after JSON)
      const proseMatch = blueprintText.split(/\}/).slice(1).join("}").trim();
      if (proseMatch) {
        result.blueprint_prose = proseMatch;
      }
    }

    // Turn 2: Direct Mail (if applicable)
    if (turns[1] && params.channels.direct_mail) {
      const dmResponse = await callClaude(claudeApiKey, system, [
        turns[0],
        turns[1],
      ]);
      result.direct_mail_md = dmResponse.content[0].text;
    }

    // Turn 3: Digital (if applicable)
    if (turns[2] && (params.channels.email || params.channels.social)) {
      const digitalResponse = await callClaude(claudeApiKey, system, [
        turns[0],
        turns[1] || turns[0], // Use turn 0 if turn 1 doesn't exist
        turns[2],
      ]);
      const digitalText = digitalResponse.content[0].text;

      // Try to extract JSON
      const jsonMatch = digitalText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          result.digital_json = JSON.parse(jsonMatch[0]);
        } catch (e) {
          console.warn("Failed to parse digital JSON:", e);
        }
      }

      // Extract prose (everything after JSON)
      const proseMatch = digitalText.split(/\}/).slice(1).join("}").trim();
      if (proseMatch) {
        result.digital_md = proseMatch;
      }
    }

    // ========== SUCCESS RESPONSE ==========

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
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

// ============================================================================
// CLAUDE API HELPER
// ============================================================================

async function callClaude(
  apiKey: string,
  system: string,
  messages: Array<{ role: "user"; content: string }>,
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
    console.error("Claude API error:", errorText);
    throw new Error(`Claude API error: ${response.status} ${errorText}`);
  }

  return await response.json();
}
