"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";

import CourseMap from "@/features/course/components/CourseMap";
import CourseSidebar from "@/features/course/components/CourseSidebar";
import OfficialCourseCarousel from "@/features/course/components/OfficialCourseCarousel";
import type { CoursePlace } from "@/features/course/data/mockCourse";
import { MOCK_OFFICIAL_COURSES } from "@/features/course/data/mockOfficialCourse";

export default function OfficialCourseView() {
  const searchParams = useSearchParams();
  const courseIdParam = Number(searchParams.get("courseId"));

  // URL에 courseId 있고 유효하면 그걸로, 없으면 첫 번째 코스
  const initialCourseId = MOCK_OFFICIAL_COURSES.some(
    (c) => c.id === courseIdParam,
  )
    ? courseIdParam
    : MOCK_OFFICIAL_COURSES[0].id;

  const [selectedCourseId, setSelectedCourseId] = useState(initialCourseId);
  const [selectedPlaceId, setSelectedPlaceId] = useState<number | null>(() => {
    const course =
      MOCK_OFFICIAL_COURSES.find((c) => c.id === initialCourseId) ??
      MOCK_OFFICIAL_COURSES[0];
    return course.days[0].places[0].id;
  });

  const currentCourse =
    MOCK_OFFICIAL_COURSES.find((c) => c.id === selectedCourseId) ??
    MOCK_OFFICIAL_COURSES[0];
  const currentDay = currentCourse.days[0];
  const selectedPlace =
    currentDay.places.find((p) => p.id === selectedPlaceId) ??
    currentDay.places[0];

  const handleSelectCourse = (courseId: number) => {
    setSelectedCourseId(courseId);
    const next = MOCK_OFFICIAL_COURSES.find((c) => c.id === courseId);
    setSelectedPlaceId(next?.days[0].places[0].id ?? null);
  };

  const handleSelectPlace = (place: CoursePlace) => {
    setSelectedPlaceId(place.id);
  };

  return (
    <div className="mx-auto w-full max-w-[1280px] px-5 pt-24 pb-12 md:px-10 lg:px-20">
      <div className="mb-6">
        <p className="text-sm font-semibold text-ocean-600">부산 여행 코스</p>
        <h1 className="mt-1 text-2xl font-bold text-navy-900">
          관광공사 추천 코스
        </h1>
      </div>

      <OfficialCourseCarousel
        courses={MOCK_OFFICIAL_COURSES}
        selectedCourseId={selectedCourseId}
        onSelectCourse={handleSelectCourse}
      />

      <div className="mt-8 flex h-[560px] overflow-hidden rounded-3xl border border-gray-100 shadow-sm">
        <CourseSidebar
          course={currentCourse}
          selectedDay={currentDay.day}
          selectedPlaceId={selectedPlaceId}
          onSelectDay={() => {}}
          onSelectPlace={handleSelectPlace}
        />
        <main className="relative flex-1">
          <CourseMap
            places={currentDay.places}
            selectedPlaceId={selectedPlaceId}
            onSelectPlace={handleSelectPlace}
          />
        </main>
      </div>
    </div>
  );
}