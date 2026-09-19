import { Suspense } from "react";
import { RotateCcw } from "lucide-react";

import ActiveFilterSummary from "./ActiveFilterSummary";
import BudgetFilter from "./BudgetFilter";
import CategoryFilter from "./CategoryFilter";
import RegionFilter from "./RegionFilter";
import TodayWeatherCard from "./TodayWeatherCard";

interface SpotFilterSidebarProps {
  onSelectRegion: (region: string | null) => void;
}

const CARD = "rounded-2xl bg-white px-4 py-4 shadow-[0_2px_10px_-4px_rgba(13,48,128,0.18)]";

/**
 * 스팟 왼쪽 필터 사이드바.
 * 한 장의 흰 판에 구분선으로 나누던 것을, 회색 바탕 위에 흰 카드를 얹는 모양으로 바꿨다 —
 * 지도 옆에 패널이 떠 있는 느낌이라 덜 답답하다. 고른 값은 하늘색으로 표시한다.
 */
export default function SpotFilterSidebar({ onSelectRegion }: SpotFilterSidebarProps) {
  return (
    <aside className="scrollbar-hide h-full overflow-y-auto border-r border-gray-100 bg-gray-50 px-3 py-4">
      <div className="px-2 pb-3">
        <h2 className="text-xl font-bold leading-tight tracking-tight text-gray-900">
          부산 어디로<br />
          <span className="text-ocean-500">놀러갈래?</span>
        </h2>
      </div>

      {/* 오늘 날씨 — 지역을 고르면 그 구의 날씨로 바뀐다 */}
      <div className="mb-3">
        {/* useSearchParams(지역 필터 읽기)를 쓰므로 Suspense 필요 */}
        <Suspense fallback={<div className="animate-shimmer h-[92px] rounded-2xl" />}>
          <TodayWeatherCard />
        </Suspense>
      </div>

      {/* 지금 걸린 필터 — 칩의 ×로 하나씩 뺀다. 고른 게 없으면 통째로 사라진다 */}
      <Suspense>
        <div className="mb-3 overflow-hidden rounded-2xl bg-white shadow-[0_2px_10px_-4px_rgba(13,48,128,0.18)] empty:hidden [&>div]:border-0 [&>div]:px-4 [&>div]:py-3.5">
          <ActiveFilterSummary />
        </div>
      </Suspense>

      <Suspense>
        <div className={`mb-3 ${CARD}`}>
          <RegionFilter onSelectRegion={onSelectRegion} />
        </div>
        <div className={`mb-3 ${CARD}`}>
          <CategoryFilter />
        </div>
        <div className={`mb-3 ${CARD}`}>
          <BudgetFilter />
        </div>
      </Suspense>

      <a
        href="?"
        className="flex w-full items-center justify-center gap-1.5 rounded-2xl bg-white py-3 text-sm font-semibold text-gray-500 shadow-[0_2px_10px_-4px_rgba(13,48,128,0.18)] transition-colors hover:text-ocean-600"
      >
        <RotateCcw className="h-3.5 w-3.5" />
        필터 초기화
      </a>
    </aside>
  );
}
