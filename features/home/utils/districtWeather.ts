import { getCrowdLevel } from "@/features/crowd/utils/crowdUtils";
import type { Congestion } from "@/types/congestion";
import type { CrowdLevel } from "@/types/crowd";
import type { PtyCode, WeatherObservation } from "@/types/weather";

/** 구 단위로 날씨와 혼잡도를 합친 요약 */
export interface DistrictSummary {
  district: string;
  tmp: number | null;
  pty: PtyCode;
  rn1: number | null;
  congestionRate: number | null;
  congestionLevel: CrowdLevel | null;
}

/** 혼잡도 응답의 구 이름 필드명 방어적 매핑 */
type RawDistrict = {
  districtName?: string;
  district?: string;
  signguNm?: string;
  sigunguName?: string;
  guName?: string;
};

export function resolveDistrictName(c: Congestion): string {
  const d = c as RawDistrict;
  return (
    d.districtName ?? d.district ?? d.signguNm ?? d.sigunguName ?? d.guName ?? ""
  );
}

/**
 * 구 이름을 키로 날씨(WeatherObservation)와 혼잡도(Congestion)를 합친다.
 * 날씨 목록을 기준으로 하고, 같은 구의 혼잡도가 있으면 붙인다(없으면 null).
 */
export function mergeDistrictSummaries(
  weather: WeatherObservation[] | undefined,
  congestion: Congestion[] | undefined,
): DistrictSummary[] {
  const rateByDistrict = new Map<string, number>();
  (congestion ?? []).forEach((c) => {
    const name = resolveDistrictName(c).trim();
    if (name) rateByDistrict.set(name, c.rate);
  });

  return (weather ?? []).map((w) => {
    const rate = rateByDistrict.get(w.district.trim());
    return {
      district: w.district,
      tmp: w.tmp,
      pty: w.pty,
      rn1: w.rn1,
      congestionRate: rate ?? null,
      congestionLevel: rate != null ? getCrowdLevel(rate) : null,
    };
  });
}
