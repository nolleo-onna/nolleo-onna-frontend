import { getCrowdLevel } from "@/features/crowd/utils/crowdUtils";
import {
  flattenCongestionSpots,
  getDistrictSummaries,
} from "@/features/home/utils/congestion";
import { nearestDistrict } from "@/features/spot/utils/nearestDistrict";

import type { Congestion } from "@/types/congestion";
import type { CrowdLevel } from "@/types/crowd";

/** 코스 장소 하나에 매칭된 현재 혼잡도 */
export interface PlaceCongestion {
  level: CrowdLevel;
  /** 집중률 (%) */
  rate: number;
  /** spot: 관광지 이름 매칭 / district: 구 단위 폴백 */
  source: "spot" | "district";
  /** source가 district일 때 기준이 된 구 이름 */
  district?: string;
}

/** 혼잡도 매칭 대상 장소 (코스 CoursePlace·스팟 MapPlace 공용 최소 형태) */
export interface CongestionMatchTarget {
  name: string;
  lat?: number;
  lng?: number;
  /** 구 이름을 이미 아는 경우(MapPlace 등) 좌표 계산 없이 바로 폴백 */
  district?: string;
}

/** 응답 1회당 한 번 만들어 장소마다 조회하는 매칭 인덱스 */
export interface CongestionIndex {
  /** 정규화된 관광지 이름 → 집중률 (부분 일치 탐색용 배열 포함) */
  bySpotName: Map<string, number>;
  spotEntries: { key: string; rate: number }[];
  /** 구 이름 → 구 평균 집중률 */
  byDistrict: Map<string, number>;
}

/**
 * 이름 비교용 정규화 키.
 * 혼잡도 API·TourAPI 간 표기 흔들림(공백, 괄호 부연, 중점 등)을 지운다.
 * 예: "40계단 문화관광테마거리" ↔ "40계단문화관광테마거리"
 */
export function normalizeSpotName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\([^)]*\)/g, "")
    .replace(/[\s·・,\-–—()[\]]/g, "");
}

export function buildCongestionIndex(data: Congestion[]): CongestionIndex {
  const bySpotName = new Map<string, number>();
  const spotEntries: { key: string; rate: number }[] = [];
  for (const spot of flattenCongestionSpots(data)) {
    const key = normalizeSpotName(spot.name);
    if (!key || bySpotName.has(key)) continue;
    bySpotName.set(key, spot.rate);
    spotEntries.push({ key, rate: spot.rate });
  }

  const byDistrict = new Map<string, number>();
  for (const summary of getDistrictSummaries(data)) {
    byDistrict.set(summary.district.trim(), summary.rate);
  }

  return { bySpotName, spotEntries, byDistrict };
}

/** 부분 일치를 허용하는 최소 길이 — 너무 짧은 이름끼리의 오매칭 방지 */
const MIN_PARTIAL_MATCH_LENGTH = 4;

/**
 * 장소 하나의 현재 혼잡도 매칭.
 * ① 관광지 이름 완전 일치 → ② 이름 포함 관계(별칭 흔들림 흡수)
 * → ③ 구 단위 폴백(구 이름 또는 좌표→가장 가까운 구) 순서.
 * 셋 다 실패하면 null — 호출부는 배지를 생략한다(가짜 데이터 금지).
 */
export function matchPlaceCongestion(
  place: CongestionMatchTarget,
  index: CongestionIndex,
): PlaceCongestion | null {
  const key = normalizeSpotName(place.name);

  // ① 완전 일치
  const exactRate = index.bySpotName.get(key);
  if (exactRate !== undefined) {
    return { level: getCrowdLevel(exactRate), rate: exactRate, source: "spot" };
  }

  // ② 포함 관계 — "40계단 문화관" ↔ "40계단 문화관광테마거리" 같은 별칭 변형.
  //    후보가 여럿이면 가장 긴(=가장 구체적인) 키를 채택한다.
  if (key.length >= MIN_PARTIAL_MATCH_LENGTH) {
    let best: { key: string; rate: number } | null = null;
    for (const entry of index.spotEntries) {
      if (entry.key.length < MIN_PARTIAL_MATCH_LENGTH) continue;
      if (!entry.key.includes(key) && !key.includes(entry.key)) continue;
      if (!best || entry.key.length > best.key.length) best = entry;
    }
    if (best) {
      return { level: getCrowdLevel(best.rate), rate: best.rate, source: "spot" };
    }
  }

  // ③ 구 단위 폴백 — 구 이름을 알면 우선 쓰고, 없거나 안 맞으면 좌표→가장 가까운 구
  const candidates: string[] = [];
  if (place.district?.trim()) candidates.push(place.district.trim());
  if (place.lat !== undefined && place.lng !== undefined) {
    candidates.push(nearestDistrict(place.lat, place.lng));
  }
  for (const districtName of candidates) {
    const districtRate = index.byDistrict.get(districtName);
    if (districtRate !== undefined) {
      return {
        level: getCrowdLevel(districtRate),
        rate: districtRate,
        source: "district",
        district: districtName,
      };
    }
  }

  return null;
}

/** 혼잡 이상(혼잡·매우혼잡)인지 여부 */
export function isCrowdedLevel(level: CrowdLevel): boolean {
  return level === "혼잡" || level === "매우혼잡";
}

/** 코스 요약 배너용 집계 */
export function summarizeCourseCongestion(
  entries: (PlaceCongestion | null)[],
): { knownCount: number; crowdedCount: number } {
  const known = entries.filter((e): e is PlaceCongestion => e !== null);
  return {
    knownCount: known.length,
    crowdedCount: known.filter((e) => isCrowdedLevel(e.level)).length,
  };
}
