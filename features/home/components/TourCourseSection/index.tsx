"use client";

import Link from "next/link";
import { type Variants, motion } from "motion/react";

import RouteItineraryCard from "@/features/home/components/TourCourseSection/RouteItineraryCard";
import { MOCK_OFFICIAL_COURSES } from "@/features/course/data/mockOfficialCourse";

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 },
  },
};

export default function TourCourseSection() {
  const courses = MOCK_OFFICIAL_COURSES;

  return (
    <section className="py-6 md:py-10">
      <div className="flex items-center justify-between mb-6">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-ocean-500">관광공사 · TourAPI</span>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">관광공사 추천 코스</h2>
        </div>
        <Link
          href="/course/official"
          className="text-sm text-gray-500 border border-gray-200 rounded-lg px-3 py-1.5 transition-colors hover:border-gray-300 hover:text-gray-700"
        >
          {courses.length}개 전체 보기
        </Link>
      </div>

      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        {courses.map((course) => (
          <motion.div key={course.id} variants={itemVariants}>
            <Link href={`/course/official?courseId=${course.id}`}>
              <RouteItineraryCard
                imageSrc={course.coverImageUrl}
                title={course.title}
                rating={course.rating}
                reviewCount={course.reviewCount}
                location={course.location}
                stops={course.days[0]?.places.map((place) => place.name) ?? []}
              />
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
