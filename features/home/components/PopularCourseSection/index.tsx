"use client";

import Link from "next/link";
import { type Variants, motion } from "motion/react";
import { Sparkles } from "lucide-react";

import RouteItineraryCard from "@/features/home/components/PopularCourseSection/RouteItineraryCard";
import { usePopularCourses } from "@/features/home/hooks/usePopularCourses";

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

const CARD_COUNT = 6;

// 사람들이 만들어 공개한 코스를 조회수 순으로 보여준다. 예전 "관광공사 추천 코스"
// 목데이터 자리를 실제 사용자 코스로 채운 것.
export default function PopularCourseSection() {
  const { data: courses, isPending, isError } = usePopularCourses(CARD_COUNT);
  const items = courses ?? [];

  return (
    <section className="py-6 md:py-10">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-ocean-500">놀러온나 여행자들이 만든</span>
          <h2 className="text-xl font-bold text-gray-900 md:text-2xl">지금 인기 있는 코스</h2>
        </div>
        <Link
          href="/course"
          className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-500 transition-colors hover:border-gray-300 hover:text-gray-700"
        >
          <Sparkles className="h-3.5 w-3.5" />
          나도 만들기
        </Link>
      </div>

      {isPending ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="animate-shimmer aspect-[4/3] rounded-[20px]" />
          ))}
        </div>
      ) : isError || items.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-[20px] border border-dashed border-gray-200 bg-gray-50/60 px-6 py-14 text-center">
          <span className="text-3xl">🗺️</span>
          <p className="text-sm font-semibold text-gray-700">
            {isError ? "인기 코스를 불러오지 못했어요" : "아직 공개된 코스가 없어요"}
          </p>
          <p className="text-xs text-gray-400">
            AI로 코스를 만들고 공유하면 이 자리에 가장 먼저 올라와요
          </p>
          <Link
            href="/course"
            className="mt-1 rounded-full bg-navy-900 px-5 py-2.5 text-xs font-semibold text-lime-300 transition-transform hover:-translate-y-0.5"
          >
            첫 코스 만들기
          </Link>
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {items.map((course, index) => (
            <motion.div key={course.shareToken} variants={itemVariants}>
              <Link href={`/course/shared/${encodeURIComponent(course.shareToken)}`}>
                <RouteItineraryCard
                  rank={index + 1}
                  imageSrc={course.thumbnailImageUrl}
                  title={course.title}
                  authorNickname={course.authorNickname}
                  authorProfileImageUrl={course.authorProfileImageUrl}
                  viewCount={course.viewCount}
                  likeCount={course.likeCount}
                  totalCost={course.totalCost}
                  stops={course.spotTitles}
                />
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}
    </section>
  );
}
