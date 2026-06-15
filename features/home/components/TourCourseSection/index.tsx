import Link from "next/link";

import TourCourseCard from "@/components/ui/Card/TourCourseCard";
import { MOCK_OFFICIAL_COURSES } from "@/features/course/data/mockOfficialCourse";

export default function TourCourseSection() {
  const courses = MOCK_OFFICIAL_COURSES;

  return (
    <section className="py-6 md:py-10">
      <div className="flex items-center justify-between mb-6">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-pink-400">관광공사 · TourAPI</span>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">관광공사 추천 코스</h2>
        </div>
        <Link
          href="/course/official"
          className="text-sm text-gray-500 border border-gray-200 rounded-lg px-3 py-1.5 transition-colors hover:border-gray-300 hover:text-gray-700"
        >
          {courses.length}개 전체 보기
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses.map((course) => (
          <Link key={course.id} href={`/course/official?courseId=${course.id}`}>
            <TourCourseCard
              imageSrc={course.coverImageUrl}
              title={course.title}
              rating={course.rating}
              reviewCount={course.reviewCount}
              location={course.location}
              regionTags={course.regionTags}
            />
          </Link>
        ))}
      </div>
    </section>
  );
}