import { getDatabase } from "./mongodb";
import { Tenant, COLLECTIONS } from "./database.types";
import { getGmailClient } from "./gmail";
import { simpleParser } from "mailparser";
import { Db } from "mongodb";
import { generateLeadSummary } from "./ai/lead-summary";
import { cleanEmailReply } from "./ai/clean-reply";
import { extractReplyText } from "./email-parser";

export async function syncGmailLeads() {
  const db = await getDatabase();
  const tenants = await db
    .collection<Tenant>(COLLECTIONS.TENANTS)
    .find({
      "email_sync.provider": "gmail",
      "email_sync.enabled": true,
      "email_sync.gmail_tokens": { $exists: true },
    })
    .toArray();

  console.log(`Found ${tenants.length} tenants expecting Gmail sync`);
  console.log("tenants", tenants);

  for (const tenant of tenants) {
    try {
      console.log("tenant", tenant.email_sync);
      if (!tenant.email_sync?.gmail_tokens) continue;
      await processTenantGmail(tenant, db);
    } catch (error) {
      console.error(`Error processing tenant ${tenant._id}:`, error);
    }
  }
}

async function processTenantGmail(tenant: Tenant, db: Db) {
  const tokens = tenant.email_sync!.gmail_tokens!;
  const client = getGmailClient(tokens);

  // Calculate query for new emails
  // We can use 'after: timestamps' in seconds
  const lastSync = tenant.email_sync!.last_sync;
  let query = "label:INBOX"; // Changed from category:primary to ensure we get all inbox emails
  if (lastSync) {
    const seconds = Math.floor(lastSync.getTime() / 1000);
    query += ` after:${seconds}`;
  }

  // List messages
  const res = await client.users.messages.list({
    userId: "me",
    q: query,
    maxResults: 10, // Process in batches of 10 to avoid timeouts
  });

  const messages = res.data.messages;
  if (!messages || messages.length === 0) {
    return;
  }

  console.log(`Processing ${messages.length} emails for tenant ${tenant._id}`);

  for (const msg of messages) {
    try {
      const fullMsg = await client.users.messages.get({
        userId: "me",
        id: msg.id!,
        format: "raw",
      });

      if (!fullMsg.data.raw) continue;

      const gmailMessageId = msg.id!;
      const gmailThreadId = fullMsg.data.threadId!;

      // Check if message already exists
      const existingMsg = await db
        .collection(COLLECTIONS.MESSAGES)
        .findOne({ gmail_message_id: gmailMessageId });

      if (existingMsg) continue;

      const decodedRaw = Buffer.from(fullMsg.data.raw, "base64url");
      const parsed = await simpleParser(decodedRaw);

      const from = parsed.from?.value[0];
      const email = from?.address;
      const name = from?.name;
      const body = parsed.text || parsed.html || "";

      // First extract reply text using pattern matching
      let cleanedBody = extractReplyText(body);

      // If extraction didn't remove much content, try AI cleaning as enhancement
      const extractionRatio = cleanedBody.length / body.length;
      const shouldUseAI = extractionRatio > 0.8 && cleanedBody.length >= 10;

      if (shouldUseAI) {
        try {
          const aiCleaned = await cleanEmailReply(body);
          // Use AI cleaned version if it's significantly shorter (meaning it removed content)
          if (aiCleaned.length < body.length * 0.9) {
            cleanedBody = aiCleaned;
          }
        } catch (error) {
          // If AI cleaning fails, use the pattern-extracted version
          console.error("AI clean failed, using pattern extraction:", error);
        }
      }

      // Threading headers
      const emailMessageId = parsed.messageId;
      const inReplyTo = parsed.inReplyTo;
      const references = Array.isArray(parsed.references)
        ? parsed.references.join(" ")
        : parsed.references;

      if (!email) continue;

      // 1. Find or create lead
      let lead = await db.collection(COLLECTIONS.LEADS).findOne({
        tenant_id: tenant._id,
        $or: [{ email: email }, { gmail_thread_id: gmailThreadId }],
      });

      if (!lead) {
        // Extract phone using regex
        const phoneMatch = body.match(
          /(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/
        );
        const phone = phoneMatch ? phoneMatch[0] : null;

        const summary = await generateLeadSummary(cleanedBody);

        const newLeadData: any = {
          tenant_id: tenant._id,
          status: "new",
          source: "gmail",
          created_at: new Date(),
          updated_at: new Date(),
          name: name || email.split("@")[0],
          email: email,
          phone: phone,
          summary: summary?.summary || "No summary generated",
          ai_analysis: summary?.ai_analysis,
          gmail_thread_id: gmailThreadId, // Store thread ID on lead for future matching
        };

        const result = await db
          .collection(COLLECTIONS.LEADS)
          .insertOne(newLeadData);
        lead = { ...newLeadData, _id: result.insertedId };
      } else {
        // Update lead's thread ID and updated_at if not set or if new message
        await db.collection(COLLECTIONS.LEADS).updateOne(
          { _id: lead._id },
          {
            $set: {
              updated_at: new Date(),
              gmail_thread_id: gmailThreadId,
            },
          }
        );
      }

      // 2. Create Message
      if (lead) {
        await db.collection(COLLECTIONS.MESSAGES).insertOne({
          lead_id: lead._id,
          sender_type: "lead",
          content: cleanedBody,
          created_at: parsed.date || new Date(),
          read_at: null,
          email_message_id: emailMessageId,
          email_in_reply_to: inReplyTo,
          email_references: references,
          gmail_thread_id: gmailThreadId,
          gmail_message_id: gmailMessageId,
        });
      }
    } catch (err) {
      console.error(`Error processing message ${msg.id}:`, err);
    }
  }

  // Update last_sync
  await db
    .collection(COLLECTIONS.TENANTS)
    .updateOne(
      { _id: tenant._id },
      { $set: { "email_sync.last_sync": new Date() } }
    );
}
