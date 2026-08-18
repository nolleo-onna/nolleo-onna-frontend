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

// GET /api/v1/courses/{pairId}는 코스 생성이 끝난 뒤에만 받는 pairId를 조회하는
// API라 결과가 없으면 200+빈 배열이 아니라 404/403으로 응답한다. 그래서 폴링이 필요 없다.
export function useCourseResult(pairId: string | null) {
  return useQuery({
    queryKey: ["courseResult", pairId],
    queryFn: () => fetchCourseResult(pairId!),
    enabled: !!pairId,
    staleTime: 1000 * 60,
    retry: false,
  });
}
