"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { fetchMapPlaces } from "@/features/spot/apis/map";
import { getCrowdLevel } from "@/features/crowd/utils/crowdUtils";

import type { CrowdLevel, CrowdSpot } from "@/types/crowd";
import type { MapPlace } from "@/types/map";

export interface DistrictSpotMarker {
  name: string;
  lat: number;
  lng: number;
  rate: number;
  level: CrowdLevel;
}

const PAGE_SIZE = 100;
// 구 하나의 장소 수 안전 상한 (전체가 3,600여 개라 구당 10페이지면 충분)
const MAX_PAGES = 10;

const normalize = (name: string) => name.replace(/\s+/g, "").toLowerCase();

async function fetchDistrictPlaces(district: string): Promise<MapPlace[]> {
  const all: MapPlace[] = [];
  for (let page = 0; page < MAX_PAGES; page += 1) {
    const res = await fetchMapPlaces({ district, page, size: PAGE_SIZE });
    all.push(...res.content);
    if (res.last) break;
  }
  return all;
}

// 혼잡도 API는 관광지 이름만 주고 좌표가 없어서, 선택한 구의 스팟 DB 목록과
// 이름을 매칭해 좌표를 얻는다. 매칭 안 되는 관광지는 지도에 표시하지 않는다
// (엉뚱한 위치에 찍는 것보다 생략이 낫다).
export function useDistrictSpotMarkers(
  district: string | null,
  spots: CrowdSpot[]
): DistrictSpotMarker[] {
  const { data: places } = useQuery({
    queryKey: ["mapPlaces", "districtAll", district],
    queryFn: () => fetchDistrictPlaces(district!),
    enabled: !!district,
    staleTime: 1000 * 60 * 5,
  });

  return useMemo(() => {
    if (!district || !places?.length || spots.length === 0) return [];

    const placeByName = new Map<string, MapPlace>();
    places.forEach((place) => placeByName.set(normalize(place.name), place));
    const placeEntries = [...placeByName.entries()];

    const markers: DistrictSpotMarker[] = [];
    spots.forEach((spot) => {
      const key = normalize(spot.name);
      // 완전 일치 우선, 안 되면 포함 관계(4자 이상만 — 짧은 이름 오매칭 방지)
      let place = placeByName.get(key);
      if (!place && key.length >= 4) {
        place = placeEntries.find(
          ([name]) => name.includes(key) || key.includes(name)
        )?.[1];
      }
      if (!place) return;
      markers.push({
        name: spot.name,
        lat: place.latitude,
        lng: place.longitude,
        rate: spot.rate,
        level: getCrowdLevel(spot.rate),
      });
    });
    return markers;
  }, [district, places, spots]);
}
