# Quick Start: Email Delivery for Inbox Messages

## 🎯 Goal

Enable automatic email delivery when you send messages to leads from the inbox.

---

## ⚡ Quick Setup (2 Minutes)

### Option 1: Gmail (Recommended) ✨

1. Go to **Leads** page
2. Click **"Connect Gmail"** button
3. Sign in with Google
4. Click **"Allow"** to grant permissions
5. ✅ Done! Messages will be sent from your Gmail

> 💡 **Tip:** If you previously connected Gmail, **reconnect** to get send permissions.

---

### Option 2: SMTP (Alternative) 📧

Add these lines to your `.env.local` file:

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-specific-password
SMTP_FROM="Your Name <noreply@yourcompany.com>"
```

**Restart the server:**

```bash
npm run dev
```

---

## ✅ Test It Works

1. Go to **Inbox** page
2. Select any conversation
3. Type a message
4. Click **Send**
5. Look for: **"Message sent and email delivered to lead"** ✅

---

## 📱 What Leads See

**Email Subject:**  
`Reply from [Your Name]`

**Email Body:**

```
Hi [Lead Name],

[Your message content]

---
This email was sent from the AI SalesFlow inbox.
To reply, simply respond to this email.
```

---

## 🔍 Verify Email Was Sent

### If using Gmail:

- Check your **Gmail Sent folder**
- Email should appear there

### If using SMTP:

- Check server console logs
- Look for: `📧 Email sent to lead@example.com via SMTP`

### Development mode:

- Check terminal output
- Look for: `📧 MOCK EMAIL SENT`

---

## 🚨 Troubleshooting

### "No email sent" or errors?

**Quick fixes:**

1. **Check Gmail connection:**

   - Go to Leads → See if Gmail is connected
   - If not, click "Connect Gmail"

2. **Check SMTP settings:**

   ```bash
   # Verify these exist in .env.local
   echo $SMTP_HOST
   echo $SMTP_USER
   ```

3. **Check lead has email:**

   - Open conversation
   - Verify lead email is shown

4. **Check console logs:**
   ```bash
   # Look for error messages
   npm run dev
   ```

### Gmail quota exceeded?

- Personal Gmail: 500 emails/day limit
- G Suite: 2,000 emails/day limit
- System auto-falls back to SMTP

---

## 💡 Pro Tips

1. **Use Gmail for better deliverability**

   - Emails come from your real address
   - Better sender reputation
   - Replies go to your Gmail

2. **Set up email signature**

   - Configure in Gmail settings
   - Will appear in all sent emails

3. **Check spam folders**

   - First few emails might go to spam
   - Mark as "Not Spam" to improve delivery

4. **Use app-specific password for SMTP**
   - Don't use your main Gmail password
   - Generate at: https://myaccount.google.com/apppasswords

---

## 📊 Email Delivery Status

| Method     | Speed      | Reliability     | Setup Difficulty |
| ---------- | ---------- | --------------- | ---------------- |
| Gmail API  | ⚡ Instant | 🟢 High         | Easy (OAuth)     |
| SMTP       | ⚡ Instant | 🟢 High         | Medium (Config)  |
| Mock (Dev) | ⚡ Instant | 🟡 Console Only | None             |

---

## 🎓 How to Get Gmail App Password (for SMTP)

1. Go to https://myaccount.google.com/security
2. Enable **2-Step Verification** (if not already)
3. Go to **App passwords**
4. Select **Mail** and **Other (Custom name)**
5. Enter "AI SalesFlow"
6. Click **Generate**
7. Copy the 16-character password
8. Use in `SMTP_PASS` in `.env.local`

---

## ✨ What You Get

✅ **Automatic email delivery** - No manual work  
✅ **Professional appearance** - Real email addresses  
✅ **Centralized inbox** - All conversations in one place  
✅ **Easy replies** - Leads just reply to email  
✅ **Gmail integration** - Sent emails in your Gmail  
✅ **Fallback protection** - Always delivers, even if one method fails

---

## 📚 Need More Help?

- 📖 [Full Email Documentation](./EMAIL_NOTIFICATIONS.md)
- 📖 [Inbox Implementation Guide](./INBOX_IMPLEMENTATION.md)
- 📖 [Email Delivery Summary](./EMAIL_DELIVERY_SUMMARY.md)

---

**Questions?** Check the console logs for detailed debugging information.

**Ready to go?** Just connect Gmail and start messaging! 🚀
