import type { CourseBudgetTier } from "@/types/course";

/**
 * 폼 코스 생성(POST /api/v1/courses)이 받는 지역.
 * 여기 없는 값을 보내면 서버가 UNKNOWN_START_AREA(400)로 돌려준다 — 지역 선택 UI는
 * 반드시 이 목록에서만 고르게 한다.
 */
export const COURSE_START_AREAS = [
  "해운대",
  "광안리",
  "서면",
  "전포",
  "영도",
  "남포",
  "센텀",
  "송도",
  "기장",
  "동래",
  "중구",
  "부산진구",
  "북구",
  "사하구",
  "강서구",
  "연제구",
  "수영구",
  "사상",
] as const;

export type CourseStartArea = (typeof COURSE_START_AREAS)[number];

export function isCourseStartArea(value: string): value is CourseStartArea {
  return (COURSE_START_AREAS as readonly string[]).includes(value);
}

/**
 * 혼잡도 화면 등에서 넘어오는 행정구역명("해운대구", "기장군")을 지원 지역으로 맞춘다.
 * 맞출 수 없으면 undefined — 호출한 쪽이 기본 지역으로 되돌린다.
 */
export function normalizeStartArea(value: string | undefined | null): CourseStartArea | undefined {
  if (!value) return undefined;
  const name = value.trim();
  if (isCourseStartArea(name)) return name;

  // "해운대구" → "해운대", "기장군" → "기장". 떼고도 못 맞추면(서구·남구 등) 포기한다.
  const stripped = name.replace(/(구|군)$/, "");
  return isCourseStartArea(stripped) ? stripped : undefined;
}

/**
 * 예산 등급. `amount`는 결과 페이지 예산 게이지의 기준 금액이고,
 * 기준이 없는 "제한 없음"만 undefined다.
 */
export const COURSE_BUDGET_OPTIONS: {
  tier: CourseBudgetTier;
  label: string;
  amount?: number;
}[] = [
  { tier: "NONE", label: "무지출", amount: 0 },
  { tier: "UNDER_10K", label: "1만원", amount: 10_000 },
  { tier: "UNDER_30K", label: "3만원", amount: 30_000 },
  { tier: "UNDER_50K", label: "5만원", amount: 50_000 },
  { tier: "UNLIMITED", label: "제한 없음" },
];

export const COURSE_BUDGET_LABEL: Record<CourseBudgetTier, string> = Object.fromEntries(
  COURSE_BUDGET_OPTIONS.map(({ tier, label }) => [tier, label]),
) as Record<CourseBudgetTier, string>;

export function courseBudgetAmount(tier: CourseBudgetTier): number | undefined {
  return COURSE_BUDGET_OPTIONS.find((o) => o.tier === tier)?.amount;
}

// 서버 검증과 같은 값. 초과분은 입력 단계에서 막고 서버는 최종 방어선이다.
export const COURSE_INCLUDE_SPOTS_MAX = 5;
export const COURSE_PLACE_NAME_MAX = 50;

/** 채팅 코스 생성 제한 — 백엔드 설정값과 같아야 한다 */
export const CHAT_DAILY_LIMIT = 3;
export const CHAT_TURNS_PER_CONVERSATION = 10;
