"use client";

import { useQuery } from "@tanstack/react-query";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { LeadsChart } from "@/components/dashboard/leads-chart";
import { StatusChart } from "@/components/dashboard/status-chart";
import { RecentLeads } from "@/components/dashboard/recent-leads";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";

interface DashboardData {
  stats: {
    totalLeads: {
      value: number;
      change: number;
      trend: "up" | "down";
    };
    activeConversations: {
      value: number;
      newToday: number;
    };
    closedDeals: {
      value: number;
      thisWeek: number;
    };
    avgResponseTime: {
      value: number;
      formatted: string;
    };
  };
  recentLeads: Array<{
    _id: string;
    name: string;
    email: string;
    status: string;
    created_at: Date;
    summary: string | null;
  }>;
  recentActivity: Array<{
    _id: string;
    sender_type: "user" | "lead" | "ai";
    content: string;
    created_at: Date;
    lead_name: string;
    lead_email: string | null;
  }>;
  charts: {
    leadsByStatus: Array<{
      status: string;
      count: number;
    }>;
    leadsOverTime: Array<{
      date: string;
      count: number;
    }>;
  };
}

async function fetchDashboardData(user: any): Promise<DashboardData> {
  const response = await fetch(
    `/api/dashboard/stats?tenantId=${user?.tenantId}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch dashboard data");
  }

  return response.json();
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboard-stats", user?.tenantId],
    queryFn: () => fetchDashboardData(user),
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="p-8">
          <CardContent className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">
              Loading dashboard data...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="p-8 border-destructive">
          <CardContent className="flex flex-col items-center gap-4">
            <AlertCircle className="h-8 w-8 text-destructive" />
            <div className="text-center">
              <p className="font-semibold text-destructive mb-2">
                Failed to load dashboard
              </p>
              <p className="text-sm text-muted-foreground">
                {error instanceof Error ? error.message : "Unknown error"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Welcome back! Here&apos;s what&apos;s happening with your leads.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <StatsCards stats={data.stats} />

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <LeadsChart data={data.charts.leadsOverTime} />
        <StatusChart data={data.charts.leadsByStatus} />
      </div>

      {/* Recent Activity Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <RecentLeads leads={data.recentLeads} />
        <RecentActivity activities={data.recentActivity} />
      </div>
    </div>
  );
}
