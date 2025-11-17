// src/services/campaignAiService.ts
// Central AI integration for Campaign Engine
// Routes all Claude calls through privacy gateway for PII protection

import { generateCampaignContent } from "@/services/ai/privacyAwareClaudeService";
import { CampaignDraft } from "@/features/campaign-editor/campaignEditor.types";

/**
 * Track15 Campaign AI Service
 *
 * This service provides a clean abstraction layer for AI-powered campaign content generation.
 * All requests are routed through the privacy gateway to ensure PII protection.
 *
 * Key features:
 * - Campaign narrative generation
 * - Email series creation (drafts 1-12)
 * - Social media posts (Facebook, Instagram, LinkedIn)
 * - Direct mail copy
 * - Subject lines and CTAs
 * - Creative briefs and summaries
 *
 * Track15 Brand Voice:
 * - Lead with emotion and human-centered storytelling
 * - Name the problem clearly
 * - Position the donor as a compassionate problem-solver (never a hero)
 * - Avoid organizational jargon or savior language
 * - Use clear, warm, relational writing
 */

// -------- Types

export interface EmailDraft {
  subject: string;
  preheader: string;
  body: string;
}

export interface SocialPost {
  platform: "facebook" | "instagram" | "linkedin";
  body: string;
  cta?: string;
}

export interface EmailSeriesResponse {
  emails?: EmailDraft[];
  error?: string;
}

export interface SocialPostsResponse {
  posts?: SocialPost[];
  error?: string;
}

export interface DirectMailResponse {
  copy?: string;
  error?: string;
}

// -------- Service Class

class CampaignAiService {
  /**
   * Generate a donor-centered campaign narrative
   *
   * Creates a 3-4 paragraph narrative that follows Track15 messaging rules:
   * - Emotion-led storytelling
   * - Clear problem framing
   * - Donor as compassionate problem-solver
   * - No hero language or jargon
   */
  async generateNarrative(campaign: CampaignDraft): Promise<string> {
    const prompt = this.buildNarrativePrompt(campaign);

    const response = await generateCampaignContent(
      this.getTrack15SystemPrompt(),
      [{ role: "user", content: prompt }],
    );

    if (!response.ok) {
      throw new Error(response.error || "Failed to generate narrative");
    }

    return response.content;
  }

  /**
   * Generate a series of fundraising emails
   *
   * Each email includes:
   * - Human-centered opening story
   * - Clear problem framing
   * - Donor as compassionate problem solver
   * - Tangible outcome per gift
   * - One specific ask
   */
  async generateEmailSeries(
    campaign: CampaignDraft,
    count: number = 10,
  ): Promise<EmailSeriesResponse> {
    const prompt = this.buildEmailSeriesPrompt(campaign, count);

    const response = await generateCampaignContent(
      this.getTrack15SystemPrompt(),
      [{ role: "user", content: prompt }],
    );

    if (!response.ok) {
      return { error: response.error || "Failed to generate email series" };
    }

    try {
      const parsed = JSON.parse(response.content);
      return { emails: parsed.emails || [] };
    } catch {
      return { error: "AI returned invalid JSON format" };
    }
  }

  /**
   * Generate social media posts for multiple platforms
   *
   * Each post includes:
   * - Strong emotional hook
   * - Donor-outcome connection
   * - Simple CTA
   * - Platform-aware tone
   */
  async generateSocialPosts(
    campaign: CampaignDraft,
    count: number = 10,
  ): Promise<SocialPostsResponse> {
    const prompt = this.buildSocialPrompt(campaign, count);

    const response = await generateCampaignContent(
      this.getTrack15SystemPrompt(),
      [{ role: "user", content: prompt }],
    );

    if (!response.ok) {
      return { error: response.error || "Failed to generate social posts" };
    }

    try {
      const parsed = JSON.parse(response.content);
      return { posts: parsed.posts || [] };
    } catch {
      return { error: "AI returned invalid JSON format" };
    }
  }

  /**
   * Generate direct mail copy
   *
   * Creates compelling direct mail content following Track15 principles
   */
  async generateDirectMail(
    campaign: CampaignDraft,
  ): Promise<DirectMailResponse> {
    const prompt = this.buildDirectMailPrompt(campaign);

    const response = await generateCampaignContent(
      this.getTrack15SystemPrompt(),
      [{ role: "user", content: prompt }],
    );

    if (!response.ok) {
      return { error: response.error || "Failed to generate direct mail copy" };
    }

    return { copy: response.content };
  }

  /**
   * Generate a creative brief summary
   *
   * Useful for internal team alignment and creative handoffs
   */
  async generateCreativeBrief(campaign: CampaignDraft): Promise<string> {
    const prompt = this.buildCreativeBriefPrompt(campaign);

    const response = await generateCampaignContent(
      this.getTrack15SystemPrompt(),
      [{ role: "user", content: prompt }],
    );

    if (!response.ok) {
      throw new Error(response.error || "Failed to generate creative brief");
    }

    return response.content;
  }

  // ===== PROMPT BUILDERS =====

  private getTrack15SystemPrompt(): string {
    return `You are Track15's senior campaign strategist and copywriter.

Track15 Messaging Principles:
1. Lead with emotion and human-centered storytelling
2. Name the problem clearly and specifically
3. Position the donor as a compassionate problem-solver (NEVER as a hero or savior)
4. Avoid organizational jargon, insider language, and savior narratives
5. Use clear, warm, relational writing that feels conversational
6. Keep copy concise and concrete with tangible outcomes
7. Use en dashes (–) not em dashes (—)
8. Focus on dignity, agency, and mutual respect

Voice & Tone:
- Warm but not overly emotional
- Professional but not corporate
- Urgent but not desperate
- Hopeful but not naive
- Specific but not overwhelming

Always prioritize the human story and the donor's role in creating positive change.`;
  }

  private buildNarrativePrompt(campaign: CampaignDraft): string {
    return `Generate a donor-centered campaign narrative in 3-4 paragraphs.

Campaign Overview:
Title: ${campaign.overview?.title || "Untitled Campaign"}
Season: ${campaign.overview?.season || "Not specified"}
Summary: ${campaign.overview?.summary || "No summary provided"}

Theme:
Central Idea: ${campaign.theme?.centralIdea || "Not specified"}
Tone: ${campaign.theme?.tone || "Not specified"}
Visual Notes: ${campaign.theme?.visualNotes || "None"}

Audience:
Segments: ${campaign.audience?.segments?.join(", ") || "General donors"}
Notes: ${campaign.audience?.notes || "None"}

Requirements:
- Open with a specific, emotionally resonant human story
- Clearly name the problem this campaign addresses
- Show how donor support creates tangible outcomes
- Position donors as compassionate problem-solvers
- End with a clear vision of impact

Return plain text only (no markdown formatting).`;
  }

  private buildEmailSeriesPrompt(
    campaign: CampaignDraft,
    count: number,
  ): string {
    return `Generate ${count} fundraising emails for this campaign.

Campaign Overview:
Title: ${campaign.overview?.title || "Untitled Campaign"}
Season: ${campaign.overview?.season || "Not specified"}
Summary: ${campaign.overview?.summary || "No summary provided"}

Theme:
Central Idea: ${campaign.theme?.centralIdea || "Not specified"}
Tone: ${campaign.theme?.tone || "Not specified"}

Audience:
Segments: ${campaign.audience?.segments?.join(", ") || "General donors"}

Each email must include:
- Subject line (40-60 characters, compelling and clear)
- Preheader text (80-100 characters, extends the subject)
- Body copy with:
  * Human-centered opening story
  * Clear problem statement
  * Donor as compassionate problem-solver
  * Tangible outcome per gift amount
  * One specific, clear ask
  * Warm, relational closing

Return ONLY valid JSON in this exact format:
{
  "emails": [
    {
      "subject": "Subject line here",
      "preheader": "Preheader text here",
      "body": "Full email body here"
    }
  ]
}`;
  }

  private buildSocialPrompt(campaign: CampaignDraft, count: number): string {
    return `Generate ${count} social media posts distributed across Facebook, Instagram, and LinkedIn.

Campaign Overview:
Title: ${campaign.overview?.title || "Untitled Campaign"}
Season: ${campaign.overview?.season || "Not specified"}
Summary: ${campaign.overview?.summary || "No summary provided"}

Theme:
Central Idea: ${campaign.theme?.centralIdea || "Not specified"}
Tone: ${campaign.theme?.tone || "Not specified"}

Requirements per post:
- Strong emotional hook in first line
- Clear donor-outcome connection
- Platform-appropriate tone:
  * Facebook: Warm, conversational, community-focused
  * Instagram: Visual storytelling, concise, hashtag-friendly
  * LinkedIn: Professional but warm, impact-focused
- Simple, clear CTA
- No savior language

Return ONLY valid JSON in this exact format:
{
  "posts": [
    {
      "platform": "facebook",
      "body": "Post content here",
      "cta": "Optional CTA here"
    }
  ]
}`;
  }

  private buildDirectMailPrompt(campaign: CampaignDraft): string {
    return `Generate compelling direct mail copy for this campaign.

Campaign Overview:
Title: ${campaign.overview?.title || "Untitled Campaign"}
Season: ${campaign.overview?.season || "Not specified"}
Summary: ${campaign.overview?.summary || "No summary provided"}

Theme:
Central Idea: ${campaign.theme?.centralIdea || "Not specified"}
Tone: ${campaign.theme?.tone || "Not specified"}

Audience:
Segments: ${campaign.audience?.segments?.join(", ") || "General donors"}

Direct mail should include:
- Attention-grabbing opening (Johnson Box or similar)
- Personal salutation guidance
- 3-4 paragraph body with emotional storytelling
- Clear problem and solution framing
- Specific ask with tangible outcomes
- P.S. with additional emotional hook or urgency

Format for print (approximately 400-500 words).
Return plain text only.`;
  }

  private buildCreativeBriefPrompt(campaign: CampaignDraft): string {
    return `Generate a creative brief summary for this campaign.

Campaign Data:
${JSON.stringify(campaign, null, 2)}

The brief should include:
- Campaign overview and objectives
- Target audience insights
- Key messages and themes
- Deliverables overview
- Tone and voice guidelines
- Success metrics

Format as a concise, scannable document (300-400 words).
Return plain text only.`;
  }
}

// -------- Singleton Export

export const campaignAiService = new CampaignAiService();
