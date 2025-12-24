import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import {
  createLead,
  createMessage,
  getLeadsByTenant,
} from "@/lib/database.helpers";
import { generateLeadSummary } from "@/lib/ai/lead-summary";
import { sendLeadWelcomeEmail, sendNewLeadNotification } from "@/lib/email";
import { ObjectId } from "mongodb";

export async function GET(request: NextRequest) {
  console.log("Received lead submission:");
  console.log(request);
  const tenant_id = request.nextUrl.searchParams.get("tenant_id");

  if (!tenant_id) {
    return NextResponse.json(
      { error: "Tenant ID is required" },
      { status: 400 }
    );
  }
  try {
    const db = await getDatabase();
    const leads = await getLeadsByTenant(db, tenant_id);
    console.log("leads", leads);
    return NextResponse.json({
      success: true,
      leads,
      message: "Leads fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching leads:", error);
    return NextResponse.json(
      { error: "Error fetching leads" },
      { status: 400 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // Basic validation
    if (!body.email && !body.phone) {
      console.log("Email or phone is required");
      return NextResponse.json(
        { error: "Email or phone is required" },
        { status: 400 }
      );
    }

    const start = Date.now();

    // 1. Generate AI Summary (if message exists)
    // We do this in parallel or before DB ops. Doing it before allows us to save it on the lead immediately.
    let aiResult = null;
    if (body.message) {
      aiResult = await generateLeadSummary(body.message);
    }

    // 2. Connect to DB
    const db = await getDatabase();

    // 3. Create Lead
    const tenantId = body.tenant_id ? body.tenant_id : new ObjectId();

    const leadInput = {
      tenant_id: tenantId,
      status: "new" as const,
      source: body.source || "api",
      visitor_id: body.visitor_id,
      name: body.name,
      email: body.email,
      phone: body.phone,
      summary: aiResult?.summary,
      ai_analysis: aiResult?.ai_analysis,
    };

    const lead = await createLead(db, leadInput);

    // 4. Create Initial Message
    if (body.message) {
      await createMessage(db, {
        lead_id: lead._id,
        sender_type: "lead",
        content: body.message,
      });
    }

    // 5. Send Emails (Fire and forget)
    // We don't await these to keep response fast, or we can await if critical.
    if (body.email) {
      sendLeadWelcomeEmail(body.name || "there", body.email).catch((err) =>
        console.error("Failed to send welcome email:", err)
      );
    }

    // Notify admin
    sendNewLeadNotification(lead).catch((err) =>
      console.error("Failed to send admin notification:", err)
    );

    const duration = Date.now() - start;
    console.log(`Lead created in ${duration}ms with AI summary: ${!!aiResult}`);

    return NextResponse.json({
      success: true,
      message: "Lead captured successfully",
      leadId: lead._id.toString(),
      summary: aiResult?.summary,
    });
  } catch (error) {
    console.error("Error creating lead:", error);
    return NextResponse.json(
      { error: "Failed to create lead" },
      { status: 500 }
    );
  }
}
