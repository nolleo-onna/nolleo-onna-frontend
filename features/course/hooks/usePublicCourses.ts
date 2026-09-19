"use client";

import { useInfiniteQuery } from "@tanstack/react-query";

import { fetchPopularCourses } from "@/libs/api/course";

/** 전체보기 한 번에 받는 개수 */
export const PUBLIC_COURSES_PAGE_SIZE = 12;

export const publicCoursesKey = ["courses", "public"] as const;

/**
 * 공유된 공개 코스 전체 목록. 서버는 조회수 → 최신순으로 한 페이지씩 준다.
 * 마지막 페이지인지 알려주는 값이 없어(배열만 온다) 받은 개수가 한 페이지보다 적으면 끝으로 본다.
 */
export function usePublicCourses(pageSize = PUBLIC_COURSES_PAGE_SIZE) {
  return useInfiniteQuery({
    queryKey: [...publicCoursesKey, pageSize],
    queryFn: ({ pageParam }) => fetchPopularCourses(pageSize, pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length < pageSize ? undefined : allPages.length,
    staleTime: 1000 * 60 * 5,
  });
}
