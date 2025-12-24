"use client";

import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  ColumnDef,
  SortingState,
  ColumnFiltersState,
} from "@tanstack/react-table";
import { useCallback, useMemo, useState } from "react";
import DataTable from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  ArrowUpDown,
  Search,
  Sparkles,
  Calendar,
  DollarSign,
  Briefcase,
  Bot,
} from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Lead as DatabaseLead } from "@/lib/database.types";
import columns, { Lead } from "./LeadsColumns";

interface LeadSummary {
  budget: string;
  timeline: string;
  serviceType: string;
  summary: string;
}

// Transform database leads to table format
function transformLeads(leads: DatabaseLead[]): Lead[] {
  return leads.map((lead) => ({
    id: lead._id.toString(),
    name: lead.name ?? null,
    email: lead.email ?? null,
    status: lead.status,
    source: lead.source,
    createdAt: lead.created_at,
    summary: lead.summary ?? null,
  }));
}

export function LeadsTable({ data }: Readonly<{ data: DatabaseLead[] }>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  // AI Summary State
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [summaryData, setSummaryData] = useState<LeadSummary | null>(null);

  const transformedData = useMemo(() => transformLeads(data), [data]);

  const handleSheetSidebar = useCallback(
    (lead: Lead) => {
      setSelectedLead(lead);
      setIsSheetOpen(true);
      const summaryObject = data.find(
        (item) => item._id.toString() === lead.id
      );
      if (!summaryObject) return;
      setSummaryData({
        budget: summaryObject.ai_analysis?.budget ?? "Not specified",
        timeline: summaryObject.ai_analysis?.timeline ?? "Not specified",
        serviceType: summaryObject.ai_analysis?.service_type ?? "Not specified",
        summary: summaryObject.summary ?? "Not specified",
      });
    },
    [data]
  );

  const table = useReactTable({
    data: transformedData,
    columns: columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search leads..."
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <DataTable<Lead, unknown>
        columns={columns}
        table={table}
        onRowClick={(data: Lead) => handleSheetSidebar(data)}
        showPagination={true}
      />

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-md w-full overflow-y-auto p-4">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2 text-xl">
              <Bot className="h-6 w-6 text-purple-600" />
              AI Lead Insights
            </SheetTitle>
            <SheetDescription>
              Analysis for {selectedLead?.name}
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-6">
            {summaryData ? (
              <>
                <div className="bg-purple-50 border border-purple-100 p-4 rounded-lg">
                  <h3 className="text-sm font-semibold text-purple-900 flex items-center mb-2">
                    <Sparkles className="h-4 w-4 mr-2" />
                    AI Summary
                  </h3>
                  <p className="text-sm text-purple-800 leading-relaxed">
                    {summaryData.summary}
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div className="p-4 border rounded-lg bg-white shadow-sm">
                    <div className="flex items-center gap-2 text-slate-500 mb-1">
                      <DollarSign className="h-4 w-4" />
                      <span className="text-xs font-medium uppercase tracking-wider">
                        Budget
                      </span>
                    </div>
                    <div className="font-semibold text-slate-900 pl-6">
                      {summaryData.budget}
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg bg-white shadow-sm">
                    <div className="flex items-center gap-2 text-slate-500 mb-1">
                      <Calendar className="h-4 w-4" />
                      <span className="text-xs font-medium uppercase tracking-wider">
                        Timeline
                      </span>
                    </div>
                    <div className="font-semibold text-slate-900 pl-6">
                      {summaryData.timeline}
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg bg-white shadow-sm">
                    <div className="flex items-center gap-2 text-slate-500 mb-1">
                      <Briefcase className="h-4 w-4" />
                      <span className="text-xs font-medium uppercase tracking-wider">
                        Service Type
                      </span>
                    </div>
                    <div className="font-semibold text-slate-900 pl-6">
                      {summaryData.serviceType}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center text-slate-500 py-8">
                Unable to load insights.
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
