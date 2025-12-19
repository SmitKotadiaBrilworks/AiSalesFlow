import { NextResponse } from "next/server";
import { syncGmailLeads } from "@/lib/gmail-sync";

export const maxDuration = 60; // Allow it to run for up to 60 seconds
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    console.log("Starting Gmail sync cron...");
    await syncGmailLeads();
    console.log("Gmail sync completed.");
    return NextResponse.json({ success: true, timestamp: new Date() });
  } catch (error) {
    console.error("Cron sync failed:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
