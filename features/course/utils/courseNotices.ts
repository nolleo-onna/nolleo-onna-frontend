import type { CourseGenerateApplied, CourseGenerateUnmatched } from "@/types/course";

/**
 * 폼으로 코스를 만들 때 "요청과 다르게 적용된 것"을 결과 화면에서 알려주기 위한 안내.
 * 생성 직후 바로 결과 페이지로 넘어가므로, 만든 쪽(검색바)에서 문구를 만들어 저장해두고
 * 결과 페이지가 pairId로 꺼내 보여준다.
 */
export type CourseNoticeTone = "info" | "warn";

export interface CourseNotice {
  id: string;
  tone: CourseNoticeTone;
  message: string;
}

/** 요청한 조건과 서버가 실제로 적용한 조건을 비교해 안내 문구를 만든다 */
export function buildCourseNotices({
  requestedArea,
  applied,
  unmatched,
}: {
  requestedArea: string;
  applied: CourseGenerateApplied;
  unmatched: CourseGenerateUnmatched;
}): CourseNotice[] {
  const notices: CourseNotice[] = [];

  // 축제를 찾으면 서버가 지역을 축제 위치로 바꾼다 — 고른 지역과 달라졌으면 먼저 알린다.
  if (applied.startArea !== requestedArea) {
    const where = applied.festival ? `축제 위치(${applied.startArea})` : applied.startArea;
    notices.push({ id: "area", tone: "info", message: `${where} 기준으로 만들었어요` });
  }

  if (unmatched.festival) {
    notices.push({
      id: "festival",
      tone: "warn",
      message: `'${unmatched.festival}'을(를) 찾지 못해 ${applied.startArea} 중심으로 만들었어요`,
    });
  }

  if (unmatched.includeSpots.length > 0) {
    notices.push({
      id: "spots",
      tone: "warn",
      message: `${unmatched.includeSpots.map((n) => `'${n}'`).join(", ")}은(는) 찾지 못해 제외했어요. 정확한 장소명으로 다시 시도해 보세요`,
    });
  }

  if (applied.budget.filterRelaxed) {
    notices.push({
      id: "budget",
      tone: "warn",
      message: "예산 안에서 식사·카페를 다 채우지 못해 일부는 예산을 넘을 수 있어요",
    });
  }

  return notices;
}

// ── 결과 페이지로 넘기기 ──────────────────────────────────────
// URL에 담기엔 길고, 새로고침하면 사라지는 게 자연스러운 안내라 sessionStorage를 쓴다.
const STORAGE_KEY = "course:notices";

function readMap(): Record<string, CourseNotice[]> {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return typeof parsed === "object" && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

export function saveCourseNotices(pairId: string, notices: CourseNotice[]) {
  if (notices.length === 0) return;
  try {
    const map = readMap();
    map[pairId] = notices;
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    // 저장 실패(시크릿 모드 등)는 안내가 안 보일 뿐이라 무시
  }
}

/** 한 번 보여준 안내는 지운다 — 코스를 다시 열 때마다 뜨면 성가시다 */
export function takeCourseNotices(pairId: string): CourseNotice[] {
  const map = readMap();
  const notices = map[pairId];
  if (!Array.isArray(notices) || notices.length === 0) return [];
  try {
    delete map[pairId];
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    // 지우지 못해도 보여주는 데는 문제 없다
  }
  return notices;
}
