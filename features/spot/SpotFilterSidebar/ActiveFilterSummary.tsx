"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { X } from "lucide-react";

import { CATEGORY_META } from "@/features/spot/constants/categoryMap";

const formatBudget = (value: number) => (value >= 10000 ? `${Math.round(value / 10000)}만원 이하` : `${value.toLocaleString()}원 이하`);

/**
 * 지금 걸린 필터를 사이드바 위쪽에 칩으로 모아 보여준다.
 * 예전엔 고른 값이 각 섹션 안에만 있어서 "지금 뭘로 보고 있는지" 한눈에 알기 어려웠고,
 * 하나만 빼려면 그 섹션까지 내려가야 했다. 칩의 ×로 바로 뺀다.
 */
export default function ActiveFilterSummary() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const region = searchParams.get("region");
  const categories = searchParams.getAll("category");
  const budget = Number(searchParams.get("budget") ?? 0);

  const chips: { key: string; label: string; onRemove: () => void }[] = [];

  const replace = (params: URLSearchParams) => {
    const query = params.toString();
    router.replace(query ? `?${query}` : "?", { scroll: false });
  };

  if (region) {
    chips.push({
      key: `region-${region}`,
      label: region,
      onRemove: () => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete("region");
        replace(params);
      },
    });
  }

  categories.forEach((id) => {
    const meta = CATEGORY_META[id as keyof typeof CATEGORY_META];
    chips.push({
      key: `category-${id}`,
      label: meta ? `${meta.emoji} ${meta.label}` : id,
      onRemove: () => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete("category");
        categories.filter((c) => c !== id).forEach((c) => params.append("category", c));
        replace(params);
      },
    });
  });

  if (budget > 0) {
    chips.push({
      key: "budget",
      label: formatBudget(budget),
      onRemove: () => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete("budget");
        replace(params);
      },
    });
  }

  if (chips.length === 0) return null;

  return (
    <div className="border-t border-gray-100 px-5 py-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[11px] font-bold tracking-widest text-gray-500 uppercase">고른 조건 {chips.length}</span>
        <button
          type="button"
          onClick={() => router.replace("?", { scroll: false })}
          className="text-[12px] font-semibold text-gray-400 transition-colors hover:text-gray-700"
        >
          모두 지우기
        </button>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {chips.map((chip) => (
          <button
            key={chip.key}
            type="button"
            onClick={chip.onRemove}
            aria-label={`${chip.label} 빼기`}
            className="inline-flex max-w-full items-center gap-1 rounded-full bg-ocean-50 py-1 pl-2.5 pr-1.5 text-[12px] font-semibold text-ocean-700 transition-colors hover:bg-ocean-100"
          >
            <span className="truncate">{chip.label}</span>
            <X className="h-3 w-3 shrink-0 text-ocean-400" strokeWidth={2.5} />
          </button>
        ))}
      </div>
    </div>
  );
}
