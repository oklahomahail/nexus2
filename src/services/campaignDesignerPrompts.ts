/**
 * Campaign Designer Prompt Templates
 *
 * AI prompts for generating comprehensive fundraising campaigns
 * Integrates brand context for consistent, on-brand content
 */

import type { BrandProfile } from "./brandService";

// ============================================================================
// SYSTEM PROMPTS
// ============================================================================

export const CAMPAIGN_DESIGNER_SYSTEM_PROMPT = `You are a nonprofit fundraising campaign architect with deep expertise in direct mail, digital fundraising, and multi-channel campaigns.

PRIMARY GOALS:
- Brand coherence and consistency
- Donor respect and dignity
- Clarity and accessibility (plain language, active voice)
- Compliance-safe language (nonprofit regulations, IRS guidelines)
- Evidence-based impact framing

CORE PRINCIPLES:
1. Match the organization's tone of voice, personality, and style keywords exactly
2. Use donor-centric framing: focus on impact, not organizational needs
3. Avoid jargon, guilt-based appeals, or overpromising
4. Provide specific, evidence-based impact statements
5. Never include real PII - use merge field placeholders like {{FirstName}}, {{GiftImpact}}
6. Structure content for scanning (headlines, bullets, short paragraphs)

OUTPUT REQUIREMENTS:
- When requested, provide structured JSON first, then human-readable content
- Use Track15 style: warm but professional, evidence-based, donor-respectful
- All monetary amounts should use merge fields: {{GiftAmount}}, {{AverageGift}}
- Keep sentences under 25 words; paragraphs under 5 sentences
- Use active voice and present tense where possible`;

// ============================================================================
// BRAND CONTEXT TEMPLATE
// ============================================================================

/**
 * Build brand context string for injection into prompts
 */
export function buildBrandContextPrompt(
  profile: BrandProfile,
  corpusSnippets: Array<{ source: string; snippet: string }>,
): string {
  return `
BRAND CONTEXT:
Organization: ${profile.name}
Mission: ${profile.mission_statement || "Not provided"}

TONE & VOICE:
- Tone: ${profile.tone_of_voice || "warm, professional, donor-respectful"}
- Personality: ${profile.brand_personality || "impact-focused, evidence-based"}
- Style Keywords: ${profile.style_keywords?.join(", ") || "impact, community, transparency"}

VISUAL IDENTITY:
- Primary Colors: ${profile.primary_colors?.join(", ") || "Not specified"}
- Typography: ${profile.typography ? `Headings: ${(profile.typography as any).headings || "Sans-serif"}, Body: ${(profile.typography as any).body || "Serif"}` : "Not specified"}

BRAND VOICE EXAMPLES:
${corpusSnippets.map((s, i) => `${i + 1}. [${s.source}]\n${s.snippet}\n`).join("\n")}

COMPLIANCE CONSTRAINTS:
- Use nonprofit-safe language (avoid promises, guarantees, or claims of specific outcomes)
- Never invent donor names or specific stories - use placeholders only
- Respect donor privacy in all examples and templates
`.trim();
}

// ============================================================================
// CREATIVE BRIEF PROMPT (Track15 Methodology)
// ============================================================================

export interface CreativeBriefInput {
  campaignType: "appeal" | "event" | "program_launch" | "capital" | "endowment";
  season?: "spring" | "summer" | "fall" | "winter" | "ntxgd" | "eoy" | "custom";
  targetAudience: string;
  goal: string;
  goalAmount?: number;
  tone:
    | "urgent"
    | "inspiring"
    | "reflective"
    | "celebratory"
    | "grateful"
    | "empowering";
  channels: Array<
    "direct_mail" | "email" | "social" | "phone" | "personal_outreach"
  >;
  duration?: number; // campaign duration in weeks
}

/**
 * Generate a comprehensive creative brief following Track15 methodology
 * This should be the FIRST step in campaign generation
 */
export function buildCreativeBriefPrompt(
  brandContext: string,
  input: CreativeBriefInput,
): string {
  return `${brandContext}

CAMPAIGN PARAMETERS:
- Type: ${input.campaignType}
- Season: ${input.season || "Not specified"}
- Target Audience: ${input.targetAudience}
- Goal: ${input.goal}
${input.goalAmount ? `- Goal Amount: $${input.goalAmount.toLocaleString()}` : ""}
- Primary Tone: ${input.tone}
- Channels: ${input.channels.join(", ")}
${input.duration ? `- Duration: ${input.duration} weeks` : ""}

TASK:
Create a comprehensive CREATIVE BRIEF aligned to the BRAND CONTEXT above. This brief will guide all campaign asset development (direct mail, email, social media).

OUTPUT FORMAT (JSON):
\`\`\`json
{
  "theme": "2-5 word overarching campaign theme (e.g., 'Hope Through Action', 'Together We Rise')",
  "centralNarrative": {
    "headline": "Compelling headline that captures the narrative (10-15 words)",
    "summary": "2-3 sentence narrative summary that tells the core story",
    "donorRole": "How the donor fits into the story (e.g., 'hero', 'partner', 'catalyst') with 1-2 sentence explanation"
  },
  "brandVoiceProfile": {
    "tone": "${input.tone}",
    "voiceTraits": ["trait1", "trait2", "trait3", "trait4", "trait5"],
    "styleGuidelines": [
      "No em dashes (use en dashes for ranges only)",
      "Short paragraphs (2-3 sentences)",
      "Active voice preferred",
      "Other specific style rules from brand context"
    ],
    "bannedPhrases": ["Any phrases to avoid based on brand context"]
  },
  "audienceSegments": {
    "primary": [
      {
        "segment": "current_donors|lapsed_donors|high_value|prospects|monthly_supporters|major_gift|planned_giving",
        "size": "Estimated size or percentage",
        "priority": "high",
        "characteristics": "Key characteristics of this segment"
      }
    ],
    "secondary": [
      {
        "segment": "segment_type",
        "priority": "medium|low"
      }
    ]
  },
  "expectedOutcomes": {
    "goalAmount": ${input.goalAmount || 0},
    "estimatedROI": "Expected return (e.g., '3:1', '400%')",
    "segmentUplift": {
      "primary_segment": "Expected lift (e.g., '+15% vs last campaign')",
      "secondary_segment": "Expected lift"
    },
    "conversionTargets": {
      "directMail": "Response rate target (e.g., '1.5%')",
      "email": "Conversion rate target (e.g., '0.5%')",
      "social": "Engagement target (e.g., '3% CTR')"
    }
  },
  "messagingPillars": [
    {
      "pillar": "Impact",
      "description": "What this pillar communicates (1-2 sentences)",
      "supportingPoints": [
        "Specific proof point or statistic",
        "Story or testimonial example",
        "Evidence-based impact statement"
      ]
    },
    {
      "pillar": "Urgency",
      "description": "Why donors should give now",
      "supportingPoints": ["Time-sensitive reason", "Deadline or matching gift", "Capacity constraint"]
    },
    {
      "pillar": "Community",
      "description": "How donors are part of something bigger",
      "supportingPoints": ["Collective impact", "Donor stories", "Movement building"]
    }
  ],
  "emotionalTriggers": [
    {
      "trigger": "hope|urgency|gratitude|belonging|empowerment|compassion|justice|celebration|legacy|impact",
      "application": "How this emotional trigger is applied in messaging (2-3 sentences)",
      "channels": ["direct_mail", "email", "social", "all"]
    },
    {
      "trigger": "second_primary_trigger",
      "application": "Application description",
      "channels": ["channels_where_emphasized"]
    }
  ],
  "metadata": {
    "campaignId": "",
    "clientId": "",
    "season": "${input.season || "custom"}",
    "createdAt": "${new Date().toISOString()}"
  }
}
\`\`\`

REQUIREMENTS:
1. Theme must be memorable, concise, and emotionally resonant
2. Central narrative should follow classic storytelling: problem → solution → donor's role
3. Include 3-5 messaging pillars with concrete supporting points
4. Include 2-4 emotional triggers from Track15 methodology
5. Voice traits should reflect brand personality from BRAND CONTEXT
6. Expected outcomes should be realistic based on campaign type and audience
7. Segment targeting should prioritize based on recency, engagement, and giving capacity

Then provide a 200-300 word prose summary of the creative brief that could be shared with stakeholders, summarizing:
- Campaign vision and theme
- Target audience approach
- Key messages and emotional drivers
- Expected impact and outcomes

IMPORTANT TRACK15 STYLE GUIDELINES:
- No em dashes (—) - use en dashes (–) for ranges only
- Warm but professional tone
- Evidence-based impact framing
- Donor-respectful language (avoid guilt, pressure, or manipulation)
- Clear, accessible writing (8th-10th grade reading level)
- Use merge fields for personalization: {{FirstName}}, {{GiftImpact}}, {{ReplyByDate}}`;
}

// ============================================================================
// CAMPAIGN BLUEPRINT PROMPT
// ============================================================================

export interface CampaignBlueprintInput {
  campaignType: "appeal" | "event" | "program_launch" | "capital" | "endowment";
  season?: "spring" | "summer" | "fall" | "year_end";
  targetAudience: string; // e.g., "lapsed donors 6-12 months", "major gift prospects"
  goal: string; // e.g., "$50,000 to fund summer meals program"
  tone: "urgent" | "inspiring" | "reflective" | "celebratory";
  channels: Array<"direct_mail" | "email" | "social">;
}

export function buildCampaignBlueprintPrompt(
  brandContext: string,
  input: CampaignBlueprintInput,
): string {
  return `${brandContext}

CAMPAIGN PARAMETERS:
- Type: ${input.campaignType}
- Season: ${input.season || "Not specified"}
- Target Audience: ${input.targetAudience}
- Goal: ${input.goal}
- Tone: ${input.tone}
- Channels: ${input.channels.join(", ")}

TASK:
Create a comprehensive campaign blueprint aligned to the BRAND CONTEXT above.

OUTPUT FORMAT (JSON):
\`\`\`json
{
  "theme": "2-4 word campaign theme",
  "taglines": ["Option 1", "Option 2", "Option 3"],
  "audienceFocus": "Brief description of audience targeting strategy",
  "narrativeArc": {
    "setup": "Opening hook that connects donor to mission",
    "tension": "The problem or need we're addressing",
    "resolution": "How donor's gift creates impact"
  },
  "keyProofPoints": [
    "Specific, evidence-based impact stat or story",
    "Second proof point",
    "Third proof point"
  ],
  "channels": ["direct_mail", "email", "social"],
  "schedule": [
    {"week": 1, "actions": ["DM print drop", "Email #1", "Social #1-2"]},
    {"week": 2, "actions": ["Email #2-3", "Social #3-4"]},
    {"week": 3, "actions": ["Email #4-5", "Social #5-6"]},
    {"week": 4, "actions": ["Email #6", "Social #7-8", "Thank you calls"]}
  ],
  "callToAction": "Primary CTA (e.g., 'Give Today', 'Join the Circle')",
  "replyMechanism": "Reply device description (envelope, online link, QR code)"
}
\`\`\`

Then provide a prose overview (150-250 words) that summarizes the campaign strategy, narrative approach, and key tactics.`;
}

// ============================================================================
// DIRECT MAIL PROMPT
// ============================================================================

export interface DirectMailInput {
  campaignTheme: string;
  narrativeArc: { setup: string; tension: string; resolution: string };
  keyProofPoints: string[];
  targetWordCount: number; // 450-600 for letter, 40-70 for postcard
}

export function buildDirectMailPrompt(
  brandContext: string,
  blueprint: DirectMailInput,
  format: "letter" | "postcard",
): string {
  const wordCount = format === "letter" ? "450-600 words" : "40-70 words";
  const additionalGuidance =
    format === "letter"
      ? `
LETTER STRUCTURE:
1. Salutation: Dear {{FirstName}},
2. Opening (2-3 sentences): Hook that connects donor emotionally
3. Problem (1-2 paragraphs): The need, with specific evidence
4. Solution (1-2 paragraphs): How gifts create impact, with proof points
5. Ask (1 paragraph): Clear, specific ask with suggested gift levels
6. Close (1-2 sentences): Thank you and urgency
7. Signature: [Signed by]
8. P.S.: Reinforce key benefit or urgency

ADDITIONAL ELEMENTS:
- Reply Device Copy (50-70 words): Brief summary for reply card
- Suggested Gift Array: Three levels (e.g., $50, $100, $250) with impact statements
`
      : `
POSTCARD STRUCTURE:
1. Headline (5-7 words): Urgent, benefit-driven
2. Body (30-50 words): One clear problem → solution → ask
3. CTA (3-5 words): Direct action (e.g., "Give Today")
4. Reply mechanism: QR code or short URL

Keep punchy and visual. Every word must earn its place.
`;

  return `${brandContext}

CAMPAIGN BLUEPRINT:
- Theme: ${blueprint.campaignTheme}
- Narrative Arc: ${JSON.stringify(blueprint.narrativeArc, null, 2)}
- Key Proof Points: ${blueprint.keyProofPoints.join("; ")}

TASK:
Create a ${format} (${wordCount}) aligned to BRAND CONTEXT and CAMPAIGN BLUEPRINT.

${additionalGuidance}

MERGE FIELDS TO USE:
- {{FirstName}}, {{LastName}}
- {{GiftAmount}}, {{LastGiftAmount}}, {{AverageGift}}
- {{GiftImpact}} (description of what their gift achieves)
- {{ReplyByDate}}, {{CampaignDeadline}}

OUTPUT:
Provide the complete ${format} content in Markdown with clear section headings.`;
}

// ============================================================================
// DIGITAL SEQUENCE PROMPT
// ============================================================================

export interface DigitalSequenceInput {
  campaignTheme: string;
  narrativeArc: { setup: string; tension: string; resolution: string };
  keyProofPoints: string[];
  emailCount: number; // 10-12
  socialCount: number; // 10-12
  duration: number; // weeks
}

export function buildDigitalSequencePrompt(
  brandContext: string,
  blueprint: DigitalSequenceInput,
): string {
  return `${brandContext}

CAMPAIGN BLUEPRINT:
- Theme: ${blueprint.campaignTheme}
- Narrative Arc: ${JSON.stringify(blueprint.narrativeArc, null, 2)}
- Key Proof Points: ${blueprint.keyProofPoints.join("; ")}
- Duration: ${blueprint.duration} weeks

TASK:
Create a complete digital campaign sequence with:
A) ${blueprint.emailCount} emails (progressive narrative, varied approaches)
B) ${blueprint.socialCount} social posts (platform-agnostic, visual-friendly)

EMAIL SEQUENCE STRUCTURE:
- Week 1: Campaign launch, problem intro
- Week 2-3: Deepen engagement, proof points, urgency building
- Week 4: Final push, deadline urgency, gratitude preview

SOCIAL POST STRUCTURE:
- Mix of formats: stats, stories, calls-to-action, gratitude, urgency
- Platform-agnostic (works for Twitter, Facebook, LinkedIn, Instagram)
- Include image/video prompts

OUTPUT FORMAT (JSON):
\`\`\`json
{
  "emails": [
    {
      "id": 1,
      "subject": "Subject line (40-60 chars)",
      "preheader": "Preview text (60-90 chars)",
      "outline": ["Bullet 1: Opening", "Bullet 2: Body", "Bullet 3: CTA"],
      "body": "Email body (120-220 words)",
      "cta": "Primary CTA button text"
    }
  ],
  "social": [
    {
      "id": 1,
      "platform": "cross-platform",
      "short": "Tweet-length (80-140 chars)",
      "long": "Facebook/LinkedIn-length (220-280 chars)",
      "imagePrompt": "Description for image/graphic",
      "hashtags": ["#impact", "#community"]
    }
  ]
}
\`\`\`

Then include clean human-readable versions for immediate copy/paste.`;
}

// ============================================================================
// COST SUMMARY PROMPT
// ============================================================================

export interface CostSummaryInput {
  mailFormat: "postcard" | "letter" | "flat_6x11";
  mailClass: "nonprofit" | "first_class";
  quantity: number;
  unitPostage: number;
  totalPostage: number;
  estimatedPrinting?: number;
  estimatedProduction?: number;
}

export function buildCostSummaryPrompt(costs: CostSummaryInput): string {
  const total =
    costs.totalPostage +
    (costs.estimatedPrinting || 0) +
    (costs.estimatedProduction || 0);
  const costPerPiece = Math.round((total / costs.quantity) * 100) / 100;

  return `
DIRECT MAIL COST ESTIMATE:

Format: ${costs.mailFormat}
Mail Class: ${costs.mailClass}
Quantity: ${costs.quantity.toLocaleString()}

COST BREAKDOWN:
- Postage (@ $${costs.unitPostage.toFixed(3)}/piece): $${costs.totalPostage.toFixed(2)}
${costs.estimatedPrinting ? `- Printing: $${costs.estimatedPrinting.toFixed(2)}` : ""}
${costs.estimatedProduction ? `- Production (folding/inserting): $${costs.estimatedProduction.toFixed(2)}` : ""}

TOTAL COST: $${total.toFixed(2)}
Cost per Piece: $${costPerPiece.toFixed(2)}

${costs.mailClass === "nonprofit" ? `\nNOTE: Using nonprofit presort rates. Requires valid nonprofit mail permit and minimum quantity (usually 200-500 pieces).` : ""}

ASSUMPTIONS:
- Costs are estimates and may vary by vendor, volume, and specifications
- Postage rates current as of 2024; verify with USPS for latest rates
- Printing costs assume standard paper stock and 4-color process
- Production costs assume automated inserting; hand assembly will increase costs
`.trim();
}

// ============================================================================
// HELPER: Combine all prompts for full campaign generation
// ============================================================================

export interface FullCampaignGenerationInput {
  brandContext: string;
  blueprintInput: CampaignBlueprintInput;
  mailFormat: "letter" | "postcard";
  emailCount?: number;
  socialCount?: number;
  duration?: number;
}

/**
 * Generate a complete multi-prompt campaign generation plan
 * Returns array of prompts to send sequentially to Claude
 */
export function buildFullCampaignPrompts(
  input: FullCampaignGenerationInput,
): Array<{
  step: string;
  prompt: string;
  expectedOutput: string;
}> {
  return [
    {
      step: "1_blueprint",
      prompt: buildCampaignBlueprintPrompt(
        input.brandContext,
        input.blueprintInput,
      ),
      expectedOutput: "JSON blueprint + prose overview",
    },
    {
      step: "2_direct_mail",
      prompt: `Using the campaign blueprint from Step 1, ${buildDirectMailPrompt(
        input.brandContext,
        {
          campaignTheme: "{{THEME_FROM_STEP_1}}",
          narrativeArc: {
            setup: "{{SETUP_FROM_STEP_1}}",
            tension: "{{TENSION_FROM_STEP_1}}",
            resolution: "{{RESOLUTION_FROM_STEP_1}}",
          },
          keyProofPoints: [],
          targetWordCount: input.mailFormat === "letter" ? 500 : 60,
        },
        input.mailFormat,
      )}`,
      expectedOutput: `${input.mailFormat} content (letter or postcard)`,
    },
    {
      step: "3_digital_sequence",
      prompt: `Using the campaign blueprint from Step 1, ${buildDigitalSequencePrompt(
        input.brandContext,
        {
          campaignTheme: "{{THEME_FROM_STEP_1}}",
          narrativeArc: {
            setup: "{{SETUP_FROM_STEP_1}}",
            tension: "{{TENSION_FROM_STEP_1}}",
            resolution: "{{RESOLUTION_FROM_STEP_1}}",
          },
          keyProofPoints: [],
          emailCount: input.emailCount || 10,
          socialCount: input.socialCount || 10,
          duration: input.duration || 4,
        },
      )}`,
      expectedOutput: "JSON with emails + social posts",
    },
  ];
}
