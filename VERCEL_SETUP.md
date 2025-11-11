# Vercel Environment Variables Setup

## ✅ Supabase Project Created

**Project:** nexus-production
**Dashboard:** https://supabase.com/dashboard/project/sdgkpehhzysjofcpvdbo
**URL:** `https://sdgkpehhzysjofcpvdbo.supabase.co`

---

## 🔧 Add Environment Variables to Vercel (5 minutes)

### Step-by-Step Instructions

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/
   - Select your **Nexus** project

2. **Navigate to Environment Variables**
   - Click: **Settings** (left sidebar)
   - Click: **Environment Variables** (left submenu)

3. **Add Variable 1: VITE_SUPABASE_URL**
   ```
   Name:  VITE_SUPABASE_URL
   Value: https://sdgkpehhzysjofcpvdbo.supabase.co

   Environments (check ALL three):
   ☑ Production
   ☑ Preview
   ☑ Development
   ```
   Click **Save**

4. **Add Variable 2: VITE_SUPABASE_ANON_KEY**
   ```
   Name:  VITE_SUPABASE_ANON_KEY
   Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkZ2twZWhoenlzam9mY3B2ZGJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4NTYzMTUsImV4cCI6MjA3ODQzMjMxNX0.txR4I7S5VWM2wgkw4HeKXghpc-fKXY0a9RKngu8QxbI

   Environments (check ALL three):
   ☑ Production
   ☑ Preview
   ☑ Development
   ```
   Click **Save**

5. **Trigger Deployment**

   **Option A - Via Dashboard (Fastest):**
   - Go to: **Deployments** tab
   - Click: **...** menu on latest deployment
   - Click: **Redeploy**
   - Check: ☑ Use existing Build Cache
   - Click: **Redeploy**

   **Option B - Via Git Push:**
   ```bash
   # From your terminal
   git commit --allow-empty -m "Trigger deployment with Supabase env vars"
   git push
   ```

---

## 🎯 Expected Results

After deployment completes (~30 seconds):

1. **Production URL Active**
   - Visit: https://app.leadwithnexus.com
   - Should load without errors

2. **No Console Errors**
   - Open browser DevTools (F12)
   - Should NOT see: "Missing Supabase environment variables"

3. **DNS Working**
   ```bash
   dig app.leadwithnexus.com
   # Should show: cname.vercel-dns.com
   ```

4. **SSL Certificate Valid**
   - Browser should show 🔒 padlock
   - Certificate issued by: Let's Encrypt or similar

---

## 📋 Post-Deployment Checklist

Once deployment completes, verify:

- [ ] `https://app.leadwithnexus.com` loads successfully
- [ ] No "Missing Supabase environment variables" error in console
- [ ] SSL certificate is valid (🔒 in browser)
- [ ] Main navigation works
- [ ] Dashboard page loads
- [ ] No JavaScript errors in console

---

## 🔍 Troubleshooting

### Environment Variables Not Taking Effect

**Symptom:** Still seeing "Missing Supabase environment variables" after deploy

**Fix:**
1. Verify variables are saved in Vercel dashboard (refresh the page)
2. Ensure both variables have ALL THREE environments checked
3. **Important:** Variable names MUST have `VITE_` prefix exactly
4. Trigger a fresh deployment (not just redeploy)

### Deployment Still Pending

**Symptom:** Deployment taking longer than 2 minutes

**Check:**
- Vercel Deployments tab → Click on deployment → View build logs
- Look for errors in build logs
- Common issue: Build cache issue → Redeploy without cache

### SSL Certificate Not Issued

**Symptom:** "Your connection is not private" error

**Fix:**
- DNS propagation takes 5-30 minutes (already done ✅)
- Vercel issues SSL automatically after DNS is verified
- Check Vercel → Settings → Domains → should show "Valid Configuration"
- If "Pending", wait 10 more minutes
- If stuck after 30 minutes, contact Vercel support

---

## ✅ Deployment Complete

Once all checks pass, your Nexus application will be live at:

**🌐 Production URL:** https://app.leadwithnexus.com

**Key Features Enabled:**
- ✅ Supabase authentication
- ✅ Database access (with RLS when configured)
- ✅ Realtime subscriptions
- ✅ Phase 3 content safety (sanitization, PII redaction)
- ✅ Progress tracking with cancellation
- ✅ Rate limiting infrastructure

---

## 📚 Related Documentation

- **Full Deployment Guide:** [DEPLOYMENT.md](DEPLOYMENT.md)
- **Phase 3 Features:** [PHASE3_STATUS.md](PHASE3_STATUS.md)
- **Supabase Client:** [src/lib/supabaseClient.ts](src/lib/supabaseClient.ts)
- **Security Headers:** [vercel.json](vercel.json)

---

**Setup Date:** 2025-11-11
**Project ID:** sdgkpehhzysjofcpvdbo
**Region:** US East
