"use client";

import { useQuery } from "@tanstack/react-query";
import { clientFetch } from "@/libs/clientFetch";

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
  return useQuery({
    queryKey: ["courseResult", pairId],
    queryFn: () => fetchCourseResult(pairId!),
    enabled: !!pairId,
    // 생성 중일 수 있으므로 3초마다 폴링, 데이터 오면 중단
    refetchInterval: (query) => (query.state.data?.length ? false : 3000),
    staleTime: 0,
  });
}