/**
 * Campaign Validation Service
 *
 * Validates campaign assets against Track15 best practices and industry standards.
 * Provides automated quality checks and optional auto-fix capabilities.
 */

// ============================================================================
// Types
// ============================================================================

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  fixed?: boolean;
}

export interface ValidationError {
  field: string;
  rule: string;
  message: string;
  severity: "error" | "critical";
  currentValue?: any;
  expectedValue?: any;
  autoFixAvailable: boolean;
}

export interface ValidationWarning {
  field: string;
  rule: string;
  message: string;
  suggestion?: string;
}

export interface ValidationRule<T = any> {
  name: string;
  description: string;
  check: (asset: T) => boolean;
  errorMessage: (asset: T) => string;
  severity: "error" | "critical" | "warning";
  autoFix?: (asset: T) => T;
}

// ============================================================================
// Direct Mail Validation Rules
// ============================================================================

export const directMailValidationRules: ValidationRule[] = [
  {
    name: "dm_word_count",
    description: "Letter should not exceed 850 words",
    severity: "error",
    check: (dm: any) => {
      if (!dm?.letter?.story?.wordCount) return true; // Skip if no word count
      return dm.letter.story.wordCount <= 850;
    },
    errorMessage: (dm: any) =>
      `DM letter exceeds 850 words (current: ${dm?.letter?.story?.wordCount}). Industry best practice is ≤850 words for optimal readability.`,
  },
  {
    name: "dm_paragraph_count",
    description: "Story should have 2-4 paragraphs",
    severity: "warning",
    check: (dm: any) => {
      if (!dm?.letter?.story?.paragraphs) return true;
      const count = dm.letter.story.paragraphs.length;
      return count >= 2 && count <= 4;
    },
    errorMessage: (dm: any) =>
      `Story has ${dm?.letter?.story?.paragraphs?.length} paragraphs. Best practice is 2-4 paragraphs for clear narrative flow.`,
  },
  {
    name: "dm_paragraph_length",
    description: "Paragraphs should be 2-3 sentences each",
    severity: "warning",
    check: (dm: any) => {
      if (!dm?.letter?.story?.paragraphs) return true;
      return dm.letter.story.paragraphs.every((p: string) => {
        const sentenceCount = (p.match(/[.!?]+/g) || []).length;
        return sentenceCount >= 2 && sentenceCount <= 4;
      });
    },
    errorMessage: () =>
      "Some paragraphs are too long or too short. Aim for 2-3 sentences per paragraph for readability.",
  },
  {
    name: "dm_has_ps",
    description: "Letter must include P.S.",
    severity: "error",
    check: (dm: any) => {
      if (!dm?.letter?.postscript) return false;
      return /^P\.S\./i.test(dm.letter.postscript);
    },
    errorMessage: () =>
      "Missing P.S. The postscript is one of the most-read elements of a fundraising letter.",
  },
  {
    name: "dm_has_ask",
    description: "Letter must include clear ask",
    severity: "critical",
    check: (dm: any) => {
      return !!(
        dm?.letter?.ask?.primaryAsk && dm.letter.ask.primaryAsk.length > 20
      );
    },
    errorMessage: () =>
      "Missing or insufficient primary ask. Every fundraising letter must include a clear, direct ask for support.",
  },
  {
    name: "dm_has_urgency",
    description: "Letter should include urgency element",
    severity: "warning",
    check: (dm: any) => {
      return (
        !!(dm?.letter?.urgency && dm.letter.urgency.length > 20) ||
        !!(
          dm?.letter?.ask?.urgencyFraming &&
          dm.letter.ask.urgencyFraming.length > 20
        )
      );
    },
    errorMessage: () =>
      "Missing urgency element. Including a deadline, matching gift, or limited capacity increases response rates.",
  },
  {
    name: "dm_reply_device_complete",
    description: "Reply device must include yes statement and gift options",
    severity: "critical",
    check: (dm: any) => {
      return !!(
        dm?.replyDevice?.yesStatement &&
        dm?.replyDevice?.giftOptions &&
        dm.replyDevice.giftOptions.length >= 3
      );
    },
    errorMessage: () =>
      'Incomplete reply device. Must include "Yes" statement and at least 3 gift options.',
  },
  {
    name: "dm_gift_options_ascending",
    description: "Gift options should be in ascending order",
    severity: "warning",
    check: (dm: any) => {
      if (!dm?.replyDevice?.giftOptions) return true;
      const amounts = dm.replyDevice.giftOptions
        .map((opt: any) => opt.amount)
        .filter((amt: string) => /^\$?\d+$/.test(amt))
        .map((amt: string) => parseInt(amt.replace("$", "")));

      if (amounts.length < 2) return true;

      for (let i = 0; i < amounts.length - 1; i++) {
        if (amounts[i] >= amounts[i + 1]) return false;
      }
      return true;
    },
    errorMessage: () =>
      "Gift options should be presented in ascending order for psychological anchoring.",
  },
  {
    name: "dm_merge_fields_valid",
    description: "Merge fields should use correct syntax",
    severity: "error",
    check: (dm: any) => {
      const content = JSON.stringify(dm);
      // Check for invalid merge field patterns
      const invalidPatterns = [
        /\{\{[^}]*\s[^}]*\}\}/, // Spaces in merge fields
        /\{[^{][^}]*\}/, // Single braces
        /%[A-Z_]+%/, // Percent-based merge fields
      ];

      return !invalidPatterns.some((pattern) => pattern.test(content));
    },
    errorMessage: () =>
      "Invalid merge field syntax detected. Use {{FieldName}} format (no spaces, double braces).",
  },
];

// ============================================================================
// Email Validation Rules
// ============================================================================

export const emailValidationRules: ValidationRule[] = [
  {
    name: "email_subject_length",
    description: "Subject line should be 30-60 characters",
    severity: "warning",
    check: (email: any) => {
      if (!email?.subjectLine) return false;
      const len = email.subjectLine.length;
      return len >= 30 && len <= 60;
    },
    errorMessage: (email: any) =>
      `Subject line length (${email?.subjectLine?.length} chars) is outside optimal range of 30-60 characters.`,
  },
  {
    name: "email_preview_text",
    description: "Preview text should be 40-100 characters",
    severity: "warning",
    check: (email: any) => {
      if (!email?.previewText) return false;
      const len = email.previewText.length;
      return len >= 40 && len <= 100;
    },
    errorMessage: (email: any) =>
      `Preview text length (${email?.previewText?.length} chars) is outside optimal range of 40-100 characters.`,
  },
  {
    name: "email_body_word_count",
    description: "Email body should be 200-400 words",
    severity: "warning",
    check: (email: any) => {
      if (!email?.body?.wordCount) return true;
      const count = email.body.wordCount;
      return count >= 200 && count <= 400;
    },
    errorMessage: (email: any) =>
      `Email body (${email?.body?.wordCount} words) is outside optimal range of 200-400 words.`,
  },
  {
    name: "email_has_cta",
    description: "Email must include clear CTA",
    severity: "critical",
    check: (email: any) => {
      return !!(
        email?.cta?.primaryButton && email.cta.primaryButton.length >= 5
      );
    },
    errorMessage: () =>
      "Missing primary CTA button. Every fundraising email must include a clear call-to-action.",
  },
  {
    name: "email_cta_placement",
    description: "CTA should appear at least once",
    severity: "error",
    check: (email: any) => {
      return !!(email?.cta?.ctaPlacement && email.cta.ctaPlacement.length >= 1);
    },
    errorMessage: () =>
      "No CTA placement specified. Best practice is to include CTA after opening and before closing.",
  },
  {
    name: "email_paragraph_count",
    description: "Email should have 2-5 paragraphs",
    severity: "warning",
    check: (email: any) => {
      if (!email?.body?.bodyParagraphs) return true;
      const count = email.body.bodyParagraphs.length;
      return count >= 2 && count <= 5;
    },
    errorMessage: (email: any) =>
      `Email has ${email?.body?.bodyParagraphs?.length} paragraphs. Optimal is 2-5 for skimmability.`,
  },
  {
    name: "email_personalization",
    description: "Email should include personalization",
    severity: "warning",
    check: (email: any) => {
      const content = JSON.stringify(email);
      return /\{\{FirstName\}\}/.test(content) || /\{\{Name\}\}/.test(content);
    },
    errorMessage: () =>
      "No personalization merge fields detected. Including {{FirstName}} increases engagement.",
  },
];

// ============================================================================
// Email Sequence Validation Rules
// ============================================================================

export const emailSequenceValidationRules: ValidationRule[] = [
  {
    name: "sequence_email_count",
    description: "Sequence should have 10-12 emails",
    severity: "warning",
    check: (sequence: any) => {
      if (!sequence?.emails) return false;
      const count = sequence.emails.length;
      return count >= 10 && count <= 12;
    },
    errorMessage: (sequence: any) =>
      `Sequence has ${sequence?.emails?.length} emails. Recommended is 10-12 for comprehensive coverage.`,
  },
  {
    name: "sequence_cta_variety",
    description: "Email CTAs should vary across sequence",
    severity: "warning",
    check: (sequence: any) => {
      if (!sequence?.emails) return true;
      const ctas = sequence.emails
        .map((e: any) => e.cta?.primaryButton)
        .filter(Boolean);

      if (ctas.length < 3) return true;

      // Check that at least 50% of CTAs are unique
      const uniqueCtas = new Set(ctas);
      return uniqueCtas.size >= ctas.length * 0.5;
    },
    errorMessage: () =>
      'CTA buttons are too repetitive. Vary language across sequence (e.g., "Give Now", "Make Your Gift", "Donate Today").',
  },
  {
    name: "sequence_subject_variety",
    description: "Subject lines should vary across sequence",
    severity: "error",
    check: (sequence: any) => {
      if (!sequence?.emails) return true;
      const subjects = sequence.emails
        .map((e: any) => e.subjectLine)
        .filter(Boolean);

      const uniqueSubjects = new Set(subjects);
      return uniqueSubjects.size === subjects.length;
    },
    errorMessage: () =>
      "Duplicate subject lines detected. Every email should have a unique subject line.",
  },
  {
    name: "sequence_strategy_defined",
    description: "Sequence should include strategy and cadence",
    severity: "warning",
    check: (sequence: any) => {
      return !!(
        sequence?.sequenceStrategy?.duration &&
        sequence?.sequenceStrategy?.sendCadence
      );
    },
    errorMessage: () =>
      "Missing sequence strategy. Define duration and send cadence for proper execution.",
  },
];

// ============================================================================
// Social Posts Validation Rules
// ============================================================================

export const socialPostsValidationRules: ValidationRule[] = [
  {
    name: "social_post_count",
    description: "Campaign should have 10-15 posts",
    severity: "warning",
    check: (campaign: any) => {
      if (!campaign?.posts) return false;
      const count = campaign.posts.length;
      return count >= 10 && count <= 15;
    },
    errorMessage: (campaign: any) =>
      `Campaign has ${campaign?.posts?.length} posts. Recommended is 10-15 for sustained engagement.`,
  },
  {
    name: "social_meta_headline_length",
    description: "Meta (Facebook/Instagram) headlines should be ≤75 characters",
    severity: "error",
    check: (post: any) => {
      if (!post?.content?.headline) return true;
      const platforms = post.platform || [];
      if (!platforms.includes("facebook") && !platforms.includes("instagram"))
        return true;

      return post.content.headline.length <= 75;
    },
    errorMessage: (post: any) =>
      `Meta headline is ${post?.content?.headline?.length} characters. Maximum is 75 for proper display.`,
  },
  {
    name: "social_twitter_length",
    description: "Twitter posts should be ≤280 characters",
    severity: "error",
    check: (post: any) => {
      if (!post?.content?.copy?.twitter) return true;
      return post.content.copy.twitter.length <= 280;
    },
    errorMessage: (post: any) =>
      `Twitter post is ${post?.content?.copy?.twitter?.length} characters. Maximum is 280.`,
  },
  {
    name: "social_linkedin_length",
    description: "LinkedIn long-form should be 400-900 words",
    severity: "warning",
    check: (post: any) => {
      if (!post?.content?.copy?.linkedin || post.format !== "long_form")
        return true;
      const wordCount = post.content.copy.linkedin.split(/\s+/).length;
      return wordCount >= 400 && wordCount <= 900;
    },
    errorMessage: (post: any) => {
      const wordCount = post?.content?.copy?.linkedin?.split(/\s+/).length;
      return `LinkedIn long-form post is ${wordCount} words. Optimal range is 400-900 words.`;
    },
  },
  {
    name: "social_has_cta",
    description: "Post should include call-to-action",
    severity: "warning",
    check: (post: any) => {
      return !!(post?.content?.cta && post.content.cta.length >= 10);
    },
    errorMessage: () =>
      "Missing call-to-action. Social posts should guide followers to take action.",
  },
  {
    name: "social_has_visual_direction",
    description: "Post should include visual direction",
    severity: "warning",
    check: (post: any) => {
      return !!post?.visualDirection?.mediaType;
    },
    errorMessage: () =>
      "Missing visual direction. Social posts perform better with images, videos, or graphics.",
  },
  {
    name: "social_hashtag_count_instagram",
    description: "Instagram posts should have 5-10 hashtags",
    severity: "warning",
    check: (post: any) => {
      const platforms = post.platform || [];
      if (!platforms.includes("instagram")) return true;

      const hashtags = post?.hashtags?.platformSpecific?.instagram || [];
      return hashtags.length >= 5 && hashtags.length <= 10;
    },
    errorMessage: (post: any) => {
      const count = post?.hashtags?.platformSpecific?.instagram?.length || 0;
      return `Instagram post has ${count} hashtags. Optimal is 5-10 relevant hashtags.`;
    },
  },
  {
    name: "social_hashtag_count_linkedin",
    description: "LinkedIn posts should have 3-5 hashtags",
    severity: "warning",
    check: (post: any) => {
      const platforms = post.platform || [];
      if (!platforms.includes("linkedin")) return true;

      const hashtags = post?.hashtags?.platformSpecific?.linkedin || [];
      return hashtags.length >= 3 && hashtags.length <= 5;
    },
    errorMessage: (post: any) => {
      const count = post?.hashtags?.platformSpecific?.linkedin?.length || 0;
      return `LinkedIn post has ${count} hashtags. Optimal is 3-5 professional hashtags.`;
    },
  },
];

// ============================================================================
// Creative Brief Validation Rules
// ============================================================================

export const creativeBriefValidationRules: ValidationRule[] = [
  {
    name: "brief_has_theme",
    description: "Brief must include campaign theme",
    severity: "critical",
    check: (brief: any) => {
      return !!(brief?.theme && brief.theme.length >= 10);
    },
    errorMessage: () =>
      "Missing campaign theme. Creative brief must define overarching theme.",
  },
  {
    name: "brief_has_central_narrative",
    description: "Brief must include central narrative",
    severity: "critical",
    check: (brief: any) => {
      return !!(
        brief?.centralNarrative?.headline &&
        brief?.centralNarrative?.summary &&
        brief?.centralNarrative?.donorRole
      );
    },
    errorMessage: () =>
      "Incomplete central narrative. Must include headline, summary, and donor role.",
  },
  {
    name: "brief_messaging_pillars_count",
    description: "Brief should have 3-5 messaging pillars",
    severity: "warning",
    check: (brief: any) => {
      if (!brief?.messagingPillars) return false;
      const count = brief.messagingPillars.length;
      return count >= 3 && count <= 5;
    },
    errorMessage: (brief: any) =>
      `Brief has ${brief?.messagingPillars?.length} messaging pillars. Recommended is 3-5 for focused messaging.`,
  },
  {
    name: "brief_emotional_triggers_count",
    description: "Brief should have 2-4 emotional triggers",
    severity: "warning",
    check: (brief: any) => {
      if (!brief?.emotionalTriggers) return false;
      const count = brief.emotionalTriggers.length;
      return count >= 2 && count <= 4;
    },
    errorMessage: (brief: any) =>
      `Brief has ${brief?.emotionalTriggers?.length} emotional triggers. Recommended is 2-4 primary triggers.`,
  },
  {
    name: "brief_has_audience_segments",
    description: "Brief must define audience segments",
    severity: "critical",
    check: (brief: any) => {
      return !!(
        brief?.audienceSegments?.primary &&
        brief.audienceSegments.primary.length >= 1
      );
    },
    errorMessage: () =>
      "Missing audience segments. Brief must define at least one primary segment.",
  },
  {
    name: "brief_has_expected_outcomes",
    description: "Brief must include expected outcomes and ROI",
    severity: "error",
    check: (brief: any) => {
      return !!(
        brief?.expectedOutcomes?.goalAmount &&
        brief?.expectedOutcomes?.estimatedROI
      );
    },
    errorMessage: () =>
      "Missing expected outcomes. Brief must include fundraising goal and estimated ROI.",
  },
];

// ============================================================================
// Segmentation Plan Validation Rules
// ============================================================================

export const segmentationPlanValidationRules: ValidationRule[] = [
  {
    name: "segmentation_has_segments",
    description: "Plan must define at least one segment",
    severity: "critical",
    check: (plan: any) => {
      return !!(plan?.segments && plan.segments.length >= 1);
    },
    errorMessage: () =>
      "No segments defined. Segmentation plan must include at least one donor segment.",
  },
  {
    name: "segmentation_has_message_variants",
    description: "Plan must define message variants",
    severity: "critical",
    check: (plan: any) => {
      return !!(plan?.messageVariants && plan.messageVariants.length >= 1);
    },
    errorMessage: () =>
      "No message variants defined. Plan must include targeted messaging for segments.",
  },
  {
    name: "segmentation_variants_mapped",
    description: "All segments should have assigned message variants",
    severity: "error",
    check: (plan: any) => {
      if (!plan?.segments || !plan?.messageVariants) return true;

      const variantNames = new Set(
        plan.messageVariants.map((v: any) => v.variantName),
      );

      return plan.segments.every((seg: any) => {
        const assignedVariant = seg.targetingRules?.messageVariant;
        return !assignedVariant || variantNames.has(assignedVariant);
      });
    },
    errorMessage: () =>
      "Some segments reference non-existent message variants. All variants must be defined.",
  },
  {
    name: "segmentation_has_timeline",
    description: "Plan should include execution timeline",
    severity: "warning",
    check: (plan: any) => {
      return !!(
        plan?.executionPlan?.timeline?.launchDate &&
        plan?.executionPlan?.timeline?.duration
      );
    },
    errorMessage: () =>
      "Missing execution timeline. Define launch date and campaign duration.",
  },
  {
    name: "segmentation_has_kpis",
    description: "Plan should include KPI checklist",
    severity: "warning",
    check: (plan: any) => {
      return !!(
        plan?.executionPlan?.kpiChecklist &&
        plan.executionPlan.kpiChecklist.length >= 3
      );
    },
    errorMessage: () =>
      "Missing or insufficient KPIs. Define at least 3 key performance indicators to track.",
  },
];

// ============================================================================
// Validation Service Functions
// ============================================================================

/**
 * Validate direct mail package
 */
export function validateDirectMail(directMail: any): ValidationResult {
  return runValidation(directMail, directMailValidationRules);
}

/**
 * Validate single email
 */
export function validateEmail(email: any): ValidationResult {
  return runValidation(email, emailValidationRules);
}

/**
 * Validate email sequence
 */
export function validateEmailSequence(sequence: any): ValidationResult {
  const sequenceResult = runValidation(sequence, emailSequenceValidationRules);

  // Also validate individual emails
  const emailResults = (sequence.emails || []).map(
    (email: any, index: number) => {
      const result = validateEmail(email);
      // Prefix errors with email number
      result.errors = result.errors.map((err) => ({
        ...err,
        field: `emails[${index}].${err.field}`,
      }));
      result.warnings = result.warnings.map((warn) => ({
        ...warn,
        field: `emails[${index}].${warn.field}`,
      }));
      return result;
    },
  );

  // Combine results
  return {
    isValid:
      sequenceResult.isValid &&
      emailResults.every((r: ValidationResult) => r.isValid),
    errors: [
      ...sequenceResult.errors,
      ...emailResults.flatMap((r: ValidationResult) => r.errors),
    ],
    warnings: [
      ...sequenceResult.warnings,
      ...emailResults.flatMap((r: ValidationResult) => r.warnings),
    ],
  };
}

/**
 * Validate social media campaign
 */
export function validateSocialPosts(campaign: any): ValidationResult {
  const campaignResult = runValidation(campaign, socialPostsValidationRules);

  // Also validate individual posts
  const postResults = (campaign.posts || []).map((post: any, index: number) => {
    const result = runValidation(
      post,
      socialPostsValidationRules.filter(
        (rule) => !rule.name.startsWith("social_post_count"),
      ),
    );
    // Prefix errors with post number
    result.errors = result.errors.map((err) => ({
      ...err,
      field: `posts[${index}].${err.field}`,
    }));
    result.warnings = result.warnings.map((warn) => ({
      ...warn,
      field: `posts[${index}].${warn.field}`,
    }));
    return result;
  });

  return {
    isValid:
      campaignResult.isValid &&
      postResults.every((r: ValidationResult) => r.isValid),
    errors: [
      ...campaignResult.errors,
      ...postResults.flatMap((r: ValidationResult) => r.errors),
    ],
    warnings: [
      ...campaignResult.warnings,
      ...postResults.flatMap((r: ValidationResult) => r.warnings),
    ],
  };
}

/**
 * Validate creative brief
 */
export function validateCreativeBrief(brief: any): ValidationResult {
  return runValidation(brief, creativeBriefValidationRules);
}

/**
 * Validate segmentation plan
 */
export function validateSegmentationPlan(plan: any): ValidationResult {
  return runValidation(plan, segmentationPlanValidationRules);
}

/**
 * Validate entire campaign package
 */
export function validateCampaignPackage(campaign: {
  creativeBrief?: any;
  directMail?: any;
  emailSequence?: any;
  socialPosts?: any;
  segmentationPlan?: any;
}): Record<string, ValidationResult> {
  const results: Record<string, ValidationResult> = {};

  if (campaign.creativeBrief) {
    results.creativeBrief = validateCreativeBrief(campaign.creativeBrief);
  }

  if (campaign.directMail) {
    results.directMail = validateDirectMail(campaign.directMail);
  }

  if (campaign.emailSequence) {
    results.emailSequence = validateEmailSequence(campaign.emailSequence);
  }

  if (campaign.socialPosts) {
    results.socialPosts = validateSocialPosts(campaign.socialPosts);
  }

  if (campaign.segmentationPlan) {
    results.segmentationPlan = validateSegmentationPlan(
      campaign.segmentationPlan,
    );
  }

  return results;
}

/**
 * Core validation runner
 */
function runValidation<T>(
  asset: T,
  rules: ValidationRule<T>[],
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  for (const rule of rules) {
    try {
      const passed = rule.check(asset);

      if (!passed) {
        if (rule.severity === "warning") {
          warnings.push({
            field: rule.name,
            rule: rule.name,
            message: rule.errorMessage(asset),
            suggestion: rule.description,
          });
        } else {
          errors.push({
            field: rule.name,
            rule: rule.name,
            message: rule.errorMessage(asset),
            severity: rule.severity,
            autoFixAvailable: !!rule.autoFix,
          });
        }
      }
    } catch (error) {
      // Validation rule threw an error - treat as warning
      warnings.push({
        field: rule.name,
        rule: rule.name,
        message: `Validation rule "${rule.name}" failed to execute: ${error}`,
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Auto-fix validation errors where possible
 */
export function attemptAutoFix<T>(
  asset: T,
  rules: ValidationRule<T>[],
): { fixed: T; fixedCount: number } {
  let fixed = asset;
  let fixedCount = 0;

  for (const rule of rules) {
    if (rule.autoFix && !rule.check(fixed)) {
      try {
        fixed = rule.autoFix(fixed);
        fixedCount++;
      } catch (error) {
        console.warn(`Auto-fix failed for rule "${rule.name}":`, error);
      }
    }
  }

  return { fixed, fixedCount };
}

/**
 * Get validation summary across all assets
 */
export function getValidationSummary(
  results: Record<string, ValidationResult>,
): {
  totalErrors: number;
  totalWarnings: number;
  assetsWithErrors: string[];
  isValid: boolean;
} {
  let totalErrors = 0;
  let totalWarnings = 0;
  const assetsWithErrors: string[] = [];

  for (const [assetName, result] of Object.entries(results)) {
    totalErrors += result.errors.length;
    totalWarnings += result.warnings.length;

    if (!result.isValid) {
      assetsWithErrors.push(assetName);
    }
  }

  return {
    totalErrors,
    totalWarnings,
    assetsWithErrors,
    isValid: totalErrors === 0,
  };
}
