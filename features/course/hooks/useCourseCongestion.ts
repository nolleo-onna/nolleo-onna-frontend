"use client";

import { useCallback, useMemo } from "react";

import { useCongestion } from "@/features/home/hooks/useCongestion";
import {
  buildCongestionIndex,
  matchPlaceCongestion,
} from "@/features/course/utils/courseCongestion";

import type {
  CongestionMatchTarget,
  PlaceCongestion,
} from "@/features/course/utils/courseCongestion";

/**
 * 코스 장소들의 현재 혼잡도 조회 훅.
 *
 * 홈과 같은 queryKey(["congestion"])의 useCongestion을 재사용해
 * 같은 페이지에서 중복 요청 없이 캐시를 공유한다.
 * 매칭은 이름 완전/부분 일치 → 구 단위 폴백 순이고, 실패하면 null을
 * 반환하므로 호출부는 배지를 생략하면 된다(가짜 데이터 금지).
 */
export function useCourseCongestion() {
  const { data } = useCongestion();

  const index = useMemo(
    () => (data && data.length ? buildCongestionIndex(data) : null),
    [data],
  );

  const getPlaceCongestion = useCallback(
    (place: CongestionMatchTarget): PlaceCongestion | null =>
      index ? matchPlaceCongestion(place, index) : null,
    [index],
  );

  return { getPlaceCongestion, isReady: index !== null };
}
