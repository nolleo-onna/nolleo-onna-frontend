"use client";

import { Suspense } from "react";
import { RotateCcw } from "lucide-react";

import ActiveFilterSummary from "../ActiveFilterSummary";
import BudgetFilter from "../BudgetFilter";
import CategoryFilter from "../CategoryFilter";
import RegionFilter from "../RegionFilter";
import TodayWeatherCard from "../TodayWeatherCard";

interface Props {
  onSelectRegion: (region: string | null) => void;
}

/**
 * 시안 C · 떠 있는 카드
 * 한 장의 흰 판에 구분선으로 나누던 것을, 회색 바탕 위에 흰 카드 여러 장을 얹는 모양으로 바꾼다.
 * 지도 위에 패널이 떠 있는 느낌이라 사이드바가 지도와 한 화면에서 덜 답답하다.
 */
export default function FloatingCardSidebar({ onSelectRegion }: Props) {
  return (
    <aside className="scrollbar-hide h-full overflow-y-auto border-r border-gray-100 bg-gray-50 px-3 py-4">
      <div className="px-2 pb-3">
        <h2 className="text-xl font-bold leading-tight tracking-tight text-gray-900">
          부산 어디로<br />
          <span className="text-navy-400">놀러갈래?</span>
        </h2>
      </div>

      <div className="mb-3">
        <Suspense fallback={<div className="animate-shimmer h-[92px] rounded-2xl" />}>
          <TodayWeatherCard />
        </Suspense>
      </div>

      {/* 고른 조건 — 카드 안에 넣어 다른 카드와 같은 결로 */}
      <Suspense>
        <div className="mb-3 overflow-hidden rounded-2xl bg-white shadow-[0_2px_10px_-4px_rgba(13,48,128,0.18)] empty:hidden [&>div]:border-0 [&>div]:px-4 [&>div]:py-3.5">
          <ActiveFilterSummary />
        </div>
      </Suspense>

      <Suspense>
        <div className="mb-3 rounded-2xl bg-white px-4 py-4 shadow-[0_2px_10px_-4px_rgba(13,48,128,0.18)]">
          <RegionFilter onSelectRegion={onSelectRegion} />
        </div>
        <div className="mb-3 rounded-2xl bg-white px-4 py-4 shadow-[0_2px_10px_-4px_rgba(13,48,128,0.18)]">
          <CategoryFilter />
        </div>
        <div className="mb-3 rounded-2xl bg-white px-4 py-4 shadow-[0_2px_10px_-4px_rgba(13,48,128,0.18)]">
          <BudgetFilter />
        </div>
      </Suspense>

      <a
        href="?"
        className="flex w-full items-center justify-center gap-1.5 rounded-2xl bg-white py-3 text-sm font-semibold text-gray-500 shadow-[0_2px_10px_-4px_rgba(13,48,128,0.18)] transition-colors hover:text-gray-700"
      >
        <RotateCcw className="h-3.5 w-3.5" />
        필터 초기화
      </a>
    </aside>
  );
}
