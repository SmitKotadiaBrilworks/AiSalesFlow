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
    queryKey: ["leads"],
    queryFn: () => getAllLeads(tenantId),
    // Add retry logic
    retry: 3,
    refetchInterval: 1000 * 60,
    enabled: !!tenantId,
  });

  return { leads };
};
