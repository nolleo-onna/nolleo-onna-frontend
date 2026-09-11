"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchPopularCourses } from "@/libs/api/course";

export const popularCoursesKey = ["courses", "popular"] as const;

export function usePopularCourses(size = 6) {
  return useQuery({
    queryKey: [...popularCoursesKey, size],
    queryFn: () => fetchPopularCourses(size),
    staleTime: 1000 * 60 * 5,
  });
}
