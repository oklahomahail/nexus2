/**
 * Campaign and Deliverable Type Definitions
 *
 * Core types for campaign management with per-deliverable segmentation.
 */

/**
 * Deliverable - A single campaign asset (email, DM, social, etc.)
 * with multiple versions targeting different segments
 */
export interface Deliverable {
  deliverableId: string;
  campaignId: string;
  deliverableType: "direct_mail" | "email" | "sms" | "social" | "phone";
  deliverableName: string;
  versions: DeliverableVersion[];
  createdAt: string;
  updatedAt: string;
}

/**
 * DeliverableVersion - A segment-specific variant of a deliverable
 * with customized content and targeting
 */
export interface DeliverableVersion {
  versionId: string;
  deliverableId: string;
  versionLabel: string;
  segmentCriteriaId: string; // References BehavioralSegment.segmentId
  contentDraft: string;
  subjectLine?: string; // Email-specific
  previewText?: string; // Email-specific
  estimatedRecipients?: number;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Campaign with deliverables
 */
export interface CampaignWithDeliverables {
  campaignId: string;
  campaignName: string;
  campaignType:
    | "appeal"
    | "event"
    | "year_end"
    | "acquisition"
    | "reactivation"
    | "sustainer";
  status: "draft" | "in_progress" | "completed" | "archived";
  goal?: number;
  goalAmount?: number;
  startDate?: string;
  endDate?: string;
  originLabRunId?: string; // Reference to Data Lab run that generated segments
  originLabRunSummary?: string; // Human-readable description of origin
  deliverables: Deliverable[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Database table schema for campaign_deliverables
 */
export interface CampaignDeliverableRow {
  deliverable_id: string;
  campaign_id: string;
  deliverable_type: "direct_mail" | "email" | "sms" | "social" | "phone";
  deliverable_name: string;
  created_at: string;
  updated_at: string;
}

/**
 * Database table schema for campaign_deliverable_versions
 */
export interface CampaignDeliverableVersionRow {
  version_id: string;
  deliverable_id: string;
  version_label: string;
  segment_criteria_id: string;
  content_draft: string;
  subject_line?: string;
  preview_text?: string;
  estimated_recipients?: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

/**
 * API response shape for GET /campaigns/:id?include=deliverables
 */
export interface GetCampaignWithDeliverablesResponse {
  campaign: CampaignWithDeliverables;
}

/**
 * API request body for PUT /campaigns/:id/deliverables
 */
export interface UpdateCampaignDeliverablesRequest {
  deliverables: Deliverable[];
}

/**
 * API response for deliverable operations
 */
export interface DeliverableOperationResponse {
  success: boolean;
  deliverable?: Deliverable;
  error?: string;
}
