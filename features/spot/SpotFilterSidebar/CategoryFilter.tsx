"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { Check } from "lucide-react";
import { CATEGORIES } from "@/features/spot/constants/categoryMap";

interface CategoryFilterProps {
  /** 바깥에서 이미 제목을 보여줄 때 */
  hideHeading?: boolean;
}

export default function CategoryFilter({ hideHeading = false }: CategoryFilterProps) {
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
      {!hideHeading && (
        <div className="mb-3">
          <span className="text-xs font-bold tracking-widest text-gray-900 uppercase">카테고리</span>
        </div>
      )}
      {/* 체크박스 목록이 밋밋해서, 분류 색을 쓰는 타일로 바꿨다 — 고른 것이 색으로 바로 보인다 */}
      <ul className="grid grid-cols-2 gap-2">
        {CATEGORIES.map(({ id, label, emoji, color }) => {
          const checked = selected.includes(id);
          return (
            <li key={id}>
              <button
                onClick={() => toggle(id)}
                aria-pressed={checked}
                className={`flex w-full items-center gap-1.5 rounded-xl px-2 py-2 text-left transition-all ${
                  checked
                    ? "text-white shadow-[0_6px_16px_-8px_rgba(5,12,26,0.6)]"
                    : "bg-gray-50 text-gray-600 ring-1 ring-inset ring-gray-100 hover:bg-gray-100"
                }`}
                style={checked ? { backgroundColor: color } : undefined}
              >
                <span
                  aria-hidden
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-[13px] ${
                    checked ? "bg-white/20" : "bg-white"
                  }`}
                >
                  {emoji}
                </span>
                <span className="min-w-0 flex-1 text-[12px] leading-tight font-semibold tracking-tight break-keep">
                  {label}
                </span>
                {checked && <Check size={12} strokeWidth={3} className="shrink-0" />}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
