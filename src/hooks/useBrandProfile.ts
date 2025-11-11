/**
 * useBrandProfile Hook
 *
 * Manages brand profile state and operations for a client
 * Provides CRUD operations, asset management, and corpus handling
 */

import { useState, useEffect, useCallback } from "react";

import {
  type BrandProfile,
  type BrandAsset,
  type BrandCorpusChunk,
  listBrandProfiles,
  getPrimaryBrandProfile,
  upsertBrandProfile,
  deleteBrandProfile,
  listBrandAssets,
  addBrandAsset,
  deleteBrandAsset,
  listBrandCorpus,
  upsertCorpusChunk,
  deleteCorpusChunk,
  searchCorpusFts,
  generateChecksum,
  type BrandProfileInput,
  type BrandAssetInput,
  type BrandCorpusInput,
} from "../services/brandService";

// ============================================================================
// TYPES
// ============================================================================

interface UseBrandProfileReturn {
  // State
  profile: BrandProfile | null;
  profiles: BrandProfile[];
  assets: BrandAsset[];
  corpus: BrandCorpusChunk[];
  isLoading: boolean;
  error: string | null;

  // Profile operations
  loadProfile: () => Promise<void>;
  updateProfile: (updates: Partial<BrandProfileInput>) => Promise<void>;
  createProfile: (input: BrandProfileInput) => Promise<void>;
  removeProfile: () => Promise<void>;

  // Asset operations
  loadAssets: () => Promise<void>;
  uploadAsset: (
    input: Omit<BrandAssetInput, "client_id" | "brand_id">,
  ) => Promise<void>;
  removeAsset: (assetId: string) => Promise<void>;

  // Corpus operations
  loadCorpus: () => Promise<void>;
  addCorpusEntry: (
    input: Omit<BrandCorpusInput, "client_id" | "brand_id">,
  ) => Promise<void>;
  removeCorpusEntry: (corpusId: string) => Promise<void>;
  searchCorpus: (query: string) => Promise<BrandCorpusChunk[]>;

  // Utilities
  refresh: () => Promise<void>;
}

// ============================================================================
// HOOK
// ============================================================================

export function useBrandProfile(clientId: string): UseBrandProfileReturn {
  // State
  const [profile, setProfile] = useState<BrandProfile | null>(null);
  const [profiles, setProfiles] = useState<BrandProfile[]>([]);
  const [assets, setAssets] = useState<BrandAsset[]>([]);
  const [corpus, setCorpus] = useState<BrandCorpusChunk[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ========== PROFILE OPERATIONS ==========

  /**
   * Load primary brand profile for client
   */
  const loadProfile = useCallback(async () => {
    if (!clientId) return;

    setIsLoading(true);
    setError(null);

    try {
      const primaryProfile = await getPrimaryBrandProfile(clientId);
      setProfile(primaryProfile);

      // Also load all profiles for switching later
      const allProfiles = await listBrandProfiles(clientId);
      setProfiles(allProfiles);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load brand profile";
      setError(message);
      console.error("Error loading brand profile:", err);
    } finally {
      setIsLoading(false);
    }
  }, [clientId]);

  /**
   * Update existing profile
   */
  const updateProfile = useCallback(
    async (updates: Partial<BrandProfileInput>) => {
      if (!profile) {
        setError("No profile to update");
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const updated = await upsertBrandProfile({
          id: profile.id,
          client_id: clientId,
          name: profile.name,
          ...updates,
        });
        setProfile(updated);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to update brand profile";
        setError(message);
        console.error("Error updating brand profile:", err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [profile, clientId],
  );

  /**
   * Create new profile
   */
  const createProfile = useCallback(
    async (input: BrandProfileInput) => {
      setIsLoading(true);
      setError(null);

      try {
        const newProfile = await upsertBrandProfile({
          ...input,
          client_id: clientId,
        });
        setProfile(newProfile);
        setProfiles((prev) => [...prev, newProfile]);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to create brand profile";
        setError(message);
        console.error("Error creating brand profile:", err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [clientId],
  );

  /**
   * Delete current profile
   */
  const removeProfile = useCallback(async () => {
    if (!profile) return;

    setIsLoading(true);
    setError(null);

    try {
      await deleteBrandProfile(profile.id);
      setProfile(null);
      setProfiles((prev) => prev.filter((p) => p.id !== profile.id));
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to delete brand profile";
      setError(message);
      console.error("Error deleting brand profile:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [profile]);

  // ========== ASSET OPERATIONS ==========

  /**
   * Load assets for current profile
   */
  const loadAssets = useCallback(async () => {
    if (!profile) return;

    setIsLoading(true);
    setError(null);

    try {
      const brandAssets = await listBrandAssets(clientId, profile.id);
      setAssets(brandAssets);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load brand assets";
      setError(message);
      console.error("Error loading brand assets:", err);
    } finally {
      setIsLoading(false);
    }
  }, [profile, clientId]);

  /**
   * Upload new asset
   */
  const uploadAsset = useCallback(
    async (input: Omit<BrandAssetInput, "client_id" | "brand_id">) => {
      if (!profile) {
        setError("No profile selected");
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const asset = await addBrandAsset({
          ...input,
          client_id: clientId,
          brand_id: profile.id,
        });
        setAssets((prev) => [asset, ...prev]);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to upload asset";
        setError(message);
        console.error("Error uploading asset:", err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [profile, clientId],
  );

  /**
   * Delete asset
   */
  const removeAsset = useCallback(async (assetId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await deleteBrandAsset(assetId);
      setAssets((prev) => prev.filter((a) => a.id !== assetId));
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to delete asset";
      setError(message);
      console.error("Error deleting asset:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ========== CORPUS OPERATIONS ==========

  /**
   * Load corpus for current profile
   */
  const loadCorpus = useCallback(async () => {
    if (!profile) return;

    setIsLoading(true);
    setError(null);

    try {
      const corpusChunks = await listBrandCorpus(clientId, profile.id, {
        limit: 100,
      });
      setCorpus(corpusChunks);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load brand corpus";
      setError(message);
      console.error("Error loading brand corpus:", err);
    } finally {
      setIsLoading(false);
    }
  }, [profile, clientId]);

  /**
   * Add corpus entry (manual or imported)
   */
  const addCorpusEntry = useCallback(
    async (input: Omit<BrandCorpusInput, "client_id" | "brand_id">) => {
      if (!profile) {
        setError("No profile selected");
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Generate checksum if not provided
        const checksum =
          input.checksum || (await generateChecksum(input.content));

        const corpusEntry = await upsertCorpusChunk({
          ...input,
          checksum,
          client_id: clientId,
          brand_id: profile.id,
        });

        // Reload corpus to get updated list
        await loadCorpus();
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to add corpus entry";
        setError(message);
        console.error("Error adding corpus entry:", err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [profile, clientId, loadCorpus],
  );

  /**
   * Delete corpus entry
   */
  const removeCorpusEntry = useCallback(async (corpusId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await deleteCorpusChunk(corpusId);
      setCorpus((prev) => prev.filter((c) => c.id !== corpusId));
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to delete corpus entry";
      setError(message);
      console.error("Error deleting corpus entry:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Search corpus via full-text search
   */
  const searchCorpus = useCallback(
    async (query: string): Promise<BrandCorpusChunk[]> => {
      if (!profile || !query.trim()) return [];

      try {
        return await searchCorpusFts(clientId, profile.id, query, 20);
      } catch (err) {
        console.error("Error searching corpus:", err);
        return [];
      }
    },
    [profile, clientId],
  );

  // ========== UTILITIES ==========

  /**
   * Refresh all data
   */
  const refresh = useCallback(async () => {
    await Promise.all([loadProfile(), loadAssets(), loadCorpus()]);
  }, [loadProfile, loadAssets, loadCorpus]);

  // ========== EFFECTS ==========

  // Load profile on mount or clientId change
  useEffect(() => {
    if (clientId) {
      loadProfile();
    }
  }, [clientId, loadProfile]);

  // Load assets when profile changes
  useEffect(() => {
    if (profile) {
      loadAssets();
      loadCorpus();
    }
  }, [profile?.id]); // Only depend on profile ID to avoid infinite loops

  // ========== RETURN ==========

  return {
    // State
    profile,
    profiles,
    assets,
    corpus,
    isLoading,
    error,

    // Profile operations
    loadProfile,
    updateProfile,
    createProfile,
    removeProfile,

    // Asset operations
    loadAssets,
    uploadAsset,
    removeAsset,

    // Corpus operations
    loadCorpus,
    addCorpusEntry,
    removeCorpusEntry,
    searchCorpus,

    // Utilities
    refresh,
  };
}
