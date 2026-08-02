"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import CourseMap from "@/features/course/components/CourseMap";
import CourseSidebar from "@/features/course/components/CourseSidebar";
import CoursePlaceDetail from "@/features/course/components/CoursePlaceDetail";
import SpotDetailModal from "@/features/spot/components/SpotDetailModal";
import { useCourseResult } from "@/features/course/hooks/useCourseResult";
import type { CourseItemResponse, CourseResponse } from "@/features/course/hooks/useCourseResult";
import type { CoursePlace, Course } from "@/features/course/data/mockCourse";

function toPlace(item: CourseItemResponse): CoursePlace {
  return {
    id: item.serialNum,
    name: item.name,
    category: item.category,
    lat: item.latitude,
    lng: item.longitude,
    imageUrl: item.imageUrl,
    description: item.warningMessage ?? "",
    rating: 0,
    reviewCount: 0,
    originalId: item.originalId,
    mapPlaceId: item.serialNum,
  };
}

const COURSE_TYPE_LABEL: Record<CourseResponse["courseType"], string> = {
  ACTIVE: "🏃 액티브",
  CULTURE: "🎨 문화",
  FOOD_TOUR: "🍜 맛집",
};

function toCourse(course: CourseResponse): Course {
  return {
    id: course.id,
    title: course.title,
    days: [
      {
        day: 1,
        title: COURSE_TYPE_LABEL[course.courseType],
        places: course.items.map(toPlace),
      },
    ],
  };
}

export default function CourseResultView() {
  const searchParams = useSearchParams();
  const pairId = searchParams.get("pairId");

  const { data, isLoading, isError } = useCourseResult(pairId);

  const [selectedType, setSelectedType] = useState<CourseResponse["courseType"]>("CULTURE");
  const [selectedPlaceId, setSelectedPlaceId] = useState<number | null>(null);
  const [modalContentId, setModalContentId] = useState<string | null>(null);
  const [modalPlaceType, setModalPlaceType] = useState<"SPOT" | "FOOD" | null>(null);
  const [modalMapPlaceId, setModalMapPlaceId] = useState<number | null>(null);

  if (isLoading || !data) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-pink-400" />
        <p className="text-sm text-gray-500">AI가 코스를 생성하고 있어요...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-sm text-gray-500">코스를 불러오지 못했어요. 다시 시도해주세요.</p>
      </div>
    );
  }

  const activeCourse =
    data.courses.find((c) => c.courseType === selectedType) ?? data.courses[0];
  const course = toCourse(activeCourse);
  const places = course.days[0].places;
  const resolvedPlaceId = selectedPlaceId ?? (places[0]?.id ?? null);
  const selectedPlace = places.find((p) => p.id === resolvedPlaceId) ?? places[0];

  const handleSelectPlace = (place: CoursePlace) => setSelectedPlaceId(place.id);

  const handleSelectType = (type: CourseResponse["courseType"]) => {
    setSelectedType(type);
    setSelectedPlaceId(null);
  };

  const handlePlaceClick = () => {
    if (!selectedPlace) return;
    setModalContentId(selectedPlace.originalId ?? null);
    setModalPlaceType("SPOT");
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
        {/* 코스 타입 탭 */}
        <div className="flex items-center gap-2 border-b border-gray-100 bg-white px-6 py-3">
          {data.courses.map((c) => (
            <button
              key={c.courseType}
              onClick={() => handleSelectType(c.courseType)}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
                selectedType === c.courseType
                  ? "bg-navy-400 text-white"
                  : "border border-gray-200 text-gray-500 hover:border-gray-300"
              }`}
            >
              {COURSE_TYPE_LABEL[c.courseType]}
            </button>
          ))}

        </div>

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