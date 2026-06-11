"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { ME_QUERY_KEY, useMe } from "@/hooks/useMe";
import { logout } from "@/lib/api/auth";

export function useAuth() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { data: user, isLoading, isFetching } = useMe();

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.setQueryData(ME_QUERY_KEY, null);
      router.replace("/login");
    },
  });

  return {
    user,
    isLoading,
    isFetching,
    isLoggedIn: !!user,
    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,
  };
}