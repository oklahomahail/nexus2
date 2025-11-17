# Client Onboarding Upload - Implementation Guide

## Phase 1 MVP Implementation Complete ✅

All core components have been created. Follow this guide to deploy and test.

---

## Files Created

### Database

- ✅ [supabase/migrations/20250117000000_client_intake_jobs.sql](supabase/migrations/20250117000000_client_intake_jobs.sql)
  - Creates `client_intake_jobs` table
  - Sets up storage bucket `client-intakes`
  - Configures RLS policies

### Edge Function

- ✅ [supabase/functions/process-client-intake/index.ts](supabase/functions/process-client-intake/index.ts)
- ✅ [supabase/functions/process-client-intake/extractors/pdf.ts](supabase/functions/process-client-intake/extractors/pdf.ts)
- ✅ [supabase/functions/process-client-intake/extractors/text.ts](supabase/functions/process-client-intake/extractors/text.ts)
- ✅ [supabase/functions/process-client-intake/prompts/brandIntakeParser.ts](supabase/functions/process-client-intake/prompts/brandIntakeParser.ts)

### Frontend

- ✅ [src/types/clientIntake.ts](src/types/clientIntake.ts)
- ✅ [src/services/clientIntakeService.ts](src/services/clientIntakeService.ts)
- ✅ [src/hooks/useIntakeJob.ts](src/hooks/useIntakeJob.ts)
- ✅ [src/components/client/ClientIntakeWizard.tsx](src/components/client/ClientIntakeWizard.tsx)
- ✅ [src/components/client/IntakeJobStatus.tsx](src/components/client/IntakeJobStatus.tsx)
- ✅ [src/components/client/BrandProfileReview.tsx](src/components/client/BrandProfileReview.tsx)

---

## Deployment Steps

### Step 1: Apply Database Migration

```bash
# Run the migration in Supabase SQL Editor
# URL: https://supabase.com/dashboard/project/sdgkpehhzysjofcpvdbo/sql/new

# Copy contents of:
supabase/migrations/20250117000000_client_intake_jobs.sql
```

Or via CLI:

```bash
npx supabase db push
```

**Verify:**

- Table `client_intake_jobs` exists
- Storage bucket `client-intakes` created
- RLS policies applied

### Step 2: Deploy Edge Function

```bash
# Deploy the Edge Function
npx supabase functions deploy process-client-intake

# Set environment variables
npx supabase secrets set ANTHROPIC_API_KEY=your_key_here
```

**Environment Variables Required:**

```bash
ANTHROPIC_API_KEY=sk-ant-...
SUPABASE_URL=https://sdgkpehhzysjofcpvdbo.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

**Verify:**

- Function shows in Supabase Dashboard → Edge Functions
- Environment variables set
- Function invocable

### Step 3: Update TypeScript Database Types

```bash
# Generate updated types from Supabase
npx supabase gen types typescript --project-id sdgkpehhzysjofcpvdbo > src/lib/database.types.ts
```

### Step 4: Test the Edge Function

```bash
# Test locally (optional)
npx supabase functions serve process-client-intake --env-file .env.local

# Or test deployed function
curl -i --location --request POST 'https://sdgkpehhzysjofcpvdbo.supabase.co/functions/v1/process-client-intake' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"fileUrl":"test.pdf","clientId":"...","jobId":"...","fileType":"application/pdf"}'
```

---

## Integration Guide

### Add to "New Client" Flow

**Option 1: Standalone Button**

In your client list or dashboard, add:

```tsx
import { ClientIntakeWizard } from "@/components/client/ClientIntakeWizard";
import { useState } from "react";

function ClientDashboard() {
  const [showIntakeWizard, setShowIntakeWizard] = useState(false);
  const clientId = "00000000-0000-0000-0000-000000000001"; // Current client

  return (
    <>
      <Button onClick={() => setShowIntakeWizard(true)}>
        Upload Brand Brief
      </Button>

      <ClientIntakeWizard
        isOpen={showIntakeWizard}
        onClose={() => setShowIntakeWizard(false)}
        clientId={clientId}
        onSuccess={(brandProfileId) => {
          console.log("Brand profile created:", brandProfileId);
          // Redirect or refresh
          window.location.href = `/client/${clientId}/brand`;
        }}
      />
    </>
  );
}
```

**Option 2: Integrate into Existing Client Creation**

Modify existing client creation flow to include upload option:

```tsx
// In ClientSwitcher.tsx or similar
<button onClick={() => setShowIntakeWizard(true)}>
  + New Client (with Upload)
</button>
```

---

## Testing Checklist

### Manual Testing

#### 1. Database Setup

- [ ] Migration applied successfully
- [ ] `client_intake_jobs` table exists
- [ ] Storage bucket `client-intakes` created
- [ ] Can query table: `SELECT * FROM client_intake_jobs LIMIT 1;`

#### 2. Edge Function

- [ ] Function deployed
- [ ] Environment variables set (ANTHROPIC_API_KEY)
- [ ] Function shows in Dashboard
- [ ] No deployment errors

#### 3. Upload Flow (PDF)

- [ ] Open ClientIntakeWizard
- [ ] Upload a sample PDF brand brief
- [ ] File uploads to storage successfully
- [ ] Job record created in database
- [ ] Processing status updates in real-time
- [ ] Claude API called and returns JSON
- [ ] Extracted data shown in review UI

#### 4. Edit & Save

- [ ] Can edit extracted fields
- [ ] Collapsible sections work
- [ ] Save creates brand_profile record
- [ ] Data saved correctly to database
- [ ] Corpus entry created
- [ ] Client contact info updated

#### 5. Error Handling

- [ ] Invalid file type rejected
- [ ] File too large rejected
- [ ] Processing failure shows error message
- [ ] Can retry after failure

### Sample Test Documents

Create test PDFs with varying content:

**Test 1: Complete Brief**

```
Organization: Test Nonprofit
Mission: Helping communities thrive through education and support.
Voice & Tone: Compassionate, action-oriented, inspiring
Brand Colors: #0E4B7F, #F05A28
Messaging Pillars:
1. Education Access
2. Community Building
3. Sustainable Impact
```

**Test 2: Minimal Brief**

```
Organization: Simple Org
Mission: We help people.
```

**Test 3: Rich Brief** (use a real nonprofit's brand guide)

---

## Configuration

### Adjust Confidence Threshold

In [ClientIntakeWizard.tsx](src/components/client/ClientIntakeWizard.tsx:78):

```tsx
status: parsedData.confidence_score >= 50 ? "completed" : "review_required";
```

Change `50` to adjust when jobs require manual review.

### Customize Claude Prompt

Edit [brandIntakeParser.ts](supabase/functions/process-client-intake/prompts/brandIntakeParser.ts) to:

- Add new extraction fields
- Change extraction rules
- Adjust confidence scoring

### File Size Limits

In [ClientIntakeWizard.tsx](src/components/client/ClientIntakeWizard.tsx:120):

```tsx
maxFileSize={10 * 1024 * 1024} // 10MB default
```

Increase for larger files (consider Claude API token limits).

---

## Troubleshooting

### Issue: "No API key found in request"

**Cause:** ANTHROPIC_API_KEY not set in Edge Function environment

**Fix:**

```bash
npx supabase secrets set ANTHROPIC_API_KEY=sk-ant-your-key
```

### Issue: PDF extraction fails

**Cause:** `pdfjs-dist` not loading properly

**Fix:** Check Edge Function logs:

```bash
npx supabase functions logs process-client-intake
```

### Issue: Job status not updating

**Cause:** Realtime subscription not working

**Fix:**

- Check Supabase Realtime is enabled
- Verify RLS policies allow reading job
- Check browser console for errors

### Issue: "Failed to create brand profile"

**Cause:** RLS policies or missing fields

**Fix:**

- Check user is authenticated
- Verify user has membership for client
- Check required fields in brand_profiles table

### Issue: Confidence score always low

**Cause:** Prompt needs tuning for your document format

**Fix:**

- Review Claude response in Edge Function logs
- Adjust prompt in `brandIntakeParser.ts`
- Add more examples to prompt

---

## Monitoring & Analytics

### Track Usage

```sql
-- Intake jobs created per day
SELECT
  DATE(created_at) as date,
  COUNT(*) as jobs_created
FROM client_intake_jobs
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- Average confidence scores
SELECT
  AVG((extracted_data->>'confidence_score')::numeric) as avg_confidence
FROM client_intake_jobs
WHERE status = 'completed';

-- Success rate
SELECT
  status,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM client_intake_jobs
GROUP BY status;
```

### Claude API Usage

Track tokens and costs:

```sql
-- Estimate tokens used (rough calculation)
SELECT
  SUM(LENGTH(uploaded_file_name)) / 4 as estimated_input_tokens,
  COUNT(*) as requests
FROM client_intake_jobs
WHERE status IN ('completed', 'review_required');
```

---

## Next Steps

### Phase 2 Enhancements (Future)

Once MVP is stable, add:

1. **Multi-file upload**
   - Logo images
   - Multiple PDFs
   - Templates

2. **Version tracking**
   - Re-upload to update
   - Diff view
   - History

3. **Batch processing**
   - Upload folder of briefs
   - Bulk client creation

4. **Template library**
   - Download example brief template
   - Guided form as alternative

5. **Integration with Campaign Designer**
   - Auto-populate campaigns from brand profile
   - Use messaging pillars in Track15

6. **Vector embeddings**
   - Store embeddings in brand_corpus
   - Semantic search across brand content

---

## Support

### Resources

- **Design Doc:** [CLIENT_ONBOARDING_UPLOAD_DESIGN.md](CLIENT_ONBOARDING_UPLOAD_DESIGN.md)
- **Client Selector Fix:** [CLIENT_SELECTOR_FIX.md](CLIENT_SELECTOR_FIX.md)
- **Quick Start:** [QUICK_START_FIXES.md](QUICK_START_FIXES.md)

### Get Help

If you encounter issues:

1. Check Edge Function logs: `npx supabase functions logs process-client-intake`
2. Check browser console for frontend errors
3. Verify database state: `SELECT * FROM client_intake_jobs ORDER BY created_at DESC LIMIT 5;`
4. Review Supabase Dashboard for RLS policy errors

---

## Success Metrics

Track these KPIs after launch:

- **Adoption Rate:** % of new clients using upload vs manual entry
- **Time Savings:** Compare onboarding time before/after
- **Data Quality:** Confidence scores and edit rates
- **Success Rate:** % of jobs that complete successfully
- **User Satisfaction:** Feedback and NPS

---

**Status:** Ready for deployment
**Version:** 1.0 MVP
**Last Updated:** 2025-01-17
