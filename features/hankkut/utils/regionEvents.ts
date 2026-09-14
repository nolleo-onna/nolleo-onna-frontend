import { POST_DISTRICT_LABELS } from "@/features/hankkut/constants/postTags";

import type { BusanEvent } from "@/types/event";
import type { PostDistrictTag } from "@/types/post";

const DISTRICT_IN_ADDRESS = /부산(?:광역시)?\s+(\S+?[구군])(?:\s|$)/;

/** 행사 주소에서 구·군 이름을 뽑는다 — "부산광역시 해운대구 APEC로 55 (우동)" → "해운대구" */
export function extractDistrictName(addr1: string | null): string | null {
  return addr1?.match(DISTRICT_IN_ADDRESS)?.[1] ?? null;
}

/**
 * 동네(갤러리)의 행정구에서 열리는 행사만. 행사 API엔 구 필드가 없어 주소로 판정한다.
 * 한끗 게시판과 같은 기준(districtTag)이라, 구를 공유하는 사하·을숙도는 행사도 함께 본다.
 */
export function filterEventsByDistrict<T extends Pick<BusanEvent, "addr1">>(
  events: T[],
  districtTag: PostDistrictTag,
): T[] {
  const label = POST_DISTRICT_LABELS[districtTag];
  return events.filter((event) => extractDistrictName(event.addr1) === label);
}
