import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  companyName: string;
  tenantId: string;
  role: string;
  profile_pic?: string | null;
}

async function fetchUser(): Promise<UserProfile> {
  const res = await fetch("/api/auth/me");
  if (!res.ok) {
    if (res.status === 401) {
      throw new Error("Unauthorized");
    }
    throw new Error("Failed to fetch user");
  }
  const data = await res.json();
  return data.user;
}

async function updateUser(updates: {
  full_name?: string;
  email?: string;
  profile_pic?: string | null;
  password?: string;
}) {
  const res = await fetch("/api/auth/me", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  if (!res.ok) {
    const errorBody = await res.json();
    throw new Error(errorBody.error || "Failed to update user");
  }
  return res.json();
}

async function deleteUser() {
  const res = await fetch("/api/auth/me", {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete user");
  return res.json();
}

export function useUser() {
  const queryClient = useQueryClient();
  const router = useRouter();

  const {
    data: user,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["user"],
    queryFn: fetchUser,
    retry: 3, // Don't retry if 401
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const updateMutation = useMutation({
    mutationFn: updateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.setQueryData(["user"], null);
      router.push("/login"); // Redirect to login after delete
    },
  });

  return {
    user,
    isLoading,
    isError: !!error,
    error,
    refetch,
    updateUser: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
    deleteUser: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
  };
}
