import { simpleParser, ParsedMail } from "mailparser";

export interface ParsedEmail {
  from: {
    name?: string;
    email: string;
  };
  to: string | string[];
  subject: string;
  text: string;
  html?: string;
  date: Date;
  messageId?: string;
  replyTo?: string;
  attachments?: Array<{
    filename: string;
    contentType: string;
    content: Buffer;
  }>;
}

/**
 * Parse raw email content (MIME format)
 */
export async function parseEmail(
  rawEmail: string | Buffer
): Promise<ParsedEmail> {
  try {
    const parsed: ParsedMail = await simpleParser(rawEmail);

    // Extract sender info
    const fromAddress = parsed.from?.value[0];
    const fromName = fromAddress?.name || "";
    const fromEmail = fromAddress?.address || "";

    // Extract recipient(s)
    const toAddresses = parsed.to?.value || [];
    const to = toAddresses.map((addr) => addr.address);

    // Extract reply-to if available
    const replyToAddress = parsed.replyTo?.value[0];
    const replyTo = replyToAddress?.address;

    return {
      from: {
        name: fromName,
        email: fromEmail,
      },
      to: to.length === 1 ? to[0] : to,
      subject: parsed.subject || "",
      text: parsed.text || "",
      html: parsed.html || undefined,
      date: parsed.date || new Date(),
      messageId: parsed.messageId,
      replyTo,
      attachments: parsed.attachments?.map((att) => ({
        filename: att.filename || "attachment",
        contentType: att.contentType || "application/octet-stream",
        content: att.content,
      })),
    };
  } catch (error) {
    console.error("Error parsing email:", error);
    throw new Error("Failed to parse email");
  }
}

/**
 * Extract name from email address or from field
 */
export function extractNameFromEmail(
  email: string,
  fromName?: string
): string | null {
  if (fromName) {
    return fromName.trim();
  }

  // Try to extract name from email like "John Doe <john@example.com>"
  const match = email.match(/^(.+?)\s*<(.+?)>$/);
  if (match) {
    return match[1].trim();
  }

  // Extract from email address (before @)
  const emailPart = email.split("@")[0];
  if (emailPart) {
    // Convert "john.doe" to "John Doe"
    return emailPart
      .split(/[._-]/)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  }

  return null;
}
