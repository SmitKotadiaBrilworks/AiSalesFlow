import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";

const JWT_SECRET =
  process.env.NEXT_PUBLIC_JWT_SECRET || "your-secret-key-change-in-production";

export interface JWTPayload {
  userId: string;
  email: string;
  tenantId?: string;
}

// Generate JWT token
export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "7d", // Token expires in 7 days
  });
}

// Verify JWT token
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    console.log("error", error);
    return null;
  }
}

// Get token from request headers (for API routes)
export function getTokenFromRequest(request: NextRequest): string | null {
  const cookieToken = request.cookies.get("auth_token")?.value;
  if (cookieToken) {
    return cookieToken;
  }
  const authHeader = request.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }
  return null;
}

// Get token from NextRequest (for middleware - supports cookies and headers)
export function getTokenFromNextRequest(request: {
  cookies: { get: (name: string) => { value: string } | undefined };
  headers: { get: (name: string) => string | null };
}): string | null {
  // First try cookie (for page navigation)
  const cookieToken = request.cookies.get("auth_token")?.value;
  if (cookieToken) {
    return cookieToken;
  }

  // Fallback to Authorization header (for API requests)
  const authHeader = request.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }

  return null;
}
