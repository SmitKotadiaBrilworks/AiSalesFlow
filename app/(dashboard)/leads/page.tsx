"use client";

import { LeadsTable } from "@/components/tables/LeadsTable";
import { AddLeadDialog } from "@/components/leads/AddLeadDialog";
import { Button } from "@/components/ui/button";

import { useLeads } from "@/hooks/use-leads";
import { useAuth } from "@/providers/AuthProvider";

import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export default function LeadsPage() {
  const { user, isLoading } = useAuth();
  const { leads } = useLeads({ tenantId: user?.tenantId });
  const queryClient = useQueryClient();

  const { data: gmailStatus } = useQuery({
    queryKey: ["gmail-status"],
    queryFn: async () => {
      const res = await fetch("/api/integrations/gmail/status");
      if (!res.ok) {
        throw new Error("Failed to fetch Gmail status");
      }
      const data = await res.json();
      return data as { connected: boolean; email?: string };
    },
  });

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event.data?.type === "GMAIL_CONNECTED") {
        if (event.data.success) {
          queryClient.invalidateQueries({ queryKey: ["leads"] });
          queryClient.invalidateQueries({ queryKey: ["gmail-status"] });
          // Optionally trigger an immediate sync
          fetch("/api/cron/gmail-sync");
        } else {
          console.error("Gmail connection failed:", event.data.error);
          alert("Failed to connect Gmail: " + event.data.error);
        }
      }
    };

    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [queryClient]);

  const handleConnectGmail = () => {
    const width = 500;
    const height = 600;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    window.open(
      "/api/integrations/gmail/auth",
      "GmailConnect",
      `width=${width},height=${height},left=${left},top=${top}`
    );
  };

  const handleDisconnect = async () => {
    if (!confirm("Are you sure you want to disconnect Gmail?")) return;
    try {
      const res = await fetch("/api/integrations/gmail/disconnect", {
        method: "POST",
      });
      if (res.ok) {
        queryClient.setQueryData(["gmail-status"], { connected: false });
      } else {
        alert("Failed to disconnect Gmail");
      }
    } catch (err) {
      console.error("Failed to disconnect", err);
      alert("Failed to disconnect");
    }
  };

  if (isLoading || leads.isLoading) {
    return <div>Loading...</div>;
  }
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Leads</h1>
          <p className="text-slate-600 mt-1">
            Manage and track all your leads in one place
          </p>
        </div>
        <div className="flex gap-2 items-center">
          {gmailStatus?.connected ? (
            <div className="flex items-center gap-3 bg-green-50 border border-green-200 px-3 py-1.5 rounded-md">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm font-medium text-green-700">
                  {gmailStatus.email}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDisconnect}
                className="h-7 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                Remove
              </Button>
            </div>
          ) : (
            <Button variant="outline" onClick={handleConnectGmail}>
              Connect Gmail
            </Button>
          )}
          <AddLeadDialog />
        </div>
      </div>

      <LeadsTable data={leads.data?.leads || []} />
    </div>
  );
}
