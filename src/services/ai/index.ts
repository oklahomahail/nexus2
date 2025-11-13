// src/services/ai/index.ts
// Aggregate exports for AI services

// ============================================================================
// PRIVACY-FIRST AI SERVICE (RECOMMENDED)
// ============================================================================
// All new code should use privacyAwareClaudeService
// Routes through AI Privacy Gateway for PII scrubbing and validation

export {
  callClaudeSafely,
  generateCampaignContent,
  generateAnalyticsSummary,
  generateSimple,
  hasDirectApiKey,
  warnDirectApiUsage,
  type PrivacyAwareClaudeRequest,
  type PrivacyAwareClaudeResponse,
  type AICategory,
} from "./privacyAwareClaudeService";

// ============================================================================
// LEGACY DIRECT API SERVICE (DEPRECATED)
// ============================================================================
// WARNING: These bypass PII scrubbing! Use only for development/testing
// All production code should migrate to privacyAwareClaudeService

export {
  generateResponse,
  callClaude,
  streamClaude,
  setApiKey,
  getApiKey,
  clearApiKey,
  type ClaudeRequest,
  type ClaudeResponse,
  type ClaudeCallOptions,
} from "./claudeService";
