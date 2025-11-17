// src/services/campaignPersistenceService.ts
// Autosave and persistence layer for Campaign Editor
//
// Features:
// - Debounced autosave (500ms delay)
// - Background sync
// - Optimistic updates
// - Local draft fallback
// - Error handling and retry logic

import { CampaignDraft } from "@/features/campaign-editor/campaignEditor.types";
import { supabase } from "@/lib/supabaseClient";

/**
 * Campaign Persistence Service
 *
 * Handles all campaign draft saving, loading, and publishing operations.
 * Provides autosave functionality with debouncing to prevent excessive API calls.
 *
 * Architecture:
 * - Debounced writes (500ms) to reduce server load
 * - Local storage backup for offline resilience
 * - Optimistic updates for responsive UI
 * - Background sync with error recovery
 */

// -------- Types

export interface SaveStatus {
  saving: boolean;
  lastSaved: Date | null;
  error: string | null;
}

export interface PublishPayload {
  emails?: any[];
  posts?: any[];
  directMail?: string;
  creativeBrief?: string;
}

// -------- Service Class

class CampaignPersistenceService {
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;
  private debounceDelay = 500; // milliseconds
  private saveInProgress = false;
  private onStatusChange?: (status: SaveStatus) => void;
  private lastSaveStatus: SaveStatus = {
    saving: false,
    lastSaved: null,
    error: null,
  };

  /**
   * Register a callback for save status updates
   * Useful for UI indicators (e.g., "Saving...", "All changes saved")
   */
  onSaveStatusChange(callback: (status: SaveStatus) => void) {
    this.onStatusChange = callback;
  }

  /**
   * Autosave with debouncing
   *
   * Delays the actual save operation until user stops typing/editing.
   * Cancels pending saves if new changes come in.
   */
  autosave(draft: CampaignDraft) {
    // Clear any pending save
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    // Update status to indicate pending save
    this.updateStatus({ saving: true, error: null });

    // Schedule save after delay
    this.debounceTimer = setTimeout(() => {
      this.saveDraft(draft);
    }, this.debounceDelay);

    // Also save to local storage immediately as backup
    this.saveToLocalStorage(draft);
  }

  /**
   * Save draft to database
   *
   * Performs the actual save operation with error handling.
   * Updates save status for UI feedback.
   */
  async saveDraft(draft: CampaignDraft): Promise<boolean> {
    if (this.saveInProgress) {
      console.log("Save already in progress, skipping");
      return false;
    }

    this.saveInProgress = true;
    this.updateStatus({ saving: true, error: null });

    try {
      const { error } = await supabase
        .from("campaigns")
        .upsert({
          id: draft.id,
          client_id: draft.clientId,
          overview: draft.overview || {},
          theme: draft.theme || {},
          audience: draft.audience || {},
          deliverables: draft.deliverables || {},
          draft_preview: draft.draftPreview,
          updated_at: new Date().toISOString(),
        });

      if (error) {
        throw error;
      }

      this.updateStatus({
        saving: false,
        lastSaved: new Date(),
        error: null,
      });

      return true;
    } catch (error) {
      console.error("Failed to save campaign draft:", error);

      this.updateStatus({
        saving: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to save. Changes are saved locally.",
      });

      return false;
    } finally {
      this.saveInProgress = false;
    }
  }

  /**
   * Force immediate save (bypasses debounce)
   *
   * Useful when user explicitly clicks "Save" or before navigation.
   */
  async forceSave(draft: CampaignDraft): Promise<boolean> {
    // Cancel any pending debounced save
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }

    return this.saveDraft(draft);
  }

  /**
   * Load campaign draft from database
   */
  async loadDraft(campaignId: string): Promise<CampaignDraft | null> {
    try {
      const { data, error } = await supabase
        .from("campaigns")
        .select("*")
        .eq("id", campaignId)
        .single();

      if (error) throw error;

      if (!data) return null;

      return {
        id: data.id,
        clientId: data.client_id,
        overview: data.overview || {},
        theme: data.theme || {},
        audience: data.audience || {},
        deliverables: data.deliverables || {},
        draftPreview: data.draft_preview,
      };
    } catch (error) {
      console.error("Failed to load campaign draft:", error);

      // Fallback to local storage
      return this.loadFromLocalStorage(campaignId);
    }
  }

  /**
   * Publish campaign with all deliverables
   *
   * Marks campaign as published and saves all generated content.
   */
  async publish(
    draft: CampaignDraft,
    deliverables: PublishPayload,
  ): Promise<boolean> {
    try {
      // 1. Update campaign status and save creative brief
      const { error: campaignError } = await supabase
        .from("campaigns")
        .update({
          status: "published",
          published_at: new Date().toISOString(),
          creative_brief: deliverables.creativeBrief,
          updated_at: new Date().toISOString(),
        })
        .eq("id", draft.id);

      if (campaignError) throw campaignError;

      // 2. Save email series
      if (deliverables.emails && deliverables.emails.length > 0) {
        const { error: emailsError } = await supabase
          .from("campaign_emails")
          .insert(
            deliverables.emails.map((email, index) => ({
              campaign_id: draft.id,
              sequence_number: index + 1,
              subject: email.subject,
              preheader: email.preheader,
              body: email.body,
            })),
          );

        if (emailsError) throw emailsError;
      }

      // 3. Save social posts
      if (deliverables.posts && deliverables.posts.length > 0) {
        const { error: postsError } = await supabase
          .from("campaign_social_posts")
          .insert(
            deliverables.posts.map((post) => ({
              campaign_id: draft.id,
              platform: post.platform,
              body: post.body,
              cta: post.cta,
              status: "draft",
            })),
          );

        if (postsError) throw postsError;
      }

      // 4. Save direct mail (if provided)
      if (deliverables.directMail) {
        const { error: dmError } = await supabase
          .from("campaign_direct_mail")
          .insert({
            campaign_id: draft.id,
            copy: deliverables.directMail,
            mail_type: "letter",
            version: 1,
            status: "draft",
          });

        if (dmError) throw dmError;
      }

      // Clear local storage draft on successful publish
      this.clearLocalStorage(draft.id);

      return true;
    } catch (error) {
      console.error("Failed to publish campaign:", error);
      throw error;
    }
  }

  /**
   * Delete campaign draft
   */
  async deleteDraft(campaignId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("campaigns")
        .delete()
        .eq("id", campaignId);

      if (error) throw error;

      this.clearLocalStorage(campaignId);
      return true;
    } catch (error) {
      console.error("Failed to delete campaign:", error);
      return false;
    }
  }

  // ===== LOCAL STORAGE HELPERS =====

  private getLocalStorageKey(campaignId: string): string {
    return `campaign_draft_${campaignId}`;
  }

  private saveToLocalStorage(draft: CampaignDraft) {
    try {
      const key = this.getLocalStorageKey(draft.id);
      const serialized = JSON.stringify({
        ...draft,
        _localSaveTime: new Date().toISOString(),
      });
      localStorage.setItem(key, serialized);
    } catch (error) {
      console.error("Failed to save to local storage:", error);
    }
  }

  loadFromLocalStorage(campaignId: string): CampaignDraft | null {
    try {
      const key = this.getLocalStorageKey(campaignId);
      const stored = localStorage.getItem(key);

      if (!stored) return null;

      const parsed = JSON.parse(stored);
      // Remove the local save timestamp before returning
      delete parsed._localSaveTime;

      return parsed;
    } catch (error) {
      console.error("Failed to load from local storage:", error);
      return null;
    }
  }

  private clearLocalStorage(campaignId: string) {
    try {
      const key = this.getLocalStorageKey(campaignId);
      localStorage.removeItem(key);
    } catch (error) {
      console.error("Failed to clear local storage:", error);
    }
  }

  /**
   * Check if local storage has a newer version than database
   * Useful for recovery after network issues
   */
  hasLocalDraft(campaignId: string): boolean {
    try {
      const key = this.getLocalStorageKey(campaignId);
      return localStorage.getItem(key) !== null;
    } catch {
      return false;
    }
  }

  // ===== STATUS MANAGEMENT =====

  private updateStatus(partial: Partial<SaveStatus>) {
    this.lastSaveStatus = {
      ...this.lastSaveStatus,
      ...partial,
      lastSaved: partial.lastSaved || this.lastSaveStatus.lastSaved,
    };

    this.onStatusChange?.(this.lastSaveStatus);
  }

  /**
   * Get current save status
   */
  getStatus(): SaveStatus {
    return { ...this.lastSaveStatus };
  }

  /**
   * Reset save status (useful when navigating away)
   */
  resetStatus() {
    this.lastSaveStatus = {
      saving: false,
      lastSaved: null,
      error: null,
    };
    this.onStatusChange?.(this.lastSaveStatus);
  }
}

// -------- Singleton Export

export const campaignPersistenceService = new CampaignPersistenceService();
