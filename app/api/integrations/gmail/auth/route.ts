import { NextRequest, NextResponse } from "next/server";
import { getAuthUrl } from "@/lib/gmail";
import { verifyToken, getTokenFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) {
      // If no token found in API request, try to find it in cookies for direct browser navigation
      // But usually this endpoint is called via client-side fetch or link
      const cookieToken = req.cookies.get("auth_token")?.value;
      if (!cookieToken) {
        return NextResponse.redirect(new URL("/login", req.url));
      }
    }

    const authToken = token || req.cookies.get("auth_token")?.value;
    if (!authToken) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    const payload = verifyToken(authToken);
    if (!payload || !payload.tenantId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const state = JSON.stringify({ tenantId: payload.tenantId });
    const authUrl = getAuthUrl(Buffer.from(state).toString("base64"));

    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error("Gmail auth error:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
