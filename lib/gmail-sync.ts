import { getDatabase } from "./mongodb";
import { Tenant, Lead, COLLECTIONS } from "./database.types";
import { getGmailClient } from "./gmail";
import { simpleParser } from "mailparser";
import { Db } from "mongodb";
import { generateLeadSummary } from "./ai/lead-summary";
// import { ObjectId } from "mongodb"; // Unused

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

  const leadsCollection = db.collection(COLLECTIONS.LEADS);

  for (const msg of messages) {
    try {
      const fullMsg = await client.users.messages.get({
        userId: "me",
        id: msg.id!,
        format: "raw",
      });

      if (!fullMsg.data.raw) continue;

      const decodedRaw = Buffer.from(fullMsg.data.raw, "base64url");
      const parsed = await simpleParser(decodedRaw);

      const from = parsed.from?.value[0];
      const email = from?.address;
      const name = from?.name;
      const subject = parsed.subject;
      const body = parsed.text || parsed.html || ""; // extract text content

      if (!email) continue;

      // Extract phone using regex
      const phoneMatch = body.match(
        /(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/
      );
      const phone = phoneMatch ? phoneMatch[0] : null;

      const summary = await generateLeadSummary(body);
      console.log("summary", summary);

      if (!summary) continue;

      console.log("Actual summary", summary);

      // Create Lead
      const newLead: Omit<Lead, "_id"> = {
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
      };

      // Upsert based on email + tenant (simple de-duplication)
      await leadsCollection.updateOne(
        { tenant_id: tenant._id, email: email },
        {
          $setOnInsert: newLead, // Only insert if not exists to avoid overwriting existing lead status
          // Or maybe we WANT to update? For now, let's just create new ones.
          // If it exists, we might want to Add a message instead?
          // User request: "read new email leads if available & create it in DB"
        },
        { upsert: true }
      );
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
