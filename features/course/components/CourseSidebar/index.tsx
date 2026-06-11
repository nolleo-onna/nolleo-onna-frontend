"use client";

import { MapPin } from "lucide-react";

import {
  type Course,
  type CoursePlace,
  formatDistance,
  getDistance,
} from "@/features/course/data/mockCourse";

interface CourseSidebarProps {
  course: Course;
  selectedDay: number;
  selectedPlaceId: number | null;
  onSelectDay: (day: number) => void;
  onSelectPlace: (place: CoursePlace) => void;
}

export default function CourseSidebar({
  course,
  selectedDay,
  selectedPlaceId,
  onSelectDay,
  onSelectPlace,
}: CourseSidebarProps) {
  return (
    <aside className="flex h-full w-[340px] shrink-0 flex-col border-r border-gray-100 bg-white">
      {/* 코스 제목 */}
      <div className="border-b border-gray-100 px-5 py-4">
        <p className="text-xs font-semibold text-pink-500">부산 여행 코스</p>
        <h1 className="mt-1 text-lg font-bold text-navy-900">{course.title}</h1>
      </div>

      {/* 일차별 타임라인 */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        {course.days.map((courseDay) => {
          const isActiveDay = courseDay.day === selectedDay;

          return (
            <section key={courseDay.day} className="mb-6">
              <button
                type="button"
                onClick={() => onSelectDay(courseDay.day)}
                className={`mb-3 flex items-center gap-2 text-sm font-bold ${
                  isActiveDay ? "text-navy-900" : "text-gray-400"
                }`}
              >
                day{courseDay.day}
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    isActiveDay
                      ? "bg-lime-300 text-navy-900"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {courseDay.title}
                </span>
              </button>

              <ol>
                {courseDay.places.map((place, index) => {
                  const isSelected = place.id === selectedPlaceId;
                  const prev = courseDay.places[index - 1];

                  return (
                    <li key={place.id}>
                      {/* 이전 장소와의 거리 */}
                      {prev && (
                        <div className="flex items-center gap-3 py-1">
                          <span className="flex w-7 justify-center">
                            <span className="h-6 w-px border-l border-dashed border-gray-300" />
                          </span>
                          <span className="text-xs text-gray-400">
                            {formatDistance(getDistance(prev, place))}
                          </span>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          onSelectDay(courseDay.day);
                          onSelectPlace(place);
                        }}
                        className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors ${
                          isSelected
                            ? "border-pink-400 bg-pink-50"
                            : "border-gray-100 bg-white hover:border-gray-200"
                        }`}
                      >
                        <span
                          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${
                            isSelected ? "bg-pink-500" : "bg-navy-900"
                          }`}
                        >
                          {index + 1}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-semibold text-navy-900">
                            {place.name}
                          </span>
                          <span className="mt-0.5 flex items-center gap-1 text-xs text-gray-400">
                            <MapPin className="h-3 w-3" />
                            {place.category}
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ol>
            </section>
          );
        })}
      </div>
    </aside>
  );
}
