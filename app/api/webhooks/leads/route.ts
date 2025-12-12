import { getDatabase } from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate webhook signature (implement based on your webhook provider)
    // const signature = request.headers.get('x-webhook-signature')
    // if (!validateSignature(signature, body)) {
    //   return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    // }
    const db = await getDatabase();
    db.collection("leads")
      .watch()
      .on("change", (change) => {});

    console.log("Lead webhook received:", body);

    // In a real app, you would:
    // 1. Validate the payload
    // 2. Insert lead into Supabase
    // 3. Trigger AI processing
    // 4. Send notification to team

    // Example: Insert into Supabase
    // const { data, error } = await supabase.from('leads').insert({
    //   name: body.name,
    //   email: body.email,
    //   source: body.source || 'webhook',
    //   tenant_id: body.tenant_id,
    // })

    return NextResponse.json({
      success: true,
      message: "Lead webhook processed",
      leadId: "webhook-lead-" + Date.now(),
    });
  } catch (error) {
    console.error("Lead webhook error:", error);
    return NextResponse.json(
      { error: "Failed to process webhook" },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: "ok",
    endpoint: "leads-webhook",
    timestamp: new Date().toISOString(),
  });
}
