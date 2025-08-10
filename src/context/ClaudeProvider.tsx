import React, { createContext, useContext, useState, ReactNode } from 'react';
import { generateClaudeResponse, ClaudeResponse, ClaudeRequest } from '@/features/claude/claudeService';

interface ClaudeContextType {
  isLoading: boolean;
  lastResponse: ClaudeResponse | null;
  error: string | null;
  generateResponse: (request: ClaudeRequest) => Promise<ClaudeResponse>;
  clearError: () => void;
}

const ClaudeContext = createContext<ClaudeContextType | undefined>(undefined);

interface ClaudeProviderProps {
  children: ReactNode;
}

export function ClaudeProvider({ children }: ClaudeProviderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [lastResponse, setLastResponse] = useState<ClaudeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateResponse = async (request: ClaudeRequest): Promise<ClaudeResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await generateClaudeResponse(
        request.context?.action || 'general',
        JSON.stringify(request.context || {}),
        request
      );
      setLastResponse(response);
      
      if (!response.success && response.error) {
        setError(response.error);
      }
      
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      
      const failureResponse: ClaudeResponse = {
        content: '',
        success: false,
        error: errorMessage
      };
      
      setLastResponse(failureResponse);
      return failureResponse;
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value: ClaudeContextType = {
    isLoading,
    lastResponse,
    error,
    generateResponse,
    clearError
  };

  return (
    <ClaudeContext.Provider value={value}>
      {children}
    </ClaudeContext.Provider>
  );
}

export function useClaude(): ClaudeContextType {
  const context = useContext(ClaudeContext);
  if (context === undefined) {
    throw new Error('useClaude must be used within a ClaudeProvider');
  }
  return context;
}