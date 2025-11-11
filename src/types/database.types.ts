/**
 * Database Types
 *
 * TypeScript types generated from Supabase schema
 * These types represent the database schema directly
 *
 * NOTE: This file is auto-generated from the Supabase schema.
 * To regenerate: npx supabase gen types typescript --project-id <project-id> > src/types/database.types.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// ============================================================================
// ENUMS
// ============================================================================

export type CampaignType = 'email' | 'direct_mail' | 'social_media' | 'multichannel' | 'event' | 'peer_to_peer'
export type CampaignStatus = 'draft' | 'scheduled' | 'active' | 'completed' | 'paused' | 'cancelled'
export type MemberRole = 'owner' | 'admin' | 'editor' | 'viewer'
export type DonorStatus = 'active' | 'inactive' | 'blocked'
export type ChurnRisk = 'low' | 'medium' | 'high'
export type PaymentMethod = 'credit_card' | 'bank_transfer' | 'check' | 'cash' | 'crypto' | 'paypal' | 'venmo'
export type DonationSource = 'website' | 'direct_mail' | 'email' | 'phone' | 'event' | 'referral' | 'social' | 'other'
export type GivingSizeCategory = 'small' | 'medium' | 'large' | 'major'
export type SeasonalityPattern = 'year_end' | 'spring' | 'fall' | 'consistent' | 'variable'
export type CohortType = 'acquisition' | 'engagement' | 'reactivation'
export type SegmentType = 'dynamic' | 'static' | 'predictive' | 'behavioral'
export type SegmentStatus = 'active' | 'inactive' | 'archived' | 'testing'
export type SegmentPriority = 'low' | 'medium' | 'high' | 'critical'
export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'milestone' | 'threshold'
export type NotificationSeverity = 'low' | 'medium' | 'high' | 'critical'
export type ExportType = 'analytics' | 'donors' | 'campaigns' | 'donations' | 'segments' | 'custom'
export type ExportFormat = 'csv' | 'json' | 'xlsx' | 'pdf'
export type ExportCadence = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'custom'
export type ExportStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
export type ExportOutcome = 'success' | 'failure' | 'partial'
export type BehavioralEventType = 'donation' | 'email_open' | 'email_click' | 'page_view' | 'form_submit' | 'unsubscribe' | 'campaign_response'
export type EntityType = 'client' | 'campaign' | 'donor' | 'donation' | 'segment' | 'export' | 'notification' | 'user'
export type BrandAssetType = 'logo' | 'photo' | 'template' | 'example_doc' | 'palette' | 'typography'
export type BrandCorpusSourceType = 'website' | 'pdf' | 'doc' | 'social' | 'manual'

// ============================================================================
// DATABASE SCHEMA
// ============================================================================

export interface Database {
  public: {
    Tables: {
      clients: {
        Row: {
          id: string
          name: string
          short_name: string | null
          primary_contact_name: string | null
          primary_contact_email: string | null
          email: string | null
          phone: string | null
          website: string | null
          address: string | null
          description: string | null
          notes: string | null
          is_active: boolean
          brand: Json
          settings: Json
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          name: string
          short_name?: string | null
          primary_contact_name?: string | null
          primary_contact_email?: string | null
          email?: string | null
          phone?: string | null
          website?: string | null
          address?: string | null
          description?: string | null
          notes?: string | null
          is_active?: boolean
          brand?: Json
          settings?: Json
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          short_name?: string | null
          primary_contact_name?: string | null
          primary_contact_email?: string | null
          email?: string | null
          phone?: string | null
          website?: string | null
          address?: string | null
          description?: string | null
          notes?: string | null
          is_active?: boolean
          brand?: Json
          settings?: Json
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      profiles: {
        Row: {
          id: string
          email: string
          first_name: string | null
          last_name: string | null
          display_name: string | null
          avatar_url: string | null
          preferences: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          first_name?: string | null
          last_name?: string | null
          display_name?: string | null
          avatar_url?: string | null
          preferences?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          first_name?: string | null
          last_name?: string | null
          display_name?: string | null
          avatar_url?: string | null
          preferences?: Json
          created_at?: string
          updated_at?: string
        }
      }
      client_memberships: {
        Row: {
          id: string
          client_id: string
          user_id: string
          role: MemberRole
          invited_by: string | null
          joined_at: string
        }
        Insert: {
          id?: string
          client_id: string
          user_id: string
          role?: MemberRole
          invited_by?: string | null
          joined_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          user_id?: string
          role?: MemberRole
          invited_by?: string | null
          joined_at?: string
        }
      }
      campaigns: {
        Row: {
          id: string
          client_id: string
          name: string
          description: string | null
          type: CampaignType
          status: CampaignStatus
          category: string | null
          goal_amount: number | null
          raised_amount: number | null
          marketing_cost: number | null
          budget: Json
          launch_date: string | null
          end_date: string | null
          target_audience: Json
          goals_config: Json
          performance: Json
          tags: string[]
          metadata: Json
          created_by: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          client_id: string
          name: string
          description?: string | null
          type?: CampaignType
          status?: CampaignStatus
          category?: string | null
          goal_amount?: number | null
          raised_amount?: number | null
          marketing_cost?: number | null
          budget?: Json
          launch_date?: string | null
          end_date?: string | null
          target_audience?: Json
          goals_config?: Json
          performance?: Json
          tags?: string[]
          metadata?: Json
          created_by?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          client_id?: string
          name?: string
          description?: string | null
          type?: CampaignType
          status?: CampaignStatus
          category?: string | null
          goal_amount?: number | null
          raised_amount?: number | null
          marketing_cost?: number | null
          budget?: Json
          launch_date?: string | null
          end_date?: string | null
          target_audience?: Json
          goals_config?: Json
          performance?: Json
          tags?: string[]
          metadata?: Json
          created_by?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      donors: {
        Row: {
          id: string
          client_id: string
          first_name: string | null
          last_name: string | null
          email: string | null
          phone: string | null
          address: Json | null
          age: number | null
          total_donated: number
          donation_count: number
          average_donation: number
          first_donation_date: string | null
          last_donation_date: string | null
          last_contact_date: string | null
          engagement_score: number
          churn_risk: ChurnRisk
          lifetime_value: number
          status: DonorStatus
          preferences: Json
          tags: string[]
          custom_fields: Json
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          client_id: string
          first_name?: string | null
          last_name?: string | null
          email?: string | null
          phone?: string | null
          address?: Json | null
          age?: number | null
          total_donated?: number
          donation_count?: number
          average_donation?: number
          first_donation_date?: string | null
          last_donation_date?: string | null
          last_contact_date?: string | null
          engagement_score?: number
          churn_risk?: ChurnRisk
          lifetime_value?: number
          status?: DonorStatus
          preferences?: Json
          tags?: string[]
          custom_fields?: Json
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          client_id?: string
          first_name?: string | null
          last_name?: string | null
          email?: string | null
          phone?: string | null
          address?: Json | null
          age?: number | null
          total_donated?: number
          donation_count?: number
          average_donation?: number
          first_donation_date?: string | null
          last_donation_date?: string | null
          last_contact_date?: string | null
          engagement_score?: number
          churn_risk?: ChurnRisk
          lifetime_value?: number
          status?: DonorStatus
          preferences?: Json
          tags?: string[]
          custom_fields?: Json
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      donations: {
        Row: {
          id: string
          donor_id: string
          client_id: string
          campaign_id: string | null
          amount_cents: number
          currency: string
          date: string
          method: PaymentMethod
          is_recurring: boolean
          source: DonationSource
          channel: string | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          donor_id: string
          client_id: string
          campaign_id?: string | null
          amount_cents: number
          currency?: string
          date?: string
          method?: PaymentMethod
          is_recurring?: boolean
          source?: DonationSource
          channel?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          donor_id?: string
          client_id?: string
          campaign_id?: string | null
          amount_cents?: number
          currency?: string
          date?: string
          method?: PaymentMethod
          is_recurring?: boolean
          source?: DonationSource
          channel?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
      anon_identities: {
        Row: {
          id: string
          client_id: string
          email_hash: string
          anon_id: string
          created_at: string
        }
        Insert: {
          id?: string
          client_id: string
          email_hash: string
          anon_id: string
          created_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          email_hash?: string
          anon_id?: string
          created_at?: string
        }
      }
      behavioral_events: {
        Row: {
          id: string
          client_id: string
          anon_id: string
          event_type: BehavioralEventType
          campaign_id: string | null
          channel: string | null
          occurred_at: string
          context: Json
        }
        Insert: {
          id?: string
          client_id: string
          anon_id: string
          event_type: BehavioralEventType
          campaign_id?: string | null
          channel?: string | null
          occurred_at?: string
          context?: Json
        }
        Update: {
          id?: string
          client_id?: string
          anon_id?: string
          event_type?: BehavioralEventType
          campaign_id?: string | null
          channel?: string | null
          occurred_at?: string
          context?: Json
        }
      }
      giving_patterns: {
        Row: {
          id: string
          client_id: string
          anon_id: string
          frequency_score: number
          engagement_score: number
          loyalty_score: number
          giving_size_category: GivingSizeCategory
          primary_campaign_types: string[]
          seasonality_pattern: SeasonalityPattern | null
          average_response_time_days: number | null
          last_engagement_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          anon_id: string
          frequency_score?: number
          engagement_score?: number
          loyalty_score?: number
          giving_size_category?: GivingSizeCategory
          primary_campaign_types?: string[]
          seasonality_pattern?: SeasonalityPattern | null
          average_response_time_days?: number | null
          last_engagement_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          anon_id?: string
          frequency_score?: number
          engagement_score?: number
          loyalty_score?: number
          giving_size_category?: GivingSizeCategory
          primary_campaign_types?: string[]
          seasonality_pattern?: SeasonalityPattern | null
          average_response_time_days?: number | null
          last_engagement_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      donor_cohorts: {
        Row: {
          id: string
          client_id: string
          name: string
          cohort_period: string
          cohort_type: CohortType
          initial_size: number
          current_size: number
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          name: string
          cohort_period: string
          cohort_type?: CohortType
          initial_size?: number
          current_size?: number
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          name?: string
          cohort_period?: string
          cohort_type?: CohortType
          initial_size?: number
          current_size?: number
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      cohort_retention_metrics: {
        Row: {
          id: string
          cohort_id: string
          period: string
          period_offset: number
          active_count: number
          retention_rate: number
          average_engagement_score: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          cohort_id: string
          period: string
          period_offset: number
          active_count?: number
          retention_rate?: number
          average_engagement_score?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          cohort_id?: string
          period?: string
          period_offset?: number
          active_count?: number
          retention_rate?: number
          average_engagement_score?: number
          created_at?: string
          updated_at?: string
        }
      }
      audience_segments: {
        Row: {
          id: string
          client_id: string
          name: string
          description: string | null
          type: SegmentType
          status: SegmentStatus
          rules: Json | null
          config: Json
          size: number
          estimated_size: number | null
          tags: string[]
          priority: SegmentPriority
          created_by: string | null
          performance: Json
          last_updated: string
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          client_id: string
          name: string
          description?: string | null
          type?: SegmentType
          status?: SegmentStatus
          rules?: Json | null
          config?: Json
          size?: number
          estimated_size?: number | null
          tags?: string[]
          priority?: SegmentPriority
          created_by?: string | null
          performance?: Json
          last_updated?: string
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          client_id?: string
          name?: string
          description?: string | null
          type?: SegmentType
          status?: SegmentStatus
          rules?: Json | null
          config?: Json
          size?: number
          estimated_size?: number | null
          tags?: string[]
          priority?: SegmentPriority
          created_by?: string | null
          performance?: Json
          last_updated?: string
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      segment_memberships: {
        Row: {
          id: string
          segment_id: string
          donor_id: string
          client_id: string
          added_at: string
          score: number | null
        }
        Insert: {
          id?: string
          segment_id: string
          donor_id: string
          client_id: string
          added_at?: string
          score?: number | null
        }
        Update: {
          id?: string
          segment_id?: string
          donor_id?: string
          client_id?: string
          added_at?: string
          score?: number | null
        }
      }
      notifications: {
        Row: {
          id: string
          client_id: string | null
          user_id: string | null
          type: NotificationType
          severity: NotificationSeverity
          title: string
          message: string
          entity_type: string | null
          entity_id: string | null
          metadata: Json
          read_at: string | null
          dismissed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          client_id?: string | null
          user_id?: string | null
          type?: NotificationType
          severity?: NotificationSeverity
          title: string
          message: string
          entity_type?: string | null
          entity_id?: string | null
          metadata?: Json
          read_at?: string | null
          dismissed_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          client_id?: string | null
          user_id?: string | null
          type?: NotificationType
          severity?: NotificationSeverity
          title?: string
          message?: string
          entity_type?: string | null
          entity_id?: string | null
          metadata?: Json
          read_at?: string | null
          dismissed_at?: string | null
          created_at?: string
        }
      }
      scheduled_exports: {
        Row: {
          id: string
          client_id: string
          created_by: string
          name: string
          description: string | null
          export_type: ExportType
          format: ExportFormat
          spec: Json
          cadence: ExportCadence
          cron_expression: string | null
          timezone: string
          is_active: boolean
          next_run_at: string | null
          last_run_at: string | null
          delivery_method: string
          delivery_config: Json
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          client_id: string
          created_by: string
          name: string
          description?: string | null
          export_type: ExportType
          format?: ExportFormat
          spec?: Json
          cadence: ExportCadence
          cron_expression?: string | null
          timezone?: string
          is_active?: boolean
          next_run_at?: string | null
          last_run_at?: string | null
          delivery_method?: string
          delivery_config?: Json
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          client_id?: string
          created_by?: string
          name?: string
          description?: string | null
          export_type?: ExportType
          format?: ExportFormat
          spec?: Json
          cadence?: ExportCadence
          cron_expression?: string | null
          timezone?: string
          is_active?: boolean
          next_run_at?: string | null
          last_run_at?: string | null
          delivery_method?: string
          delivery_config?: Json
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      export_jobs: {
        Row: {
          id: string
          scheduled_export_id: string | null
          client_id: string
          status: ExportStatus
          started_at: string | null
          finished_at: string | null
          outcome: ExportOutcome | null
          artifact_url: string | null
          artifact_size_bytes: number | null
          row_count: number | null
          error_message: string | null
          error_details: Json | null
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          scheduled_export_id?: string | null
          client_id: string
          status?: ExportStatus
          started_at?: string | null
          finished_at?: string | null
          outcome?: ExportOutcome | null
          artifact_url?: string | null
          artifact_size_bytes?: number | null
          row_count?: number | null
          error_message?: string | null
          error_details?: Json | null
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          scheduled_export_id?: string | null
          client_id?: string
          status?: ExportStatus
          started_at?: string | null
          finished_at?: string | null
          outcome?: ExportOutcome | null
          artifact_url?: string | null
          artifact_size_bytes?: number | null
          row_count?: number | null
          error_message?: string | null
          error_details?: Json | null
          metadata?: Json
          created_at?: string
        }
      }
      activity_log: {
        Row: {
          id: string
          client_id: string | null
          user_id: string | null
          entity_type: EntityType
          entity_id: string | null
          action: string
          description: string | null
          changes: Json | null
          metadata: Json
          occurred_at: string
        }
        Insert: {
          id?: string
          client_id?: string | null
          user_id?: string | null
          entity_type: EntityType
          entity_id?: string | null
          action: string
          description?: string | null
          changes?: Json | null
          metadata?: Json
          occurred_at?: string
        }
        Update: {
          id?: string
          client_id?: string | null
          user_id?: string | null
          entity_type?: EntityType
          entity_id?: string | null
          action?: string
          description?: string | null
          changes?: Json | null
          metadata?: Json
          occurred_at?: string
        }
      }
      brand_profiles: {
        Row: {
          id: string
          client_id: string
          name: string
          mission_statement: string | null
          tone_of_voice: string | null
          brand_personality: string | null
          style_keywords: string[] | null
          primary_colors: string[] | null
          typography: Json | null
          logo_url: string | null
          guidelines_url: string | null
          created_by: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          client_id: string
          name: string
          mission_statement?: string | null
          tone_of_voice?: string | null
          brand_personality?: string | null
          style_keywords?: string[] | null
          primary_colors?: string[] | null
          typography?: Json | null
          logo_url?: string | null
          guidelines_url?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          client_id?: string
          name?: string
          mission_statement?: string | null
          tone_of_voice?: string | null
          brand_personality?: string | null
          style_keywords?: string[] | null
          primary_colors?: string[] | null
          typography?: Json | null
          logo_url?: string | null
          guidelines_url?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      brand_assets: {
        Row: {
          id: string
          client_id: string
          brand_id: string
          asset_type: BrandAssetType
          url: string
          description: string | null
          metadata: Json | null
          created_by: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          client_id: string
          brand_id: string
          asset_type: BrandAssetType
          url: string
          description?: string | null
          metadata?: Json | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          client_id?: string
          brand_id?: string
          asset_type?: BrandAssetType
          url?: string
          description?: string | null
          metadata?: Json | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      brand_corpus: {
        Row: {
          id: string
          client_id: string
          brand_id: string
          source_type: BrandCorpusSourceType
          source_url: string | null
          title: string | null
          checksum: string
          content: string
          embedding: number[] | null
          tokens: number | null
          created_by: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          client_id: string
          brand_id: string
          source_type: BrandCorpusSourceType
          source_url?: string | null
          title?: string | null
          checksum: string
          content: string
          embedding?: number[] | null
          tokens?: number | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          client_id?: string
          brand_id?: string
          source_type?: BrandCorpusSourceType
          source_url?: string | null
          title?: string | null
          checksum?: string
          content?: string
          embedding?: number[] | null
          tokens?: number | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_access_client: {
        Args: { target_client_id: string }
        Returns: boolean
      }
      can_write_client: {
        Args: { target_client_id: string }
        Returns: boolean
      }
      is_client_admin: {
        Args: { target_client_id: string }
        Returns: boolean
      }
      is_client_owner: {
        Args: { target_client_id: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}
