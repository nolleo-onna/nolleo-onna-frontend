import { Suspense } from "react";
import { MapPin } from "lucide-react";

import BudgetFilter from "./BudgetFilter";
import CategoryFilter from "./CategoryFilter";
import OptionFilter from "./OptionFilter";
import RegionFilter from "./RegionFilter";

interface SpotFilterSidebarProps {
  onSelectRegion: (region: string | null) => void;
}

export default function SpotFilterSidebar({ onSelectRegion }: SpotFilterSidebarProps) {
  return (
    <aside className="scrollbar-hide h-full overflow-y-auto border-r border-gray-100 bg-white">
      {/* 헤더 */}
      <div className="px-5 pb-5 pt-6">
        <div className="mb-2 inline-flex items-center gap-1 rounded-full bg-navy-50 px-2 py-0.5 text-[11px] font-semibold text-navy-400">
          <MapPin size={10} />
          TODAY IN BUSAN
        </div>
        <h2 className="text-xl font-bold leading-tight tracking-tight text-gray-900">
          부산 어디로<br />
          <span className="text-navy-400">놀러갈래?</span>
        </h2>
        <p className="mt-2 flex items-center gap-1 text-xs text-gray-400">
          <span>🌤️</span>
          맑음 18° · 바람 약함
        </p>
      </div>

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
        <div className="border-t border-gray-100 px-5 py-5">
          <OptionFilter />
        </div>
      </Suspense>

      {/* 초기화 버튼 */}
      <div className="border-t border-gray-100 px-5 py-4">
	    <a
          href="?"
          className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M1 4v6h6M23 20v-6h-6"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            />
            <path
              d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4-4.64 4.36A9 9 0 0 1 3.51 15"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            />
          </svg>
          필터 초기화
        </a>
      </div>
    </aside>
  );
}