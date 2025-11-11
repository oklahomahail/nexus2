## Campaign Designer Implementation Guide

**The Killer Feature: AI-Powered Fundraising Campaign Generation**

This document outlines the complete implementation of Nexus's Campaign Designer—the core differentiator that fuses organizational brand intelligence with AI-generated fundraising content.

---

## Vision

Enable nonprofits to:

1. **Upload their "brand bible"**: logo, voice, tone, mission, sample materials
2. **Generate complete campaigns**: direct mail (letters/postcards), email sequences (10-12), social posts (10-12)
3. **Get cost estimates**: postage calculator with nonprofit vs. first-class comparison
4. **Maintain brand consistency**: AI checks all content against style guide

**Analogy**: Like Inkwell's Character Bible + Story Architect, but for fundraising campaigns instead of novels.

---

## Architecture Overview

```
Brand Bible (Supabase)
  ↓
Campaign Parameters (UI)
  ↓
AI Generation (Claude)
  ↓
Multi-Channel Assets
  ↓
Cost Estimates & Schedule
```

### Data Flow

1. User uploads/imports brand materials → `brand_corpus` table
2. User defines campaign (type, audience, goal, tone) → Campaign Designer UI
3. System builds brand context → loads profile + top corpus snippets
4. Claude generates → blueprint → direct mail → digital sequence
5. System estimates costs → postage + printing + production
6. User downloads/exports → templates ready for print vendor

---

## Phase 1: Foundation ✅ **COMPLETE**

### Files Created

| File | Purpose | Status |
|------|---------|--------|
| `supabase/migrations/20250110000003_brand_bible.sql` | Schema for brand profiles, assets, corpus | ✅ Complete |
| `src/services/brandService.ts` | CRUD operations for brand data | ✅ Complete |
| `src/services/postageEstimator.ts` | Static rate table + cost calculations | ✅ Complete |
| `src/services/campaignDesignerPrompts.ts` | Claude prompt templates | ✅ Complete |
| `src/hooks/usePostalAssumptions.ts` | React hook for postage estimates | ✅ Complete |
| `supabase/functions/scheduled-import-brand-corpus/` | Edge Function for importing web/PDF content | ✅ Complete |
| `src/types/database.types.ts` | Updated with Brand Bible types | ✅ Complete |

### Database Schema

**New Tables**:

- `brand_profiles` - Organization identity (tone, colors, typography, keywords)
- `brand_assets` - Logo, photos, templates, examples
- `brand_corpus` - Text from websites, PDFs, social, manual entry (with full-text search)

**Key Features**:

- ✅ Client-scoped RLS policies
- ✅ Full-text search on corpus (`to_tsvector`)
- ✅ SHA-256 checksums for deduplication
- ✅ Optional vector embeddings for semantic search (future)
- ✅ Activity logging for audit trail

---

## Phase 2: UI Implementation 🔜 **NEXT**

### Components to Build

#### 1. Brand Profile Panel

**File**: `src/panels/BrandProfilePanel.tsx`

**Features**:

- View/edit brand profile (name, mission, tone, colors, typography)
- Upload logo to Supabase Storage (`brand-assets` bucket)
- Add style keywords (chips/tags)
- Link to brand guidelines PDF

**Hooks**: `useBrandProfile.ts`

```typescript
import { useBrandProfile } from '@/hooks/useBrandProfile'

const { profile, assets, updateProfile, uploadAsset } = useBrandProfile(clientId)
```

**Estimated Time**: 4 hours

---

#### 2. Brand Corpus Manager

**File**: `src/components/brand/BrandCorpusManager.tsx`

**Features**:

- List imported corpus chunks (table with source, title, tokens, date)
- Add manual text entry (textarea → save as "manual" type)
- Import from URL (calls Edge Function)
- Search corpus (full-text search UI)
- Delete chunks

**Actions**:

```typescript
// Manual entry
await upsertCorpusChunk({
  client_id,
  brand_id,
  source_type: 'manual',
  title: 'Newsletter Excerpt',
  checksum: await generateChecksum(content),
  content,
  tokens: estimateTokens(content),
})

// Import from URL (calls Edge Function)
const response = await fetch(`${SUPABASE_URL}/functions/v1/scheduled-import-brand-corpus`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Brand-Import-Secret': WEBHOOK_SECRET,
  },
  body: JSON.stringify({
    client_id,
    brand_id,
    sources: [{ source_type: 'website', url: 'https://track15.org/about' }],
  }),
})
```

**Estimated Time**: 6 hours

---

#### 3. Campaign Designer Wizard

**File**: `src/panels/CampaignDesignerPanel.tsx`

**Pattern**: Clone `CampaignCreationWizard.tsx` structure

**Steps**:

1. **Campaign Parameters**
   - Type: appeal | event | program_launch | capital | endowment
   - Season: spring | summer | fall | year_end
   - Target Audience: dropdown (segments) + freeform
   - Goal: text field (e.g., "$50,000 to fund summer meals")
   - Tone: urgent | inspiring | reflective | celebratory
   - Channels: checkboxes (direct mail, email, social)

2. **Direct Mail Options**
   - Format: postcard | letter | flat (6x11)
   - Quantity: number input
   - Mail class: nonprofit | first_class (auto-select nonprofit if eligible)
   - → Shows live postage estimate via `usePostalAssumptions`

3. **Digital Options**
   - Email count: 8-12 (slider)
   - Social count: 8-12 (slider)
   - Duration: 3-6 weeks (slider)

4. **Review & Generate**
   - Shows all parameters
   - Estimated costs summary
   - "Generate Campaign" button → calls Claude API

5. **Results**
   - Campaign Blueprint (JSON + prose)
   - Direct Mail draft (letter or postcard)
   - Email sequence (table with subject, preheader, body, CTA)
   - Social posts (cards with short/long copy, image prompts)
   - Download buttons (Markdown, CSV, PDF)

**Hooks**: `useCampaignDesigner.ts`

```typescript
import { useCampaignDesigner } from '@/hooks/useCampaignDesigner'

const { generateCampaign, isGenerating, results } = useCampaignDesigner({
  clientId,
  brandId,
})

// Generate campaign
const campaign = await generateCampaign({
  campaignType: 'appeal',
  season: 'year_end',
  targetAudience: 'lapsed donors 6-12 months',
  goal: '$75,000 for winter meals program',
  tone: 'urgent',
  channels: ['direct_mail', 'email', 'social'],
  mailFormat: 'letter',
  quantity: 5000,
})
```

**Estimated Time**: 12 hours

---

#### 4. useCampaignDesigner Hook

**File**: `src/hooks/useCampaignDesigner.ts`

**Responsibilities**:

1. Load brand context (profile + corpus snippets)
2. Build prompts using `campaignDesignerPrompts.ts`
3. Call Claude API (via `ClaudeProvider` or direct API)
4. Parse responses (JSON + Markdown)
5. Integrate postage estimates
6. Manage generation state (loading, error, results)

**Pseudo-code**:

```typescript
export function useCampaignDesigner({ clientId, brandId }: { clientId: string; brandId: string }) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [results, setResults] = useState<CampaignResults | null>(null)
  const [error, setError] = useState<string | null>(null)

  const generateCampaign = async (params: CampaignParams) => {
    setIsGenerating(true)
    setError(null)

    try {
      // 1. Load brand context
      const { profile, snippets, context } = await buildBrandContext(clientId, brandId)

      // 2. Build prompts
      const prompts = buildFullCampaignPrompts({
        brandContext: context,
        blueprintInput: params,
        mailFormat: params.mailFormat,
      })

      // 3. Call Claude sequentially for each step
      const blueprintResponse = await callClaude(prompts[0].prompt)
      const directMailResponse = await callClaude(prompts[1].prompt) // Inject blueprint results
      const digitalResponse = await callClaude(prompts[2].prompt) // Inject blueprint results

      // 4. Parse responses
      const blueprint = parseBlueprint(blueprintResponse)
      const directMail = parseDirectMail(directMailResponse)
      const digital = parseDigitalSequence(digitalResponse)

      // 5. Calculate costs
      const postageEstimate = estimatePostage({
        mailClass: params.mailClass,
        format: params.mailFormat,
        quantity: params.quantity,
      })

      // 6. Return results
      setResults({
        blueprint,
        directMail,
        digital,
        costs: postageEstimate,
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setIsGenerating(false)
    }
  }

  return { generateCampaign, isGenerating, results, error }
}
```

**Estimated Time**: 8 hours

---

## Phase 3: Claude Integration 🔜 **UPCOMING**

### Option A: Use Existing ClaudeProvider

Nexus already has `/src/context/ClaudeProvider.tsx` (from Inkwell pattern).

**Pros**: Consistent with Inkwell, handles streaming, error boundaries
**Cons**: May need adaptation for multi-step generation

### Option B: Direct API Calls

Use Anthropic SDK directly in `useCampaignDesigner`:

```typescript
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: import.meta.env.VITE_CLAUDE_API_KEY,
})

const message = await anthropic.messages.create({
  model: 'claude-3-5-sonnet-20241022',
  max_tokens: 4096,
  system: CAMPAIGN_DESIGNER_SYSTEM_PROMPT,
  messages: [{ role: 'user', content: blueprintPrompt }],
})
```

**Recommendation**: Start with Option B for simplicity, migrate to ClaudeProvider later if needed for streaming UI.

**Estimated Time**: 4 hours

---

## Phase 4: Postage & Cost Display 🔜 **UPCOMING**

### Components

#### PostageEstimateCard

**File**: `src/components/campaign/PostageEstimateCard.tsx`

**Features**:

- Shows unit rate, quantity, total
- Nonprofit vs First Class comparison (if nonprofit eligible)
- Breakdown: postage + printing + production
- Cost per piece
- ROI calculator (optional: input response rate + avg gift)

**Example UI**:

```
┌──────────────────────────────────────────┐
│ Postage Estimate                         │
├──────────────────────────────────────────┤
│ Format: Letter (#10 envelope)            │
│ Class: Nonprofit Presort                 │
│ Quantity: 5,000                          │
│                                          │
│ Postage:     $950.00  ($0.190/piece)     │
│ Printing:    $1,250.00                   │
│ Production:  $750.00                     │
│ ─────────────────────────────────        │
│ TOTAL:       $2,950.00  ($0.59/piece)    │
│                                          │
│ 💰 Savings vs First Class: $1,450.00    │
│ (43% lower)                              │
└──────────────────────────────────────────┘
```

**Estimated Time**: 3 hours

---

## Phase 5: Export & Delivery 🔜 **FUTURE**

### Export Formats

1. **Markdown** - Full campaign content for editing
2. **CSV** - Email/social sequences for upload to marketing tools
3. **PDF** - Print-ready direct mail with vendor specs
4. **JSON** - Raw data for API integrations

### Implementation

```typescript
// Markdown export
function exportCampaignMarkdown(campaign: CampaignResults): string {
  return `
# ${campaign.blueprint.theme}

## Campaign Blueprint
${campaign.blueprint.prose}

## Direct Mail: ${campaign.directMail.format}
${campaign.directMail.content}

## Email Sequence
${campaign.digital.emails.map((e) => `### Email ${e.id}: ${e.subject}\n${e.body}`).join('\n\n')}

## Social Posts
${campaign.digital.social.map((s) => `### Post ${s.id}\n${s.long}`).join('\n\n')}

## Cost Estimate
${buildCostSummaryPrompt(campaign.costs)}
  `.trim()
}

// CSV export (emails)
function exportEmailsCSV(emails: EmailItem[]): string {
  const headers = ['ID', 'Subject', 'Preheader', 'Body', 'CTA']
  const rows = emails.map((e) => [e.id, e.subject, e.preheader, e.body, e.cta])
  return [headers, ...rows].map((r) => r.map(escapeCsv).join(',')).join('\n')
}
```

**Estimated Time**: 4 hours

---

## Phase 6: Brand Consistency Guardian 🔮 **FUTURE**

### Concept

After generating content, run a "consistency check" pass:

**Prompt Template**:

```
You are a brand consistency guardian. Review the following campaign content against the brand guidelines:

BRAND GUIDELINES:
${brandContext}

GENERATED CONTENT:
${generatedContent}

TASK:
Check for:
1. Tone alignment (does it match ${tone_of_voice}?)
2. Style keyword usage (are ${style_keywords} represented?)
3. Prohibited language (jargon, guilt-based appeals, overpromising)
4. Accessibility (sentence length <25 words, Flesch-Kincaid grade <10)

OUTPUT:
{
  "overallScore": 0-100,
  "toneAlignment": { "score": 0-100, "feedback": "..." },
  "styleKeywordUsage": { "score": 0-100, "feedback": "..." },
  "prohibitedLanguage": { "issues": ["..."], "severity": "low|medium|high" },
  "accessibility": { "score": 0-100, "feedback": "..." },
  "recommendations": ["Suggestion 1", "Suggestion 2"]
}
```

**UI**: Show score card with actionable feedback; option to regenerate.

**Estimated Time**: 6 hours

---

## Implementation Timeline

| Phase | Tasks | Hours | Priority |
|-------|-------|-------|----------|
| **1. Foundation** | Schema, services, prompts, hook scaffolds | 6 | ✅ Complete |
| **2. UI** | Brand Profile Panel, Corpus Manager, Campaign Designer Wizard | 22 | 🔥 High |
| **3. Claude Integration** | API calls, response parsing, error handling | 4 | 🔥 High |
| **4. Postage Display** | Cost cards, comparisons, ROI calculator | 3 | 🔥 High |
| **5. Export** | Markdown, CSV, PDF, JSON downloads | 4 | 🟡 Medium |
| **6. Consistency Guardian** | Brand check pass, feedback UI | 6 | 🟢 Low (nice-to-have) |
| **TOTAL** | | **45 hours** | |

**Recommended Sprint**: Phases 2-4 (29 hours) → MVP Campaign Designer ready

---

## Success Criteria

### MVP (Minimum Viable Product)

- ✅ User can upload brand profile (name, mission, tone, colors)
- ✅ User can import corpus (manual text + URL import)
- ✅ User can generate campaign blueprint via wizard
- ✅ Claude produces direct mail draft (letter or postcard)
- ✅ Claude produces email sequence (10 emails)
- ✅ Claude produces social posts (10 posts)
- ✅ Postage estimate displayed (nonprofit vs first class)
- ✅ User can download Markdown export

### Full Production

- All MVP criteria
- PDF export (print-ready with vendor specs)
- CSV export for email marketing tools
- Brand Consistency Guardian feedback
- Template library (save/reuse campaigns)
- Multi-language support (Spanish, French)
- A/B test variant generation

---

## Testing Plan

### Unit Tests

```typescript
// brandService.ts
test('upsertBrandProfile creates profile with client scoping', async () => {
  const profile = await upsertBrandProfile({
    client_id: testClientId,
    name: 'Test Brand',
    tone_of_voice: 'warm, professional',
  })
  expect(profile.client_id).toBe(testClientId)
})

// postageEstimator.ts
test('estimatePostage calculates nonprofit savings correctly', () => {
  const estimate = estimatePostage({ mailClass: 'nonprofit', format: 'letter', quantity: 1000 })
  expect(estimate.total).toBe(190) // $0.19 * 1000
  expect(estimate.savings).toBeGreaterThan(0)
})
```

### Integration Tests

1. **Brand Import Flow**
   - Create brand profile
   - Upload logo to Storage
   - Import corpus from URL (calls Edge Function)
   - Verify corpus chunk created with checksum

2. **Campaign Generation Flow**
   - Load brand context
   - Generate blueprint
   - Generate direct mail
   - Generate digital sequence
   - Verify all outputs present

3. **Postage Estimation**
   - Estimate for various formats/classes
   - Compare nonprofit vs first class
   - Calculate full campaign cost

### Manual Testing

- [ ] Brand profile CRUD works
- [ ] Corpus import from website extracts clean text
- [ ] Corpus import from PDF works (text-based PDFs only)
- [ ] Campaign wizard collects all parameters
- [ ] Claude generates on-brand content
- [ ] Postage estimates match expected rates
- [ ] Export downloads work (Markdown, CSV)
- [ ] RLS prevents cross-client access

---

## Common Issues & Solutions

### Issue: Claude generates off-brand content

**Solution**: Enhance brand context with more corpus examples. Aim for 10-15 diverse snippets (500 chars each).

### Issue: PDF import fails

**Cause**: Scanned PDFs (image-based) not supported by pdf.js
**Solution**: Copy text manually or use OCR preprocessing

### Issue: Postage estimates seem high

**Cause**: Using first-class rates instead of nonprofit
**Solution**: Verify `nonprofitEligible: true` in `usePostalAssumptions` hook

### Issue: Edge Function times out

**Cause**: Large PDF or slow website fetch
**Solution**: Increase timeout, add retry logic, or import manually

---

## Future Enhancements

### Short-Term (Next Quarter)

- [ ] Template library (save successful campaigns for reuse)
- [ ] A/B test variant generation (2-3 subject line options)
- [ ] Canva integration (export social posts to Canva templates)
- [ ] Track15 style preset (pre-populated brand profile)

### Medium-Term (Next Year)

- [ ] Multi-language generation (Spanish, French)
- [ ] USPS Web Tools API integration (live postage rates)
- [ ] Print vendor integration (direct order to Vistaprint, MOO, etc.)
- [ ] Email marketing tool sync (Mailchimp, Constant Contact)
- [ ] Compliance checker (IRS nonprofit language validation)

### Long-Term (Future)

- [ ] Image generation (DALL-E integration for social graphics)
- [ ] Video script generation (for YouTube/TikTok appeals)
- [ ] Voice-over generation (audio for radio/podcast ads)
- [ ] Campaign performance feedback loop (learn from results)

---

## Resources

### Documentation

- **Supabase Docs**: [https://supabase.com/docs](https://supabase.com/docs)
- **Anthropic Claude API**: [https://docs.anthropic.com/claude/reference](https://docs.anthropic.com/claude/reference)
- **USPS Postage Rates**: [https://www.usps.com/business/prices.htm](https://www.usps.com/business/prices.htm)
- **Inkwell Reference**: `/Users/davehail/Developer/inkwell` (for UI patterns)

### Files to Reference

- `src/context/ClaudeProvider.tsx` (Inkwell pattern for Claude integration)
- `src/panels/CampaignCreationWizard.tsx` (existing wizard pattern to clone)
- `supabase/migrations/20250110000000_nexus_initial_schema.sql` (for RLS pattern examples)

---

## Next Actions

1. **Deploy Brand Bible migration**:
   ```bash
   supabase db push --migration-name 20250110000003_brand_bible
   ```

2. **Deploy Edge Function**:
   ```bash
   cd supabase/functions
   supabase functions deploy scheduled-import-brand-corpus
   supabase secrets set BRAND_IMPORT_WEBHOOK_SECRET=<generate-long-random-string>
   ```

3. **Create Storage Bucket**:
   - Dashboard → Storage → New Bucket
   - Name: `brand-assets`
   - Public: `false`

4. **Start UI Implementation**:
   - Create `src/hooks/useBrandProfile.ts`
   - Create `src/panels/BrandProfilePanel.tsx`
   - Wire into main navigation

5. **Test with Track15**:
   - Create Track15 brand profile
   - Import corpus from track15.org
   - Generate test campaign
   - Review for brand alignment

---

**Status**: Foundation complete. Ready for Phase 2 (UI Implementation).

**Last Updated**: 2025-01-10
