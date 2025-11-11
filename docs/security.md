# Security Model & Guardrails

## Overview

Phase 3 shipped content sanitization, PII redaction, cancellable tasks, and Edge rate limiting. This document codifies the security model, required checks, and operational guardrails.

---

## Threat Model (high level)

- **Input vectors:** user HTML/Markdown, pasted text, uploaded content, URL fetches.
- **Primary risks:** XSS-in-content, prompt injection, PII leakage, request abuse (DoS), CSRF, broken object access (multi-tenant orgs).
- **Mitigations:** HTML stripping + URL/CSS sanitization, PII redaction, prompt neutralization, token budgeting, per-IP/user rate limiting, RLS policies.

---

## Content Safety Pipeline

1. **HTML → Plain Text** via `sanitizeHtml(input, { stripHtml: true })`.
2. **PII Redaction** (email, phones, SSN, CC, IBAN).
3. **Prompt-Injection Neutralization** (known jailbreak phrasing redacted).
4. **Normalize** with token budget (~4 chars/token heuristic) to bound LLM context.

**Required:** Always sanitize before persistence or sending to LLMs.

```ts
const safe = sanitizeHtml(raw, { stripHtml: true });
const prompt = normalizeText(safe, { tokenBudget: 8000 });
```

---

## Edge Security

- **Rate Limiting:** `rateLimit({ id, limit, windowMs, get, set })` with KV adapter (Vercel/Cloudflare/Redis/Memory).
- **Typed Errors:** `HttpError` + `errorResponse` for safe responses.
- **CORS:** lock to prod origins; disallow credentials by default.

```ts
// src/edge/cors.ts
export function corsHeaders(origin: string) {
  const allow =
    /^(https:\/\/app\.leadwithnexus\.com|http:\/\/localhost:\d{4})$/.test(
      origin || "",
    )
      ? origin
      : "https://app.leadwithnexus.com";
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "content-type, authorization",
  } as const;
}
```

---

## HTTP Security Headers (Next.js)

Add in `next.config.js`:

```ts
const secHeaders = [
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'strict-dynamic'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' https:",
      "connect-src 'self' https://*.supabase.co https://api.openai.com https://api.anthropic.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
];

module.exports = {
  async headers() {
    return [{ source: "/(.*)", headers: secHeaders }];
  },
};
```

> If inline scripts become necessary, move to nonce-based CSP in middleware.

---

## Supabase RLS (multi-tenant pattern)

Enable RLS and keep writes server-side via service key:

```sql
alter table public.donations enable row level security;
create policy "donations_select_same_org"
  on public.donations
  for select to authenticated
  using (org_id::text = auth.jwt() ->> 'org_id');

revoke insert on public.donations from authenticated; -- service role inserts only
```

Apply similar policies to other tenant-scoped tables.

---

## Monitoring & Incident Response

- **Sentry:** capture client + server errors, tag with org/user (non-PII).
- **429 telemetry:** count RL rejections to tune limits.
- **Rollback:** `vercel revert nexuspartners/nexus2 production`.

---

## Test Expectations

- **Sanitize matrix:** must pass; allow explicitly-documented edge cases only.
- **useTask:** cancel path and no unhandled rejections.
- **Edge:** deterministic RL tests with memory KV and injected clock.

---

## References

- **Sanitization:** [src/privacy/sanitize.ts](../src/privacy/sanitize.ts)
- **Rate Limiting:** [src/edge/rateLimit.ts](../src/edge/rateLimit.ts)
- **Test Infrastructure:** [src/test/setup.ts](../src/test/setup.ts)
- **Phase 3 Complete:** [PHASE3_COMPLETE.md](../PHASE3_COMPLETE.md)
