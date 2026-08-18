"use client";

import { useMemo, useState } from "react";
import Image from "next/image";

import { useQuery } from "@tanstack/react-query";
import { Check, Plus, Search } from "lucide-react";

import { fetchMapPlaces } from "@/features/spot/apis/map";
import { CATEGORIES, CATEGORY_META } from "@/features/spot/constants/categoryMap";
import type { MapPlace } from "@/types/map";

interface CourseSpotPickerProps {
  /** 이미 코스에 있는 장소의 originalId 목록 (중복 추가 방지) */
  existingIds: Set<string>;
  onAddPlace: (place: MapPlace) => void;
}

const FALLBACK_CATEGORY = { label: "기타", emoji: "📍", color: "#6b7280" };

export default function CourseSpotPicker({
  existingIds,
  onAddPlace,
}: CourseSpotPickerProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("ALL");

  // 전체를 한 번에 받아 칩 전환·검색을 클라이언트에서 즉시 처리한다.
  // (스팟 페이지의 useMapPlaces와 같은 정렬/사이즈 정책)
  const { data, isLoading, isError } = useQuery({
    queryKey: ["coursePickerPlaces"],
    queryFn: () => fetchMapPlaces({ sort: "imageUrl,asc", size: 9999 }),
    staleTime: 1000 * 60 * 5,
  });

  const places = useMemo(() => {
    let list = data?.content ?? [];
    if (category !== "ALL") list = list.filter((p) => p.category === category);
    if (search.trim()) {
      list = list.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase()),
      );
    }
    return [...list].sort((a, b) => Number(!!b.imageUrl) - Number(!!a.imageUrl));
  }, [data, category, search]);

  return (
    <aside className="flex w-[340px] shrink-0 flex-col overflow-hidden border-l border-gray-100 bg-gray-50">
      {/* 헤더 + 검색 */}
      <div className="border-b border-gray-100 bg-white px-4 pt-4 pb-3">
        <h3 className="mb-3 text-sm font-bold text-gray-900">코스에 장소 추가</h3>
        <div className="relative">
          <Search
            size={14}
            className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="커피, 맛집, 해수욕장 검색"
            className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pr-8 pl-8 text-sm text-gray-900 transition-colors outline-none placeholder:text-gray-400 focus:border-ocean-300 focus:bg-white"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute top-1/2 right-3 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          )}
        </div>

        {/* 카테고리 칩 */}
        <div className="scrollbar-hide -mx-1 mt-2.5 flex gap-1.5 overflow-x-auto px-1 pb-0.5">
          {[{ id: "ALL", label: "전체", emoji: "✨" }, ...CATEGORIES].map(
            ({ id, label, emoji }) => {
              const active = category === id;
              return (
                <button
                  key={id}
                  onClick={() => setCategory(id)}
                  className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap transition-colors ${
                    active
                      ? "bg-navy-900 text-lime-300"
                      : "border border-gray-200 bg-white text-gray-500 hover:border-gray-300"
                  }`}
                >
                  {emoji} {label}
                </button>
              );
            },
          )}
        </div>
      </div>

      {/* 목록 */}
      <ul className="flex flex-1 flex-col gap-2 overflow-y-auto p-3">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <li key={i} className="animate-shimmer h-[76px] rounded-xl" />
          ))
        ) : isError ? (
          <li className="py-16 text-center text-sm text-gray-400">
            스팟을 불러오지 못했어요
          </li>
        ) : places.length === 0 ? (
          <li className="flex flex-col items-center justify-center py-16 text-gray-400">
            <span className="mb-2 text-3xl">🔍</span>
            <p className="text-sm">검색 결과가 없어요</p>
          </li>
        ) : (
          places.slice(0, 100).map((place) => {
            const meta =
              CATEGORY_META[place.category as keyof typeof CATEGORY_META] ??
              FALLBACK_CATEGORY;
            const added = existingIds.has(place.originalId);

            return (
              <li
                key={place.id}
                className="flex items-center gap-3 rounded-xl bg-white p-2.5 ring-1 ring-transparent transition-all hover:ring-gray-200"
              >
                <div
                  className="relative h-[56px] w-[56px] shrink-0 overflow-hidden rounded-lg"
                  style={
                    !place.imageUrl
                      ? { background: `${meta.color}1A` }
                      : undefined
                  }
                >
                  {place.imageUrl ? (
                    <Image
                      src={place.imageUrl}
                      alt={place.name}
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-2xl">
                      {meta.emoji}
                    </div>
                  )}
                </div>

                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <p className="truncate text-[13px] font-semibold text-gray-900">
                    {place.name}
                  </p>
                  <span
                    className="w-fit rounded-full px-1.5 py-0.5 text-[10px] font-semibold"
                    style={{
                      backgroundColor: `${meta.color}1A`,
                      color: meta.color,
                    }}
                  >
                    {meta.label}
                  </span>
                  <span className="text-[11px] text-gray-400">
                    {place.free || !place.minPrice
                      ? "무료"
                      : `${place.minPrice.toLocaleString()}원~`}
                  </span>
                </div>

                <button
                  onClick={() => onAddPlace(place)}
                  disabled={added}
                  aria-label={
                    added ? `${place.name} 추가됨` : `${place.name} 코스에 추가`
                  }
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors ${
                    added
                      ? "bg-lime-100 text-lime-600"
                      : "bg-ocean-50 text-ocean-500 hover:bg-ocean-500 hover:text-white"
                  }`}
                >
                  {added ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                </button>
              </li>
            );
          })
        )}
      </ul>
    </aside>
  );
}
