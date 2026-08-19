"use client";

import Image from "next/image";
import { Wallet, Footprints, ArrowRight, ImageIcon } from "lucide-react";
import KakaoDirectionsLink from "@/features/course/components/KakaoDirectionsLink";
import { useSpotDescription } from "@/features/course/hooks/useSpotDescription";
import { formatDistance } from "@/features/course/utils/format";
import type { CoursePlace, Course } from "@/features/course/data/mockCourse";

interface Props {
  course: Course;
  selectedDay: number;
  place: CoursePlace;
  onSelectDay: (day: number) => void;
  onPlaceClick: () => void;
}

export default function CoursePlaceDetail({
  course,
  place,
  onPlaceClick,
}: Props) {
  const places = course.days[0]?.places ?? [];
  const index = places.findIndex((p) => p.id === place.id);
  const next = places[index + 1];

  const { data: detail, isLoading } = useSpotDescription(
    place.originalId ?? null,
    place.category
  );

  const overview = detail?.overview?.trim();

  return (
    <div className="absolute bottom-2 left-2 right-2 z-10 lg:bottom-4 lg:left-4 lg:right-4">
      <button
        onClick={onPlaceClick}
        className="w-full text-left rounded-2xl border border-gray-100 bg-white p-3 lg:p-4
                   shadow-[0_8px_32px_rgba(13,48,128,0.12)]
                   hover:shadow-[0_10px_36px_rgba(13,48,128,0.16)]
                   active:scale-[0.995] transition-all duration-200"
      >
        <div className="flex gap-3 lg:gap-4">
          {/* 썸네일 */}
          <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-gray-50 lg:h-24 lg:w-24">
            {place.imageUrl ? (
              <Image
                src={place.imageUrl}
                alt={place.name}
                fill
                sizes="96px"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <ImageIcon className="h-6 w-6 text-gray-300" />
              </div>
            )}
          </div>

          {/* 본문 */}
          <div className="min-w-0 flex-1">
            {/* 배지 */}
            <div className="mb-1.5 flex items-center gap-2">
              <span className="rounded-md bg-ocean-50 px-2 py-[3px] text-[11px] font-semibold text-ocean-600">
                {index + 1}번째 코스
              </span>
              <span className="rounded-md bg-gray-50 px-2 py-[3px] text-[11px] text-gray-500">
                {place.category}
              </span>
            </div>

            {/* 이름 */}
            <p className="mb-1 truncate text-[15px] font-bold text-gray-800 lg:mb-1.5 lg:text-[17px]">
              {place.name}
            </p>

            {/* 설명글 */}
            <div className="hidden lg:block">
              {isLoading ? (
                <div className="mb-2.5 space-y-1.5">
                  <div className="h-3 w-full animate-shimmer rounded" />
                  <div className="h-3 w-4/5 animate-shimmer rounded" />
                </div>
              ) : overview ? (
                <p className="mb-2.5 line-clamp-2 text-[13px] leading-relaxed text-gray-500">
                  {overview}
                </p>
              ) : (
                <p className="mb-2.5 text-[13px] text-gray-300">
                  상세 설명이 준비 중이에요
                </p>
              )}
            </div>

            {/* 메타 정보 */}
            <div className="flex items-center gap-3 border-t border-gray-50 pt-2 lg:gap-4 lg:pt-2.5">
              {place.expectedCost !== undefined && place.expectedCost > 0 && (
                <span className="flex items-center gap-1 text-[12px] text-gray-500">
                  <Wallet className="h-3.5 w-3.5 text-green-600" />
                  {place.expectedCost.toLocaleString()}원
                </span>
              )}
              {next?.distanceFromPrevM !== undefined && next.distanceFromPrevM > 0 && (
                <span className="flex items-center gap-1 text-[12px] text-gray-500">
                  <Footprints className="h-3.5 w-3.5 text-blue-600" />
                  다음까지 {formatDistance(next.distanceFromPrevM)}
                </span>
              )}
              <span className="ml-auto flex items-center gap-1 text-[12px] font-semibold text-ocean-600">
                상세보기
                <ArrowRight className="h-3 w-3" />
              </span>
            </div>
          </div>
        </div>
      </button>
      {/* 카드 전체가 버튼이라 길찾기 링크는 형제 요소로 우상단에 겹쳐 배치 */}
      <KakaoDirectionsLink
        name={place.name}
        lat={place.lat}
        lng={place.lng}
        className="absolute right-3 top-3 lg:right-4 lg:top-4"
      />
    </div>
  );
}