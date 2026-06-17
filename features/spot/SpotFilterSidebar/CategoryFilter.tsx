"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { Check } from "lucide-react";

export const CATEGORIES = [
  { id: "food",    label: "맛집 · 카페",  emoji: "🍽️", codes: ["FD01", "FD02", "FD03", "FD05"] },
  { id: "nature",  label: "자연 · 해변",  emoji: "🌊", codes: ["NA01", "NA02", "NA03", "NA04", "NA05"] },
  { id: "culture", label: "관광 · 문화",  emoji: "🏛️", codes: ["VE01", "VE02", "VE03", "VE04", "VE05", "VE06", "VE07", "VE09", "VE10", "VE12", "HS01", "HS02", "HS03"] },
  { id: "leisure", label: "체험 · 레저",  emoji: "🎢", codes: ["EX02", "EX03", "EX05", "EX06", "EX07", "LS01", "LS02", "LS04"] },
  { id: "camping", label: "캠핑",         emoji: "🏕️", codes: ["AC05"] },
];

export default function CategoryFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selected = searchParams.getAll("category");

  const toggle = useCallback(
    (id: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("category");

      const next = selected.includes(id)
        ? selected.filter((c) => c !== id)
        : [...selected, id];

      next.forEach((c) => params.append("category", c));
      router.replace(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams, selected],
  );

  return (
    <div>
      <div className="mb-3.5">
        <span className="text-xs font-bold tracking-widest text-gray-900 uppercase">카테고리</span>
      </div>
      <ul className="flex flex-col gap-0.5">
        {CATEGORIES.map(({ id, label, emoji }) => {
          const checked = selected.includes(id);
          return (
            <li key={id}>
              <button
                onClick={() => toggle(id)}
                className="flex w-full items-center gap-2.5 rounded-lg px-1 py-2 transition-colors hover:bg-gray-50"
              >
                <span className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[5px] border-[1.5px] transition-all ${
                  checked ? "border-navy-400 bg-navy-400" : "border-gray-300 bg-white"
                }`}>
                  {checked && <Check size={10} stroke="white" strokeWidth={2.5} />}
                </span>
                <span className="text-[15px]" aria-hidden="true">{emoji}</span>
                <span className={`text-sm font-medium tracking-tight ${checked ? "text-gray-900" : "text-gray-600"}`}>
                  {label}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}