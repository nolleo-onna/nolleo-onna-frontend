"use client";

import { Check, MessageCircle, Route } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/features/subscription/hooks/useSubscription";
import { PLAN_LIST, type Plan } from "@/features/subscription/plans";

function formatPrice(price: number) {
  return price === 0 ? "무료" : `월 ${price.toLocaleString()}원`;
}

function limitLabel(value: number | null, unit: string) {
  return value === null ? `${unit} 무제한` : `${unit} 하루 ${value}회`;
}

export default function PlanCards() {
  const { user } = useAuth();
  const { planId, changePlan, usage, plan } = useSubscription(user?.userId);

  return (
    <div>
      {/* 오늘 사용량 요약 */}
      <div className="mx-auto flex max-w-md items-center justify-center gap-6 rounded-2xl border border-gray-100 bg-white px-6 py-4">
        <span className="flex items-center gap-1.5 text-sm text-gray-600">
          <Route className="h-4 w-4 text-ocean-500" />
          오늘 코스 생성{" "}
          <b className="tabular-nums text-navy-900">
            {usage.course}
            {plan.limits.course !== null && ` / ${plan.limits.course}`}회
          </b>
        </span>
        <span className="h-4 w-px bg-gray-200" />
        <span className="flex items-center gap-1.5 text-sm text-gray-600">
          <MessageCircle className="h-4 w-4 text-ocean-500" />
          AI 채팅{" "}
          <b className="tabular-nums text-navy-900">
            {usage.chat}
            {plan.limits.chat !== null && ` / ${plan.limits.chat}`}회
          </b>
        </span>
      </div>

      {/* 플랜 카드 */}
      <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">
        {PLAN_LIST.map((p: Plan) => {
          const isCurrent = p.id === planId;
          return (
            <div
              key={p.id}
              className={`relative flex flex-col rounded-[28px] border bg-white p-7 transition-all duration-300 ${
                p.highlighted
                  ? "border-ocean-300 shadow-[0_20px_40px_-16px_rgba(10,132,255,0.25)]"
                  : "border-gray-100"
              }`}
            >
              {p.highlighted && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-ocean-500 px-3 py-1 text-[11px] font-bold text-white">
                  가장 인기
                </span>
              )}

              <p className="text-sm font-bold uppercase tracking-widest text-ocean-600">
                {p.name}
              </p>
              <p className="mt-2 text-2xl font-bold text-navy-900">
                {formatPrice(p.price)}
              </p>
              <p className="mt-1 text-sm text-gray-500">{p.tagline}</p>

              <div className="mt-4 flex flex-col gap-1 rounded-2xl bg-gray-50 px-4 py-3 text-sm font-semibold text-navy-900">
                <span>{limitLabel(p.limits.course, "코스 생성")}</span>
                <span>{limitLabel(p.limits.chat, "AI 채팅")}</span>
              </div>

              <ul className="mt-4 flex flex-1 flex-col gap-2">
                {p.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-gray-600">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-lime-500" />
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                type="button"
                disabled={isCurrent}
                onClick={() => changePlan(p.id)}
                className={`mt-6 rounded-full py-3 text-sm font-semibold transition-all active:scale-95 ${
                  isCurrent
                    ? "cursor-default bg-gray-100 text-gray-400"
                    : p.highlighted
                      ? "bg-ocean-500 text-white hover:bg-ocean-600"
                      : "border border-navy-900 text-navy-900 hover:bg-navy-900 hover:text-white"
                }`}
              >
                {isCurrent ? "현재 이용 중" : `${p.name}로 변경`}
              </button>
            </div>
          );
        })}
      </div>

      <p className="mt-6 text-center text-[11px] leading-relaxed text-gray-400">
        본 서비스는 공모전 출품용 데모라 결제 없이 플랜이 바로 적용되며, 설정은
        사용 중인 브라우저에 저장돼요. 사용 횟수는 매일 자정에 초기화됩니다.
      </p>
    </div>
  );
}
