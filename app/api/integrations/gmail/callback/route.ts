import { NextRequest, NextResponse } from "next/server";
import { getTokensFromCode, getGmailProfile } from "@/lib/gmail";
import { updateEmailSyncConfig } from "@/lib/email-sync";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const error = req.nextUrl.searchParams.get("error");

  if (error) {
    const html = `
      <html><body><script>
        window.opener.postMessage({ type: 'GMAIL_CONNECTED', success: false, error: '${error}' }, '*');
        window.close();
      </script></body></html>
    `;
    return new NextResponse(html, { headers: { "Content-Type": "text/html" } });
  }

  if (!code || !state) {
    const html = `
      <html><body><script>
        window.opener.postMessage({ type: 'GMAIL_CONNECTED', success: false, error: 'Invalid callback parameters' }, '*');
        window.close();
      </script></body></html>
    `;
    return new NextResponse(html, { headers: { "Content-Type": "text/html" } });
  }

  try {
    const decodedState = JSON.parse(Buffer.from(state, "base64").toString());
    const { tenantId } = decodedState;

    if (!tenantId) {
      throw new Error("No tenant ID in state");
    }

    const tokens = await getTokensFromCode(code);
    const profile = await getGmailProfile(tokens);
    const email = profile.emailAddress;

    // If we didn't receive a refresh token, we should probably check if we already have one?
    // But for now, let's just save what we got.
    // If prompt='consent' was used, we should get a refresh token.

    await updateEmailSyncConfig(tenantId, {
      provider: "gmail",
      enabled: true,
      inbox_email: email || undefined,
      gmail_tokens: {
        access_token: tokens.access_token || undefined,
        refresh_token: tokens.refresh_token || undefined,
        expiry_date: tokens.expiry_date || undefined,
      },
    });

    const html = `
      <html>
        <body>
          <script>
            window.opener.postMessage({ type: 'GMAIL_CONNECTED', success: true }, '*');
            window.close();
          </script>
          <p>Connected! Closing window...</p>
        </body>
      </html>
    `;
    return new NextResponse(html, {
      headers: { "Content-Type": "text/html" },
    });
  } catch (error) {
    console.error("Gmail callback error:", error);
    const html = `
      <html>
        <body>
          <script>
            window.opener.postMessage({ type: 'GMAIL_CONNECTED', success: false, error: 'Auth failed' }, '*');
            window.close();
          </script>
          <p>Authentication failed. Closing window...</p>
        </body>
      </html>
    `;
    return new NextResponse(html, {
      headers: { "Content-Type": "text/html" },
    });
  }
}
