import { NextRequest, NextResponse } from "next/server";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";
import { getEmailSyncConfig } from "@/lib/email-sync";

export async function GET(req: NextRequest) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || !payload.tenantId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const config = await getEmailSyncConfig(payload.tenantId);

    return NextResponse.json({
      connected: config?.enabled && config?.provider === "gmail",
      email: config?.inbox_email,
    });
  } catch (error) {
    console.error("Error fetching Gmail status:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
