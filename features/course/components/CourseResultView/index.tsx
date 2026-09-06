"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

import CourseSidebar from "@/features/course/components/CourseSidebar";
import CoursePlaceDetail from "@/features/course/components/CoursePlaceDetail";
import SpotDetailModal from "@/features/spot/components/SpotDetailModal";
import MapSkeleton from "@/components/ui/Skeleton/MapSkeleton";
import {
  useCourseResult,
  useUpdateCourseItems,
} from "@/features/course/hooks/useCourseResult";
import { useCongestion } from "@/features/home/hooks/useCongestion";
import { buildCourseCongestion } from "@/features/course/utils/courseCongestion";
import { loadCourseBudget } from "@/features/course/utils/budgetStorage";
import CourseSpotPicker from "@/features/course/components/CourseSpotPicker";
import { getDistance } from "@/features/course/data/mockCourse";
import { isFoodCategory } from "@/features/course/hooks/useSpotDescription";
import { CATEGORY_META } from "@/features/spot/constants/categoryMap";
import type { CourseItemResponse, CourseResponse } from "@/types/course";
import type { CoursePlace, Course } from "@/features/course/data/mockCourse";
import type { MapPlace } from "@/types/map";

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
    // 무료·비용 미상 장소는 null로 오므로 합산·표시가 안전하도록 0으로 맞춘다
    expectedCost: item.expectedCost ?? 0,
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

// 편집 중(저장 전)에는 서버가 준 경로 거리가 더 이상 맞지 않아 좌표 기반
// 직선거리로 미리보기를 만든다. 저장하면 서버가 재계산한 값으로 대체된다.
function withPreviewDistances(places: CoursePlace[]): CoursePlace[] {
  return places.map((place, i) => ({
    ...place,
    distanceFromPrevM: i === 0 ? 0 : Math.round(getDistance(places[i - 1], place)),
  }));
}

const toIdKey = (places: CoursePlace[]) =>
  places.map((p) => p.originalId ?? "").join(",");

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
  // 코스 장소별 "지금 혼잡도" 배지용 — 실패해도 배지만 안 보일 뿐이라 로딩과 무관
  const { data: congestion } = useCongestion();
  const updateItems = useUpdateCourseItems(pairId);

  const [selectedPlaceId, setSelectedPlaceId] = useState<number | null>(null);
  const [modalContentId, setModalContentId] = useState<string | null>(null);
  const [modalPlaceType, setModalPlaceType] = useState<"SPOT" | "FOOD" | null>(null);
  const [modalMapPlaceId, setModalMapPlaceId] = useState<number | null>(null);

  // 편집은 로컬 초안(draft)으로 하고 "저장"을 눌렀을 때 한 번만 PUT 한다.
  // 드래그 한 번에 요청이 나가면 느리고, 중간 상태가 서버에 남기 때문.
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<CoursePlace[] | null>(null);

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
  const serverCourse = toCourse(data[0]);
  const courseId = data[0].id;
  const serverPlaces = serverCourse.days[0].places;
  const places = draft ? withPreviewDistances(draft) : serverPlaces;
  const course: Course = {
    ...serverCourse,
    days: [{ ...serverCourse.days[0], places }],
  };
  const congestionByPlaceId = buildCourseCongestion(places, congestion);
  const resolvedPlaceId = selectedPlaceId ?? places[0]?.id ?? null;
  const selectedPlace = places.find((p) => p.id === resolvedPlaceId) ?? places[0];

  // 저장 버튼 활성 조건 — 서버 구성과 실제로 달라졌을 때만
  const isDirty = draft !== null && toIdKey(draft) !== toIdKey(serverPlaces);

  // 스팟 피커에서 "이미 담김" 표시용
  const existingIds = new Set(
    places.map((p) => p.originalId).filter((v): v is string => !!v),
  );

  // 스팟 피커 "가까운 순" 기준점 — 코스 장소들의 좌표 평균
  const courseCenter =
    places.length > 0
      ? {
          lat: places.reduce((sum, p) => sum + p.lat, 0) / places.length,
          lng: places.reduce((sum, p) => sum + p.lng, 0) / places.length,
        }
      : undefined;

  const updateDraft = (next: CoursePlace[]) => setDraft(next);

  const handleStartEdit = () => {
    updateItems.reset();
    setDraft(serverPlaces);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    updateItems.reset();
    setDraft(null);
    setIsEditing(false);
    setSelectedPlaceId(null);
  };

  const handleSaveEdit = () => {
    if (!draft || updateItems.isPending) return;
    // 백엔드는 최종 순서의 spotContentId만 받는다. serialNum·거리·비용은 서버가 재계산.
    const spotContentIds = draft
      .map((p) => p.originalId)
      .filter((v): v is string => !!v);
    if (spotContentIds.length !== draft.length) return;

    updateItems.mutate(
      { courseId, spotContentIds },
      {
        onSuccess: () => {
          // 응답으로 캐시가 갱신되므로 초안을 버리고 서버 값으로 돌아간다
          setDraft(null);
          setIsEditing(false);
          setSelectedPlaceId(null);
        },
      },
    );
  };

  const handleMovePlace = (id: number, direction: -1 | 1) => {
    if (!draft) return;
    const index = places.findIndex((p) => p.id === id);
    const targetIndex = index + direction;
    if (index < 0 || targetIndex < 0 || targetIndex >= places.length) return;
    const next = [...places];
    [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
    updateDraft(next);
  };

  // 드래그 정렬은 바뀐 전체 순서를 한 번에 받는다
  const handleReorderPlaces = (order: number[]) => {
    if (!draft) return;
    const byId = new Map(places.map((p) => [p.id, p]));
    const next = order
      .map((id) => byId.get(id))
      .filter((p): p is CoursePlace => p !== undefined);
    if (next.length !== places.length) return;
    updateDraft(next);
  };

  const handleRemovePlace = (id: number) => {
    if (!draft || places.length <= 1) return;
    updateDraft(places.filter((p) => p.id !== id));
    if (selectedPlaceId === id) setSelectedPlaceId(null);
  };

  const handleAddPlace = (place: MapPlace) => {
    if (!draft) return;
    // 원본 serialNum(양수)과 겹치지 않게 음수 id를 쓴다. 저장하면 서버가
    // 새 serialNum을 매겨주므로 이 id는 편집 중에만 쓰인다.
    const added: CoursePlace = {
      id: -place.id,
      name: place.name,
      category:
        CATEGORY_META[place.category as keyof typeof CATEGORY_META]?.label ??
        "기타",
      description: "",
      lat: place.latitude,
      lng: place.longitude,
      rating: 0,
      reviewCount: 0,
      imageUrl: place.imageUrl ?? "",
      originalId: place.originalId,
      mapPlaceId: place.id,
      expectedCost: place.free ? 0 : (place.minPrice ?? 0),
      distanceFromPrevM: 0,
    };
    updateDraft([...places, added]);
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
        {/* 모바일: 지도 위 + 타임라인 아래(편집 시 지도 대신 추가 패널) / lg: 가로 3컬럼 */}
        <div className="flex flex-1 flex-col overflow-hidden lg:flex-row">
          <CourseSidebar
            course={course}
            selectedDay={1}
            selectedPlaceId={resolvedPlaceId}
            budget={budget}
            isEditing={isEditing}
            isDirty={isDirty}
            isSaving={updateItems.isPending}
            saveError={
              updateItems.isError
                ? (updateItems.error?.message ??
                  "코스를 저장하지 못했어요. 잠시 후 다시 시도해주세요.")
                : null
            }
            onStartEdit={handleStartEdit}
            onSaveEdit={handleSaveEdit}
            onCancelEdit={handleCancelEdit}
            congestionByPlaceId={congestionByPlaceId}
            onMovePlace={handleMovePlace}
            onReorderPlaces={handleReorderPlaces}
            onRemovePlace={handleRemovePlace}
            onSelectDay={() => {}}
            onSelectPlace={handleSelectPlace}
          />
          <main
            className={`relative order-first w-full shrink-0 lg:order-none lg:h-auto lg:w-auto lg:flex-1 ${
              isEditing ? "hidden lg:block" : "h-[42vh]"
            }`}
          >
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
                congestion={congestionByPlaceId.get(selectedPlace.id)}
                onSelectDay={() => {}}
                onPlaceClick={handlePlaceClick}
              />
            )}
          </main>

          {/* 편집 모드: 스팟 검색·추가 패널 */}
          {isEditing && (
            <CourseSpotPicker
              existingIds={existingIds}
              courseCenter={courseCenter}
              onAddPlace={handleAddPlace}
            />
          )}
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
