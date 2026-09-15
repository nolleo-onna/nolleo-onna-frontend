"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchMapPlaces } from "../apis/map";

/**
 * 코스 장소처럼 originalId(관광공사 contentId)만 알고 mapPlaceId는 모르는 장소를 이름으로 검색해
 * originalId가 같은 지도 장소의 id를 찾는다. 찜·별점 API가 mapPlaceId를 쓴다. 못 찾으면 null.
 */
export function useMapPlaceIdByOriginal(originalId: string | null, name: string | undefined) {
  return useQuery({
    queryKey: ["mapPlaces", "idByOriginal", originalId],
    queryFn: async () => {
      const page = await fetchMapPlaces({ keyword: name, size: 20 });
      return page?.content?.find((place) => place.originalId === originalId)?.id ?? null;
    },
    enabled: !!originalId && !!name,
    staleTime: 1000 * 60 * 60,
    retry: false,
  });
}
