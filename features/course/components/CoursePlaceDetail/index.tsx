"use client";

import Image from "next/image";

import type { Course, CoursePlace } from "@/features/course/data/mockCourse";

interface CoursePlaceDetailProps {
  course: Course;
  selectedDay: number;
  place: CoursePlace;
  onSelectDay: (day: number) => void;
  onPlaceClick: () => void;
}

export default function CoursePlaceDetail({
  course,
  selectedDay,
  place,
  onSelectDay,
  onPlaceClick,
}: CoursePlaceDetailProps) {
  return (
    <div className="absolute inset-x-6 bottom-6 z-10 rounded-2xl bg-white p-5 shadow-lg">
      {/* day 탭 */}
      <div className="mb-4 flex gap-2">
        {course.days.map((courseDay) => {
          const isActive = courseDay.day === selectedDay;
          return (
            <button
              key={courseDay.day}
              type="button"
              onClick={() => onSelectDay(courseDay.day)}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
                isActive
                  ? "bg-navy-900 text-lime-300"
                  : "border border-gray-200 text-gray-400 hover:border-gray-300"
              }`}
            >
              day{courseDay.day}
            </button>
          );
        })}
      </div>

      {/* 장소 정보 */}
      <div
        className="flex items-center gap-4 cursor-pointer"
        onClick={onPlaceClick}
      >
        {place.imageUrl ? (
          <Image
            src={place.imageUrl}
            alt={place.name}
            width={72}
            height={72}
            className="w-[72px] h-[72px] shrink-0 rounded-xl object-cover"
          />
        ) : (
          <div className="w-[72px] h-[72px] shrink-0 rounded-xl bg-gray-100" />
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h2 className="truncate text-base font-bold text-navy-900">
              {place.name}
            </h2>
            <span className="shrink-0 text-xs text-gray-400">
              {place.category}
            </span>
          </div>
          {place.description && (
            <p className="mt-1 truncate text-sm text-gray-500">
              {place.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}