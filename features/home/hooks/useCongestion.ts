"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchCongestion, refreshCongestion } from "@/libs/api/congestion";
import type { Congestion } from "@/types/congestion";

export const CONGESTION_QUERY_KEY = ["congestion"] as const;

interface UseCongestionOptions {
  /**
   * 조회 전 캐시를 즉시 갱신(refresh)할지 여부. 기본값 false.
   *
   * refresh(/congestion/refresh)는 [테스트용] 스케줄러 수동 실행이라 응답이 느리다.
   * 렌더 경로에서 이를 await 하면 갱신이 끝날 때까지 데이터가 없어 mock 으로 보인다.
   * 평소에는 백엔드 스케줄러가 채워둔 Redis 캐시를 바로 조회한다.
   * 수동 "지금 갱신" 버튼 등에서만 refresh: true 로 사용할 것.
   */
  refresh?: boolean;
  /** 쿼리 실행 여부. 기본값 true */
  enabled?: boolean;
}

/**
 * 혼잡도 데이터 조회 훅.
 * 기본은 캐시 즉시 조회(빠름). refresh: true 를 주면 갱신 후 조회한다(느림).
 */
export function useCongestion(options: UseCongestionOptions = {}) {
  const { refresh = false, enabled = true } = options;

  return useQuery<Congestion[]>({
    queryKey: CONGESTION_QUERY_KEY,
    queryFn: async () => {
      if (refresh) {
        // 느린 테스트용 갱신 — 실패해도 마지막 캐시 데이터는 조회
        await refreshCongestion().catch(() => undefined);
      }
      return fetchCongestion();
    },
    enabled,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
