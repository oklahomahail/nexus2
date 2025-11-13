// src/services/ai/privacyAwareClaudeService.ts
// Privacy-first Claude AI service that routes all requests through the AI Privacy Gateway

import { supabase } from "@/lib/supabaseClient";

// -------- Types

export type ClaudeModel =
  | "claude-3-7-sonnet-latest"
  | "claude-3-5-sonnet-20241022"
  | "claude-3-5-haiku-20241022";

export type AICategory = "campaign" | "analytics";

export interface PrivacyAwareClaudeRequest {
  category: AICategory;
  system?: string;
  turns?: Array<{ role: "user" | "assistant"; content: string }>;
  prompt?: string; // Simple prompt (converted to turns internally)
  maxTokens?: number;
  temperature?: number;
  // For analytics category
  metric?: string;
  data?: any;
}

export interface PrivacyAwareClaudeResponse {
  ok: boolean;
  content: string;
  usage?: { input_tokens?: number; output_tokens?: number };
  error?: string;
  blocked_reason?: string;
  raw?: any;
}

// -------- Main API

/**
 * Call Claude AI through the privacy gateway
 *
 * This is the ONLY approved way to call Claude for AI features
 * Direct API calls bypass PII scrubbing and privacy validation
 *
 * @param request - Request with category and either turns or prompt
 * @returns Privacy-validated response from Claude
 */
export async function callClaudeSafely(
  request: PrivacyAwareClaudeRequest,
): Promise<PrivacyAwareClaudeResponse> {
  try {
    // Build payload based on category
    let payload: any;

    if (request.category === "campaign") {
      // Campaign generation uses turns
      const turns =
        request.turns ??
        (request.prompt
          ? [{ role: "user" as const, content: request.prompt }]
          : []);

      payload = {
        system:
          request.system ||
          "You are a helpful writing assistant for nonprofit fundraising campaigns.",
        turns,
      };
    } else if (request.category === "analytics") {
      // Analytics uses metric + data
      payload = {
        metric: request.metric || "unknown",
        data: request.data || [],
        system:
          request.system ||
          "You are a nonprofit fundraising analyst providing actionable insights.",
      };
    } else {
      throw new Error(`Invalid category: ${request.category}`);
    }

    // Get current auth session
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return {
        ok: false,
        content: "",
        error: "Not authenticated - please sign in",
      };
    }

    // Call privacy gateway Edge Function
    const { data, error } = await supabase.functions.invoke(
      "ai-privacy-gateway",
      {
        body: {
          category: request.category,
          payload,
        },
      },
    );

    if (error) {
      console.error("Privacy gateway error:", error);
      return {
        ok: false,
        content: "",
        error: error.message || "AI request failed",
      };
    }

    if (!data || !data.ok) {
      return {
        ok: false,
        content: "",
        error: data?.error || "AI request failed",
        blocked_reason: data?.blocked_reason,
      };
    }

    // Extract content from Claude response
    const aiResponse = data.data;
    const content =
      aiResponse?.content?.[0]?.text ||
      aiResponse?.content?.[0]?.content?.[0]?.text ||
      "";

    return {
      ok: true,
      content,
      usage: aiResponse?.usage,
      raw: aiResponse,
    };
  } catch (err) {
    console.error("Error calling Claude safely:", err);
    return {
      ok: false,
      content: "",
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

/**
 * Generate campaign content using Claude (privacy-safe)
 *
 * @param system - System prompt
 * @param turns - Conversation turns
 * @returns Claude response
 */
export async function generateCampaignContent(
  system: string,
  turns: Array<{ role: "user" | "assistant"; content: string }>,
): Promise<PrivacyAwareClaudeResponse> {
  return callClaudeSafely({
    category: "campaign",
    system,
    turns,
  });
}

/**
 * Generate analytics summary using Claude (privacy-safe)
 *
 * @param metric - Metric name
 * @param data - Anonymized analytics data
 * @param system - Optional system prompt
 * @returns Claude response with narrative summary
 */
export async function generateAnalyticsSummary(
  metric: string,
  data: any,
  system?: string,
): Promise<PrivacyAwareClaudeResponse> {
  return callClaudeSafely({
    category: "analytics",
    metric,
    data,
    system,
  });
}

/**
 * Simple prompt-based generation (privacy-safe)
 * Useful for one-off requests
 *
 * @param prompt - User prompt
 * @param category - Request category (campaign or analytics)
 * @param system - Optional system prompt
 * @returns Claude response
 */
export async function generateSimple(
  prompt: string,
  category: AICategory,
  system?: string,
): Promise<PrivacyAwareClaudeResponse> {
  return callClaudeSafely({
    category,
    prompt,
    system,
  });
}

// -------- Migration helpers

/**
 * Check if direct Claude API key is configured
 * This should eventually be removed - all calls should go through gateway
 */
export function hasDirectApiKey(): boolean {
  try {
    const key =
      localStorage.getItem("claude_api_key_encrypted") ||
      import.meta.env.VITE_CLAUDE_API_KEY;
    return !!key;
  } catch {
    return false;
  }
}

/**
 * Display warning about using direct API
 * Use this in development to identify code that needs migration
 */
export function warnDirectApiUsage(location: string) {
  console.warn(
    `[PRIVACY WARNING] ${location} is using direct Claude API. Migrate to privacyAwareClaudeService for PII protection.`,
  );
}
