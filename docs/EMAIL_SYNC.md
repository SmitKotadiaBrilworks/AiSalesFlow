# Email Sync Documentation

## Overview

Email Sync automatically creates leads in your database when you receive emails in your inbox. This feature monitors your configured email address and converts incoming emails into leads with AI-powered analysis.

## How It Works

1. **Email Reception**: When an email arrives at your configured inbox
2. **Webhook Trigger**: Your email service forwards the email to our webhook endpoint
3. **Email Parsing**: The system extracts sender info, subject, and content
4. **AI Analysis**: Gemini AI analyzes the email content to extract:
   - Budget information
   - Timeline
   - Service type
   - Priority level
   - Summary
5. **Lead Creation**: A new lead is created (or existing lead is updated)
6. **Message Storage**: The email content is stored as a message
7. **Real-time Update**: The leads list automatically refreshes to show the new lead

## Setup Instructions

### Step 1: Enable Email Sync

1. Go to **Settings** in your dashboard
2. Find the **Email Sync Configuration** section
3. Toggle **Enable Email Sync** to ON
4. Enter your **Inbox Email Address** (e.g., `inbox@yourcompany.com`)
5. Select your **Email Service Provider**
6. Click **Save Configuration**

### Step 2: Configure Your Email Service

#### Option A: SendGrid

1. Log in to your SendGrid account
2. Go to **Settings** → **Mail Settings** → **Inbound Parse**
3. Click **Add Host & URL**
4. Set **Hostname** to your domain (e.g., `inbox.yourcompany.com`)
5. Set **POST URL** to your webhook URL (copied from settings)
6. Save the configuration

#### Option B: Mailgun

1. Log in to your Mailgun account
2. Go to **Receiving** → **Routes**
3. Create a new route:
   - **Filter**: `match_recipient("inbox@yourcompany.com")`
   - **Action**: `forward("YOUR_WEBHOOK_URL")`
4. Save the route

#### Option C: Custom IMAP/Webhook

1. Set up an IMAP listener or email forwarding service
2. Configure it to POST emails to your webhook URL
3. Format: Raw MIME email or JSON payload

### Step 3: Test the Integration

1. Send a test email to your configured inbox address
2. Check your **Leads** page - a new lead should appear within 30 seconds
3. Click on the lead to see the AI-generated summary and analysis

## Webhook URL Format

```
POST /api/webhooks/email?tenant_id=YOUR_TENANT_ID&secret=YOUR_SECRET
```

### Headers

- `Content-Type: message/rfc822` (for raw MIME emails)
- `Content-Type: application/json` (for JSON payloads)

### Authentication

The webhook uses a secret token for authentication. This is automatically generated when you enable email sync and can be found in your settings.

## Supported Email Formats

### Raw MIME Email

Send the email as raw MIME format with header:

```
Content-Type: message/rfc822
```

### SendGrid Format

```json
{
  "from": "sender@example.com",
  "from_name": "John Doe",
  "to": "inbox@yourcompany.com",
  "subject": "Inquiry about services",
  "text": "Email body text",
  "html": "<p>Email body HTML</p>",
  "timestamp": 1234567890
}
```

### Mailgun Format

```json
{
  "sender": "John Doe <sender@example.com>",
  "from": "sender@example.com",
  "recipient": "inbox@yourcompany.com",
  "subject": "Inquiry about services",
  "body-plain": "Email body text",
  "body-html": "<p>Email body HTML</p>",
  "timestamp": 1234567890
}
```

## Features

- ✅ **Automatic Lead Creation**: Emails automatically become leads
- ✅ **AI-Powered Analysis**: Extract budget, timeline, and service type
- ✅ **Duplicate Detection**: Updates existing leads instead of creating duplicates
- ✅ **Message Threading**: Email content stored as messages linked to leads
- ✅ **Real-time Updates**: Leads list refreshes automatically
- ✅ **Multi-Provider Support**: Works with SendGrid, Mailgun, or custom services

## Environment Variables

Add to your `.env.local`:

```env
# Optional: Webhook secret (auto-generated if not set)
EMAIL_WEBHOOK_SECRET=your-secret-key-here

# Required for AI analysis
NEXT_PUBLIC_GEMINI_API_KEY=your-gemini-api-key
```

## Troubleshooting

### Leads Not Appearing

1. Check that email sync is enabled in Settings
2. Verify the webhook URL is correctly configured in your email service
3. Check server logs for webhook errors
4. Ensure the tenant_id in the webhook URL matches your account

### Email Not Parsing

1. Verify the email format matches one of the supported formats
2. Check that the email contains valid sender information
3. Review server logs for parsing errors

### AI Analysis Not Working

1. Verify `NEXT_PUBLIC_GEMINI_API_KEY` is set in environment variables
2. Check that the email content is not empty
3. Review server logs for AI generation errors

## API Endpoints

### Get Email Sync Config

```
GET /api/email-sync/config
Authorization: Bearer YOUR_TOKEN
```

### Update Email Sync Config

```
POST /api/email-sync/config
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "enabled": true,
  "inbox_email": "inbox@yourcompany.com",
  "provider": "sendgrid"
}
```

### Email Webhook

```
POST /api/webhooks/email?tenant_id=YOUR_TENANT_ID&secret=YOUR_SECRET
Content-Type: message/rfc822

[Raw MIME email content]
```

## Security

- Webhook URLs include a secret token for authentication
- Only emails sent to the configured webhook URL are processed
- Tenant isolation ensures leads are only created for the correct tenant
- All email content is securely stored in MongoDB
