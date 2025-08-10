// src/services/ai/claudeService.ts
// Single source of truth for Claude API calls, key storage, and streaming

import CryptoJS from "crypto-js";

// -------- Types

export type ClaudeModel =
  | "claude-3-7-sonnet-latest"
  | "claude-3-5-sonnet-20241022"
  | "claude-3-5-haiku-20241022";

export interface ClaudeCallOptions {
  model?: ClaudeModel;
  system?: string;
  maxTokens?: number;
  temperature?: number;
  // Opaque context bag passed from UI if needed
  context?: Record<string, unknown>;
}

export interface ClaudeToolResponse {
  text: string;
  usage?: { inputTokens?: number; outputTokens?: number };
  raw?: unknown;
}

export interface ClaudeMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

// -------- Constants

const API_URL = "https://api.anthropic.com/v1/messages"; // change if you proxy
const MESSAGE_LIMIT = 50;

// Local encrypted key storage
const API_KEY_STORAGE = "claude_api_key_encrypted";
const ENCRYPTION_KEY = "nexus_claude_key"; // optionally move to env

// Simple rate-limit bookkeeping
const RATE_LIMIT_KEY = "claude_rate_limit";

// -------- Errors

export function createError(
  message: string,
  code: string = "unknown",
  retriable = false,
) {
  const err = new Error(message) as Error & {
    code?: string;
    retriable?: boolean;
  };
  err.code = code;
  err.retriable = retriable;
  return err;
}

async function handleApiError(res: Response): Promise<never> {
  const text = await res.text().catch(() => "");
  throw createError(
    `Claude error ${res.status}: ${text || res.statusText}`,
    "api_error",
    res.status >= 500,
  );
}

// -------- API key helpers (AES via crypto-js)

export function setApiKey(plainKey: string) {
  const enc = CryptoJS.AES.encrypt(plainKey, ENCRYPTION_KEY).toString();
  localStorage.setItem(API_KEY_STORAGE, enc);
}

export function getApiKey(): string | null {
  const enc = localStorage.getItem(API_KEY_STORAGE);
  if (!enc) return null;
  try {
    const bytes = CryptoJS.AES.decrypt(enc, ENCRYPTION_KEY);
    const dec = bytes.toString(CryptoJS.enc.Utf8);
    return dec || null;
  } catch {
    return null;
  }
}

export function clearApiKey() {
  localStorage.removeItem(API_KEY_STORAGE);
}

function getApiKeyOrThrow(): string {
  const key = getApiKey() || (import.meta as any).env?.VITE_CLAUDE_API_KEY;
  if (!key) throw createError("Missing Claude API key", "missing_api_key");
  return key as string;
}

// -------- Rate-limit helpers

function readRateLimit(): { last?: number; count?: number } {
  try {
    return JSON.parse(localStorage.getItem(RATE_LIMIT_KEY) || "{}");
  } catch {
    return {};
  }
}

function updateRateLimit() {
  try {
    const now = Date.now();
    const data = readRateLimit();
    const count = (data.count ?? 0) + 1;
    localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify({ last: now, count }));
  } catch {
    // noop
  }
}

// -------- Prompt and message utilities

function defaultSystem(): string {
  return [
    "You are a helpful writing assistant.",
    "Follow the Track15 style guide: no em dashes; use en dashes; clear, human, relational voice; position donors as compassionate problem-solvers; avoid hero language; keep copy concise and concrete.",
  ].join(" ");
}

function buildMessages(prompt: string) {
  return [{ role: "user", content: prompt }];
}

export function generateMessageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

// Optional in-memory transcript (handy for a panel)
const session: ClaudeMessage[] = [];
export function pushMessage(role: "user" | "assistant", content: string) {
  session.push({
    id: generateMessageId(),
    role,
    content,
    timestamp: new Date(),
  });
  if (session.length > MESSAGE_LIMIT) session.shift();
}
export function getSession(): readonly ClaudeMessage[] {
  return session;
}

// -------- Public API – non-streaming

export async function callClaude(
  prompt: string,
  opts: ClaudeCallOptions = {},
): Promise<ClaudeToolResponse> {
  const apiKey = getApiKeyOrThrow();

  const body = {
    model: opts.model ?? ("claude-3-7-sonnet-latest" as ClaudeModel),
    system: opts.system ?? defaultSystem(),
    max_tokens: opts.maxTokens ?? 800,
    temperature: opts.temperature ?? 0.7,
    messages: buildMessages(prompt),
  };

  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) await handleApiError(res);

  const json = (await res.json()) as any;
  updateRateLimit();

  const text =
    json?.content?.[0]?.text ?? json?.content?.[0]?.content?.[0]?.text ?? "";

  return {
    text,
    usage: {
      inputTokens: json?.usage?.input_tokens,
      outputTokens: json?.usage?.output_tokens,
    },
    raw: json,
  };
}

// -------- Public API – streaming

export async function streamClaude(
  prompt: string,
  opts: ClaudeCallOptions & {
    onToken: (t: string) => void;
    onDone?: (full: string) => void;
    onError?: (err: unknown) => void;
  },
) {
  const apiKey = getApiKeyOrThrow();

  const body = {
    model: opts.model ?? ("claude-3-7-sonnet-latest" as ClaudeModel),
    system: opts.system ?? defaultSystem(),
    max_tokens: opts.maxTokens ?? 800,
    temperature: opts.temperature ?? 0.7,
    messages: buildMessages(prompt),
    stream: true,
  };

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
        accept: "text/event-stream",
      } as any,
      body: JSON.stringify(body),
    });

    if (!res.ok) await handleApiError(res);
    if (!res.body)
      throw createError("Claude stream returned no body", "empty_body");

    const reader = res.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let full = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });

      for (const line of chunk.split("\n")) {
        const s = line.trim();
        if (!s.startsWith("data:")) continue;

        const payload = s.slice(5).trim();
        if (!payload || payload === "[DONE]") continue;

        try {
          const evt = JSON.parse(payload);
          // Anthropic SSE shapes vary by event type
          const delta = evt?.delta ?? evt?.content_block_delta?.delta;
          const textPart =
            delta?.text ?? evt?.message?.content?.[0]?.text ?? "";

          if (textPart) {
            full += textPart;
            opts.onToken(textPart);
          }
        } catch {
          // ignore malformed lines
        }
      }
    }

    opts.onDone?.(full);
    updateRateLimit();
    return full;
  } catch (err) {
    opts.onError?.(err);
    throw err;
  }
}
