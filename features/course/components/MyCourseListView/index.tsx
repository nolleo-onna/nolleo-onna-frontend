"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Search,
  Sparkles,
  ArrowUpRight,
  Compass,
  Globe,
  SearchX,
} from "lucide-react";
import CourseListToolbar from "@/features/course/components/CourseListToolbar";
import { useMyCourses } from "@/features/course/hooks/useMyCourses";
import {
  COURSE_PAGE_SIZE,
  applyCourseListControls,
  filterCoursesBySearch,
  parseCostFilter,
  parseSortKey,
} from "@/features/course/utils/courseListFilters";

// ── 빈 상태 ───────────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-28 gap-6 text-center">
      <div className="w-20 h-20 rounded-[26px] bg-gradient-to-br from-ocean-50 to-lime-50 flex items-center justify-center">
        <Compass className="w-9 h-9 text-ocean-500" strokeWidth={1.5} />
      </div>
      <div>
        <p className="text-[19px] font-semibold text-gray-900 tracking-tight">아직 만든 코스가 없어요</p>
        <p className="text-[15px] text-gray-400 mt-2 leading-relaxed">
          AI에게 원하는 여행을 말하면
          <br />
          부산 맞춤 코스를 만들어드려요
        </p>
      </div>
      <Link
        href="/"
        className="mt-1 inline-flex items-center gap-2 px-6 py-3.5 rounded-full
                   bg-ocean-500 text-white text-[15px] font-semibold
                   hover:bg-ocean-600 active:opacity-80 transition-all duration-200"
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="rounded-[28px] border border-gray-100 bg-white p-6"
        >
          <div className="h-5 w-3/4 rounded-lg mb-3 animate-shimmer" />
          <div className="h-3 w-full rounded mb-2 animate-shimmer" />
          <div className="h-3 w-2/3 rounded mb-6 animate-shimmer" />
          <div className="flex gap-2">
            <div className="h-6 w-20 rounded-full animate-shimmer" />
            <div className="h-6 w-16 rounded-full animate-shimmer" />
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
  isPublic,
  likeCount,
  onClick,
}: {
  pairId: string;
  title: string;
  description: string;
  totalCost: number;
  spotTitles: string[];
  isPublic?: boolean;
  likeCount?: number;
  onClick: () => void;
}) {
  const visibleSpots = spotTitles.slice(0, 3);
  const restCount = spotTitles.length - visibleSpots.length;

  return (
    <button
      onClick={onClick}
      className="group text-left rounded-[28px] border border-gray-100 bg-white p-6
                 hover:border-ocean-200 hover:shadow-[0_20px_40px_-16px_rgba(10,132,255,0.18)]
                 hover:-translate-y-1 active:translate-y-0 active:shadow-none
                 transition-all duration-300 ease-out"
      aria-label={`${title} 코스 상세 보기`}
    >
      {/* 공개 뱃지 — 공유 링크가 살아 있는 코스 */}
      {isPublic && (
        <span className="mb-2 inline-flex items-center gap-1 rounded-full bg-lime-50 px-2 py-0.5 text-[10px] font-bold text-lime-700">
          <Globe className="h-2.5 w-2.5" />
          공개 중{likeCount ? ` · 좋아요 ${likeCount}` : ""}
        </span>
      )}

      {/* 제목 */}
      <div className="flex items-start justify-between gap-3 mb-2.5">
        <h3 className="text-[17px] font-semibold text-gray-900 tracking-tight leading-snug line-clamp-2 flex-1">
          {title}
        </h3>
        <div className="w-7 h-7 rounded-full bg-gray-50 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-ocean-500 transition-colors duration-300">
          <ArrowUpRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-white transition-colors duration-300" />
        </div>
      </div>

      {/* 설명 */}
      {description && (
        <p className="text-[13px] text-gray-400 leading-relaxed line-clamp-2 mb-5">
          {description}
        </p>
      )}

      {/* 스팟 칩 */}
      <div className="flex flex-wrap gap-1.5 mb-5">
        {visibleSpots.map((spot) => (
          <span
            key={`${pairId}-${spot}`}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full
                       bg-ocean-50 text-[11px] text-ocean-700"
          >
            <MapPin className="w-2.5 h-2.5 text-ocean-500" />
            {spot}
          </span>
        ))}
        {restCount > 0 && (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full border border-gray-100 text-[11px] text-gray-300">
            +{restCount}
          </span>
        )}
      </div>

      {/* 예상 비용 */}
      <div className="flex items-center pt-4 border-t border-gray-50">
        <span className="text-[12px] text-gray-400">예상 비용</span>
        <span className="ml-auto text-[15px] font-bold text-navy-600 tracking-tight">
          {totalCost > 0 ? `${totalCost.toLocaleString()}원` : "무료"}
        </span>
      </div>
    </button>
  );
}

// ── 필터 결과 빈 상태 ─────────────────────────────────────────────────────────
function FilteredEmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-50">
        <SearchX className="h-7 w-7 text-gray-300" strokeWidth={1.5} />
      </div>
      <p className="text-[15px] text-gray-500">조건에 맞는 코스가 없어요</p>
      <button
        onClick={onReset}
        className="text-[13px] font-semibold text-ocean-500 hover:underline"
      >
        필터 초기화
      </button>
    </div>
  );
}

// ── 메인 뷰 ───────────────────────────────────────────────────────────────────
export default function MyCourseListView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: courses, isLoading, isError } = useMyCourses();

  const sort = parseSortKey(searchParams.get("sort"));
  const cost = parseCostFilter(searchParams.get("cost"));

  // 검색어: 입력은 즉시 반영하고, URL(q)에는 타이핑이 멈춘 뒤 동기화해
  // 새로고침/공유 시에도 유지되게 한다.
  const [search, setSearch] = useState(() => searchParams.get("q") ?? "");
  useEffect(() => {
    const timeout = setTimeout(() => {
      const params = new URLSearchParams(window.location.search);
      const current = params.get("q") ?? "";
      if (current === search.trim()) return;
      if (search.trim()) params.set("q", search.trim());
      else params.delete("q");
      params.delete("page"); // 검색이 바뀌면 1페이지부터
      const query = params.toString();
      router.replace(query ? `?${query}` : "?", { scroll: false });
    }, 400);
    return () => clearTimeout(timeout);
  }, [search, router]);

  const filteredCourses = courses
    ? filterCoursesBySearch(applyCourseListControls(courses, sort, cost), search)
    : [];

  // 페이지네이션 — 9개씩
  const totalPages = Math.max(1, Math.ceil(filteredCourses.length / COURSE_PAGE_SIZE));
  const pageParam = Number(searchParams.get("page") ?? 1);
  const page = Number.isInteger(pageParam)
    ? Math.min(Math.max(pageParam, 1), totalPages)
    : 1;
  const visibleCourses = filteredCourses.slice(
    (page - 1) * COURSE_PAGE_SIZE,
    page * COURSE_PAGE_SIZE,
  );

  const goToPage = (next: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (next <= 1) params.delete("page");
    else params.set("page", String(next));
    const query = params.toString();
    router.replace(query ? `?${query}` : "?", { scroll: false });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCardClick = (pairId: string) => {
    router.push(`/course/result?pairId=${pairId}`);
  };

  const handleResetFilters = () => {
    router.replace("?", { scroll: false });
  };

  return (
    <main className="mx-auto w-full max-w-[1280px] px-5 md:px-10 lg:px-20 pt-28 pb-20">
      {/* 헤더 배너 */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-ocean-50 via-white to-lime-50 mb-10">
        <div className="relative flex flex-col gap-6 px-6 py-10 md:flex-row md:items-end md:justify-between md:px-12 md:py-12">
          <div>
            <p className="text-sm font-semibold text-ocean-600">AI가 만들어준 나만의 부산 여행</p>
            <h1 className="mt-2 text-4xl font-bold text-navy-900 md:text-5xl">
              내가 만든{" "}
              <span className="relative inline-block">
                <span
                  aria-hidden
                  className="absolute inset-x-0 bottom-1 -z-10 h-4 rounded-sm bg-lime-300"
                />
                코스
              </span>
            </h1>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 self-start rounded-full bg-navy-900 px-5 py-3
                       text-[14px] font-semibold text-lime-300 whitespace-nowrap
                       transition-all hover:-translate-y-0.5 hover:brightness-110"
          >
            <Sparkles className="w-3.5 h-3.5" />
            새 코스 만들기
          </Link>
        </div>
      </section>

      {/* 본문 */}
      {isLoading ? (
        <LoadingState />
      ) : isError ? (
        <div className="flex flex-col items-center justify-center py-28 gap-3 text-center">
          <p className="text-[15px] text-gray-500">코스 목록을 불러오지 못했어요</p>
          <button
            onClick={() => window.location.reload()}
            className="text-[13px] text-ocean-500 font-semibold hover:underline"
          >
            다시 시도하기
          </button>
        </div>
      ) : !courses || courses.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          {/* 검색 */}
          <div className="relative mb-4 max-w-md">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="코스 이름·장소로 검색 (예: 광안리)"
              className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-9 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition-colors focus:border-ocean-400"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                aria-label="검색어 지우기"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>

          <CourseListToolbar />
          {visibleCourses.length === 0 ? (
            <FilteredEmptyState onReset={handleResetFilters} />
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {visibleCourses.map((course) => (
                  <CourseCard
                    key={course.id}
                    pairId={course.pairId}
                    title={course.title}
                    description={course.description}
                    totalCost={course.totalCost}
                    spotTitles={course.spotTitles ?? []}
                    isPublic={course.isPublic}
                    likeCount={course.likeCount}
                    onClick={() => handleCardClick(course.pairId)}
                  />
                ))}
              </div>

              {/* 페이지네이션 */}
              {totalPages > 1 && (
                <nav
                  aria-label="코스 목록 페이지"
                  className="mt-10 flex items-center justify-center gap-1.5"
                >
                  <button
                    onClick={() => goToPage(page - 1)}
                    disabled={page <= 1}
                    aria-label="이전 페이지"
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition-colors hover:bg-gray-50 disabled:opacity-30 disabled:hover:bg-transparent"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                    <button
                      key={n}
                      onClick={() => goToPage(n)}
                      aria-current={n === page ? "page" : undefined}
                      className={`h-9 w-9 rounded-full text-sm font-semibold transition-colors ${
                        n === page
                          ? "bg-navy-900 text-lime-300"
                          : "text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                  <button
                    onClick={() => goToPage(page + 1)}
                    disabled={page >= totalPages}
                    aria-label="다음 페이지"
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition-colors hover:bg-gray-50 disabled:opacity-30 disabled:hover:bg-transparent"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </nav>
              )}
            </>
          )}
        </>
      )}
    </main>
  );
}
