"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchMapPlaces } from "../apis/map";

import type { MapPlacePage } from "@/types/map";

// 백엔드가 페이지 크기를 100으로 캡해서 한 번에 못 받는다
const PAGE_SIZE = 100;
// 데이터가 비정상적으로 커져도 요청이 폭주하지 않게 거는 안전장치.
// 현재 장소는 약 3,600여 개(37페이지)라 실데이터보다 넉넉해야 한다 —
// 이 값이 totalPages보다 작으면 뒤쪽 장소들이 매핑에서 빠져 찜이 안 보인다.
const MAX_PAGES = 100;
// 한 번에 몰아치지 않게 병렬 요청 묶음 크기
const CHUNK_SIZE = 8;

// 지도 마커 API(/api/v1/map/markers)는 originalId만 주고 mapPlaceId를 안 줘서,
// 찜하기·리뷰처럼 mapPlaceId가 필요한 기능을 마커 클릭 경로에서 못 쓴다.
// 전체 장소 목록을 훑어 originalId → mapPlaceId 매핑을 만들어 메꾼다.
async function fetchAllPlaceIds(): Promise<Map<string, number>> {
  const idMap = new Map<string, number>();
  const collect = (page: MapPlacePage) => {
    page.content.forEach((place) => idMap.set(place.originalId, place.id));
  };

  const first = await fetchMapPlaces({ page: 0, size: PAGE_SIZE });
  collect(first);

  const totalPages = Math.min(first.totalPages, MAX_PAGES);
  for (let start = 1; start < totalPages; start += CHUNK_SIZE) {
    const pages = await Promise.all(
      Array.from(
        { length: Math.min(CHUNK_SIZE, totalPages - start) },
        (_, i) => fetchMapPlaces({ page: start + i, size: PAGE_SIZE })
      )
    );
    pages.forEach(collect);
  }

  return idMap;
}

export function usePlaceIdMap() {
  return useQuery({
    queryKey: ["mapPlaces", "idMap"],
    queryFn: fetchAllPlaceIds,
    staleTime: 1000 * 60 * 5,
  });
}
