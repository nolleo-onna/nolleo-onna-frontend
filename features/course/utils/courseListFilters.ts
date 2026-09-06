import type { MyCourseSummary } from "@/types/course";

// 코스 목록의 정렬/필터 상태는 URL 쿼리 파라미터(sort, cost)로 관리한다.

export const SORT_OPTIONS = [
  { value: "latest", label: "최신순" },
  { value: "oldest", label: "오래된순" },
  { value: "cost_low", label: "비용 낮은순" },
  { value: "cost_high", label: "비용 높은순" },
  { value: "spots", label: "스팟 많은순" },
] as const;

export type CourseSortKey = (typeof SORT_OPTIONS)[number]["value"];

export const COST_FILTERS = [
  { value: "all", label: "전체" },
  { value: "free", label: "무료" },
  { value: "under3", label: "3만원 이하" },
  { value: "under5", label: "5만원 이하" },
] as const;

export type CourseCostFilter = (typeof COST_FILTERS)[number]["value"];

export function parseSortKey(value: string | null): CourseSortKey {
  return SORT_OPTIONS.some((o) => o.value === value)
    ? (value as CourseSortKey)
    : "latest";
}

export function parseCostFilter(value: string | null): CourseCostFilter {
  return COST_FILTERS.some((o) => o.value === value)
    ? (value as CourseCostFilter)
    : "all";
}

export function applyCourseListControls(
  courses: MyCourseSummary[],
  sort: CourseSortKey,
  cost: CourseCostFilter,
): MyCourseSummary[] {
  let list = [...courses];

  if (cost === "free") list = list.filter((c) => c.totalCost === 0);
  else if (cost === "under3") list = list.filter((c) => c.totalCost <= 30_000);
  else if (cost === "under5") list = list.filter((c) => c.totalCost <= 50_000);

  switch (sort) {
    case "latest":
      // createdAt이 응답에 없어 자동증가 id 역순을 최신순으로 사용한다.
      return list.sort((a, b) => b.id - a.id);
    case "oldest":
      return list.sort((a, b) => a.id - b.id);
    case "cost_low":
      return list.sort((a, b) => a.totalCost - b.totalCost);
    case "cost_high":
      return list.sort((a, b) => b.totalCost - a.totalCost);
    case "spots":
      return list.sort(
        (a, b) => (b.spotTitles?.length ?? 0) - (a.spotTitles?.length ?? 0),
      );
  }
}

/** 한 페이지에 보여줄 코스 카드 수 */
export const COURSE_PAGE_SIZE = 9;

function normalizeText(value: string): string {
  return value.replace(/\s+/g, "").toLowerCase();
}

/**
 * 검색어로 코스를 거른다 — 제목·설명·담긴 장소 이름까지 대조해서
 * "광안리"처럼 장소로 검색해도 그 장소가 든 코스가 잡히게 한다.
 * 공백은 무시한다("광안리 카페" = "광안리카페").
 */
export function filterCoursesBySearch(
  courses: MyCourseSummary[],
  search: string,
): MyCourseSummary[] {
  const term = normalizeText(search);
  if (!term) return courses;
  return courses.filter((course) => {
    const haystack = normalizeText(
      [course.title, course.description ?? "", ...(course.spotTitles ?? [])].join(" "),
    );
    return haystack.includes(term);
  });
}
