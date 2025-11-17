/**
 * Segment Messaging Service
 *
 * AI-powered messaging recommendations for donor segments.
 * Analyzes segment behavior and performance to suggest optimal messaging strategies.
 */

import { BehavioralSegment } from "./campaignComposer/defaultSegmentCatalog";

export interface SegmentMessagingRecommendation {
  headline: string;
  bullets: string[];
  toneGuidance: string;
  timingNotes?: string;
}

export interface SegmentProfile {
  segmentId: string;
  segmentName: string;
  description: string;
  criteria: Record<string, string>;
  estimatedSize: number;
  avgEngagementScore: number;
  lastCampaignResponseRate?: number;
  preferredChannels: string[];
}

/**
 * Get AI-powered messaging recommendations for a specific segment
 */
export async function getSegmentMessagingRecommendations(
  clientId: string,
  segment: BehavioralSegment,
  profile?: SegmentProfile,
): Promise<SegmentMessagingRecommendation> {
  // In production, this would call your Claude AI service
  // For now, we'll use intelligent defaults based on segment characteristics

  const recommendations: Record<string, SegmentMessagingRecommendation> = {
    donors_any: {
      headline: "Emphasize gratitude and continued impact",
      bullets: [
        "Thank them for past support and show specific outcomes",
        "Connect new need to their proven commitment",
        "Use 'together we...' language to reinforce partnership",
        "Include concrete examples of impact from their gifts",
        "Ask feels natural: they've said yes before",
      ],
      toneGuidance:
        "Warm and appreciative. Assume goodwill. Frame asks as opportunities to continue what they've started.",
      timingNotes:
        "Can engage year-round. Best during proven giving seasons (Nov-Dec, spring).",
    },
    never_given: {
      headline: "Lower barriers, emphasize first-time gift motivation",
      bullets: [
        "Focus on 'why now' and specific, tangible outcomes",
        "Use storytelling to create emotional connection",
        "Suggest modest first gift amounts ($25-50)",
        "Highlight easy ways to give (one-click, mobile)",
        "Social proof: 'Join 1,000+ supporters making a difference'",
      ],
      toneGuidance:
        "Invitational, not presumptuous. Educational tone. Show them they belong in your community.",
      timingNotes:
        "Best during urgent campaigns or compelling stories. Avoid ask-heavy periods.",
    },
    lybunt: {
      headline: "Reactivation: Acknowledge gap, emphasize urgency and impact",
      bullets: [
        "Start with gratitude for last year's gift",
        "Create urgency: 'We need you back this year'",
        "Show what's changed or why now matters",
        "Make it easy to give again (suggest same amount as last year)",
        "Frame as 'picking up where we left off'",
      ],
      toneGuidance:
        "Respectful, urgent without guilt. Assume they still care but got busy or forgot.",
      timingNotes:
        "Best in Q4 before year-end. Early November for year-end LYBUNT reactivation.",
    },
    sybunt: {
      headline: "Win-back strategy: Remind them why they gave, create urgency",
      bullets: [
        "Reference their past support: 'You gave in [year]'",
        "Show continuity of mission and new urgency",
        "Lower ask if needed—focus on coming back, not amount",
        "Use 'we miss you' framing carefully (test)",
        "Highlight easy re-entry: one-time gift, low amount options",
      ],
      toneGuidance:
        "Respectful and inviting. Don't guilt-trip. Show mission continuity and new reasons to care.",
      timingNotes:
        "Test in summer (less competitive) or during urgent campaign moments.",
    },
    monthly_donors: {
      headline:
        "Sustainer love: gratitude, impact reporting, upgrade opportunities",
      bullets: [
        "Thank them for ongoing commitment (use 'sustainer', 'partner' language)",
        "Show cumulative impact of their monthly gifts",
        "Frame upgrade asks as 'increasing your impact'",
        "Avoid over-asking—they're already committed",
        "Celebrate milestones (6 months, 1 year, etc.)",
      ],
      toneGuidance:
        "Deeply appreciative. Treat as insiders and partners. Frame asks as enhancements, not needs.",
      timingNotes:
        "Impact reports quarterly. Upgrade asks 2x/year max. Anniversary-triggered messages.",
    },
    annual_donors: {
      headline: "Convert to sustainers or increase gift frequency",
      bullets: [
        "Highlight ease and impact of monthly giving",
        "Use social proof: 'Join 500+ monthly sustainers'",
        "Show math: '$25/month = $300/year of impact'",
        "Offer incentives if applicable (early access, swag)",
        "Frame as 'next level of support'",
      ],
      toneGuidance:
        "Invitational and aspirational. Position monthly giving as a smart, impactful choice.",
      timingNotes:
        "Best after successful one-time gift (post-donation nurture). Avoid during year-end rush.",
    },
    major_donors_behavioral: {
      headline: "High-touch, personalized, impact-focused messaging",
      bullets: [
        "Emphasize exclusive impact and insider information",
        "Use personal stories and direct outcomes",
        "Frame asks as leadership opportunities",
        "Suggest higher gift levels or multi-year commitments",
        "Consider personal outreach over mass email",
      ],
      toneGuidance:
        "Professional, respectful, aspirational. Assume sophistication and genuine interest in outcomes.",
      timingNotes:
        "Year-round relationship building. Strategic asks during capital campaigns or major initiatives.",
    },
    high_engagement_non_donors: {
      headline: "Convert engagement into first gift with clear, compelling ask",
      bullets: [
        "Acknowledge their engagement: 'You've been following along...'",
        "Create urgency: 'Now is the time to make it real'",
        "Suggest modest first gift ($25-50)",
        "Show peer behavior: 'Supporters like you give...'",
        "Make giving feel like natural next step",
      ],
      toneGuidance:
        "Warm and invitational. Bridge their existing interest into action. Celebrate their attention.",
      timingNotes:
        "Best during compelling campaigns or urgent moments. Strike while interest is high.",
    },
    prefers_email: {
      headline: "Optimize for digital: short, clickable, mobile-friendly",
      bullets: [
        "Keep copy concise (200-300 words max)",
        "Strong subject lines (30-50 chars)",
        "Clear, prominent CTA buttons",
        "Mobile-optimized layout and images",
        "Test send times (weekday mornings, Thursday evenings)",
      ],
      toneGuidance:
        "Direct and action-oriented. Assume quick scanning. Lead with urgency or hook.",
      timingNotes:
        "Best weekday mornings (8-10am) or Thursday evenings. Avoid Monday/Friday.",
    },
    prefers_direct_mail: {
      headline: "Traditional, personal, story-driven direct mail",
      bullets: [
        "Longer copy (800-1000 words) with strong narrative",
        "Personal salutation and signature",
        "Compelling P.S. with action step",
        "Reply device with suggested gift amounts",
        "Handwritten notes or personalization if possible",
      ],
      toneGuidance:
        "Warm, personal, storytelling-focused. Assume they value thoughtful communication.",
      timingNotes:
        "Plan 6-8 weeks ahead for production. Best in fall/spring when mail less competitive.",
    },
  };

  // Return segment-specific recommendations or intelligent defaults
  const recommendation =
    recommendations[segment.segmentId] ||
    generateDefaultRecommendation(segment);

  // In production, enhance with real performance data
  if (profile) {
    recommendation.timingNotes = enhanceTimingWithProfile(
      recommendation.timingNotes,
      profile,
    );
  }

  return recommendation;
}

/**
 * Generate default recommendations for custom segments
 */
function generateDefaultRecommendation(
  segment: BehavioralSegment,
): SegmentMessagingRecommendation {
  const criteria = segment.criteria;

  let headline = "Personalized messaging for this segment";
  const bullets: string[] = [];
  let toneGuidance = "Professional and respectful";
  let timingNotes = "Test different times and channels for best results";

  // Analyze criteria to provide intelligent defaults
  if (criteria.frequency === "zero") {
    headline = "Acquisition focus: clear value proposition and low barriers";
    bullets.push(
      "Emphasize specific impact of first gift",
      "Use storytelling to create connection",
      "Suggest modest gift amounts",
    );
    toneGuidance = "Invitational and welcoming";
  } else if (
    criteria.recency?.includes("lybunt") ||
    criteria.recency?.includes("sybunt")
  ) {
    headline = "Reactivation: acknowledge past support, create urgency";
    bullets.push(
      "Thank them for past gifts",
      "Show what's changed or why now matters",
      "Make it easy to give again",
    );
    toneGuidance = "Grateful and urgent without guilt";
  } else if (criteria.giving_type === "monthly_sustainer") {
    headline = "Sustainer stewardship: gratitude and impact reporting";
    bullets.push(
      "Celebrate their ongoing commitment",
      "Show cumulative impact",
      "Avoid over-asking",
    );
    toneGuidance = "Deeply appreciative and partner-focused";
  } else {
    bullets.push(
      "Connect message to their demonstrated interests",
      "Use clear, compelling calls to action",
      "Test different approaches and measure results",
    );
  }

  if (criteria.engagement === "high") {
    bullets.push("Leverage their existing engagement into action");
    timingNotes = "Capitalize on high interest with timely, relevant asks";
  }

  if (criteria.channel_preference === "email") {
    bullets.push("Optimize for mobile and quick scanning");
    timingNotes = "Test weekday mornings for best open rates";
  } else if (criteria.channel_preference === "direct_mail") {
    bullets.push("Use storytelling and longer-form narrative");
    timingNotes = "Plan 6-8 weeks ahead for production and mailing";
  }

  return { headline, bullets, toneGuidance, timingNotes };
}

/**
 * Enhance timing recommendations with actual performance data
 */
function enhanceTimingWithProfile(
  baseNotes: string | undefined,
  profile: SegmentProfile,
): string {
  let enhanced = baseNotes || "Test different times and channels";

  if (profile.lastCampaignResponseRate) {
    if (profile.lastCampaignResponseRate > 5) {
      enhanced +=
        " This segment has shown excellent response rates—consider them for urgent campaigns.";
    } else if (profile.lastCampaignResponseRate < 2) {
      enhanced +=
        " Recent response has been lower—test different messaging or timing to re-engage.";
    }
  }

  if (profile.preferredChannels?.length > 0) {
    enhanced += ` Best channels: ${profile.preferredChannels.join(", ")}.`;
  }

  return enhanced;
}

/**
 * Get quick messaging tip for inline display
 */
export function getQuickMessagingTip(segment: BehavioralSegment): string {
  const tips: Record<string, string> = {
    donors_any: "Lead with gratitude, show impact, frame ask as continuation",
    never_given: "Lower barriers, use stories, suggest modest first gift",
    lybunt: "Acknowledge gap, create urgency, make it easy to return",
    sybunt: "Reference past support, show mission continuity, welcome back",
    monthly_donors:
      "Celebrate commitment, show cumulative impact, upgrade carefully",
    annual_donors: "Highlight monthly giving benefits, use social proof",
    major_donors_behavioral: "High-touch, exclusive impact, leadership framing",
    high_engagement_non_donors:
      "Convert interest to action, acknowledge engagement",
    prefers_email: "Short, scannable, mobile-optimized, strong subject",
    prefers_direct_mail: "Storytelling, personal, strong P.S., reply device",
  };

  return (
    tips[segment.segmentId] ||
    "Personalize message based on segment criteria and past behavior"
  );
}
