"use client";

import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useMe } from "@/hooks/useMe";
import {
  fetchFavorites,
  fetchFavoriteStatus,
  toggleFavorite,
} from "@/libs/api/favorites";

import type { FavoritePlace } from "@/types/favorite";

export const favoriteKeys = {
  all: ["favorites"] as const,
  list: () => [...favoriteKeys.all, "list"] as const,
  status: (mapPlaceId: number) => [...favoriteKeys.all, "status", mapPlaceId] as const,
};

// 비로그인 상태에서 찜 API를 호출하면 clientFetch가 401을 받아 로그인 페이지로
// 리다이렉트해 버린다. 페이지를 구경만 하는 사용자를 쫓아내지 않도록
// 조회 쿼리는 반드시 로그인 상태(useMe)일 때만 실행한다.
export function useFavoritesList() {
  const { data: user } = useMe();

  return useQuery({
    queryKey: favoriteKeys.list(),
    queryFn: fetchFavorites,
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
  });
}

// 목록을 한 번만 받아 Set으로 판별한다(장소마다 status를 호출하지 않기 위함).
export function useFavoriteIds(): Set<number> {
  const { data } = useFavoritesList();

  return useMemo(
    () => new Set((data ?? []).map((item) => item.mapPlaceId)),
    [data],
  );
}

// 단일 장소의 찜 여부(상세 모달용)
export function useFavoriteStatus(mapPlaceId: number | null) {
  const { data: user } = useMe();
  const enabled = !!user && mapPlaceId !== null && mapPlaceId > 0;

  return useQuery({
    queryKey: favoriteKeys.status(mapPlaceId ?? 0),
    queryFn: () => fetchFavoriteStatus(mapPlaceId as number),
    enabled,
    staleTime: 1000 * 60,
  });
}

export interface ToggleFavoriteInput {
  mapPlaceId: number;
  // 찜 추가를 낙관적으로 목록 캐시에 반영할 때 쓸 최소 정보(있는 만큼만)
  place?: Partial<Omit<FavoritePlace, "mapPlaceId">>;
}

// 찜 토글 — 낙관적 업데이트 + 실패 시 롤백
export function useToggleFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ mapPlaceId }: ToggleFavoriteInput) => toggleFavorite(mapPlaceId),
    onMutate: async ({ mapPlaceId, place }) => {
      await queryClient.cancelQueries({ queryKey: favoriteKeys.all });

      const prevList = queryClient.getQueryData<FavoritePlace[]>(favoriteKeys.list());
      const prevStatus = queryClient.getQueryData<boolean>(
        favoriteKeys.status(mapPlaceId),
      );
      const wasFavorite =
        prevStatus ??
        prevList?.some((item) => item.mapPlaceId === mapPlaceId) ??
        false;

      queryClient.setQueryData<boolean>(
        favoriteKeys.status(mapPlaceId),
        !wasFavorite,
      );
      if (prevList) {
        queryClient.setQueryData<FavoritePlace[]>(
          favoriteKeys.list(),
          wasFavorite
            ? prevList.filter((item) => item.mapPlaceId !== mapPlaceId)
            : [
                ...prevList,
                {
                  mapPlaceId,
                  name: place?.name ?? "이름 없는 장소",
                  placeType: place?.placeType ?? null,
                  originalId: place?.originalId ?? null,
                  district: place?.district ?? null,
                  category: place?.category ?? null,
                  imageUrl: place?.imageUrl ?? null,
                },
              ],
        );
      }

      return { prevList, prevStatus, wasFavorite };
    },
    onSuccess: (serverFavorite, { mapPlaceId }) => {
      // 응답이 토글 후 상태를 알려주면 그 값으로 확정한다.
      if (serverFavorite !== null) {
        queryClient.setQueryData<boolean>(
          favoriteKeys.status(mapPlaceId),
          serverFavorite,
        );
      }
    },
    onError: (_error, { mapPlaceId }, context) => {
      if (!context) return;
      queryClient.setQueryData<boolean>(
        favoriteKeys.status(mapPlaceId),
        // prevStatus가 캐시에 없었다면 낙관적 업데이트 이전 판별값으로 되돌린다.
        context.prevStatus ?? context.wasFavorite,
      );
      if (context.prevList) {
        queryClient.setQueryData<FavoritePlace[]>(
          favoriteKeys.list(),
          context.prevList,
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: favoriteKeys.all });
    },
  });
}
