"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { clientFetch } from "@/libs/clientFetch";

// 코스 생성 폴링 최대 대기 시간 — 빈 배열 응답이 "생성 중"인지 "정상적으로 0건"인지
// API가 구분해주지 않으므로, 이 시간이 지나도 결과가 없으면 폴링을 포기한다.
const MAX_POLL_MS = 60_000;

// ── API 응답 타입 (신 스펙) ────────────────────────────────
export interface CourseItemResponse {
  serialNum: number;
  spotContentId: string;
  title: string;
  mapX: number;
  mapY: number;
  firstImage: string | null;
  category: string;
  expectedCost: number;
  distanceFromPrevM: number;
}

export interface CourseResponse {
  id: number;
  pairId: string;
  generationMode: string;
  title: string;
  description: string;
  totalCost: number;
  items: CourseItemResponse[];
  createdAt: string;
}

async function fetchCourseResult(pairId: string): Promise<CourseResponse[]> {
  const res = await clientFetch(`/api/v1/courses/${pairId}`);
  if (!res.ok) throw new Error("코스 조회 실패");
  const json = await res.json();
  return json.data ?? [];
}

export function useCourseResult(pairId: string | null) {
  const [hasTimedOut, setHasTimedOut] = useState(false);
  const [trackedPairId, setTrackedPairId] = useState(pairId);

  // pairId가 바뀌면(새 코스 조회 시작) 이전 타임아웃 상태를 리셋
  if (pairId !== trackedPairId) {
    setTrackedPairId(pairId);
    setHasTimedOut(false);
  }

  const query = useQuery({
    queryKey: ["courseResult", pairId],
    queryFn: () => fetchCourseResult(pairId!),
    enabled: !!pairId && !hasTimedOut,
    // 생성 중일 수 있으므로 3초마다 폴링, 데이터 오면 중단
    refetchInterval: (query) => (query.state.data?.length ? false : 3000),
    staleTime: 0,
  });

  useEffect(() => {
    if (!pairId) return;
    const timer = setTimeout(() => setHasTimedOut(true), MAX_POLL_MS);
    return () => clearTimeout(timer);
  }, [pairId]);

  return { ...query, hasTimedOut };
}