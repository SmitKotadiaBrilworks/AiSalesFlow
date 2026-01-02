# Gmail Sync Cron Job Setup

Since Vercel's free plan doesn't support cron jobs, you need to use an external service to trigger the Gmail sync every 5 minutes.

## Prerequisites

1. **Set up CRON_SECRET** in your Vercel environment variables:

   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add: `CRON_SECRET` = (generate a random secret string, e.g., `openssl rand -hex 32`)
   - Redeploy your application

2. **Get your cron endpoint URL**:
   ```
   https://your-app.vercel.app/api/cron/gmail-sync?secret=YOUR_CRON_SECRET
   ```

## Option 1: GitHub Actions (Recommended - Free & Reliable)

GitHub Actions is completely free for public repositories and offers 2000 minutes/month for private repos.

### Setup Steps:

1. **Create `.github/workflows/gmail-sync.yml`** in your repository:

```yaml
name: Gmail Sync Cron

on:
  schedule:
    # Run every 5 minutes
    - cron: "*/5 * * * *"
  workflow_dispatch: # Allow manual trigger

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Gmail Sync
        run: |
          curl -X GET "${{ secrets.CRON_URL }}"
        env:
          CRON_URL: ${{ secrets.CRON_URL }}
```

2. **Add GitHub Secret**:

   - Go to your GitHub repository → Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `CRON_URL`
   - Value: `https://your-app.vercel.app/api/cron/gmail-sync?secret=YOUR_CRON_SECRET`
   - Click "Add secret"

3. **Enable GitHub Actions**:

   - Go to repository Settings → Actions → General
   - Enable "Allow all actions and reusable workflows"
   - Save

4. **Test**:
   - Go to Actions tab in your repository
   - Click "Gmail Sync Cron" workflow
   - Click "Run workflow" → "Run workflow" (manual trigger)
   - Check if it runs successfully

### Pros:

- ✅ Completely free
- ✅ Reliable (GitHub infrastructure)
- ✅ Easy to monitor (Actions tab)
- ✅ Can trigger manually
- ✅ Version controlled

### Cons:

- ⚠️ Minimum interval is 5 minutes (perfect for your use case)
- ⚠️ For private repos, limited to 2000 minutes/month (enough for 5-min intervals)

---

## Option 2: cron-job.org (Free - Minute-Precise)

cron-job.org offers a completely free tier with minute-precise scheduling.

### Setup Steps:

1. **Sign up** at [cron-job.org](https://cron-job.org)

2. **Create a new cron job**:

   - Click "Create cronjob"
   - **Title**: `Gmail Sync`
   - **Address (URL)**: `https://your-app.vercel.app/api/cron/gmail-sync?secret=YOUR_CRON_SECRET`
   - **Schedule**: Select "Every 5 minutes" or use cron expression: `*/5 * * * *`
   - **Request method**: `GET`
   - **Save**

3. **Test**:
   - Click "Run now" to test
   - Check execution history

### Pros:

- ✅ Completely free
- ✅ Minute-precise scheduling
- ✅ Execution history
- ✅ Email notifications on failure
- ✅ Simple setup

### Cons:

- ⚠️ Requires external account

---

## Option 3: EasyCron (Free Tier: 200 executions/day)

EasyCron offers a free tier with 200 executions per day (enough for 5-minute intervals = 288/day, but close).

### Setup Steps:

1. **Sign up** at [EasyCron.com](https://www.easycron.com)

2. **Create a new cron job**:

   - Click "Add Cron Job"
   - **Job Title**: `Gmail Sync`
   - **URL**: `https://your-app.vercel.app/api/cron/gmail-sync?secret=YOUR_CRON_SECRET`
   - **Schedule Type**: `Cron Expression`
   - **Cron Expression**: `*/5 * * * *` (every 5 minutes)
   - **HTTP Method**: `GET`
   - **Save**

3. **Monitor**:
   - View execution logs
   - Set up email alerts

### Pros:

- ✅ Free tier available
- ✅ Detailed logs
- ✅ Email notifications
- ✅ Stable service

### Cons:

- ⚠️ Free tier: 200 executions/day (not enough for 5-min intervals)
- ⚠️ Need to upgrade to paid plan for 5-minute intervals

---

## Option 4: FastCron (Free Tier: 300 executions/day)

FastCron provides a free plan with up to 300 executions per day.

### Setup Steps:

1. **Sign up** at [FastCron.com](https://fastcron.com)

2. **Create a new cron job**:

   - Click "Create Cron Job"
   - **Name**: `Gmail Sync`
   - **URL**: `https://your-app.vercel.app/api/cron/gmail-sync?secret=YOUR_CRON_SECRET`
   - **Schedule**: `*/5 * * * *` (every 5 minutes)
   - **Method**: `GET`
   - **Save**

3. **Configure alerts** (optional):
   - Set up Slack/Discord webhooks for notifications

### Pros:

- ✅ Free tier available
- ✅ Slack/Discord integration
- ✅ Good monitoring

### Cons:

- ⚠️ Free tier: 300 executions/day (not enough for 5-min intervals = 288/day, but close)
- ⚠️ May need paid plan for consistent 5-minute intervals

---

## Option 5: UptimeRobot (Free - 5-minute intervals)

UptimeRobot is primarily a monitoring service but can be used for cron jobs.

### Setup Steps:

1. **Sign up** at [UptimeRobot.com](https://uptimerobot.com)

2. **Add a new monitor**:
   - **Monitor Type**: `HTTP(s)`
   - **Friendly Name**: `Gmail Sync`
   - **URL**: `https://your-app.vercel.app/api/cron/gmail-sync?secret=YOUR_CRON_SECRET`
   - **Monitoring Interval**: `5 minutes`
   - **Save**

### Pros:

- ✅ Free tier supports 5-minute intervals
- ✅ Monitoring + cron in one
- ✅ Email/SMS alerts

### Cons:

- ⚠️ Primarily a monitoring tool, not a dedicated cron service

---

## Recommended Solution

**For most users**: Use **GitHub Actions** (Option 1)

- Completely free
- Reliable
- Easy to set up and monitor
- No external service dependencies

**If you don't use GitHub**: Use **cron-job.org** (Option 2)

- Completely free
- Minute-precise
- Simple interface

---

## Testing Your Setup

After setting up any of the above services, test your endpoint:

```bash
curl "https://your-app.vercel.app/api/cron/gmail-sync?secret=YOUR_CRON_SECRET"
```

Expected response:

```json
{
  "success": true,
  "timestamp": "2024-01-01T12:00:00.000Z",
  "message": "Gmail sync completed successfully"
}
```

---

## Monitoring

Check your Vercel logs to monitor cron executions:

- Vercel Dashboard → Your Project → Logs
- Filter by `/api/cron/gmail-sync`

You should see logs like:

```
[2024-01-01T12:00:00.000Z] Starting Gmail sync cron...
[2024-01-01T12:00:05.000Z] Gmail sync completed.
```

---

## Troubleshooting

**401 Unauthorized**:

- Check that `CRON_SECRET` is set in Vercel environment variables
- Verify the secret in the URL matches the environment variable
- Redeploy after adding environment variables

**500 Internal Server Error**:

- Check Vercel logs for detailed error messages
- Verify MongoDB connection
- Check Gmail API credentials

**Cron not running**:

- Verify the cron service is active
- Check execution history in the cron service dashboard
- Ensure the URL is correct and accessible
