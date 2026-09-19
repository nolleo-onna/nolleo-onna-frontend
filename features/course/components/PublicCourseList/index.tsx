"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { Loader2, Map, Sparkles } from "lucide-react";

import RouteItineraryCard from "@/features/home/components/PopularCourseSection/RouteItineraryCard";
import { PUBLIC_COURSES_PAGE_SIZE, usePublicCourses } from "@/features/course/hooks/usePublicCourses";
import { ASSISTANT_NAME } from "@/constants/assistant";
import type { PopularCourse } from "@/types/course";

type SortKey = "popular" | "latest" | "liked";

const SORTS: { key: SortKey; label: string }[] = [
  { key: "popular", label: "인기순" },
  { key: "latest", label: "최신순" },
  { key: "liked", label: "좋아요순" },
];

/** 서버가 주는 순서(조회수 → 최신)가 인기순이라, 나머지만 다시 정렬한다 */
function sortCourses(courses: PopularCourse[], key: SortKey): PopularCourse[] {
  if (key === "popular") return courses;
  const sorted = [...courses];
  if (key === "latest") sorted.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  if (key === "liked") sorted.sort((a, b) => b.likeCount - a.likeCount || b.viewCount - a.viewCount);
  return sorted;
}

/**
 * 공유된 코스 전체보기. 홈 "지금 인기 있는 코스"가 조회수 상위 몇 개만 넘겨 보여주는 반면,
 * 여기선 공개된 코스를 격자로 쭉 펼치고 정렬을 바꿔 가며 고른다. 카드는 홈과 같은 여정형 카드.
 */
export default function PublicCourseList() {
  const { data, isPending, isError, fetchNextPage, hasNextPage, isFetchingNextPage } =
    usePublicCourses();
  const [sort, setSort] = useState<SortKey>("popular");

  const courses = useMemo(() => data?.pages.flat() ?? [], [data]);
  const sorted = useMemo(() => sortCourses(courses, sort), [courses, sort]);

  return (
    <div>
      {/* ── 머리말 ── */}
      <header className="mb-7 md:mb-9">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-ocean-50 px-3 py-1 text-[12px] font-semibold text-ocean-600">
          <Map className="h-3.5 w-3.5" />
          공유된 코스
        </span>
        <h1 className="mt-3 text-[28px] font-bold leading-tight tracking-tight text-navy-900 break-keep md:text-[36px]">
          여행자들이 공유한 코스
        </h1>
        <p className="mt-2 text-sm text-gray-500 break-keep md:text-base">
          {ASSISTANT_NAME}로 만든 코스 중 공개한 것만 모았어요. 마음에 드는 코스를 그대로 따라가 봐도 좋아요.
        </p>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-1.5">
            {SORTS.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => setSort(key)}
                aria-pressed={sort === key}
                className={`rounded-full px-4 py-2 text-[13px] font-semibold transition-colors ${
                  sort === key
                    ? "bg-navy-900 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          {courses.length > 0 && (
            <p className="text-[13px] text-gray-400">
              {courses.length}개
              {/* 정렬은 지금까지 불러온 코스 안에서만 바뀐다 — 더 있으면 헷갈리지 않게 알려준다 */}
              {hasNextPage && sort !== "popular" && " 불러옴 · 더 보기를 누르면 함께 정렬돼요"}
            </p>
          )}
        </div>
      </header>

      {/* ── 목록 ── */}
      {isPending ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="animate-shimmer aspect-[4/3] rounded-[20px]" />
          ))}
        </div>
      ) : isError || courses.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-[20px] border border-dashed border-gray-200 bg-gray-50/60 px-6 py-20 text-center">
          <span className="text-3xl">🗺️</span>
          <p className="text-sm font-semibold text-gray-700">
            {isError ? "코스를 불러오지 못했어요" : "아직 공개된 코스가 없어요"}
          </p>
          <p className="text-xs text-gray-400 break-keep">
            {isError
              ? "잠시 후 다시 시도해주세요"
              : `${ASSISTANT_NAME}와 코스를 만들고 공개하면 이 자리에 가장 먼저 보여요`}
          </p>
          <Link
            href="/course"
            className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-navy-900 px-5 py-2.5 text-xs font-semibold text-lime-300 transition-transform hover:-translate-y-0.5"
          >
            <Sparkles className="h-3.5 w-3.5" />내 코스 만들기
          </Link>
        </div>
      ) : (
        <>
          <motion.ul
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.04 } } }}
          >
            {sorted.map((course, index) => (
              <motion.li
                key={course.shareToken}
                variants={{
                  hidden: { opacity: 0, y: 12 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
                }}
                className="flex"
              >
                <Link
                  href={`/course/shared/${encodeURIComponent(course.shareToken)}`}
                  className="flex w-full rounded-[20px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ocean-500"
                >
                  <RouteItineraryCard
                    // 순위 배지는 조회수 순일 때만 의미가 있다
                    rank={sort === "popular" ? index + 1 : undefined}
                    imageSrc={course.thumbnailImageUrl}
                    title={course.title}
                    authorNickname={course.authorNickname}
                    viewCount={course.viewCount}
                    likeCount={course.likeCount}
                    totalCost={course.totalCost}
                    stops={course.spotTitles}
                  />
                </Link>
              </motion.li>
            ))}
          </motion.ul>

          {hasNextPage && (
            <div className="mt-8 flex justify-center">
              <button
                type="button"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-navy-900 ring-1 ring-inset ring-gray-200 transition-colors hover:ring-gray-300 disabled:opacity-60"
              >
                {isFetchingNextPage && <Loader2 className="h-4 w-4 animate-spin" />}
                {isFetchingNextPage ? "불러오는 중" : `코스 ${PUBLIC_COURSES_PAGE_SIZE}개 더 보기`}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
