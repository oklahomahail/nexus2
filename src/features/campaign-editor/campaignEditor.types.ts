export type CampaignStep =
  | "overview"
  | "theme"
  | "audience"
  | "deliverables"
  | "review-draft"
  | "publish";

export interface CampaignDraft {
  id: string;
  clientId: string;

  // Step data (TODO: adjust based on real model)
  overview?: {
    title?: string;
    season?: string;
    summary?: string;
  };

  theme?: {
    centralIdea?: string;
    tone?: string;
    visualNotes?: string;
  };

  audience?: {
    segments?: string[];
    notes?: string;
  };

  deliverables?: {
    emailCount?: number;
    socialCount?: number;
    includeDirectMail?: boolean;
    notes?: string;
  };

  draftPreview?: string;
}
