"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

import CoursePlaceDetail from "@/features/course/components/CoursePlaceDetail";
import CourseSidebar from "@/features/course/components/CourseSidebar";
import CoursePlaceModal from "@/features/course/components/CoursePlaceModal";
import MapSkeleton from "@/components/ui/Skeleton/MapSkeleton";
import {
  type CoursePlace,
  MOCK_COURSE,
} from "@/features/course/data/mockCourse";

const CourseMap = dynamic(() => import("@/features/course/components/CourseMap"), {
  ssr: false,
  loading: () => <MapSkeleton />,
});

export default function CourseView() {
  const [selectedDay, setSelectedDay] = useState(1);
  const [selectedPlaceId, setSelectedPlaceId] = useState<number | null>(
    MOCK_COURSE.days[0].places[0].id,
  );
  const [modalPlace, setModalPlace] = useState<CoursePlace | null>(null); // 추가

  const currentDay =
    MOCK_COURSE.days.find((d) => d.day === selectedDay) ?? MOCK_COURSE.days[0];

  const selectedPlace =
    currentDay.places.find((p) => p.id === selectedPlaceId) ??
    currentDay.places[0];

  const handleSelectDay = (day: number) => {
    setSelectedDay(day);
    const nextDay = MOCK_COURSE.days.find((d) => d.day === day);
    setSelectedPlaceId(nextDay?.places[0].id ?? null);
  };

  const handleSelectPlace = (place: CoursePlace) => {
    setSelectedPlaceId(place.id);
  };

  return (
    <div className="flex h-screen pt-16">
      <CourseSidebar
        course={MOCK_COURSE}
        selectedDay={selectedDay}
        selectedPlaceId={selectedPlaceId}
        onSelectDay={handleSelectDay}
        onSelectPlace={handleSelectPlace}
      />
      <main className="relative flex-1">
        <CourseMap
          places={currentDay.places}
          selectedPlaceId={selectedPlaceId}
          onSelectPlace={(place) => {
            handleSelectPlace(place);
            setModalPlace(place); // 지도 마커 클릭 → 모달
          }}
        />
        <CoursePlaceDetail
          course={MOCK_COURSE}
          selectedDay={selectedDay}
          place={selectedPlace}
          onSelectDay={handleSelectDay}
          onPlaceClick={() => setModalPlace(selectedPlace)} // 바텀카드 클릭 → 모달
        />
      </main>

      {/* 모달 */}
      <CoursePlaceModal
        place={modalPlace}
        onClose={() => setModalPlace(null)}
      />
    </div>
  );
}