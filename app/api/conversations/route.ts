import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { getLeadsByTenant } from "@/lib/database.helpers";
import { COLLECTIONS } from "@/lib/database.types";

/**
 * GET /api/conversations
 * Fetches all conversations (leads with messages) for a tenant
 */
export async function GET(request: NextRequest) {
  try {
    const tenant_id = request.nextUrl.searchParams.get("tenant_id");

    if (!tenant_id) {
      return NextResponse.json(
        { error: "Tenant ID is required" },
        { status: 400 }
      );
    }

    const db = await getDatabase();

    // Get all leads for the tenant
    const leads = await getLeadsByTenant(db, tenant_id);

    if (!Array.isArray(leads)) {
      throw new Error("Failed to fetch leads");
    }

    // For each lead, get the last message and unread count
    const conversationsPromises = leads.map(async (lead) => {
      const messages = await db
        .collection(COLLECTIONS.MESSAGES)
        .find({ lead_id: lead._id })
        .sort({ created_at: -1 })
        .limit(1)
        .toArray();

      const unreadCount = await db
        .collection(COLLECTIONS.MESSAGES)
        .countDocuments({
          lead_id: lead._id,
          sender_type: "lead",
          read_at: null,
        });

      const lastMessage = messages[0] || null;

      // Use last message time for sorting, fallback to lead creation time
      const lastActivityAt = lastMessage?.created_at || lead.created_at;

      return {
        id: lead._id.toString(),
        leadId: lead._id.toString(),
        name: lead.name || "Unknown",
        email: lead.email || "",
        initials: getInitials(lead.name || "Unknown"),
        lastMessage: lastMessage?.content || "No messages yet",
        time: lastMessage
          ? formatTime(lastMessage.created_at)
          : formatTime(lead.created_at),
        unread: unreadCount > 0,
        unreadCount,
        status: lead.status,
        createdAt: lead.created_at,
        lastActivityAt, // Add this for sorting by most recent message
      };
    });

    const conversations = await Promise.all(conversationsPromises);

    // Sort by most recent message activity (last message time)
    // Conversations with messages appear first, sorted by most recent message
    // Conversations without messages appear last, sorted by lead creation time
    conversations.sort((a, b) => {
      const timeA = new Date(a.lastActivityAt).getTime();
      const timeB = new Date(b.lastActivityAt).getTime();
      return timeB - timeA; // Most recent first
    });

    return NextResponse.json({
      success: true,
      conversations,
    });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json(
      { error: "Failed to fetch conversations" },
      { status: 500 }
    );
  }
}

// Helper function to get initials from name
function getInitials(name: string): string {
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return parts[0].substring(0, 2).toUpperCase();
}

// Helper function to format time
function formatTime(date: Date): string {
  const now = new Date();
  const messageDate = new Date(date);
  const diffInMs = now.getTime() - messageDate.getTime();
  const diffInHours = diffInMs / (1000 * 60 * 60);
  const diffInDays = diffInHours / 24;

  if (diffInHours < 24) {
    // Today - show time
    return messageDate.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } else if (diffInDays < 2) {
    return "Yesterday";
  } else if (diffInDays < 7) {
    return `${Math.floor(diffInDays)} days ago`;
  } else {
    return messageDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  }
}
