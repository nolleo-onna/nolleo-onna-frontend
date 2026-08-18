"use client";

import { useCallback, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import {
  DEFAULT_PLAN_ID,
  PLANS,
  isPlanId,
  type Plan,
  type PlanId,
} from "@/features/subscription/plans";

export type UsageType = "course" | "chat";

interface DailyUsage {
  course: number;
  chat: number;
}

// 백엔드에 구독/사용량 API가 아직 없어서 localStorage에 계정별로 저장한다
// (공모전 데모용 — 실제 과금·차단은 서버에서만 강제할 수 있음).
// 서버 API가 생기면 이 훅의 저장/조회부만 교체하면 화면 코드는 그대로 쓸 수 있다.
const planKey = (userKey: string) => `subscription:plan:${userKey}`;
const usageKey = (userKey: string, day: string) => `usage:${userKey}:${day}`;

function todayString() {
  const now = new Date();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${mm}-${dd}`;
}

function readUsage(userKey: string, day: string): DailyUsage {
  try {
    const raw = localStorage.getItem(usageKey(userKey, day));
    const parsed = raw ? (JSON.parse(raw) as Partial<DailyUsage>) : {};
    return { course: parsed.course ?? 0, chat: parsed.chat ?? 0 };
  } catch {
    return { course: 0, chat: 0 };
  }
}

export interface Subscription {
  plan: Plan;
  planId: PlanId;
  /** 데모용 즉시 플랜 변경 (결제 없음) */
  changePlan: (planId: PlanId) => void;
  /** 오늘 사용량 */
  usage: DailyUsage;
  /** 남은 횟수. 무제한이면 null */
  remaining: (type: UsageType) => number | null;
  canUse: (type: UsageType) => boolean;
  /** 사용 1회 기록 */
  consume: (type: UsageType) => void;
}

export function useSubscription(userId: number | undefined): Subscription {
  const queryClient = useQueryClient();
  // 비로그인 상태도 채팅 진입 전 화면이 있어 guest 키로 동작하게 한다
  const userKey = userId !== undefined ? String(userId) : "guest";
  const day = todayString();

  const { data: planId } = useQuery<PlanId>({
    queryKey: ["subscription", "plan", userKey],
    staleTime: Infinity,
    queryFn: () => {
      const stored = localStorage.getItem(planKey(userKey));
      return isPlanId(stored) ? stored : DEFAULT_PLAN_ID;
    },
  });

  // 날짜가 키에 포함돼 있어 자정이 지나면 자동으로 0부터 시작한다
  const { data: usage } = useQuery<DailyUsage>({
    queryKey: ["subscription", "usage", userKey, day],
    staleTime: Infinity,
    queryFn: () => readUsage(userKey, day),
  });

  const resolvedPlanId = planId ?? DEFAULT_PLAN_ID;
  const plan = PLANS[resolvedPlanId];
  const resolvedUsage = useMemo(
    () => usage ?? { course: 0, chat: 0 },
    [usage],
  );

  const changePlan = useCallback(
    (next: PlanId) => {
      localStorage.setItem(planKey(userKey), next);
      queryClient.setQueryData(["subscription", "plan", userKey], next);
    },
    [queryClient, userKey],
  );

  const remaining = useCallback(
    (type: UsageType): number | null => {
      const limit = plan.limits[type];
      if (limit === null) return null;
      return Math.max(0, limit - resolvedUsage[type]);
    },
    [plan, resolvedUsage],
  );

  const canUse = useCallback(
    (type: UsageType) => {
      const left = remaining(type);
      return left === null || left > 0;
    },
    [remaining],
  );

  const consume = useCallback(
    (type: UsageType) => {
      // 렌더 간 stale 값을 덮어쓰지 않게 저장소에서 다시 읽고 +1
      const fresh = readUsage(userKey, day);
      const next = { ...fresh, [type]: fresh[type] + 1 };
      localStorage.setItem(usageKey(userKey, day), JSON.stringify(next));
      queryClient.setQueryData(["subscription", "usage", userKey, day], next);
    },
    [queryClient, userKey, day],
  );

  return {
    plan,
    planId: resolvedPlanId,
    changePlan,
    usage: resolvedUsage,
    remaining,
    canUse,
    consume,
  };
}
