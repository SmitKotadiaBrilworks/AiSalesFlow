# Email Sync - Quick Setup Guide

## Overview

Email Sync automatically converts incoming emails into leads in your CRM. When someone emails your configured inbox, it:

1. Creates a lead (or updates existing)
2. Analyzes the email with AI
3. Appears in your leads list automatically

## Quick Start

### 1. Enable in Dashboard

- Go to **Settings** → **Email Sync Configuration**
- Toggle **Enable Email Sync** ON
- Enter your inbox email (e.g., `inbox@yourcompany.com`)
- Copy the **Webhook URL**

### 2. Configure Email Service

**For SendGrid:**

```
Settings → Mail Settings → Inbound Parse → Add Host & URL
POST URL: [Your Webhook URL]
```

**For Mailgun:**

```
Receiving → Routes → Create Route
Filter: match_recipient("inbox@yourcompany.com")
Action: forward("[Your Webhook URL]")
```

**For Custom/IMAP:**

- Forward emails to webhook URL as raw MIME or JSON

### 3. Test

- Send test email to your inbox
- Check Leads page - should appear within 30 seconds

## Webhook Endpoint

```
POST /api/webhooks/email?tenant_id=YOUR_TENANT_ID&secret=YOUR_SECRET
```

The webhook URL is automatically generated and shown in Settings.

## How It Works

```
Email Arrives → Email Service → Webhook → Parse Email → AI Analysis → Create Lead → Update Leads List
```

1. **Email Reception**: Email arrives at configured inbox
2. **Webhook Call**: Email service POSTs to webhook URL
3. **Parsing**: System extracts sender, subject, content
4. **AI Analysis**: Gemini AI extracts budget, timeline, service type
5. **Lead Creation**: New lead created (or existing updated)
6. **Auto-Refresh**: Leads list updates automatically every 30 seconds

## Features

- ✅ Automatic lead creation from emails
- ✅ AI-powered email analysis
- ✅ Duplicate detection (updates existing leads)
- ✅ Real-time leads list updates
- ✅ Multi-provider support (SendGrid, Mailgun, Custom)

## Troubleshooting

**Leads not appearing?**

- Check email sync is enabled
- Verify webhook URL in email service
- Check server logs for errors

**Need help?** See full documentation in `docs/EMAIL_SYNC.md`
