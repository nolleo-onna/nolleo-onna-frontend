"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { generateCourse } from "@/libs/api/course";
import type { CourseGenerateRequest } from "@/types/course";

export function useCourseGenerate() {
  const router = useRouter();

  return useMutation({
    mutationFn: (body: CourseGenerateRequest) => generateCourse(body),
    onSuccess: (data) => {
      // 생성 완료 → pairId를 URL에 담아 결과 페이지로 이동
      router.push(`/course/result?pairId=${data.pairId}`);
    },
  });
}