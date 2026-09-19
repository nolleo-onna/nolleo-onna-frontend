"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { MapPin, Tags, Wallet } from "lucide-react";

import ActiveFilterSummary from "../ActiveFilterSummary";
import BudgetFilter from "../BudgetFilter";
import CategoryFilter from "../CategoryFilter";
import RegionFilter from "../RegionFilter";
import TodayWeatherCard from "../TodayWeatherCard";

type TabKey = "region" | "category" | "budget";

const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: "region", label: "지역", icon: <MapPin className="h-3.5 w-3.5" /> },
  { key: "category", label: "카테고리", icon: <Tags className="h-3.5 w-3.5" /> },
  { key: "budget", label: "예산", icon: <Wallet className="h-3.5 w-3.5" /> },
];

interface Props {
  onSelectRegion: (region: string | null) => void;
}

/**
 * 시안 B · 탭으로 나눈 사이드바
 * 세 필터를 위 탭으로 갈라 한 번에 하나만 보여준다. 스크롤이 아예 없어지고,
 * 탭에 고른 개수가 점으로 표시돼 어디에 조건이 걸렸는지 바로 보인다.
 */
export default function TabbedSidebar({ onSelectRegion }: Props) {
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<TabKey>("region");

  const marks: Record<TabKey, boolean> = {
    region: !!searchParams.get("region"),
    category: searchParams.getAll("category").length > 0,
    budget: Number(searchParams.get("budget") ?? 0) > 0,
  };

  return (
    <aside className="flex h-full flex-col border-r border-gray-100 bg-white">
      <div className="px-5 pb-4 pt-6">
        <h2 className="text-xl font-bold leading-tight tracking-tight text-gray-900">
          부산 어디로<br />
          <span className="text-navy-400">놀러갈래?</span>
        </h2>
        <div className="mt-4">
          <Suspense fallback={<div className="animate-shimmer h-[92px] rounded-2xl" />}>
            <TodayWeatherCard />
          </Suspense>
        </div>
      </div>

      <Suspense>
        <ActiveFilterSummary />
      </Suspense>

      {/* 탭 — 고른 조건이 있는 탭엔 점을 찍는다 */}
      <div className="border-t border-gray-100 px-4 pt-3">
        <div className="flex gap-1 rounded-xl bg-gray-50 p-1">
          {TABS.map(({ key, label, icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              aria-pressed={tab === key}
              className={`relative flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-[12px] font-semibold transition-colors ${
                tab === key ? "bg-white text-navy-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {icon}
              {label}
              {marks[key] && <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-ocean-500" />}
            </button>
          ))}
        </div>
      </div>

      <div className="scrollbar-hide flex-1 overflow-y-auto px-5 py-5">
        <Suspense>
          {tab === "region" && <RegionFilter onSelectRegion={onSelectRegion} hideHeading />}
          {tab === "category" && <CategoryFilter hideHeading />}
          {tab === "budget" && <BudgetFilter hideHeading />}
        </Suspense>
      </div>
    </aside>
  );
}
