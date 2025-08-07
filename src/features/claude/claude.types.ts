// src/features/claude/claude.types.ts

export type ClaudeActionType =
  | 'subject'
  | 'email'
  | 'strategy'
  | 'feedback'
  | 'cta';

export interface ClaudeMessage {
  role: 'user' | 'claude';
  content: string;
}

export interface ClaudeResponse {
  content: string;
  usage?: {
    input_tokens: number;
    output_tokens: number;
  };
}
