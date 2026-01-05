# Fix: Vercel Deployment Protection for Cron Jobs

## Problem

When using cron-job.org or other external services, you might see:

- HTML page with "Authentication Required"
- Redirect to Vercel SSO login
- Error: "Vercel Authentication Required"

This happens because **Vercel Deployment Protection** is enabled on preview deployments.

## Solution 1: Use Production Domain (Recommended)

### Step 1: Find Your Production Domain

1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Domains**
2. Look for your production domain:
   - Usually: `your-app-name.vercel.app`
   - Or your custom domain if configured

**OR**

1. Go to **Vercel Dashboard** → Your Project → **Deployments**
2. Find the deployment from your **main/master branch**
3. Click on it → Copy the production URL

### Step 2: Update Cron Service

Update your cron-job.org (or other service) to use the **production URL**:

```
https://your-app-name.vercel.app/api/cron/gmail-sync?secret=YOUR_SECRET
```

**NOT the preview URL:**

```
❌ https://your-app-git-branch-projects.vercel.app/api/cron/gmail-sync?secret=YOUR_SECRET
```

### Step 3: Verify

Test the production URL:

```bash
curl "https://your-app-name.vercel.app/api/cron/gmail-sync?secret=YOUR_SECRET"
```

You should get JSON response, not HTML.

---

## Solution 2: Disable Deployment Protection (Not Recommended)

⚠️ **Warning:** This makes your preview deployments publicly accessible without authentication.

### Steps:

1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Deployment Protection**
2. Find your preview branch (e.g., `leademailintegration`)
3. Click **"..."** → **"Disable Protection"**
4. Confirm

**Note:** This is less secure. Only do this if you need preview deployments to be accessible.

---

## Solution 3: Use Production Branch for Cron

Ensure your cron endpoint is deployed to production:

1. **Merge your branch to main/master:**

   ```bash
   git checkout main
   git merge your-branch
   git push
   ```

2. **Wait for production deployment:**
   - Vercel will automatically deploy to production
   - Use the production URL for cron jobs

---

## How to Identify Preview vs Production URLs

**Preview Deployment URLs:**

- Format: `your-app-git-branchname-projects.vercel.app`
- Example: `ai-sales-flow-git-leademailintegration-smit-kotadias-projects.vercel.app`
- ❌ Has deployment protection

**Production Deployment URLs:**

- Format: `your-app.vercel.app` or custom domain
- Example: `ai-sales-flow.vercel.app`
- ✅ No deployment protection (or configurable)

---

## Quick Checklist

- [ ] Using production domain (not preview)
- [ ] Production domain is accessible without login
- [ ] `CRON_SECRET` is set in Vercel environment variables
- [ ] Secret in URL matches `CRON_SECRET` exactly
- [ ] Application is redeployed after setting environment variables
- [ ] Testing with `curl` returns JSON (not HTML)

---

## Still Having Issues?

1. **Check Vercel Logs:**

   - Vercel Dashboard → Logs
   - Filter: `/api/cron/gmail-sync`
   - Look for actual API errors (not authentication)

2. **Test Production URL:**

   ```bash
   curl -v "https://your-production-domain.vercel.app/api/cron/gmail-sync?secret=YOUR_SECRET"
   ```

   - Should return JSON with `{"success": true, ...}`
   - Should NOT return HTML or redirect

3. **Verify Environment Variables:**
   - Settings → Environment Variables
   - Ensure `CRON_SECRET` is set for **Production** environment
   - Redeploy after adding/updating
