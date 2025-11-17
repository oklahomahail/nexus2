# Deployment Checklist - Client Onboarding Upload MVP

## Pre-Deployment

### 1. Environment Setup

- [ ] Anthropic API key obtained (https://console.anthropic.com/)
- [ ] `.env` file contains all required variables
- [ ] Supabase project accessible
- [ ] Database has demo clients (Hope Foundation, etc.)

### 2. Code Review

- [ ] All TypeScript files compile without errors
- [ ] No console.error statements in production code
- [ ] All TODO comments addressed or documented
- [ ] Code follows existing patterns and conventions

---

## Database Deployment

### 3. Run Migration

```bash
# Option A: Via Supabase Dashboard
# 1. Go to: https://supabase.com/dashboard/project/sdgkpehhzysjofcpvdbo/sql/new
# 2. Copy contents of: supabase/migrations/20250117000000_client_intake_jobs.sql
# 3. Click "Run"

# Option B: Via CLI
npx supabase db push
```

**Verify:**

- [ ] Query succeeds: `SELECT * FROM client_intake_jobs LIMIT 1;`
- [ ] Table has correct columns (id, client_id, uploaded_file_url, status, etc.)
- [ ] Storage bucket exists: Check Dashboard → Storage → client-intakes
- [ ] RLS policies created: Check Dashboard → Database → Policies

---

## Edge Function Deployment

### 4. Deploy Function

```bash
# Deploy the function
npx supabase functions deploy process-client-intake

# Expected output: Function URL
# https://sdgkpehhzysjofcpvdbo.supabase.co/functions/v1/process-client-intake
```

**Verify:**

- [ ] Function appears in Dashboard → Edge Functions
- [ ] No deployment errors in output
- [ ] Function status shows "Healthy"

### 5. Set Environment Variables

```bash
# Set Anthropic API key
npx supabase secrets set ANTHROPIC_API_KEY=sk-ant-your_key_here

# Verify secrets are set
npx supabase secrets list
```

**Verify:**

- [ ] ANTHROPIC_API_KEY listed in secrets
- [ ] Key starts with `sk-ant-`

### 6. Test Edge Function

```bash
# View logs (open in separate terminal)
npx supabase functions logs process-client-intake --tail

# Test with sample payload
curl -i --location --request POST \
  'https://sdgkpehhzysjofcpvdbo.supabase.co/functions/v1/process-client-intake' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{
    "fileUrl": "test/sample.pdf",
    "clientId": "00000000-0000-0000-0000-000000000001",
    "jobId": "test-job-id",
    "fileType": "application/pdf"
  }'
```

**Verify:**

- [ ] Function responds (even if with error - that's expected for test)
- [ ] Logs show function invoked
- [ ] No authentication errors

---

## Frontend Integration

### 7. Build & Test Locally

```bash
# Install dependencies (if needed)
npm install

# Type check
npm run typecheck

# Build
npm run build

# Run dev server
npm run dev
```

**Verify:**

- [ ] No TypeScript errors
- [ ] App builds successfully
- [ ] Dev server starts without errors
- [ ] Can navigate to app in browser

### 8. Test Upload UI

**Manual Test Steps:**

#### Test 1: Basic Upload Flow

1. [ ] Open app in browser
2. [ ] Navigate to client dashboard
3. [ ] Trigger ClientIntakeWizard (add button to trigger it for testing)
4. [ ] See upload modal with file picker
5. [ ] Select sample PDF from `test-fixtures/sample-client-brief.md` (save as PDF)
6. [ ] Click "Process Document"
7. [ ] See processing status screen
8. [ ] Wait 30-60 seconds
9. [ ] See review screen with extracted data
10. [ ] Verify data looks correct
11. [ ] Make edits to a field
12. [ ] Click "Create Brand Profile"
13. [ ] Verify success and redirect

#### Test 2: Error Handling

1. [ ] Try uploading invalid file type (e.g., .jpg)
2. [ ] See error message: "Please upload a PDF, TXT, MD, or DOCX file"
3. [ ] Try uploading file > 10MB
4. [ ] See error message about file size
5. [ ] Upload valid file but disconnect internet mid-process
6. [ ] See error handling (retry option or clear error message)

#### Test 3: Data Persistence

1. [ ] Complete full upload flow
2. [ ] Check database: `SELECT * FROM brand_profiles ORDER BY created_at DESC LIMIT 1;`
3. [ ] Verify brand profile created
4. [ ] Check: `SELECT * FROM brand_corpus ORDER BY created_at DESC LIMIT 1;`
5. [ ] Verify corpus entry created
6. [ ] Check: `SELECT * FROM client_intake_jobs ORDER BY created_at DESC LIMIT 1;`
7. [ ] Verify job marked as completed

---

## Integration with Existing UI

### 9. Add Entry Point

Choose where to add the upload wizard:

**Option A: Add to Client Selector**

Edit `src/components/nav/client/ClientSwitcher.tsx`:

```tsx
import { ClientIntakeWizard } from "@/components/client/ClientIntakeWizard";
import { useState } from "react";

// Inside component:
const [showIntakeWizard, setShowIntakeWizard] = useState(false);

// Add button:
<button onClick={() => setShowIntakeWizard(true)}>
  + New Client (Upload Brief)
</button>

// Add wizard:
<ClientIntakeWizard
  isOpen={showIntakeWizard}
  onClose={() => setShowIntakeWizard(false)}
  clientId={currentClient?.id || ""}
  onSuccess={(brandProfileId) => {
    console.log("Success:", brandProfileId);
    setShowIntakeWizard(false);
  }}
/>
```

**Option B: Add to Brand Profile Page**

Add upload option to existing brand profile management.

**Option C: Standalone Test Page** (Recommended for initial testing)

Create `src/pages/TestIntakeUpload.tsx`:

```tsx
import { ClientIntakeWizard } from "@/components/client/ClientIntakeWizard";
import { useState } from "react";

export default function TestIntakeUpload() {
  const [showWizard, setShowWizard] = useState(false);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Client Intake Upload</h1>
      <button
        onClick={() => setShowWizard(true)}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        Open Upload Wizard
      </button>

      <ClientIntakeWizard
        isOpen={showWizard}
        onClose={() => setShowWizard(false)}
        clientId="00000000-0000-0000-0000-000000000001" // Hope Foundation
        onSuccess={(brandProfileId) => {
          alert(`Success! Brand Profile ID: ${brandProfileId}`);
          setShowWizard(false);
        }}
      />
    </div>
  );
}
```

Add route in your router config.

**Verify:**

- [ ] Button/entry point visible in UI
- [ ] Clicking triggers modal
- [ ] Modal displays correctly

---

## Production Deployment

### 10. Deploy to Production

```bash
# Build production bundle
npm run build

# Deploy via your hosting provider (Vercel, Netlify, etc.)
# Example for Vercel:
vercel --prod
```

**Verify:**

- [ ] Production site loads
- [ ] Upload wizard accessible
- [ ] No console errors in production

### 11. Smoke Test in Production

1. [ ] Upload test document in production
2. [ ] Verify processing completes
3. [ ] Check database in production
4. [ ] Verify brand profile created

---

## Post-Deployment

### 12. Monitoring Setup

```bash
# Set up alerts in Supabase Dashboard
# 1. Go to: Dashboard → Database → Logs
# 2. Create alert for:
#    - Edge Function errors
#    - Failed intake jobs
```

**Set up queries:**

```sql
-- Monitor success rate
SELECT
  status,
  COUNT(*) as count
FROM client_intake_jobs
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY status;

-- Monitor average processing time
SELECT
  AVG(EXTRACT(EPOCH FROM (completed_at - created_at))) as avg_seconds
FROM client_intake_jobs
WHERE status = 'completed'
  AND completed_at > NOW() - INTERVAL '7 days';
```

**Verify:**

- [ ] Can query jobs in production
- [ ] Logs accessible
- [ ] Alerts configured (if desired)

### 13. Documentation

- [ ] Update README with new feature
- [ ] Add to user documentation
- [ ] Create internal runbook for troubleshooting
- [ ] Document known limitations

### 14. User Communication

- [ ] Announce feature to beta users
- [ ] Create tutorial video or guide
- [ ] Set up feedback collection
- [ ] Monitor user adoption

---

## Rollback Plan

If critical issues arise:

### Quick Rollback Steps

1. Disable feature in UI (remove entry point button)
2. Disable Edge Function in Dashboard
3. Monitor for any database issues

### Database Rollback

```sql
-- If needed, drop the table (only if absolutely necessary)
DROP TABLE IF EXISTS client_intake_jobs CASCADE;

-- Remove storage bucket
-- Via Dashboard → Storage → client-intakes → Delete
```

**Note:** Only rollback if critical bug. Most issues can be fixed with hotfix.

---

## Success Criteria

### Minimum Viable Success (Week 1)

- [ ] 5+ successful uploads
- [ ] 70%+ confidence scores
- [ ] 80%+ success rate (not failed)
- [ ] Zero critical bugs

### Adoption Success (Month 1)

- [ ] 30%+ of new clients use upload
- [ ] Average time savings > 50%
- [ ] Positive user feedback
- [ ] <10% support tickets related to feature

---

## Support

### Common Issues & Fixes

**"Processing failed"**

- Check Edge Function logs
- Verify ANTHROPIC_API_KEY set
- Ensure file is valid PDF/DOCX

**"No data extracted"**

- Document may be empty or corrupted
- Check Claude API response in logs
- Verify document contains brand information

**"Permission denied"**

- Check RLS policies
- Verify user authenticated
- Ensure user has client membership

### Getting Help

1. Check Edge Function logs: `npx supabase functions logs process-client-intake`
2. Check browser console errors
3. Query database for job status
4. Review [IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md)

---

## Final Sign-Off

**Deployed By:** ********\_********
**Date:** ********\_********
**Production URL:** ********\_********
**Edge Function URL:** ********\_********

**Notes:**

---

---

---

---

**Status:** Ready for deployment ✅
**Version:** 1.0 MVP
**Last Updated:** 2025-01-17
