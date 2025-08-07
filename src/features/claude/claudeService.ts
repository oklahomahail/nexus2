const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';

export interface ClaudeResponse {
  content: string;
  usage?: {
    input_tokens: number;
    output_tokens: number;
  };
}

export interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ClaudeRequestOptions {
  model?: string;
  max_tokens?: number;
  temperature?: number;
  system?: string;
}

export class ClaudeServiceError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ClaudeServiceError';
  }
}

/**
 * Generate a response from Claude AI
 * @param prompt - The user prompt to send to Claude
 * @param options - Optional configuration for the request
 * @returns Promise<ClaudeResponse>
 */
export async function generateClaudeResponse(
  prompt: string,
  options: ClaudeRequestOptions = {}
): Promise<ClaudeResponse> {
  const apiKey = import.meta.env.VITE_CLAUDE_API_KEY;

  if (!apiKey) {
    throw new ClaudeServiceError(
      'Claude API key is missing. Make sure VITE_CLAUDE_API_KEY is set in your environment variables.',
      0,
      'MISSING_API_KEY'
    );
  }

  if (!prompt.trim()) {
    throw new ClaudeServiceError('Prompt cannot be empty', 0, 'EMPTY_PROMPT');
  }

  const {
    model = 'claude-sonnet-4-20250514',
    max_tokens = 1024,
    temperature = 0.7,
    system
  } = options;

  const requestBody = {
    model,
    max_tokens,
    temperature,
    messages: [
      {
        role: 'user' as const,
        content: prompt,
      },
    ],
    ...(system && { system }),
  };

  try {
    const response = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      let errorCode = 'HTTP_ERROR';

      try {
        const errorData = await response.json();
        if (errorData.error) {
          errorMessage = errorData.error.message || errorMessage;
          errorCode = errorData.error.type || errorCode;
        }
      } catch {
        // If we can't parse the error response, use the default message
      }

      throw new ClaudeServiceError(errorMessage, response.status, errorCode);
    }

    const data = await response.json();

    if (!data.content || !Array.isArray(data.content) || data.content.length === 0) {
      throw new ClaudeServiceError('Invalid response format from Claude API', 0, 'INVALID_RESPONSE');
    }

    const textContent = data.content.find((item: any) => item.type === 'text');
    if (!textContent) {
      throw new ClaudeServiceError('No text content found in Claude response', 0, 'NO_TEXT_CONTENT');
    }

    return {
      content: textContent.text || '',
      usage: data.usage,
    };
  } catch (error) {
    if (error instanceof ClaudeServiceError) {
      throw error;
    }

    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new ClaudeServiceError(
        'Network error: Unable to connect to Claude API. Please check your internet connection.',
        0,
        'NETWORK_ERROR'
      );
    }

    throw new ClaudeServiceError(
      `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`,
      0,
      'UNKNOWN_ERROR'
    );
  }
}

/**
 * Generate a response from Claude AI with conversation history
 * @param messages - Array of conversation messages
 * @param options - Optional configuration for the request
 * @returns Promise<ClaudeResponse>
 */
export async function generateClaudeConversation(
  messages: ClaudeMessage[],
  options: ClaudeRequestOptions = {}
): Promise<ClaudeResponse> {
  const apiKey = import.meta.env.VITE_CLAUDE_API_KEY;

  if (!apiKey) {
    throw new ClaudeServiceError(
      'Claude API key is missing. Make sure VITE_CLAUDE_API_KEY is set in your environment variables.',
      0,
      'MISSING_API_KEY'
    );
  }

  if (!messages.length) {
    throw new ClaudeServiceError('Messages array cannot be empty', 0, 'EMPTY_MESSAGES');
  }

  const {
    model = 'claude-sonnet-4-20250514',
    max_tokens = 1024,
    temperature = 0.7,
    system
  } = options;

  const requestBody = {
    model,
    max_tokens,
    temperature,
    messages,
    ...(system && { system }),
  };

  try {
    const response = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      let errorCode = 'HTTP_ERROR';

      try {
        const errorData = await response.json();
        if (errorData.error) {
          errorMessage = errorData.error.message || errorMessage;
          errorCode = errorData.error.type || errorCode;
        }
      } catch {
        // If we can't parse the error response, use the default message
      }

      throw new ClaudeServiceError(errorMessage, response.status, errorCode);
    }

    const data = await response.json();

    if (!data.content || !Array.isArray(data.content) || data.content.length === 0) {
      throw new ClaudeServiceError('Invalid response format from Claude API', 0, 'INVALID_RESPONSE');
    }

    const textContent = data.content.find((item: any) => item.type === 'text');
    if (!textContent) {
      throw new ClaudeServiceError('No text content found in Claude response', 0, 'NO_TEXT_CONTENT');
    }

    return {
      content: textContent.text || '',
      usage: data.usage,
    };
  } catch (error) {
    if (error instanceof ClaudeServiceError) {
      throw error;
    }

    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new ClaudeServiceError(
        'Network error: Unable to connect to Claude API. Please check your internet connection.',
        0,
        'NETWORK_ERROR'
      );
    }

    throw new ClaudeServiceError(
      `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`,
      0,
      'UNKNOWN_ERROR'
    );
  }
}

/**
 * Helper function to create fundraising-specific prompts
 */
export const FundraisingPrompts = {
  email: (context: string) => 
    `Write a compelling fundraising email for the following campaign. Make it personal, urgent, and include a clear call-to-action:\n\n${context}`,
  
  subjectLines: (context: string) => 
    `Write 5 different subject lines for a fundraising email. Make them attention-grabbing and varied in approach (urgency, curiosity, benefit-focused, etc.):\n\n${context}`,
  
  socialPost: (context: string, platform: 'facebook' | 'twitter' | 'instagram' | 'linkedin' = 'facebook') => 
    `Write a ${platform} post for this fundraising campaign. Keep it engaging and appropriate for the platform's audience:\n\n${context}`,
  
  ctaButtons: (context: string) => 
    `Write 5 different call-to-action button texts for this fundraising campaign. Make them action-oriented and compelling:\n\n${context}`,
  
  donorThankYou: (context: string, donorName?: string) => 
    `Write a heartfelt thank you message for a donor${donorName ? ` named ${donorName}` : ''}. Make it personal and show the impact of their gift:\n\n${context}`,
  
  campaignUpdate: (context: string) => 
    `Write a campaign progress update for donors and supporters. Include achievements, current status, and what's still needed:\n\n${context}`
};

export default {
  generateClaudeResponse,
  generateClaudeConversation,
  FundraisingPrompts,
  ClaudeServiceError,
};