"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import Chip from "@/components/ui/Chip";

const PRESETS = [
  { label: "제한 없음", value: 0 },
  { label: "3만원", value: 30000 },
  { label: "5만원", value: 50000 },
  { label: "10만원", value: 100000 },
  { label: "15만원", value: 150000 },
  { label: "20만원", value: 200000 },
];

const MAX = 200000;

function formatBudget(value: number) {
  if (value === 0) return "제한 없음";
  if (value >= 10000) return `${Math.round(value / 10000)}만원`;
  return `${value.toLocaleString()}원`;
}

export default function BudgetFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialBudget = Number(searchParams.get("budget") ?? 0);
  const [budget, setBudget] = useState(initialBudget);

  const commit = useCallback(
    (value: number) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === 0) {
        params.delete("budget");
      } else {
        params.set("budget", String(value));
      }
      router.replace(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );

  const handleSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Number(e.target.value);
    setBudget(v);
    commit(v);
  };

  const handlePreset = (value: number) => {
    setBudget(value);
    commit(value);
  };

  const pct = Math.round((budget / MAX) * 100);
  const sliderBg = `linear-gradient(to right, #3d68d9 ${pct}%, #e5e7eb ${pct}%)`;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-bold tracking-widest text-gray-900 uppercase">예산</span>
      </div>

      <div className="mb-1">
        <input
          type="range"
          min={0}
          max={MAX}
          step={5000}
          value={budget}
          onChange={handleSlider}
          style={{ background: sliderBg }}
          className="
            h-[3px] w-full cursor-pointer appearance-none rounded-full outline-none
            [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4
            [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-[2px]
            [&::-webkit-slider-thumb]:border-navy-400 [&::-webkit-slider-thumb]:bg-white
            [&::-webkit-slider-thumb]:shadow-[0_1px_4px_rgba(61,104,217,0.3)]
          "
        />
      </div>

      <div className="mb-3.5 text-right text-xs text-gray-500">
        최대 <span className="font-bold text-navy-400">{formatBudget(budget)}</span>
      </div>

      <div className="grid grid-cols-3 gap-1.5">
        {PRESETS.map(({ label, value }) => (
          <Chip
            key={value}
            size="sm"
            onClick={() => handlePreset(value)}
            className={`w-full justify-center ${
              budget === value
                ? "border-navy-200 bg-navy-50 text-navy-400"
                : ""
            }`}
          >
            {label}
          </Chip>
        ))}
      </div>
    </div>
  );
}