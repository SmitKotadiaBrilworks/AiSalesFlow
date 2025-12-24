import { NextRequest, NextResponse } from "next/server";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";
import { getDatabase } from "@/lib/mongodb";
import {
  getEmailSyncConfig,
  updateEmailSyncConfig,
  getWebhookUrl,
} from "@/lib/email-sync";
import { ObjectId } from "mongodb";

/**
 * GET /api/email-sync/config
 * Get email sync configuration for the authenticated tenant
 */
export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || !payload.tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const config = await getEmailSyncConfig(payload.tenantId);
    const webhookUrl = getWebhookUrl(payload.tenantId, config?.webhook_secret);

    return NextResponse.json({
      config: config || {
        enabled: false,
      },
      webhookUrl,
    });
  } catch (error) {
    console.error("Error getting email sync config:", error);
    return NextResponse.json(
      { error: "Failed to get email sync config" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/email-sync/config
 * Update email sync configuration for the authenticated tenant
 */
export async function POST(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || !payload.tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { enabled, inbox_email, provider } = body;

    // Generate a secure webhook secret if enabling
    const webhook_secret =
      enabled && !body.webhook_secret
        ? generateWebhookSecret()
        : body.webhook_secret;

    const success = await updateEmailSyncConfig(payload.tenantId, {
      enabled: enabled ?? false,
      inbox_email,
      webhook_secret,
      provider: provider || "custom",
      last_sync: new Date(),
    });

    if (!success) {
      return NextResponse.json(
        { error: "Failed to update email sync config" },
        { status: 500 }
      );
    }

    const config = await getEmailSyncConfig(payload.tenantId);
    const webhookUrl = getWebhookUrl(payload.tenantId, config?.webhook_secret);

    return NextResponse.json({
      success: true,
      config,
      webhookUrl,
      message: "Email sync configuration updated",
    });
  } catch (error) {
    console.error("Error updating email sync config:", error);
    return NextResponse.json(
      { error: "Failed to update email sync config" },
      { status: 500 }
    );
  }
}

/**
 * Generate a secure webhook secret
 */
function generateWebhookSecret(): string {
  return (
    "wh_" +
    Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
  );
}
