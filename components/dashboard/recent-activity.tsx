"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { User, Bot, MessageCircle } from "lucide-react";

interface Activity {
  _id: string;
  sender_type: "user" | "lead" | "ai";
  content: string;
  created_at: Date;
  lead_name: string;
  lead_email: string | null;
}

interface RecentActivityProps {
  activities: Activity[];
}

const senderConfig = {
  user: {
    icon: User,
    color: "bg-blue-500",
    label: "Team",
  },
  ai: {
    icon: Bot,
    color: "bg-purple-500",
    label: "AI",
  },
  lead: {
    icon: MessageCircle,
    color: "bg-green-500",
    label: "Lead",
  },
};

export function RecentActivity({ activities }: RecentActivityProps) {
  if (!activities || activities.length === 0) {
    return (
      <Card className="col-span-3">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No recent activity</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-4 md:col-span-3 hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => {
            const config = senderConfig[activity.sender_type];
            const Icon = config.icon;

            return (
              <div
                key={activity._id}
                className="flex gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="relative flex-shrink-0">
                  <Avatar className={`h-9 w-9 ${config.color}`}>
                    <AvatarFallback className={`${config.color} text-white`}>
                      <Icon className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="flex-1 space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className="text-xs">
                      {config.label}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(activity.created_at), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                  <p className="text-sm font-medium">
                    {activity.sender_type === "lead"
                      ? `Message from ${activity.lead_name}`
                      : activity.sender_type === "ai"
                      ? `AI responded to ${activity.lead_name}`
                      : `Team replied to ${activity.lead_name}`}
                  </p>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {activity.content}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
