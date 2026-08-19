import { getCrowdLevel } from "@/features/crowd/utils/crowdUtils";
import { DISTRICT_COORDS } from "@/features/spot/constants/districtCoords";
import type { Congestion } from "@/types/congestion";
import type { CrowdLevel } from "@/types/crowd";
import type { CoursePlace } from "@/features/course/data/mockCourse";

export interface PlaceCongestion {
  level: CrowdLevel;
  rate: number;
  /** attraction = 관광지 이름으로 직접 매칭, district = 좌표 기준 구 단위 근사 */
  source: "attraction" | "district";
  /** district 폴백일 때 기준이 된 구 이름 */
  district?: string;
}

/**
 * 혼잡도 매칭에 필요한 최소 장소 형태.
 * 코스 장소(CoursePlace)뿐 아니라 스팟 추가 패널의 MapPlace처럼
 * id·이름·좌표만 있는 목록도 같은 매칭 로직을 재사용할 수 있게 한다.
 */
export type CongestionPlaceInput = Pick<CoursePlace, "id" | "name" | "lat" | "lng">;

function normalize(name: string) {
  return name.replace(/\s+/g, "").toLowerCase();
}

/** 좌표에서 가장 가까운 구 이름 (스팟 지도와 같은 근사 방식) */
function nearestDistrict(lat: number, lng: number): string | null {
  let best: string | null = null;
  let bestDistSq = Infinity;
  for (const [district, coords] of Object.entries(DISTRICT_COORDS)) {
    const dy = coords.lat - lat;
    const dx = coords.lng - lng;
    const distSq = dx * dx + dy * dy;
    if (distSq < bestDistSq) {
      bestDistSq = distSq;
      best = district;
    }
  }
  return best;
}

/**
 * 코스의 각 장소에 지금 혼잡도를 매긴다.
 * 1) 혼잡도 데이터의 관광지 이름과 직접 매칭(공백 무시, 포함 관계 허용)
 * 2) 안 되면 좌표로 가장 가까운 구의 구 단위 집중률로 폴백
 * 혼잡도 데이터가 없으면 빈 Map을 반환하고 화면에서는 배지를 숨긴다.
 */
export function buildCourseCongestion(
  places: CongestionPlaceInput[],
  congestion: Congestion[] | undefined,
): Map<number, PlaceCongestion> {
  const result = new Map<number, PlaceCongestion>();
  if (!congestion?.length) return result;

  // 관광지 이름 → 집중률 (이름은 정규화해서 보관)
  // 백엔드 실응답은 district/name 필드를 쓰지만 타입 선언은 districtName/
  // attractionName이라, home/utils/congestion.ts와 같은 방식으로 둘 다 허용한다.
  const attractionRates = new Map<string, number>();
  const districtRates = new Map<string, number>();
  congestion.forEach((item) => {
    const raw = item as Congestion & { district?: string };
    const districtName = raw.districtName ?? raw.district;
    if (districtName) districtRates.set(districtName, item.rate ?? 0);
    (item.attractions ?? []).forEach((a) => {
      const rawAttraction = a as typeof a & { name?: string };
      const attractionName = rawAttraction.attractionName ?? rawAttraction.name;
      if (attractionName) attractionRates.set(normalize(attractionName), a.rate ?? 0);
    });
  });
  const attractionNames = [...attractionRates.keys()];

  places.forEach((place) => {
    const name = normalize(place.name);

    // 1) 정확 일치 → 포함 관계(오탐 방지를 위해 4자 이상일 때만)
    let rate = attractionRates.get(name);
    if (rate === undefined) {
      const matched = attractionNames.find(
        (candidate) =>
          candidate.length >= 4 &&
          name.length >= 4 &&
          (name.includes(candidate) || candidate.includes(name)),
      );
      if (matched !== undefined) rate = attractionRates.get(matched);
    }
    if (rate !== undefined) {
      result.set(place.id, {
        level: getCrowdLevel(rate),
        rate,
        source: "attraction",
      });
      return;
    }

    // 2) 구 단위 폴백
    const district = nearestDistrict(place.lat, place.lng);
    const districtRate = district ? districtRates.get(district) : undefined;
    if (district && districtRate !== undefined) {
      result.set(place.id, {
        level: getCrowdLevel(districtRate),
        rate: districtRate,
        source: "district",
        district,
      });
    }
  });

  return result;
}

/** 혼잡/매우혼잡으로 분류된 장소들 (경고 배너용) */
export function getCongestedPlaces(
  places: CoursePlace[],
  congestionByPlaceId: Map<number, PlaceCongestion>,
): CoursePlace[] {
  return places.filter((p) => {
    const info = congestionByPlaceId.get(p.id);
    return info !== undefined && (info.level === "혼잡" || info.level === "매우혼잡");
  });
}
