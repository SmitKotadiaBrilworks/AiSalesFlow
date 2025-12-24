"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatusChartProps {
  data: Array<{
    status: string;
    count: number;
  }>;
}

const statusColors: Record<
  string,
  { bg: string; border: string; text: string }
> = {
  new: { bg: "bg-blue-500", border: "border-blue-500", text: "text-blue-700" },
  open: {
    bg: "bg-yellow-500",
    border: "border-yellow-500",
    text: "text-yellow-700",
  },
  in_progress: {
    bg: "bg-purple-500",
    border: "border-purple-500",
    text: "text-purple-700",
  },
  closed: {
    bg: "bg-green-500",
    border: "border-green-500",
    text: "text-green-700",
  },
  archived: {
    bg: "bg-gray-500",
    border: "border-gray-500",
    text: "text-gray-700",
  },
};

const statusLabels: Record<string, string> = {
  new: "New",
  open: "Open",
  in_progress: "In Progress",
  closed: "Closed",
  archived: "Archived",
};

export function StatusChart({ data }: StatusChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card className="col-span-3">
        <CardHeader>
          <CardTitle>Leads by Status</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No data available</p>
        </CardContent>
      </Card>
    );
  }

  const total = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <Card className="col-span-4 md:col-span-3 hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle>Leads by Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((item, index) => {
            const percentage = total > 0 ? (item.count / total) * 100 : 0;
            const colors = statusColors[item.status] || statusColors.new;
            const label = statusLabels[item.status] || item.status;

            return (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{label}</span>
                  <span className="text-muted-foreground">
                    {item.count} ({Math.round(percentage)}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`${colors.bg} h-2.5 rounded-full transition-all duration-500 ease-out`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="mt-6 pt-4 border-t">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Total Leads</span>
            <span className="text-2xl font-bold">{total}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
