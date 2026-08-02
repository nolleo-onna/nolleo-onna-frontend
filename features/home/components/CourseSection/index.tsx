"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

import ThemeCourseCard from "@/components/ui/Card/ThemeCourseCard";
import { AIChatModal } from "@/components/ui/Chat/AIChatModal";
import { useAIChat } from "@/hooks/useAIChat";
import { THEME_COURSES } from "@/features/home/data/themeCourses";
import type { ThemeCourse } from "@/features/home/data/themeCourses";

const VISIBLE_COUNT_MOBILE = 2;
const VISIBLE_COUNT_TABLET = 4;
const VISIBLE_COUNT_DESKTOP = 3;
const AUTO_PLAY_INTERVAL = 4000;

type Props = {
  courses?: ThemeCourse[];
};

export default function CourseSection({ courses = THEME_COURSES }: Props) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);

  const currentIndexRef = useRef(0);
  const autoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { sendMessage, reset } = useAIChat();

  const cloned = [...courses, ...courses, ...courses];
  const offset = courses.length;

  const handleScrollToSearch = () => {
    document.getElementById("search-bar")?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  };

  // 테마 카드 클릭 → AI 채팅 모달 열고 프롬프트 자동 전송
  const handleThemeClick = (course: ThemeCourse) => {
    reset();
    setIsAIChatOpen(true);
    setTimeout(() => {
      sendMessage(course.prompt, { skipGuards: true });
    }, 100);
  };

  const updateIndex = useCallback((index: number) => {
    currentIndexRef.current = index;
    setCurrentIndex(index);
  }, []);

  const restartAutoPlay = useCallback(() => {
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    autoPlayRef.current = setInterval(() => {
      setIsTransitioning(true);
      updateIndex(currentIndexRef.current + 1);
    }, AUTO_PLAY_INTERVAL);
  }, [updateIndex]);

  useEffect(() => {
    const updateVisible = () => {
      if (window.innerWidth >= 1280) setVisibleCount(VISIBLE_COUNT_DESKTOP);
      else if (window.innerWidth >= 768) setVisibleCount(VISIBLE_COUNT_TABLET);
      else setVisibleCount(VISIBLE_COUNT_MOBILE);
      setMounted(true);
    };
    updateVisible();
    window.addEventListener("resize", updateVisible);
    return () => window.removeEventListener("resize", updateVisible);
  }, []);

  useEffect(() => {
    restartAutoPlay();
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [restartAutoPlay]);

  // 모달 열려있으면 자동 재생 정지
  useEffect(() => {
    if (isAIChatOpen && autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
    } else if (!isAIChatOpen) {
      restartAutoPlay();
    }
  }, [isAIChatOpen, restartAutoPlay]);

  const handlePrev = () => {
    restartAutoPlay();
    setIsTransitioning(true);
    updateIndex(currentIndexRef.current - 1);
  };

  const handleNext = () => {
    restartAutoPlay();
    setIsTransitioning(true);
    updateIndex(currentIndexRef.current + 1);
  };

  const handleTransitionEnd = () => {
    const index = currentIndexRef.current;
    if (index >= courses.length) {
      setIsTransitioning(false);
      updateIndex(0);
    } else if (index < 0) {
      setIsTransitioning(false);
      updateIndex(courses.length - 1);
    }
  };

  const translateX =
    visibleCount > 0 ? -((offset + currentIndex) * (100 / visibleCount)) : 0;

  return (
    <>
      <section className="py-6 md:py-10">
        {/* 헤더 */}
        <div className="mb-6 flex items-end justify-between">
          <div>
            <p className="mb-1 text-[11px] font-semibold tracking-wide text-pink-500">
              AI 추천
            </p>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-[#0d3080] md:text-xl">
                오늘 어떻게 놀까?
              </h2>
              <span className="text-xs text-gray-400">
                테마 {courses.length}개
              </span>
            </div>
          </div>
        </div>

        {/* 캐러셀 */}
        <div className="relative">
          <button
            onClick={handlePrev}
            aria-label="이전 코스"
            className="absolute left-0 top-1/2 z-10 flex h-9 w-9 -translate-x-4 -translate-y-1/2
                       items-center justify-center rounded-full border border-gray-100 bg-white
                       shadow-[0_2px_12px_rgba(13,48,128,0.10)]
                       transition-all hover:border-gray-200 hover:shadow-[0_4px_16px_rgba(13,48,128,0.14)]
                       active:scale-90"
          >
            <ChevronLeft className="h-4 w-4 text-gray-600" />
          </button>

          <div className="mx-4 overflow-hidden">
            <div
              className={`flex ${
                isTransitioning ? "transition-transform duration-500 ease-in-out" : ""
              }`}
              style={{ transform: mounted ? `translateX(${translateX}%)` : "none" }}
              onTransitionEnd={handleTransitionEnd}
            >
              {mounted &&
                cloned.map((course, i) => (
                  <div
                    key={`${course.id}-${i}`}
                    className="shrink-0 px-2"
                    style={{ width: `${100 / visibleCount}%` }}
                  >
                    <ThemeCourseCard
                      course={course}
                      onClick={() => handleThemeClick(course)}
                    />
                  </div>
                ))}
            </div>
          </div>

          <button
            onClick={handleNext}
            aria-label="다음 코스"
            className="absolute right-0 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 translate-x-4
                       items-center justify-center rounded-full border border-gray-100 bg-white
                       shadow-[0_2px_12px_rgba(13,48,128,0.10)]
                       transition-all hover:border-gray-200 hover:shadow-[0_4px_16px_rgba(13,48,128,0.14)]
                       active:scale-90"
          >
            <ChevronRight className="h-4 w-4 text-gray-600" />
          </button>
        </div>

        {/* 하단 버튼 */}
        <div className="mt-8 flex justify-center gap-3">
          <button
            onClick={handleScrollToSearch}
            className="rounded-full bg-[#0d3080] px-6 py-2.5 text-sm font-semibold text-white
                       transition-all hover:brightness-110 active:scale-95"
          >
            직접 조건 고르기
          </button>
          <button
            onClick={() => router.push("/spot")}
            className="rounded-full border border-[#0d3080] px-6 py-2.5 text-sm font-semibold text-[#0d3080]
                       transition-all hover:bg-[#0d3080]/5 active:scale-95"
          >
            스팟 둘러보기
          </button>
        </div>
      </section>

      {/* AI 채팅 모달 */}
      <AIChatModal isOpen={isAIChatOpen} onClose={() => setIsAIChatOpen(false)} />
    </>
  );
}