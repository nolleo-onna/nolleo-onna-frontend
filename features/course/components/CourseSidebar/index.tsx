"use client";

import { useRef, useSyncExternalStore } from "react";
import { Reorder, useDragControls } from "motion/react";
import {
  ChevronDown,
  ChevronUp,
  Footprints,
  GripVertical,
  Pencil,
  RotateCcw,
  X,
} from "lucide-react";
import CourseBudgetGauge from "@/features/course/components/CourseBudgetGauge";
import ShareButton from "@/features/course/components/CourseSidebar/ShareButton";
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
  /** 드래그로 순서를 바꿨을 때 전체 순서(id 배열)를 통째로 전달한다 */
  onReorderPlaces?: (orderedIds: number[]) => void;
  onRemovePlace?: (id: number) => void;
  onResetCustomization?: () => void;
  onSelectDay: (day: number) => void;
  onSelectPlace: (place: CoursePlace) => void;
}

// 모바일(터치)에서는 카드 전체가 드래그 대상이면 목록 스크롤이 안 돼서,
// lg(1024px) 이상에서만 카드 전체 드래그를 켜고 그 미만에서는 그립 핸들로만 끈다.
const DESKTOP_QUERY = "(min-width: 1024px)";

function subscribeDesktop(callback: () => void) {
  const mql = window.matchMedia(DESKTOP_QUERY);
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

function useIsDesktop() {
  return useSyncExternalStore(
    subscribeDesktop,
    () => window.matchMedia(DESKTOP_QUERY).matches,
    () => false, // SSR에서는 모바일 기준(핸들 전용)으로 시작
  );
}

interface PlaceTimelineItemProps {
  place: CoursePlace;
  index: number;
  isLast: boolean;
  isSelected: boolean;
  isEditing: boolean;
  placesCount: number;
  nextDistance?: number;
  onSelectPlace: (place: CoursePlace) => void;
  onMovePlace?: (id: number, direction: -1 | 1) => void;
  onRemovePlace?: (id: number) => void;
}

// useDragControls는 항목마다 하나씩 필요해서(훅은 반복문에서 못 씀) 분리한 서브 컴포넌트.
// 편집 모드에서는 카드 전체를 잡고 끌 수 있다(dragListener={cardDraggable}).
// 드래그가 실제로 일어난 직후에는 클릭 이벤트가 따라오므로, 장소 선택으로
// 오인되지 않게 isDraggingRef로 걸러낸다.
function PlaceTimelineItem({
  place,
  index,
  isLast,
  isSelected,
  isEditing,
  placesCount,
  nextDistance,
  onSelectPlace,
  onMovePlace,
  onRemovePlace,
}: PlaceTimelineItemProps) {
  const dragControls = useDragControls();
  const isDraggingRef = useRef(false);
  const isDesktop = useIsDesktop();
  const cardDraggable = isEditing && isDesktop;

  return (
    <Reorder.Item
      as="li"
      value={place}
      dragListener={cardDraggable}
      dragControls={dragControls}
      onDragStart={() => {
        isDraggingRef.current = true;
      }}
      onDragEnd={() => {
        // 드래그 종료 직후 발생하는 click까지 무시되도록 다음 틱에 해제
        setTimeout(() => {
          isDraggingRef.current = false;
        }, 0);
      }}
      className={`relative ${isEditing ? "select-none" : ""}`}
      whileDrag={{
        scale: 1.02,
        zIndex: 10,
        boxShadow: "0 8px 24px rgba(13,48,128,0.15)",
        borderRadius: 12,
        backgroundColor: "#ffffff",
      }}
    >
      <div className="flex gap-2 lg:gap-3">
        {/* 번호 + 연결선 */}
        <div className="flex flex-shrink-0 flex-col items-center">
          <div
            className={`flex h-7 w-7 items-center justify-center rounded-full text-[12px] font-bold transition-colors ${
              isSelected
                ? "bg-ocean-500 text-white shadow-[0_2px_8px_rgba(10,132,255,0.4)]"
                : "border border-gray-200 bg-white text-gray-500"
            }`}
          >
            {index + 1}
          </div>
          {!isLast && <div className="w-[2px] flex-1 bg-gray-100" />}
        </div>

        {/* 드래그 핸들 (편집 모드 전용) */}
        {isEditing && (
          <button
            type="button"
            aria-label={`${place.name} 잡고 끌어서 순서 바꾸기`}
            onPointerDown={(e) => {
              e.preventDefault();
              dragControls.start(e);
            }}
            className="mb-1 flex cursor-grab touch-none items-center rounded-md px-0.5 text-gray-300 transition-colors hover:bg-gray-100 hover:text-gray-500 active:cursor-grabbing"
          >
            <GripVertical className="h-4 w-4" />
          </button>
        )}

        {/* 카드 — 편집 모드에서는 카드 자체를 잡고 끌어 순서를 바꿀 수 있다 */}
        <button
          onClick={() => {
            if (isDraggingRef.current) return;
            onSelectPlace(place);
          }}
          className={`mb-1 min-w-0 flex-1 rounded-xl px-3 py-2.5 text-left transition-all lg:px-3.5 ${
            isSelected
              ? "bg-ocean-50 ring-1 ring-ocean-200"
              : "border border-gray-100 hover:border-gray-200 hover:bg-gray-50/60"
          } ${cardDraggable ? "cursor-grab active:cursor-grabbing" : ""}`}
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
          <div className="mb-1 flex shrink-0 flex-col items-center justify-center gap-0.5">
            <button
              onClick={() => onMovePlace?.(place.id, -1)}
              disabled={index === 0}
              aria-label={`${place.name} 순서 위로`}
              className="rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <ChevronUp className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => onRemovePlace?.(place.id)}
              disabled={placesCount <= 1}
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
    </Reorder.Item>
  );
}

export default function CourseSidebar({
  course,
  selectedPlaceId,
  budget,
  isEditing = false,
  hasCustomization = false,
  onToggleEdit,
  onMovePlace,
  onReorderPlaces,
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
    <aside className="min-h-0 w-full flex-1 overflow-y-auto border-t border-gray-100 bg-white lg:w-[340px] lg:flex-none lg:border-t-0 lg:border-r">
      <div className="p-4 lg:p-5">
        {/* 헤더 */}
        <div className="mb-1 flex items-center justify-between">
          <p className="text-[11px] font-semibold tracking-wide text-ocean-600">
            부산 여행 코스
          </p>
          <div className="flex items-center gap-1.5">
            {onToggleEdit && hasCustomization && (
              <button
                onClick={onResetCustomization}
                className="flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-medium text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-600"
              >
                <RotateCcw className="h-3 w-3" />
                원래대로
              </button>
            )}
            <ShareButton title={course.title} />
            {onToggleEdit && (
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
            )}
          </div>
        </div>
        <h1 className="mb-3 text-[16px] font-bold leading-snug text-gray-800 lg:mb-4 lg:text-[19px]">
          {course.title}
        </h1>

        {/* 요약 통계 */}
        <div className={`mb-4 grid-cols-3 gap-2 lg:mb-5 lg:grid ${isEditing ? "hidden" : "grid"}`}>
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
          <div className={isEditing ? "hidden lg:block" : ""}>
            <CourseBudgetGauge budget={budget} totalCost={totalCost} />
          </div>
        )}

        {/* 코스 설명 */}
        {course.days[0]?.title && (
          <div
            className={`mb-4 rounded-xl bg-gradient-to-br from-[#f6f8ff] to-[#eaf6ff] px-3.5 py-3 lg:mb-5 ${
              isEditing ? "hidden lg:block" : ""
            }`}
          >
            <p className="text-[12px] leading-relaxed text-gray-600">
              {course.days[0].title}
            </p>
          </div>
        )}

        {/* 타임라인 — 편집 모드에서는 드래그(잡고 끌기)로도 순서를 바꿀 수 있다 */}
        <Reorder.Group
          as="ol"
          axis="y"
          values={places}
          onReorder={(next: CoursePlace[]) =>
            onReorderPlaces?.(next.map((p) => p.id))
          }
          className="relative"
        >
          {places.map((place, i) => (
            <PlaceTimelineItem
              key={place.id}
              place={place}
              index={i}
              isLast={i === places.length - 1}
              isSelected={place.id === selectedPlaceId}
              isEditing={isEditing}
              placesCount={places.length}
              nextDistance={places[i + 1]?.distanceFromPrevM}
              onSelectPlace={onSelectPlace}
              onMovePlace={onMovePlace}
              onRemovePlace={onRemovePlace}
            />
          ))}
        </Reorder.Group>
      </div>
    </aside>
  );
}