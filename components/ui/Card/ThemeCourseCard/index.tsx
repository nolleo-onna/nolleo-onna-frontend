"use client";

import { Sun, Heart, CloudRain, Moon, UtensilsCrossed, Trees, Sparkles } from "lucide-react";
import type { ThemeCourse } from "@/features/home/data/themeCourses";

const ICON_MAP = {
  Sun,
  Heart,
  CloudRain,
  Moon,
  UtensilsCrossed,
  Trees,
} as const;

interface Props {
  course: ThemeCourse;
  onClick: () => void;
}

export default function ThemeCourseCard({ course, onClick }: Props) {
  const Icon = ICON_MAP[course.icon];

  return (
    <button
      onClick={onClick}
      className={`group relative h-[240px] w-full overflow-hidden rounded-2xl
                  bg-gradient-to-br ${course.gradient}
                  text-left transition-all duration-300
                  hover:shadow-[0_12px_32px_rgba(13,48,128,0.22)]
                  active:scale-[0.98]`}
      aria-label={`${course.title} 코스 AI로 생성하기`}
    >
      {/* 하단 그라데이션 오버레이 */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />

      {/* 상단 배지 + 아이콘 */}
      <div className="absolute left-4 right-4 top-4 flex items-start justify-between">
        <span className="rounded-full bg-white/25 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur-sm">
          상황별
        </span>
        <Icon className="h-6 w-6 text-white/80" />
      </div>

      {/* 하단 콘텐츠 */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <p className="mb-1 text-[10px] font-semibold tracking-[0.12em] text-white/60">
          {course.subTitle}
        </p>
        <p className="mb-1 text-[17px] font-bold text-white">{course.title}</p>
        <p className="mb-3 text-[12px] text-white/75">{course.description}</p>

        <span
          className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5
                     text-[11px] font-bold text-[#0d3080]
                     transition-transform duration-300 group-hover:translate-x-0.5"
        >
          <Sparkles className="h-3 w-3" />
          AI가 코스 생성
        </span>
      </div>
    </button>
  );
}