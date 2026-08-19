import { DISTRICT_COORDS } from "@/features/spot/constants/districtCoords";

/**
 * 좌표(위경도) → 가장 가까운 구 이름 근사.
 *
 * 행정구역 경계 계산이 아니라 구 중심좌표와의 거리 비교라
 * "대충 어느 구인지"만 필요한 개요용 매핑에 쓴다.
 * (SpotMap의 구 단위 집계에서 쓰던 파일 로컬 로직을 공용 유틸로 승격)
 */
export function nearestDistrict(lat: number, lng: number): string {
  let best = "";
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
