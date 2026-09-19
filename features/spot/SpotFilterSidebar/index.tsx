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

export default function SpotFilterSidebar({ onSelectRegion }: SpotFilterSidebarProps) {
  return (
    <aside className="scrollbar-hide h-full overflow-y-auto border-r border-gray-100 bg-white">
      {/* 헤더 — 제목 아래 오늘 날씨 카드 */}
      <div className="px-5 pb-5 pt-6">
        <h2 className="text-xl font-bold leading-tight tracking-tight text-gray-900">
          부산 어디로<br />
          <span className="text-navy-400">놀러갈래?</span>
        </h2>
        <p className="mt-1.5 text-[12px] text-gray-400">지역 · 카테고리 · 예산으로 좁혀 보세요</p>

        <div className="mt-4">
          {/* useSearchParams(지역 필터 읽기)를 쓰므로 Suspense 필요 */}
          <Suspense fallback={<div className="animate-shimmer h-[92px] rounded-2xl" />}>
            <TodayWeatherCard />
          </Suspense>
        </div>
      </div>

      {/* 지금 걸린 필터 — 하나씩 뺄 수 있다 */}
      <Suspense>
        <ActiveFilterSummary />
      </Suspense>

      {/* 필터 목록 */}
      <Suspense>
        <div className="border-t border-gray-100 px-5 py-5">
          <RegionFilter onSelectRegion={onSelectRegion} />
        </div>
        <div className="border-t border-gray-100 px-5 py-5">
          <CategoryFilter />
        </div>
        <div className="border-t border-gray-100 px-5 py-5">
          <BudgetFilter />
        </div>
      </Suspense>

      {/* 초기화 버튼 */}
      <div className="border-t border-gray-100 px-5 py-4">
        <a
          href="?"
          className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          필터 초기화
        </a>
      </div>
    </aside>
  );
}
