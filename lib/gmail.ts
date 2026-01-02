import { google } from "googleapis";
import { Credentials, OAuth2Client } from "google-auth-library";

const SCOPES = [
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/gmail.send", // Add send permission
];

export function getGmailAuth(): OAuth2Client {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET");
  }

  return new google.auth.OAuth2(
    clientId,
    clientSecret,
    `${
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    }/api/integrations/gmail/callback`
  );
}

export function getAuthUrl(state?: string): string {
  const auth = getGmailAuth();
  return auth.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    prompt: "consent", // Force refresh token generation
    state,
  });
}

export async function getTokensFromCode(code: string) {
  const auth = getGmailAuth();
  const { tokens } = await auth.getToken(code);
  return tokens;
}

export function getGmailClient(tokens: Credentials) {
  const auth = getGmailAuth();
  auth.setCredentials(tokens);
  return google.gmail({ version: "v1", auth });
}

export async function getGmailProfile(tokens: Credentials) {
  const gmail = getGmailClient(tokens);
  const { data } = await gmail.users.getProfile({ userId: "me" });
  return data;
}

/**
 * Send an email using Gmail API with proper threading support
 */
export async function sendGmailMessage(
  tokens: Credentials,
  options: {
    to: string;
    subject: string;
    text: string;
    html?: string;
    from?: string; // Optional: sender name
    inReplyTo?: string; // Message-ID of the email we're replying to
    references?: string; // Thread references
    threadId?: string; // Gmail thread ID to keep conversation together
  }
) {
  const gmail = getGmailClient(tokens);

  // Create email in RFC 2822 format
  const utf8Subject = `=?utf-8?B?${Buffer.from(options.subject).toString(
    "base64"
  )}?=`;

  // Generate a unique Message-ID for this email
  const messageId = `<${Date.now()}-${Math.random()
    .toString(36)
    .substring(7)}@aisalesflow.com>`;

  const messageParts = [
    `From: ${options.from || "AI SalesFlow"} <me>`,
    `To: ${options.to}`,
    `Subject: ${utf8Subject}`,
    `Message-ID: ${messageId}`,
  ];

  // Add threading headers if replying
  if (options.inReplyTo) {
    messageParts.push(`In-Reply-To: ${options.inReplyTo}`);
    messageParts.push(`References: ${options.references || options.inReplyTo}`);
  }

  messageParts.push(
    "MIME-Version: 1.0",
    'Content-Type: text/html; charset="UTF-8"',
    "",
    options.html || options.text
  );

  const message = messageParts.join("\n");
  const encodedMessage = Buffer.from(message)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  const requestBody: {
    raw: string;
    threadId?: string;
  } = {
    raw: encodedMessage,
  };

  // If we have a thread ID, add it to keep the conversation together
  if (options.threadId) {
    requestBody.threadId = options.threadId;
  }

  const response = await gmail.users.messages.send({
    userId: "me",
    requestBody,
  });

  return {
    ...response.data,
    messageId, // Return our generated Message-ID for storage
  };
}
