"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { updateCourse, updateCourseVisibility } from "@/libs/api/course";
import { clientFetch } from "@/libs/clientFetch";
import { myCoursesKeys } from "@/features/course/hooks/useMyCourses";

import type {
  CourseItemResponse,
  CourseResponse,
  CourseUpdateRequest,
} from "@/types/course";

// 타입은 types/course.ts로 옮겼지만, 기존 import 경로를 쓰는 화면들을 위해 재노출한다.
export type { CourseItemResponse, CourseResponse };

export const courseResultKeys = {
  all: ["courseResult"] as const,
  detail: (pairId: string) => [...courseResultKeys.all, pairId] as const,
};

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
    queryKey: courseResultKeys.detail(pairId ?? ""),
    queryFn: () => fetchCourseResult(pairId!),
    enabled: !!pairId,
    staleTime: 1000 * 60,
    retry: false,
  });
}

interface UpdateCourseVariables extends CourseUpdateRequest {
  courseId: number;
}

/**
 * 코스 편집 저장. 응답이 수정된 코스 전체라 재조회 없이 캐시를 갈아끼운다.
 * 조회 쿼리는 data가 배열이라 같은 형태(단일 원소 배열)로 맞춰 넣는다.
 */
export function useUpdateCourse(pairId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ courseId, ...body }: UpdateCourseVariables) =>
      updateCourse(courseId, body),
    onSuccess: (updated) => {
      if (pairId) {
        queryClient.setQueryData(courseResultKeys.detail(pairId), [updated]);
      }
      // 코스 목록에 보이는 제목·총비용·장소 이름이 함께 바뀌므로 다시 받아온다
      queryClient.invalidateQueries({ queryKey: myCoursesKeys.all });
    },
  });
}

/**
 * 코스 공개/비공개 전환. 응답이 코스 전체(share 포함)라 상세 캐시를 갈아끼우고,
 * 목록의 isPublic 뱃지도 바뀌므로 목록은 다시 받아온다.
 */
export function useUpdateCourseVisibility(pairId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ courseId, isPublic }: { courseId: number; isPublic: boolean }) =>
      updateCourseVisibility(courseId, isPublic),
    onSuccess: (updated) => {
      if (pairId) {
        queryClient.setQueryData(courseResultKeys.detail(pairId), [updated]);
      }
      queryClient.invalidateQueries({ queryKey: myCoursesKeys.all });
    },
  });
}
