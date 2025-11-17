/**
 * Default Behavioral Segment Catalog
 *
 * Privacy-first, donor-friendly segments using only behavioral fields.
 * No PII, no dollar amounts - fully compliant with Nexus privacy model.
 *
 * These segments map directly to the donor analytics model and provide
 * fundraisers with industry-standard segmentation options out of the box.
 */

export interface SegmentCriteria {
  recency?: string;
  frequency?: string;
  engagement?: string;
  channel_preference?: string;
  giving_type?: string;
  loyalty_score?: string;
}

export interface BehavioralSegment {
  segmentId: string;
  name: string;
  description: string;
  criteria: SegmentCriteria;
  isActive: boolean;
  isDefault: boolean;
  category:
    | "donor_status"
    | "engagement"
    | "giving_pattern"
    | "channel_preference";
}

/**
 * Default segment catalog - 10 behavioral segments covering common fundraising scenarios
 */
export const DEFAULT_SEGMENT_CATALOG: BehavioralSegment[] = [
  {
    segmentId: "donors_any",
    name: "All Donors",
    description: "Anyone who has given at least once in their lifetime",
    criteria: {
      frequency: "one_or_more",
    },
    isActive: true,
    isDefault: true,
    category: "donor_status",
  },
  {
    segmentId: "never_given",
    name: "Never Given",
    description: "Prospects and engaged contacts who have not yet made a gift",
    criteria: {
      frequency: "zero",
    },
    isActive: true,
    isDefault: true,
    category: "donor_status",
  },
  {
    segmentId: "lybunt",
    name: "LYBUNT",
    description:
      "Last Year But Unfortunately Not This Year - gave last year, not yet this year",
    criteria: {
      recency: "lybunt",
    },
    isActive: true,
    isDefault: true,
    category: "donor_status",
  },
  {
    segmentId: "sybunt",
    name: "SYBUNT",
    description:
      "Some Year But Unfortunately Not This Year - gave in past (not last year), not this year",
    criteria: {
      recency: "sybunt",
    },
    isActive: true,
    isDefault: true,
    category: "donor_status",
  },
  {
    segmentId: "monthly_donors",
    name: "Monthly Donors",
    description:
      "Active monthly sustainers (recurring gift active within last 60 days)",
    criteria: {
      giving_type: "monthly_sustainer",
      recency: "0-60_days",
    },
    isActive: true,
    isDefault: true,
    category: "giving_pattern",
  },
  {
    segmentId: "annual_donors",
    name: "Annual Donors",
    description:
      "Single-gift donors (not monthly) who gave within the last 12 months",
    criteria: {
      giving_type: "annual",
      recency: "0-365_days",
    },
    isActive: true,
    isDefault: true,
    category: "giving_pattern",
  },
  {
    segmentId: "major_donors_behavioral",
    name: "Major Donors (Behavioral)",
    description:
      "High-loyalty donors with consistent multi-year giving (no dollar threshold)",
    criteria: {
      loyalty_score: "high",
      frequency: "multi_year",
    },
    isActive: true,
    isDefault: true,
    category: "giving_pattern",
  },
  {
    segmentId: "high_engagement_non_donors",
    name: "High-Engagement Non-Donors",
    description:
      "Never given, but highly engaged (opens, clicks, event attendance)",
    criteria: {
      frequency: "zero",
      engagement: "high",
    },
    isActive: true,
    isDefault: true,
    category: "engagement",
  },
  {
    segmentId: "prefers_email",
    name: "Email-Preferred",
    description:
      "Donors/contacts who primarily engage via email (high open/click rates)",
    criteria: {
      channel_preference: "email",
    },
    isActive: true,
    isDefault: true,
    category: "channel_preference",
  },
  {
    segmentId: "prefers_direct_mail",
    name: "Direct Mail-Preferred",
    description:
      "Donors who historically respond best to direct mail (low digital engagement)",
    criteria: {
      channel_preference: "direct_mail",
    },
    isActive: true,
    isDefault: true,
    category: "channel_preference",
  },
];

/**
 * Helper function to get a segment by ID
 */
export function getSegmentById(
  segmentId: string,
): BehavioralSegment | undefined {
  return DEFAULT_SEGMENT_CATALOG.find((seg) => seg.segmentId === segmentId);
}

/**
 * Helper function to get all segments in a category
 */
export function getSegmentsByCategory(
  category: BehavioralSegment["category"],
): BehavioralSegment[] {
  return DEFAULT_SEGMENT_CATALOG.filter((seg) => seg.category === category);
}

/**
 * Helper function to get all active segments
 */
export function getActiveSegments(): BehavioralSegment[] {
  return DEFAULT_SEGMENT_CATALOG.filter((seg) => seg.isActive);
}

/**
 * Helper function to get default segment suggestions based on campaign type
 */
export function getSuggestedSegmentsForCampaign(
  campaignType:
    | "appeal"
    | "event"
    | "year_end"
    | "acquisition"
    | "reactivation"
    | "sustainer",
): string[] {
  const suggestions: Record<string, string[]> = {
    appeal: ["donors_any", "lybunt", "monthly_donors"],
    event: [
      "donors_any",
      "high_engagement_non_donors",
      "major_donors_behavioral",
    ],
    year_end: ["donors_any", "lybunt", "sybunt", "monthly_donors"],
    acquisition: ["never_given", "high_engagement_non_donors"],
    reactivation: ["lybunt", "sybunt"],
    sustainer: ["annual_donors", "donors_any"],
  };

  return suggestions[campaignType] || ["donors_any"];
}

/**
 * Helper function to get human-friendly version label for a segment
 */
export function getDefaultVersionLabel(segmentId: string): string {
  const labels: Record<string, string> = {
    donors_any: "All Donors Version",
    never_given: "Prospect Version",
    lybunt: "LYBUNT Version",
    sybunt: "SYBUNT Version",
    monthly_donors: "Monthly Donor Version",
    annual_donors: "Annual Donor Version",
    major_donors_behavioral: "Major Donor Version",
    high_engagement_non_donors: "High-Engagement Prospect Version",
    prefers_email: "Email-Preferred Version",
    prefers_direct_mail: "Direct Mail Version",
  };

  return labels[segmentId] || `${segmentId} Version`;
}

/**
 * Helper function to validate segment criteria structure
 */
export function isValidSegmentCriteria(
  criteria: unknown,
): criteria is SegmentCriteria {
  if (typeof criteria !== "object" || criteria === null) {
    return false;
  }

  const validKeys = [
    "recency",
    "frequency",
    "engagement",
    "channel_preference",
    "giving_type",
    "loyalty_score",
  ];
  const criteriaObj = criteria as Record<string, unknown>;

  return Object.keys(criteriaObj).every(
    (key) => validKeys.includes(key) && typeof criteriaObj[key] === "string",
  );
}

/**
 * Segment criteria value options for UI dropdowns
 */
export const SEGMENT_CRITERIA_OPTIONS = {
  recency: [
    { value: "0-60_days", label: "0-60 days" },
    { value: "0-90_days", label: "0-90 days" },
    { value: "0-180_days", label: "0-180 days" },
    { value: "0-365_days", label: "0-365 days (1 year)" },
    { value: "365-730_days", label: "1-2 years ago" },
    { value: "730+_days", label: "2+ years ago" },
    { value: "lybunt", label: "LYBUNT (last year only)" },
    { value: "sybunt", label: "SYBUNT (some year, not last year)" },
  ],
  frequency: [
    { value: "zero", label: "Never given" },
    { value: "one_or_more", label: "One or more gifts" },
    { value: "first_time", label: "First-time donor" },
    { value: "repeat", label: "Repeat donor (2+ gifts)" },
    { value: "multi_year", label: "Multi-year donor" },
    { value: "monthly_sustainer", label: "Monthly sustainer" },
  ],
  engagement: [
    { value: "high", label: "High engagement" },
    { value: "medium", label: "Medium engagement" },
    { value: "low", label: "Low engagement" },
    { value: "dormant", label: "Dormant" },
  ],
  channel_preference: [
    { value: "email", label: "Email preferred" },
    { value: "direct_mail", label: "Direct mail preferred" },
    { value: "phone", label: "Phone preferred" },
    { value: "in_person", label: "In-person preferred" },
  ],
  giving_type: [
    { value: "annual", label: "Annual (one-time gifts)" },
    { value: "monthly_sustainer", label: "Monthly sustainer" },
    { value: "quarterly", label: "Quarterly giver" },
    { value: "major_gift", label: "Major gift" },
  ],
  loyalty_score: [
    { value: "high", label: "High loyalty (5+ years)" },
    { value: "medium", label: "Medium loyalty (2-4 years)" },
    { value: "low", label: "Low loyalty (1 year)" },
    { value: "new", label: "New (first gift)" },
  ],
};
