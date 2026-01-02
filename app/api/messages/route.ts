import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import {
  getMessagesByLead,
  createMessage,
  getLeadById,
} from "@/lib/database.helpers";
import { ObjectId } from "mongodb";
import { COLLECTIONS } from "@/lib/database.types";

/**
 * GET /api/messages
 * Fetches all messages for a specific lead
 */
export async function GET(request: NextRequest) {
  try {
    const lead_id = request.nextUrl.searchParams.get("lead_id");

    if (!lead_id) {
      return NextResponse.json(
        { error: "Lead ID is required" },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const messages = await getMessagesByLead(db, lead_id);

    // Format messages for the frontend
    const formattedMessages = messages
      .reverse() // Show oldest first
      .map((msg) => ({
        id: msg._id.toString(),
        sender: msg.sender_type,
        senderId: msg.sender_id?.toString() || null,
        content: msg.content,
        time: formatMessageTime(msg.created_at),
        createdAt: msg.created_at,
        readAt: msg.read_at,
      }));

    return NextResponse.json({
      success: true,
      messages: formattedMessages,
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/messages
 * Creates a new message (user reply) and sends email to the lead
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { lead_id, content, sender_type, sender_id } = body;

    if (!lead_id || !content || !sender_type) {
      return NextResponse.json(
        { error: "Lead ID, content, and sender type are required" },
        { status: 400 }
      );
    }

    const db = await getDatabase();

    // Verify the lead exists and get lead details
    const lead = await getLeadById(db, lead_id);
    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    // Create the message in database
    const message = await createMessage(db, {
      lead_id,
      sender_type,
      sender_id: sender_id || null,
      content,
    });

    // If it's a user message, mark all lead messages as read
    if (sender_type === "user") {
      try {
        // Mark all unread lead messages as read
        await db.collection(COLLECTIONS.MESSAGES).updateMany(
          {
            lead_id:
              typeof lead_id === "string" ? new ObjectId(lead_id) : lead_id,
            sender_type: "lead",
            read_at: null,
          },
          {
            $set: {
              read_at: new Date(),
            },
          }
        );
      } catch (error) {
        console.error("Error marking messages as read:", error);
        // Don't fail the request if this fails
      }
    }

    // If it's a user message, send email to the lead
    if (sender_type === "user" && lead.email) {
      try {
        const { sendInboxReply } = await import("@/lib/email");
        const { getUserById } = await import("@/lib/database.helpers");

        // Get sender details if sender_id is provided
        let senderName = "AI SalesFlow Team";
        if (sender_id) {
          const sender = await getUserById(db, sender_id);
          if (sender) {
            senderName = sender.full_name;
          }
        }

        // Send email asynchronously (don't wait for it to complete)
        sendInboxReply(
          lead.email,
          lead.name || null,
          content,
          senderName,
          lead.tenant_id.toString(),
          lead._id.toString()
        )
          .then(async (result) => {
            if (result.success && result.emailMetadata) {
              // Update the message with threading metadata
              const { updateMessage } = await import("@/lib/database.helpers");
              await updateMessage(db, message._id, result.emailMetadata);
            }
          })
          .catch((error) => {
            console.error("Failed to send email notification:", error);
          });
      } catch (error) {
        console.error("Error setting up email notification:", error);
        // Don't fail the request if email fails
      }
    }

    return NextResponse.json({
      success: true,
      message: {
        id: message._id.toString(),
        sender: message.sender_type,
        senderId: message.sender_id?.toString() || null,
        content: message.content,
        time: formatMessageTime(message.created_at),
        createdAt: message.created_at,
        readAt: message.read_at,
      },
    });
  } catch (error) {
    console.error("Error creating message:", error);
    return NextResponse.json(
      { error: "Failed to create message" },
      { status: 500 }
    );
  }
}

// Helper function to format message time
function formatMessageTime(date: Date): string {
  const messageDate = new Date(date);
  return messageDate.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}
