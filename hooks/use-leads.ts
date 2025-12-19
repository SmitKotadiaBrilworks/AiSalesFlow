import { useQuery } from "@tanstack/react-query";

async function getAllLeads(tenantId?: string) {
  const res = await fetch(`/api/leads?tenant_id=${tenantId}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error("Failed to update user");
  return res.json();
}

export const useLeads = ({ tenantId }: { tenantId?: string }) => {
  const leads = useQuery({
    queryKey: ["leads", tenantId],
    queryFn: () => getAllLeads(tenantId),
    retry: 3,
    refetchInterval: 1000 * 30, // Refetch every 30 seconds for real-time updates
    refetchOnWindowFocus: true, // Refetch when user returns to tab
    refetchOnMount: true, // Refetch when component mounts
    enabled: !!tenantId,
  });

  return { leads };
};
