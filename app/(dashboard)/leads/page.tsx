"use client";

import { LeadsTable } from "@/components/tables/LeadsTable";
import { AddLeadDialog } from "@/components/leads/AddLeadDialog";

import { useLeads } from "@/hooks/use-leads";
import { useAuth } from "@/providers/AuthProvider";

export default function LeadsPage() {
  const { user, isLoading } = useAuth();
  const { leads } = useLeads({ tenantId: user?.tenantId });

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
        <AddLeadDialog />
      </div>

      <LeadsTable data={leads.data?.leads || []} />
    </div>
  );
}
