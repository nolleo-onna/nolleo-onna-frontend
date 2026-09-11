"use client";

import { useRef, useState, useMemo, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import { ChevronDown, Heart, MapPin, Search } from "lucide-react";
import Image from "next/image";
import { useMapPlaces } from "../hooks/useMapPlaces";
import { useFavoriteIds, useToggleFavorite } from "../hooks/useFavorites";
import FavoriteButton from "@/features/spot/components/FavoriteButton";
import { CATEGORY_META } from "@/features/spot/constants/categoryMap";
import { REGIONS } from "@/features/spot/SpotFilterSidebar/RegionFilter";
import {
  SEARCH_SUGGESTIONS,
  filterPlaces,
  getMapCoords,
  parseSearch,
  suggestPlaceName,
  toServerFilter,
} from "@/features/spot/utils/spotSearch";
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
  /** 검색 결과 위치 목록 — 지도 화면 맞추기용. 검색어가 비면 호출하지 않는다 */
  onSearchResults?: (coords: { lat: number; lng: number }[]) => void;
  /** 지역구 선택 시 지도를 그 구로 이동시키는 콜백(왼쪽 필터와 동일 동작) */
  onSelectRegion?: (region: string | null) => void;
}

const FALLBACK_CATEGORY = { label: "기타", emoji: "📍", color: "#6b7280" };

// 검색어와 일치한 부분을 강조해서 보여준다 (공백 차이 등으로 위치를 못 찾으면 그냥 이름만)
function HighlightedName({ name, term, className }: { name: string; term: string | null; className: string }) {
  if (term) {
    const index = name.toLowerCase().indexOf(term.toLowerCase());
    if (index >= 0) {
      return (
        <p className={className}>
          {name.slice(0, index)}
          <mark className="rounded-sm bg-lime-200/70 px-0.5 text-inherit">
            {name.slice(index, index + term.length)}
          </mark>
          {name.slice(index + term.length)}
        </p>
      );
    }
  }
  return <p className={className}>{name}</p>;
}

export default function SpotListSidebar({
  selectedId,
  onSelectSpot,
  onSearchResults,
  onSelectRegion,
}: SpotListSidebarProps) {
  const selectedRef = useRef<HTMLLIElement | null>(null);
  const bottomRef = useRef<HTMLLIElement | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  // 한끗 상세 등 다른 페이지에서 "?keyword=자갈치시장" 형태로 넘어오면
  // 그 검색어로 바로 필터링된 채 시작한다.
  const [search, setSearch] = useState(() => searchParams.get("keyword") ?? "");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [isRegionOpen, setIsRegionOpen] = useState(false);
  // 지역(구/동네)·카테고리·무료·이름/초성을 한 번에 해석하는 검색 파이프라인.
  // 서버가 받는 조건(구·카테고리·이름)은 서버로 보내고, 나머지는 받은 결과에서 마저 거른다.
  const parsed = useMemo(() => parseSearch(search), [search]);
  const serverFilter = useMemo(() => toServerFilter(parsed), [parsed]);
  const { data, isLoading, isError, isFetching, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useMapPlaces(serverFilter);
  // 카드마다 status를 호출하지 않고, 찜 목록 한 번을 Set으로 만들어 판별한다.
  const favoriteIds = useFavoriteIds();
  const { mutate: toggleFavorite } = useToggleFavorite();

  // 왼쪽 필터 사이드바의 지역구 필터와 같은 URL 파라미터(region)를 공유해서
  // 어느 쪽에서 고르든 지도·목록이 같이 반영된다.
  const selectedRegion = searchParams.get("region");
  const selectRegion = useCallback(
    (region: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (region) {
        params.set("region", region);
      } else {
        params.delete("region");
      }
      router.replace(`?${params.toString()}`, { scroll: false });
      onSelectRegion?.(region);
      setIsRegionOpen(false);
    },
    [router, searchParams, onSelectRegion],
  );

  const allPlaces = useMemo(() => {
    return data?.pages.flatMap((page) => page.content) ?? [];
  }, [data]);

  const places = useMemo(() => {
    let list = filterPlaces(allPlaces, parsed);
    if (favoritesOnly) list = list.filter((place) => favoriteIds.has(place.id));
    // 이미지 없는 항목(FOOD는 항상 이미지가 없음)이 먼저 보이면 밋밋해 보여서
    // 뒤로 밀어낸다. 정렬은 안정적이라 같은 그룹 안의 원래 순서는 유지된다.
    return [...list].sort((a, b) => Number(!!b.imageUrl) - Number(!!a.imageUrl));
  }, [allPlaces, parsed, favoritesOnly, favoriteIds]);

  // 검색 결과가 바뀌면(타이핑 멈춘 뒤) 지도가 결과 위치로 이동하도록 좌표를 올려보낸다.
  // 검색어를 지웠을 때는 지도를 건드리지 않는다(사용자가 보던 화면 유지).
  useEffect(() => {
    if (!onSearchResults || !search.trim()) return;
    const timeout = setTimeout(() => {
      // 동네·구 검색은 중심 한 점으로 확대 이동, 그 외에는 결과 전체가 화면에 들어오게
      const coords = getMapCoords(parsed, places);
      if (coords.length > 0) onSearchResults(coords);
    }, 450);
    return () => clearTimeout(timeout);
  }, [search, parsed, places, onSearchResults]);

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
    const observer = new IntersectionObserver(handleObserver, { threshold: 0, rootMargin: "200px" });
    observer.observe(el);
    return () => observer.disconnect();
  }, [handleObserver]);

  const totalCount = data?.pages[0]?.totalElements ?? 0;

  if (isLoading) {
    return (
      <aside className="w-[360px] shrink-0 overflow-y-auto border-l border-gray-100 bg-white">
        <div className="px-4 py-3 border-b border-gray-100">
          <div className="h-5 w-24 animate-shimmer rounded" />
        </div>
        <div className="p-3 space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-24 animate-shimmer rounded-xl" />
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
            총{" "}
            <span className="text-navy-400 font-bold">
              {favoritesOnly ? places.length : totalCount}
            </span>
            개의 스팟
          </h3>
        </div>

        {/* 빠른 필터: 찜한 곳만 보기 · 지역구 */}
        <div className="mb-3 flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setFavoritesOnly((prev) => !prev)}
            className={`flex items-center gap-1 rounded-full border px-2.5 py-1.5 text-xs font-semibold transition-colors ${
              favoritesOnly
                ? "border-pink-200 bg-pink-50 text-pink-600"
                : "border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700"
            }`}
          >
            <Heart
              className={`h-3 w-3 ${favoritesOnly ? "fill-pink-500 text-pink-500" : ""}`}
            />
            찜한 곳{favoriteIds.size > 0 ? ` ${favoriteIds.size}` : ""}
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setIsRegionOpen((prev) => !prev)}
              className={`flex items-center gap-1 rounded-full border px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                selectedRegion
                  ? "border-navy-200 bg-navy-50 text-navy-600"
                  : "border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700"
              }`}
            >
              <MapPin className="h-3 w-3" />
              {selectedRegion ?? "지역구"}
              <ChevronDown className="h-3 w-3" />
            </button>

            {isRegionOpen && (
              <>
                {/* 바깥 클릭 시 닫기 */}
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setIsRegionOpen(false)}
                />
                <div className="absolute left-0 top-full z-20 mt-1.5 w-[236px] rounded-xl border border-gray-100 bg-white p-2 shadow-lg">
                  <div className="grid grid-cols-3 gap-1">
                    <button
                      type="button"
                      onClick={() => selectRegion(null)}
                      className={`rounded-lg px-2 py-1.5 text-xs font-medium transition-colors ${
                        !selectedRegion
                          ? "bg-navy-300 text-white"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      전체
                    </button>
                    {REGIONS.map((region) => (
                      <button
                        key={region}
                        type="button"
                        onClick={() =>
                          selectRegion(selectedRegion === region ? null : region)
                        }
                        className={`truncate rounded-lg px-2 py-1.5 text-xs font-medium transition-colors ${
                          selectedRegion === region
                            ? "bg-navy-300 text-white"
                            : "text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        {region}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
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
        {!search && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {SEARCH_SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => setSearch(suggestion)}
                className="rounded-full border border-gray-200 px-2.5 py-1 text-[11px] text-gray-500 transition-colors hover:border-ocean-300 hover:text-ocean-600"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>

      <ul className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
        {places.length === 0 && (isFetching || hasNextPage) ? (
          <li className="flex flex-col items-center justify-center py-16 text-gray-400">
            <div className="mb-3 h-5 w-5 animate-spin rounded-full border-2 border-navy-400 border-t-transparent" />
            <p className="text-sm">찾는 중이에요…</p>
          </li>
        ) : places.length === 0 ? (
          <li className="flex flex-col items-center justify-center py-16 text-gray-400">
            <span className="text-3xl mb-2">{favoritesOnly ? "🤍" : "🔍"}</span>
            <p className="text-sm">
              {favoritesOnly ? "아직 찜한 곳이 없어요" : "검색 결과가 없어요"}
            </p>
            {(() => {
              const suggestion = suggestPlaceName(search);
              return suggestion ? (
                <button
                  onClick={() => setSearch(suggestion)}
                  className="mt-2 text-xs font-semibold text-ocean-600 underline underline-offset-2 hover:text-ocean-700"
                >
                  혹시 &quot;{suggestion}&quot; 찾으세요?
                </button>
              ) : null;
            })()}
          </li>
        ) : (
          <>
            {places.map((place: MapPlace) => {
              const isSelected = place.originalId === selectedId;
              const category =
                CATEGORY_META[place.category as keyof typeof CATEGORY_META] ?? FALLBACK_CATEGORY;

              return (
                <motion.li
                  key={place.id}
                  ref={isSelected ? selectedRef : null}
                  layout="position"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
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
                        sizes="72px"
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
                    <HighlightedName
                      name={place.name}
                      term={parsed.nameTerms[0] ?? null}
                      className={`truncate text-sm font-semibold ${isSelected ? "text-navy-600" : "text-gray-900"}`}
                    />
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

                  <div className="flex shrink-0 flex-col items-center justify-between self-stretch">
                    <FavoriteButton
                      isFavorite={favoriteIds.has(place.id)}
                      onToggle={() =>
                        toggleFavorite({
                          mapPlaceId: place.id,
                          place: {
                            name: place.name,
                            placeType: place.placeType,
                            originalId: place.originalId,
                            district: place.district,
                            category: place.category,
                            imageUrl: place.imageUrl,
                          },
                        })
                      }
                      className="h-7 w-7 rounded-full hover:bg-pink-50"
                    />
                    {isSelected && <div className="mb-2 h-2 w-2 rounded-full bg-navy-400" />}
                  </div>
                </motion.li>
              );
            })}
          </>
        )}
        {/* 다음 페이지 감지용 — 결과가 0건이어도 남겨둬야 뒤 페이지를 계속 받는다 */}
        <li ref={bottomRef} aria-hidden className="flex justify-center py-2">
          {isFetchingNextPage && (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-navy-400 border-t-transparent" />
          )}
        </li>
      </ul>
    </aside>
  );
}