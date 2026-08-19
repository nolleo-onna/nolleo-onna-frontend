"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchMapPlaces } from "../apis/map";

// 백엔드가 페이지 크기를 100으로 캡해서 한 번에 못 받는다
const PAGE_SIZE = 100;
// 데이터가 비정상적으로 커져도 요청이 폭주하지 않게 거는 안전장치
const MAX_PAGES = 30;

// 지도 마커 API(/api/v1/map/markers)는 originalId만 주고 mapPlaceId를 안 줘서,
// 찜하기·리뷰처럼 mapPlaceId가 필요한 기능을 마커 클릭 경로에서 못 쓴다.
// 전체 장소 목록을 한 번 훑어 originalId → mapPlaceId 매핑을 만들어 메꾼다.
async function fetchAllPlaceIds(): Promise<Map<string, number>> {
  const idMap = new Map<string, number>();
  for (let page = 0; page < MAX_PAGES; page += 1) {
    const res = await fetchMapPlaces({ page, size: PAGE_SIZE });
    res.content.forEach((place) => idMap.set(place.originalId, place.id));
    if (res.last) break;
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
