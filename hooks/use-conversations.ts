import { useQuery } from "@tanstack/react-query";
import { useUser } from "./use-user";

export interface Conversation {
  id: string;
  leadId: string;
  name: string;
  email: string;
  initials: string;
  lastMessage: string;
  time: string;
  unread: boolean;
  unreadCount: number;
  status: string;
  createdAt: Date;
}

/**
 * Custom hook to fetch conversations for the current user's tenant
 */
export function useConversations() {
  const { user } = useUser();

  return useQuery({
    queryKey: ["conversations", user?.tenantId],
    queryFn: async () => {
      if (!user?.tenantId) {
        throw new Error("User tenant ID not available");
      }

      const response = await fetch(
        `/api/conversations?tenant_id=${user.tenantId}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch conversations");
      }

      const data = await response.json();
      return data.conversations as Conversation[];
    },
    enabled: !!user?.tenantId,
    refetchInterval: 10000, // Refetch every 10 seconds for real-time updates
  });
}
