import { ObjectId } from "mongodb";

// ============================================
// Base Types
// ============================================

export type UserRole = "owner" | "manager" | "sdr" | "super_admin";
export type LeadStatus = "new" | "open" | "in_progress" | "closed" | "archived";
export type SenderType = "user" | "lead" | "ai";

// ============================================
// Tenant Types
// ============================================

export interface Tenant {
  _id: ObjectId;
  name: string;
  logo_url: string | null;
  created_at: Date;
  ai_config: {
    tone?: string;
    services?: string[];
    faqs?: Array<{
      question: string;
      answer: string;
    }>;
    [key: string]: unknown;
  };
  email_sync?: {
    enabled: boolean;
    inbox_email?: string; // Email address to monitor
    webhook_secret?: string; // Secret for webhook authentication
    provider?: "sendgrid" | "mailgun" | "gmail" | "custom"; // Email service provider
    last_sync?: Date;
    gmail_tokens?: {
      access_token?: string;
      refresh_token?: string;
      expiry_date?: number;
    };
  };
}

export interface TenantInput {
  name: string;
  logo_url?: string | null;
  ai_config?: Tenant["ai_config"];
}

// ============================================
// User Types
// ============================================

export interface User {
  _id: ObjectId;
  tenant_id: ObjectId;
  role: UserRole;
  full_name: string;
  email: string;
  password: string; // Hashed password
  created_at: Date;
  profile_pic?: string | null;
}

export interface UserInput {
  tenant_id: ObjectId | string;
  role: UserRole;
  full_name: string;
  email: string;
  password: string; // Plain password (will be hashed)
  profile_pic?: string | null;
}

export interface UserPublic {
  id: string;
  tenant_id: string;
  role: UserRole;
  full_name: string;
  email: string;
  created_at: Date;
  profile_pic?: string | null;
}

// ============================================
// Lead Types
// ============================================

export interface AIAnalysis {
  budget?: string;
  timeline?: string;
  service_type?: string;
  priority?: string;
  [key: string]: unknown;
}

export interface Lead {
  _id: ObjectId;
  tenant_id: ObjectId;
  status: LeadStatus;
  source: string;
  created_at: Date;
  updated_at: Date;
  visitor_id?: string | null;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  summary?: string | null; // AI generated summary
  ai_analysis?: AIAnalysis | null;
}

export interface LeadInput {
  tenant_id: ObjectId | string;
  status?: LeadStatus;
  source?: string;
  visitor_id?: string | null;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  summary?: string | null;
  ai_analysis?: AIAnalysis | null;
}

export interface LeadUpdate {
  status?: LeadStatus;
  source?: string;
  visitor_id?: string | null;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  summary?: string | null;
  ai_analysis?: AIAnalysis | null;
  updated_at?: Date;
}

// ============================================
// Message Types
// ============================================

export interface Message {
  _id: ObjectId;
  lead_id: ObjectId;
  sender_type: SenderType;
  sender_id?: ObjectId | null; // Null if AI or Lead (unless we track lead users)
  content: string;
  created_at: Date;
  read_at?: Date | null;
}

export interface MessageInput {
  lead_id: ObjectId | string;
  sender_type: SenderType;
  sender_id?: ObjectId | string | null;
  content: string;
}

export interface MessageUpdate {
  content?: string;
  read_at?: Date | null;
}

// ============================================
// Collection Names
// ============================================

export const COLLECTIONS = {
  TENANTS: "tenants",
  USERS: "users",
  LEADS: "leads",
  MESSAGES: "messages",
} as const;

// ============================================
// Helper Types
// ============================================

export type WithId<T> = T & { _id: ObjectId };
export type WithoutId<T> = Omit<T, "_id">;
export type WithStringId<T> = Omit<T, "_id"> & { id: string };
