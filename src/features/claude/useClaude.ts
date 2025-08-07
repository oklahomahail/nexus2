import { useState, useCallback } from 'react';
import {
  generateClaudeConversation,
  ClaudeServiceError,
  ClaudeMessage,
  ClaudeResponse
} from './claudeService';
import { Campaign } from '@/models/campaign';

interface UseClaudeResult {
  isLoading: boolean;
  error: string | null;
  response: ClaudeResponse | null;
  conversationHistory: ClaudeMessage[];
  askClaude: (prompt: string, currentCampaign?: Campaign) => Promise<void>;
  clearConversation: () => void;
}

export function useClaude(): UseClaudeResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<ClaudeResponse | null>(null);
  const [conversationHistory, setConversationHistory] = useState<ClaudeMessage[]>([]);

  const askClaude = useCallback(
    async (prompt: string, currentCampaign?: Campaign) => {
      setIsLoading(true);
      setError(null);

      const userMessage: ClaudeMessage = {
        role: 'user',
        content: currentCampaign
          ? `${prompt}\n\n(Campaign context: ${currentCampaign.name} - ${currentCampaign.description})`
          : prompt
      };

      const updatedHistory = [...conversationHistory, userMessage];

      try {
        const aiResponse = await generateClaudeConversation(updatedHistory);
        const assistantMessage: ClaudeMessage = {
          role: 'assistant',
          content: aiResponse.content
        };

        setConversationHistory([...updatedHistory, assistantMessage]);
        setResponse(aiResponse);
      } catch (err) {
        if (err instanceof ClaudeServiceError) {
          setError(`${err.name}: ${err.message}`);
        } else {
          setError('An unknown error occurred.');
        }
      } finally {
        setIsLoading(false);
      }
    },
    [conversationHistory]
  );

  const clearConversation = useCallback(() => {
    setConversationHistory([]);
    setResponse(null);
    setError(null);
  }, []);

  return {
    isLoading,
    error,
    response,
    conversationHistory,
    askClaude,
    clearConversation
  };
}
