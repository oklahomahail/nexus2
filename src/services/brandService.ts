/**
 * Brand Service
 *
 * Client-scoped CRUD operations for brand profiles, assets, and corpus
 * Powers the Campaign Designer's "Brand Bible" foundation
 */

import { supabase } from "@/lib/supabaseClient";

// ============================================================================
// TYPES
// ============================================================================

export interface BrandProfile {
  id: string;
  client_id: string;
  name: string;
  mission_statement?: string;
  tone_of_voice?: string;
  brand_personality?: string;
  style_keywords?: string[];
  primary_colors?: string[];
  typography?: {
    headings?: string;
    body?: string;
    weights?: number[];
    [key: string]: unknown;
  };
  logo_url?: string;
  guidelines_url?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface BrandProfileInput {
  client_id: string;
  name: string;
  mission_statement?: string;
  tone_of_voice?: string;
  brand_personality?: string;
  style_keywords?: string[];
  primary_colors?: string[];
  typography?: Record<string, unknown>;
  logo_url?: string;
  guidelines_url?: string;
}

export type BrandAssetType =
  | "logo"
  | "photo"
  | "template"
  | "example_doc"
  | "palette"
  | "typography";

export interface BrandAsset {
  id: string;
  client_id: string;
  brand_id: string;
  asset_type: BrandAssetType;
  url: string;
  description?: string;
  metadata?: Record<string, unknown>;
  created_by?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface BrandAssetInput {
  client_id: string;
  brand_id: string;
  asset_type: BrandAssetType;
  url: string;
  description?: string;
  metadata?: Record<string, unknown>;
}

export type BrandCorpusSourceType =
  | "website"
  | "pdf"
  | "doc"
  | "social"
  | "manual";

export interface BrandCorpusChunk {
  id: string;
  client_id: string;
  brand_id: string;
  source_type: BrandCorpusSourceType;
  source_url?: string;
  title?: string;
  checksum: string;
  content: string;
  embedding?: number[];
  tokens?: number;
  created_by?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface BrandCorpusInput {
  client_id: string;
  brand_id: string;
  source_type: BrandCorpusSourceType;
  source_url?: string;
  title?: string;
  checksum: string;
  content: string;
  tokens?: number;
  embedding?: number[];
}

// ============================================================================
// BRAND PROFILES
// ============================================================================

/**
 * Get all brand profiles for a client
 */
export async function listBrandProfiles(
  clientId: string,
): Promise<BrandProfile[]> {
  const { data, error } = await supabase
    .from("brand_profiles")
    .select("*")
    .eq("client_id", clientId)
    .is("deleted_at", null)
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Get a single brand profile by ID
 */
export async function getBrandProfile(id: string): Promise<BrandProfile> {
  const { data, error } = await supabase
    .from("brand_profiles")
    .select("*")
    .eq("id", id)
    .is("deleted_at", null)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get primary brand profile for a client (first/only profile)
 */
export async function getPrimaryBrandProfile(
  clientId: string,
): Promise<BrandProfile | null> {
  const { data, error } = await supabase
    .from("brand_profiles")
    .select("*")
    .eq("client_id", clientId)
    .is("deleted_at", null)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
}

/**
 * Create or update a brand profile
 */
export async function upsertBrandProfile(
  input: BrandProfileInput & { id?: string },
): Promise<BrandProfile> {
  const { data, error } = await supabase
    .from("brand_profiles")
    .upsert(input, { onConflict: "id" })
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

/**
 * Soft delete a brand profile
 */
export async function deleteBrandProfile(id: string): Promise<void> {
  const { error } = await supabase
    .from("brand_profiles")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw error;
}

// ============================================================================
// BRAND ASSETS
// ============================================================================

/**
 * Get all assets for a brand
 */
export async function listBrandAssets(
  clientId: string,
  brandId: string,
  assetType?: BrandAssetType,
): Promise<BrandAsset[]> {
  let query = supabase
    .from("brand_assets")
    .select("*")
    .eq("client_id", clientId)
    .eq("brand_id", brandId)
    .is("deleted_at", null);

  if (assetType) {
    query = query.eq("asset_type", assetType);
  }

  const { data, error } = await query.order("updated_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Add a brand asset
 */
export async function addBrandAsset(
  input: BrandAssetInput,
): Promise<BrandAsset> {
  const { data, error } = await supabase
    .from("brand_assets")
    .insert(input)
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update a brand asset
 */
export async function updateBrandAsset(
  id: string,
  updates: Partial<BrandAssetInput>,
): Promise<BrandAsset> {
  const { data, error } = await supabase
    .from("brand_assets")
    .update(updates)
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

/**
 * Delete a brand asset
 */
export async function deleteBrandAsset(id: string): Promise<void> {
  const { error } = await supabase
    .from("brand_assets")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw error;
}

// ============================================================================
// BRAND CORPUS
// ============================================================================

/**
 * Get corpus chunks for a brand
 */
export async function listBrandCorpus(
  clientId: string,
  brandId: string,
  opts?: {
    sourceType?: BrandCorpusSourceType;
    limit?: number;
  },
): Promise<BrandCorpusChunk[]> {
  let query = supabase
    .from("brand_corpus")
    .select("id, title, source_type, source_url, content, tokens, updated_at")
    .eq("client_id", clientId)
    .eq("brand_id", brandId)
    .is("deleted_at", null);

  if (opts?.sourceType) {
    query = query.eq("source_type", opts.sourceType);
  }

  if (opts?.limit) {
    query = query.limit(opts.limit);
  }

  const { data, error } = await query.order("updated_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Upsert a corpus chunk (dedupe via checksum)
 */
export async function upsertCorpusChunk(
  input: BrandCorpusInput,
): Promise<BrandCorpusChunk> {
  const { data, error } = await supabase
    .from("brand_corpus")
    .upsert(input, {
      onConflict: "client_id,brand_id,checksum",
      ignoreDuplicates: false,
    })
    .select("id")
    .single();

  if (error) throw error;
  return data;
}

/**
 * Full-text search across brand corpus
 */
export async function searchCorpusFts(
  clientId: string,
  brandId: string,
  query: string,
  limit = 20,
): Promise<BrandCorpusChunk[]> {
  const { data, error } = await supabase
    .from("brand_corpus")
    .select("id, title, source_type, source_url, content, updated_at")
    .eq("client_id", clientId)
    .eq("brand_id", brandId)
    .textSearch("content", query, { type: "websearch" })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

/**
 * Get top N corpus snippets for prompt injection
 * Returns most recent, diverse sources
 */
export async function getTopCorpusSnippets(
  clientId: string,
  brandId: string,
  limit = 10,
  maxCharsPerSnippet = 500,
): Promise<Array<{ source: string; snippet: string }>> {
  const { data, error } = await supabase
    .from("brand_corpus")
    .select("title, source_type, source_url, content")
    .eq("client_id", clientId)
    .eq("brand_id", brandId)
    .is("deleted_at", null)
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  if (!data) return [];

  return data.map((chunk: any) => ({
    source: chunk.title || chunk.source_type || "Unknown",
    snippet:
      chunk.content.slice(0, maxCharsPerSnippet) +
      (chunk.content.length > maxCharsPerSnippet ? "..." : ""),
  }));
}

/**
 * Delete a corpus chunk
 */
export async function deleteCorpusChunk(id: string): Promise<void> {
  const { error } = await supabase
    .from("brand_corpus")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw error;
}

// ============================================================================
// HELPER: Generate checksum for deduplication
// ============================================================================

/**
 * Generate SHA-256 checksum for corpus content
 * Used to deduplicate identical content from different sources
 */
export async function generateChecksum(content: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hashHex;
}

// ============================================================================
// HELPER: Build brand context for AI prompts
// ============================================================================

/**
 * Build comprehensive brand context for AI prompts
 * Includes profile + top corpus snippets
 */
export async function buildBrandContext(
  clientId: string,
  brandId: string,
): Promise<{
  profile: BrandProfile;
  snippets: Array<{ source: string; snippet: string }>;
  context: string;
}> {
  const profile = await getBrandProfile(brandId);
  const snippets = await getTopCorpusSnippets(clientId, brandId, 10, 500);

  const context = `
BRAND PROFILE:
- Name: ${profile.name}
- Mission: ${profile.mission_statement || "Not provided"}
- Tone of Voice: ${profile.tone_of_voice || "Not specified"}
- Brand Personality: ${profile.brand_personality || "Not specified"}
- Style Keywords: ${profile.style_keywords?.join(", ") || "None"}
- Primary Colors: ${profile.primary_colors?.join(", ") || "None"}

BRAND VOICE EXAMPLES:
${snippets.map((s, i) => `${i + 1}. [${s.source}]\n${s.snippet}\n`).join("\n")}
`.trim();

  return { profile, snippets, context };
}
