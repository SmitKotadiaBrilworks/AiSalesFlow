# Cron Job Troubleshooting Guide

## Problem 1: Vercel Authentication Required (Deployment Protection)

If you're seeing an HTML page with "Authentication Required" or being redirected to Vercel SSO, this means **Vercel Deployment Protection** is enabled on your preview branch.

### Solution: Use Production Domain

**The issue:** Preview deployments (like `git-branchname-projects.vercel.app`) have deployment protection enabled by default.

**Fix:** Use your **production domain** instead:

1. **Find your production domain:**

   - Go to Vercel Dashboard → Your Project → **Settings** → **Domains**
   - Look for your production domain (usually `your-app.vercel.app` or a custom domain)
   - **OR** check your main branch deployment URL

2. **Update cron-job.org:**

   - Use the production URL: `https://your-app.vercel.app/api/cron/gmail-sync?secret=YOUR_SECRET`
   - **NOT** the preview URL: `https://your-app-git-branch-projects.vercel.app/...`

3. **Alternative: Disable Deployment Protection (Not Recommended)**
   - Vercel Dashboard → Your Project → **Settings** → **Deployment Protection**
   - Disable for preview deployments (less secure)

---

## Problem 2: 401 Unauthorized Error

If you're seeing `401 Unauthorized` when your cron job runs, it means the secret in your URL doesn't match the `CRON_SECRET` environment variable in Vercel.

## Quick Fix Steps

### Step 1: Check if CRON_SECRET is Set in Vercel

1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**
2. Look for `CRON_SECRET` in the list
3. If it's **not there**, you need to add it (see Step 2)
4. If it **is there**, check the value matches your cron URL

### Step 2: Set or Update CRON_SECRET

**Option A: Generate a New Secret**

```bash
# Generate a secure random secret
openssl rand -hex 32
```

**Option B: Use Your Existing Secret**

- If you already have a secret (like `@Qq12345s`), use that

**Add to Vercel:**

1. Vercel Dashboard → **Settings** → **Environment Variables**
2. Click **"Add New"**
3. Key: `CRON_SECRET`
4. Value: Your secret (e.g., `@Qq12345s` or the generated one)
5. Select **Environment**: Production, Preview, Development (or just Production)
6. Click **"Save"**

### Step 3: Update Your Cron Job URL

Update your cron-job.org URL to match:

```
https://your-app.vercel.app/api/cron/gmail-sync?secret=YOUR_SECRET_HERE
```

**Important:** Replace `YOUR_SECRET_HERE` with the **exact same value** you set in Vercel's `CRON_SECRET`.

### Step 4: Redeploy Your Application

**Critical:** After adding/updating environment variables, you **must redeploy**:

1. Go to **Vercel Dashboard** → Your Project → **Deployments**
2. Click the **"..."** menu on the latest deployment
3. Click **"Redeploy"**
4. Wait for deployment to complete

**OR** push a new commit to trigger a new deployment.

### Step 5: Test the Endpoint

Test your endpoint manually:

```bash
curl "https://your-app.vercel.app/api/cron/gmail-sync?secret=YOUR_SECRET"
```

**Expected Success Response:**

```json
{
  "success": true,
  "timestamp": "2024-01-01T12:00:00.000Z",
  "message": "Gmail sync completed successfully"
}
```

**If you still get 401:**

- Double-check the secret matches exactly (no extra spaces, correct case)
- Make sure you redeployed after setting the environment variable
- Check Vercel logs for more details

## Common Mistakes

1. ❌ **Not redeploying after setting environment variable**

   - Environment variables only take effect after redeployment

2. ❌ **Secret mismatch**

   - URL has `secret=abc123` but Vercel has `CRON_SECRET=xyz789`
   - They must match **exactly**

3. ❌ **Extra spaces or special characters**

   - Make sure there are no leading/trailing spaces
   - URL-encode special characters if needed (though `@` should work)

4. ❌ **Wrong environment**
   - If you set `CRON_SECRET` only for "Development", it won't work in Production
   - Set it for "Production" (or "All Environments")

## Verify in Vercel Logs

Check your Vercel logs to see what's happening:

1. Vercel Dashboard → Your Project → **Logs**
2. Filter by: `/api/cron/gmail-sync`
3. Look for:
   - `"CRON_SECRET not configured"` → Secret not set
   - `"Unauthorized cron attempt"` → Secret doesn't match

## Still Not Working?

1. **Check Vercel Environment Variables:**

   - Go to Settings → Environment Variables
   - Verify `CRON_SECRET` exists and has a value
   - Note: Values are hidden for security, but you can see if it exists

2. **Test with a Simple Secret:**

   - Set `CRON_SECRET` to something simple like `test123`
   - Update your cron URL to `?secret=test123`
   - Redeploy
   - Test

3. **Check Deployment Environment:**

   - Make sure `CRON_SECRET` is set for the environment you're deploying to
   - Production deployments need Production environment variables

4. **View Raw Logs:**
   - Vercel Dashboard → Logs → Select a failed request
   - Check the full error message
