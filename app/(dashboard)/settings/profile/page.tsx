"use client";

import { ProfileSettings } from "@/components/settings/ProfileSettings";

export default function ProfilePage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Profile Settings
        </h1>
        <p className="text-slate-500 mt-2">
          Manage your account information and preferences.
        </p>
      </div>

      <ProfileSettings />
    </div>
  );
}
