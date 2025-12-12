"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { useUser, UserProfile } from "@/hooks/use-user";
import { removeAuthToken } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

interface AuthContextType {
  user: UserProfile | undefined;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
  updateUser: (updates: { full_name?: string; email?: string }) => void;
  isUpdating: boolean;
  deleteUser: () => void;
  isDeleting: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const userState = useUser();
  const router = useRouter();
  const queryClient = useQueryClient();

  // Correction on route: Sidebar has /login.
  // Let's use /login for now, if it fails I'll check file structure.
  // Checking file structure: app/(public)/login exists. So /login is correct.

  const value = {
    ...userState,
    logout: () => {
      removeAuthToken();
      queryClient.setQueryData(["user"], null);
      queryClient.invalidateQueries();
      router.push("/login");
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within a AuthProvider");
  }
  return context;
}
