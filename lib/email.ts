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
      from:
        process.env.SMTP_FROM || '"AI SalesForce" <noreply@aisalesforce.com>',
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
  const subject = "Welcome to AI SalesForce!";
  const text = `Hi ${
    leadName || "there"
  },\n\nThanks for reaching out! We've received your inquiry and one of our team members will get back to you shortly.\n\nBest,\nThe AI SalesForce Team`;

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
