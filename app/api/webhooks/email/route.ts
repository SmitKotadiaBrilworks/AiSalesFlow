import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { parseEmail, extractNameFromEmail } from "@/lib/email-parser";
import {
  createLead,
  createMessage,
  getLeadsByTenant,
} from "@/lib/database.helpers";
import { generateLeadSummary } from "@/lib/ai/lead-summary";
import { ObjectId } from "mongodb";

/**
 * Email Webhook Endpoint
 *
 * This endpoint receives incoming emails and creates leads automatically.
 *
 * Supported formats:
 * 1. Raw MIME email (POST with Content-Type: message/rfc822)
 * 2. JSON payload from email services (SendGrid, Mailgun, etc.)
 *
 * Query params:
 * - tenant_id: Required - The tenant ID to associate the lead with
 * - secret: Optional - Webhook secret for authentication
 */
export async function POST(request: NextRequest) {
  try {
    const tenantId = request.nextUrl.searchParams.get("tenant_id");
    const secret = request.nextUrl.searchParams.get("secret");

    if (!tenantId) {
      return NextResponse.json(
        { error: "tenant_id is required" },
        { status: 400 }
      );
    }

    // Verify webhook secret if configured
    const expectedSecret = process.env.EMAIL_WEBHOOK_SECRET;
    if (expectedSecret && secret !== expectedSecret) {
      return NextResponse.json(
        { error: "Invalid webhook secret" },
        { status: 401 }
      );
    }

    const contentType = request.headers.get("content-type") || "";

    let parsedEmail;

    // Handle raw MIME email
    if (
      contentType.includes("message/rfc822") ||
      contentType.includes("text/plain")
    ) {
      const rawEmail = await request.text();
      parsedEmail = await parseEmail(rawEmail);
    }
    // Handle JSON payload (from SendGrid, Mailgun, etc.)
    else if (contentType.includes("application/json")) {
      const body = await request.json();
      parsedEmail = await parseEmailFromWebhook(body);
    }
    // Try to parse as raw email
    else {
      const rawEmail = await request.text();
      parsedEmail = await parseEmail(rawEmail);
    }

    // Validate parsed email
    if (!parsedEmail.from?.email) {
      return NextResponse.json(
        { error: "Invalid email: missing sender" },
        { status: 400 }
      );
    }

    const db = await getDatabase();

    // Check if tenant exists
    const tenant = await db.collection("tenants").findOne({
      _id: new ObjectId(tenantId),
    });

    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    // Extract name from email
    const name = extractNameFromEmail(
      parsedEmail.from.email,
      parsedEmail.from.name
    );

    // Check if lead already exists (by email)
    const existingLead = await db.collection("leads").findOne({
      tenant_id: new ObjectId(tenantId),
      email: parsedEmail.from.email.toLowerCase(),
    });

    let lead;
    let isNewLead = false;

    if (existingLead) {
      // Update existing lead
      lead = existingLead;
      // Update last activity
      await db.collection("leads").updateOne(
        { _id: existingLead._id },
        {
          $set: {
            updated_at: new Date(),
          },
        }
      );
    } else {
      // Generate AI summary from email content
      let aiResult = null;
      const emailContent = parsedEmail.text || parsedEmail.html || "";
      if (emailContent) {
        aiResult = await generateLeadSummary(emailContent);
      }

      // Create new lead
      const leadInput = {
        tenant_id: tenantId,
        status: "new" as const,
        source: "email",
        name: name,
        email: parsedEmail.from.email.toLowerCase(),
        phone: null,
        summary: aiResult?.summary || emailContent.substring(0, 500),
        ai_analysis: aiResult?.ai_analysis,
      };

      lead = await createLead(db, leadInput);
      isNewLead = true;
    }

    // Create message from email
    const emailContent = parsedEmail.text || parsedEmail.html || "";
    if (emailContent) {
      await createMessage(db, {
        lead_id: lead._id,
        sender_type: "lead",
        content: emailContent,
      });
    }

    return NextResponse.json({
      success: true,
      message: isNewLead
        ? "Lead created from email"
        : "Email added to existing lead",
      leadId: lead._id.toString(),
      isNewLead,
    });
  } catch (error) {
    console.error("Email webhook error:", error);
    return NextResponse.json(
      {
        error: "Failed to process email",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * Parse email from webhook JSON payload (SendGrid, Mailgun format)
 */
async function parseEmailFromWebhook(
  body: any
): Promise<import("@/lib/email-parser").ParsedEmail> {
  // Handle SendGrid format
  if (body.from && body.text) {
    return {
      from: {
        name: body.from_name || undefined,
        email: body.from || body.from_email || "",
      },
      to: body.to || body.email || "",
      subject: body.subject || "",
      text: body.text || body.text_plain || "",
      html: body.html || body.text_html,
      date: body.timestamp ? new Date(body.timestamp * 1000) : new Date(),
      messageId: body.message_id,
      replyTo: body.reply_to,
    };
  }

  // Handle Mailgun format
  if (body["sender"] || body["from"]) {
    const from = body["sender"] || body["from"] || "";
    const fromMatch = from.match(/^(.+?)\s*<(.+?)>$/) || [null, null, from];

    return {
      from: {
        name: fromMatch[1]?.trim() || undefined,
        email: fromMatch[2] || from,
      },
      to: body["recipient"] || body["to"] || "",
      subject: body["subject"] || "",
      text: body["body-plain"] || body["body"] || "",
      html: body["body-html"],
      date: body["timestamp"] ? new Date(body["timestamp"] * 1000) : new Date(),
      messageId: body["Message-Id"],
    };
  }

  // Generic format - try to extract from common fields
  throw new Error("Unsupported webhook format");
}

// Health check
export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "Email webhook endpoint is active",
    usage:
      "POST /api/webhooks/email?tenant_id=YOUR_TENANT_ID&secret=YOUR_SECRET",
  });
}
