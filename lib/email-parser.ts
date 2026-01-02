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
  inReplyTo?: string; // Message-ID this email is replying to
  references?: string; // References header for threading
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
    const toAddresses = Array.isArray(parsed.to)
      ? parsed.to.flatMap((addr) => addr.value || [])
      : parsed.to?.value || [];
    const to = toAddresses
      .map((addr) => addr.address)
      .filter((addr): addr is string => addr !== undefined);

    // Extract reply-to if available
    const replyToAddress = parsed.replyTo?.value[0];
    const replyTo = replyToAddress?.address;

    // Extract threading headers
    const inReplyTo = parsed.inReplyTo;
    const references = Array.isArray(parsed.references)
      ? parsed.references.join(" ")
      : parsed.references || undefined;

    return {
      from: {
        name: fromName,
        email: fromEmail,
      },
      to: to.length === 1 ? to[0] : to.length > 0 ? to : "",
      subject: parsed.subject || "",
      text: parsed.text || "",
      html: parsed.html || undefined,
      date: parsed.date || new Date(),
      messageId: parsed.messageId,
      replyTo,
      inReplyTo,
      references,
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

/**
 * Extract only the reply text from an email, removing quoted content
 * This function identifies and removes common email reply patterns
 */
export function extractReplyText(emailContent: string): string {
  if (!emailContent) return "";

  // For HTML emails, extract text first
  let text = emailContent;

  // Remove HTML tags if present (basic cleanup)
  text = text.replace(/<[^>]+>/g, " ");
  text = text.replace(/&nbsp;/g, " ");
  text = text.replace(/&lt;/g, "<");
  text = text.replace(/&gt;/g, ">");
  text = text.replace(/&amp;/g, "&");

  const lines = text.split("\n");
  const replyLines: string[] = [];

  // Common patterns that indicate quoted content
  // These patterns match the start of quoted sections
  const quotedPatterns = [
    /^>\s*/, // Lines starting with >
    /^>>\s*/, // Lines starting with >>
    /^>>>\s*/, // Lines starting with >>>
    /^\|\s*/, // Lines starting with |
    /^On .+ wrote:$/i, // "On [date] [person] wrote:"
    /^On .+ at .+ wrote:$/i, // "On [date] at [time] [person] wrote:"
    /^On .+ <.+> wrote:$/i, // "On [date] <email> wrote:"
    /^On .+ at .+ <.+> wrote:$/i, // "On [date] at [time] <email> wrote:"
    /^On .+ at .+ <.+@.+> wrote:$/i, // "On Fri, 2 Jan 2026 at 16:42, <email> wrote:"
    /^From:.*$/i, // "From: email@example.com"
    /^Sent:.*$/i, // "Sent: [date]"
    /^Date:.*$/i, // "Date: [date]"
    /^To:.*$/i, // "To: email@example.com"
    /^Subject:.*$/i, // "Subject: ..."
    /^---Original Message---/i,
    /^-----Original Message-----/i,
    /^From:.*Sent:.*To:.*Subject:/i, // Combined header
    /^________________________________/i, // Separator line
    /^_{10,}/i, // Multiple underscores
    /^={10,}/i, // Multiple equals signs
    /^Best regards/i,
    /^Regards/i,
    /^Sincerely/i,
    /^Thanks/i,
    /^Thank you/i,
    /^This email was sent from/i, // AI SalesFlow footer
    /^----------/i, // Separator dashes
  ];

  // Also check for patterns that might appear mid-line
  const midLineQuotedPatterns = [
    /On .+ at .+ <.+@.+> wrote:/i, // Can appear anywhere in line
  ];

  for (const line of lines) {
    const trimmedLine = line.trim();

    // Skip empty lines at the start
    if (replyLines.length === 0 && !trimmedLine) continue;

    // Check if this line matches quoted content patterns at the start
    const isQuotedStart = quotedPatterns.some((pattern) =>
      pattern.test(trimmedLine)
    );

    // Check if line contains quoted patterns anywhere
    const isQuotedMid = midLineQuotedPatterns.some((pattern) =>
      pattern.test(line)
    );

    if (isQuotedStart || isQuotedMid) {
      // If we find quoted content, stop here
      // But first, check if there's any text before the quoted pattern
      if (isQuotedMid && !isQuotedStart) {
        // Extract text before the quoted pattern
        const match = line.match(/^(.+?)(On .+ at .+ <.+@.+> wrote:)/i);
        if (match && match[1].trim()) {
          replyLines.push(match[1].trim());
        }
      }
      break;
    }

    // If we haven't found quoted content yet, add the line
    replyLines.push(line);
  }

  let replyText = replyLines.join("\n").trim();

  // Additional cleanup: remove common email signatures
  // Split by newlines and find where signature starts
  const textLines = replyText.split("\n");
  let signatureStartIndex = -1;

  for (let i = 0; i < textLines.length; i++) {
    const line = textLines[i].trim();
    if (
      /^--\s*$/.test(line) ||
      /^Best regards/i.test(line) ||
      /^Regards/i.test(line) ||
      /^Sincerely/i.test(line) ||
      /^Sent from/i.test(line) ||
      /^Get Outlook/i.test(line) ||
      /^This email was sent from/i.test(line)
    ) {
      signatureStartIndex = i;
      break;
    }
  }

  if (signatureStartIndex > 0) {
    replyText = textLines.slice(0, signatureStartIndex).join("\n").trim();
  }

  return replyText.trim();
}
