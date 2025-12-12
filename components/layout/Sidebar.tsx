"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Inbox, Users, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

import { AppLogo, AppName } from "../ui/appLogo";
import { useAuth } from "@/providers/AuthProvider";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/inbox", label: "Inbox", icon: Inbox },
  { href: "/leads", label: "Leads", icon: Users },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();

  const { logout } = useAuth();

  const handleSignOut = () => {
    logout();
  };

  return (
    <div
      className={cn(
        "flex h-full flex-col bg-white text-white w-56 md:w-64 shadow-lg",
        className
      )}
    >
      <div className="p-6">
        <div className="flex items-center justify-start gap-2">
          <AppLogo height={70} width={70} logoClassName="h-10 md:h-12" />
          <AppName className="text-lg md:text-2xl" />
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-2 md:space-y-3 md:mt-5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href || pathname?.startsWith(item.href + "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm md:text-lg font-medium cursor-pointer",
                isActive
                  ? "bg-indigo-600 text-white"
                  : "text-gray-500 hover:text-white hover:bg-slate-400"
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4">
        <Button
          variant="ghost"
          onClick={handleSignOut}
          className="text-sm md:text-base w-full justify-start text-white hover:text-white bg-red-700 hover:bg-red-600 gap-3 cursor-pointer py-[22px]"
        >
          <LogOut className="!h-5 !w-5" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}
