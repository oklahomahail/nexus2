/**
 * Campaign Design Service
 *
 * Build brand-aware prompts and invoke AI generation
 * Generates complete fundraising campaigns (direct mail, email, social)
 */

import { supabase } from "@/lib/supabaseClient";
import {
  estimatePostage,
  MailClass,
  MailFormat,
} from "@/services/postageEstimator";

// ============================================================================
// TYPES
// ============================================================================

export type CampaignParams = {
  client_id: string;
  brand_id: string;
  name: string;
  type: "Appeal" | "Event" | "Program" | "Endowment" | "Capital";
  season: "Spring" | "Summer" | "Fall" | "Year-End";
  audience: string; // free text or segment label
  goal: string; // short statement
  tone: "Urgent" | "Inspiring" | "Reflective" | "Grateful";
  channels: { direct_mail: boolean; email: boolean; social: boolean };
  mail?: { format: MailFormat; mailClass: MailClass; quantity: number };
  durationWeeks: number; // for digital sequence pacing
};

export type BrandContext = {
  profile: {
    name: string;
    mission_statement?: string | null;
    tone_of_voice?: string | null;
    brand_personality?: string | null;
    style_keywords?: string[] | null;
    primary_colors?: string[] | null;
    typography?: Record<string, any> | null;
  };
  snippets: { title?: string | null; content: string }[]; // top ~10 excerpts
};

export type CampaignGenerationResult = {
  ctx: BrandContext;
  params: CampaignParams;
  postage?: {
    unit: number;
    total: number;
    quantity: number;
    mailClass: MailClass;
    savings?: number;
  } | null;
  outputs: {
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
  };
};

// ============================================================================
// BRAND CONTEXT LOADING
// ============================================================================

/**
 * Load brand profile and corpus snippets
 */
export async function loadBrandContext(
  client_id: string,
  brand_id: string,
  limit = 10,
): Promise<BrandContext> {
  const [{ data: profile, error: e1 }, { data: corpus, error: e2 }] =
    await Promise.all([
      supabase
        .from("brand_profiles")
        .select(
          "name, mission_statement, tone_of_voice, brand_personality, style_keywords, primary_colors, typography",
        )
        .eq("client_id", client_id)
        .eq("id", brand_id)
        .single(),
      supabase
        .from("brand_corpus")
        .select("title, content")
        .eq("client_id", client_id)
        .eq("brand_id", brand_id)
        .is("deleted_at", null)
        .order("updated_at", { ascending: false })
        .limit(limit),
    ]);

  if (e1) throw e1;
  if (e2) throw e2;

  return {
    profile: profile as any,
    snippets: (corpus || []).map((c: any) => ({
      title: c.title,
      content: c.content,
    })),
  };
}

// ============================================================================
// PROMPT BUILDING
// ============================================================================

/**
 * Build AI prompts for campaign generation
 */
export function buildPrompts(ctx: BrandContext, params: CampaignParams) {
  const ctxText = [
    `BRAND: ${ctx.profile.name}`,
    ctx.profile.mission_statement
      ? `MISSION: ${ctx.profile.mission_statement}`
      : "",
    ctx.profile.tone_of_voice ? `TONE: ${ctx.profile.tone_of_voice}` : "",
    ctx.profile.brand_personality
      ? `PERSONALITY: ${ctx.profile.brand_personality}`
      : "",
    ctx.profile.style_keywords?.length
      ? `KEYWORDS: ${ctx.profile.style_keywords.join(", ")}`
      : "",
  ]
    .filter(Boolean)
    .join("\n");

  const snippets = ctx.snippets
    .map(
      (s, i) =>
        `• ${s.title ?? "Snippet " + (i + 1)}: ${s.content.slice(0, 400)}`,
    )
    .join("\n");

  const system = `You are a nonprofit fundraising campaign architect. Match the brand's tone and language. Use donor-respectful, evidence-based, clear writing. Use placeholders like {{FirstName}} and {{ReplyByDate}} instead of PII.`;

  const common = `${ctxText}\n\nEXEMPLARS:\n${snippets}`;

  const blueprint = {
    role: "user" as const,
    content: `Create a CAMPAIGN BLUEPRINT for ${ctx.profile.name}.\nParameters:\n- Type: ${params.type}\n- Season: ${params.season}\n- Audience: ${params.audience}\n- Goal: ${params.goal}\n- Tone: ${params.tone}\n- Channels: ${
      Object.entries(params.channels)
        .filter(([, v]) => v)
        .map(([k]) => k)
        .join(", ") || "none"
    }\n- Duration (weeks): ${params.durationWeeks}\n\nReturn JSON THEN a 150–250 word narrative. JSON shape:\n{ "theme": string, "taglines": string[], "audienceFocus": string, "narrativeArc": string[], "keyProofPoints": string[], "channels": string[], "schedule": [{"week":number,"actions":string[]}] }\n\n${common}`,
  };

  const directMail = params.channels.direct_mail
    ? {
        role: "user" as const,
        content: `Using the approved CAMPAIGN BLUEPRINT, write:\n1) A donor letter (450–600 words) with {{FirstName}}, {{GiftImpact}}, {{ReplyByDate}}. Include a PS and a short reply device copy.\n2) A postcard front/back: headline + 40–70 words + single CTA.\nReturn Markdown with clear headings.\n\n${common}`,
      }
    : null;

  const digital =
    params.channels.email || params.channels.social
      ? {
          role: "user" as const,
          content: `Using the CAMPAIGN BLUEPRINT, produce:\nA) ${Math.max(10, Math.min(12, params.durationWeeks))} EMAILS: subject, preheader, 120–220w body, CTA.\nB) ${Math.max(10, Math.min(12, params.durationWeeks))} SOCIAL POSTS: 80–140 char short, 220–280 char long, optional image prompt.\nReturn JSON THEN readable text. JSON shape:\n{ "emails": [{"id":1,"subject":string,"preheader":string,"body":string,"cta":string}], "social": [{"id":1,"short":string,"long":string,"imagePrompt":string}]}\n\n${common}`,
        }
      : null;

  return { system, turns: [blueprint, directMail, digital].filter(Boolean) };
}

// ============================================================================
// CAMPAIGN GENERATION
// ============================================================================

/**
 * Generate complete campaign via AI Edge Function
 */
export async function generateCampaign(
  params: CampaignParams,
): Promise<CampaignGenerationResult> {
  const ctx = await loadBrandContext(params.client_id, params.brand_id);
  const prompts = buildPrompts(ctx, params);

  // Postage estimate (optional but useful in result sidebar)
  const postage =
    params.channels.direct_mail && params.mail
      ? estimatePostage({
          mailClass: params.mail.mailClass,
          format: params.mail.format,
          quantity: params.mail.quantity,
        })
      : null;

  // Call AI Privacy Gateway (CRITICAL: All AI requests must go through privacy gateway)
  const { data, error } = await supabase.functions.invoke<{
    ok: boolean;
    data?: {
      content: Array<{ text: string }>;
    };
    error?: string;
    blocked_reason?: string;
  }>("ai-privacy-gateway", {
    body: {
      category: "campaign" as const,
      payload: {
        system: prompts.system,
        turns: prompts.turns,
        profile: ctx.profile,
        snippets: ctx.snippets,
        params,
        postage,
      },
    },
  });

  if (error) {
    console.error("Campaign generation error:", error);
    throw new Error(error.message || "AI generation failed");
  }

  if (!data || !data.ok) {
    const reason = data?.blocked_reason || data?.error || "Unknown error";
    throw new Error(`Privacy gateway blocked request: ${reason}`);
  }

  if (!data.data) {
    throw new Error("No response from AI service");
  }

  // Parse AI response (Claude returns content array)
  const aiText = data.data.content?.[0]?.text || "";

  // Extract structured outputs from AI response
  // Note: The actual campaign-designer function would parse this differently
  // For now, return raw text as placeholder
  const outputs = {
    blueprint_json: undefined,
    blueprint_prose: aiText,
    direct_mail_md: undefined,
    digital_json: undefined,
    digital_md: undefined,
  };

  return { ctx, params, postage, outputs };
}

// ============================================================================
// EXPORT UTILITIES
// ============================================================================

/**
 * Convert generation result to Markdown bundle
 */
export function toMarkdownBundle(result: CampaignGenerationResult): string {
  const { ctx, params, outputs, postage } = result;
  const lines: string[] = [];

  lines.push(`# ${params.name} — ${ctx.profile.name}`);
  lines.push("");
  lines.push(
    `**Type:** ${params.type} • **Season:** ${params.season} • **Tone:** ${params.tone}`,
  );
  lines.push(`**Audience:** ${params.audience}`);

  if (postage) {
    lines.push(
      `**Postage:** ${postage.quantity} × $${postage.unit.toFixed(3)} = **$${postage.total.toFixed(2)}** (${postage.mailClass})`,
    );
    if (postage.savings) {
      lines.push(`**Savings:** $${postage.savings.toFixed(2)} vs first-class`);
    }
  }

  lines.push("");

  if (outputs?.blueprint_json) {
    lines.push("## Campaign Blueprint (JSON)");
    lines.push("```json");
    lines.push(JSON.stringify(outputs.blueprint_json, null, 2));
    lines.push("```");
    lines.push("");
  }

  if (outputs?.blueprint_prose) {
    lines.push("## Campaign Blueprint (Summary)");
    lines.push(outputs.blueprint_prose);
    lines.push("");
  }

  if (outputs?.direct_mail_md) {
    lines.push("## Direct Mail");
    lines.push(outputs.direct_mail_md);
    lines.push("");
  }

  if (outputs?.digital_json) {
    lines.push("## Digital (JSON)");
    lines.push("```json");
    lines.push(JSON.stringify(outputs.digital_json, null, 2));
    lines.push("```");
    lines.push("");
  }

  if (outputs?.digital_md) {
    lines.push("## Digital (Readable)");
    lines.push(outputs.digital_md);
    lines.push("");
  }

  return lines.join("\n");
}

/**
 * Download text content as file
 */
export function downloadText(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 500);
}
