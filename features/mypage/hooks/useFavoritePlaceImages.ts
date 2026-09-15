"use client";

import { useQueries } from "@tanstack/react-query";

import { fetchMapPlaces } from "@/features/spot/apis/map";
import { findFavoriteImage } from "@/features/mypage/utils/favoriteImage";

import type { FavoritePlace } from "@/types/favorite";

/** 화면에 보이는 찜한 장소들의 사진 — mapPlaceId → 사진 주소(없으면 null) */
export function useFavoritePlaceImages(items: FavoritePlace[]): Map<number, string | null> {
  const results = useQueries({
    queries: items.map((item) => ({
      queryKey: ["favorites", "image", item.mapPlaceId],
      queryFn: async () => {
        const page = await fetchMapPlaces({ keyword: item.name, size: 10 });
        return findFavoriteImage(page?.content, item);
      },
      // 찜 목록에 사진이 이미 있으면(찜을 누른 직후 낙관적 추가 등) 검색하지 않는다
      enabled: !item.imageUrl,
      staleTime: 1000 * 60 * 60,
      retry: false,
    })),
  });

  return new Map(items.map((item, i) => [item.mapPlaceId, item.imageUrl ?? results[i]?.data ?? null]));
}
