# Pull Request

## Summary

<!-- Explain the change and user impact -->

## Screenshots / Demos

<!-- Attach gifs for UI flows, or write "N/A" if not applicable -->

---

## Security & Safety Checklist

- [ ] Sanitization before _any_ persistence or AI call
- [ ] PII redaction verified (emails/phones/SSN/CC/IBAN)
- [ ] Prompt-injection phrases neutralized
- [ ] Token budget enforced on prompts/inputs
- [ ] `useTask` cancel path covered by a test
- [ ] Edge route guarded by `rateLimit` + typed errors
- [ ] CORS restricted to allowed origins
- [ ] CSP/HSTS headers unchanged or tightened
- [ ] Supabase RLS policies in place for new/changed tables
- [ ] No secrets in logs; sensitive fields masked

---

## Testing

- [ ] Updated/added tests
- [ ] MSW handlers updated for new endpoints
- [ ] `pnpm vitest run` green locally
- [ ] `pnpm lint` passes
- [ ] `pnpm typecheck:app` passes

---

## Rollout

- [ ] ENV changes documented
- [ ] Feature flags (if any) declared
- [ ] Monitoring dashboards updated (Sentry/429s)
- [ ] Rollback plan documented (if high risk)

---

## Related Issues

<!-- Link to related issues, e.g., "Closes #123" -->
