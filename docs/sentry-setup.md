# Sentry Setup Guide

Phase 4 monitoring infrastructure with error tracking and 429 rate limit telemetry.

---

## Quick Setup

### 1. Create Sentry Project

1. Visit: https://sentry.io/signup/
2. Create new project:
   - **Platform:** React
   - **Project Name:** nexus-production
   - **Alert Frequency:** Real-time

### 2. Get Your DSN

After creating the project, copy the DSN from:

- **Settings** → **Client Keys (DSN)**
- Format: `https://xxx@xxx.ingest.sentry.io/xxx`

### 3. Add to Vercel Environment Variables

Go to: https://vercel.com/nexuspartners/nexus2/settings/environment-variables

Add these variables (Production + Preview + Development):

```bash
VITE_SENTRY_DSN=https://your_key@your_org.ingest.sentry.io/your_project_id
SENTRY_AUTH_TOKEN=your_auth_token_from_sentry
SENTRY_ORG=your_org_slug
SENTRY_PROJECT=nexus-production
```

**To get SENTRY_AUTH_TOKEN:**

1. Go to: https://sentry.io/settings/account/api/auth-tokens/
2. Create new token with scopes:
   - `project:releases`
   - `project:write`
   - `org:read`

### 4. Redeploy

```bash
# Trigger Vercel redeploy
git commit --allow-empty -m "Enable Sentry monitoring"
git push
```

---

## Features Enabled

### Error Tracking

Automatic capture of:

- Unhandled exceptions
- Promise rejections
- React component errors
- Network failures

**PII Protection:** Email and IP addresses are automatically stripped before sending to Sentry.

### Performance Monitoring

- 10% sample rate in production (configurable)
- Page load times
- API response times
- Component render times

### Rate Limit Telemetry

Track 429 responses from edge handlers:

```ts
import { reportRateLimitExceeded } from "@/lib/sentry";

// In your API handler
if (rateLimitExceeded) {
  reportRateLimitExceeded("/api/ai/complete", {
    limit: 10,
    window: "60s",
  });
  return Response.json({ error: "Too many requests" }, { status: 429 });
}
```

### Security Event Monitoring

Track sanitization events:

```ts
import { reportSecurityEvent } from "@/lib/sentry";

// When prompt injection is detected
if (injectionDetected) {
  reportSecurityEvent("prompt_injection", {
    patterns_matched: ["ignore previous instructions"],
  });
}
```

---

## Configuration

### Environment-Specific Settings

**Development:**

- Sentry disabled by default
- Enable by setting `VITE_SENTRY_DSN` in `.env`

**Production:**

- Enabled automatically
- 10% trace sampling
- Source maps uploaded for debugging

**Staging/Preview:**

- Full event capture
- 100% trace sampling

### PII Redaction

The following are automatically removed before sending to Sentry:

- User email addresses
- IP addresses
- Phone numbers (from breadcrumbs)
- SSN, credit cards, IBAN

**Source:** [src/lib/sentry.ts](../src/lib/sentry.ts)

---

## Usage Examples

### Manual Error Capture

```ts
import * as Sentry from "@sentry/react";

try {
  await riskyOperation();
} catch (error) {
  Sentry.captureException(error, {
    tags: { component: "brand-corpus" },
    extra: { operation: "import", source: "clipboard" },
  });
  throw error; // Re-throw or handle
}
```

### Custom Context

```ts
Sentry.setContext("brand", {
  id: brandProfile.id,
  tone: brandProfile.tone,
  // No PII - just metadata
});
```

### User Context (Non-PII)

```ts
Sentry.setUser({
  id: user.id,
  // Don't include email or other PII
  role: user.role,
  org_id: user.org_id,
});
```

---

## Monitoring Dashboard

### Key Metrics to Watch

1. **Error Rate**
   - Target: <0.1% of requests
   - Alert: Spike above 1%

2. **429 Rate Limit Events**
   - Expected: <10 per hour
   - Alert: Sustained >100 per hour

3. **Security Events**
   - Prompt injection attempts
   - XSS/HTML sanitization triggers
   - PII detection in user input

4. **Performance**
   - Page load: <2s (p75)
   - API response: <500ms (p95)
   - React render: <100ms (p99)

### Sentry Dashboard Links

- **Issues:** https://sentry.io/organizations/YOUR_ORG/issues/
- **Performance:** https://sentry.io/organizations/YOUR_ORG/performance/
- **Releases:** https://sentry.io/organizations/YOUR_ORG/releases/

---

## Integration with Edge Handlers

### Rate Limit Example

```ts
// src/edge/handlers/aiComplete.ts
import { rateLimit } from "@/edge/rateLimit";
import { reportRateLimitExceeded } from "@/lib/sentry";

export async function POST(req: Request) {
  const userId = getUserId(req);

  const { success, remaining } = await rateLimit({
    id: `ai-complete:${userId}`,
    limit: 10,
    windowMs: 60_000,
  });

  if (!success) {
    // Report to Sentry for monitoring
    reportRateLimitExceeded("/api/ai/complete", {
      user_id: userId,
      remaining,
      limit: 10,
      window_ms: 60_000,
    });

    return Response.json(
      { error: "Rate limit exceeded. Try again in 60 seconds." },
      { status: 429 },
    );
  }

  // ... handle request
}
```

### Sanitization Example

```ts
// src/services/brandService.ts
import { sanitizeHtml } from "@/privacy/sanitize";
import { reportSecurityEvent } from "@/lib/sentry";

export function importBrandContent(rawHtml: string) {
  const result = sanitizeHtml(rawHtml, { stripHtml: true });

  // Check if dangerous content was removed
  if (rawHtml.includes("<script") || rawHtml.includes("javascript:")) {
    reportSecurityEvent("xss_attempt", {
      source: "brand_import",
      blocked: true,
    });
  }

  return result;
}
```

---

## Troubleshooting

### Events Not Appearing

**Check:**

1. `VITE_SENTRY_DSN` is set in Vercel environment variables
2. DSN format: `https://key@org.ingest.sentry.io/project`
3. Environment is not `development` (Sentry disabled by default)
4. Check browser console for Sentry initialization messages

**Test manually:**

```js
// Browser console
import * as Sentry from "@sentry/react";
Sentry.captureMessage("Test event from browser");
```

### Source Maps Not Uploading

**Check:**

1. `SENTRY_AUTH_TOKEN` has correct scopes (project:releases, org:read)
2. `SENTRY_ORG` matches your organization slug
3. `SENTRY_PROJECT` matches your project name
4. Build succeeds without errors: `pnpm build`

**Manual upload:**

```bash
pnpm sentry-cli releases files v0.3.0 upload-sourcemaps dist/js --url-prefix '~/js'
```

### Too Many Events

**Reduce noise:**

```ts
// src/lib/sentry.ts
Sentry.init({
  // ... other config
  ignoreErrors: [
    // Browser extensions
    "Non-Error promise rejection captured",
    // Network issues (expected)
    "NetworkError",
    "Failed to fetch",
  ],
  beforeSend(event) {
    // Filter out specific errors
    if (event.exception?.values?.[0]?.value?.includes("AbortError")) {
      return null; // Don't send
    }
    return event;
  },
});
```

---

## Cost Estimates

**Sentry Pricing (Team Plan - $26/month):**

- 50,000 errors/month included
- 100GB performance data included
- 50 session replays included

**Expected Usage (1,000 MAU):**

- Errors: ~5,000/month (0.5% error rate)
- Performance: ~50GB/month (100 page views/user)
- Rate Limit Events: ~1,000/month (1 per user avg)

**Recommendation:** Start with Developer plan (free), upgrade to Team if you exceed limits.

---

## Next Steps

After Sentry is live:

1. **Set up alerts** in Sentry dashboard:
   - Error spike (>10 errors in 5 minutes)
   - High error rate (>1% of requests)
   - Rate limit abuse (>100 429s in 1 hour)

2. **Create release tracking**:

   ```bash
   # In CI/CD
   pnpm sentry-cli releases new v0.3.0
   pnpm sentry-cli releases set-commits v0.3.0 --auto
   ```

3. **Connect to Slack** for real-time alerts:
   - Sentry → Settings → Integrations → Slack

4. **Review weekly digest** of top errors and performance regressions

---

## References

- **Sentry Docs:** https://docs.sentry.io/platforms/javascript/guides/react/
- **Configuration:** [src/lib/sentry.ts](../src/lib/sentry.ts)
- **Vite Plugin:** [vite.config.ts](../vite.config.ts)
- **Security Model:** [security.md](./security.md)
