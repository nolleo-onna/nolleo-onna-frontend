"use client";

import { useCallback, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { CalendarClock, List, X } from "lucide-react";
import { useCrowd } from "@/features/crowd/hooks/useCrowd";
import { getCrowdLevel, CROWD_STYLE, formatBaseYmd } from "@/features/crowd/utils/crowdUtils";
import MapSkeleton from "@/components/ui/Skeleton/MapSkeleton";
import DistrictPanel from "@/features/crowd/components/DistrictPanel";
import type { CrowdLevel } from "@/types/crowd";

const CrowdMap = dynamic(() => import("@/features/crowd/components/CrowdMap"), {
  ssr: false,
  loading: () => <MapSkeleton />,
});

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
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [isListOpen, setIsListOpen] = useState(false);

  const filtered = useMemo(
    () =>
      (data ?? []).filter((spot) => {
        const matchFilter = filter === "전체" || getCrowdLevel(spot.rate) === filter;
        const matchSearch = spot.name.includes(search) || spot.district.includes(search);
        return matchFilter && matchSearch;
      }),
    [data, filter, search]
  );

  // 지도의 구 마커를 클릭하면 지도 위에 그 구의 상세 패널을 띄운다.
  const handleSelectDistrict = useCallback((district: string) => {
    setSelectedDistrict((prev) => (prev === district ? null : district));
    setSelectedId(null);
  }, []);

  const districtSpots = useMemo(
    () => (data ?? []).filter((spot) => spot.district === selectedDistrict),
    [data, selectedDistrict],
  );

  // 모든 구가 같은 기준 일자를 공유하므로 첫 항목 것을 쓴다
  const baseDate = data?.[0]?.baseYmd ? formatBaseYmd(data[0].baseYmd) : null;

  return (
    <div className="relative flex h-screen pt-16">
      {/* 모바일 목록 열림 시 배경 딤 처리 */}
      {isListOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/30 lg:hidden"
          onClick={() => setIsListOpen(false)}
        />
      )}

      {/* 사이드바: lg 미만에서는 슬라이드오버로 전환 */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-[360px] shrink-0 flex flex-col border-r border-gray-100 bg-white transition-transform duration-300 lg:static lg:z-auto lg:translate-x-0 ${
          isListOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          type="button"
          onClick={() => setIsListOpen(false)}
          aria-label="목록 닫기"
          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-md lg:hidden"
        >
          <X className="h-4 w-4 text-gray-600" />
        </button>

        {/* 헤더 */}
        <div className="px-5 py-4 border-b border-gray-100">
          <span className="text-xs font-semibold text-ocean-600">오늘 붐빌 곳</span>
          <h1 className="text-lg font-bold text-gray-900 mt-1">오늘 혼잡도 지도</h1>
          {baseDate && (
            <p className="mt-1.5 flex items-center gap-1 text-[11px] text-gray-400">
              <CalendarClock className="h-3 w-3" />
              {baseDate} 기준 · 하루 단위로 갱신돼요
            </p>
          )}
        </div>

        {/* 검색 */}
        <div className="px-5 py-3 border-b border-gray-100">
          <input
            type="text"
            placeholder="관광지 또는 지역 검색"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-4 py-2 text-sm outline-none focus:border-ocean-400"
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
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 gap-1 px-5 text-center">
              <p className="text-sm text-gray-500">
                {(data ?? []).length === 0
                  ? "혼잡도 데이터가 아직 없어요"
                  : "조건에 맞는 스팟이 없어요"}
              </p>
              <p className="text-xs text-gray-400">잠시 후 다시 확인해주세요</p>
            </div>
          ) : (
            filtered.map((spot, index) => {
              const level = getCrowdLevel(spot.rate);
              const style = CROWD_STYLE[level];
              const isSelected = selectedId === `${spot.name}-${index}`;
              return (
                <button
                  key={`${spot.name}-${index}`}
                  onClick={() => {
                    setSelectedId(`${spot.name}-${index}`);
                    setIsListOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-5 py-4 border-b border-gray-50 text-left transition-colors ${
                    isSelected ? "bg-ocean-50" : "hover:bg-gray-50"
                  }`}
                >
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{spot.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {spot.district} · 집중률 {spot.rate}%
                    </p>
                  </div>
                  <span
                    className="px-2.5 py-0.5 rounded-full text-xs font-semibold"
                    style={{ backgroundColor: style.bg, color: style.text }}
                  >
                    {style.label}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </aside>

      <CrowdMap selectedDistrict={selectedDistrict} onSelectDistrict={handleSelectDistrict} />

      {/* 구 상세 패널 — 데스크톱은 지도 우측, 모바일은 하단 시트 */}
      {selectedDistrict && (
        <div className="pointer-events-none absolute inset-x-3 bottom-20 z-30 flex max-h-[55vh] justify-center lg:inset-x-auto lg:right-4 lg:top-20 lg:bottom-6 lg:max-h-none lg:w-[320px]">
          <DistrictPanel
            district={selectedDistrict}
            spots={districtSpots}
            onClose={() => setSelectedDistrict(null)}
          />
        </div>
      )}

      {/* 모바일에서는 사이드바가 숨겨져 기준 일자를 못 보니 지도 위 칩으로 표시 */}
      {baseDate && (
        <div className="pointer-events-none absolute left-3 top-20 z-20 lg:hidden">
          <span className="flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-medium text-gray-500 shadow-sm backdrop-blur-sm">
            <CalendarClock className="h-3 w-3" />
            {baseDate} 기준
          </span>
        </div>
      )}

      {/* 모바일 전용 목록 토글 버튼 */}
      <div className="fixed bottom-5 left-1/2 z-40 -translate-x-1/2 lg:hidden">
        <button
          type="button"
          onClick={() => setIsListOpen(true)}
          className="flex items-center gap-1.5 rounded-full bg-navy-900 px-4 py-2.5 text-sm font-semibold text-white shadow-lg"
        >
          <List className="h-4 w-4" />
          목록
        </button>
      </div>
    </div>
  );
}