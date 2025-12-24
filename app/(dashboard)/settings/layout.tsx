"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { User, Settings as SettingsIcon } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

export default function SettingsPage({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  console.log(pathname);

  const tabs = [
    {
      id: "general",
      label: "General Settings",
      icon: SettingsIcon,
      href: "/settings/general",
    },
    {
      id: "profile",
      label: "Profile Settings",
      icon: User,
      href: "/settings/profile",
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Settings
        </h1>
        <p className="text-slate-500">
          Manage your account preferences and system integrations.
        </p>
      </div>

      <div className="flex flex-col space-y-8">
        {/* Tab Navigation */}
        <div className="flex items-center p-1 bg-slate-100/80 rounded-xl w-fit border border-slate-200 shadow-sm">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = pathname === tab.href;
            return (
              <button
                key={tab.id}
                onClick={() => router.push(tab.href)}
                className={cn(
                  "flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 relative",
                  isActive
                    ? "bg-white text-purple-600 shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                )}
              >
                <Icon
                  className={cn(
                    "h-4 w-4",
                    isActive ? "text-purple-600" : "text-slate-500"
                  )}
                />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="mt-2 min-h-[400px]">{children}</div>
      </div>
    </div>
  );
}
