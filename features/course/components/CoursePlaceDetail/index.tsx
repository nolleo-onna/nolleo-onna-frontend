"use client";

import Image from "next/image";
import { Wallet, Footprints, ArrowRight, ImageIcon } from "lucide-react";
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
    <div className="absolute bottom-4 left-4 right-4 z-10">
      <button
        onClick={onPlaceClick}
        className="w-full text-left rounded-2xl border border-gray-100 bg-white p-4
                   shadow-[0_8px_32px_rgba(13,48,128,0.12)]
                   hover:shadow-[0_10px_36px_rgba(13,48,128,0.16)]
                   active:scale-[0.995] transition-all duration-200"
      >
        <div className="flex gap-4">
          {/* 썸네일 */}
          <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-gray-50">
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
            <p className="mb-1.5 truncate text-[17px] font-bold text-gray-800">
              {place.name}
            </p>

            {/* 설명글 */}
            {isLoading ? (
              <div className="mb-2.5 space-y-1.5">
                <div className="h-3 w-full animate-pulse rounded bg-gray-100" />
                <div className="h-3 w-4/5 animate-pulse rounded bg-gray-100" />
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

            {/* 메타 정보 */}
            <div className="flex items-center gap-4 border-t border-gray-50 pt-2.5">
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
    </div>
  );
}