# Donor Data Lab End-to-End Test Script

## Overview
This test script validates the complete "happy path" workflow from donor file upload through campaign creation with AI-enriched content.

## Prerequisites
- Access to Nexus application
- Sample donor CSV file with clear patterns (see sample data below)
- Client account set up in the system

## Sample Test Data

Create a CSV file named `test_donors_2025.csv` with the following structure:

```csv
donor_id,total_lifetime_giving,gift_count,most_recent_gift,last_gift_date
D001,2500,8,350,2024-12-15
D002,150,2,75,2024-11-20
D003,5000,15,400,2023-08-10
D004,100,1,100,2024-01-05
D005,10000,25,500,2024-12-01
D006,300,5,60,2023-05-15
D007,800,12,100,2024-11-30
D008,50,1,50,2022-06-20
D009,3500,18,250,2024-12-10
D010,200,3,100,2024-10-15
```

**Expected patterns in this data:**
- D005: Major donor, upgrade-ready (high value, recent, multiple gifts)
- D001, D009: Large donors, upgrade-ready
- D007: Strong monthly prospect (consistent giving, moderate amounts)
- D003: At-risk high-value donor (lapsed, previously strong)
- D008: Long-lapsed small donor (reactivation needed)

---

## Test Workflow

### Phase 1: Upload & Analysis

**Steps:**

1. Navigate to a client's Data Lab
   - URL: `/clients/:clientId/data-lab`
   - Verify page loads with "Upload CSV" step active

2. Upload the test CSV file
   - Click "Choose File" or drag & drop `test_donors_2025.csv`
   - **✓ Verify:** File name appears in UI
   - **✓ Verify:** Row count shows "10 rows detected"

3. Map columns
   - Map fields as follows:
     - Donor ID → `donor_id`
     - Lifetime Giving → `total_lifetime_giving`
     - Gift Count → `gift_count`
     - Most Recent Gift → `most_recent_gift`
     - Last Gift Date → `last_gift_date`
   - **✓ Verify:** All required fields show green checkmarks
   - **✓ Verify:** "Run analysis" button becomes enabled

4. Run analysis
   - Click "Run analysis"
   - **✓ Verify:** Progress indicator appears
   - **✓ Verify:** Results step loads within 1-2 seconds

### Phase 2: Results Validation

**Metadata Banner:**
- **✓ Verify:** Shows "Analysis complete"
- **✓ Verify:** Shows "10 donors analyzed from test_donors_2025.csv"
- **✓ Verify:** Shows run timestamp (should be current time)
- **✓ Verify:** Shows "0 rows ignored" (all donors have IDs)

**Summary Tiles:**
- **✓ Verify:** "Donors analyzed" = 10
- **✓ Verify:** "Suggested segments" shows a number (typically 6-8)
- **✓ Verify:** "Median lifetime giving" and "Median gift count" show reasonable values

**Filter Pills:**
- Click "All donors" (should be active by default)
  - **✓ Verify:** Shows all 10 donors
- Click "Upgrade-ready"
  - **✓ Verify:** Count updates (expect 3-4 donors: D001, D005, D009)
  - **✓ Verify:** Donor table shows only upgrade-ready donors
- Click "Monthly prospects"
  - **✓ Verify:** Count updates (expect 2-3 donors)
  - **✓ Verify:** Donor table filters correctly
- Click "High-value at risk"
  - **✓ Verify:** Shows at-risk donors (expect D003)

**Donor Table:**
- **✓ Verify:** Each row shows:
  - Donor ID (e.g., D001, D005)
  - Value tier badge (Small/Medium/Large/Major)
  - Recency tier badge (Recent/At-risk/Lapsed/Long-lapsed)
  - Upgrade flag (green checkmark for ready donors)
  - Monthly flag (blue checkmark for prospects)
  - Ask ladder with 4 amounts (100%, 125%, 150%, 200%)

**Sample Ask Ladder Validation:**
For D001 (most recent gift $350):
- **✓ Verify:** Ask ladder shows approximately: $350, $440, $525, $700
- **✓ Verify:** Amounts are nicely rounded (nearest $5 or $10)

**Export Buttons:**
- **✓ Verify:** "Quick exports" section appears
- **✓ Verify:** Each button shows correct count:
  - Upgrade-ready (3-4)
  - Monthly prospects (2-3)
  - Core high-value (2-3)
  - Monthly seed (2-3)

**Strategy Recommendations:**
- **✓ Verify:** "Strategy & Next Steps" panel appears
- **✓ Verify:** Shows sections for:
  - Strategy Overview
  - Upgrade strategy
  - Monthly giving strategy
  - Reactivation strategy
  - Lookalike audience strategy
  - Channel & cadence notes
- **✓ Verify:** Text is natural language, specific to the data (mentions counts, percentages)

### Phase 3: Segment Creation

**Suggested Segments Panel:**
- **✓ Verify:** Shows 6-8 suggested segments
- **✓ Verify:** Each segment shows:
  - Name (e.g., "Upgrade-ready core donors")
  - Description
  - Donor count
  - "Export CSV" button
  - "Create segment" button

**Create Segments:**

1. Click "Create segment" on "Upgrade-ready core donors"
   - **✓ Verify:** Success toast appears: "Segment 'Upgrade-ready core donors' created successfully!"
   - **✓ Verify:** Toast disappears after a few seconds

2. Click "Create segment" on "Monthly giving prospects"
   - **✓ Verify:** Success toast appears with segment name

3. Click "Create segment" on "At-risk high-value donors"
   - **✓ Verify:** Success toast appears

**Verify in Segmentation Tab:**

1. Navigate to `/clients/:clientId/segmentation`
   - **✓ Verify:** Page loads with segment list

2. Check for created segments
   - **✓ Verify:** "Upgrade-ready core donors" appears in list
   - **✓ Verify:** "Monthly giving prospects" appears
   - **✓ Verify:** "At-risk high-value donors" appears
   - **✓ Verify:** Each shows:
     - Name and description from Lab
     - Category (e.g., "giving_pattern", "recency")
     - Active status = true

3. Return to Data Lab (`/clients/:clientId/data-lab`)
   - **✓ Verify:** "Start Campaign" button now appears
   - **✓ Verify:** Button text shows "(3 segments)" (matching created count)

### Phase 4: Campaign Integration

**Start Campaign Navigation:**

1. Click "Start Campaign (3 segments)" button
   - **✓ Verify:** Navigates to `/clients/:clientId/campaigns/new`
   - **✓ Verify:** URL includes query params: `?segments=seg_xxx,seg_yyy,seg_zzz`
   - **✓ Verify:** Three segment IDs appear in the URL

**Campaign Builder Pre-selection:**

1. In Campaign Builder page
   - **✓ Verify:** Segment selector shows the 3 created segments
   - **✓ Verify:** Segments are pre-selected/highlighted
   - **✓ Verify:** Segment names match those created in Lab

2. Look for source indicator (if implemented)
   - **✓ Verify:** Shows message like "Pre-populated from Nexus Donor Data Lab analysis on [date]"
   - (Optional feature - may not be present yet)

### Phase 5: AI Context Enrichment

**Verify AI Boost Indicators:**

1. Look for AI drafting sections
   - **✓ Verify:** Badge or indicator shows "✨ Powered by your latest Donor Data Lab analysis"
   - (Optional feature - may not be present yet)

**Test AI Enrichment (Manual Verification):**

1. In browser console, test AI context service:
```javascript
import { hasLabContext, getLabContextSummary, enrichPromptWithLabContext }
  from '@/services/donorDataLabAIContext';

const clientId = '[your-test-client-id]';

// Should return true
console.log('Has context:', hasLabContext(clientId));

// Should show summary
console.log('Summary:', getLabContextSummary(clientId));

// Test enrichment
const basePrompt = "Write a fundraising email for upgrade prospects.";
const enriched = enrichPromptWithLabContext(clientId, basePrompt, 'upgrade');
console.log('Enriched prompt:', enriched);
```

**Expected enriched prompt structure:**
- Starts with context header (file name, donor count, analysis date)
- Includes "Donor File Strategy Overview" section
- Includes "Upgrade Strategy" section with specific recommendations
- Ends with separator (`---`) then original prompt

**✓ Verify:** Enriched prompt includes:
- Specific donor counts from your test data (e.g., "10 donors analyzed")
- File name "test_donors_2025.csv"
- Today's date
- Specific upgrade strategy recommendations
- Original prompt at the end

### Phase 6: Export Validation

**Test CSV Exports:**

1. Back in Data Lab Results, click "Upgrade-ready" export
   - **✓ Verify:** CSV file downloads (`upgrade_ready_donors.csv`)
   - **✓ Verify:** File contains correct headers
   - **✓ Verify:** Contains only upgrade-ready donors (3-4 rows)
   - **✓ Verify:** Includes ask ladder columns

2. Click "Monthly prospects" export
   - **✓ Verify:** Downloads `monthly_prospects.csv`
   - **✓ Verify:** Contains only monthly prospects

3. Click "Core high-value" export
   - **✓ Verify:** Downloads `lookalike_seed_core_high_value.csv`
   - **✓ Verify:** Contains high-value donors for lookalike targeting

**Segment Export:**

1. In Suggested Segments panel, click "Export CSV" on any segment
   - **✓ Verify:** Downloads with segment name in filename
   - **✓ Verify:** Contains correct donor subset

### Phase 7: Persistence Validation

**Lab Run History:**

1. In browser console:
```javascript
import { getLabRuns, getLatestLabRun } from '@/services/donorDataLabPersistence';

const clientId = '[your-test-client-id]';
const runs = getLabRuns(clientId);
console.log('All runs:', runs);

const latest = getLatestLabRun(clientId);
console.log('Latest run:', latest);
```

**✓ Verify:**
- `runs` array contains at least 1 entry
- Latest run includes:
  - `runId`
  - `fileName: "test_donors_2025.csv"`
  - `rowsProcessed: 10`
  - `rowsIgnored: 0`
  - `analysis` object with donors array
  - `recommendations` object with strategy text

**Run Another Analysis:**

1. Click "Start a new analysis"
   - **✓ Verify:** Returns to upload step
   - **✓ Verify:** Form is reset
   - **✓ Verify:** Created segment count resets to 0

2. Upload the same CSV again
   - **✓ Verify:** Analysis runs successfully
   - **✓ Verify:** New run is saved (check console: `getLabRuns(clientId).length` increased)

3. Check localStorage:
```javascript
const storageKey = `nexus_lab_runs_${clientId}`;
const stored = JSON.parse(localStorage.getItem(storageKey));
console.log('Stored runs:', stored.length);
```

**✓ Verify:** Multiple runs are stored (max 10)

---

## Edge Cases to Test

### Missing Data Handling

**Test CSV with missing donor IDs:**
```csv
donor_id,total_lifetime_giving,gift_count,most_recent_gift,last_gift_date
D001,2500,8,350,2024-12-15
,150,2,75,2024-11-20
D003,5000,15,400,2023-08-10
```

**✓ Verify:**
- Analysis runs
- Shows "1 row ignored (missing donor ID)"
- Only 2 donors appear in results

### Invalid Date Formats

**Test CSV with bad dates:**
```csv
donor_id,total_lifetime_giving,gift_count,most_recent_gift,last_gift_date
D001,2500,8,350,invalid-date
```

**✓ Verify:**
- Analysis runs (gracefully handles invalid dates)
- Donor is classified as "long_lapsed" (fallback behavior)

### Zero/Negative Values

**Test CSV with edge case amounts:**
```csv
donor_id,total_lifetime_giving,gift_count,most_recent_gift,last_gift_date
D001,0,0,0,2024-01-01
D002,-100,5,50,2024-01-01
```

**✓ Verify:**
- Analysis handles edge cases without crashing
- Ask ladders show sensible defaults (minimum amounts)

---

## Performance Validation

**Large File Test:**
- Create CSV with 1,000+ donors
- **✓ Verify:** Upload completes within 3 seconds
- **✓ Verify:** Analysis completes within 5 seconds
- **✓ Verify:** Results render without lag
- **✓ Verify:** Donor table shows pagination/scrolling

**Browser Compatibility:**
- Test in Chrome ✓
- Test in Firefox ✓
- Test in Safari ✓

---

## Cleanup & Reset

After testing:

1. **Clear created segments:**
   - In browser console:
   ```javascript
   const clientId = '[your-test-client-id]';
   localStorage.removeItem(`nexus_segments_${clientId}`);
   ```

2. **Clear lab runs:**
   ```javascript
   localStorage.removeItem(`nexus_lab_runs_${clientId}`);
   ```

3. **Refresh page** to verify clean slate

---

## Success Criteria

All checkmarks (✓) should pass for the feature to be considered production-ready.

**Critical Path (Must Pass):**
- ✓ Upload → Map → Analyze workflow completes
- ✓ Results display correctly with metadata
- ✓ Segments create and appear in Segmentation tab
- ✓ "Start Campaign" navigates with correct URL params
- ✓ AI context enrichment includes donor data

**Polish (Nice to Have):**
- ✓ Source indicator in Campaign Builder
- ✓ "AI Boost Available" badges
- ✓ All export buttons work correctly
- ✓ Toasts appear and dismiss properly

---

## Troubleshooting

**Issue:** Analysis doesn't run
- **Check:** All required columns are mapped
- **Check:** CSV has valid data in at least one row

**Issue:** Segments don't appear in Segmentation tab
- **Check:** localStorage is enabled
- **Check:** Client ID is consistent across pages
- **Check:** No console errors during segment creation

**Issue:** "Start Campaign" button doesn't appear
- **Check:** At least one segment was created
- **Check:** `createdSegmentIds` state is populated (check React DevTools)

**Issue:** AI context is empty
- **Check:** Lab run was saved (check `getLatestLabRun(clientId)`)
- **Check:** `clientId` parameter is correct
- **Check:** Run date is recent

---

## Reporting Issues

When reporting test failures, include:

1. **Step number** where failure occurred
2. **Expected behavior** (from checklist)
3. **Actual behavior** observed
4. **Browser** and version
5. **Console errors** (if any)
6. **Screenshot** of issue

Example:
> **Phase 3, Step 2:** Expected success toast for "Monthly giving prospects" segment creation, but received error toast "Failed to create segment". Chrome 120. Console shows: `TypeError: Cannot read property 'segmentId' of undefined`.
