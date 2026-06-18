"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import CourseCard from "@/components/ui/Card/CourseCard";


type Course = {
  id: number;
  imageSrc: string;
  badge?: string;
  emoji?: string;
  subTitle?: string;
  title: string;
  description?: string;
};

const mockCourses: Course[] = [
  { id: 1, imageSrc: "https://picsum.photos/seed/beach/400/600", badge: "상황별", emoji: "🏖️", subTitle: "SOLO HEALING", title: "혼자 여행", description: "조용한 바다 + 카페 1곳" },
  { id: 2, imageSrc: "https://picsum.photos/seed/rose/400/600", badge: "상황별", emoji: "🌹", subTitle: "CHEAP & CHIC", title: "짠내 데이트", description: "5만원 이하 감성 코스" },
  { id: 3, imageSrc: "https://picsum.photos/seed/rain/400/600", badge: "상황별", emoji: "🌧️", subTitle: "RAINY DAY", title: "비오는 날 여행", description: "실내 위주 큐레이션" },
  { id: 4, imageSrc: "https://picsum.photos/seed/night/400/600", badge: "상황별", emoji: "🌙", subTitle: "NIGHT VIBE", title: "부산 야경 투어", description: "광안리 + 해운대 야경" },
  { id: 5, imageSrc: "https://picsum.photos/seed/food/400/600", badge: "상황별", emoji: "🍜", subTitle: "FOOD TRIP", title: "부산 먹방 투어", description: "국제시장 + 자갈치" },
  { id: 6, imageSrc: "https://picsum.photos/seed/nature/400/600", badge: "상황별", emoji: "🌿", subTitle: "NATURE WALK", title: "자연 힐링 코스", description: "태종대 + 이기대" },
];

const VISIBLE_COUNT_MOBILE = 2;
const VISIBLE_COUNT_TABLET = 4;
const VISIBLE_COUNT_DESKTOP = 3;
const AUTO_PLAY_INTERVAL = 3000;

type Props = {
  courses?: Course[];
};

export default function CourseCarousel({ courses = mockCourses }: Props) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const currentIndexRef = useRef(0);
  const autoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const cloned = [...courses, ...courses, ...courses];
  const offset = courses.length;

  const handleScrollToSearch = () => {
    document.getElementById("search-bar")?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
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
    // updateVisible 로직 변경 — 브레이크포인트 기준 조정
    const updateVisible = () => {
      if (window.innerWidth >= 1280) setVisibleCount(VISIBLE_COUNT_DESKTOP);      // 데스크탑: 3장
      else if (window.innerWidth >= 768) setVisibleCount(VISIBLE_COUNT_TABLET);   // 태블릿: 4장
      else setVisibleCount(VISIBLE_COUNT_MOBILE);                                  // 모바일: 2장
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

  const translateX = visibleCount > 0
    ? -((offset + currentIndex) * (100 / visibleCount))
    : 0;

  return (
    <section className="py-6 md:py-10">
      {/* 헤더 */}
      <div className="flex items-center gap-2 mb-6">
        <h2 className="text-lg md:text-xl font-bold text-navy-900">
          오늘 어떻게 놀까?
        </h2>
        <span className="text-xs text-gray-400">추천 코스 {courses.length}</span>
      </div>

      {/* 캐러셀 wrapper */}
      <div className="relative">
        {/* 좌측 화살표 */}
        <button
          onClick={handlePrev}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm"
        >
          ←
        </button>

        {/* 카드 트랙 */}
        <div className="overflow-hidden mx-4">
          <div
            className={`flex ${isTransitioning ? "transition-transform duration-500 ease-in-out" : ""}`}
            style={{ transform: mounted ? `translateX(${translateX}%)` : "none" }}
            onTransitionEnd={handleTransitionEnd}
          >
            {mounted && cloned.map((course, i) => (
              <div
                key={`${course.id}-${i}`}
                className="shrink-0 px-2"
                style={{ width: `${100 / visibleCount}%` }}
              >
                <CourseCard
                  imageSrc={course.imageSrc}
                  badge={course.badge}
                  emoji={course.emoji}
                  subTitle={course.subTitle}
                  title={course.title}
                  description={course.description}
                />
              </div>
            ))}
          </div>
        </div>

        {/* 우측 화살표 */}
        <button
          onClick={handleNext}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm"
        >
          →
        </button>
      </div>

      {/* 버튼 */}
      <div className="flex justify-center gap-3 mt-8">
        <button
          onClick={handleScrollToSearch}
          className="px-6 py-2.5 rounded-full bg-navy-500 text-white text-sm font-medium"
        >
          코스 추천받기
        </button>
        <button
          onClick={() => router.push("/spot")}
          className="px-6 py-2.5 rounded-full border border-navy-500 text-navy-500 text-sm font-medium"
        >
          스팟 둘러보기
        </button>
      </div>
    </section>
  );
}