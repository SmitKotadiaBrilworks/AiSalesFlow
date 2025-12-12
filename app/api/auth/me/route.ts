import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDatabase } from "@/lib/mongodb";
import { verifyToken, getTokenFromRequest } from "@/lib/auth";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const db = await getDatabase();

    // Find user
    const user = await db.collection("users").findOne({
      _id: new ObjectId(payload.userId),
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    console.log("user", user);
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

    return NextResponse.json({
      user: {
        id: user._id.toString(),
        email: user.email,
        fullName: user.full_name,
        companyName: tenant?.name || "",
        tenantId: user.tenant_id?.toString(),
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json({ error: "Failed to get user" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request);
    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload = verifyToken(token);
    if (!payload)
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const body = await request.json();
    const { full_name, email } = body; // Allow updating name and email

    if (!full_name && !email) {
      return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
    }

    const db = await getDatabase();
    const updates: Record<string, string | Date> = {};
    if (full_name) updates.full_name = full_name;
    if (email) updates.email = email;

    await db.collection("users").updateOne(
      { _id: new ObjectId(payload.userId) },
      {
        $set: {
          ...updates,
          updated_at: new Date(),
        },
      }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update user error:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request);
    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload = verifyToken(token);
    if (!payload)
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const db = await getDatabase();

    await db.collection("users").deleteOne({
      _id: new ObjectId(payload.userId),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete user error:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
