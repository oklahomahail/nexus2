# Deployment Guide for Nexus

This guide covers deploying your Nexus application to Vercel with Supabase backend.

## Current Status (2025-11-11)

✅ **DNS Configuration** - COMPLETE
- CNAME: `app.leadwithnexus.com` → `cname.vercel-dns.com` (TTL: 600s)
- Status: Active on Porkbun

✅ **Vercel Configuration** - READY
- [vercel.json](vercel.json) configured with Vite framework
- Security headers in place
- Build commands configured

✅ **Supabase Client** - CODE READY
- Client configured in [src/lib/supabaseClient.ts](src/lib/supabaseClient.ts)
- Needs: Project creation + environment variables

🔄 **Next Steps Required:**
1. Create Supabase project (10 min)
2. Add environment variables to Vercel (5 min)
3. Trigger deployment (automatic)

---

## 🚀 Deployment Steps (15 minutes total)

### Step 1: Create Supabase Project (10 minutes)

1. **Go to Supabase Dashboard**
   - Visit: https://app.supabase.com/
   - Sign in with GitHub

2. **Create New Project**
   - Click "New project"
   - Organization: Personal or create "Lead with Nexus"
   - Name: `nexus-production`
   - Database Password: **Generate strong password** (save securely)
   - Region: `us-east-1` (or closest to users)
   - Click "Create new project"

3. **Get API Credentials** (wait ~2 minutes for project to provision)
   - Go to Project Settings (gear icon) → API
   - Copy these values:
     - **URL**: `https://xxxxxxxxxxxxx.supabase.co`
     - **anon/public key**: `eyJhbGci...` (long JWT token)

### Step 2: Configure Vercel (5 minutes)

1. **Add Environment Variables**
   - Go to: https://vercel.com/ → Your Nexus project
   - Navigate to: Settings → Environment Variables
   - Add two variables:

   ```
   Name: VITE_SUPABASE_URL
   Value: https://xxxxxxxxxxxxx.supabase.co
   Environments: ☑ Production ☑ Preview ☑ Development

   Name: VITE_SUPABASE_ANON_KEY
   Value: eyJhbGci...your-actual-anon-key
   Environments: ☑ Production ☑ Preview ☑ Development
   ```

2. **Add Domain** (if not already added)
   - Go to: Settings → Domains
   - Add domain: `app.leadwithnexus.com`
   - Vercel will verify DNS (already configured ✅)

3. **Trigger Deployment**
   ```bash
   # Option A: Push a commit
   git commit --allow-empty -m "Configure Supabase environment variables"
   git push

   # Option B: Use Vercel dashboard
   # Deployments → ... menu → Redeploy
   ```

### Step 3: Verify (2 minutes)

1. **Wait for SSL Certificate** (~5-10 minutes after DNS propagation)

2. **Check Deployment**
   - Visit: https://app.leadwithnexus.com
   - Open browser console (F12)
   - Should NOT see: "Missing Supabase environment variables"

3. **Test DNS**
   ```bash
   dig app.leadwithnexus.com
   # Should show: cname.vercel-dns.com
   ```

---

## Local Development Setup

### Quick Start

```bash
# Install dependencies
pnpm install

# Create .env file from template
cp .env.example .env

# Add your Supabase credentials to .env
# VITE_SUPABASE_URL=https://xxxxx.supabase.co
# VITE_SUPABASE_ANON_KEY=eyJhbGci...

# Run in development mode
pnpm dev

# Build for production
pnpm build

# Preview production build locally
pnpm preview
```

### Verify Supabase Connection

```bash
# Start dev server
pnpm dev

# Open browser to http://localhost:5173
# Check console - should NOT see:
# "Missing Supabase environment variables"
```

---

## Environment Variables Reference

### Required for Production

| Variable | Purpose | Where to Get | Example |
|----------|---------|--------------|---------|
| `VITE_SUPABASE_URL` | Supabase API endpoint | Supabase Dashboard → Settings → API | `https://abcdefg.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Public Supabase key | Supabase Dashboard → Settings → API | `eyJhbGci...` (JWT token) |

**Important Notes:**
- ⚠️ **MUST** have `VITE_` prefix for Vite to expose to client-side code
- 🔒 Never commit actual values to git (use `.env` locally, Vercel dashboard for production)
- ✅ Same values for Production, Preview, and Development environments

### Optional (Future Features)

| Variable | Purpose | When Needed |
|----------|---------|-------------|
| `VITE_SENTRY_DSN` | Error tracking | When you set up Sentry |
| `VITE_POSTHOG_KEY` | Analytics | When you add PostHog |
| `VITE_STRIPE_PUBLIC_KEY` | Payments | When you add billing |

### Current .env.example

```bash
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Optional: Future features
# VITE_SENTRY_DSN=
# VITE_POSTHOG_KEY=
```

## Automatic Deployment (GitHub → Vercel)

Vercel automatically deploys when you push to GitHub:

- **Push to `main`** → Deploys to production (`app.leadwithnexus.com`)
- **Open PR** → Creates preview deployment
- **Push to PR** → Updates preview deployment

### No Additional Setup Required

✅ Vercel is already connected to your GitHub repository
✅ Environment variables set in Vercel dashboard apply to all deployments
✅ Build logs visible at: https://vercel.com/your-project/deployments

---

## Troubleshooting & Common Issues

### 1. "Missing Supabase environment variables" in Console

**Cause:** Environment variables not set or missing `VITE_` prefix

**Fix:**
```bash
# Local: Check .env file exists and has correct values
cat .env
# Should show:
# VITE_SUPABASE_URL=https://xxxxx.supabase.co
# VITE_SUPABASE_ANON_KEY=eyJhbGci...

# Production: Check Vercel dashboard
# Settings → Environment Variables
# Redeploy after adding variables
```

### 2. Domain Not Resolving

**Cause:** DNS propagation or incorrect CNAME

**Fix:**
```bash
# Check DNS
dig app.leadwithnexus.com CNAME
# Should show: cname.vercel-dns.com

# Clear DNS cache (macOS)
sudo dscacheutil -flushcache
sudo killall -HUP mDNSResponder

# Check from multiple locations
# Use: https://www.whatsmydns.net/
```

### 3. SSL Certificate Error

**Cause:** DNS not fully propagated or Vercel hasn't issued cert yet

**Fix:**
- Wait 10-15 minutes after DNS changes
- Check Vercel Dashboard → Domains → should show "Valid Configuration"
- SSL certificates are issued automatically by Vercel
- If stuck >30 minutes, remove and re-add domain in Vercel

### 4. Build Fails on Vercel

**Cause:** TypeScript errors or missing dependencies

**Fix:**
```bash
# Test build locally first
pnpm build
# Should complete in ~2 seconds with no errors

# If errors, check:
pnpm lint                    # Check for lint errors
pnpm vitest run             # Run tests
pnpm typecheck              # TypeScript check (if available)

# Check Vercel build logs for specific error
# Common issues:
# - Import path case sensitivity (works locally on macOS, fails on Vercel Linux)
# - Missing dependencies (add to package.json, not just devDependencies)
```

### 5. Supabase Connection Timeout

**Cause:** Network policy, paused project, or incorrect URL

**Fix:**
- Verify `VITE_SUPABASE_URL` starts with `https://`
- Check Supabase project is not paused (free tier pauses after 7 days inactivity)
- Test from Supabase SQL Editor to verify project is running
- Verify anon key matches the project (keys are project-specific)

### 6. Changes Not Appearing After Deploy

**Cause:** Browser cache or old service worker

**Fix:**
```bash
# Hard refresh in browser
# Chrome/Firefox: Ctrl+Shift+R (Cmd+Shift+R on Mac)
# Safari: Cmd+Option+R

# Or clear cache and reload
# Chrome DevTools: Network tab → "Disable cache" checkbox

# Verify deployment completed
# Vercel dashboard should show "Ready" status
```

---

## Security Features

### ✅ Already Configured

**Security Headers** ([vercel.json](vercel.json)):
- `X-Frame-Options: DENY` - Prevents clickjacking
- `X-Content-Type-Options: nosniff` - Prevents MIME sniffing
- `X-XSS-Protection: 1; mode=block` - Browser XSS protection
- `Referrer-Policy: strict-origin-when-cross-origin` - Limits referrer leakage

**Supabase Security** ([src/lib/supabaseClient.ts](src/lib/supabaseClient.ts)):
- Persistent sessions with localStorage
- Automatic token refresh
- Session detection in URL (for email magic links)
- Rate limiting (10 events/second for realtime)

**Content Safety** (Phase 3):
- HTML/script sanitization
- PII redaction (email, phone, SSN, credit cards)
- Prompt injection detection

### 🔜 Recommended Next Steps

1. **Add Content Security Policy (CSP)**
   ```json
   // Add to vercel.json headers
   {
     "key": "Content-Security-Policy",
     "value": "default-src 'self'; script-src 'self' 'unsafe-inline'; connect-src 'self' https://*.supabase.co"
   }
   ```

2. **Enable Supabase Row Level Security (RLS)**
   ```sql
   -- In Supabase SQL Editor
   ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

   CREATE POLICY "Users can view own clients"
     ON clients FOR SELECT
     USING (auth.uid() = user_id);
   ```

3. **Set Up Error Monitoring**
   - Add Sentry for production error tracking
   - Configure source maps for debugging

---

## Quick Reference

### Essential Commands

```bash
# Development
pnpm dev                    # Start dev server (http://localhost:5173)
pnpm build                  # Test production build
pnpm preview                # Preview production build

# Testing
pnpm vitest run             # Run all tests
pnpm vitest --watch         # Watch mode
pnpm lint                   # Check code quality

# Deployment
git push                    # Triggers automatic Vercel deployment
vercel --prod               # Manual production deploy (if needed)
```

### Important Links

- **Production**: https://app.leadwithnexus.com
- **Vercel Dashboard**: https://vercel.com/your-project
- **Supabase Dashboard**: https://app.supabase.com/
- **DNS Management**: https://porkbun.com/account/webhosting/leadwithnexus.com

### Support Resources

- **Phase 3 Status**: [PHASE3_STATUS.md](PHASE3_STATUS.md)
- **Vercel Docs**: https://vercel.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **Vite Env Variables**: https://vitejs.dev/guide/env-and-mode.html

---

**Last Updated:** 2025-11-11
**Current Phase:** Phase 3 (Content Safety & Infrastructure)
**Status:** ✅ DNS configured | 🔄 Awaiting Supabase setup + Vercel env vars
