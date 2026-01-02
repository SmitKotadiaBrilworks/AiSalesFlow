# Email Notifications for Inbox Messages

## Overview

When users reply to leads from the inbox, the system now automatically sends email notifications to the leads so they can receive and respond to messages.

## How It Works

### Email Delivery Methods

The system supports **two methods** for sending emails:

#### 1. **Gmail API** (Preferred - if connected)

- If the tenant has connected their Gmail account via OAuth
- Emails are sent directly from the user's Gmail account
- Leads see the email coming from the actual user's email address
- Replies go directly back to the user's inbox
- More reliable and professional

#### 2. **SMTP** (Fallback)

- Used when Gmail is not connected
- Emails sent via configured SMTP server (e.g., SendGrid, Mailgun, etc.)
- Requires SMTP credentials in `.env.local`:
  ```
  SMTP_HOST=smtp.gmail.com
  SMTP_PORT=587
  SMTP_SECURE=false
  SMTP_USER=your-email@gmail.com
  SMTP_PASS=your-app-password
  SMTP_FROM="AI SalesFlow <noreply@example.com>"
  ```

## Email Flow

```
User sends message in inbox
         ↓
Message saved to MongoDB
         ↓
Check if Gmail is connected
         ↓
    ┌─────────────┐
    │  Gmail?     │
    └─────────────┘
         ↓
    Yes  │  No
         ↓
  ┌──────────────┐     ┌──────────────┐
  │ Send via     │     │ Send via     │
  │ Gmail API    │     │ SMTP         │
  └──────────────┘     └──────────────┘
         ↓                    ↓
    Email delivered to lead
         ↓
    Lead receives email
         ↓
    Lead can reply directly
```

## Email Format

When a user sends a message from the inbox, the lead receives an email with:

**Subject:** `Reply from [User Name]`

**Body:**

```
Hi [Lead Name],

[Message content from inbox]

---
This email was sent from the AI SalesFlow inbox.
To reply, simply respond to this email.
```

## Implementation Details

### Files Modified

1. **`/lib/gmail.ts`**

   - Updated `SCOPES` to include `gmail.send` permission
   - Added `sendGmailMessage()` function to send emails via Gmail API

2. **`/lib/email.ts`**

   - Added `sendInboxReply()` function
   - Handles Gmail → SMTP fallback logic
   - Formats email with proper HTML/text content

3. **`/app/api/messages/route.ts`**
   - Updated POST endpoint to send emails
   - Automatically triggers email when `sender_type === "user"`
   - Sends emails asynchronously (doesn't block response)

### Key Functions

#### `sendGmailMessage(tokens, options)`

Sends an email using the Gmail API with RFC 2822 formatting.

**Parameters:**

- `tokens`: OAuth credentials for Gmail
- `options`: Email details (to, subject, text, html, from)

**Returns:** Gmail API response

#### `sendInboxReply(leadEmail, leadName, content, senderName, tenantId)`

Sends an inbox reply to a lead via email.

**Process:**

1. Fetch tenant configuration
2. Check if Gmail is connected
3. Send via Gmail if available, otherwise SMTP
4. Log delivery method

**Parameters:**

- `leadEmail`: Lead's email address
- `leadName`: Lead's name (or null)
- `content`: Message content
- `senderName`: User's name
- `tenantId`: Tenant ID for Gmail lookup

## Setting Up Gmail Integration

For Gmail to work, users need to:

1. **Connect Gmail** from the Leads page
2. **Authorize** the application to send emails on their behalf
3. **Grant permissions** for `gmail.send` scope

### Important Notes

⚠️ **Users who previously connected Gmail need to reconnect** because we added the `gmail.send` permission to the scopes. The old tokens won't have send permissions.

### Gmail Connection Flow

1. Go to **Leads Page**
2. Click **"Connect Gmail"**
3. Authorize with Google
4. Grant permissions (including "Send email on your behalf")
5. Inbox messages will now be sent via their Gmail

## Testing Email Delivery

### Test with Gmail (Recommended)

1. Connect your Gmail account
2. Send a message to a lead from inbox
3. Check your "Sent" folder in Gmail - the message should appear there
4. The lead will receive the email from your Gmail address

### Test with SMTP

1. Configure SMTP settings in `.env.local`
2. Disconnect Gmail (if connected)
3. Send a message from inbox
4. Check server logs for email delivery confirmation

### Mock Email (Development)

If no SMTP or Gmail is configured, emails are logged to console:

```
-----------------------------------------
📧 MOCK EMAIL SENT
To: lead@example.com
Subject: Reply from John Doe
Text: Hi there,...
-----------------------------------------
```

## Console Output

The system logs email delivery:

**Gmail Success:**

```
📧 Email sent to lead@example.com via Gmail
```

**SMTP Success:**

```
📧 Email sent to lead@example.com via SMTP
```

**Errors:**

```
Error sending via Gmail, falling back to SMTP: [error details]
Failed to send email notification: [error details]
```

## Error Handling

- **Email failures don't block message creation** - if email sending fails, the message is still saved to the database
- **Automatic fallback** from Gmail to SMTP if Gmail fails
- **Graceful degradation** - users still see their messages in the inbox even if email delivery fails
- **Async sending** - emails are sent in the background to keep UI responsive

## Reply Handling

When leads reply to emails:

### Gmail Integration

- Replies go to the user's actual Gmail inbox
- User can respond from their email client
- Can be synced back into the system via webhook/cron job

### SMTP Method

- Replies go to the `SMTP_FROM` address
- Requires webhook configuration to capture replies
- See email sync documentation for setup

## Future Enhancements

1. **Email Templates** - Customizable email templates per tenant
2. **Reply Parsing** - Automatically capture email replies and create messages
3. **Email Threading** - Maintain conversation threads with In-Reply-To headers
4. **Attachment Support** - Allow sending files via email
5. **Email Tracking** - Track opens and clicks
6. **Unsubscribe Links** - Add unsubscribe options for leads
7. **Signature Insertion** - Add user signatures to emails

## Troubleshooting

### Emails not being sent

1. **Check Gmail connection**

   ```
   Go to Leads → Check Gmail status
   ```

2. **Check SMTP configuration**

   ```
   Verify SMTP_* environment variables
   ```

3. **Check server logs**

   ```
   Look for "📧 Email sent" messages
   Look for any error messages
   ```

4. **Check lead has email**
   ```
   Verify the lead has an email address in the database
   ```

### Gmail quota limits

Gmail API has sending limits:

- **G Suite**: 2,000 emails/day
- **Personal Gmail**: 500 emails/day

If you hit limits, the system will automatically fall back to SMTP.

## Security Considerations

- Gmail tokens are stored encrypted in the database
- SMTP credentials should be stored in environment variables
- Never commit credentials to version control
- Use app-specific passwords for Gmail SMTP
- Consider using OAuth for production SMTP providers

---

**Last Updated:** January 2, 2026

**Related Documentation:**

- [Inbox Implementation](./INBOX_IMPLEMENTATION.md)
- [Gmail Integration](./GMAIL_INTEGRATION.md) (if exists)
- [Email Sync](./EMAIL_SYNC.md) (if exists)
