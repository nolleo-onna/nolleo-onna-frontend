"use client";

import { useQuery } from "@tanstack/react-query";

import { useMe } from "@/hooks/useMe";
import { fetchFavoriteStats } from "@/libs/api/users";
import { favoriteKeys } from "@/features/spot/hooks/useFavorites";

// 찜 토글(useToggleFavorite)이 favoriteKeys.all을 무효화하므로 같은 접두사를 써서
// 찜을 누르면 통계도 함께 갱신되게 한다.
export const favoriteStatsKey = [...favoriteKeys.all, "stats"] as const;

// 로그인 필요 API — 비로그인에서 호출하면 401 리다이렉트가 나므로 user가 있을 때만
export function useFavoriteStats() {
  const { data: user } = useMe();
  return useQuery({
    queryKey: favoriteStatsKey,
    queryFn: fetchFavoriteStats,
    enabled: !!user,
    staleTime: 1000 * 60,
  });
}
