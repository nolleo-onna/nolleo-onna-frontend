"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";

import CourseMap from "@/features/course/components/CourseMap";
import CourseSidebar from "@/features/course/components/CourseSidebar";
import CoursePlaceDetail from "@/features/course/components/CoursePlaceDetail";
import SpotDetailModal from "@/features/spot/components/SpotDetailModal";
import { useCourseResult } from "@/features/course/hooks/useCourseResult";
import { isFoodCategory } from "@/features/course/hooks/useSpotDescription";
import type {
  CourseItemResponse,
  CourseResponse,
} from "@/features/course/hooks/useCourseResult";
import type { CoursePlace, Course } from "@/features/course/data/mockCourse";

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

export default function CourseResultView() {
  const searchParams = useSearchParams();
  const pairId = searchParams.get("pairId");

  const { data, isLoading, isError, hasTimedOut } = useCourseResult(pairId);

  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [selectedPlaceId, setSelectedPlaceId] = useState<number | null>(null);
  const [modalContentId, setModalContentId] = useState<string | null>(null);
  const [modalPlaceType, setModalPlaceType] = useState<"SPOT" | "FOOD" | null>(null);
  const [modalMapPlaceId, setModalMapPlaceId] = useState<number | null>(null);

  if (isError) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-sm text-gray-500">
          코스를 불러오지 못했어요. 다시 시도해주세요.
        </p>
      </div>
    );
  }

  if (!isLoading && hasTimedOut && (!data || data.length === 0)) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-sm text-gray-500">
          코스 생성이 지연되고 있어요. 잠시 후 다시 시도해주세요.
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

  const activeCourse = data.find((c) => c.id === selectedCourseId) ?? data[0];
  const course = toCourse(activeCourse);
  const places = course.days[0].places;
  const resolvedPlaceId = selectedPlaceId ?? places[0]?.id ?? null;
  const selectedPlace = places.find((p) => p.id === resolvedPlaceId) ?? places[0];

  const handleSelectPlace = (place: CoursePlace) => setSelectedPlaceId(place.id);

  const handleSelectCourse = (id: number) => {
    setSelectedCourseId(id);
    setSelectedPlaceId(null);
  };

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
        {/* 코스 선택 탭 (2개 이상일 때만) */}
        {data.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto border-b border-gray-100 bg-white px-6 py-3">
            {data.map((c, idx) => (
              <button
                key={c.id}
                onClick={() => handleSelectCourse(c.id)}
                className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
                  activeCourse.id === c.id
                    ? "bg-[#0d3080] text-white"
                    : "border border-gray-200 text-gray-500 hover:border-gray-300"
                }`}
              >
                {c.title || `코스 ${idx + 1}`}
              </button>
            ))}
          </div>
        )}

        {/* 사이드바 + 지도 */}
        <div className="flex flex-1 overflow-hidden">
          <CourseSidebar
            course={course}
            selectedDay={1}
            selectedPlaceId={resolvedPlaceId}
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