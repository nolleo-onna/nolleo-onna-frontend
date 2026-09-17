import { COURSE_BUDGET_OPTIONS, normalizeStartArea, type CourseStartArea } from "@/constants/course";
import type { CourseBudgetTier } from "@/types/course";

// 홈 검색바(SearchBar)가 sessionStorage에 저장하는 선택값의 키.
// 다른 페이지(예: 혼잡도 구 패널)에서 지역을 프리셋해 홈으로 보낼 때도 쓴다.
export const SEARCHBAR_SELECTION_KEY = "searchbar-selection";

// 코스 생성 검색바에 지역을 프리셋한다. 기존 선택(예산)은 유지하고 지역만 바꾼 뒤,
// 홈에서 검색바가 이 값을 복원한다. "해운대구"처럼 행정구역명이 들어와도
// 검색바가 normalizeStartArea로 지원 지역에 맞춰준다.
export function presetCourseRegion(region: string): void {
  try {
    const raw = sessionStorage.getItem(SEARCHBAR_SELECTION_KEY);
    const saved = raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
    sessionStorage.setItem(
      SEARCHBAR_SELECTION_KEY,
      JSON.stringify({
        ...saved,
        activeTab: "course",
        selectedRegion: region,
        hasInteracted: true,
      })
    );
  } catch {
    // sessionStorage 접근 실패 시 프리셋 없이 홈 이동만 한다
  }
}

export interface CourseSelection {
  region?: CourseStartArea;
  budget?: CourseBudgetTier;
}

/**
 * 홈 코스 조건 바가 되살릴 지역·예산. 다른 페이지가 presetCourseRegion으로 넣은 지역도 여기로 읽힌다.
 * 행정구역명("해운대구")은 지원 지역으로 맞추고, 맞출 수 없거나 모르는 예산이면 버린다.
 */
export function readCourseSelection(): CourseSelection {
  try {
    const raw = sessionStorage.getItem(SEARCHBAR_SELECTION_KEY);
    if (!raw) return {};
    const saved = JSON.parse(raw) as Record<string, unknown>;
    const region = typeof saved.selectedRegion === "string" ? normalizeStartArea(saved.selectedRegion) : undefined;
    const budget = COURSE_BUDGET_OPTIONS.find((o) => o.tier === saved.budgetTier)?.tier;
    return { region, budget };
  } catch {
    return {};
  }
}

/** 고른 지역·예산만 덮어쓴다 — 저장된 다른 값은 그대로 둔다 */
export function saveCourseSelection({ region, budget }: CourseSelection): void {
  try {
    const raw = sessionStorage.getItem(SEARCHBAR_SELECTION_KEY);
    const saved = raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
    sessionStorage.setItem(
      SEARCHBAR_SELECTION_KEY,
      JSON.stringify({
        ...saved,
        ...(region && { selectedRegion: region }),
        ...(budget && { budgetTier: budget }),
      }),
    );
  } catch {
    // 저장 실패는 무시 — 다음에 다시 고르면 된다
  }
}
