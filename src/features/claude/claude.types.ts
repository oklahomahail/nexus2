// src/features/claude/claude.types.ts

export type ClaudeActionType =
  | "subject"
  | "email"
  | "strategy"
  | "feedback"
  | "cta";

// Removed ClaudeMessage - it's defined in useClaude.ts
// If you need it here, import it: import { ClaudeMessage } from './useClaude';

export interface ClaudeResponse {
  content: string;
  usage?: {
    input_tokens: number;
    output_tokens: number;
  };
}
