"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import Image from "next/image";
import { Reorder, useDragControls } from "motion/react";
import {
  ChevronDown,
  ChevronUp,
  Check,
  Footprints,
  GripVertical,
  Loader2,
  Pencil,
  TriangleAlert,
  X,
} from "lucide-react";
import CourseBudgetGauge from "@/features/course/components/CourseBudgetGauge";
import { CROWD_STYLE } from "@/features/crowd/utils/crowdUtils";
import {
  getCongestedPlaces,
  type PlaceCongestion,
} from "@/features/course/utils/courseCongestion";
import ShareButton from "@/features/course/components/CourseSidebar/ShareButton";
import { HomeListingCard } from "@/features/course/components/CourseSidebar/SharePanels";
import { useCourseShare } from "@/features/course/hooks/useCourseShare";
import type { CoursePlace, Course } from "@/features/course/data/mockCourse";
import { formatDistance, formatCost } from "@/features/course/utils/format";
import { COURSE_DESCRIPTION_MAX, COURSE_TITLE_MAX } from "@/types/course";
import type { CourseShareInfo } from "@/types/course";

interface Props {
  course: Course;
  selectedDay: number;
  selectedPlaceId: number | null;
  /** 사용자가 설정한 예산(원). 없으면 게이지를 표시하지 않는다. */
  budget?: number;
  /** 방금 오른쪽 패널에서 추가한 장소 — 목록에서 잠깐 강조하고 그 자리로 스크롤한다 */
  justAddedPlaceId?: number | null;
  /** 편집 모드 여부. onStartEdit이 넘어올 때만 편집 UI를 노출한다. */
  isEditing?: boolean;
  /** 초안이 서버 구성과 달라졌는지 — 저장 버튼 활성 조건 */
  isDirty?: boolean;
  isSaving?: boolean;
  /** 저장 실패 안내. null이면 표시하지 않는다. */
  saveError?: string | null;
  /** 제목·소개 입력 오류(빈 제목, 서버 400). 있으면 저장 버튼을 막고 칸 아래에 보여준다. */
  fieldErrors?: { title?: string; description?: string };
  /** 편집 모드에서 제목·소개를 바꿀 때. 둘 다 넘어와야 입력칸을 노출한다. */
  onChangeTitle?: (title: string) => void;
  onChangeDescription?: (description: string) => void;
  /** 서버 코스의 공개 상태. 목업 코스는 없다 */
  share?: CourseShareInfo;
  /** 홈 인기 코스에 올릴 때(코스 공개). 발급된 토큰을 돌려준다 */
  onPublish?: () => Promise<string | null>;
  /** 홈에서 내릴 때(코스 비공개) */
  onUnpublish?: () => void;
  isVisibilityPending?: boolean;
  onStartEdit?: () => void;
  onSaveEdit?: () => void;
  onCancelEdit?: () => void;
  onMovePlace?: (id: number, direction: -1 | 1) => void;
  /** 드래그로 순서를 바꿨을 때 전체 순서(id 배열)를 통째로 전달한다 */
  onReorderPlaces?: (orderedIds: number[]) => void;
  /** 장소별 "지금 혼잡도" (없으면 배지를 표시하지 않음) */
  congestionByPlaceId?: Map<number, PlaceCongestion>;
  onRemovePlace?: (id: number) => void;
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
  congestion?: PlaceCongestion;
  index: number;
  isLast: boolean;
  isSelected: boolean;
  isEditing: boolean;
  /** 방금 추가된 장소 — 아래에서 밀려 올라오며 잠깐 강조한다 */
  isJustAdded?: boolean;
  placesCount: number;
  nextDistance?: number;
  onSelectPlace: (place: CoursePlace) => void;
  onMovePlace?: (id: number, direction: -1 | 1) => void;
  onRemovePlace?: (id: number) => void;
}

/** 사이드바 맨 위 표지 — 코스에 담긴 장소 사진을 모자이크로 깔고 제목을 얹는다 */
function CourseCover({ title, places }: { title: string; places: CoursePlace[] }) {
  const photos = places.filter((place) => place.imageUrl).slice(0, 3);

  return (
    <div className="relative mb-4 h-40 overflow-hidden rounded-[20px] bg-gradient-to-br from-navy-700 to-ocean-600 lg:h-44">
      {photos.length > 0 && (
        <div className={`grid h-full gap-0.5 ${photos.length === 1 ? "grid-cols-1" : "grid-cols-[2fr_1fr]"}`}>
          <div className="relative">
            <Image src={photos[0].imageUrl} alt="" fill sizes="340px" className="object-cover" />
          </div>
          {photos.length > 1 && (
            <div className={`grid gap-0.5 ${photos.length > 2 ? "grid-rows-2" : "grid-rows-1"}`}>
              {photos.slice(1).map((photo) => (
                <div key={photo.id} className="relative">
                  <Image src={photo.imageUrl} alt="" fill sizes="120px" className="object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-navy-900/90 via-navy-900/25 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-4">
        <span className="mb-1.5 inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-semibold text-white/90 backdrop-blur-sm">
          <Footprints className="h-3 w-3" />
          {places.length}곳을 잇는 코스
        </span>
        <h1 className="line-clamp-2 text-[19px] font-bold leading-snug text-white break-keep lg:text-[21px]">
          {title}
        </h1>
      </div>
    </div>
  );
}

function SummaryStat({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="px-2 text-center">
      <p className="text-[10px] text-gray-400">{label}</p>
      <p className={`mt-0.5 text-[16px] font-bold tabular-nums ${accent ? "text-ocean-600" : "text-navy-900"}`}>{value}</p>
    </div>
  );
}

// useDragControls는 항목마다 하나씩 필요해서(훅은 반복문에서 못 씀) 분리한 서브 컴포넌트.
// 편집 모드에서는 카드 전체를 잡고 끌 수 있다(dragListener={cardDraggable}).
// 드래그가 실제로 일어난 직후에는 클릭 이벤트가 따라오므로, 장소 선택으로
// 오인되지 않게 isDraggingRef로 걸러낸다.
function PlaceTimelineItem({
  place,
  congestion,
  index,
  isLast,
  isSelected,
  isEditing,
  isJustAdded = false,
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
  const itemRef = useRef<HTMLLIElement>(null);

  // 오른쪽 패널에서 추가하면 목록 맨 아래에 붙는데, 스크롤 밖이면 추가된 걸 못 본다
  useEffect(() => {
    if (!isJustAdded) return;
    itemRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [isJustAdded]);

  return (
    <Reorder.Item
      as="li"
      ref={itemRef}
      value={place}
      initial={isJustAdded ? { opacity: 0, y: 24 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
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
      className={`relative rounded-xl transition-shadow ${isEditing ? "select-none" : ""} ${
        isJustAdded ? "shadow-[0_0_0_2px_var(--color-lime-400)]" : ""
      }`}
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
                ? "bg-navy-900 text-ocean-400 shadow-[0_2px_8px_rgba(5,12,26,0.35)]"
                : "bg-white text-gray-500 ring-1 ring-gray-200"
            }`}
          >
            {index + 1}
          </div>
          {!isLast && <div className="my-1 w-0 flex-1 border-l-2 border-dashed border-gray-200" />}
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
          className={`mb-1 min-w-0 flex-1 rounded-2xl bg-white p-2 pr-3 text-left transition-all ${
            isSelected
              ? "shadow-[0_10px_24px_-14px_rgba(5,12,26,0.45)] ring-2 ring-navy-900"
              : "ring-1 ring-gray-100 hover:shadow-sm hover:ring-gray-200"
          } ${cardDraggable ? "cursor-grab active:cursor-grabbing" : ""}`}
        >
          <div className="flex items-center gap-3">
            {/* 장소 사진 — 코스가 글자 목록이 아니라 실제 가는 곳으로 보이게 */}
            <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gray-100">
              {place.imageUrl ? (
                <Image src={place.imageUrl} alt="" fill sizes="44px" className="object-cover" />
              ) : (
                <Footprints className="h-4 w-4 text-gray-300" />
              )}
            </div>
            <div className="min-w-0 flex-1">
          <p
            className={`mb-0.5 truncate text-[14px] font-semibold ${
              isSelected ? "text-navy-900" : "text-gray-800"
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
            {congestion && (
              <span
                className="ml-auto shrink-0 rounded-full px-1.5 py-[1px] text-[10px] font-bold"
                style={{
                  backgroundColor: CROWD_STYLE[congestion.level].bg,
                  color: CROWD_STYLE[congestion.level].text,
                }}
                title={
                  congestion.source === "district"
                    ? `${congestion.district} 평균 기준`
                    : "관광지 실측 기준"
                }
              >
                {CROWD_STYLE[congestion.level].label}
              </span>
            )}
          </div>
            </div>
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
  isDirty = false,
  isSaving = false,
  saveError = null,
  fieldErrors = {},
  onChangeTitle,
  onChangeDescription,
  share,
  onPublish,
  onUnpublish,
  isVisibilityPending = false,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onMovePlace,
  onReorderPlaces,
  congestionByPlaceId,
  onRemovePlace,
  onSelectPlace,
  justAddedPlaceId = null,
}: Props) {
  const congested = congestionByPlaceId
    ? getCongestedPlaces(course.days[0]?.places ?? [], congestionByPlaceId)
    : [];
  const places = course.days[0]?.places ?? [];

  const totalDistance = places.reduce(
    (sum, p) => sum + (p.distanceFromPrevM ?? 0),
    0
  );
  const totalCost = places.reduce((sum, p) => sum + (p.expectedCost ?? 0), 0);
  // 서버 코스는 description, 목업(관광공사) 코스는 일차 제목을 소개 자리에 쓴다
  const description = course.description ?? course.days[0]?.title ?? "";
  const canEditText = isEditing && !!onChangeTitle && !!onChangeDescription;
  const hasFieldError = !!fieldErrors.title || !!fieldErrors.description;
  // 공유는 코스 내용을 글로 보내고(공개 안 함), 홈 인기 코스 올리기는 아래 카드에서 따로 한다
  const courseShare = useCourseShare({ title: course.title, description, places, share });

  return (
    <aside className="min-h-0 w-full flex-1 overflow-y-auto border-t border-gray-100 bg-white lg:w-[340px] lg:flex-none lg:border-t-0 lg:border-r">
      <div className="p-4 lg:p-5">
        {/* 헤더 */}
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[11px] font-semibold tracking-wide text-ocean-600">
            부산 여행 코스
          </p>
          {/* 편집 중에는 저장/취소만 노출한다 — 저장을 눌러야 서버에 반영된다 */}
          <div className="flex items-center gap-1.5">
            {isEditing ? (
              <>
                <button
                  onClick={onCancelEdit}
                  disabled={isSaving}
                  className="rounded-full px-2 py-1 text-[11px] font-medium text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-600 disabled:opacity-40"
                >
                  취소
                </button>
                <button
                  onClick={onSaveEdit}
                  disabled={!isDirty || isSaving || hasFieldError}
                  className="flex items-center gap-1 rounded-full bg-ocean-500 px-2.5 py-1 text-[11px] font-semibold text-white transition-colors hover:bg-ocean-600 disabled:bg-gray-200 disabled:text-gray-400"
                >
                  {isSaving ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Check className="h-3 w-3" />
                  )}
                  {isSaving ? "저장 중" : "저장"}
                </button>
              </>
            ) : (
              <>
                <ShareButton copied={courseShare.copied} onClick={courseShare.shareCourse} />
                {onStartEdit && (
                  <button
                    onClick={onStartEdit}
                    className="flex items-center gap-1 rounded-full bg-gray-50 px-2.5 py-1 text-[11px] font-semibold text-gray-600 transition-colors hover:bg-gray-100"
                  >
                    <Pencil className="h-3 w-3" />
                    편집
                  </button>
                )}
              </>
            )}
          </div>
        </div>
        {canEditText ? (
          <div className="mb-3 lg:mb-4">
            <label htmlFor="course-title" className="sr-only">
              코스 제목
            </label>
            <input
              id="course-title"
              type="text"
              value={course.title}
              maxLength={COURSE_TITLE_MAX}
              placeholder="코스 제목"
              aria-invalid={!!fieldErrors.title}
              onChange={(e) => onChangeTitle?.(e.target.value)}
              className={`w-full rounded-lg border bg-white px-3 py-2 text-[16px] font-bold leading-snug text-gray-800 outline-none transition-colors focus:border-ocean-500 lg:text-[19px] ${
                fieldErrors.title ? "border-pink-300" : "border-gray-200"
              }`}
            />
            <div className="mt-1 flex items-center justify-between gap-2 text-[11px]">
              <span className="text-pink-600">{fieldErrors.title}</span>
              <span className="shrink-0 tabular-nums text-gray-400">
                {course.title.length}/{COURSE_TITLE_MAX}
              </span>
            </div>
          </div>
        ) : (
          <CourseCover title={course.title} places={places} />
        )}

        {/* 홈 인기 코스 올리기/내리기 — 헤더 공유와 별개 */}
        {share && !isEditing && (
          <HomeListingCard
            share={share}
            isPending={!!isVisibilityPending}
            onList={onPublish ? () => void onPublish() : undefined}
            onUnlist={onUnpublish}
          />
        )}

        {saveError && (
          <p
            role="alert"
            className="mb-3 rounded-lg bg-pink-50 px-3 py-2 text-[11px] font-medium text-pink-600"
          >
            {saveError}
          </p>
        )}

        {/* 요약 통계 — 칸 세 개 대신 구분선 한 줄 */}
        <div
          className={`mb-4 grid-cols-3 divide-x divide-gray-100 rounded-2xl bg-white py-3 ring-1 ring-gray-100 lg:mb-5 lg:grid ${
            isEditing ? "hidden" : "grid"
          }`}
        >
          <SummaryStat label="장소" value={`${places.length}곳`} />
          <SummaryStat label="총 거리" value={totalDistance > 0 ? formatDistance(totalDistance) : "-"} />
          <SummaryStat label="예상 비용" value={totalCost > 0 ? formatCost(totalCost) : "무료"} accent />
        </div>

        {/* 예산 게이지 */}
        {budget !== undefined && (
          <div className={isEditing ? "hidden lg:block" : ""}>
            <CourseBudgetGauge budget={budget} totalCost={totalCost} />
          </div>
        )}

        {/* 코스 소개 — 편집 모드에서는 입력칸, 비우고 저장하면 소개가 지워진다 */}
        {canEditText ? (
          <div className="mb-4 lg:mb-5">
            <label htmlFor="course-description" className="sr-only">
              코스 소개
            </label>
            <textarea
              id="course-description"
              value={description}
              rows={3}
              maxLength={COURSE_DESCRIPTION_MAX}
              placeholder="코스 소개 (선택)"
              aria-invalid={!!fieldErrors.description}
              onChange={(e) => onChangeDescription?.(e.target.value)}
              className={`w-full resize-none rounded-xl border bg-white px-3.5 py-3 text-[12px] leading-relaxed text-gray-600 outline-none transition-colors focus:border-ocean-500 ${
                fieldErrors.description ? "border-pink-300" : "border-gray-200"
              }`}
            />
            <div className="mt-1 flex items-center justify-between gap-2 text-[11px]">
              <span className="text-pink-600">{fieldErrors.description}</span>
              <span className="shrink-0 tabular-nums text-gray-400">
                {description.length}/{COURSE_DESCRIPTION_MAX}
              </span>
            </div>
          </div>
        ) : (
          description && (
            <div
              className={`mb-4 border-l-2 border-lime-300 py-0.5 pl-3.5 lg:mb-5 ${
                isEditing ? "hidden lg:block" : ""
              }`}
            >
              <p className="text-[13px] leading-relaxed text-gray-600 break-keep">
                {description}
              </p>
            </div>
          )
        )}

        {/* 지금 혼잡도 요약 — 혼잡한 곳이 있으면 경고, 데이터가 있고 모두 원활하면 안심 문구 */}
        {congestionByPlaceId && congestionByPlaceId.size > 0 && (
          congested.length > 0 ? (
            <div className="mb-4 rounded-2xl bg-orange-50/80 px-3.5 py-3 ring-1 ring-orange-100">
              <p className="text-[12px] font-semibold text-orange-700">
                <TriangleAlert className="mr-1 inline h-3.5 w-3.5 -translate-y-px" />
                지금 {congested[0].name}
                {congested.length > 1 && ` 외 ${congested.length - 1}곳`}이 붐벼요
              </p>
              {onStartEdit && !isEditing && (
                <button
                  onClick={onStartEdit}
                  className="mt-1 text-[11px] font-medium text-orange-600 underline underline-offset-2 hover:text-orange-800"
                >
                  편집에서 여유로운 곳으로 바꿔보기
                </button>
              )}
            </div>
          ) : (
            <p className="mb-4 flex items-center gap-1 text-[11px] text-ocean-600">
              ✓ 지금 코스의 모든 장소가 원활해요
            </p>
          )
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
              congestion={congestionByPlaceId?.get(place.id)}
              index={i}
              isLast={i === places.length - 1}
              isSelected={place.id === selectedPlaceId}
              isEditing={isEditing}
              isJustAdded={place.id === justAddedPlaceId}
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