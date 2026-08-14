"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchMapPlaces } from "@/features/spot/apis/map";
import type { MapPlace } from "@/types/map";

export interface PopularSpot extends MapPlace {
  imageUrl: string;
}

export const popularSpotsKeys = {
  all: ["mapPlaces", "popular"] as const,
};

// 홈 "인기 부산 스팟" 섹션용 — 이미지가 있는 항목이 먼저 오도록 정렬해서
// (useMapPlaces와 동일한 방식) 카드형 UI에 어울리는 스팟만 보여준다. 정렬이
// 100% 보장은 아니라 넉넉히 받아와 이미지 있는 항목만 골라 size만큼 자른다.
export function usePopularSpots(size = 4) {
  return useQuery({
    queryKey: [...popularSpotsKeys.all, size],
    queryFn: () => fetchMapPlaces({ sort: "imageUrl,asc", size: size * 3 }),
    staleTime: 1000 * 60 * 5,
    select: (page): PopularSpot[] =>
      page.content
        .filter((spot): spot is PopularSpot => !!spot.imageUrl)
        .slice(0, size),
  });
}
