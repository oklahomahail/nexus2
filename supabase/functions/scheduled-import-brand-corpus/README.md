# scheduled-import-brand-corpus

Supabase Edge Function that imports brand materials (web pages, PDFs, manual text) into the `brand_corpus` table.

## Features

- **HTML Extraction**: Fetches web pages and extracts article content (strips nav/footer/scripts)
- **PDF Support**: Extracts text from PDF documents using pdf.js
- **Manual Entry**: Supports pasted text from social media, newsletters, etc.
- **Deduplication**: Uses SHA-256 checksums to avoid duplicate content
- **Rate Limiting**: Built-in courtesy delays between requests

## Environment Variables

Required secrets (set via `supabase secrets`):

```bash
BRAND_IMPORT_WEBHOOK_SECRET=your-long-random-secret
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Deployment

```bash
# Deploy function
supabase functions deploy scheduled-import-brand-corpus

# Set secrets
supabase secrets set BRAND_IMPORT_WEBHOOK_SECRET=your-long-random-secret
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
supabase secrets set SUPABASE_URL=https://your-project.supabase.co
```

## Manual Invocation

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -H "X-Brand-Import-Secret: your-long-random-secret" \
  -d '{
    "client_id": "00000000-0000-0000-0000-000000000001",
    "brand_id": "brand-uuid-here",
    "sources": [
      {
        "source_type": "website",
        "url": "https://track15.org/about"
      },
      {
        "source_type": "pdf",
        "url": "https://track15.org/reports/annual_report.pdf"
      },
      {
        "source_type": "social",
        "url": "https://twitter.com/track15/status/12345"
      },
      {
        "source_type": "manual",
        "title": "Newsletter Excerpt",
        "content": "Paste your text content here..."
      }
    ]
  }' \
  https://your-project.functions.supabase.co/scheduled-import-brand-corpus
```

## Scheduled Execution (Cron)

Add to `supabase/config.toml`:

```toml
[functions.scheduled-import-brand-corpus]
verify_jwt = false

[[cron.jobs]]
name = "daily-brand-corpus-refresh"
schedule = "15 2 * * *"  # Every day at 02:15 UTC
function_name = "scheduled-import-brand-corpus"
headers = { "X-Brand-Import-Secret" = "your-long-random-secret" }
body = '''
{
  "client_id": "00000000-0000-0000-0000-000000000001",
  "brand_id": "brand-uuid-here",
  "sources": [
    {
      "source_type": "website",
      "url": "https://track15.org/news"
    }
  ]
}
'''
```

## Request Schema

```typescript
{
  client_id: string; // UUID of client
  brand_id: string; // UUID of brand profile
  sources: Array<{
    source_type: "website" | "pdf" | "doc" | "social" | "manual";
    url?: string; // Required for website/pdf/doc/social
    title?: string; // Optional override title
    content?: string; // Required for manual, optional for others
  }>;
}
```

## Response Schema

```typescript
{
  ok: boolean;
  client_id: string;
  brand_id: string;
  processed: number;
  results: Array<{
    url?: string;
    title?: string;
    status: "upserted" | "skipped_small" | "error";
    note?: string;
    error?: string;
  }>;
}
```

## Error Handling

The function will:

- Return 401 if webhook secret is missing/invalid
- Return 400 if payload is malformed
- Return 500 if internal error occurs
- Continue processing remaining sources if one fails (errors reported in results array)

## Content Processing

### HTML Pages

1. Fetches page with redirect following
2. Extracts `<title>` for metadata
3. Strips `<script>`, `<style>`, `<noscript>` tags
4. Attempts to extract main content from `<article>`, `<main>`, or `<section>`
5. Falls back to `<body>` if article extraction yields <50 words
6. Normalizes whitespace

### PDF Documents

1. Detects PDF via Content-Type header
2. Loads PDF via pdf.js
3. Extracts text from all pages
4. Normalizes whitespace

### Manual/Social Text

1. Uses provided `content` field directly
2. Normalizes whitespace
3. Uses `title` or defaults to "Manual Entry"

## Deduplication

Content is deduplicated using:

```
checksum = SHA256(title + first_5000_chars_of_content)
```

Database constraint: `UNIQUE (client_id, brand_id, checksum)`

If duplicate content is submitted, it will update the existing row instead of creating a new one.

## Performance Considerations

- **Rate Limiting**: 150ms delay between requests (polite to origin servers)
- **Content Size**: Skips content <200 characters (likely navigation artifacts)
- **Token Estimation**: Rough approximation: `word_count * 1.3`
- **Checksum Stability**: Uses first 5000 chars to handle minor content changes

## Future Enhancements

- [ ] Add embedding generation (OpenAI API) for semantic search
- [ ] Support for DOCX/Google Docs
- [ ] Configurable rate limiting per source domain
- [ ] Retry logic for failed fetches
- [ ] Content change detection (version control)
- [ ] Webhook notifications on completion

## Troubleshooting

**Error: "Invalid or missing webhook secret"**

- Verify `BRAND_IMPORT_WEBHOOK_SECRET` is set correctly
- Check `X-Brand-Import-Secret` header in request

**Error: "Fetch failed 403"**

- Some sites block bots/scrapers
- Try manual content entry instead

**Content skipped as "too short"**

- Likely extracted only navigation/footer
- Try providing `content` manually
- Check if site uses JavaScript rendering (not supported)

**PDF extraction fails**

- Verify PDF is text-based (not scanned image)
- Try downloading and copying text manually

## Testing

```bash
# Test with manual content
curl -X POST \
  -H "Content-Type: application/json" \
  -H "X-Brand-Import-Secret: test-secret" \
  -d '{
    "client_id": "test-client",
    "brand_id": "test-brand",
    "sources": [{
      "source_type": "manual",
      "title": "Test",
      "content": "This is a test of the brand corpus import system. Track15 is a nonprofit focused on community safety through evidence-based programs. We believe in transparency, impact, and donor respect."
    }]
  }' \
  http://localhost:54321/functions/v1/scheduled-import-brand-corpus
```

## Security Notes

- Uses service role key (bypasses RLS) - secure webhook secret is critical
- No JWT verification (webhook auth only)
- Consider IP allowlisting for production cron jobs
- Rotate webhook secret periodically
