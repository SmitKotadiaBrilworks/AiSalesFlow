import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { generateToken } from "@/lib/auth";
import { hashPassword } from "@/lib/authPassword";

import { z } from "zod";

const signUpSchema = z.object({
  fullName: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name is too long"),
  companyName: z
    .string()
    .min(2, "Company name must be at least 2 characters")
    .max(150, "Company name is too long"),
  email: z.string().email(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).+$/,
      "Password must contain upper, lower case letters and a number"
    ),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const { fullName, email, password, companyName } = signUpSchema.parse(json);

    const db = await getDatabase();

    // Check if user already exists
    const existingUser = await db.collection("users").findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create tenant
    const tenantResult = await db.collection("tenants").insertOne({
      name: companyName,
      logo_url: null,
      created_at: new Date(),
      ai_config: {},
    });

    const tenantId = tenantResult.insertedId;

    // Create user
    const userResult = await db.collection("users").insertOne({
      tenant_id: tenantId,
      role: "owner",
      full_name: fullName,
      email: email.toLowerCase(),
      password: hashedPassword,
      created_at: new Date(),
    });

    const userId = userResult.insertedId.toString();

    // Generate JWT token
    const token = generateToken({
      userId,
      email: email.toLowerCase(),
      tenantId: tenantId.toString(),
    });

    // Create response with user data
    const response = NextResponse.json(
      {
        success: true,
        message: "Account created successfully",
        token,
        user: {
          id: userId,
          email: email.toLowerCase(),
          fullName,
          companyName,
          tenantId,
        },
      },
      { status: 201 }
    );

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
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Failed to create account" },
      { status: 500 }
    );
  }
}
