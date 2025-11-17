/**
 * Journey AI Coach Service
 *
 * Auto-drafts fundraising content for multi-touch journeys (upgrade, monthly, reactivation)
 * using Data Lab insights and behavioral segment targeting.
 */

import type {
  JourneyTouchTemplate,
  JourneyType,
} from "@/utils/journeyTemplates";

import { callClaudeSafely } from "./ai/privacyAwareClaudeService";
import { enrichPromptWithLabContext } from "./donorDataLabAIContext";

import type { LabRun } from "./donorDataLabPersistence";

// Temporary mock - replace with actual segment type
interface BehavioralSegment {
  segmentId: string;
  name: string;
  description?: string;
  criteria?: Record<string, any>;
}

export interface JourneyDraftRequest {
  clientId: string;
  journeyType: JourneyType;
  touch: JourneyTouchTemplate;
  segment: BehavioralSegment;
  labRun: LabRun;
  existingSubject?: string;
  existingBody?: string;
}

export interface JourneyDraftResponse {
  subject?: string;
  body: string;
}

/**
 * Draft content for a single journey touch using AI + Data Lab context
 */
export async function draftJourneyTouchContent(
  req: JourneyDraftRequest,
): Promise<JourneyDraftResponse> {
  const {
    clientId,
    journeyType,
    touch,
    segment,
    labRun,
    existingSubject,
    existingBody,
  } = req;

  // Base prompt tailored by journey type + touch type
  const basePrompt = buildBaseJourneyPrompt({
    journeyType,
    touch,
    segment,
    labRun,
    existingSubject,
    existingBody,
  });

  // Enrich with Data Lab context
  const enrichedPrompt = enrichPromptWithLabContext(
    clientId,
    basePrompt,
    journeyType,
  );

  // DEV logging: prompt preview (truncated)
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.debug(
      "[JourneyAI] Prompt preview:",
      enrichedPrompt.slice(0, 800),
      enrichedPrompt.length > 800 ? "...[truncated]" : "",
    );
  }

  // Call Claude through privacy gateway
  const response = await callClaudeSafely({
    category: "campaign",
    system:
      "You are an expert nonprofit fundraising copywriter. Return only valid JSON.",
    prompt: `
${enrichedPrompt}

Return JSON like:
{
  "subject": string | null,
  "body": string
}
    `.trim(),
    maxTokens: 1500,
    temperature: 0.7,
  });

  if (!response.ok) {
    // eslint-disable-next-line no-console
    console.error("[JourneyAI] AI call failed:", response.error);
    throw new Error(response.error || "AI request failed");
  }

  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.debug(
      "[JourneyAI] Raw model output:",
      response.content.slice(0, 800),
      response.content.length > 800 ? "...[truncated]" : "",
    );
  }

  // Parse JSON response
  let parsed: any;
  try {
    parsed = JSON.parse(response.content);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(
      "[JourneyAI] Failed to parse JSON from model:",
      err,
      response.content,
    );
    throw new Error("Failed to parse AI response as JSON");
  }

  return {
    subject: parsed.subject ?? existingSubject,
    body: parsed.body,
  };
}

/**
 * Build base prompt for journey touch content generation
 */
function buildBaseJourneyPrompt(params: {
  journeyType: JourneyType;
  touch: JourneyTouchTemplate;
  segment: BehavioralSegment;
  labRun: LabRun;
  existingSubject?: string;
  existingBody?: string;
}): string {
  const { journeyType, touch, segment, labRun, existingSubject, existingBody } =
    params;

  const labMeta = `This analysis was run on ${labRun.analysis.donors.length} donors from file ${
    labRun.fileName ?? "unknown file"
  } on ${new Date(labRun.runDate).toLocaleDateString()}.`;

  const segmentInfo = `
Segment:
- Name: ${segment.name}
- Description: ${segment.description ?? ""}
- Criteria (behavioral): ${JSON.stringify(segment.criteria ?? {}, null, 2)}
`.trim();

  const draftSnippet =
    existingBody && existingBody.trim().length > 0
      ? `Here is an existing draft to improve (keep the core story and facts, but rewrite for this journey and segment):

---
Subject (if any): ${existingSubject ?? "(none yet)"}
Body:
${existingBody}
---`
      : "There is no draft yet. Please create a fresh draft.";

  let journeyFlavor = "";

  if (journeyType === "upgrade") {
    journeyFlavor = `
This is an UPGRADE journey. The goal is to invite recent donors to increase their giving.

Touch role: ${touch.label}
Touch description: ${touch.description}

For this touch:
- Lead with gratitude and past impact.
- Introduce the idea of increasing their gift in a natural, respectful way.
- Use an ask ladder consistent with 100% / 125% / 150% of their most recent gift.
- Keep the tone appreciative, confident, not guilt-based.
`.trim();
  } else if (journeyType === "monthly") {
    journeyFlavor = `
This is a MONTHLY journey. The goal is to convert multi-gift donors to recurring monthly givers.

Touch role: ${touch.label}
Touch description: ${touch.description}

For this touch:
- Emphasize joining a community of sustaining supporters.
- Highlight steady, predictable impact (e.g., "$25/month makes X possible").
- Keep the ask simple and clear (1–3 monthly options).
- Avoid overwhelming detail; focus on the ongoing story.
`.trim();
  } else if (journeyType === "reactivation") {
    journeyFlavor = `
This is a REACTIVATION journey. The goal is to re-engage lapsed high-value donors.

Touch role: ${touch.label}
Touch description: ${touch.description}

For this touch:
- Acknowledge the time since their last gift in a warm, honest way.
- Lead with sincere gratitude and update them on what's changed.
- Use a softer ask ladder (75–100% of their last gift).
- Tone should be warm, respectful, and non-pressuring.
`.trim();
  }

  return `
You are drafting content for a multi-touch fundraising journey.

${labMeta}

${segmentInfo}

${journeyFlavor}

Channel: ${touch.channel.toUpperCase()} (this will likely be sent as an email).

${draftSnippet}

Write:
- A clear, compelling subject line (if appropriate for this touch).
- A body that is 200–400 words, skimmable, and emotionally resonant.
- Use plain language, short paragraphs, and clear call-to-action.

Do not mention "Data Lab" or internal systems. Write as if you are a human fundraiser speaking to a real donor.
`.trim();
}
