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
  useUpdateCourse,
} from "@/features/course/hooks/useCourseResult";
import { useCongestion } from "@/features/home/hooks/useCongestion";
import { buildCourseCongestion } from "@/features/course/utils/courseCongestion";
import { loadCourseBudget } from "@/features/course/utils/budgetStorage";
import CourseSpotPicker from "@/features/course/components/CourseSpotPicker";
import { getDistance } from "@/features/course/data/mockCourse";
import { isFoodCategory } from "@/features/course/hooks/useSpotDescription";
import { CATEGORY_META } from "@/features/spot/constants/categoryMap";
import { CourseUpdateError } from "@/libs/api/course";
import type {
  CourseItemResponse,
  CourseResponse,
  CourseUpdateItem,
} from "@/types/course";
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
    originalId: item.originalId,
    mapPlaceId: item.serialNum,
    // 무료·비용 미상 장소는 null로 오므로 합산·표시가 안전하도록 0으로 맞춘다
    expectedCost: item.expectedCost ?? 0,
    distanceFromPrevM: item.distanceFromPrevM,
  };
}

function toCourse(course: CourseResponse): Course {
  const description = course.description ?? "";
  return {
    id: course.id,
    title: course.title,
    description,
    days: [
      {
        day: 1,
        title: description,
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

// 편집 초안. 저장은 전체 교체(PUT)라 제목·소개도 장소와 함께 들고 있어야
// 바뀌지 않은 값이 그대로 서버에 다시 실린다(소개를 빠뜨리면 지워진다).
interface CourseDraft {
  title: string;
  description: string;
  places: CoursePlace[];
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
  // 코스 장소별 "지금 혼잡도" 배지용 — 실패해도 배지만 안 보일 뿐이라 로딩과 무관
  const { data: congestion } = useCongestion();
  const updateCourse = useUpdateCourse(pairId);

  const [selectedPlaceId, setSelectedPlaceId] = useState<number | null>(null);
  const [modalContentId, setModalContentId] = useState<string | null>(null);
  const [modalPlaceType, setModalPlaceType] = useState<"SPOT" | "FOOD" | null>(null);
  const [modalMapPlaceId, setModalMapPlaceId] = useState<number | null>(null);

  // 편집은 로컬 초안(draft)으로 하고 "저장"을 눌렀을 때 한 번만 PUT 한다.
  // 드래그 한 번에 요청이 나가면 느리고, 중간 상태가 서버에 남기 때문.
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<CourseDraft | null>(null);

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
  const places = draft ? withPreviewDistances(draft.places) : serverPlaces;
  const course: Course = {
    ...serverCourse,
    title: draft?.title ?? serverCourse.title,
    description: draft ? draft.description : serverCourse.description,
    days: [{ ...serverCourse.days[0], places }],
  };
  const congestionByPlaceId = buildCourseCongestion(places, congestion);
  const resolvedPlaceId = selectedPlaceId ?? places[0]?.id ?? null;
  const selectedPlace = places.find((p) => p.id === resolvedPlaceId) ?? places[0];

  // 저장 버튼 활성 조건 — 장소 구성·제목·소개 중 하나라도 서버 값과 달라졌을 때만
  const isDirty =
    draft !== null &&
    (toIdKey(draft.places) !== toIdKey(serverPlaces) ||
      draft.title.trim() !== serverCourse.title ||
      draft.description.trim() !== (serverCourse.description ?? ""));

  // 빈 제목은 서버가 400으로 거절하므로 보내기 전에 막는다. 길이 초과는 maxLength로 이미 막혀 있다.
  const titleError =
    draft !== null && draft.title.trim() === "" ? "코스 제목을 입력해주세요" : undefined;
  const serverError =
    updateCourse.error instanceof CourseUpdateError ? updateCourse.error : null;
  const fieldErrors = {
    title: titleError ?? serverError?.fieldErrors.title,
    description: serverError?.fieldErrors.description,
  };
  // 필드에 붙일 수 있는 오류는 칸 아래에 보여주고, 그 외(장소 오류·충돌·네트워크)만 상단 배너로 낸다
  const saveError = updateCourse.isError
    ? (serverError?.fieldErrors.items ??
      (serverError?.fieldErrors.title || serverError?.fieldErrors.description
        ? null
        : (updateCourse.error?.message ??
          "코스를 저장하지 못했어요. 잠시 후 다시 시도해주세요.")))
    : null;

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

  const updateDraft = (next: CoursePlace[]) =>
    setDraft((prev) => (prev ? { ...prev, places: next } : prev));

  // 서버가 거절한 뒤 다시 고치기 시작하면 이전 오류 표시를 지운다
  const clearServerError = () => {
    if (updateCourse.isError) updateCourse.reset();
  };

  const handleChangeTitle = (title: string) => {
    clearServerError();
    setDraft((prev) => (prev ? { ...prev, title } : prev));
  };

  const handleChangeDescription = (description: string) => {
    clearServerError();
    setDraft((prev) => (prev ? { ...prev, description } : prev));
  };

  const handleStartEdit = () => {
    updateCourse.reset();
    setDraft({
      title: serverCourse.title,
      description: serverCourse.description ?? "",
      places: serverPlaces,
    });
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    updateCourse.reset();
    setDraft(null);
    setIsEditing(false);
    setSelectedPlaceId(null);
  };

  const handleSaveEdit = () => {
    if (!draft || updateCourse.isPending || titleError) return;
    // 전체 교체 방식 — 순번은 배열 순서로 전달하고 serialNum·거리·비용은 서버가 재계산한다.
    // 코스 편집은 현재 SPOT만 허용된다.
    const items = draft.places
      .map((p) => p.originalId)
      .filter((v): v is string => !!v)
      .map<CourseUpdateItem>((originalId) => ({ placeType: "SPOT", originalId }));
    if (items.length !== draft.places.length) return;

    updateCourse.mutate(
      {
        courseId,
        title: draft.title.trim(),
        // 비운 소개는 null로 보내 서버에서도 지워지게 한다
        description: draft.description.trim() || null,
        items,
      },
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
            isSaving={updateCourse.isPending}
            saveError={saveError}
            fieldErrors={fieldErrors}
            onChangeTitle={handleChangeTitle}
            onChangeDescription={handleChangeDescription}
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
