"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

import CourseSidebar from "@/features/course/components/CourseSidebar";
import CoursePlaceDetail from "@/features/course/components/CoursePlaceDetail";
import SpotDetailModal from "@/features/spot/components/SpotDetailModal";
import MapSkeleton from "@/components/ui/Skeleton/MapSkeleton";
import { useCourseResult } from "@/features/course/hooks/useCourseResult";
import { loadCourseBudget } from "@/features/course/utils/budgetStorage";
import {
  type CourseCustomization,
  clearCourseCustomization,
  loadCourseCustomization,
  saveCourseCustomization,
} from "@/features/course/utils/courseCustomization";
import { getDistance } from "@/features/course/data/mockCourse";
import { isFoodCategory } from "@/features/course/hooks/useSpotDescription";
import type {
  CourseItemResponse,
  CourseResponse,
} from "@/features/course/hooks/useCourseResult";
import type { CoursePlace, Course } from "@/features/course/data/mockCourse";

const CourseMap = dynamic(() => import("@/features/course/components/CourseMap"), {
  ssr: false,
  loading: () => <MapSkeleton />,
});

function toPlace(item: CourseItemResponse): CoursePlace {
  return {
    id: item.serialNum,
    name: item.title,
    category: item.category,
    lat: item.mapY,
    lng: item.mapX,
    imageUrl: item.firstImage ?? "",
    description: "",
    rating: 0,
    reviewCount: 0,
    originalId: item.spotContentId,
    mapPlaceId: item.serialNum,
    expectedCost: item.expectedCost,
    distanceFromPrevM: item.distanceFromPrevM,
  };
}

function toCourse(course: CourseResponse): Course {
  return {
    id: course.id,
    title: course.title,
    days: [
      {
        day: 1,
        title: course.description || "",
        places: course.items.map(toPlace),
      },
    ],
  };
}

function applyCustomization(
  places: CoursePlace[],
  customization?: CourseCustomization,
): CoursePlace[] {
  if (!customization) return places;
  const removed = new Set(customization.removed ?? []);
  let list = places.filter((p) => !removed.has(p.id));
  if (customization.order?.length) {
    const rank = new Map(customization.order.map((id, i) => [id, i]));
    list = [...list].sort(
      (a, b) => (rank.get(a.id) ?? Infinity) - (rank.get(b.id) ?? Infinity),
    );
  }
  // 순서/구성이 바뀌면 백엔드가 준 경로 거리가 더 이상 맞지 않아
  // 좌표 기반 직선거리로 다시 계산한다.
  return list.map((p, i) => ({
    ...p,
    distanceFromPrevM: i === 0 ? 0 : Math.round(getDistance(list[i - 1], p)),
  }));
}

export default function CourseResultView() {
  const searchParams = useSearchParams();
  const pairId = searchParams.get("pairId");
  // 검색바에서 예산을 확정하고 생성한 코스만 budget 파라미터를 갖는다.
  const budgetParam = searchParams.get("budget");
  const paramBudget =
    budgetParam !== null && /^\d+$/.test(budgetParam)
      ? Number(budgetParam)
      : undefined;

  // 코스 목록 등 budget 파라미터 없는 경로로 들어오면 생성 시 저장해둔
  // 값에서 복원한다. localStorage는 SSR에 없어 마운트 후에만 읽는다.
  const [storedBudget, setStoredBudget] = useState<number | undefined>(undefined);
  useEffect(() => {
    if (paramBudget !== undefined || !pairId) return;
    /* eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage는 마운트 후에만 읽어야 하이드레이션 불일치가 안 생김 */
    setStoredBudget(loadCourseBudget(pairId));
  }, [paramBudget, pairId]);

  const budget = paramBudget ?? storedBudget;

  const { data, isLoading, isError } = useCourseResult(pairId);

  const [selectedPlaceId, setSelectedPlaceId] = useState<number | null>(null);
  const [modalContentId, setModalContentId] = useState<string | null>(null);
  const [modalPlaceType, setModalPlaceType] = useState<"SPOT" | "FOOD" | null>(null);
  const [modalMapPlaceId, setModalMapPlaceId] = useState<number | null>(null);

  // 사용자가 바꾼 장소 순서/제외 목록. 백엔드 수정 API가 없어 localStorage로 유지한다.
  const [isEditing, setIsEditing] = useState(false);
  const [customization, setCustomization] = useState<
    CourseCustomization | undefined
  >(undefined);
  useEffect(() => {
    if (!pairId) return;
    /* eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage는 마운트 후에만 읽어야 하이드레이션 불일치가 안 생김 */
    setCustomization(loadCourseCustomization(pairId));
  }, [pairId]);

  if (isError) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-sm text-gray-500">
          코스를 불러오지 못했어요. 다시 시도해주세요.
        </p>
      </div>
    );
  }

  if (isLoading || !data || data.length === 0) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-ocean-500" />
        <p className="text-sm text-gray-500">AI가 코스를 생성하고 있어요...</p>
      </div>
    );
  }

  // 코스 생성은 pairId당 1건만 만들어지므로 여러 개가 와도 첫 번째만 보여준다.
  const originalCourse = toCourse(data[0]);
  const originalPlaces = originalCourse.days[0].places;
  const places = applyCustomization(originalPlaces, customization);
  const course: Course = {
    ...originalCourse,
    days: [{ ...originalCourse.days[0], places }],
  };
  const resolvedPlaceId = selectedPlaceId ?? places[0]?.id ?? null;
  const selectedPlace = places.find((p) => p.id === resolvedPlaceId) ?? places[0];

  const hasCustomization =
    customization !== undefined &&
    ((customization.removed?.length ?? 0) > 0 ||
      (customization.order?.length ?? 0) > 0);

  const updateCustomization = (next: CourseCustomization) => {
    if (!pairId) return;
    setCustomization(next);
    saveCourseCustomization(pairId, next);
  };

  const handleMovePlace = (id: number, direction: -1 | 1) => {
    const index = places.findIndex((p) => p.id === id);
    const targetIndex = index + direction;
    if (index < 0 || targetIndex < 0 || targetIndex >= places.length) return;
    const order = places.map((p) => p.id);
    [order[index], order[targetIndex]] = [order[targetIndex], order[index]];
    updateCustomization({ ...customization, order });
  };

  const handleRemovePlace = (id: number) => {
    if (places.length <= 1) return;
    updateCustomization({
      order: places.map((p) => p.id).filter((pid) => pid !== id),
      removed: [...(customization?.removed ?? []), id],
    });
    if (selectedPlaceId === id) setSelectedPlaceId(null);
  };

  const handleResetCustomization = () => {
    if (!pairId) return;
    clearCourseCustomization(pairId);
    setCustomization(undefined);
    setSelectedPlaceId(null);
  };

  const handleSelectPlace = (place: CoursePlace) => setSelectedPlaceId(place.id);

  const handlePlaceClick = () => {
    if (!selectedPlace) return;
    setModalContentId(selectedPlace.originalId ?? null);
    setModalPlaceType(isFoodCategory(selectedPlace.category) ? "FOOD" : "SPOT");
    setModalMapPlaceId(selectedPlace.mapPlaceId ?? null);
  };

  const handleModalClose = () => {
    setModalContentId(null);
    setModalPlaceType(null);
    setModalMapPlaceId(null);
  };

  return (
    <>
      <div className="flex h-screen flex-col pt-16">
        {/* 사이드바 + 지도 */}
        <div className="flex flex-1 overflow-hidden">
          <CourseSidebar
            course={course}
            selectedDay={1}
            selectedPlaceId={resolvedPlaceId}
            budget={budget}
            isEditing={isEditing}
            hasCustomization={hasCustomization}
            onToggleEdit={() => setIsEditing((prev) => !prev)}
            onMovePlace={handleMovePlace}
            onRemovePlace={handleRemovePlace}
            onResetCustomization={handleResetCustomization}
            onSelectDay={() => {}}
            onSelectPlace={handleSelectPlace}
          />
          <main className="relative flex-1">
            <CourseMap
              places={places}
              selectedPlaceId={resolvedPlaceId}
              onSelectPlace={handleSelectPlace}
            />
            {selectedPlace && (
              <CoursePlaceDetail
                course={course}
                selectedDay={1}
                place={selectedPlace}
                onSelectDay={() => {}}
                onPlaceClick={handlePlaceClick}
              />
            )}
          </main>
        </div>
      </div>

      <SpotDetailModal
        contentId={modalContentId}
        placeType={modalPlaceType}
        mapPlaceId={modalMapPlaceId}
        onClose={handleModalClose}
      />
    </>
  );
}