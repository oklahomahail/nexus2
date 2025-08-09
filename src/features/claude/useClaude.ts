/* eslint-disable */
// src/features/claude/useClaude.ts - Fixed to work with your Campaign type
import { useState, useCallback, useEffect } from "react";

import { Campaign } from "@/models/campaign";

import {
  generateClaudeConversation,
  ClaudeServiceError,
  ClaudeMessage,
  ClaudeResponse,
} from "./claudeService";
import { getClaudePrompt } from "./getClaudePrompt";

// Local storage keys
const CONVERSATION_STORAGE_KEY = "nexus_claude_conversations";
const LAST_CAMPAIGN_KEY = "nexus_claude_last_campaign";

export interface ConversationSession {
  id: string;
  campaignId?: string;
  campaignName?: string;
  messages: ClaudeMessage[];
  createdAt: string;
  lastUpdated: string;
}

interface UseClaudeResult {
  isLoading: boolean;
  error: string | null;
  response: ClaudeResponse | null;
  conversationHistory: ClaudeMessage[];
  currentSession: ConversationSession | null;
  sessions: ConversationSession[];

  // Actions
  askClaude: (
    _prompt: string,
    _currentCampaign?: Campaign,
    _actionType?: string,
  ) => Promise<void>;
  askClaudeWithContext: (
    _actionType: string,
    _currentCampaign: Campaign,
  ) => Promise<void>;
  clearConversation: () => void;
  loadSession: (_sessionId: string) => void;
  deleteSession: (_sessionId: string) => void;
  createNewSession: (_campaign?: Campaign) => void;
  cancelRequest?: () => void;
}

export function useClaude(): UseClaudeResult {
  const [_isLoading, setIsLoading] = useState(false);
  const [_error, setError] = useState<string | null>(null);
  const [_response, setResponse] = useState<ClaudeResponse | null>(null);
  const [_currentSession, _setCurrentSession] =
    useState<ConversationSession | null>(null);
  const [_sessions, _setSessions] = useState<ConversationSession[]>([]);
  const [_abortController, setAbortController] =
    useState<AbortController | null>(null);

  // Load saved conversations on mount
  useEffect(() => {
    void loadSavedSessions();
  }, []);

  // Auto-save current session
  useEffect(() => {
    if (currentSession) {
      saveSession(currentSession);
    }
  }, [currentSession]);

  const loadSavedSessions = useCallback(() => {
    try {
      const saved = localStorage.getItem(CONVERSATION_STORAGE_KEY);
      if (saved) {
        const parsedSessions = JSON.parse(saved) as ConversationSession[];
        setSessions(parsedSessions);

        // Load the most recent session
        if (parsedSessions.length > 0) {
          const latest = parsedSessions.sort(
            (a, b) =>
              new Date(b.lastUpdated).getTime() -
              new Date(a.lastUpdated).getTime(),
          )[0];
          setCurrentSession(latest);
        }
      }
    } catch (error) {
      console.error("Failed to load saved conversations:", error);
    }
  }, []);

  const saveSession = useCallback(
    (session: ConversationSession) => {
      try {
        const updatedSessions = sessions.filter((s) => s.id !== session.id);
        updatedSessions.push(session);

        // Keep only last 10 sessions to prevent storage bloat
        const recentSessions = updatedSessions
          .sort(
            (a, b) =>
              new Date(b.lastUpdated).getTime() -
              new Date(a.lastUpdated).getTime(),
          )
          .slice(0, 10);

        setSessions(recentSessions);
        localStorage.setItem(
          CONVERSATION_STORAGE_KEY,
          JSON.stringify(recentSessions),
        );
      } catch (error) {
        console.error("Failed to save conversation session:", error);
      }
    },
    [sessions],
  );

  const createNewSession = useCallback((campaign?: Campaign) => {
    const newSession: ConversationSession = {
      id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      campaignId: campaign?.id,
      campaignName: campaign?.name,
      messages: [],
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    };

    setCurrentSession(newSession);
    setResponse(null);
    setError(null);

    // Save campaign context for future sessions
    if (campaign) {
      localStorage.setItem(
        LAST_CAMPAIGN_KEY,
        JSON.stringify({
          id: campaign.id,
          name: campaign.name,
        }),
      );
    }
  }, []);

  const loadSession = useCallback(
    (sessionId: string) => {
      const session = sessions.find((s) => s.id === sessionId);
      if (session) {
        setCurrentSession(session);
        setResponse(
          session.messages.length > 0
            ? {
                content:
                  session.messages[session.messages.length - 1]?.content || "",
              }
            : null,
        );
        setError(null);
      }
    },
    [sessions],
  );

  const deleteSession = useCallback(
    (sessionId: string) => {
      const updatedSessions = sessions.filter((s) => s.id !== sessionId);
      setSessions(updatedSessions);
      localStorage.setItem(
        CONVERSATION_STORAGE_KEY,
        JSON.stringify(updatedSessions),
      );

      if (currentSession?.id === sessionId) {
        if (updatedSessions.length > 0) {
          setCurrentSession(updatedSessions[0]);
        } else {
          setCurrentSession(null);
          setResponse(null);
        }
      }
    },
    [sessions, currentSession],
  );

  const askClaude = useCallback(
    async (
      prompt: string,
      currentCampaign?: Campaign,
      _actionType?: string,
    ) => {
      // Cancel any existing request
      if (abortController) {
        abortController.abort();
      }

      const newAbortController = new AbortController();
      setAbortController(newAbortController);
      setIsLoading(true);
      setError(null);

      // Create session if none exists
      let session = currentSession;
      if (!session) {
        session = {
          id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          campaignId: currentCampaign?.id,
          campaignName: currentCampaign?.name,
          messages: [],
          createdAt: new Date().toISOString(),
          lastUpdated: new Date().toISOString(),
        };
        setCurrentSession(session);
      }

      // Build context-aware prompt - safer property access
      const buildCampaignContext = (campaign: Campaign) => {
        const parts = [];
        if (campaign.name) parts.push(`- Name: ${campaign.name}`);
        if (campaign.description)
          parts.push(`- Description: ${campaign.description}`);
        if (campaign.goal)
          parts.push(`- Goal: $${campaign.goal.toLocaleString()}`);
        if (campaign.raised !== undefined)
          parts.push(`- Raised: $${campaign.raised.toLocaleString()}`);
        if (campaign.progress !== undefined)
          parts.push(`- Progress: ${campaign.progress}%`);
        if (campaign.daysLeft !== undefined)
          parts.push(`- Days Left: ${campaign.daysLeft}`);
        if (campaign.deadline) parts.push(`- Deadline: ${campaign.deadline}`);

        return parts.length > 0
          ? `\n\nCampaign Context:\n${parts.join("\n")}`
          : "";
      };

      const contextualPrompt = currentCampaign
        ? `${prompt}${buildCampaignContext(currentCampaign)}`
        : prompt;

      const userMessage: ClaudeMessage = {
        role: "user",
        content: contextualPrompt,
      };

      const updatedMessages = [...session.messages, userMessage];

      try {
        // Check if request was cancelled
        if (newAbortController.signal.aborted) {
          return;
        }

        const aiResponse = await generateClaudeConversation(updatedMessages);

        // Check again if request was cancelled
        if (newAbortController.signal.aborted) {
          return;
        }

        const assistantMessage: ClaudeMessage = {
          role: "assistant",
          content: aiResponse.content,
        };

        const finalMessages = [...updatedMessages, assistantMessage];

        const updatedSession: ConversationSession = {
          ...session,
          messages: finalMessages,
          lastUpdated: new Date().toISOString(),
        };

        setCurrentSession(updatedSession);
        setResponse(aiResponse);
      } catch (err) {
        if (newAbortController.signal.aborted) {
          return; // Request was cancelled, don't show error
        }

        if (err instanceof ClaudeServiceError) {
          setError(`${err.name}: ${err.message}`);
        } else {
          setError("An unexpected error occurred while generating content.");
        }
      } finally {
        if (!newAbortController.signal.aborted) {
          setIsLoading(false);
        }
        setAbortController(null);
      }
    },
    [currentSession, abortController],
  );

  const askClaudeWithContext = useCallback(
    async (_actionType: string, currentCampaign: Campaign) => {
      if (!currentCampaign) {
        setError("Please select a campaign first to get specific assistance.");
        return;
      }

      try {
        const prompt = getClaudePrompt(_actionType, currentCampaign);
        await askClaude(prompt, currentCampaign, _actionType);
      } catch (err) {
        console.error("Error generating Claude prompt:", err);
        setError("Failed to generate prompt for campaign context.");
      }
    },
    [askClaude],
  );

  const clearConversation = useCallback(() => {
    if (currentSession) {
      const clearedSession: ConversationSession = {
        ...currentSession,
        messages: [],
        lastUpdated: new Date().toISOString(),
      };
      setCurrentSession(clearedSession);
    }
    setResponse(null);
    setError(null);
  }, [currentSession]);

  const cancelRequest = useCallback(() => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
      setIsLoading(false);
    }
  }, [abortController]);

  return {
    isLoading,
    error,
    response,
    conversationHistory: currentSession?.messages || [],
    currentSession,
    sessions,
    askClaude,
    askClaudeWithContext,
    clearConversation,
    loadSession,
    deleteSession,
    createNewSession,
    cancelRequest,
  };
}
