"use client";

import Image from "next/image";
import { MotionConfig, motion } from "motion/react";
import { Sparkles } from "lucide-react";

import SectionHeader from "@/features/home/components/SectionHeader";
import { useAIChatContext } from "@/providers/AIChatProvider";
import { THEME_COURSES } from "@/features/home/data/themeCourses";

import type { ThemeCourse } from "@/features/home/data/themeCourses";

const MAX_TILES = 6;
// 데스크톱 12칸 그리드에서 줄마다 폭을 5·4·3 / 3·4·5로 엇갈려, 같은 크기 카드가 줄지어 넘어가던 캐러셀 느낌을 없앤다
const DESKTOP_SPANS = ["lg:col-span-5", "lg:col-span-4", "lg:col-span-3", "lg:col-span-3", "lg:col-span-4", "lg:col-span-5"];

type Props = {
  courses?: ThemeCourse[];
};

/** 상황별 AI 코스 — 타일을 누르면 프롬프트가 채워진 AI 채팅이 열린다 */
export default function CourseSection({ courses = THEME_COURSES }: Props) {
  const { openChat } = useAIChatContext();
  const tiles = courses.slice(0, MAX_TILES);

  const handleScrollToSearch = () => {
    document.getElementById("search-bar")?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <MotionConfig reducedMotion="user">
      <section className="py-8 md:py-12">
        <SectionHeader
          title="오늘 어떻게 놀까?"
          description="상황을 고르면 AI가 바로 코스를 짜드려요"
          action={{ label: "직접 조건 고르기", onClick: handleScrollToSearch }}
        />

        <ul className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-12">
          {tiles.map((course, i) => {
            // 모바일 2열에서는 첫 타일과(홀수 개일 때) 마지막 타일을 넓게 깔아 빈칸 없이 리듬을 만든다
            const wideOnMobile = i === 0 || (i === tiles.length - 1 && (tiles.length - 1) % 2 === 1);
            return (
              <motion.li
                key={course.id}
                className={`${wideOnMobile ? "col-span-2" : ""} ${DESKTOP_SPANS[i % DESKTOP_SPANS.length]}`}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ type: "spring", stiffness: 120, damping: 20, delay: i * 0.05 }}
              >
                <button
                  type="button"
                  onClick={() => openChat(course.prompt)}
                  aria-label={`${course.title} 코스 AI로 만들기`}
                  className={`group relative block w-full overflow-hidden rounded-[22px] bg-navy-800 text-left ${
                    wideOnMobile ? "h-52" : "h-44"
                  } md:h-60`}
                >
                  <Image
                    src={course.imageUrl}
                    alt=""
                    fill
                    quality={90}
                    sizes="(max-width: 1024px) 50vw, 40vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 md:p-5">
                    <div className="min-w-0">
                      <p className="text-lg font-bold text-white md:text-xl">{course.title}</p>
                      <p className="mt-0.5 line-clamp-1 text-xs text-white/75 md:text-sm">{course.description}</p>
                    </div>
                    <span className="hidden h-8 shrink-0 items-center gap-1 rounded-full bg-white/95 px-3 text-[11px] font-bold text-navy-600 transition-transform duration-300 group-hover:-translate-y-0.5 sm:flex">
                      <Sparkles className="h-3 w-3" />
                      AI 코스
                    </span>
                  </div>
                </button>
              </motion.li>
            );
          })}
        </ul>
      </section>
    </MotionConfig>
  );
}
