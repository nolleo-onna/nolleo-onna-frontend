"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";

import type { OfficialCourse } from "@/features/course/data/mockOfficialCourse";

interface OfficialCourseCarouselProps {
  courses: OfficialCourse[];
  selectedCourseId: number;
  onSelectCourse: (courseId: number) => void;
}

export default function OfficialCourseCarousel({
  courses,
  selectedCourseId,
  onSelectCourse,
}: OfficialCourseCarouselProps) {
  const selectedIndex = courses.findIndex((c) => c.id === selectedCourseId);

  const goPrev = () => {
    const prevIndex = (selectedIndex - 1 + courses.length) % courses.length;
    onSelectCourse(courses[prevIndex].id);
  };

  const goNext = () => {
    const nextIndex = (selectedIndex + 1) % courses.length;
    onSelectCourse(courses[nextIndex].id);
  };

  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        onClick={goPrev}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gray-200 text-gray-400 transition-colors hover:border-gray-300 hover:text-navy-900"
        aria-label="이전 코스"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      <div className="grid flex-1 grid-cols-1 gap-4 md:grid-cols-3">
        {courses.map((course) => {
          const isSelected = course.id === selectedCourseId;
          return (
            <button
              key={course.id}
              type="button"
              onClick={() => onSelectCourse(course.id)}
              className={`group relative h-40 overflow-hidden rounded-2xl text-left transition-all ${
                isSelected
                  ? "ring-2 ring-pink-400 ring-offset-2"
                  : "ring-0"
              }`}
            >
              {/* 배경 이미지 */}
              <Image
                src={course.coverImageUrl}
                alt={course.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
              {/* 그라데이션 오버레이 */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              {/* 텍스트 */}
              <div className="absolute inset-x-0 bottom-0 p-4">
                <span className="block text-base font-bold text-white">
                  {course.title}
                </span>
                <span className="mt-0.5 block text-sm text-white/80">
                  {course.days[0].places.length}개 장소
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={goNext}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gray-200 text-gray-400 transition-colors hover:border-gray-300 hover:text-navy-900"
        aria-label="다음 코스"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}