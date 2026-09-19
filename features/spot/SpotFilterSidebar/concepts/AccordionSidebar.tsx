"use client";

import { Suspense, useState } from "react";
import { ChevronDown, RotateCcw } from "lucide-react";
import { useSearchParams } from "next/navigation";

import ActiveFilterSummary from "../ActiveFilterSummary";
import BudgetFilter from "../BudgetFilter";
import CategoryFilter from "../CategoryFilter";
import RegionFilter from "../RegionFilter";
import TodayWeatherCard from "../TodayWeatherCard";

type SectionKey = "region" | "category" | "budget";

interface Props {
  onSelectRegion: (region: string | null) => void;
}

function Section({
  title,
  summary,
  isOpen,
  onToggle,
  children,
}: {
  title: string;
  summary: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border-t border-gray-100">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between px-5 py-3.5 text-left transition-colors hover:bg-gray-50"
      >
        <span className="text-[13px] font-bold text-gray-900">{title}</span>
        <span className="flex items-center gap-1.5">
          <span className="max-w-[110px] truncate text-[12px] text-gray-400">{summary}</span>
          <ChevronDown className={`h-4 w-4 text-gray-300 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </span>
      </button>
      {isOpen && <div className="px-5 pb-5">{children}</div>}
    </div>
  );
}

/**
 * 시안 A · 접었다 펴는 사이드바
 * 세 필터를 한꺼번에 펼쳐 두지 않고, 쓰는 것만 편다. 접힌 줄에는 고른 값이 요약으로 보인다.
 * 세로가 짧아져서 스크롤 없이 한 화면에 들어온다.
 */
export default function AccordionSidebar({ onSelectRegion }: Props) {
  const searchParams = useSearchParams();
  const region = searchParams.get("region");
  const categories = searchParams.getAll("category");
  const budget = Number(searchParams.get("budget") ?? 0);
  const [open, setOpen] = useState<SectionKey | null>("region");

  const toggle = (key: SectionKey) => setOpen((prev) => (prev === key ? null : key));

  return (
    <aside className="scrollbar-hide h-full overflow-y-auto border-r border-gray-100 bg-white">
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

      <Section
        title="지역 · 구"
        summary={region ?? "전체"}
        isOpen={open === "region"}
        onToggle={() => toggle("region")}
      >
        <RegionFilter onSelectRegion={onSelectRegion} hideHeading />
      </Section>

      <Section
        title="카테고리"
        summary={categories.length > 0 ? `${categories.length}개 선택` : "전체"}
        isOpen={open === "category"}
        onToggle={() => toggle("category")}
      >
        <CategoryFilter hideHeading />
      </Section>

      <Section
        title="예산"
        summary={budget > 0 ? `${Math.round(budget / 10000)}만원 이하` : "제한 없음"}
        isOpen={open === "budget"}
        onToggle={() => toggle("budget")}
      >
        <BudgetFilter hideHeading />
      </Section>

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
