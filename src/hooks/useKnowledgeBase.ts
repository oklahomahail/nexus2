/**
 * useKnowledgeBase Hook
 *
 * Manages knowledge base state and operations for a client
 * Provides access to voice, messaging, and donor narratives
 */

import { useState, useEffect, useCallback } from "react";

import {
  type VoiceProfile,
  type MessagingProfile,
  type DonorNarrative,
  type VoiceProfileInput,
  type MessagingProfileInput,
  type DonorNarrativeInput,
  getCompleteKnowledgeBase,
  upsertVoiceProfile,
  upsertMessagingProfile,
  createDonorNarrative,
  updateDonorNarrative,
  deleteDonorNarrative,
  searchDonorNarratives,
} from "../services/knowledgeBaseService";

// ============================================================================
// TYPES
// ============================================================================

interface UseKnowledgeBaseReturn {
  // State
  knowledgeBase: {
    voice: VoiceProfile | null;
    messaging: MessagingProfile | null;
    narratives: DonorNarrative[];
  } | null;
  isLoading: boolean;
  error: string | null;

  // Voice operations
  updateVoice: (updates: VoiceProfileInput) => Promise<void>;

  // Messaging operations
  updateMessaging: (updates: MessagingProfileInput) => Promise<void>;

  // Narrative operations
  addNarrative: (input: DonorNarrativeInput) => Promise<void>;
  editNarrative: (
    id: string,
    updates: Partial<DonorNarrativeInput>,
  ) => Promise<void>;
  removeNarrative: (id: string) => Promise<void>;
  searchNarratives: (query: string) => Promise<DonorNarrative[]>;

  // Utilities
  refresh: () => Promise<void>;
}

// ============================================================================
// HOOK
// ============================================================================

export function useKnowledgeBase(clientId: string): UseKnowledgeBaseReturn {
  // State
  const [knowledgeBase, setKnowledgeBase] = useState<{
    voice: VoiceProfile | null;
    messaging: MessagingProfile | null;
    narratives: DonorNarrative[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load complete knowledge base
  const loadKnowledgeBase = useCallback(async () => {
    if (!clientId) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await getCompleteKnowledgeBase(clientId);
      setKnowledgeBase(data);
    } catch (err) {
      console.error("Failed to load knowledge base:", err);
      setError("Failed to load knowledge base");
    } finally {
      setIsLoading(false);
    }
  }, [clientId]);

  // Voice operations
  const updateVoice = useCallback(
    async (updates: VoiceProfileInput) => {
      if (!clientId) return;

      setIsLoading(true);
      setError(null);

      try {
        const updated = await upsertVoiceProfile(clientId, updates);
        setKnowledgeBase((prev) => (prev ? { ...prev, voice: updated } : null));
      } catch (err) {
        console.error("Failed to update voice profile:", err);
        setError("Failed to update voice profile");
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [clientId],
  );

  // Messaging operations
  const updateMessaging = useCallback(
    async (updates: MessagingProfileInput) => {
      if (!clientId) return;

      setIsLoading(true);
      setError(null);

      try {
        const updated = await upsertMessagingProfile(clientId, updates);
        setKnowledgeBase((prev) =>
          prev ? { ...prev, messaging: updated } : null,
        );
      } catch (err) {
        console.error("Failed to update messaging profile:", err);
        setError("Failed to update messaging profile");
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [clientId],
  );

  // Narrative operations
  const addNarrative = useCallback(
    async (input: DonorNarrativeInput) => {
      if (!clientId) return;

      setIsLoading(true);
      setError(null);

      try {
        const created = await createDonorNarrative(clientId, input);
        setKnowledgeBase((prev) =>
          prev ? { ...prev, narratives: [created, ...prev.narratives] } : null,
        );
      } catch (err) {
        console.error("Failed to create narrative:", err);
        setError("Failed to create narrative");
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [clientId],
  );

  const editNarrative = useCallback(
    async (id: string, updates: Partial<DonorNarrativeInput>) => {
      setIsLoading(true);
      setError(null);

      try {
        const updated = await updateDonorNarrative(id, updates);
        setKnowledgeBase((prev) =>
          prev
            ? {
                ...prev,
                narratives: prev.narratives.map((n) =>
                  n.id === id ? updated : n,
                ),
              }
            : null,
        );
      } catch (err) {
        console.error("Failed to update narrative:", err);
        setError("Failed to update narrative");
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const removeNarrative = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await deleteDonorNarrative(id);
      setKnowledgeBase((prev) =>
        prev
          ? { ...prev, narratives: prev.narratives.filter((n) => n.id !== id) }
          : null,
      );
    } catch (err) {
      console.error("Failed to delete narrative:", err);
      setError("Failed to delete narrative");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const searchNarratives = useCallback(
    async (query: string) => {
      if (!clientId) return [];

      try {
        return await searchDonorNarratives(clientId, query);
      } catch (err) {
        console.error("Failed to search narratives:", err);
        return [];
      }
    },
    [clientId],
  );

  // Refresh all data
  const refresh = useCallback(async () => {
    await loadKnowledgeBase();
  }, [loadKnowledgeBase]);

  // Load on mount and when clientId changes
  useEffect(() => {
    if (clientId) {
      void loadKnowledgeBase();
    }
  }, [clientId, loadKnowledgeBase]);

  return {
    knowledgeBase,
    isLoading,
    error,
    updateVoice,
    updateMessaging,
    addNarrative,
    editNarrative,
    removeNarrative,
    searchNarratives,
    refresh,
  };
}

export default useKnowledgeBase;
