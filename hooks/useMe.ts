"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchMe } from "@/libs/api/auth";
import type { User } from "@/types/auth";

export const ME_QUERY_KEY = ["me"] as const;

export function useMe() {
  return useQuery<User | null>({
    queryKey: ME_QUERY_KEY,
    queryFn: async () => {
      try {
        return await fetchMe();
      } catch {
        return null;
      }
    },
    retry: false,
    staleTime: 1000 * 60 * 5,
  });
}