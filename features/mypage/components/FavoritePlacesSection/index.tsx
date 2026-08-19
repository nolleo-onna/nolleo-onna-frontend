"use client";

import Link from "next/link";

import { ChevronRight, Heart, MapPin } from "lucide-react";

import { useFavoriteList } from "@/features/spot/hooks/useFavorites";
import { CATEGORY_META } from "@/features/spot/constants/categoryMap";

const FAVORITE_PLACES_LIMIT = 5;
const FALLBACK_CATEGORY = { label: "기타", emoji: "📍", color: "#6b7280" };

// 서버(/api/v1/favorites)에 저장된 찜한 장소 목록. localStorage 기반인
// "저장한 한끗"과 달리 기기 간 동기화된다.
export default function FavoritePlacesSection() {
  const { data: favorites, isLoading } = useFavoriteList();

  return (
    <section className="rounded-[28px] border border-gray-100 bg-white p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Heart className="h-4 w-4 text-pink-500" />
          <h2 className="text-base font-bold text-navy-900">찜한 장소</h2>
        </div>
        <Link
          href="/spot"
          className="flex items-center gap-0.5 text-xs text-gray-500 transition-colors hover:text-navy-900"
        >
          지도에서 보기 <ChevronRight className="h-3 w-3" />
        </Link>
      </div>

      {isLoading ? (
        <div className="mt-4 flex flex-col gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="animate-shimmer h-12 rounded-xl" />
          ))}
        </div>
      ) : !favorites || favorites.length === 0 ? (
        <div className="mt-4 flex flex-col items-center gap-3 rounded-2xl bg-gray-50 px-6 py-10 text-center">
          <Heart className="h-5 w-5 text-gray-300" />
          <p className="text-sm text-gray-500">아직 찜한 장소가 없어요</p>
          <Link
            href="/spot"
            className="rounded-full bg-navy-900 px-5 py-2 text-xs font-semibold text-lime-300 transition-transform active:scale-95"
          >
            스팟 구경하러 가기
          </Link>
        </div>
      ) : (
        <div className="mt-4 flex flex-col gap-1">
          {favorites.slice(0, FAVORITE_PLACES_LIMIT).map((place) => {
            const category =
              CATEGORY_META[place.category as keyof typeof CATEGORY_META] ??
              FALLBACK_CATEGORY;

            return (
              <Link
                key={place.mapPlaceId}
                href={`/spot?keyword=${encodeURIComponent(place.name)}`}
                className="group flex items-center gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-gray-50"
              >
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-lg"
                  style={{ backgroundColor: `${category.color}1A` }}
                >
                  {category.emoji}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-navy-900">
                    {place.name}
                  </p>
                  <p className="mt-0.5 flex items-center gap-1 text-[11px] text-gray-500">
                    <MapPin className="h-3 w-3" />
                    {place.district} · {category.label}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-gray-300 transition-colors group-hover:text-ocean-500" />
              </Link>
            );
          })}
          {favorites.length > FAVORITE_PLACES_LIMIT && (
            <p className="mt-1 px-2 text-[11px] text-gray-400">
              외 {favorites.length - FAVORITE_PLACES_LIMIT}곳
            </p>
          )}
        </div>
      )}
    </section>
  );
}
