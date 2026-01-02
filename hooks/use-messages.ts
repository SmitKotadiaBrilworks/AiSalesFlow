import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { SenderType } from "@/lib/database.types";

export interface Message {
  id: string;
  sender: SenderType;
  senderId: string | null;
  content: string;
  time: string;
  createdAt: Date;
  readAt: Date | null;
}

/**
 * Custom hook to fetch messages for a specific lead
 */
export function useMessages(leadId: string | null) {
  return useQuery({
    queryKey: ["messages", leadId],
    queryFn: async () => {
      if (!leadId) {
        return [];
      }

      const response = await fetch(`/api/messages?lead_id=${leadId}`);

      if (!response.ok) {
        throw new Error("Failed to fetch messages");
      }

      const data = await response.json();
      return data.messages as Message[];
    },
    enabled: !!leadId,
    refetchInterval: 5000, // Refetch every 5 seconds for real-time updates
  });
}

/**
 * Custom hook to send a message
 */
export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      leadId,
      content,
      senderType,
      senderId,
    }: {
      leadId: string;
      content: string;
      senderType: SenderType;
      senderId?: string;
    }) => {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lead_id: leadId,
          content,
          sender_type: senderType,
          sender_id: senderId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      // Invalidate messages query to refetch
      queryClient.invalidateQueries({
        queryKey: ["messages", variables.leadId],
      });
      // Also invalidate conversations to update the last message
      queryClient.invalidateQueries({
        queryKey: ["conversations"],
      });
    },
  });
}
