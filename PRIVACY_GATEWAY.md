# Privacy Gateway & E2EE Posture

## Overview

Nexus implements a **Privacy Gateway** that ensures zero PII (Personally Identifiable Information) ever reaches AI services. This document describes the architecture, implementation, and usage of the privacy protection system.

## 🔒 What We Protect

### PII Sources

- **Donors**: name, email, phone, address
- **Donations**: free-text notes, memos
- **CRM Imports**: all contact fields

### AI Contexts

- **Campaign Designer**: brand identity + campaign parameters
- **Donor Intelligence**: anonymized aggregates only (N ≥ 50)

### Protection Rule

**Only brand data and aggregates may reach AI. Zero donor-level records, zero free text from donors.**

---

## 🛡️ Security Architecture

### 1. Privacy Gateway (Edge Function)

All AI requests **MUST** pass through [`ai-privacy-gateway`](supabase/functions/ai-privacy-gateway/index.ts).

**Location**: `supabase/functions/ai-privacy-gateway/index.ts`

#### Enforces:

1. **JWT Authentication**: Verifies user identity
2. **Client Access Check**: Ensures user has access to the client
3. **Allowlist-Only Fields**: Drops any field not in category-specific allowlist
4. **PII Detection**: Regex-based scanning for emails, phones, addresses, SSNs
5. **Privacy Threshold**: Blocks analytics if cohort size < 50
6. **No Request Logging**: Never logs request bodies

#### Categories:

- **`campaign`**: Brand identity + campaign params (no donor data)
- **`analytics`**: Aggregated metrics only (no donor rows)

#### Metrics Tracked:

```typescript
{
  total_requests: number;
  blocked_pii: number;
  blocked_privacy_threshold: number;
  blocked_invalid: number;
  allowed: number;
}
```

---

### 2. Privacy Scrubber

**Client-side**: [`src/privacy/scrub.ts`](src/privacy/scrub.ts)
**Server-side**: [`supabase/functions/_shared/scrub.ts`](supabase/functions/_shared/scrub.ts)

#### Functions:

**`allowlistObject(obj, category)`**

- Walks object and keeps **only** allowed fields
- Drops arrays/objects not in allowlist
- Returns filtered payload

**`containsPII(string)`**

- Regex detection for:
  - Email addresses
  - Phone numbers
  - Street addresses
  - SSNs
  - Credit card numbers

**`deepContainsPII(obj)`**

- Recursively scans objects/arrays
- Returns `true` if any PII patterns found

**`validateAIPayload(payload, category)`**

- Applies allowlist
- Scans for PII
- Returns `{ safe: true, payload }` or `{ safe: false, reason }`

#### Allowlists:

**Campaign**:

```typescript
[
  "profile.name",
  "profile.mission_statement",
  "profile.tone_of_voice",
  "profile.brand_personality",
  "profile.style_keywords",
  "profile.primary_colors",
  "profile.typography",
  "snippets[].title",
  "snippets[].content",
  "params.name",
  "params.type",
  "params.season",
  "params.audience",
  "params.goal",
  "params.tone",
  "params.channels",
  "params.durationWeeks",
  "postage",
  "postage.unit",
  "postage.total",
  "postage.quantity",
  "postage.mailClass",
  "postage.savings",
  "system",
  "turns",
  "turns[].role",
  "turns[].content",
];
```

**Analytics**:

```typescript
[
  "metric",
  "data",
  "data[].consecutive_years",
  "data[].donor_count",
  "data[].year",
  "data[].quarter",
  "data[].month",
  "data[].gift_count",
  "data[].total_amount",
  "data[].avg_amount",
  "data[].median_gift",
  "data[].recency_bucket",
  "data[].pct_change",
  "data[].amount_from",
  "data[].amount_to",
  "data[].median_days_between",
  "result",
  "summary",
  "summary_only",
];
```

---

### 3. SQL-Side Hardening

#### Cohort Threshold (Already Enforced)

All analytics functions enforce **N ≥ 50** via `enforce_privacy_ok()`:

- `fn_retained_donor_counts()`
- `fn_yoy_upgrade_leaderboard()`
- `fn_gift_velocity()`
- `fn_seasonality_by_quarter()`

#### AI-Safe Views

**Migration**: [`20250110000006_ai_safe_views.sql`](supabase/migrations/20250110000006_ai_safe_views.sql)

Views that expose **only** non-PII data:

- `ai_safe_brand_context`: Brand profiles (no URLs, no assets)
- `ai_safe_brand_corpus`: Public-facing brand voice examples
- `ai_safe_client_giving_summary`: Client-level aggregates (no donors)
- `ai_safe_campaign_summary`: Campaign performance (no donor PII)

#### Validation Function

```sql
SELECT * FROM validate_ai_safe_view('ai_safe_brand_context');
```

Checks if view columns contain PII-like names.

---

## 📋 Usage

### Campaign Designer

**Before** (direct AI call):

```typescript
const { data } = await supabase.functions.invoke("campaign-designer", {
  body: { system, turns, params },
});
```

**After** (via privacy gateway):

```typescript
const { data } = await supabase.functions.invoke("ai-privacy-gateway", {
  body: {
    category: "campaign",
    payload: { system, turns, profile, snippets, params, postage },
  },
});
```

### Donor Intelligence

**Example** (analytics narrative):

```typescript
const { data } = await supabase.functions.invoke("ai-privacy-gateway", {
  body: {
    category: "analytics",
    payload: {
      metric: "retained_donors",
      data: aggregatedData,
      summary_only: true,
    },
  },
});
```

**Hook**: [`useClaudeAnalysis`](src/hooks/useClaudeAnalysis.ts)

```typescript
const { narrative, generateNarrative } = useClaudeAnalysis();
await generateNarrative("retained_donors", data);
```

---

## 🧪 Testing

### Unit Tests (Recommended)

**Test PII Detection**:

```typescript
import { containsPII, deepContainsPII } from "@/privacy/scrub";

test("detects email addresses", () => {
  expect(containsPII("Contact: john.doe@example.com")).toBe(true);
});

test("detects phone numbers", () => {
  expect(containsPII("Call me at 555-123-4567")).toBe(true);
});

test("detects addresses", () => {
  expect(containsPII("123 Main Street, Anytown")).toBe(true);
});

test("allows brand content", () => {
  expect(containsPII("Our mission is to help communities thrive")).toBe(false);
});
```

**Test Allowlist Filtering**:

```typescript
import { allowlistObject } from "@/privacy/scrub";

test("filters campaign payload", () => {
  const input = {
    profile: { name: "Hope Foundation", email: "contact@hope.org" },
    donors: [{ name: "John Doe", email: "john@example.com" }],
  };
  const filtered = allowlistObject(input, "campaign");
  expect(filtered.profile.name).toBe("Hope Foundation");
  expect(filtered.profile.email).toBeUndefined(); // NOT in allowlist
  expect(filtered.donors).toBeUndefined(); // NOT in allowlist
});
```

**Test Gateway Blocking**:

```bash
# Should be blocked (PII in payload)
curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/ai-privacy-gateway \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"category":"campaign","payload":{"email":"test@example.com"}}'

# Expected: 400 { "ok": false, "error": "pii_detected_blocked" }
```

---

## ✅ Acceptance Checklist

- [x] All AI calls go through `ai-privacy-gateway`
- [x] Gateway enforces allowlist + regex PII scan + cohort check
- [x] No donor-level records or free text sent to AI
- [x] Campaign Designer uses privacy gateway
- [x] Analytics narratives use privacy gateway
- [x] AI-safe SQL views created
- [x] Privacy scrubber utility implemented
- [x] Documentation complete
- [ ] Unit tests written (recommended)
- [ ] E2E encryption for donor PII (optional upgrade)

---

## 🔐 Optional: Client-Side E2EE

For full **E2EE at rest**, you can encrypt donor contact fields client-side:

### Implementation:

1. **Add `donors.secure_blob` column** (JSONB, encrypted)
2. **Keep `email_hash` + `anon_id`** for joins (server-side, one-way)
3. **Use WebCrypto** to encrypt/decrypt on-demand in browser
4. **Per-client RSA/ECC keypair**:
   - Public key: stored in app config
   - Private key: held by client admins (browser or KMS)

### Benefits:

- Database and servers are **blind to PII**
- AI receives **only** decrypted brand context + precomputed aggregates
- Meets highest compliance standards (GDPR, HIPAA, CCPA)

### Trade-offs:

- More complex key management
- Performance overhead for encryption/decryption
- Requires client admin key custody

---

## 🔍 Observability

### Metrics Dashboard (Future)

Track privacy gateway metrics:

- Total requests
- Blocked requests (by reason)
- Allowed requests
- Average response time

### Alerts

- **High PII block rate**: May indicate data quality issues
- **Privacy threshold violations**: Users attempting queries on small cohorts
- **Unusual request patterns**: Potential security issues

### Logging Policy

**NEVER log request bodies** containing:

- AI prompts
- User-provided content
- Donor data (even hashed)

**DO log**:

- Request IDs
- User IDs
- Category
- Success/failure
- Block reason (if any)

---

## 📞 Support

For questions about privacy implementation:

1. Review this document
2. Check [`src/privacy/scrub.ts`](src/privacy/scrub.ts) for allowlists
3. Review Edge Function logs (no request bodies logged)
4. Contact security team for compliance questions

---

## 📝 Changelog

### v1.0.0 - 2025-01-10

- Initial Privacy Gateway implementation
- Allowlist-based filtering for campaign + analytics
- PII detection via regex (email, phone, address, SSN, credit card)
- AI-safe SQL views
- Privacy scrubber utility
- useClaudeAnalysis hook
- Campaign Designer integration
- Documentation complete

---

**Remember**: Privacy is not optional. **All AI requests MUST pass through the privacy gateway.**
