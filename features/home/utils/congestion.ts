import { getCrowdLevel } from "@/features/crowd/utils/crowdUtils";
import { CONGESTION_ATTRACTION_IMAGES } from "@/features/home/data/congestionImages";
import type { Congestion } from "@/types/congestion";
import type { CrowdLevel } from "@/types/crowd";

export interface CongestionSpot {
  name: string;
  district: string;
  rate: number;
  level: CrowdLevel;
  /** 백엔드 값 → CONGESTION_ATTRACTION_IMAGES 매칭 순으로 채워짐. 둘 다 없으면 카드에서 플레이스홀더 사용 */
  imageUrl?: string;
}

/** 백엔드 필드명 변형에 대비한 방어적 매핑 (구 단위) */
type RawDistrict = {
  districtName?: string;
  district?: string;
  signguNm?: string;
  sigunguName?: string;
  guName?: string;
};

/** 백엔드 필드명 변형에 대비한 방어적 매핑 (관광지 단위) */
type RawAttraction = {
  attractionName?: string;
  name?: string;
  tatsNm?: string;
  rate?: number;
  cnctrRate?: number;
  imageUrl?: string;
  firstImage?: string;
  image?: string;
  // 구 이름이 관광지 항목에 들어있는 경우도 대비
  districtName?: string;
  district?: string;
  signguNm?: string;
};

function normalizeAttractions(data: Congestion[]): CongestionSpot[] {
  return data.flatMap((item) => {
    const d = item as RawDistrict;
    const districtName =
      d.districtName ?? d.district ?? d.signguNm ?? d.sigunguName ?? d.guName;

    return (item.attractions ?? []).map((raw) => {
      const a = raw as RawAttraction;
      const name = a.attractionName ?? a.name ?? a.tatsNm ?? "이름 없음";
      const rate = a.rate ?? a.cnctrRate ?? 0;
      const district =
        districtName ?? a.districtName ?? a.district ?? a.signguNm ?? "";
      const imageUrl =
        a.imageUrl ?? a.firstImage ?? a.image ?? CONGESTION_ATTRACTION_IMAGES[name];
      return { name, district, rate, level: getCrowdLevel(rate), imageUrl };
    });
  });
}

/** 집중률 높은 순 상위 n개 (붐빌 곳) */
export function getTopCongested(data: Congestion[], n = 4): CongestionSpot[] {
  return [...normalizeAttractions(data)]
    .sort((a, b) => b.rate - a.rate)
    .slice(0, n);
}

/** 집중률 낮은 순 하위 n개 (여유로운 곳) */
export function getLeastCongested(data: Congestion[], n = 4): CongestionSpot[] {
  return [...normalizeAttractions(data)]
    .sort((a, b) => a.rate - b.rate)
    .slice(0, n);
}

/** 부산 전체 평균 집중률과 혼잡 등급 (날씨 카드용) */
export function getOverallCongestion(
  data: Congestion[],
): { level: CrowdLevel; rate: number } | null {
  if (!data.length) return null;
  const avg = Math.round(
    data.reduce((sum, d) => sum + (d.rate ?? 0), 0) / data.length,
  );
  return { level: getCrowdLevel(avg), rate: avg };
}

export interface DistrictSummary {
  district: string;
  rate: number;
  level: CrowdLevel;
}

/** 구 단위 집중률 요약 (혼잡도 지도의 구별 원형 마커용) */
export function getDistrictSummaries(data: Congestion[]): DistrictSummary[] {
  return data
    .map((item) => {
      const d = item as RawDistrict;
      const district =
        d.districtName ?? d.district ?? d.signguNm ?? d.sigunguName ?? d.guName ?? "";
      const rate = item.rate ?? 0;
      return { district, rate, level: getCrowdLevel(rate) };
    })
    .filter((d) => d.district);
}
