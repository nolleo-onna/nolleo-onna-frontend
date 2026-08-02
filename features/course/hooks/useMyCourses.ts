"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchMyCourses } from "@/libs/api/course";
import type { MyCourseSummary } from "@/types/course";

export const myCoursesKeys = {
  all: ["courses", "me"] as const,
};

export function useMyCourses() {
  return useQuery<MyCourseSummary[]>({
    queryKey: myCoursesKeys.all,
    queryFn: fetchMyCourses,
    staleTime: 1000 * 60, // 1분
  });
}