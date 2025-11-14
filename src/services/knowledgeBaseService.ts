/**
 * Knowledge Base Service
 *
 * Client-scoped CRUD operations for Track15 knowledge base:
 * - Voice & Tone guidelines
 * - Messaging Pillars & positioning
 * - Donor Narratives repository
 *
 * Powers the Knowledge Base dashboard section and Campaign Designer
 */

import { supabase } from "@/lib/supabaseClient";

// ============================================================================
// TYPES
// ============================================================================

export interface VoiceProfile {
  id: string;
  client_id: string;
  voice_description: string | null;
  tone_guidelines: string | null;
  donor_language_rules: string | null;
  examples: {
    positive: string[];
    negative: string[];
  } | null;
  created_at: string;
  updated_at: string;
}

export interface VoiceProfileInput {
  voice_description?: string;
  tone_guidelines?: string;
  donor_language_rules?: string;
  examples?: {
    positive: string[];
    negative: string[];
  };
}

export interface MessagingPillar {
  title: string;
  description: string;
  examples: string[];
}

export interface MessagingProfile {
  id: string;
  client_id: string;
  pillars: MessagingPillar[] | null;
  impact_language: string | null;
  value_proposition: string | null;
  problem_statement: string | null;
  vision_statement: string | null;
  point_of_view: string | null;
  created_at: string;
  updated_at: string;
}

export interface MessagingProfileInput {
  pillars?: MessagingPillar[];
  impact_language?: string;
  value_proposition?: string;
  problem_statement?: string;
  vision_statement?: string;
  point_of_view?: string;
}

export type DonorStoryType =
  | "donor_story"
  | "impact_story"
  | "testimonial"
  | "case_study";

export interface DonorNarrative {
  id: string;
  client_id: string;
  title: string;
  narrative: string;
  donor_role: string | null;
  emotional_center: string | null;
  story_type: DonorStoryType | null;
  tags: string[] | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface DonorNarrativeInput {
  title: string;
  narrative: string;
  donor_role?: string;
  emotional_center?: string;
  story_type?: DonorStoryType;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

// ============================================================================
// VOICE & TONE SERVICE
// ============================================================================

/**
 * Get voice profile for a client
 */
export async function getVoiceProfile(
  clientId: string
): Promise<VoiceProfile | null> {
  const { data, error } = await supabase
    .from("client_voice")
    .select("*")
    .eq("client_id", clientId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // No rows returned - not an error, just no voice profile yet
      return null;
    }
    console.error("Error fetching voice profile:", error);
    throw error;
  }

  return data as VoiceProfile;
}

/**
 * Create or update voice profile for a client
 */
export async function upsertVoiceProfile(
  clientId: string,
  input: VoiceProfileInput
): Promise<VoiceProfile> {
  const { data, error } = await supabase
    .from("client_voice")
    .upsert(
      {
        client_id: clientId,
        ...input,
      },
      {
        onConflict: "client_id",
      }
    )
    .select()
    .single();

  if (error) {
    console.error("Error upserting voice profile:", error);
    throw error;
  }

  return data as VoiceProfile;
}

/**
 * Delete voice profile for a client
 */
export async function deleteVoiceProfile(clientId: string): Promise<void> {
  const { error } = await supabase
    .from("client_voice")
    .delete()
    .eq("client_id", clientId);

  if (error) {
    console.error("Error deleting voice profile:", error);
    throw error;
  }
}

// ============================================================================
// MESSAGING SERVICE
// ============================================================================

/**
 * Get messaging profile for a client
 */
export async function getMessagingProfile(
  clientId: string
): Promise<MessagingProfile | null> {
  const { data, error } = await supabase
    .from("client_messaging")
    .select("*")
    .eq("client_id", clientId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    console.error("Error fetching messaging profile:", error);
    throw error;
  }

  return data as MessagingProfile;
}

/**
 * Create or update messaging profile for a client
 */
export async function upsertMessagingProfile(
  clientId: string,
  input: MessagingProfileInput
): Promise<MessagingProfile> {
  const { data, error } = await supabase
    .from("client_messaging")
    .upsert(
      {
        client_id: clientId,
        ...input,
      },
      {
        onConflict: "client_id",
      }
    )
    .select()
    .single();

  if (error) {
    console.error("Error upserting messaging profile:", error);
    throw error;
  }

  return data as MessagingProfile;
}

/**
 * Delete messaging profile for a client
 */
export async function deleteMessagingProfile(clientId: string): Promise<void> {
  const { error } = await supabase
    .from("client_messaging")
    .delete()
    .eq("client_id", clientId);

  if (error) {
    console.error("Error deleting messaging profile:", error);
    throw error;
  }
}

// ============================================================================
// DONOR NARRATIVES SERVICE
// ============================================================================

/**
 * List all narratives for a client
 */
export async function listDonorNarratives(
  clientId: string,
  filters?: {
    storyType?: DonorStoryType;
    tags?: string[];
  }
): Promise<DonorNarrative[]> {
  let query = supabase
    .from("client_donor_narratives")
    .select("*")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false });

  if (filters?.storyType) {
    query = query.eq("story_type", filters.storyType);
  }

  if (filters?.tags && filters.tags.length > 0) {
    query = query.overlaps("tags", filters.tags);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching donor narratives:", error);
    throw error;
  }

  return (data || []) as DonorNarrative[];
}

/**
 * Get a single narrative by ID
 */
export async function getDonorNarrative(
  narrativeId: string
): Promise<DonorNarrative> {
  const { data, error } = await supabase
    .from("client_donor_narratives")
    .select("*")
    .eq("id", narrativeId)
    .single();

  if (error) {
    console.error("Error fetching donor narrative:", error);
    throw error;
  }

  return data as DonorNarrative;
}

/**
 * Create a new donor narrative
 */
export async function createDonorNarrative(
  clientId: string,
  input: DonorNarrativeInput
): Promise<DonorNarrative> {
  const { data, error } = await supabase
    .from("client_donor_narratives")
    .insert({
      client_id: clientId,
      ...input,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating donor narrative:", error);
    throw error;
  }

  return data as DonorNarrative;
}

/**
 * Update an existing donor narrative
 */
export async function updateDonorNarrative(
  narrativeId: string,
  input: Partial<DonorNarrativeInput>
): Promise<DonorNarrative> {
  const { data, error } = await supabase
    .from("client_donor_narratives")
    .update(input)
    .eq("id", narrativeId)
    .select()
    .single();

  if (error) {
    console.error("Error updating donor narrative:", error);
    throw error;
  }

  return data as DonorNarrative;
}

/**
 * Delete a donor narrative
 */
export async function deleteDonorNarrative(narrativeId: string): Promise<void> {
  const { error } = await supabase
    .from("client_donor_narratives")
    .delete()
    .eq("id", narrativeId);

  if (error) {
    console.error("Error deleting donor narrative:", error);
    throw error;
  }
}

/**
 * Search narratives by text content
 */
export async function searchDonorNarratives(
  clientId: string,
  searchTerm: string
): Promise<DonorNarrative[]> {
  const { data, error } = await supabase
    .from("client_donor_narratives")
    .select("*")
    .eq("client_id", clientId)
    .or(`title.ilike.%${searchTerm}%,narrative.ilike.%${searchTerm}%`)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error searching donor narratives:", error);
    throw error;
  }

  return (data || []) as DonorNarrative[];
}

// ============================================================================
// COMPOSITE QUERIES
// ============================================================================

/**
 * Get complete knowledge base for a client (all three sections)
 */
export async function getCompleteKnowledgeBase(clientId: string): Promise<{
  voice: VoiceProfile | null;
  messaging: MessagingProfile | null;
  narratives: DonorNarrative[];
}> {
  const [voice, messaging, narratives] = await Promise.all([
    getVoiceProfile(clientId),
    getMessagingProfile(clientId),
    listDonorNarratives(clientId),
  ]);

  return {
    voice,
    messaging,
    narratives,
  };
}

/**
 * Initialize empty knowledge base entries for a new client
 */
export async function initializeKnowledgeBase(clientId: string): Promise<{
  voice: VoiceProfile;
  messaging: MessagingProfile;
}> {
  const [voice, messaging] = await Promise.all([
    upsertVoiceProfile(clientId, {
      examples: { positive: [], negative: [] },
    }),
    upsertMessagingProfile(clientId, {
      pillars: [],
    }),
  ]);

  return {
    voice,
    messaging,
  };
}

// ============================================================================
// EXPORT DEFAULT SERVICE OBJECT
// ============================================================================

export const knowledgeBaseService = {
  // Voice & Tone
  getVoiceProfile,
  upsertVoiceProfile,
  deleteVoiceProfile,

  // Messaging
  getMessagingProfile,
  upsertMessagingProfile,
  deleteMessagingProfile,

  // Donor Narratives
  listDonorNarratives,
  getDonorNarrative,
  createDonorNarrative,
  updateDonorNarrative,
  deleteDonorNarrative,
  searchDonorNarratives,

  // Composite
  getCompleteKnowledgeBase,
  initializeKnowledgeBase,
};

export default knowledgeBaseService;
