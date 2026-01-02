import nodemailer from "nodemailer";
import { Lead } from "@/lib/database.types"; // Assuming Lead type is exported from there or we can use a partial type

// Configure transport
// In production, use real SMTP credentials
// In development, we'll log to console if no credentials provided
const getTransporter = () => {
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Boolean(process.env.SMTP_SECURE) || false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // Mock transporter for dev without creds
  return {
    sendMail: async (mailOptions: nodemailer.SendMailOptions) => {
      console.log("-----------------------------------------");
      console.log("📧 MOCK EMAIL SENT");
      console.log("To:", mailOptions.to);
      console.log("Subject:", mailOptions.subject);
      console.log("Text:", mailOptions.text);
      console.log("-----------------------------------------");
      return { messageId: "mock-" + Date.now() };
    },
  };
};

const transporter = getTransporter();

export const sendEmail = async ({
  to,
  subject,
  text,
  html,
}: {
  to: string;
  subject: string;
  text: string;
  html?: string;
}) => {
  try {
    // handling mock transporter overlap with real nodemailer transporter types
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || '"AI SalesFlow" <noreply@aiSalesFlow.com>',
      to,
      subject,
      text,
      html,
    });
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    // Don't throw, just log. We don't want to break the lead flow if email fails.
    return null;
  }
};

export const sendLeadWelcomeEmail = async (
  leadName: string,
  leadEmail: string
) => {
  const subject = "Welcome to AI SalesFlow!";
  const text = `Hi ${
    leadName || "there"
  },\n\nThanks for reaching out! We've received your inquiry and one of our team members will get back to you shortly.\n\nBest,\nThe AI SalesFlow Team`;

  await sendEmail({
    to: leadEmail,
    subject,
    text,
  });
};

export const sendNewLeadNotification = async (
  lead: Partial<Lead> & { name?: string | null }
) => {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) return;

  const subject = `New Lead: ${lead.name || "Unknown"}`;
  const text = `
    New lead received!
    
    Name: ${lead.name || "N/A"}
    Email: ${lead.email || "N/A"}
    Phone: ${lead.phone || "N/A"}
    Source: ${lead.source}
    
    Summary: ${lead.summary || "No summary generated"}
    
    View in dashboard: ${
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    }/leads
  `;

  await sendEmail({
    to: adminEmail,
    subject,
    text,
  });
};

/**
 * Send an inbox reply to a lead via email with proper threading
 * Uses Gmail if connected, otherwise falls back to SMTP
 */
export const sendInboxReply = async (
  leadEmail: string,
  leadName: string | null,
  messageContent: string,
  senderName: string,
  tenantId: string,
  leadId: string
) => {
  // Get previous messages to find threading info
  const { getDatabase } = await import("@/lib/mongodb");
  const { getTenantById, getMessagesByLead } = await import(
    "@/lib/database.helpers"
  );
  const { ObjectId } = await import("mongodb");

  const db = await getDatabase();
  const messages = await getMessagesByLead(db, leadId);

  // Find the most recent message from the lead (to get their Message-ID)
  const lastLeadMessage = messages
    .filter((m) => m.sender_type === "lead")
    .sort((a, b) => b.created_at.getTime() - a.created_at.getTime())[0];

  // Find the last message in this conversation for references
  const lastMessage = messages.length > 0 ? messages[0] : null;

  // Determine subject - use original subject with "Re:" prefix if replying
  let subject = `Reply from ${senderName}`;
  if (lastLeadMessage?.email_message_id) {
    // If we're replying to an existing thread, try to preserve the original subject
    // For now, we'll use a generic reply subject, but this could be enhanced
    // to extract the original subject from the first message in the thread
    subject = `Re: Reply from ${senderName}`;
  }

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <p>Hi ${leadName || "there"},</p>
      <p>${messageContent.replace(/\n/g, "<br>")}</p>
      <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
      <p style="color: #666; font-size: 12px;">
        This email was sent from the AI SalesFlow inbox.<br>
        To reply, simply respond to this email.
      </p>
    </div>
  `;

  const text = `Hi ${
    leadName || "there"
  },\n\n${messageContent}\n\n---\nThis email was sent from the AI SalesFlow inbox.\nTo reply, simply respond to this email.`;

  // Generate Message-ID for threading
  const messageId = `<${Date.now()}-${Math.random()
    .toString(36)
    .substring(7)}@aisalesflow.com>`;

  // Prepare threading metadata
  const inReplyTo = lastLeadMessage?.email_message_id || null;
  const references = lastLeadMessage?.email_references
    ? `${lastLeadMessage.email_references} ${lastLeadMessage.email_message_id}`
    : lastLeadMessage?.email_message_id || null;

  try {
    // Try to send via Gmail if tenant has it connected
    const tenant = await getTenantById(db, new ObjectId(tenantId));
    const { sendGmailMessage } = await import("@/lib/gmail");

    if (
      tenant?.email_sync?.enabled &&
      tenant.email_sync.provider === "gmail" &&
      tenant.email_sync.gmail_tokens
    ) {
      // Send via Gmail with threading
      const result = await sendGmailMessage(tenant.email_sync.gmail_tokens, {
        to: leadEmail,
        subject,
        text,
        html,
        from: senderName,
        // Add threading headers if we have previous messages
        inReplyTo: inReplyTo || undefined,
        references: references || undefined,
        threadId: lastMessage?.gmail_thread_id || undefined,
      });

      console.log(`📧 Email sent to ${leadEmail} via Gmail (threaded)`);

      return {
        success: true,
        method: "gmail",
        emailMetadata: {
          email_message_id: result.messageId,
          email_in_reply_to: inReplyTo,
          email_references: references,
          gmail_thread_id:
            result.threadId || lastMessage?.gmail_thread_id || null,
          gmail_message_id: result.id || null,
        },
      };
    }
  } catch (error) {
    console.error("Error sending via Gmail, falling back to SMTP:", error);
  }

  // Fallback to SMTP with threading headers
  try {
    const mailOptions: nodemailer.SendMailOptions = {
      from: process.env.SMTP_FROM || '"AI SalesFlow" <noreply@aiSalesFlow.com>',
      to: leadEmail,
      subject,
      text,
      html,
      messageId, // Set our generated Message-ID
    };

    // Add threading headers if replying
    if (inReplyTo) {
      mailOptions.inReplyTo = inReplyTo;
      mailOptions.references = references || inReplyTo;
    }

    const info = await transporter.sendMail(mailOptions);

    console.log(`📧 Email sent to ${leadEmail} via SMTP (threaded)`);

    return {
      success: true,
      method: "smtp",
      emailMetadata: {
        email_message_id: messageId,
        email_in_reply_to: inReplyTo,
        email_references: references,
        gmail_thread_id: null,
        gmail_message_id: null,
      },
    };
  } catch (error) {
    console.error("Error sending email via SMTP:", error);
    return { success: false, method: "smtp", emailMetadata: null };
  }
};
