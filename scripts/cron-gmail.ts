import cron from "node-cron";
import dotenv from "dotenv";
import path from "path";

// Load environment variables immediately
// This must happen BEFORE importing files that rely on process.env (like mongodb.ts)
const envPath = path.resolve(process.cwd(), ".env.local");
dotenv.config({ path: envPath });

console.log("Starting Gmail Cron Service...");
console.log("Schedule: Every 5 minutes");

// Dynamic import to ensure env vars are loaded first
const importSync = async () => {
  const { syncGmailLeads } = await import("@/lib/gmail-sync");

  // Schedule the task to run every 5 minutes
  cron.schedule("*/5 * * * *", async () => {
    console.log(`[${new Date().toISOString()}] Starting sync...`);
    try {
      await syncGmailLeads();
      console.log(`[${new Date().toISOString()}] Sync completed.`);
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Sync failed:`, error);
    }
  });
};

importSync().catch(console.error);
