import { google } from "googleapis";
import { Credentials, OAuth2Client } from "google-auth-library";

const SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"];

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
