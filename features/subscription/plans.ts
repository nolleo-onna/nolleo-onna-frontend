export type PlanId = "free" | "pro" | "max";

/** 하루 사용 한도. null이면 무제한 */
export interface PlanLimits {
  /** 하루 코스 생성 횟수 */
  course: number | null;
  /** 하루 AI 채팅 메시지 횟수 */
  chat: number | null;
}

export interface Plan {
  id: PlanId;
  name: string;
  /** 월 요금(원). 0이면 무료 */
  price: number;
  tagline: string;
  limits: PlanLimits;
  features: string[];
  /** 요금제 카드에서 강조 표시할지 */
  highlighted?: boolean;
}

// 한도 수치는 서비스 정책값 — 백엔드 구독 API가 생기면 서버가 내려주는
// 값으로 대체하고, 이 파일은 표시용 메타(이름/문구)만 남긴다.
export const PLANS: Record<PlanId, Plan> = {
  free: {
    id: "free",
    name: "Free",
    price: 0,
    tagline: "부산 여행 계획, 가볍게 시작하기",
    limits: { course: 3, chat: 20 },
    features: [
      "AI 코스 생성 하루 3회",
      "AI 채팅 하루 20회",
      "스팟 탐색·혼잡도·날씨 무제한",
      "한끗 정보 무제한",
    ],
  },
  pro: {
    id: "pro",
    name: "Pro",
    price: 4900,
    tagline: "매주 부산을 즐기는 당신에게",
    limits: { course: 10, chat: 100 },
    features: [
      "AI 코스 생성 하루 10회",
      "AI 채팅 하루 100회",
      "Free 플랜의 모든 기능",
    ],
    highlighted: true,
  },
  max: {
    id: "max",
    name: "Max",
    price: 9900,
    tagline: "한도 걱정 없이, 마음껏",
    limits: { course: null, chat: null },
    features: [
      "AI 코스 생성 무제한",
      "AI 채팅 무제한",
      "Pro 플랜의 모든 기능",
    ],
  },
};

export const PLAN_LIST: Plan[] = [PLANS.free, PLANS.pro, PLANS.max];

export const DEFAULT_PLAN_ID: PlanId = "free";

export function isPlanId(value: string | null): value is PlanId {
  return value !== null && value in PLANS;
}
