import { Filter, ObjectId } from "mongodb";
import { Db } from "mongodb";
import {
  Tenant,
  User,
  Lead,
  Message,
  TenantInput,
  UserInput,
  LeadInput,
  MessageInput,
  LeadUpdate,
  MessageUpdate,
  COLLECTIONS,
} from "./database.types";

/**
 * Helper functions for database operations
 * These provide type-safe wrappers around MongoDB operations
 */

// ============================================
// Tenant Helpers
// ============================================

export async function createTenant(
  db: Db,
  input: TenantInput
): Promise<Tenant> {
  const tenant: Omit<Tenant, "_id"> = {
    name: input.name,
    logo_url: input.logo_url ?? null,
    created_at: new Date(),
    ai_config: input.ai_config ?? {},
  };

  const result = await db
    .collection<Tenant>(COLLECTIONS.TENANTS)
    .insertOne(tenant as Tenant);
  return { ...tenant, _id: result.insertedId } as Tenant;
}

export async function getTenantById(
  db: Db,
  tenantId: ObjectId | string
): Promise<Tenant | null> {
  const id = typeof tenantId === "string" ? new ObjectId(tenantId) : tenantId;
  return db.collection<Tenant>(COLLECTIONS.TENANTS).findOne({ _id: id });
}

export async function updateTenant(
  db: Db,
  tenantId: ObjectId | string,
  updates: Partial<TenantInput>
): Promise<Tenant | null> {
  const id = typeof tenantId === "string" ? new ObjectId(tenantId) : tenantId;
  const result = await db
    .collection<Tenant>(COLLECTIONS.TENANTS)
    .findOneAndUpdate(
      { _id: id },
      { $set: updates },
      { returnDocument: "after" }
    );
  return result;
}

// ============================================
// User Helpers
// ============================================

export async function createUser(db: Db, input: UserInput): Promise<User> {
  const user: Omit<User, "_id"> = {
    tenant_id:
      typeof input.tenant_id === "string"
        ? new ObjectId(input.tenant_id)
        : input.tenant_id,
    role: input.role,
    full_name: input.full_name,
    email: input.email.toLowerCase(),
    password: input.password, // Should be hashed before calling this
    created_at: new Date(),
  };

  const result = await db
    .collection<User>(COLLECTIONS.USERS)
    .insertOne(user as User);
  return { ...user, _id: result.insertedId } as User;
}

export async function getUserById(
  db: Db,
  userId: ObjectId | string
): Promise<User | null> {
  const id = typeof userId === "string" ? new ObjectId(userId) : userId;
  return db.collection<User>(COLLECTIONS.USERS).findOne({ _id: id });
}

export async function getUserByEmail(
  db: Db,
  email: string
): Promise<User | null> {
  return db
    .collection<User>(COLLECTIONS.USERS)
    .findOne({ email: email.toLowerCase() });
}

export async function getUsersByTenant(
  db: Db,
  tenantId: ObjectId | string
): Promise<User[]> {
  const id = typeof tenantId === "string" ? new ObjectId(tenantId) : tenantId;
  return db
    .collection<User>(COLLECTIONS.USERS)
    .find({ tenant_id: id })
    .toArray();
}

// ============================================
// Lead Helpers
// ============================================

export async function createLead(db: Db, input: LeadInput): Promise<Lead> {
  const lead: Omit<Lead, "_id"> = {
    tenant_id:
      typeof input.tenant_id === "string"
        ? new ObjectId(input.tenant_id)
        : input.tenant_id,
    status: input.status ?? "new",
    source: input.source ?? "website",
    visitor_id: input.visitor_id ?? null,
    name: input.name ?? null,
    email: input.email ?? null,
    phone: input.phone ?? null,
    summary: input.summary ?? null,
    ai_analysis: input.ai_analysis ?? null,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const result = await db
    .collection<Lead>(COLLECTIONS.LEADS)
    .insertOne(lead as Lead);
  return { ...lead, _id: result.insertedId } as Lead;
}

export async function getLeadById(
  db: Db,
  leadId: ObjectId | string
): Promise<Lead | null> {
  const id = typeof leadId === "string" ? new ObjectId(leadId) : leadId;
  return db.collection<Lead>(COLLECTIONS.LEADS).findOne({ _id: id });
}

export async function getLeadsByTenant(
  db: Db,
  tenantId: ObjectId | string,
  options?: {
    status?: string;
    limit?: number;
    skip?: number;
  }
): Promise<Lead[] | Error> {
  const id = typeof tenantId === "string" ? new ObjectId(tenantId) : tenantId;
  const query: { tenant_id: ObjectId; status?: string } = { tenant_id: id };
  if (options?.status) {
    query.status = options.status;
  }

  let cursor = db
    .collection<Lead>(COLLECTIONS.LEADS)
    .find(query as unknown as Filter<Lead>)
    .sort({ created_at: -1 });

  if (options?.skip) {
    cursor = cursor.skip(options.skip);
  }
  if (options?.limit) {
    cursor = cursor.limit(options.limit);
  }
  console.log("cursor", cursor);
  return cursor.toArray();
}

export async function updateLead(
  db: Db,
  leadId: ObjectId | string,
  updates: LeadUpdate
): Promise<Lead | null> {
  const id = typeof leadId === "string" ? new ObjectId(leadId) : leadId;
  const updateData = {
    ...updates,
    updated_at: new Date(),
  };
  const result = await db
    .collection<Lead>(COLLECTIONS.LEADS)
    .findOneAndUpdate(
      { _id: id },
      { $set: updateData },
      { returnDocument: "after" }
    );
  return result;
}

export async function deleteLead(
  db: Db,
  leadId: ObjectId | string
): Promise<boolean> {
  const id = typeof leadId === "string" ? new ObjectId(leadId) : leadId;
  const result = await db
    .collection<Lead>(COLLECTIONS.LEADS)
    .deleteOne({ _id: id });
  return result.deletedCount === 1;
}

// ============================================
// Message Helpers
// ============================================

export async function createMessage(
  db: Db,
  input: MessageInput
): Promise<Message> {
  const message: Omit<Message, "_id"> = {
    lead_id:
      typeof input.lead_id === "string"
        ? new ObjectId(input.lead_id)
        : input.lead_id,
    sender_type: input.sender_type,
    sender_id: input.sender_id
      ? typeof input.sender_id === "string"
        ? new ObjectId(input.sender_id)
        : input.sender_id
      : null,
    content: input.content,
    created_at: new Date(),
    read_at: null,
    // Email threading metadata
    email_message_id: input.email_message_id || null,
    email_in_reply_to: input.email_in_reply_to || null,
    email_references: input.email_references || null,
    gmail_thread_id: input.gmail_thread_id || null,
    gmail_message_id: input.gmail_message_id || null,
  };

  const result = await db
    .collection<Message>(COLLECTIONS.MESSAGES)
    .insertOne(message as Message);
  return { ...message, _id: result.insertedId } as Message;
}

export async function getMessageById(
  db: Db,
  messageId: ObjectId | string
): Promise<Message | null> {
  const id =
    typeof messageId === "string" ? new ObjectId(messageId) : messageId;
  return db.collection<Message>(COLLECTIONS.MESSAGES).findOne({ _id: id });
}

export async function getMessagesByLead(
  db: Db,
  leadId: ObjectId | string,
  options?: {
    limit?: number;
    skip?: number;
  }
): Promise<Message[]> {
  const id = typeof leadId === "string" ? new ObjectId(leadId) : leadId;
  let cursor = db
    .collection<Message>(COLLECTIONS.MESSAGES)
    .find({ lead_id: id })
    .sort({ created_at: -1 });

  if (options?.skip) {
    cursor = cursor.skip(options.skip);
  }
  if (options?.limit) {
    cursor = cursor.limit(options.limit);
  }

  return cursor.toArray();
}

export async function updateMessage(
  db: Db,
  messageId: ObjectId | string,
  updates: MessageUpdate
): Promise<Message | null> {
  const id =
    typeof messageId === "string" ? new ObjectId(messageId) : messageId;
  const result = await db
    .collection<Message>(COLLECTIONS.MESSAGES)
    .findOneAndUpdate(
      { _id: id },
      { $set: updates },
      { returnDocument: "after" }
    );
  return result;
}

export async function markMessageAsRead(
  db: Db,
  messageId: ObjectId | string
): Promise<Message | null> {
  return updateMessage(db, messageId, { read_at: new Date() });
}

export async function getUnreadMessagesByLead(
  db: Db,
  leadId: ObjectId | string
): Promise<Message[]> {
  const id = typeof leadId === "string" ? new ObjectId(leadId) : leadId;
  return db
    .collection<Message>(COLLECTIONS.MESSAGES)
    .find({ lead_id: id, read_at: null })
    .sort({ created_at: -1 })
    .toArray();
}
