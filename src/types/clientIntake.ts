// Client Intake Types
// Type definitions for client onboarding upload feature

export type IntakeJobStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "review_required";

export interface ClientIntakeJob {
  id: string;
  client_id: string;
  uploaded_file_url: string;
  uploaded_file_name: string;
  uploaded_file_type: string;
  uploaded_file_size_bytes: number | null;
  status: IntakeJobStatus;
  extracted_data: ExtractedBrandData | null;
  parsed_sections: any | null;
  brand_profile_id: string | null;
  error_message: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export interface ExtractedBrandData {
  organization: {
    name: string;
    mission: string;
    vision: string | null;
    history: string | null;
    website: string | null;
    description: string;
  };
  voice_tone: {
    tone_of_voice: string;
    brand_personality: string;
    style_keywords: string[];
    writing_guidelines: string | null;
  };
  messaging_pillars: MessagingPillar[];
  donor_stories: DonorStory[];
  audience_segments: AudienceSegment[];
  visual_identity: {
    primary_colors: string[];
    secondary_colors: string[] | null;
    typography: string | null;
    logo_description: string | null;
    style_references: string | null;
    imagery_guidelines: string | null;
  };
  campaign_themes: {
    year_end_themes: string | null;
    spring_themes: string | null;
    summer_themes: string | null;
    fall_themes: string | null;
    winter_themes: string | null;
    evergreen_content: string | null;
  };
  key_programs: KeyProgram[];
  competitive_positioning: {
    unique_value_proposition: string | null;
    key_differentiators: string[];
    market_position: string | null;
  };
  contact_information: {
    primary_contact_name: string | null;
    primary_contact_email: string | null;
    phone: string | null;
    address: string | null;
  };
  confidence_score: number;
  missing_sections: string[];
}

export interface MessagingPillar {
  pillar_name: string;
  description: string;
  proof_points: string[];
}

export interface DonorStory {
  title: string;
  narrative: string;
  impact_metrics: string;
  donor_segment: string | null;
  emotional_hook: string | null;
}

export interface AudienceSegment {
  segment_name: string;
  description: string;
  motivations: string;
  communication_preferences: string;
  giving_capacity: string | null;
}

export interface KeyProgram {
  program_name: string;
  description: string;
  target_population: string;
  key_metrics: string | null;
}

export interface IntakeJobUpdate {
  status?: IntakeJobStatus;
  extracted_data?: ExtractedBrandData;
  error_message?: string;
  completed_at?: string;
}
