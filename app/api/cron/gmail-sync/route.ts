import { NextRequest, NextResponse } from "next/server";
import { syncGmailLeads } from "@/lib/gmail-sync";

export const maxDuration = 60; // Allow it to run for up to 60 seconds
export const dynamic = "force-dynamic";

/**
 * Gmail Sync Cron Endpoint
 *
 * This endpoint syncs Gmail emails for all tenants with Gmail sync enabled.
 * It should be called by an external cron service every 5 minutes.
 *
 * Authentication: Requires CRON_SECRET environment variable
 *
 * Usage:
 * GET /api/cron/gmail-sync?secret=YOUR_CRON_SECRET
 */
export async function GET(request: NextRequest) {
  try {
    // Verify secret for security
    const secret = request.nextUrl.searchParams.get("secret");
    const expectedSecret = process.env.CRON_SECRET;

    if (!expectedSecret) {
      console.error("CRON_SECRET not configured in environment variables");
      return NextResponse.json(
        { error: "Cron secret not configured" },
        { status: 500 }
      );
    }

    if (secret !== expectedSecret) {
      console.warn("Unauthorized cron attempt");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log(`[${new Date().toISOString()}] Starting Gmail sync cron...`);
    await syncGmailLeads();
    console.log(`[${new Date().toISOString()}] Gmail sync completed.`);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      message: "Gmail sync completed successfully",
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Cron sync failed:`, error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
