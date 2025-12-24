import { getDatabase } from "./mongodb";
import { Tenant } from "./database.types";
import { ObjectId } from "mongodb";

/**
 * Email Sync Configuration
 * Manages email sync settings for tenants
 */

export interface EmailSyncConfig {
  enabled: boolean;
  inbox_email?: string;
  webhook_secret?: string;
  provider?: "sendgrid" | "mailgun" | "gmail" | "custom";
  last_sync?: Date;
  gmail_tokens?: {
    access_token?: string;
    refresh_token?: string;
    expiry_date?: number;
  };
}

/**
 * Get email sync configuration for a tenant
 */
export async function getEmailSyncConfig(
  tenantId: string | ObjectId
): Promise<EmailSyncConfig | null> {
  const db = await getDatabase();
  const id = typeof tenantId === "string" ? new ObjectId(tenantId) : tenantId;

  const tenant = await db.collection<Tenant>("tenants").findOne({ _id: id });

  return tenant?.email_sync || null;
}

/**
 * Update email sync configuration for a tenant
 */
export async function updateEmailSyncConfig(
  tenantId: string | ObjectId,
  config: Partial<EmailSyncConfig>
): Promise<boolean> {
  try {
    const db = await getDatabase();
    const id = typeof tenantId === "string" ? new ObjectId(tenantId) : tenantId;

    const updateFields: Record<string, unknown> = {};

    if (config.enabled !== undefined)
      updateFields["email_sync.enabled"] = config.enabled;
    if (config.inbox_email !== undefined)
      updateFields["email_sync.inbox_email"] = config.inbox_email;
    if (config.webhook_secret !== undefined)
      updateFields["email_sync.webhook_secret"] = config.webhook_secret || "";
    if (config.provider !== undefined)
      updateFields["email_sync.provider"] = config.provider || "";
    if (config.last_sync !== undefined)
      updateFields["email_sync.last_sync"] = config.last_sync || "";
    if (config.gmail_tokens !== undefined)
      updateFields["email_sync.gmail_tokens"] = config.gmail_tokens;

    if (Object.keys(updateFields).length === 0) return false;
    console.log("updateFields", updateFields);

    const result = await db
      .collection<Tenant>("tenants")
      .updateOne({ _id: id }, { $set: updateFields });

    console.log("result", result);

    return true;
  } catch (error) {
    console.error("Error updating email sync config:", error);
    return false;
  }
}

export async function disconnectGmail(
  tenantId: string | ObjectId
): Promise<boolean> {
  try {
    const db = await getDatabase();
    const id = typeof tenantId === "string" ? new ObjectId(tenantId) : tenantId;

    await db.collection<Tenant>("tenants").updateOne(
      { _id: id },
      {
        $unset: {
          "email_sync.gmail_tokens": "",
          "email_sync.inbox_email": "",
        },
        $set: {
          "email_sync.enabled": false,
          "email_sync.provider": undefined,
        },
      }
    );
    return true;
  } catch (error) {
    console.error("Error disconnecting Gmail:", error);
    return false;
  }
}

/**
 * Generate webhook URL for a tenant
 */
export function getWebhookUrl(tenantId: string, secret?: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const url = new URL("/api/webhooks/email", baseUrl);
  url.searchParams.set("tenant_id", tenantId);
  if (secret) {
    url.searchParams.set("secret", secret);
  }
  return url.toString();
}
