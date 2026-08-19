"use client";

import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useAuth } from "@/hooks/useAuth";
import { fetchFavorites, toggleFavorite } from "@/libs/api/favorites";

import type { FavoriteItem } from "@/types/favorite";

export const favoriteKeys = {
  all: ["favorites"] as const,
  list: () => [...favoriteKeys.all, "list"] as const,
};

// 찜 목록 전체를 한 번만 받아서 개별 장소의 찜 여부까지 이 목록으로 판단한다.
// (장소마다 /status를 따로 부르면 목록 화면에서 N번 요청이 나가서)
export function useFavoriteList() {
  const { isLoggedIn } = useAuth();

  const query = useQuery<FavoriteItem[]>({
    queryKey: favoriteKeys.list(),
    queryFn: fetchFavorites,
    enabled: isLoggedIn,
    staleTime: 1000 * 60,
  });

  const favoriteIds = useMemo(
    () => new Set((query.data ?? []).map((item) => item.mapPlaceId)),
    [query.data]
  );

  return { ...query, favoriteIds, isLoggedIn };
}

export function useFavoriteToggle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: toggleFavorite,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: favoriteKeys.all });
    },
  });
}
