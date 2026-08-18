"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import Chip from "@/components/ui/Chip";

const REGIONS = [
  "강서구", "금정구", "기장군", "남구",
  "동구", "동래구", "부산진구", "북구",
  "사상구", "사하구", "서구", "수영구",
  "연제구", "영도구", "중구", "해운대구",
];

interface RegionFilterProps {
  onSelectRegion: (region: string | null) => void;
}

export default function RegionFilter({ onSelectRegion }: RegionFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selected = searchParams.get("region");

  const updateParams = useCallback(
    (next: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (next) {
        params.set("region", next);
      } else {
        params.delete("region");
      }
      router.replace(`?${params.toString()}`, { scroll: false });
      onSelectRegion(next);
    },
    [router, searchParams, onSelectRegion],
  );

  const toggle = useCallback(
    (region: string) => {
      updateParams(selected === region ? null : region);
    },
    [selected, updateParams],
  );

  return (
    <div>
      <div className="mb-3.5 flex items-center justify-between">
        <span className="text-xs font-bold tracking-widest text-gray-900 uppercase">지역 · 구</span>
        {selected && (
          <button
            onClick={() => updateParams(null)}
            className="text-xs text-gray-400 underline-offset-2 hover:text-gray-600 hover:underline"
          >
            초기화
          </button>
        )}
      </div>
      <div className="grid grid-cols-3 gap-1.5">
        <Chip
          size="sm"
          onClick={() => updateParams(null)}
          className={`w-full justify-center ${!selected ? "border-navy-300 bg-navy-300 text-white" : ""}`}
        >
          전체
        </Chip>
        {REGIONS.map((region) => (
          <Chip
            key={region}
            size="sm"
            onClick={() => toggle(region)}
            className={`w-full justify-center ${
              selected === region ? "border-navy-300 bg-navy-300 text-white" : ""
            }`}
          >
            {region}
          </Chip>
        ))}
      </div>
    </div>
  );
}