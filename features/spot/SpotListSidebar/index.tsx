"use client";

import { useRef, useState, useMemo, useEffect, useCallback } from "react";
import { Search } from "lucide-react";
import Image from "next/image";
import { useMapPlaces } from "../hooks/useMapPlaces";
import { CATEGORY_META } from "@/features/spot/constants/categoryMap";
import type { MapPlace } from "@/types/map";

interface SpotListSidebarProps {
  selectedId: string | null;
  onSelectSpot: (
    id: string,
    lat: number,
    lng: number,
    placeType: "SPOT" | "FOOD",
    mapPlaceId: number
  ) => void;
}

const FALLBACK_CATEGORY = { label: "기타", emoji: "📍", color: "#6b7280" };

export default function SpotListSidebar({ selectedId, onSelectSpot }: SpotListSidebarProps) {
  const selectedRef = useRef<HTMLLIElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const [search, setSearch] = useState("");
  const { data, isLoading, isError, freeOnly, fetchNextPage, hasNextPage, isFetchingNextPage } = useMapPlaces();

  const allPlaces = useMemo(() => {
    return data?.pages.flatMap((page) => page.content) ?? [];
  }, [data]);

  const places = useMemo(() => {
    let list = allPlaces;
    if (freeOnly) list = list.filter((p) => p.free);
    if (search.trim()) {
      list = list.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase())
      );
    }
    // 이미지 없는 항목(FOOD는 항상 이미지가 없음)이 먼저 보이면 밋밋해 보여서
    // 뒤로 밀어낸다. 정렬은 안정적이라 같은 그룹 안의 원래 순서는 유지된다.
    return [...list].sort((a, b) => Number(!!b.imageUrl) - Number(!!a.imageUrl));
  }, [allPlaces, freeOnly, search]);

  useEffect(() => {
    selectedRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [selectedId]);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage]
  );

  useEffect(() => {
    const el = bottomRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(handleObserver, { threshold: 0.5 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [handleObserver]);

  const totalCount = data?.pages[0]?.totalElements ?? 0;

  if (isLoading) {
    return (
      <aside className="w-[360px] shrink-0 overflow-y-auto border-l border-gray-100 bg-white">
        <div className="px-4 py-3 border-b border-gray-100">
          <div className="h-5 w-24 animate-pulse rounded bg-gray-100" />
        </div>
        <div className="p-3 space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-gray-100" />
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
      <div className="bg-white border-b border-gray-100 px-4 pt-3 pb-3">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900">
            총 <span className="text-navy-400 font-bold">{totalCount}</span>개의 스팟
          </h3>
        </div>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="맛집 / 관광지 / 카페 검색"
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

      <ul className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
        {places.length === 0 ? (
          <li className="flex flex-col items-center justify-center py-16 text-gray-400">
            <span className="text-3xl mb-2">🔍</span>
            <p className="text-sm">검색 결과가 없어요</p>
          </li>
        ) : (
          <>
            {places.map((place: MapPlace) => {
              const isSelected = place.originalId === selectedId;
              const category =
                CATEGORY_META[place.category as keyof typeof CATEGORY_META] ?? FALLBACK_CATEGORY;

              return (
                <li
                  key={place.id}
                  ref={isSelected ? selectedRef : null}
                  onClick={() => onSelectSpot(
                    place.originalId,
                    place.latitude,
                    place.longitude,
                    place.placeType,
                    place.id
                  )}
                  className={`
                    flex gap-3 cursor-pointer rounded-xl p-3 transition-all
                    ${isSelected
                      ? "bg-white ring-2 ring-navy-400 shadow-sm"
                      : "bg-white hover:shadow-sm hover:ring-1 hover:ring-gray-200"
                    }
                  `}
                >
                  <div
                    className="relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-xl"
                    style={!place.imageUrl ? { background: `${category.color}1A` } : undefined}
                  >
                    {place.imageUrl ? (
                      <Image
                        src={place.imageUrl}
                        alt={place.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-3xl">
                        {category.emoji}
                      </div>
                    )}
                    {isSelected && (
                      <div className="absolute inset-0 bg-navy-400/10 rounded-xl" />
                    )}
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col justify-center gap-1.5">
                    <p className={`truncate text-sm font-semibold ${isSelected ? "text-navy-600" : "text-gray-900"}`}>
                      {place.name}
                    </p>
                    <span
                      className="w-fit rounded-full px-1.5 py-0.5 text-[10px] font-semibold"
                      style={{ backgroundColor: `${category.color}1A`, color: category.color }}
                    >
                      {category.emoji} {category.label}
                    </span>
                    {place.avgRating > 0 && (
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-yellow-400">★</span>
                        <span className="text-xs text-gray-500">{place.avgRating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>

                  {isSelected && (
                    <div className="flex items-center shrink-0">
                      <div className="h-2 w-2 rounded-full bg-navy-400" />
                    </div>
                  )}
                </li>
              );
            })}
            <div ref={bottomRef} className="py-2 flex justify-center">
              {isFetchingNextPage && (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-navy-400 border-t-transparent" />
              )}
            </div>
          </>
        )}
      </ul>
    </aside>
  );
}