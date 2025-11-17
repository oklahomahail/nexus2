export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      activity_log: {
        Row: {
          action: string
          changes: Json | null
          client_id: string | null
          description: string | null
          entity_id: string | null
          entity_type: string
          id: string
          metadata: Json | null
          occurred_at: string
          user_id: string | null
        }
        Insert: {
          action: string
          changes?: Json | null
          client_id?: string | null
          description?: string | null
          entity_id?: string | null
          entity_type: string
          id?: string
          metadata?: Json | null
          occurred_at?: string
          user_id?: string | null
        }
        Update: {
          action?: string
          changes?: Json | null
          client_id?: string | null
          description?: string | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          metadata?: Json | null
          occurred_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_log_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      anon_identities: {
        Row: {
          anon_id: string
          client_id: string
          created_at: string
          email_hash: string
          id: string
        }
        Insert: {
          anon_id: string
          client_id: string
          created_at?: string
          email_hash: string
          id?: string
        }
        Update: {
          anon_id?: string
          client_id?: string
          created_at?: string
          email_hash?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "anon_identities_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      audience_segments: {
        Row: {
          client_id: string
          config: Json | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          description: string | null
          estimated_size: number | null
          id: string
          last_updated: string
          name: string
          performance: Json | null
          priority: string | null
          rules: Json | null
          size: number | null
          status: string
          tags: string[] | null
          type: string
          updated_at: string
        }
        Insert: {
          client_id: string
          config?: Json | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          estimated_size?: number | null
          id?: string
          last_updated?: string
          name: string
          performance?: Json | null
          priority?: string | null
          rules?: Json | null
          size?: number | null
          status?: string
          tags?: string[] | null
          type?: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          config?: Json | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          estimated_size?: number | null
          id?: string
          last_updated?: string
          name?: string
          performance?: Json | null
          priority?: string | null
          rules?: Json | null
          size?: number | null
          status?: string
          tags?: string[] | null
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "audience_segments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audience_segments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      behavioral_events: {
        Row: {
          anon_id: string
          campaign_id: string | null
          channel: string | null
          client_id: string
          context: Json | null
          event_type: string
          id: string
          occurred_at: string
        }
        Insert: {
          anon_id: string
          campaign_id?: string | null
          channel?: string | null
          client_id: string
          context?: Json | null
          event_type: string
          id?: string
          occurred_at?: string
        }
        Update: {
          anon_id?: string
          campaign_id?: string | null
          channel?: string | null
          client_id?: string
          context?: Json | null
          event_type?: string
          id?: string
          occurred_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "behavioral_events_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "behavioral_events_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_assets: {
        Row: {
          asset_type: string
          brand_id: string
          client_id: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          description: string | null
          id: string
          metadata: Json | null
          updated_at: string
          url: string
        }
        Insert: {
          asset_type: string
          brand_id: string
          client_id: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          updated_at?: string
          url: string
        }
        Update: {
          asset_type?: string
          brand_id?: string
          client_id?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          updated_at?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "brand_assets_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brand_assets_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brand_assets_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_corpus: {
        Row: {
          brand_id: string
          checksum: string
          client_id: string
          content: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          embedding: string | null
          id: string
          source_type: string
          source_url: string | null
          title: string | null
          tokens: number | null
          updated_at: string
        }
        Insert: {
          brand_id: string
          checksum: string
          client_id: string
          content: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          embedding?: string | null
          id?: string
          source_type: string
          source_url?: string | null
          title?: string | null
          tokens?: number | null
          updated_at?: string
        }
        Update: {
          brand_id?: string
          checksum?: string
          client_id?: string
          content?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          embedding?: string | null
          id?: string
          source_type?: string
          source_url?: string | null
          title?: string | null
          tokens?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "brand_corpus_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brand_corpus_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brand_corpus_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_profiles: {
        Row: {
          brand_personality: string | null
          client_id: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          guidelines_url: string | null
          id: string
          logo_url: string | null
          mission_statement: string | null
          name: string
          primary_colors: string[] | null
          style_keywords: string[] | null
          tone_of_voice: string | null
          typography: Json | null
          updated_at: string
        }
        Insert: {
          brand_personality?: string | null
          client_id: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          guidelines_url?: string | null
          id?: string
          logo_url?: string | null
          mission_statement?: string | null
          name: string
          primary_colors?: string[] | null
          style_keywords?: string[] | null
          tone_of_voice?: string | null
          typography?: Json | null
          updated_at?: string
        }
        Update: {
          brand_personality?: string | null
          client_id?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          guidelines_url?: string | null
          id?: string
          logo_url?: string | null
          mission_statement?: string | null
          name?: string
          primary_colors?: string[] | null
          style_keywords?: string[] | null
          tone_of_voice?: string | null
          typography?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "brand_profiles_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brand_profiles_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_deliverable_versions: {
        Row: {
          content_draft: string
          created_at: string | null
          deliverable_id: string
          estimated_recipients: number | null
          id: string
          preview_text: string | null
          segment_criteria_id: string
          sort_order: number | null
          subject_line: string | null
          updated_at: string | null
          version_label: string
        }
        Insert: {
          content_draft: string
          created_at?: string | null
          deliverable_id: string
          estimated_recipients?: number | null
          id?: string
          preview_text?: string | null
          segment_criteria_id: string
          sort_order?: number | null
          subject_line?: string | null
          updated_at?: string | null
          version_label: string
        }
        Update: {
          content_draft?: string
          created_at?: string | null
          deliverable_id?: string
          estimated_recipients?: number | null
          id?: string
          preview_text?: string | null
          segment_criteria_id?: string
          sort_order?: number | null
          subject_line?: string | null
          updated_at?: string | null
          version_label?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_deliverable_versions_deliverable_id_fkey"
            columns: ["deliverable_id"]
            isOneToOne: false
            referencedRelation: "campaign_deliverables"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_deliverables: {
        Row: {
          campaign_id: string
          created_at: string | null
          deliverable_name: string
          deliverable_type: string
          id: string
          phase: string | null
          scheduled_send_at: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          campaign_id: string
          created_at?: string | null
          deliverable_name: string
          deliverable_type: string
          id?: string
          phase?: string | null
          scheduled_send_at?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          campaign_id?: string
          created_at?: string | null
          deliverable_name?: string
          deliverable_type?: string
          id?: string
          phase?: string | null
          scheduled_send_at?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_deliverables_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          assets_required: Json | null
          budget: Json | null
          category: string | null
          channel_plan: Json | null
          client_id: string
          core_story: Json | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          description: string | null
          end_date: string | null
          goal_amount: number | null
          goals_config: Json | null
          id: string
          journey_type: string | null
          launch_date: string | null
          marketing_cost: number | null
          metadata: Json | null
          name: string
          narrative_arc: Json | null
          origin_lab_run_id: string | null
          origin_lab_run_summary: string | null
          performance: Json | null
          raised_amount: number | null
          season: string | null
          segmentation_rules: Json | null
          start_date: string | null
          status: string
          tags: string[] | null
          target_audience: Json | null
          track15_core_headline: string | null
          track15_core_summary: string | null
          track15_donor_motivation: string | null
          track15_enabled: boolean
          track15_season: string | null
          track15_stage: string | null
          track15_template_key: string | null
          track15_value_proposition: string | null
          type: string
          updated_at: string
        }
        Insert: {
          assets_required?: Json | null
          budget?: Json | null
          category?: string | null
          channel_plan?: Json | null
          client_id: string
          core_story?: Json | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          end_date?: string | null
          goal_amount?: number | null
          goals_config?: Json | null
          id?: string
          journey_type?: string | null
          launch_date?: string | null
          marketing_cost?: number | null
          metadata?: Json | null
          name: string
          narrative_arc?: Json | null
          origin_lab_run_id?: string | null
          origin_lab_run_summary?: string | null
          performance?: Json | null
          raised_amount?: number | null
          season?: string | null
          segmentation_rules?: Json | null
          start_date?: string | null
          status?: string
          tags?: string[] | null
          target_audience?: Json | null
          track15_core_headline?: string | null
          track15_core_summary?: string | null
          track15_donor_motivation?: string | null
          track15_enabled?: boolean
          track15_season?: string | null
          track15_stage?: string | null
          track15_template_key?: string | null
          track15_value_proposition?: string | null
          type?: string
          updated_at?: string
        }
        Update: {
          assets_required?: Json | null
          budget?: Json | null
          category?: string | null
          channel_plan?: Json | null
          client_id?: string
          core_story?: Json | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          end_date?: string | null
          goal_amount?: number | null
          goals_config?: Json | null
          id?: string
          journey_type?: string | null
          launch_date?: string | null
          marketing_cost?: number | null
          metadata?: Json | null
          name?: string
          narrative_arc?: Json | null
          origin_lab_run_id?: string | null
          origin_lab_run_summary?: string | null
          performance?: Json | null
          raised_amount?: number | null
          season?: string | null
          segmentation_rules?: Json | null
          start_date?: string | null
          status?: string
          tags?: string[] | null
          target_audience?: Json | null
          track15_core_headline?: string | null
          track15_core_summary?: string | null
          track15_donor_motivation?: string | null
          track15_enabled?: boolean
          track15_season?: string | null
          track15_stage?: string | null
          track15_template_key?: string | null
          track15_value_proposition?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaigns_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      client_donor_narratives: {
        Row: {
          client_id: string
          created_at: string | null
          donor_role: string | null
          emotional_center: string | null
          id: string
          metadata: Json | null
          narrative: string
          story_type: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          client_id: string
          created_at?: string | null
          donor_role?: string | null
          emotional_center?: string | null
          id?: string
          metadata?: Json | null
          narrative: string
          story_type?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          client_id?: string
          created_at?: string | null
          donor_role?: string | null
          emotional_center?: string | null
          id?: string
          metadata?: Json | null
          narrative?: string
          story_type?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_donor_narratives_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      client_intake_jobs: {
        Row: {
          brand_profile_id: string | null
          client_id: string
          completed_at: string | null
          created_at: string
          created_by: string | null
          error_message: string | null
          extracted_data: Json | null
          id: string
          parsed_sections: Json | null
          status: string
          updated_at: string
          uploaded_file_name: string
          uploaded_file_size_bytes: number | null
          uploaded_file_type: string
          uploaded_file_url: string
        }
        Insert: {
          brand_profile_id?: string | null
          client_id: string
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          error_message?: string | null
          extracted_data?: Json | null
          id?: string
          parsed_sections?: Json | null
          status?: string
          updated_at?: string
          uploaded_file_name: string
          uploaded_file_size_bytes?: number | null
          uploaded_file_type: string
          uploaded_file_url: string
        }
        Update: {
          brand_profile_id?: string | null
          client_id?: string
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          error_message?: string | null
          extracted_data?: Json | null
          id?: string
          parsed_sections?: Json | null
          status?: string
          updated_at?: string
          uploaded_file_name?: string
          uploaded_file_size_bytes?: number | null
          uploaded_file_type?: string
          uploaded_file_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_intake_jobs_brand_profile_id_fkey"
            columns: ["brand_profile_id"]
            isOneToOne: false
            referencedRelation: "brand_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_intake_jobs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_intake_jobs_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      client_memberships: {
        Row: {
          client_id: string
          id: string
          invited_by: string | null
          joined_at: string
          role: string
          user_id: string
        }
        Insert: {
          client_id: string
          id?: string
          invited_by?: string | null
          joined_at?: string
          role?: string
          user_id: string
        }
        Update: {
          client_id?: string
          id?: string
          invited_by?: string | null
          joined_at?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_memberships_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_memberships_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_memberships_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      client_messaging: {
        Row: {
          client_id: string
          created_at: string | null
          id: string
          impact_language: string | null
          pillars: Json | null
          point_of_view: string | null
          problem_statement: string | null
          updated_at: string | null
          value_proposition: string | null
          vision_statement: string | null
        }
        Insert: {
          client_id: string
          created_at?: string | null
          id?: string
          impact_language?: string | null
          pillars?: Json | null
          point_of_view?: string | null
          problem_statement?: string | null
          updated_at?: string | null
          value_proposition?: string | null
          vision_statement?: string | null
        }
        Update: {
          client_id?: string
          created_at?: string | null
          id?: string
          impact_language?: string | null
          pillars?: Json | null
          point_of_view?: string | null
          problem_statement?: string | null
          updated_at?: string | null
          value_proposition?: string | null
          vision_statement?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_messaging_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: true
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      client_voice: {
        Row: {
          client_id: string
          created_at: string | null
          donor_language_rules: string | null
          examples: Json | null
          id: string
          tone_guidelines: string | null
          updated_at: string | null
          voice_description: string | null
        }
        Insert: {
          client_id: string
          created_at?: string | null
          donor_language_rules?: string | null
          examples?: Json | null
          id?: string
          tone_guidelines?: string | null
          updated_at?: string | null
          voice_description?: string | null
        }
        Update: {
          client_id?: string
          created_at?: string | null
          donor_language_rules?: string | null
          examples?: Json | null
          id?: string
          tone_guidelines?: string | null
          updated_at?: string | null
          voice_description?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_voice_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: true
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          address: string | null
          brand: Json | null
          created_at: string
          deleted_at: string | null
          description: string | null
          email: string | null
          id: string
          is_active: boolean
          name: string
          notes: string | null
          phone: string | null
          primary_contact_email: string | null
          primary_contact_name: string | null
          settings: Json | null
          short_name: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: string | null
          brand?: Json | null
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          email?: string | null
          id?: string
          is_active?: boolean
          name: string
          notes?: string | null
          phone?: string | null
          primary_contact_email?: string | null
          primary_contact_name?: string | null
          settings?: Json | null
          short_name?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string | null
          brand?: Json | null
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          email?: string | null
          id?: string
          is_active?: boolean
          name?: string
          notes?: string | null
          phone?: string | null
          primary_contact_email?: string | null
          primary_contact_name?: string | null
          settings?: Json | null
          short_name?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      cohort_retention_metrics: {
        Row: {
          active_count: number
          average_engagement_score: number | null
          cohort_id: string
          created_at: string
          id: string
          period: string
          period_offset: number
          retention_rate: number
          updated_at: string
        }
        Insert: {
          active_count?: number
          average_engagement_score?: number | null
          cohort_id: string
          created_at?: string
          id?: string
          period: string
          period_offset: number
          retention_rate?: number
          updated_at?: string
        }
        Update: {
          active_count?: number
          average_engagement_score?: number | null
          cohort_id?: string
          created_at?: string
          id?: string
          period?: string
          period_offset?: number
          retention_rate?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cohort_retention_metrics_cohort_id_fkey"
            columns: ["cohort_id"]
            isOneToOne: false
            referencedRelation: "donor_cohorts"
            referencedColumns: ["id"]
          },
        ]
      }
      data_quality_issues: {
        Row: {
          client_id: string
          created_at: string
          description: string
          details: Json | null
          detected_at: string
          field_name: string | null
          id: string
          issue_type: string
          last_checked_at: string
          record_id: string | null
          resolved_at: string | null
          resolved_by: string | null
          severity: string
          status: string
          table_name: string
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          description: string
          details?: Json | null
          detected_at?: string
          field_name?: string | null
          id?: string
          issue_type: string
          last_checked_at?: string
          record_id?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity: string
          status?: string
          table_name: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          description?: string
          details?: Json | null
          detected_at?: string
          field_name?: string | null
          id?: string
          issue_type?: string
          last_checked_at?: string
          record_id?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          status?: string
          table_name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "data_quality_issues_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "data_quality_issues_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      donations: {
        Row: {
          amount: number | null
          amount_cents: number
          campaign_id: string | null
          channel: string | null
          client_id: string
          created_at: string
          currency: string | null
          date: string
          donor_id: string
          id: string
          is_recurring: boolean | null
          metadata: Json | null
          method: string | null
          source: string | null
          updated_at: string
        }
        Insert: {
          amount?: number | null
          amount_cents: number
          campaign_id?: string | null
          channel?: string | null
          client_id: string
          created_at?: string
          currency?: string | null
          date?: string
          donor_id: string
          id?: string
          is_recurring?: boolean | null
          metadata?: Json | null
          method?: string | null
          source?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number | null
          amount_cents?: number
          campaign_id?: string | null
          channel?: string | null
          client_id?: string
          created_at?: string
          currency?: string | null
          date?: string
          donor_id?: string
          id?: string
          is_recurring?: boolean | null
          metadata?: Json | null
          method?: string | null
          source?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "donations_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "donations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "donations_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "donors"
            referencedColumns: ["id"]
          },
        ]
      }
      donor_cohorts: {
        Row: {
          client_id: string
          cohort_period: string
          cohort_type: string | null
          created_at: string
          current_size: number
          description: string | null
          id: string
          initial_size: number
          name: string
          updated_at: string
        }
        Insert: {
          client_id: string
          cohort_period: string
          cohort_type?: string | null
          created_at?: string
          current_size?: number
          description?: string | null
          id?: string
          initial_size?: number
          name: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          cohort_period?: string
          cohort_type?: string | null
          created_at?: string
          current_size?: number
          description?: string | null
          id?: string
          initial_size?: number
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "donor_cohorts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      donors: {
        Row: {
          address: Json | null
          age: number | null
          average_donation: number | null
          churn_risk: string | null
          client_id: string
          created_at: string
          custom_fields: Json | null
          deleted_at: string | null
          donation_count: number | null
          email: string | null
          engagement_score: number | null
          first_donation_date: string | null
          first_name: string | null
          id: string
          last_contact_date: string | null
          last_donation_date: string | null
          last_name: string | null
          lifetime_value: number | null
          phone: string | null
          preferences: Json | null
          status: string | null
          tags: string[] | null
          total_donated: number | null
          updated_at: string
        }
        Insert: {
          address?: Json | null
          age?: number | null
          average_donation?: number | null
          churn_risk?: string | null
          client_id: string
          created_at?: string
          custom_fields?: Json | null
          deleted_at?: string | null
          donation_count?: number | null
          email?: string | null
          engagement_score?: number | null
          first_donation_date?: string | null
          first_name?: string | null
          id?: string
          last_contact_date?: string | null
          last_donation_date?: string | null
          last_name?: string | null
          lifetime_value?: number | null
          phone?: string | null
          preferences?: Json | null
          status?: string | null
          tags?: string[] | null
          total_donated?: number | null
          updated_at?: string
        }
        Update: {
          address?: Json | null
          age?: number | null
          average_donation?: number | null
          churn_risk?: string | null
          client_id?: string
          created_at?: string
          custom_fields?: Json | null
          deleted_at?: string | null
          donation_count?: number | null
          email?: string | null
          engagement_score?: number | null
          first_donation_date?: string | null
          first_name?: string | null
          id?: string
          last_contact_date?: string | null
          last_donation_date?: string | null
          last_name?: string | null
          lifetime_value?: number | null
          phone?: string | null
          preferences?: Json | null
          status?: string | null
          tags?: string[] | null
          total_donated?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "donors_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      export_jobs: {
        Row: {
          artifact_size_bytes: number | null
          artifact_url: string | null
          client_id: string
          created_at: string
          error_details: Json | null
          error_message: string | null
          finished_at: string | null
          id: string
          metadata: Json | null
          outcome: string | null
          row_count: number | null
          scheduled_export_id: string | null
          started_at: string | null
          status: string
        }
        Insert: {
          artifact_size_bytes?: number | null
          artifact_url?: string | null
          client_id: string
          created_at?: string
          error_details?: Json | null
          error_message?: string | null
          finished_at?: string | null
          id?: 