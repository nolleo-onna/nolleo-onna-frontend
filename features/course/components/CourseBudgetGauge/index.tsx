"use client";

import { PiggyBank, TriangleAlert } from "lucide-react";

interface CourseBudgetGaugeProps {
  /** 사용자가 설정한 예산(원). 0이면 무지출 목표. */
  budget: number;
  /** 코스 전체 예상 비용(원) */
  totalCost: number;
}

function formatWon(won: number): string {
  if (won >= 10_000) {
    const man = won / 10_000;
    return `${Number.isInteger(man) ? man : man.toFixed(1)}만원`;
  }
  return `${won.toLocaleString()}원`;
}

export default function CourseBudgetGauge({
  budget,
  totalCost,
}: CourseBudgetGaugeProps) {
  const isOver = totalCost > budget;
  // 무지출(예산 0) 달성 시 게이지를 가득 찬 성공 상태로 보여준다.
  const percent =
    budget === 0 ? 100 : Math.min(100, Math.round((totalCost / budget) * 100));
  const overAmount = totalCost - budget;

  return (
    <div
      className={`mb-5 rounded-xl border px-3.5 py-3 ${
        isOver ? "border-pink-200 bg-pink-50/60" : "border-lime-200 bg-lime-50/60"
      }`}
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-[12px] font-semibold text-gray-700">
          {isOver ? (
            <TriangleAlert className="h-3.5 w-3.5 text-pink-500" />
          ) : (
            <PiggyBank className="h-3.5 w-3.5 text-[#3B6D11]" />
          )}
          {budget === 0 ? "무지출 도전" : `예산 ${formatWon(budget)}`}
        </span>
        <span
          className={`text-[12px] font-bold ${
            isOver ? "text-pink-600" : "text-[#3B6D11]"
          }`}
        >
          {formatWon(totalCost)} 사용
        </span>
      </div>

      <div
        className="h-2 overflow-hidden rounded-full bg-white"
        role="progressbar"
        aria-valuenow={totalCost}
        aria-valuemin={0}
        aria-valuemax={Math.max(budget, totalCost)}
        aria-label="예산 사용량"
      >
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${
            isOver ? "bg-pink-400" : "bg-lime-400"
          }`}
          style={{ width: `${percent}%` }}
        />
      </div>

      <p
        className={`mt-1.5 text-[11px] ${
          isOver ? "text-pink-600" : "text-gray-500"
        }`}
      >
        {isOver
          ? `예산보다 ${formatWon(overAmount)} 초과했어요`
          : budget === 0
            ? totalCost === 0
              ? "한 푼도 안 쓰는 코스예요!"
              : ""
            : `${formatWon(budget - totalCost)} 남았어요`}
      </p>
    </div>
  );
}
