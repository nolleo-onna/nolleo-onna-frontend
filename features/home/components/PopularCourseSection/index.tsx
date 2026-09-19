"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import SectionHeader from "@/features/home/components/SectionHeader";
import CourseCardMagazine from "@/features/course/components/CourseCard/CourseCardMagazine";
import { useLoopingCarousel } from "@/features/home/hooks/useLoopingCarousel";
import { usePopularCourses } from "@/features/home/hooks/usePopularCourses";
import { ASSISTANT_NAME } from "@/constants/assistant";

const FETCH_COUNT = 9;
/** 데스크톱 한 화면 카드 수 — 이보다 많아야 넘기기(두 벌 렌더링·자동 재생)를 켠다 */
const VISIBLE_DESKTOP = 3;
const GAP_PX = 16;
// 코스 카드는 동선·작성자까지 읽을 게 많아 스팟 카드(3초)보다 조금 느리게 넘긴다
const AUTO_PLAY_MS = 4000;
// 모바일은 옆 카드가 살짝 보이게 85%, 태블릿 2장, 데스크톱 3장 (gap 16px 기준)
const CARD_WIDTH = "w-[85%] sm:w-[calc((100%-16px)/2)] lg:w-[calc((100%-32px)/3)]";

// 사람들이 만들어 공개한 코스를 조회수 순으로 보여준다. 한 줄에 3장씩, 다른 홈 카드처럼 넘긴다.
// 전체 목록은 /course/shared(전체보기)에 같은 카드로 격자로 편다.
export default function PopularCourseSection() {
  const { data: courses, isPending, isError } = usePopularCourses(FETCH_COUNT);
  const items = courses ?? [];
  const canLoop = items.length > VISIBLE_DESKTOP;
  const { scrollRef, scrollByCard } = useLoopingCarousel({
    enabled: canLoop,
    intervalMs: AUTO_PLAY_MS,
    gapPx: GAP_PX,
  });
  // 한 화면보다 적을 때 두 벌로 그리면 같은 코스가 나란히 보이므로 넘기기를 켤 때만 복제한다
  const slides = canLoop ? [...items, ...items] : items;

  return (
    <motion.section
      className="py-8 md:py-12"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <SectionHeader
        title="지금 인기 있는 코스"
        description="여행자들이 만들어 공유한 코스를 조회수 순으로 보여드려요"
        action={{ label: "전체보기", href: "/course/shared" }}
      >
        {canLoop && (
          <div className="hidden items-center gap-2 sm:flex">
            <button
              type="button"
              onClick={() => scrollByCard(-1)}
              aria-label="이전 코스"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-gray-500 ring-1 ring-inset ring-gray-200 transition-colors hover:text-navy-900 hover:ring-gray-300"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => scrollByCard(1)}
              aria-label="다음 코스"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-gray-500 ring-1 ring-inset ring-gray-200 transition-colors hover:text-navy-900 hover:ring-gray-300"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </SectionHeader>

      {isPending ? (
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: VISIBLE_DESKTOP }, (_, i) => (
            <div key={i} className={`${CARD_WIDTH} animate-shimmer aspect-[4/5] shrink-0 rounded-[24px]`} />
          ))}
        </div>
      ) : isError || items.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-[20px] border border-dashed border-gray-200 bg-gray-50/60 px-6 py-14 text-center">
          <span className="text-3xl">🗺️</span>
          <p className="text-sm font-semibold text-gray-700">
            {isError ? "인기 코스를 불러오지 못했어요" : "아직 공개된 코스가 없어요"}
          </p>
          <p className="text-xs text-gray-400">
            {ASSISTANT_NAME}와 코스를 만들어 홈에 올리면 이 자리에 가장 먼저 보여요
          </p>
          <Link
            href="/course"
            className="mt-1 rounded-full bg-navy-900 px-5 py-2.5 text-xs font-semibold text-lime-300 transition-transform hover:-translate-y-0.5"
          >
            첫 코스 만들기
          </Link>
        </div>
      ) : (
        // 위아래 여백은 카드가 hover로 떠오를 때 그림자가 잘리지 않게 둔다
        <div
          ref={scrollRef}
          className="scrollbar-hide flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3 pt-1"
        >
          {slides.map((course, index) => {
            const isClone = index >= items.length;
            return (
              <Link
                key={`${isClone ? "b" : "a"}-${course.shareToken}`}
                href={`/course/shared/${encodeURIComponent(course.shareToken)}`}
                // 뒷벌은 끊김 없는 넘기기용 복제라 스크린리더·키보드 탐색에서 뺀다
                aria-hidden={isClone || undefined}
                tabIndex={isClone ? -1 : undefined}
                className={`${CARD_WIDTH} flex shrink-0 snap-start`}
              >
                <CourseCardMagazine
                  rank={(index % items.length) + 1}
                  imageSrc={course.thumbnailImageUrl}
                  title={course.title}
                  authorNickname={course.authorNickname}
                  viewCount={course.viewCount}
                  likeCount={course.likeCount}
                  totalCost={course.totalCost}
                  stops={course.spotTitles}
                />
              </Link>
            );
          })}
        </div>
      )}
    </motion.section>
  );
}
