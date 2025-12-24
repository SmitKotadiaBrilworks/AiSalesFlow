import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDatabase } from "@/lib/mongodb";
import { generateToken } from "@/lib/auth";
import { comparePassword } from "@/lib/authPassword";
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const db = await getDatabase();

    // Find user by email
    const user = await db.collection("users").findOne({
      email: email.toLowerCase(),
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Compare password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Get tenant info
    const tenantId =
      user.tenant_id instanceof ObjectId
        ? user.tenant_id
        : user.tenant_id
        ? new ObjectId(user.tenant_id)
        : null;

    const tenant = tenantId
      ? await db.collection("tenants").findOne({
          _id: tenantId,
        })
      : null;

    // Generate JWT token
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      tenantId: tenantId?.toString(),
    });

    // Create response with user data
    const response = NextResponse.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id.toString(),
        email: user.email,
        fullName: user.full_name,
        companyName: tenant?.name || "",
        tenantId: user.tenant_id?.toString(),
        role: user.role,
      },
    });

    // Set cookie for middleware to access
    // Cookie expires in 7 days (matching JWT expiration)
    const expires = new Date();
    expires.setTime(expires.getTime() + 7 * 24 * 60 * 60 * 1000);

    response.cookies.set("auth_token", token, {
      expires,
      path: "/",
      sameSite: "lax",
      httpOnly: false, // Set to false so client-side JS can also read it
      secure: process.env.NODE_ENV === "production", // Only secure in production
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Failed to login" }, { status: 500 });
  }
}
