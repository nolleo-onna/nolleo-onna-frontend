"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchSharedCourse } from "@/libs/api/course";

export const sharedCourseKeys = {
  detail: (shareToken: string) => ["sharedCourse", shareToken] as const,
};

// 공유 링크로 열리는 공개 코스 — 로그인 불필요. 없거나 비공개면 404라 재시도하지 않는다.
export function useSharedCourse(shareToken: string) {
  return useQuery({
    queryKey: sharedCourseKeys.detail(shareToken),
    queryFn: () => fetchSharedCourse(shareToken),
    enabled: shareToken.length > 0,
    staleTime: 1000 * 60,
    retry: false,
  });
}
