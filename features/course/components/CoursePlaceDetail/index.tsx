"use client";

import { Star } from "lucide-react";
import Image from "next/image";

import type { Course, CoursePlace } from "@/features/course/data/mockCourse";

interface CoursePlaceDetailProps {
  course: Course;
  selectedDay: number;
  place: CoursePlace;
  onSelectDay: (day: number) => void;
}

export default function CoursePlaceDetail({
  course,
  selectedDay,
  place,
  onSelectDay,
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
      <div className="flex items-center gap-4">
        <Image
          src={place.imageUrl}
          alt={place.name}
          width={72}
          height={72}
          className="h-18 w-18 shrink-0 rounded-xl object-cover"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h2 className="truncate text-base font-bold text-navy-900">
              {place.name}
            </h2>
            <span className="shrink-0 text-xs text-gray-400">
              {place.category}
            </span>
          </div>
          <p className="mt-1 truncate text-sm text-gray-500">
            {place.description}
          </p>
          <div className="mt-1.5 flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-semibold text-navy-900">
              {place.rating}
            </span>
            <span className="text-xs text-gray-400">
              ({place.reviewCount.toLocaleString()})
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
