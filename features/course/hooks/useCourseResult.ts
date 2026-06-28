"use client";

import { useQuery } from "@tanstack/react-query";
import { clientFetch } from "@/libs/clientFetch";

// ── API 응답 타입 ──────────────────────────────────────────
export interface CourseItemResponse {
  serialNum: number;
  placeType: string;
  category: string;
  name: string;
  imageUrl: string;
  longitude: number;
  latitude: number;
  originalId: string;
  distanceFromPrevM: number;
  durationMinutes: number;
  expectedCost: number;
  hasWeatherWarning: boolean;
  warningMessage: string | null;
}

export interface CourseResponse {
  id: number;
  parentCourseId: number | null;
  courseType: "ACTIVE" | "CULTURE" | "FOOD_TOUR";
  generationMode: string;
  title: string;
  description: string;
  totalCost: number | null;
  totalMinutes: number;
  items: CourseItemResponse[];
}

export interface CoursePairResponse {
  pairId: string;
  courses: CourseResponse[];
}

async function fetchCourseResult(pairId: string): Promise<CoursePairResponse> {
  const res = await clientFetch(`/api/v1/courses/pair/${pairId}`);
  if (!res.ok) throw new Error("코스 조회 실패");
  const json = await res.json();
  return json.data;
}

export function useCourseResult(pairId: string | null) {
  return useQuery({
    queryKey: ["courseResult", pairId],
    queryFn: () => fetchCourseResult(pairId!),
    enabled: !!pairId,
    // 생성 중일 수 있으므로 3초마다 폴링, 데이터 오면 중단
    refetchInterval: (query) =>
      query.state.data?.courses?.length ? false : 3000,
    staleTime: 0,
  });
}