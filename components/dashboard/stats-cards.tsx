"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  MessageSquare,
  CheckCircle,
  Clock,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

interface StatsCardsProps {
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
}

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="hover:shadow-lg transition-shadow gap-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="mt-0">
          <div className="text-2xl font-bold">{stats.totalLeads.value}</div>
          <div className="flex items-center text-xs text-muted-foreground mt-1">
            {stats.totalLeads.trend === "up" ? (
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
            ) : (
              <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
            )}
            <span
              className={
                stats.totalLeads.trend === "up"
                  ? "text-green-500"
                  : "text-red-500"
              }
            >
              {stats.totalLeads.change > 0 ? "+" : ""}
              {stats.totalLeads.change}%
            </span>
            <span className="ml-1">from last month</span>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow gap-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Active Conversations
          </CardTitle>
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.activeConversations.value}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            +{stats.activeConversations.newToday} new today
          </p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow gap-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Closed Deals</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.closedDeals.value}</div>
          <p className="text-xs text-muted-foreground mt-1">
            +{stats.closedDeals.thisWeek} this week
          </p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow gap-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Avg. Response Time
          </CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.avgResponseTime.formatted}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            AI-powered responses
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
