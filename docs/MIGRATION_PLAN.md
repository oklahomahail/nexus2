# Nexus Migration Plan
## Aligning Current Implementation with Structure Documents

**Created:** 2025-01-13
**Status:** Ready for Implementation

---

## Executive Summary

The Nexus codebase is **80-90% complete** with a solid foundation. The primary work ahead is **connecting existing components to live data** and **adding Track15-specific features** rather than building new infrastructure.

### Current State
- ✅ All UI primitives implemented (19 components)
- ✅ Complete service layer (client, campaign, analytics, brand, donor intel)
- ✅ Comprehensive Supabase schema (17+ tables)
- ✅ Core contexts (Client, Analytics, Auth, Toast, Notifications)
- ✅ Full routing structure with lazy loading
- ⚠️ Dashboard pages exist but some use mock data
- ❌ Knowledge Base UI not implemented
- ❌ Track15 campaign methodology not integrated

### What Structure Documents Propose
The two structure documents propose a **Track15-aligned dashboard** with:
1. Three-panel client dashboard (Campaign Engine, Analytics, Knowledge Base)
2. Track15 campaign creation workflow (story-first, seasonal arcs)
3. Client knowledge base system (Brand, Voice, Messaging Pillars, SOPs, Assets, Donor Narratives)
4. Track15-specific analytics (retention rates, segment performance, YoY lift)

---

## Gap Analysis

### What Exists vs What's Needed

| Feature | Current Status | Structure Doc Spec | Action Required |
|---------|---------------|-------------------|-----------------|
| **UI Primitives** | ✅ All 19 exist | Panel, Card, Button, Modal, etc. | ✅ None - already complete |
| **Client Dashboard** | ⚠️ Exists with mock data | Three-panel layout | 🔧 Refactor to new layout |
| **Campaign Engine** | ⚠️ Builder exists | Track15 workflow | 🔧 Add Track15 methodology |
| **Analytics Section** | ⚠️ Context exists | Track15 KPIs | 🔧 Add retention, segment metrics |
| **Knowledge Base** | ❌ Not implemented | 6-tab system | ➕ Build from scratch |
| **Client Services** | ✅ Fully implemented | CRUD operations | ✅ Already complete |
| **Campaign Services** | ✅ Fully implemented | CRUD operations | ✅ Already complete |
| **Brand Services** | ✅ Fully implemented | Brand profiles | ✅ Already complete |
| **Supabase Tables** | ⚠️ Core tables exist | Need KB tables | ➕ Add 6 new tables |
| **AppContext** | ⚠️ Specialized contexts | Unified reducer | 🤔 Decide on approach |

---

## Decision Points

### 1. Context Architecture

**Current:** Specialized contexts (ClientContext, AnalyticsContext, etc.)
**Structure Doc:** Unified AppContext with reducer pattern

**Recommendation:** **Keep current specialized contexts**

**Rationale:**
- Current architecture is cleaner and more modular
- Each context has a single responsibility
- Better performance (components only subscribe to what they need)
- Already working well

**Impact:** Structure document code samples will need adaptation

---

### 2. Knowledge Base Tables

**Current:** Only brand-related tables exist
**Structure Doc:** Proposes 6 new tables for voice, messaging, SOPs, assets, narratives

**Current Brand Tables:**
```sql
- brand_profiles (name, mission, tagline, primary_color, website, logo_url)
- brand_assets (type, url, description, metadata)
- brand_corpus (title, content, type, metadata)
```

**Proposed New Tables:**
```sql
- client_voice (voice_description, tone_guidelines, examples)
- client_messaging (pillars, impact_language, value_prop)
- client_sops (title, content, json_content)
- client_assets (already exists as brand_assets)
- client_donor_narratives (title, narrative, tags)
```

**Recommendation:** **Extend existing brand system, add 3 new tables**

**New Tables Needed:**
1. `client_voice` - Voice and tone guidelines
2. `client_messaging` - Messaging pillars and positioning
3. `client_donor_narratives` - Donor stories repository

**Adapt Existing:**
- Keep `brand_profiles` as-is
- Rename `brand_assets` → `client_assets` (or alias)
- Keep `brand_corpus` for general content
- Repurpose `client_sops` concept into `brand_corpus` with type filter

---

### 3. Campaign Creation Workflow

**Current:** Generic wizard with AI generation
**Structure Doc:** Track15 methodology (seasonal, story-first, cultivation→solicitation)

**Recommendation:** **Enhance existing wizard with Track15 stages**

**Add to Campaign Builder:**
1. Campaign season selection (Spring, Summer, NTXGD, End-of-Year, Custom)
2. Core story definition (anchor, imagery, emotional center)
3. Narrative arc builder (cultivation sequence → solicitation sequence)
4. Segmentation rules (current, lapsed, high-value, prospects, monthly candidates)
5. Channel plan (email, social, mail, ads, events)

---

## Implementation Plan

### Phase 1: Data Layer Foundation (Week 1)
**Goal:** Add missing database tables and extend services

#### Tasks
1. **Add Knowledge Base Tables**
   - Create migration: `20250113000000_knowledge_base_tables.sql`
   - Add tables: `client_voice`, `client_messaging`, `client_donor_narratives`
   - Add RLS policies for new tables
   - Run migration in Supabase

2. **Create Knowledge Base Service**
   - Create `src/services/knowledgeBaseService.ts`
   - Methods for voice, messaging, narratives CRUD
   - Follow existing service patterns (type mapping, error handling)

3. **Extend Analytics Service**
   - Add Track15 metrics: retention rate, YoY growth, segment performance
   - Add seasonal analysis functions
   - Add channel attribution tracking

**Deliverables:**
- ✅ Migration file
- ✅ knowledgeBaseService.ts
- ✅ Extended analyticsService.ts

---

### Phase 2: Knowledge Base UI (Week 2)
**Goal:** Build the 6-tab knowledge base interface

#### Tasks
1. **Create Knowledge Base Components**
   - `src/components/knowledge/BrandGuidelines.tsx` (already exists via BrandProfilePanel)
   - `src/components/knowledge/VoiceTone.tsx` (new)
   - `src/components/knowledge/MessagingPillars.tsx` (new)
   - `src/components/knowledge/SOPs.tsx` (adapt from brand corpus)
   - `src/components/knowledge/ClientAssets.tsx` (adapt from brand assets)
   - `src/components/knowledge/DonorNarratives.tsx` (new)

2. **Create Knowledge Base Section**
   - `src/components/dashboard/KnowledgeBaseSection.tsx`
   - Tabbed interface
   - Connects to knowledgeBaseService

3. **Add Knowledge Base Context** (optional)
   - `src/context/KnowledgeBaseContext.tsx`
   - Manages KB state and caching
   - Or extend ClientContext

**Deliverables:**
- ✅ 6 knowledge base components
- ✅ KnowledgeBaseSection.tsx
- ✅ Context or hooks for KB data

---

### Phase 3: Dashboard Refactor (Week 2-3)
**Goal:** Implement three-panel client dashboard layout

#### Tasks
1. **Create Dashboard Sections**
   - `src/components/dashboard/CampaignEngineSection.tsx`
   - `src/components/dashboard/AnalyticsSection.tsx`
   - `src/components/dashboard/KnowledgeBaseSection.tsx` (from Phase 2)

2. **Refactor ClientDashboard Page**
   - Replace mock data with AnalyticsContext
   - Implement three-panel layout
   - Make Campaign Engine section dominant
   - Add quick actions and shortcuts

3. **Connect Live Data**
   - Replace all hardcoded data in ClientDashboard
   - Replace all hardcoded data in ClientCampaigns
   - Ensure all metrics pull from AnalyticsContext
   - Test data refresh and polling

**Deliverables:**
- ✅ Three dashboard section components
- ✅ Refactored ClientDashboard.tsx
- ✅ Live data integration complete

---

### Phase 4: Track15 Campaign Workflow (Week 3-4)
**Goal:** Integrate Track15 campaign methodology into campaign builder

#### Tasks
1. **Extend Campaign Schema**
   - Add fields to campaigns table:
     - `season` (spring, summer, ntxgd, eoy, custom)
     - `core_story` (jsonb: anchor, imagery, emotional_center)
     - `narrative_arc` (jsonb: cultivation_sequence, solicitation_sequence)
     - `segmentation_rules` (jsonb)
     - `channel_plan` (jsonb)
   - Create migration
   - Update TypeScript types

2. **Enhance Campaign Builder Wizard**
   - Add Track15 workflow steps:
     - Step 1: Campaign season selection
     - Step 2: Core story definition
     - Step 3: Narrative arc builder
     - Step 4: Segmentation rules
     - Step 5: Channel plan
     - Step 6: Asset requirements
   - Pull messaging pillars from Knowledge Base
   - Auto-generate templates based on brand voice

3. **Update Campaign Designer Service**
   - Enhance AI prompts to use Track15 methodology
   - Incorporate messaging pillars from KB
   - Generate cultivation + solicitation sequences
   - Add seasonal campaign templates

4. **Create Campaign Templates**
   - Spring cultivation template
   - Summer emergency fund template
   - NTXGD template
   - End-of-year template
   - Auto-populate from Knowledge Base

**Deliverables:**
- ✅ Extended campaign schema
- ✅ Track15-enhanced campaign builder
- ✅ Updated AI campaign designer
- ✅ Campaign templates library

---

### Phase 5: Analytics Enhancement (Week 4-5)
**Goal:** Add Track15-specific analytics and insights

#### Tasks
1. **Implement Track15 Metrics**
   - Year-over-year retention
   - Renewal rates by segment
   - Lapsed reactivation rates
   - Campaign lift week-over-week
   - Matching gift impact
   - Channel attribution
   - CTA performance tracking

2. **Create Analytics Components**
   - `RetentionChart.tsx` - Cohort retention visualization
   - `SegmentPerformance.tsx` - Segment comparison
   - `CampaignLiftChart.tsx` - Weekly lift tracking
   - `ChannelAttribution.tsx` - Multi-touch attribution

3. **Update Analytics Dashboard**
   - Add Track15 metric cards
   - Add segment performance section
   - Add campaign comparison tools
   - Add seasonal trend analysis

**Deliverables:**
- ✅ Track15 metrics in analyticsService
- ✅ New analytics components
- ✅ Enhanced analytics dashboard

---

### Phase 6: Polish & Integration (Week 5-6)
**Goal:** Connect all pieces and ensure smooth workflows

#### Tasks
1. **Cross-Feature Integration**
   - Knowledge Base → Campaign Builder flow
   - Campaign Builder → Analytics tracking
   - Brand guidelines enforcement in templates
   - Messaging pillars auto-population

2. **User Experience Polish**
   - Add loading states
   - Add empty states with helpful prompts
   - Add error handling and recovery
   - Add success notifications
   - Add keyboard shortcuts

3. **Documentation**
   - Update README with new features
   - Create Track15 methodology guide
   - Document Knowledge Base usage
   - Add campaign creation best practices

4. **Testing**
   - Test Knowledge Base CRUD operations
   - Test campaign creation with Track15 flow
   - Test analytics calculation accuracy
   - Test data refresh and caching

**Deliverables:**
- ✅ Integrated feature workflows
- ✅ Polished UX
- ✅ Complete documentation
- ✅ Tested features

---

## Technical Implementation Details

### New Database Tables

#### 1. client_voice

```sql
create table if not exists public.client_voice (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.clients(id) on delete cascade not null,
  voice_description text,
  tone_guidelines text,
  donor_language_rules text, -- Track15 specific: how to address donors
  examples jsonb, -- { positive: [], negative: [] }
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(client_id)
);

-- RLS
alter table public.client_voice enable row level security;

create policy "Users can view voice for their clients"
  on public.client_voice for select
  using (
    exists (
      select 1 from public.client_memberships
      where client_memberships.client_id = client_voice.client_id
      and client_memberships.user_id = auth.uid()
    )
  );

create policy "Users can update voice for their clients"
  on public.client_voice for all
  using (
    exists (
      select 1 from public.client_memberships
      where client_memberships.client_id = client_voice.client_id
      and client_memberships.user_id = auth.uid()
      and client_memberships.role in ('owner', 'admin')
    )
  );
```

#### 2. client_messaging

```sql
create table if not exists public.client_messaging (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.clients(id) on delete cascade not null,
  pillars jsonb, -- [{ title, description, examples }]
  impact_language text,
  value_proposition text,
  problem_statement text, -- Track15: clear articulation of need
  vision_statement text, -- Track15: aspirational future state
  point_of_view text, -- Track15: distinctive organizational stance
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(client_id)
);

-- RLS (similar to client_voice)
alter table public.client_messaging enable row level security;

create policy "Users can view messaging for their clients"
  on public.client_messaging for select
  using (
    exists (
      select 1 from public.client_memberships
      where client_memberships.client_id = client_messaging.client_id
      and client_memberships.user_id = auth.uid()
    )
  );

create policy "Users can update messaging for their clients"
  on public.client_messaging for all
  using (
    exists (
      select 1 from public.client_memberships
      where client_memberships.client_id = client_messaging.client_id
      and client_memberships.user_id = auth.uid()
      and client_memberships.role in ('owner', 'admin')
    )
  );
```

#### 3. client_donor_narratives

```sql
create table if not exists public.client_donor_narratives (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.clients(id) on delete cascade not null,
  title text not null,
  narrative text not null,
  donor_role text, -- Track15: compassionate problem solver, etc.
  emotional_center text, -- Track15: hope, urgency, belonging, etc.
  story_type text, -- donor_story, impact_story, testimonial, case_study
  tags text[],
  metadata jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS
alter table public.client_donor_narratives enable row level security;

create policy "Users can view narratives for their clients"
  on public.client_donor_narratives for select
  using (
    exists (
      select 1 from public.client_memberships
      where client_memberships.client_id = client_donor_narratives.client_id
      and client_memberships.user_id = auth.uid()
    )
  );

create policy "Users can manage narratives for their clients"
  on public.client_donor_narratives for all
  using (
    exists (
      select 1 from public.client_memberships
      where client_memberships.client_id = client_donor_narratives.client_id
      and client_memberships.user_id = auth.uid()
      and client_memberships.role in ('owner', 'admin')
    )
  );
```

#### 4. Extend campaigns table

```sql
-- Add Track15 fields to existing campaigns table
alter table public.campaigns add column if not exists season text
  check (season in ('spring', 'summer', 'ntxgd', 'eoy', 'custom'));

alter table public.campaigns add column if not exists core_story jsonb;
-- { anchor: string, imagery_direction: string, emotional_center: string }

alter table public.campaigns add column if not exists narrative_arc jsonb;
-- {
--   story_statement: string,
--   cultivation_sequence: string[],
--   solicitation_sequence: string[],
--   cta_logic: string,
--   donor_role: string
-- }

alter table public.campaigns add column if not exists segmentation_rules jsonb;
-- {
--   current_donors: {...},
--   lapsed_donors: {...},
--   high_value_donors: {...},
--   prospects: {...},
--   monthly_candidates: {...}
-- }

alter table public.campaigns add column if not exists channel_plan jsonb;
-- {
--   emails: [...],
--   social: [...],
--   mail: [...],
--   ads: [...],
--   events: [...]
-- }

alter table public.campaigns add column if not exists assets_required jsonb;
-- { photos: [...], testimonials: [...], brand_kit: [...], templates: [...] }
```

---

### Service Layer Updates

#### knowledgeBaseService.ts Structure

```typescript
import { supabase } from '@/lib/supabaseClient';

// Types
export interface VoiceProfile {
  id: string;
  clientId: string;
  voiceDescription: string | null;
  toneGuidelines: string | null;
  donorLanguageRules: string | null;
  examples: { positive: string[]; negative: string[] } | null;
}

export interface MessagingProfile {
  id: string;
  clientId: string;
  pillars: Array<{ title: string; description: string; examples: string[] }> | null;
  impactLanguage: string | null;
  valueProposition: string | null;
  problemStatement: string | null;
  visionStatement: string | null;
  pointOfView: string | null;
}

export interface DonorNarrative {
  id: string;
  clientId: string;
  title: string;
  narrative: string;
  donorRole: string | null;
  emotionalCenter: string | null;
  storyType: string | null;
  tags: string[] | null;
  metadata: any;
}

// Service methods
export const knowledgeBaseService = {
  // Voice & Tone
  async getVoice(clientId: string): Promise<VoiceProfile | null> { },
  async upsertVoice(clientId: string, data: Partial<VoiceProfile>): Promise<VoiceProfile> { },

  // Messaging
  async getMessaging(clientId: string): Promise<MessagingProfile | null> { },
  async upsertMessaging(clientId: string, data: Partial<MessagingProfile>): Promise<MessagingProfile> { },

  // Donor Narratives
  async listNarratives(clientId: string): Promise<DonorNarrative[]> { },
  async getNarrative(id: string): Promise<DonorNarrative> { },
  async createNarrative(clientId: string, data: Partial<DonorNarrative>): Promise<DonorNarrative> { },
  async updateNarrative(id: string, data: Partial<DonorNarrative>): Promise<DonorNarrative> { },
  async deleteNarrative(id: string): Promise<void> { },
};
```

---

### Component Structure

#### Dashboard Layout

```
ClientDashboard.tsx
├── CampaignEngineSection.tsx
│   ├── Create Campaign CTA
│   ├── Active Campaigns List
│   ├── Timeline Shortcuts
│   └── Template Access
├── AnalyticsSection.tsx
│   ├── Donations Last 30 Days
│   ├── Donor Segments Chart
│   ├── Trend Cards
│   └── View Full Analytics CTA
└── KnowledgeBaseSection.tsx
    ├── Tab: Brand Guidelines
    ├── Tab: Voice & Tone
    ├── Tab: Messaging Pillars
    ├── Tab: SOPs
    ├── Tab: Assets
    └── Tab: Donor Narratives
```

---

## File Locations Reference

### New Files to Create

```
src/
  services/
    knowledgeBaseService.ts                    # Phase 1
  components/
    dashboard/
      CampaignEngineSection.tsx                # Phase 3
      AnalyticsSection.tsx                     # Phase 3
      KnowledgeBaseSection.tsx                 # Phase 2
    knowledge/
      VoiceTone.tsx                            # Phase 2
      MessagingPillars.tsx                     # Phase 2
      DonorNarratives.tsx                      # Phase 2
      SOPs.tsx                                 # Phase 2 (adapt from brand corpus)
      ClientAssets.tsx                         # Phase 2 (adapt from brand assets)
    analytics/
      RetentionChart.tsx                       # Phase 5
      SegmentPerformance.tsx                   # Phase 5
      CampaignLiftChart.tsx                    # Phase 5
      ChannelAttribution.tsx                   # Phase 5
  context/
    KnowledgeBaseContext.tsx                   # Phase 2 (optional)

supabase/
  migrations/
    20250113000000_knowledge_base_tables.sql   # Phase 1
    20250113000001_extend_campaigns.sql        # Phase 4

docs/
  TRACK15_METHODOLOGY.md                       # Phase 6
  KNOWLEDGE_BASE_GUIDE.md                      # Phase 6
```

### Files to Modify

```
src/
  services/
    analyticsService.ts                        # Phase 1, Phase 5
    campaignService.ts                         # Phase 4
    campaignDesignService.ts                   # Phase 4
  pages/
    client/
      ClientDashboard.tsx                      # Phase 3
      ClientCampaigns.tsx                      # Phase 3
      ClientAnalytics.tsx                      # Phase 5
  panels/
    CampaignDesignerWizard.tsx                 # Phase 4
  types/
    database.types.ts                          # Auto-generated after migrations
```

---

## Success Criteria

### Phase 1 Complete When:
- [ ] All 3 new tables created in Supabase
- [ ] knowledgeBaseService.ts passes manual testing
- [ ] analyticsService includes retention and segment metrics
- [ ] Migration successfully applied

### Phase 2 Complete When:
- [ ] All 6 KB components render correctly
- [ ] KnowledgeBaseSection tabs switch properly
- [ ] Data loads from knowledgeBaseService
- [ ] Can create/edit/delete narratives

### Phase 3 Complete When:
- [ ] ClientDashboard shows real data (no mock data)
- [ ] Three-panel layout matches design
- [ ] Campaign Engine section is visually dominant
- [ ] All metrics refresh on client selection

### Phase 4 Complete When:
- [ ] Campaign builder includes all Track15 steps
- [ ] Campaign creation pulls from Knowledge Base
- [ ] AI generates Track15-compliant campaigns
- [ ] Seasonal templates available

### Phase 5 Complete When:
- [ ] All Track15 metrics calculate correctly
- [ ] New analytics components render
- [ ] ClientAnalytics page shows Track15 insights
- [ ] Segment performance tracking works

### Phase 6 Complete When:
- [ ] Knowledge Base → Campaign flow seamless
- [ ] All empty states have helpful prompts
- [ ] Documentation complete
- [ ] All features tested end-to-end

---

## Risk Assessment

### Low Risk
- **Phase 1-2:** Straightforward CRUD, follows existing patterns
- **Phase 3:** UI refactor, existing data layer

### Medium Risk
- **Phase 4:** Complex campaign logic, AI prompt changes
- **Phase 5:** Analytics calculation accuracy

### High Risk
- None identified

### Mitigation Strategies
1. **Incremental rollout:** Each phase is independently testable
2. **Feature flags:** Gate new features during development
3. **Backward compatibility:** Existing campaigns continue working
4. **Data validation:** Schema constraints prevent bad data
5. **Testing:** Manual testing at each phase gate

---

## Timeline Summary

| Phase | Duration | Key Deliverable |
|-------|----------|----------------|
| Phase 1 | 3-5 days | Knowledge Base tables + service |
| Phase 2 | 5-7 days | Knowledge Base UI complete |
| Phase 3 | 5-7 days | Dashboard refactor with live data |
| Phase 4 | 7-10 days | Track15 campaign workflow |
| Phase 5 | 5-7 days | Track15 analytics |
| Phase 6 | 5-7 days | Polish and integration |
| **Total** | **5-6 weeks** | Full Track15 integration |

---

## Next Steps

1. **Review this migration plan** with stakeholders
2. **Create feature branch:** `feat/track15-integration`
3. **Start Phase 1:** Create database migration file
4. **Daily standups:** Track progress against phases
5. **Demo at each phase gate:** Validate direction before proceeding

---

## Notes

### Why This Approach Works
1. **Builds on existing foundation:** 80% of infrastructure already exists
2. **Incremental:** Each phase delivers value independently
3. **Low risk:** No breaking changes to existing features
4. **Track15-first:** Methodology embedded throughout, not bolted on
5. **Data-driven:** Real Supabase data, no mock data

### Architecture Decisions
- **Keep specialized contexts:** Better than monolithic AppContext
- **Extend existing tables:** Minimal schema changes
- **Leverage existing UI kit:** No new primitives needed
- **Adapt Structure Doc patterns:** Align with current codebase conventions

### Post-Launch Enhancements
- Advanced segmentation builder
- Campaign performance forecasting
- A/B testing framework
- Multi-channel journey builder
- Automated reporting
