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

  // TODO: Enrich with Data Lab context and call Claude API
  // const enrichedPrompt = enrichPromptWithLabContext(clientId, basePrompt, journeyType);
  // const apiResponse = await callClaudeApi(enrichedPrompt);
  // return parseClaudeResponse(apiResponse);

  // For now, return mock structured response
  // When implementing, use enrichedPrompt as the AI prompt
  const mockResponse = generateMockJourneyContent(journeyType, touch, segment);

  return mockResponse;
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

/**
 * Mock content generator (replace with actual Claude API call)
 */
function generateMockJourneyContent(
  journeyType: JourneyType,
  touch: JourneyTouchTemplate,
  segment: BehavioralSegment,
): JourneyDraftResponse {
  // Generate realistic mock content based on journey type and touch
  const touchIndex = parseInt(touch.id.split("_").pop() || "1");

  if (journeyType === "upgrade") {
    const subjects = [
      "You've already made a difference — here's what's next",
      "Here's the project your increased support could fuel",
      "Last chance to help us expand before the deadline",
    ];
    const bodies = [
      `Hi [Name],

I've been looking over the impact that supporters like you made this year, and I wanted to pause and say thank you. Your generosity has already helped expand access to programs that families in our community rely on every single day.

Your support comes at a moment when demand for our services is growing. This spring, we are preparing to open additional program slots so more people can get the help they need — but doing that well requires committed partners stepping forward.

Would you consider increasing your support this season? Even a modest step up can create an outsized impact right now.

Supporters who recently gave $100 are choosing to renew generously at levels like:
• $100 to keep essential services steady
• $125 to help open new program slots
• $150 to accelerate expansion where it's needed most

Whatever you choose, please know that your continued commitment truly matters.

Thank you again for everything you make possible.

Warmly,
[Organization]`,
      `Hi [Name],

I wanted to follow up because something meaningful is happening, and I immediately thought of you. We're finalizing plans to expand our programs to serve at least 30 more families this quarter.

To move forward, we need to close a small funding gap — and increased support from our most committed partners will make the difference.

Many supporters who recently gave $100 are stretching to:
• $100 to sustain ongoing services
• $125 to open new program spots
• $150 to accelerate program expansion

Your renewed and increased gift would directly fuel this growth at a moment when the opportunity is real and urgent.

Would you consider stepping up today?

Gratefully,
[Organization]`,
      `Hi [Name],

A quick reminder: our expansion deadline is just a few days away. We're close — very close — to opening additional program slots, and we're trying to secure the last commitments needed to move forward.

You've been one of our most steady partners, and I wanted to make sure you didn't miss the chance to help us cross the finish line.

If you're able, would you consider renewing with a little extra this time?

Every single step up counts right now.

Thank you for standing with us.

Warm gratitude,
[Organization]`,
    ];

    return {
      subject: subjects[touchIndex - 1] || subjects[0],
      body: bodies[touchIndex - 1] || bodies[0],
    };
  }

  // Add monthly and reactivation mock content similarly
  return {
    subject: `${touch.label} - ${segment.name}`,
    body: `[AI-generated content for ${journeyType} journey, ${touch.label}]\n\nTargeting: ${segment.name}\n\nThis is a placeholder. Replace with actual Claude API integration.`,
  };
}
