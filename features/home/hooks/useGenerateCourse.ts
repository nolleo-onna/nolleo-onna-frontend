"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { courseBudgetAmount } from "@/constants/course";
import { saveCourseBudget } from "@/features/course/utils/budgetStorage";
import { buildCourseNotices, saveCourseNotices } from "@/features/course/utils/courseNotices";
import { CourseGenerateError, generateCourse } from "@/libs/api/course";
import type { CourseBudgetTier } from "@/types/course";

export interface CourseFormValues {
  startArea: string;
  budget: CourseBudgetTier;
  includeSpots: string[];
  festival: string | null;
}

/**
 * 조건 폼으로 코스를 만들고 결과 화면으로 보낸다 (AI 호출 없음, 보통 1초 안에 끝난다).
 * 히어로 검색 카드와 문장형 폼이 같이 쓴다.
 */
export function useGenerateCourse() {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async ({ startArea, budget: tier, includeSpots, festival }: CourseFormValues) => {
    if (isGenerating) return;
    setError(null);
    setIsGenerating(true);

    try {
      const result = await generateCourse({
        startArea,
        budget: tier,
        ...(includeSpots.length > 0 ? { includeSpots } : {}),
        ...(festival ? { festival } : {}),
      });

      const budget = courseBudgetAmount(result.applied.budget.tier);
      if (budget !== undefined) saveCourseBudget(result.pairId, budget);

      // 요청과 다르게 적용된 조건(축제 위치로 바뀐 지역, 못 찾은 장소 등)은
      // 결과 화면에서 알려준다.
      saveCourseNotices(
        result.pairId,
        buildCourseNotices({
          requestedArea: startArea,
          applied: result.applied,
          unmatched: result.unmatched,
        }),
      );

      const budgetParam = budget !== undefined ? `&budget=${budget}` : "";
      router.push(`/course/result?pairId=${result.pairId}${budgetParam}`);
    } catch (err) {
      // 401은 clientFetch가 이미 로그인 페이지로 보내는 중이라 여기서 더 알리지 않는다
      setError(
        err instanceof CourseGenerateError && err.status !== 401
          ? err.message
          : "코스를 만들지 못했어요. 잠시 후 다시 시도해주세요",
      );
      setIsGenerating(false);
    }
  };

  return { generate, isGenerating, error };
}
