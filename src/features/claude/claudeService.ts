// src/features/claude/claudeService.ts - Secure version using backend API

export interface ClaudeResponse {
  content: string;
  usage?: {
    input_tokens: number;
    output_tokens: number;
  };
  messageType?: string;
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

// Get API base URL from environment or default to localhost
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

/**
 * Generate a response from Claude AI via secure backend
 * @param prompt - The user prompt to send to Claude
 * @param context - Optional campaign or additional context
 * @param messageType - Type of message being generated
 * @param options - Optional configuration for the request
 * @returns Promise<ClaudeResponse>
 */
export async function generateClaudeResponse(
  prompt: string,
  context?: string,
  messageType?: string,
  options: ClaudeRequestOptions = {}
): Promise<ClaudeResponse> {
  if (!prompt.trim()) {
    throw new ClaudeServiceError('Prompt cannot be empty', 0, 'EMPTY_PROMPT');
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/claude/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add any auth headers if your app requires authentication
        // 'Authorization': `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify({
        prompt,
        context,
        messageType,
        options,
      }),
    });

    if (!response.ok) {
      let errorMessage = `Request failed: ${response.status}`;
      let errorCode = 'HTTP_ERROR';

      try {
        const errorData = await response.json();
        if (errorData.error) {
          errorMessage = errorData.message || errorData.error;
          errorCode = errorData.code || errorCode;
        }
      } catch {
        // If we can't parse the error response, use the default message
      }

      throw new ClaudeServiceError(errorMessage, response.status, errorCode);
    }

    const data = await response.json();

    if (!data.content) {
      throw new ClaudeServiceError('No content received from AI service', 0, 'NO_CONTENT');
    }

    return {
      content: data.content,
      usage: data.usage,
      messageType: data.messageType,
    };
  } catch (error) {
    if (error instanceof ClaudeServiceError) {
      throw error;
    }

    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new ClaudeServiceError(
        'Network error: Unable to connect to AI service. Please check your internet connection.',
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
 * Generate a response from Claude AI with conversation history via secure backend
 * @param messages - Array of conversation messages
 * @param options - Optional configuration for the request
 * @returns Promise<ClaudeResponse>
 */
export async function generateClaudeConversation(
  messages: ClaudeMessage[],
  options: ClaudeRequestOptions = {}
): Promise<ClaudeResponse> {
  if (!messages.length) {
    throw new ClaudeServiceError('Messages array cannot be empty', 0, 'EMPTY_MESSAGES');
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/claude/conversation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add any auth headers if your app requires authentication
        // 'Authorization': `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify({
        messages,
        options,
      }),
    });

    if (!response.ok) {
      let errorMessage = `Request failed: ${response.status}`;
      let errorCode = 'HTTP_ERROR';

      try {
        const errorData = await response.json();
        if (errorData.error) {
          errorMessage = errorData.message || errorData.error;
          errorCode = errorData.code || errorCode;
        }
      } catch {
        // Use default message
      }

      throw new ClaudeServiceError(errorMessage, response.status, errorCode);
    }

    const data = await response.json();

    if (!data.content) {
      throw new ClaudeServiceError('No content received from AI service', 0, 'NO_CONTENT');
    }

    return {
      content: data.content,
      usage: data.usage,
    };
  } catch (error) {
    if (error instanceof ClaudeServiceError) {
      throw error;
    }

    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new ClaudeServiceError(
        'Network error: Unable to connect to AI service. Please check your internet connection.',
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
 * Enhanced fundraising-specific prompts with campaign context
 */
export const FundraisingPrompts = {
  email: (context: string, campaign?: any) => {
    const campaignInfo = campaign ? `
Campaign: ${campaign.name}
Goal: $${campaign.goal?.toLocaleString()}
Progress: ${campaign.progress}% (${campaign.daysLeft} days remaining)
Raised: $${campaign.raised?.toLocaleString()}
    ` : '';
    
    return `Write a compelling fundraising email for the following campaign. Make it personal, urgent, and include a clear call-to-action:

${campaignInfo}

Campaign Details:
${context}

Focus on:
- Personal connection with the reader
- Emotional story or impact
- Specific ask amount or action
- Deadline urgency (if applicable)
- Clear next steps`;
  },
  
  subjectLines: (context: string, campaign?: any) => {
    const urgency = campaign?.daysLeft <= 7 ? ' (URGENT - Final week!)' : '';
    return `Write 5 different subject lines for a fundraising email${urgency}. Make them attention-grabbing and varied in approach (urgency, curiosity, benefit-focused, personal, etc.):

Campaign: ${campaign?.name || 'Fundraising Campaign'}
Context: ${context}

Include a mix of:
- Urgency-based subject lines
- Curiosity-driven subject lines  
- Benefit/impact-focused subject lines
- Personal/emotional subject lines
- Question-based subject lines`;
  },
  
  socialPost: (context: string, platform: 'facebook' | 'twitter' | 'instagram' | 'linkedin' = 'facebook', campaign?: any) => {
    const platformLimits = {
      twitter: '(Keep under 280 characters)',
      instagram: '(Include hashtag suggestions)',
      linkedin: '(Professional tone)',
      facebook: '(Engaging and shareable)'
    };
    
    return `Write a ${platform} post for this fundraising campaign ${platformLimits[platform]}:

${campaign ? `Campaign: ${campaign.name} (${campaign.progress}% funded, ${campaign.daysLeft} days left)` : ''}

Details: ${context}

Make it:
- Platform-appropriate for ${platform}
- Engaging and action-oriented
- Include relevant hashtags (if applicable)
- Clear call-to-action`;
  },
  
  ctaButtons: (context: string, campaign?: any) => 
    `Write 5 different call-to-action button texts for this fundraising campaign:

Campaign: ${campaign?.name || 'Campaign'}
${campaign ? `Progress: ${campaign.progress}% of $${campaign.goal?.toLocaleString()} goal` : ''}

Context: ${context}

Make them:
- Short (2-4 words max)
- Action-oriented and urgent
- Emotionally compelling
- Varied in approach (direct ask, impact-focused, urgency-driven, etc.)`,
  
  strategy: (context: string, campaign?: any) => {
    const timeframe = campaign?.daysLeft ? `${campaign.daysLeft} days remaining` : '2-week period';
    return `Create a comprehensive fundraising strategy for the following campaign (${timeframe}):

Campaign Overview:
${campaign ? `
- Name: ${campaign.name}
- Goal: $${campaign.goal?.toLocaleString()}
- Current: $${campaign.raised?.toLocaleString()} (${campaign.progress}%)
- Contacts: ${campaign.contactCount || 'Unknown'} in database
- Days Left: ${campaign.daysLeft}
` : ''}

Context: ${context}

Provide:
1. **Week-by-week action plan** with specific tactics
2. **Donor segmentation strategy** (major gifts, mid-level, grassroots)
3. **Communication schedule** (emails, calls, social media)
4. **Content calendar** with themes and messages
5. **Metrics to track** and success indicators
6. **Contingency plans** if behind schedule

Be specific and actionable.`;
  }
};

export default {
  generateClaudeResponse,
  generateClaudeConversation,
  FundraisingPrompts,
  ClaudeServiceError,
};