/**
 * Deliverable AI Coach Service
 *
 * AI-powered content rewriting service that optimizes deliverable content
 * for specific donor segments. Uses segment-specific messaging best practices
 * and Track15 fundraising methodology.
 *
 * Privacy: Uses behavioral segment criteria only, no PII.
 */

import {
  BehavioralSegment,
  getSegmentById,
} from "./campaignComposer/defaultSegmentCatalog";
import { getSegmentMessagingRecommendations } from "./segmentMessagingService";

export interface AiCoachingRequest {
  originalContent: string;
  segmentId: string;
  deliverableType: "direct_mail" | "email" | "sms" | "social" | "phone";
  subjectLine?: string;
  campaignGoal?: string;
}

export interface AiCoachingResult {
  rewrittenContent: string;
  suggestedSubjectLine?: string;
  explanation: string;
  appliedTechniques: string[];
}

/**
 * Rewrite content optimized for a specific segment
 *
 * In production, this would call an AI service. For now, provides
 * intelligent rewrites based on segment characteristics.
 */
export async function rewriteForSegment(
  request: AiCoachingRequest,
): Promise<AiCoachingResult> {
  const segment = getSegmentById(request.segmentId);

  if (!segment) {
    throw new Error(`Segment ${request.segmentId} not found`);
  }

  // Get segment-specific messaging recommendations
  const recommendations = await getSegmentMessagingRecommendations(
    "", // clientId not needed for defaults
    segment,
  );

  // Apply segment-specific transformations
  const result = applySegmentOptimizations(
    request.originalContent,
    segment,
    request.deliverableType,
    recommendations.toneGuidance,
    request.subjectLine,
  );

  return result;
}

/**
 * Apply segment-specific content optimizations
 */
function applySegmentOptimizations(
  content: string,
  segment: BehavioralSegment,
  deliverableType: string,
  toneGuidance: string,
  subjectLine?: string,
): AiCoachingResult {
  const techniques: string[] = [];
  let rewritten = content;
  let suggestedSubject = subjectLine;

  // Segment-specific optimizations
  switch (segment.segmentId) {
    case "donors_any":
      rewritten = emphasizeGratitudeAndImpact(content);
      techniques.push("Added gratitude language");
      techniques.push("Emphasized continued impact");
      if (deliverableType === "email" && !subjectLine) {
        suggestedSubject = "Thank you for your partnership 💙";
      }
      break;

    case "never_given":
      rewritten = lowerBarriersForFirstGift(content);
      techniques.push("Simplified ask");
      techniques.push("Added first-time donor motivation");
      techniques.push("Removed jargon");
      if (deliverableType === "email" && !subjectLine) {
        suggestedSubject = "Your first gift can change everything";
      }
      break;

    case "lybunt":
      rewritten = addReactivationUrgency(content);
      techniques.push("Acknowledged giving gap");
      techniques.push("Created urgency");
      techniques.push("Re-emphasized impact");
      if (deliverableType === "email" && !subjectLine) {
        suggestedSubject = "We miss you - will you give again?";
      }
      break;

    case "sybunt":
      rewritten = applyWinBackStrategy(content);
      techniques.push("Reminded why they gave before");
      techniques.push("Added renewed urgency");
      techniques.push("Lowered barriers to return");
      if (deliverableType === "email" && !subjectLine) {
        suggestedSubject = "Come back - your support matters";
      }
      break;

    case "monthly_donors":
      rewritten = emphasizeSustainerLove(content);
      techniques.push("Added sustainer-specific gratitude");
      techniques.push("Impact reporting focus");
      techniques.push("Soft upgrade mention (if appropriate)");
      if (deliverableType === "email" && !subjectLine) {
        suggestedSubject = "Your monthly impact: [Month] report";
      }
      break;

    case "annual_donors":
      rewritten = encourageRecurringUpgrade(content);
      techniques.push("Positioned monthly giving benefits");
      techniques.push("Emphasized consistency");
      techniques.push("Reduced barrier to upgrade");
      if (deliverableType === "email" && !subjectLine) {
        suggestedSubject = "Make your impact last all year";
      }
      break;

    case "major_donors_behavioral":
      rewritten = personalizeForMajorDonors(content);
      techniques.push("High-touch language");
      techniques.push("Personalized impact story");
      techniques.push("Exclusive opportunity framing");
      if (deliverableType === "email" && !subjectLine) {
        suggestedSubject = "[Personal outreach recommended]";
      }
      break;

    case "high_engagement_non_donors":
      rewritten = convertEngagementToGift(content);
      techniques.push("Acknowledged engagement");
      techniques.push("Bridge from interest to action");
      techniques.push("Clear first-gift CTA");
      if (deliverableType === "email" && !subjectLine) {
        suggestedSubject = "You're already part of the mission - join us";
      }
      break;

    case "prefers_email":
      rewritten = optimizeForDigital(content);
      techniques.push("Shortened for mobile");
      techniques.push("Added clickable CTA");
      techniques.push("Scannable formatting");
      if (deliverableType === "email" && !subjectLine) {
        suggestedSubject = "Quick update + how you can help";
      }
      break;

    case "prefers_direct_mail":
      rewritten = optimizeForDirectMail(content);
      techniques.push("Story-driven narrative");
      techniques.push("Personal, warm tone");
      techniques.push("Traditional fundraising structure");
      break;

    default:
      // For custom segments, apply generic best practices
      rewritten = applyGenericOptimizations(content, segment);
      techniques.push("Applied general fundraising best practices");
      techniques.push("Segment-aware tone adjustment");
  }

  // Channel-specific optimizations
  if (deliverableType === "sms") {
    rewritten = optimizeForSMS(rewritten);
    techniques.push("Shortened for SMS (160 chars)");
  } else if (deliverableType === "social") {
    rewritten = optimizeForSocial(rewritten);
    techniques.push("Optimized for social sharing");
  }

  const explanation = `Rewrote content for "${segment.name}" using ${toneGuidance}. ${techniques.join(". ")}.`;

  return {
    rewrittenContent: rewritten,
    suggestedSubjectLine: suggestedSubject,
    explanation,
    appliedTechniques: techniques,
  };
}

// Segment-specific transformation functions

function emphasizeGratitudeAndImpact(content: string): string {
  // Add gratitude framing
  const gratitudeIntro =
    "Thank you for being part of our mission. Because of donors like you, ";
  if (!content.toLowerCase().includes("thank")) {
    return gratitudeIntro + content;
  }
  return content;
}

function lowerBarriersForFirstGift(content: string): string {
  // Simplify and remove jargon
  let simplified = content
    .replace(/utilize/gi, "use")
    .replace(/facilitate/gi, "help")
    .replace(/leverage/gi, "use");

  // Add first-time donor motivation
  if (!simplified.toLowerCase().includes("first")) {
    simplified +=
      "\n\nYour first gift, no matter the size, makes you part of something bigger.";
  }

  return simplified;
}

function addReactivationUrgency(content: string): string {
  const reactivationIntro =
    "You gave last year and made a real difference. Right now, we need you again. ";
  if (!content.toLowerCase().includes("last year")) {
    return reactivationIntro + content;
  }
  return content;
}

function applyWinBackStrategy(content: string): string {
  const winbackIntro =
    "You've supported us before - thank you. We'd love to have you back. ";
  return winbackIntro + content;
}

function emphasizeSustainerLove(content: string): string {
  const sustainerIntro =
    "As a monthly sustainer, you're the backbone of our work. Here's the impact you're making: ";
  if (!content.toLowerCase().includes("monthly")) {
    return sustainerIntro + content;
  }
  return content;
}

function encourageRecurringUpgrade(content: string): string {
  const upgradeAddition =
    "\n\nConsider joining our monthly giving program - your impact lasts all year, and you'll never miss a chance to help.";
  if (!content.toLowerCase().includes("monthly")) {
    return content + upgradeAddition;
  }
  return content;
}

function personalizeForMajorDonors(content: string): string {
  const personalIntro =
    "I wanted to reach out personally to share an exclusive opportunity. ";
  return personalIntro + content;
}

function convertEngagementToGift(content: string): string {
  const bridgeIntro =
    "You've been following our work - thank you! Ready to take the next step and make your first gift? ";
  return bridgeIntro + content;
}

function optimizeForDigital(content: string): string {
  // Shorten paragraphs for mobile
  const shortened = content
    .split("\n\n")
    .map((para) => {
      if (para.length > 200) {
        return para.substring(0, 197) + "...";
      }
      return para;
    })
    .join("\n\n");

  return shortened + "\n\n[DONATE NOW]";
}

function optimizeForDirectMail(content: string): string {
  // Add story-driven structure
  const storyIntro =
    "Let me tell you about someone whose life was changed by supporters like you: ";
  if (!content.toLowerCase().includes("story") && !content.includes(":")) {
    return storyIntro + content;
  }
  return content;
}

function optimizeForSMS(content: string): string {
  // Limit to 160 characters
  if (content.length <= 160) return content;

  return content.substring(0, 157) + "...";
}

function optimizeForSocial(content: string): string {
  // Add hashtags and social-friendly formatting
  let social = content;

  if (social.length > 280) {
    social = social.substring(0, 277) + "...";
  }

  if (!social.includes("#")) {
    social += " #nonprofit #giving #impact";
  }

  return social;
}

function applyGenericOptimizations(
  content: string,
  segment: BehavioralSegment,
): string {
  // Apply general best practices based on segment category
  let optimized = content;

  if (segment.category === "donor_status") {
    optimized = "Thank you for your support. " + optimized;
  } else if (segment.category === "engagement") {
    optimized = "We've noticed your engagement - thank you! " + optimized;
  } else if (segment.category === "giving_pattern") {
    optimized =
      "Your giving pattern shows commitment. Here's how you're making a difference: " +
      optimized;
  }

  return optimized;
}

/**
 * Get quick coaching tip without full rewrite
 */
export function getQuickCoachingTip(
  segmentId: string,
  _deliverableType: string,
): string {
  const segment = getSegmentById(segmentId);
  if (!segment) return "Optimize content for this segment";

  const tips: Record<string, string> = {
    donors_any: "Lead with gratitude, emphasize continued impact",
    never_given: "Lower barriers, simplify language, motivate first gift",
    lybunt: "Acknowledge gap, create urgency, remind of past impact",
    sybunt: "Win-back strategy: why they gave before + renewed urgency",
    monthly_donors: "Impact reporting focus, avoid over-asking",
    annual_donors: "Position monthly giving benefits, reduce upgrade barriers",
    major_donors_behavioral: "High-touch, personalized, exclusive framing",
    high_engagement_non_donors:
      "Bridge engagement to action, clear first-gift CTA",
    prefers_email: "Short, scannable, mobile-optimized with clear CTA",
    prefers_direct_mail: "Story-driven, personal tone, traditional structure",
  };

  return tips[segmentId] || `Tailor messaging for ${segment.name}`;
}
