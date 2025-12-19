import { EmailSyncSettings } from "@/components/settings/EmailSyncSettings";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-slate-600 mt-1">
          Manage your account and integration settings
        </p>
      </div>

      <EmailSyncSettings />
    </div>
  );
}
