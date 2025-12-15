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
  provider?: "sendgrid" | "mailgun" | "custom";
  last_sync?: Date;
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

    const updateData: Partial<Tenant> = {
      email_sync: {
        enabled: config.enabled ?? false,
        inbox_email: config.inbox_email,
        webhook_secret: config.webhook_secret,
        provider: config.provider,
        last_sync: config.last_sync || new Date(),
      },
    };

    await db
      .collection<Tenant>("tenants")
      .updateOne({ _id: id }, { $set: updateData });

    return true;
  } catch (error) {
    console.error("Error updating email sync config:", error);
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
