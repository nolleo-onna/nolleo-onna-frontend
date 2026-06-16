"use client";

import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { Search } from "lucide-react";
import { useSpotMarkers } from "../hooks/useSpotMarkers";
import { useFilteredMarkers } from "../hooks/useFilteredMarkers";
import type { SpotMarker } from "@/types/spot";

interface SpotListSidebarProps {
  selectedId: string | null;
  onSelectSpot: (id: string, lat: number, lng: number) => void;
}

const CATEGORY_LABEL: Record<string, { label: string; emoji: string }> = {
  VE: { label: "관광·문화", emoji: "🏛️" },
  HS: { label: "역사·종교", emoji: "⛩️" },
  EX: { label: "체험·레저", emoji: "🎢" },
  NA: { label: "자연·해변", emoji: "🌊" },
  LS: { label: "스포츠", emoji: "🏄" },
  AC: { label: "캠핑", emoji: "🏕️" },
  FD: { label: "맛집·카페", emoji: "🍽️" },
};



export default function SpotListSidebar({ selectedId, onSelectSpot }: SpotListSidebarProps) {
  const spots = useFilteredMarkers();
  const { isLoading, isError } = useSpotMarkers();
  const selectedRef = useRef<HTMLLIElement | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    selectedRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [selectedId]);

  const filtered = useMemo(() => {
  if (!search.trim()) return spots;
  return spots.filter((s) =>
    s.title.toLowerCase().includes(search.toLowerCase())
  );
}, [spots, search]);

  if (isLoading) {
    return (
      <aside className="w-[360px] shrink-0 overflow-y-auto border-l border-gray-100 bg-white">
        <div className="px-4 py-3 border-b border-gray-100">
          <div className="h-5 w-24 animate-pulse rounded bg-gray-100" />
        </div>
        <div className="p-3 space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-gray-100" />
          ))}
        </div>
      </aside>
    );
  }

  if (isError) {
    return (
      <aside className="w-[360px] shrink-0 overflow-y-auto border-l border-gray-100 bg-white p-4">
        <p className="text-sm text-gray-400">스팟을 불러오지 못했어요.</p>
      </aside>
    );
  }

  return (
    <aside className="w-[360px] shrink-0 flex flex-col border-l border-gray-100 bg-gray-50 overflow-hidden">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-100 px-4 pt-3 pb-3">
        {/* 타이틀 + 드롭다운 */}
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900">
            총 <span className="text-navy-400 font-bold">{filtered.length}</span>개의 스팟
          </h3>
        </div>

        {/* 검색창 */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="스팟 검색..."
            className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-8 pr-8 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-navy-300 focus:bg-white transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* 리스트 */}
      <ul className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
        {filtered.length === 0 ? (
          <li className="flex flex-col items-center justify-center py-16 text-gray-400">
            <span className="text-3xl mb-2">🔍</span>
            <p className="text-sm">검색 결과가 없어요</p>
          </li>
        ) : (
          filtered.map((spot: SpotMarker) => {
            const isSelected = spot.contentId === selectedId;
            const category = CATEGORY_LABEL[spot.lclsSystm1] ?? { label: spot.lclsSystm1, emoji: "📍" };

            return (
              <li
                key={spot.contentId}
                ref={isSelected ? selectedRef : null}
                onClick={() => onSelectSpot(spot.contentId, spot.mapY, spot.mapX)}
                className={`
                  flex gap-3 cursor-pointer rounded-xl p-3 transition-all
                  ${isSelected
                    ? "bg-white ring-2 ring-navy-400 shadow-sm"
                    : "bg-white hover:shadow-sm hover:ring-1 hover:ring-gray-200"
                  }
                `}
              >
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg">
                  {spot.firstImage ? (
                    <img
                      src={spot.firstImage}
                      alt={spot.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gray-100 text-2xl">
                      {category.emoji}
                    </div>
                  )}
                  {isSelected && (
                    <div className="absolute inset-0 bg-navy-400/10 rounded-lg" />
                  )}
                </div>

                <div className="flex min-w-0 flex-1 flex-col justify-center gap-1">
                  <p className={`truncate text-sm font-semibold ${isSelected ? "text-navy-600" : "text-gray-900"}`}>
                    {spot.title}
                  </p>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs">{category.emoji}</span>
                    <span className="text-xs text-gray-500">{category.label}</span>
                  </div>
                </div>

                {isSelected && (
                  <div className="flex items-center shrink-0">
                    <div className="h-2 w-2 rounded-full bg-navy-400" />
                  </div>
                )}
              </li>
            );
          })
        )}
      </ul>
    </aside>
  );
}
