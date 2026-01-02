# Quick Start: Gmail Sync Cron Job

## 🚀 Fastest Setup (GitHub Actions - Recommended)

### Step 1: Set Environment Variable

1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**
2. Add: `CRON_SECRET` = `your-random-secret-here` (generate with: `openssl rand -hex 32`)
3. **Redeploy** your application

### Step 2: Add GitHub Secret

1. Go to your **GitHub repository** → **Settings** → **Secrets and variables** → **Actions**
2. Click **"New repository secret"**
3. Name: `CRON_URL`
4. Value: `https://your-app.vercel.app/api/cron/gmail-sync?secret=YOUR_CRON_SECRET`
5. Click **"Add secret"**

### Step 3: Enable GitHub Actions

1. Repository → **Settings** → **Actions** → **General**
2. Enable **"Allow all actions and reusable workflows"**
3. **Save**

### Step 4: Test

1. Go to **Actions** tab
2. Click **"Gmail Sync Cron"**
3. Click **"Run workflow"** → **"Run workflow"**
4. Check if it succeeds ✅

**Done!** Your cron job will now run every 5 minutes automatically.

---

## 🔄 Alternative: cron-job.org (No GitHub Required)

1. **Sign up** at [cron-job.org](https://cron-job.org)
2. **Create cronjob**:
   - URL: `https://your-app.vercel.app/api/cron/gmail-sync?secret=YOUR_CRON_SECRET`
   - Schedule: `Every 5 minutes` or `*/5 * * * *`
   - Method: `GET`
3. **Save** and test with "Run now"

---

## 📋 Full Documentation

See [CRON_SETUP.md](./CRON_SETUP.md) for detailed setup instructions for all services.

---

## ✅ Verify It's Working

Test your endpoint:

```bash
curl "https://your-app.vercel.app/api/cron/gmail-sync?secret=YOUR_CRON_SECRET"
```

Check Vercel logs:

- Vercel Dashboard → **Logs** → Filter: `/api/cron/gmail-sync`
