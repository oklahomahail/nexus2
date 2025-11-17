# Client Onboarding Upload Feature Design

## Executive Summary

**Problem:** New client onboarding requires manually entering dozens of fields across multiple screens (brand voice, messaging pillars, donor stories, logos, audience segments, mission/vision, etc.). This is time-consuming and friction-heavy.

**Solution:** Single-source document upload where users drop a Word doc, PDF, or markdown file containing their brand brief, and Nexus parses everything using Claude AI to auto-populate the client profile.

**Impact:**
- ✅ Reduces onboarding time from 30+ minutes to < 5 minutes
- ✅ Improves data completeness and quality
- ✅ Showcases Nexus's AI-powered workflow
- ✅ Aligns with Track15's narrative-first methodology

---

## Architecture Overview

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT ONBOARDING FLOW                    │
└─────────────────────────────────────────────────────────────┘

1. Upload Interface (Frontend)
   ├─ FileUpload Component (existing)
   ├─ ClientIntakeWizard (new)
   └─ BrandProfileReview (new)

2. Document Processing (Backend/Edge Function)
   ├─ File Upload to Supabase Storage
   ├─ Text Extraction (pdf/docx → text)
   ├─ Claude API Analysis
   └─ Structured Data Extraction

3. Data Storage (Database)
   ├─ brand_profiles
   ├─ brand_corpus
   ├─ brand_assets
   └─ clients (metadata)
```

---

## Database Schema

### Existing Tables (No Changes Required)

#### `brand_profiles` ([20250110000003_brand_bible.sql](supabase/migrations/20250110000003_brand_bible.sql:13-42))
```sql
- id, client_id, name, mission_statement
- tone_of_voice, brand_personality, style_keywords
- primary_colors[], typography (jsonb), logo_url
- guidelines_url
```

#### `brand_corpus` ([20250110000003_brand_bible.sql](supabase/migrations/20250110000003_brand_bible.sql:78-104))
```sql
- id, client_id, brand_id
- source_type ('doc', 'pdf', 'manual')
- content (text), embedding (vector)
- checksum (deduplication)
```

#### `brand_assets` ([20250110000003_brand_bible.sql](supabase/migrations/20250110000003_brand_bible.sql:49-70))
```sql
- id, client_id, brand_id
- asset_type ('logo', 'photo', 'template', etc.)
- url, description, metadata (jsonb)
```

### New Table: `client_intake_jobs`

Track async document processing jobs:

```sql
CREATE TABLE client_intake_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,

  -- Upload metadata
  uploaded_file_url TEXT NOT NULL,
  uploaded_file_name TEXT NOT NULL,
  uploaded_file_type TEXT NOT NULL, -- 'pdf', 'docx', 'md', etc.
  uploaded_file_size_bytes INTEGER,

  -- Processing status
  status TEXT NOT NULL CHECK (
    status IN ('pending', 'processing', 'completed', 'failed', 'review_required')
  ) DEFAULT 'pending',

  -- Extracted data (JSON blob before committing to DB)
  extracted_data JSONB, -- Raw parsed data
  parsed_sections JSONB, -- Structured sections

  -- Results
  brand_profile_id UUID REFERENCES brand_profiles(id),
  error_message TEXT,

  -- Audit
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_intake_jobs_client_status ON client_intake_jobs(client_id, status);
CREATE INDEX idx_intake_jobs_created_by ON client_intake_jobs(created_by);
```

---

## Data Extraction Specification

### Claude Parsing System Prompt

```markdown
# Client Brand Intake Document Parser

You are analyzing a brand brief, client intake document, or marketing strategy document.

## Extraction Tasks

Parse the document and extract the following structured data:

### 1. Organization Identity
- name: Organization full name
- mission: Mission statement (1-3 sentences)
- vision: Vision statement (if present)
- history: Brief organizational history
- website: Organization website URL

### 2. Voice & Tone
- tone_of_voice: 3-5 descriptive keywords (e.g., "warm, urgent, plain-language")
- brand_personality: Personality traits as bullet points or paragraph
- style_keywords: Array of key stylistic terms
- writing_guidelines: Any specific writing rules

### 3. Messaging Pillars
Array of 3-5 core messages:
- pillar_name: Short title
- description: 2-3 sentence explanation
- proof_points: Supporting evidence/stats

### 4. Donor Stories / Impact Stories
Array of stories:
- title: Story headline
- narrative: Full story text
- impact_metrics: Quantifiable outcomes
- donor_segment: Target audience

### 5. Audience Segments
Array of donor personas:
- segment_name: Persona name (e.g., "Major Donors", "Monthly Sustainers")
- description: Demographic/psychographic profile
- motivations: Why they give
- communication_preferences: Preferred channels/frequency

### 6. Visual Identity
- primary_colors: Array of hex codes
- typography: Font families and usage
- logo_description: Description of logo/brand marks
- style_references: Visual aesthetic keywords

### 7. Campaign Themes / Seasonality
- year_end_themes: Key messages for year-end
- spring_themes, summer_themes, fall_themes, winter_themes
- evergreen_content: Always-relevant themes

### 8. Brand Assets Mentioned
- logo_files: Mentioned logo variations
- photo_descriptions: Key photography themes
- template_types: Described templates

## Output Format

Return JSON matching this schema:

{
  "organization": { ... },
  "voice_tone": { ... },
  "messaging_pillars": [ ... ],
  "donor_stories": [ ... ],
  "audience_segments": [ ... ],
  "visual_identity": { ... },
  "campaign_themes": { ... },
  "brand_assets": [ ... ],
  "confidence_score": 0-100,
  "missing_sections": [ ... ]
}

## Rules
- Extract only information explicitly stated in the document
- If a section is missing, note it in "missing_sections"
- Preserve original language and tone in extracted text
- For ambiguous content, include both interpretations with notes
- Return confidence_score based on completeness
```

---

## User Flow

### MVP Flow (Short-term)

```
1. User clicks "New Client" → ClientIntakeWizard modal opens

2. Step 1: Basic Info
   - Client name (text input)
   - Primary contact (name, email)
   - "Or upload client brief" → FileUpload

3. Upload Flow (if user uploads document):
   a. File uploads to Supabase Storage (bucket: 'client-intakes')
   b. Edge Function triggered: process-client-intake
   c. Loading state: "Analyzing your document..."
   d. Claude parses document → extracts structured data

4. Step 2: Review & Edit
   - Show extracted data in editable form
   - Sections: Identity, Voice/Tone, Messaging, Stories, Segments
   - User can edit any field before saving
   - Show confidence score and missing sections

5. Step 3: Confirm
   - Preview brand profile
   - Click "Create Client" → saves to database

6. Redirect to client dashboard
```

### Full Flow (v0.6+)

```
Additional features:
- Re-upload new versions → auto-diff changes
- Incremental updates (add donor story via upload)
- Multi-file upload (brief + logo + templates)
- Batch client creation (upload folder of briefs)
```

---

## Technical Implementation

### Phase 1: MVP (Ship Fast)

#### Frontend Components

**1. ClientIntakeWizard.tsx**
```tsx
interface ClientIntakeWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (clientId: string) => void;
}

Steps:
- Step 1: Upload or Manual Entry
- Step 2: Review Parsed Data (if uploaded)
- Step 3: Confirm & Save
```

**2. BrandProfileReview.tsx**
```tsx
interface BrandProfileReviewProps {
  extractedData: ExtractedBrandData;
  onEdit: (section: string, data: any) => void;
  onSave: () => void;
}

Shows:
- Collapsible sections for each data category
- Inline editing for text fields
- Confidence indicators
- Missing section warnings
```

**3. IntakeJobStatus.tsx**
```tsx
// Real-time status component
// Shows: "Uploading...", "Analyzing...", "Ready for review"
// Uses Supabase Realtime to watch client_intake_jobs table
```

#### Backend (Supabase Edge Function)

**`supabase/functions/process-client-intake/index.ts`**

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Anthropic from "https://esm.sh/@anthropic-ai/sdk@0.20.0";

serve(async (req) => {
  const { fileUrl, clientId, jobId } = await req.json();

  // 1. Download file from Supabase Storage
  const fileContent = await downloadFile(fileUrl);

  // 2. Extract text (pdf/docx → text)
  const extractedText = await extractText(fileContent);

  // 3. Call Claude API
  const anthropic = new Anthropic({
    apiKey: Deno.env.get("ANTHROPIC_API_KEY"),
  });

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-5-20250929",
    max_tokens: 4000,
    messages: [{
      role: "user",
      content: `${BRAND_INTAKE_PROMPT}\n\nDocument:\n${extractedText}`
    }]
  });

  const parsedData = JSON.parse(response.content[0].text);

  // 4. Update job status
  await supabase
    .from("client_intake_jobs")
    .update({
      status: "completed",
      extracted_data: parsedData,
      completed_at: new Date().toISOString()
    })
    .eq("id", jobId);

  return new Response(JSON.stringify({ success: true }));
});
```

**Helper: Text Extraction**

Use existing libraries:
- **PDF**: `pdf-parse` or `pdfjs-dist`
- **DOCX**: `mammoth` or `docx-parser`
- **Markdown**: Direct text extraction

#### Database Operations

**Service: `clientIntakeService.ts`**

```typescript
export const clientIntakeService = {
  // Create intake job
  async createIntakeJob(clientId: string, file: File) {
    // 1. Upload file to Storage
    const filePath = `client-intakes/${clientId}/${file.name}`;
    const { data: uploadData } = await supabase.storage
      .from("client-intakes")
      .upload(filePath, file);

    // 2. Create job record
    const { data: job } = await supabase
      .from("client_intake_jobs")
      .insert({
        client_id: clientId,
        uploaded_file_url: uploadData.path,
        uploaded_file_name: file.name,
        uploaded_file_type: file.type,
        status: "pending"
      })
      .select()
      .single();

    // 3. Trigger edge function
    await supabase.functions.invoke("process-client-intake", {
      body: {
        fileUrl: uploadData.path,
        clientId,
        jobId: job.id
      }
    });

    return job;
  },

  // Save extracted data to brand_profiles
  async commitIntakeData(jobId: string, editedData: any) {
    const job = await getIntakeJob(jobId);

    // Insert brand_profile
    const { data: profile } = await supabase
      .from("brand_profiles")
      .insert({
        client_id: job.client_id,
        name: editedData.organization.name,
        mission_statement: editedData.organization.mission,
        tone_of_voice: editedData.voice_tone.tone_of_voice,
        brand_personality: editedData.voice_tone.brand_personality,
        style_keywords: editedData.voice_tone.style_keywords,
        primary_colors: editedData.visual_identity.primary_colors
      })
      .select()
      .single();

    // Insert corpus entry for original document
    await supabase
      .from("brand_corpus")
      .insert({
        client_id: job.client_id,
        brand_id: profile.id,
        source_type: "doc",
        title: job.uploaded_file_name,
        content: editedData.raw_text,
        checksum: sha256(editedData.raw_text)
      });

    // Update job
    await supabase
      .from("client_intake_jobs")
      .update({ brand_profile_id: profile.id })
      .eq("id", jobId);

    return profile;
  }
};
```

---

## File Structure

```
src/
├── components/
│   ├── client/
│   │   ├── ClientIntakeWizard.tsx       (new)
│   │   ├── BrandProfileReview.tsx       (new)
│   │   └── IntakeJobStatus.tsx          (new)
│   └── ui-kit/
│       └── FileUpload.tsx               (existing ✓)
│
├── services/
│   └── clientIntakeService.ts           (new)
│
├── hooks/
│   └── useIntakeJob.ts                  (new - Realtime subscription)
│
└── types/
    └── clientIntake.ts                  (new - TypeScript interfaces)

supabase/
├── functions/
│   └── process-client-intake/
│       ├── index.ts                     (new)
│       ├── extractors/
│       │   ├── pdf.ts                   (new)
│       │   ├── docx.ts                  (new)
│       │   └── markdown.ts              (new)
│       └── prompts/
│           └── brandIntakeParser.ts     (new)
│
└── migrations/
    └── 20250117000000_client_intake_jobs.sql (new)
```

---

## UI/UX Mockup

### Client Intake Wizard - Step 1

```
┌─────────────────────────────────────────────────┐
│  Create New Client                          [×] │
├─────────────────────────────────────────────────┤
│                                                 │
│  Client Information                             │
│  ─────────────────                              │
│                                                 │
│  Client Name *                                  │
│  [________________________]                     │
│                                                 │
│  Primary Contact                                │
│  [________________________]                     │
│                                                 │
│  ─────── OR ───────                             │
│                                                 │
│  Upload Client Brief                            │
│  ┌───────────────────────────────────────────┐ │
│  │                                           │ │
│  │          📁 Drop file here or click       │ │
│  │                                           │ │
│  │   Supported: PDF, DOCX, MD, TXT           │ │
│  │   Max size: 10MB                          │ │
│  │                                           │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│  💡 Upload a brand brief to auto-populate      │
│     client profile using AI                     │
│                                                 │
│                    [Cancel]  [Continue →]       │
└─────────────────────────────────────────────────┘
```

### Client Intake Wizard - Step 2 (Processing)

```
┌─────────────────────────────────────────────────┐
│  Analyzing Document                         [×] │
├─────────────────────────────────────────────────┤
│                                                 │
│         ⚙️ Processing brand-brief.pdf           │
│                                                 │
│     ┌────────────────────────────────────┐     │
│     │ █████████████████░░░░░░░░░░░░  65% │     │
│     └────────────────────────────────────┘     │
│                                                 │
│  ✓ Extracted text from document                │
│  ✓ Identified organization details             │
│  ⏳ Parsing brand voice and tone...             │
│  ⏳ Extracting messaging pillars...             │
│  · Analyzing donor stories...                   │
│  · Identifying audience segments...             │
│                                                 │
│  This usually takes 30-60 seconds.              │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Client Intake Wizard - Step 3 (Review)

```
┌─────────────────────────────────────────────────┐
│  Review & Edit Brand Profile                [×] │
├─────────────────────────────────────────────────┤
│                                                 │
│  Confidence Score: 92% ✓                        │
│  Missing: Logo file, Primary colors             │
│                                                 │
│  ▼ Organization Identity                        │
│    Name: Hope Foundation                   [✎] │
│    Mission: Ending childhood hunger...     [✎] │
│                                                 │
│  ▼ Voice & Tone                                 │
│    Tone: warm, urgent, plain-language      [✎] │
│    Personality: Compassionate advocate...  [✎] │
│    Keywords: [impact] [community] [hope]   [✎] │
│                                                 │
│  ▶ Messaging Pillars (3)                        │
│  ▶ Donor Stories (5)                            │
│  ▶ Audience Segments (4)                        │
│  ▶ Visual Identity                              │
│  ▶ Campaign Themes                              │
│                                                 │
│                    [Cancel]  [Create Client →]  │
└─────────────────────────────────────────────────┘
```

---

## Migration Plan

### Phase 1: MVP (Week 1-2)

- ✅ Create `client_intake_jobs` table
- ✅ Build Edge Function for document processing
- ✅ Implement basic text extraction (PDF + DOCX)
- ✅ Create Claude parsing prompt
- ✅ Build ClientIntakeWizard UI
- ✅ Build BrandProfileReview UI
- ✅ Implement manual edit/save flow
- ✅ Test with 3-5 real client briefs

**Success Criteria:**
- User can upload PDF/DOCX
- System extracts 70%+ of brand profile data
- User can edit and save extracted data
- Brand profile created correctly

### Phase 2: Enhanced (Week 3-4)

- ⭐ Add image upload for logos
- ⭐ Multi-file upload support
- ⭐ Version tracking (re-upload → diff)
- ⭐ Confidence scoring UI
- ⭐ Missing field prompts
- ⭐ Progress tracking in onboarding checklist

### Phase 3: Advanced (v0.6+)

- 🚀 Incremental updates (upload just donor stories)
- 🚀 Batch processing (upload folder)
- 🚀 Template library (download example brief)
- 🚀 Integration with Campaign Designer
- 🚀 Auto-suggest messaging pillars from corpus
- 🚀 Vector embeddings for semantic search

---

## Testing Checklist

### Unit Tests
- [ ] Text extraction (PDF, DOCX, MD)
- [ ] Claude prompt returns valid JSON
- [ ] Data mapping to database schema
- [ ] File upload to Storage
- [ ] RLS policies for intake_jobs

### Integration Tests
- [ ] End-to-end upload → parse → save flow
- [ ] Error handling (bad file, API failure)
- [ ] Realtime job status updates
- [ ] Multi-step wizard navigation

### User Acceptance Tests
- [ ] Upload real client brief → verify accuracy
- [ ] Edit extracted data → save → verify persistence
- [ ] Cancel mid-process → verify cleanup
- [ ] Upload multiple files → verify all processed

---

## Risks & Mitigation

| Risk | Mitigation |
|------|-----------|
| **Claude API fails** | Graceful degradation: Allow manual entry, queue retry |
| **Text extraction errors** | Show error + allow manual paste of text |
| **Low extraction accuracy** | Provide clear editing UI, track confidence scores |
| **Large files timeout** | Stream processing, background jobs, status polling |
| **User uploads wrong file** | File type validation, preview extracted text |
| **Privacy/security concerns** | Encrypted storage, auto-delete after 30 days, RLS |

---

## Success Metrics

### Quantitative
- **Onboarding Time**: Reduce from 30min → 5min (83% improvement)
- **Data Completeness**: Increase from 40% → 85%+
- **Adoption Rate**: 70%+ of new clients use upload vs manual
- **Accuracy**: 80%+ of extracted fields require no edits

### Qualitative
- User feedback: "This saved me so much time!"
- Competitive advantage: "Other platforms don't have this"
- Demo impact: Showcase AI-first platform vision

---

## Dependencies

### External Libraries
- **Frontend**: `react-dropzone` (if not using existing FileUpload)
- **Backend**: `pdf-parse`, `mammoth` (docx), `pdf-lib`
- **AI**: Anthropic SDK (`@anthropic-ai/sdk`)

### Supabase Features
- Storage (buckets: `client-intakes`)
- Edge Functions (Deno runtime)
- Realtime (job status subscriptions)
- RLS (secure file access)

### Environment Variables
```bash
ANTHROPIC_API_KEY=sk-ant-...
SUPABASE_URL=https://...
SUPABASE_ANON_KEY=eyJh...
```

---

## Next Steps

1. **Review & Approve** this design with stakeholders
2. **Create Migration**: `20250117000000_client_intake_jobs.sql`
3. **Build Edge Function**: Start with PDF extraction
4. **Implement UI**: ClientIntakeWizard component
5. **Test with Sample Data**: Use 3 real client briefs
6. **Iterate**: Refine prompt based on accuracy
7. **Launch MVP**: Ship to beta users
8. **Gather Feedback**: Track metrics and iterate

---

## Appendix

### Example Extracted Data JSON

```json
{
  "organization": {
    "name": "Hope Foundation",
    "mission": "Ending childhood hunger through community-based programs and sustainable food systems.",
    "vision": "A world where no child goes to bed hungry.",
    "website": "https://hopefoundation.org"
  },
  "voice_tone": {
    "tone_of_voice": "warm, urgent, plain-language",
    "brand_personality": "Compassionate advocate for children. Evidence-based and action-oriented.",
    "style_keywords": ["impact", "community", "hope", "children", "nutrition"],
    "writing_guidelines": "Use active voice. Lead with impact. Avoid jargon."
  },
  "messaging_pillars": [
    {
      "pillar_name": "Every Child Deserves Nutrition",
      "description": "No child should experience hunger. Proper nutrition is a fundamental right.",
      "proof_points": ["Served 50,000 meals last year", "98% of families report improved nutrition"]
    }
  ],
  "donor_stories": [
    {
      "title": "Sarah's Story: From Crisis to Hope",
      "narrative": "When Sarah lost her job...",
      "impact_metrics": "Now feeding 3 children daily",
      "donor_segment": "Monthly sustainers"
    }
  ],
  "audience_segments": [
    {
      "segment_name": "Major Donors",
      "description": "High-net-worth individuals passionate about children's welfare",
      "motivations": "Create lasting impact, see measurable results",
      "communication_preferences": "Quarterly impact reports, exclusive events"
    }
  ],
  "visual_identity": {
    "primary_colors": ["#4F46E5", "#F05A28"],
    "typography": "Clean, modern sans-serif. Inter for headings.",
    "logo_description": "Stylized hands holding a bowl",
    "style_references": "Bright, hopeful, inclusive"
  },
  "campaign_themes": {
    "year_end": "Share the Warmth - Holiday giving campaign",
    "spring": "New Beginnings - Renewal and growth",
    "evergreen": "Feeding Hope, Building Futures"
  },
  "confidence_score": 92,
  "missing_sections": ["primary_colors (exact hex codes)", "logo file"]
}
```

### Sample Client Brief (for Testing)

See: `test-fixtures/sample-client-brief.md`

---

**Document Version:** 1.0
**Last Updated:** 2025-01-17
**Author:** Claude Code
**Status:** Draft for Review
