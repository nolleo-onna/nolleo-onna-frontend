"use client";

import { useState } from "react";
import { useCrowd } from "@/features/crowd/hooks/useCrowd";
import { getCrowdLevel, CROWD_STYLE } from "@/features/crowd/utils/crowdUtils";
import type { CrowdLevel } from "@/types/crowd";

const FILTER_OPTIONS: { label: string; value: CrowdLevel | "전체" }[] = [
  { label: "전체", value: "전체" },
  { label: "매우혼잡", value: "매우혼잡" },
  { label: "혼잡", value: "혼잡" },
  { label: "보통", value: "보통" },
  { label: "여유", value: "여유" },
];

export default function CrowdView() {
  const { data, isPending } = useCrowd();
  const [filter, setFilter] = useState<CrowdLevel | "전체">("전체");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = (data ?? []).filter((spot) => {
    const matchFilter = filter === "전체" || getCrowdLevel(spot.cnctrRate) === filter;
    const matchSearch = spot.tatsNm.includes(search) || spot.signguNm.includes(search);
    return matchFilter && matchSearch;
  });

  return (
    <div className="flex h-screen pt-16">
      {/* 사이드바 */}
      <aside className="w-[360px] shrink-0 flex flex-col border-r border-gray-100 bg-white">
        {/* 헤더 */}
        <div className="px-5 py-4 border-b border-gray-100">
          <span className="text-xs font-semibold text-pink-500">오늘 붐빌 곳</span>
          <h1 className="text-lg font-bold text-gray-900 mt-1">오늘 혼잡도 지도</h1>
        </div>

        {/* 검색 */}
        <div className="px-5 py-3 border-b border-gray-100">
          <input
            type="text"
            placeholder="관광지 또는 지역 검색"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-4 py-2 text-sm outline-none focus:border-pink-300"
          />
        </div>

        {/* 필터 */}
        <div className="flex gap-2 px-5 py-3 border-b border-gray-100">
          {FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setFilter(opt.value)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                filter === opt.value
                  ? "bg-gray-900 text-white"
                  : "border border-gray-200 text-gray-500"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* 리스트 */}
        <div className="flex-1 overflow-y-auto">
          {isPending ? (
            <div className="flex items-center justify-center h-40">
              <p className="text-sm text-gray-400">불러오는 중...</p>
            </div>
          ) : (
            filtered.map((spot, index) => {
              const level = getCrowdLevel(spot.cnctrRate);
              const style = CROWD_STYLE[level];
              const isSelected = selectedId === `${spot.tatsNm}-${index}`;
              return (
                <button
                  key={`${spot.tatsNm}-${index}`}
                  onClick={() => setSelectedId(`${spot.tatsNm}-${index}`)}
                  className={`w-full flex items-center justify-between px-5 py-4 border-b border-gray-50 text-left transition-colors ${
                    isSelected ? "bg-pink-50" : "hover:bg-gray-50"
                  }`}
                >
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{spot.tatsNm}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {spot.signguNm} · 집중률 {spot.cnctrRate}%
                    </p>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${style.bg} ${style.text}`}>
                    {style.label}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </aside>

      {/* 지도 자리 — 카카오맵 추후 연결 */}
      <main className="flex-1 bg-gray-100 flex items-center justify-center">
        <p className="text-sm text-gray-400">지도 영역</p>
      </main>
    </div>
  );
}