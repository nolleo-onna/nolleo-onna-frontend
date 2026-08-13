"use client";

import { Footprints } from "lucide-react";
import type { CoursePlace, Course } from "@/features/course/data/mockCourse";

interface Props {
  course: Course;
  selectedDay: number;
  selectedPlaceId: number | null;
  onSelectDay: (day: number) => void;
  onSelectPlace: (place: CoursePlace) => void;
}

function formatDistance(m: number) {
  return m >= 1000 ? `${(m / 1000).toFixed(1)}km` : `${m}m`;
}

function formatCost(won: number) {
  if (won >= 10000) return `${(won / 10000).toFixed(1)}만`;
  return `${won.toLocaleString()}원`;
}

export default function CourseSidebar({
  course,
  selectedPlaceId,
  onSelectPlace,
}: Props) {
  const places = course.days[0]?.places ?? [];

  const totalDistance = places.reduce(
    (sum, p) => sum + (p.distanceFromPrevM ?? 0),
    0
  );
  const totalCost = places.reduce((sum, p) => sum + (p.expectedCost ?? 0), 0);

  return (
    <aside className="w-[340px] flex-shrink-0 overflow-y-auto border-r border-gray-100 bg-white">
      <div className="p-5">
        {/* 헤더 */}
        <p className="mb-1 text-[11px] font-semibold tracking-wide text-ocean-600">
          부산 여행 코스
        </p>
        <h1 className="mb-4 text-[19px] font-bold leading-snug text-gray-800">
          {course.title}
        </h1>

        {/* 요약 통계 */}
        <div className="mb-5 grid grid-cols-3 gap-2">
          <div className="rounded-xl bg-gray-50 px-2 py-2.5 text-center">
            <p className="mb-0.5 text-[10px] text-gray-400">장소</p>
            <p className="text-[15px] font-bold text-gray-800">{places.length}곳</p>
          </div>
          <div className="rounded-xl bg-gray-50 px-2 py-2.5 text-center">
            <p className="mb-0.5 text-[10px] text-gray-400">총 거리</p>
            <p className="text-[15px] font-bold text-gray-800">
              {totalDistance > 0 ? formatDistance(totalDistance) : "-"}
            </p>
          </div>
          <div className="rounded-xl bg-gray-50 px-2 py-2.5 text-center">
            <p className="mb-0.5 text-[10px] text-gray-400">예상 비용</p>
            <p className="text-[15px] font-bold text-[#0d3080]">
              {totalCost > 0 ? formatCost(totalCost) : "무료"}
            </p>
          </div>
        </div>

        {/* 코스 설명 */}
        {course.days[0]?.title && (
          <div className="mb-5 rounded-xl bg-gradient-to-br from-[#f6f8ff] to-[#eaf6ff] px-3.5 py-3">
            <p className="text-[12px] leading-relaxed text-gray-600">
              {course.days[0].title}
            </p>
          </div>
        )}

        {/* 타임라인 */}
        <ol className="relative">
          {places.map((place, i) => {
            const isSelected = place.id === selectedPlaceId;
            const isLast = i === places.length - 1;
            const nextDistance = places[i + 1]?.distanceFromPrevM;

            return (
              <li key={place.id}>
                <div className="flex gap-3">
                  {/* 번호 + 연결선 */}
                  <div className="flex flex-shrink-0 flex-col items-center">
                    <div
                      className={`flex h-7 w-7 items-center justify-center rounded-full text-[12px] font-bold transition-colors ${
                        isSelected
                          ? "bg-ocean-500 text-white shadow-[0_2px_8px_rgba(10,132,255,0.4)]"
                          : "border border-gray-200 bg-white text-gray-500"
                      }`}
                    >
                      {i + 1}
                    </div>
                    {!isLast && <div className="w-[2px] flex-1 bg-gray-100" />}
                  </div>

                  {/* 카드 */}
                  <button
                    onClick={() => onSelectPlace(place)}
                    className={`mb-1 flex-1 rounded-xl px-3.5 py-2.5 text-left transition-all ${
                      isSelected
                        ? "bg-ocean-50 ring-1 ring-ocean-200"
                        : "border border-gray-100 hover:border-gray-200 hover:bg-gray-50/60"
                    }`}
                  >
                    <p
                      className={`mb-0.5 truncate text-[14px] font-semibold ${
                        isSelected ? "text-ocean-900" : "text-gray-800"
                      }`}
                    >
                      {place.name}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[11px] ${
                          isSelected ? "text-ocean-600" : "text-gray-400"
                        }`}
                      >
                        {place.category}
                      </span>
                      {place.expectedCost !== undefined && place.expectedCost > 0 && (
                        <span
                          className={`text-[11px] ${
                            isSelected ? "text-ocean-600" : "text-gray-400"
                          }`}
                        >
                          · {place.expectedCost.toLocaleString()}원
                        </span>
                      )}
                    </div>
                  </button>
                </div>

                {/* 이동 거리 */}
                {!isLast && nextDistance !== undefined && nextDistance > 0 && (
                  <div className="flex items-center gap-1.5 py-1 pl-[38px]">
                    <Footprints className="h-3 w-3 text-gray-300" />
                    <span className="text-[11px] text-gray-400">
                      {formatDistance(nextDistance)}
                    </span>
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </aside>
  );
}