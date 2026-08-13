"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, MapPin, Wallet, Sparkles, ArrowRight, Compass } from "lucide-react";
import { useMyCourses } from "@/features/course/hooks/useMyCourses";

// ── 빈 상태 ───────────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-5 text-center">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0d3080] to-[#0a84ff] flex items-center justify-center shadow-lg">
        <Compass className="w-8 h-8 text-white" />
      </div>
      <div>
        <p className="text-lg font-bold text-gray-800">아직 만든 코스가 없어요</p>
        <p className="text-sm text-gray-400 mt-1.5 leading-relaxed">
          AI에게 원하는 여행을 말하면
          <br />
          부산 맞춤 코스를 만들어드려요
        </p>
      </div>
      <Link
        href="/"
        className="mt-1 inline-flex items-center gap-2 px-6 py-3 rounded-2xl
                   bg-gradient-to-r from-[#34a6ff] to-[#0a84ff] text-white text-sm font-bold
                   shadow-[0_4px_16px_rgba(10,132,255,0.35)]
                   hover:brightness-105 active:scale-95 transition-all"
      >
        <Sparkles className="w-4 h-4" />
        코스 만들러 가기
      </Link>
    </div>
  );
}

// ── 로딩 스켈레톤 ─────────────────────────────────────────────────────────────
function LoadingState() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="rounded-2xl border border-gray-100 bg-white p-5 animate-pulse"
        >
          <div className="h-5 w-3/4 bg-gray-100 rounded-lg mb-3" />
          <div className="h-3 w-full bg-gray-50 rounded mb-2" />
          <div className="h-3 w-2/3 bg-gray-50 rounded mb-5" />
          <div className="flex gap-2">
            <div className="h-6 w-20 bg-gray-50 rounded-full" />
            <div className="h-6 w-16 bg-gray-50 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── 코스 카드 ─────────────────────────────────────────────────────────────────
function CourseCard({
  pairId,
  title,
  description,
  totalCost,
  spotTitles,
  onClick,
}: {
  pairId: string;
  title: string;
  description: string;
  totalCost: number;
  spotTitles: string[];
  onClick: () => void;
}) {
  const visibleSpots = spotTitles.slice(0, 3);
  const restCount = spotTitles.length - visibleSpots.length;

  return (
    <button
      onClick={onClick}
      className="group text-left rounded-2xl border border-gray-100 bg-white p-5
                 hover:border-[#0d3080]/20 hover:shadow-[0_8px_28px_rgba(13,48,128,0.10)]
                 active:scale-[0.99] transition-all duration-200"
      aria-label={`${title} 코스 상세 보기`}
    >
      {/* 제목 */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3 className="text-[16px] font-bold text-gray-800 leading-snug line-clamp-2 flex-1">
          {title}
        </h3>
        <ArrowRight className="w-4 h-4 text-gray-300 flex-shrink-0 mt-1 group-hover:text-[#0d3080] group-hover:translate-x-0.5 transition-all" />
      </div>

      {/* 설명 */}
      {description && (
        <p className="text-[13px] text-gray-400 leading-relaxed line-clamp-2 mb-4">
          {description}
        </p>
      )}

      {/* 스팟 칩 */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {visibleSpots.map((spot) => (
          <span
            key={`${pairId}-${spot}`}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full
                       bg-gray-50 text-[11px] text-gray-600"
          >
            <MapPin className="w-2.5 h-2.5 text-ocean-500" />
            {spot}
          </span>
        ))}
        {restCount > 0 && (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-gray-50 text-[11px] text-gray-400">
            +{restCount}
          </span>
        )}
      </div>

      {/* 예상 비용 */}
      <div className="flex items-center gap-1.5 pt-3 border-t border-gray-50">
        <Wallet className="w-3.5 h-3.5 text-gray-300" />
        <span className="text-[12px] text-gray-400">예상 비용</span>
        <span className="ml-auto text-[13px] font-bold text-[#0d3080]">
          {totalCost > 0 ? `${totalCost.toLocaleString()}원` : "무료"}
        </span>
      </div>
    </button>
  );
}

// ── 메인 뷰 ───────────────────────────────────────────────────────────────────
export default function MyCourseListView() {
  const router = useRouter();
  const { data: courses, isLoading, isError } = useMyCourses();

  const handleCardClick = (pairId: string) => {
    router.push(`/course/result?pairId=${pairId}`);
  };

  return (
    <main className="mx-auto w-full max-w-[1280px] px-5 md:px-10 lg:px-20 pt-24 pb-16">
      {/* 헤더 */}
      <div className="flex items-end justify-between gap-4 mb-8">
        <div>
          <p className="text-[13px] text-ocean-600 font-semibold mb-1.5">MY COURSE</p>
          <h1 className="text-2xl font-bold text-gray-800">내가 만든 코스</h1>
          <p className="text-sm text-gray-400 mt-1.5">
            AI가 만들어준 부산 여행 코스를 확인해보세요
          </p>
        </div>
        <Link
          href="/"
          className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl
                     bg-ocean-50 text-ocean-600 text-[13px] font-semibold
                     hover:bg-ocean-100 active:scale-95 transition-all whitespace-nowrap"
        >
          <Sparkles className="w-3.5 h-3.5" />
          새 코스 만들기
        </Link>
      </div>

      {/* 본문 */}
      {isLoading ? (
        <LoadingState />
      ) : isError ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
          <p className="text-sm text-gray-500">코스 목록을 불러오지 못했어요</p>
          <button
            onClick={() => window.location.reload()}
            className="text-[13px] text-[#0d3080] font-semibold hover:underline"
          >
            다시 시도하기
          </button>
        </div>
      ) : !courses || courses.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {courses.map((course) => (
            <CourseCard
              key={course.id}
              pairId={course.pairId}
              title={course.title}
              description={course.description}
              totalCost={course.totalCost}
              spotTitles={course.spotTitles ?? []}
              onClick={() => handleCardClick(course.pairId)}
            />
          ))}
        </div>
      )}
    </main>
  );
}