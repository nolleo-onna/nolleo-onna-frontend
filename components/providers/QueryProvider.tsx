"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { ME_QUERY_KEY } from "@/hooks/useMe";

interface QueryProviderProps {
  children: React.ReactNode;
}

export default function QueryProvider({ children }: QueryProviderProps) {
  const router = useRouter();

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
          },
        },
        queryCache: undefined,
      }),
  );

  // 전역 401 처리 (#6)
  queryClient.getQueryCache().config.onError = (error, query) => {
    if (
      error instanceof Error &&
      error.message === "UNAUTHORIZED" &&
      query.queryKey[0] === ME_QUERY_KEY[0]
    ) {
      queryClient.removeQueries({ queryKey: ME_QUERY_KEY });
      router.replace("/login");
    }
  };

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}