"use client";

import { ChevronDown, ChevronUp, Footprints, Pencil, RotateCcw, X } from "lucide-react";
import CourseBudgetGauge from "@/features/course/components/CourseBudgetGauge";
import type { CoursePlace, Course } from "@/features/course/data/mockCourse";
import { formatDistance, formatCost } from "@/features/course/utils/format";

interface Props {
  course: Course;
  selectedDay: number;
  selectedPlaceId: number | null;
  /** 사용자가 설정한 예산(원). 없으면 게이지를 표시하지 않는다. */
  budget?: number;
  /** 편집 모드 여부. 편집 콜백들과 함께 넘어올 때만 편집 UI를 노출한다. */
  isEditing?: boolean;
  hasCustomization?: boolean;
  onToggleEdit?: () => void;
  onMovePlace?: (id: number, direction: -1 | 1) => void;
  onRemovePlace?: (id: number) => void;
  onResetCustomization?: () => void;
  onSelectDay: (day: number) => void;
  onSelectPlace: (place: CoursePlace) => void;
}

export default function CourseSidebar({
  course,
  selectedPlaceId,
  budget,
  isEditing = false,
  hasCustomization = false,
  onToggleEdit,
  onMovePlace,
  onRemovePlace,
  onResetCustomization,
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
        <div className="mb-1 flex items-center justify-between">
          <p className="text-[11px] font-semibold tracking-wide text-ocean-600">
            부산 여행 코스
          </p>
          {onToggleEdit && (
            <div className="flex items-center gap-1.5">
              {hasCustomization && (
                <button
                  onClick={onResetCustomization}
                  className="flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-medium text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-600"
                >
                  <RotateCcw className="h-3 w-3" />
                  원래대로
                </button>
              )}
              <button
                onClick={onToggleEdit}
                className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                  isEditing
                    ? "bg-ocean-500 text-white"
                    : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Pencil className="h-3 w-3" />
                {isEditing ? "완료" : "편집"}
              </button>
            </div>
          )}
        </div>
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

        {/* 예산 게이지 */}
        {budget !== undefined && (
          <CourseBudgetGauge budget={budget} totalCost={totalCost} />
        )}

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

                  {/* 편집 컨트롤 */}
                  {isEditing && (
                    <div className="mb-1 flex flex-col items-center justify-center gap-0.5">
                      <button
                        onClick={() => onMovePlace?.(place.id, -1)}
                        disabled={i === 0}
                        aria-label={`${place.name} 순서 위로`}
                        className="rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 disabled:opacity-30 disabled:hover:bg-transparent"
                      >
                        <ChevronUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => onRemovePlace?.(place.id)}
                        disabled={places.length <= 1}
                        aria-label={`${place.name} 코스에서 제외`}
                        className="rounded-md p-1 text-gray-400 transition-colors hover:bg-pink-50 hover:text-pink-500 disabled:opacity-30 disabled:hover:bg-transparent"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => onMovePlace?.(place.id, 1)}
                        disabled={isLast}
                        aria-label={`${place.name} 순서 아래로`}
                        className="rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 disabled:opacity-30 disabled:hover:bg-transparent"
                      >
                        <ChevronDown className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
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