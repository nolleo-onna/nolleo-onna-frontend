"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { type Variants, MotionConfig, motion } from "motion/react";
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
import { ASSISTANT_NAME } from "@/constants/assistant";
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
          {ASSISTANT_NAME}에게 원하는 여행을 말하면
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
const gridStagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};
const cardRise: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 140, damping: 20 } },
};

/** 코스 카드 — 설명 글 대신 "어디서 어디로 가는지"를 번호 매긴 미니 동선으로 먼저 보여준다 */
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
  const stops = spotTitles.slice(0, 3);
  const restCount = spotTitles.length - stops.length;

  return (
    <button
      onClick={onClick}
      aria-label={`${title} 코스 상세 보기`}
      className="group flex h-full w-full flex-col rounded-[28px] bg-white p-6 text-left ring-1 ring-gray-100
                 transition-all duration-300 ease-out hover:-translate-y-1 hover:ring-ocean-200
                 hover:shadow-[0_24px_48px_-20px_rgba(13,48,128,0.28)] active:translate-y-0"
    >
      <div className="flex items-center gap-1.5">
        {isPublic ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-lime-100 px-2 py-0.5 text-[10px] font-bold text-lime-700">
            <Globe className="h-2.5 w-2.5" />
            홈에 공개 중{likeCount ? ` · 좋아요 ${likeCount}` : ""}
          </span>
        ) : (
          <span className="inline-flex items-center rounded-full bg-gray-50 px-2 py-0.5 text-[10px] font-semibold text-gray-400">
            나만 보는 코스
          </span>
        )}
      </div>

      <h3 className="mt-3 line-clamp-2 text-[18px] font-bold leading-snug tracking-tight text-navy-900 break-keep">
        {title}
      </h3>
      {description && <p className="mt-1.5 line-clamp-1 text-[13px] text-gray-400">{description}</p>}

      {/* 미니 동선 */}
      <ol className="mt-5 flex-1">
        {stops.map((spot, i) => {
          const hasNext = i < stops.length - 1 || restCount > 0;
          return (
            <li key={`${pairId}-${i}-${spot}`} className="flex items-stretch gap-3">
              <div className="flex flex-col items-center">
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                    i === 0 ? "bg-navy-900 text-lime-300" : "bg-white text-gray-500 ring-1 ring-gray-200"
                  }`}
                >
                  {i + 1}
                </span>
                {hasNext && <span className="my-0.5 w-0 flex-1 border-l border-dashed border-gray-300" />}
              </div>
              <span className="truncate pb-2.5 text-[13px] text-gray-700">{spot}</span>
            </li>
          );
        })}
        {restCount > 0 && (
          <li className="flex items-center gap-1 pl-8 text-[12px] font-medium text-gray-400">
            <MapPin className="h-3 w-3" />
            {restCount}곳 더 들러요
          </li>
        )}
      </ol>

      <div className="mt-5 flex items-end justify-between border-t border-dashed border-gray-100 pt-4">
        <div>
          <p className="text-[11px] text-gray-400">{spotTitles.length}곳 · 예상 비용</p>
          <p className="mt-0.5 text-[20px] font-bold tabular-nums tracking-tight text-navy-900">
            {totalCost > 0 ? `${totalCost.toLocaleString()}원` : "무료"}
          </p>
        </div>
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 text-gray-400 transition-colors duration-300 group-hover:bg-navy-900 group-hover:text-lime-300">
          <ArrowUpRight className="h-4 w-4" />
        </span>
      </div>
    </button>
  );
}

// ── 헤더 — 통계 + 동선 그림 ───────────────────────────────────────────────────
const heroStagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};
const heroRise: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

const ROUTE_PINS = [
  { x: 28, y: 172, label: "바다" },
  { x: 150, y: 86, label: "카페" },
  { x: 262, y: 150, label: "맛집" },
  { x: 338, y: 48, label: "야경" },
];

/** 코스 = 동선. 선이 그려지고 핀이 차례로 꽂히는 그림으로 목록 페이지의 성격을 보여준다 */
function RouteIllustration() {
  return (
    <svg viewBox="0 0 366 214" aria-hidden className="mx-auto hidden w-full max-w-[360px] md:block">
      <path
        d="M28 172 C 80 172, 96 86, 150 86 S 214 150, 262 150 S 320 48, 338 48"
        fill="none"
        stroke="rgba(255,255,255,0.08)"
        strokeWidth="14"
        strokeLinecap="round"
      />
      <motion.path
        d="M28 172 C 80 172, 96 86, 150 86 S 214 150, 262 150 S 320 48, 338 48"
        fill="none"
        stroke="#d4f55a"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="2 9"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.4, ease: "easeInOut", delay: 0.2 }}
      />
      {ROUTE_PINS.map((pin, i) => {
        const isGoal = i === ROUTE_PINS.length - 1;
        return (
          <motion.g
            key={pin.label}
            initial={{ opacity: 0, scale: 0.4 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 16, delay: 0.35 + i * 0.3 }}
            style={{ transformOrigin: `${pin.x}px ${pin.y}px` }}
          >
            <circle cx={pin.x} cy={pin.y} r="15" fill={isGoal ? "#d4f55a" : "#ffffff"} />
            <text
              x={pin.x}
              y={pin.y + 4.5}
              textAnchor="middle"
              fontSize="13"
              fontWeight="700"
              fill="#050c1a"
            >
              {i + 1}
            </text>
            <text x={pin.x} y={pin.y - 22} textAnchor="middle" fontSize="11" fontWeight="600" fill="rgba(255,255,255,0.6)">
              {pin.label}
            </text>
          </motion.g>
        );
      })}
    </svg>
  );
}

function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[11px] font-semibold tracking-wider text-white/45">{label}</dt>
      <dd className="mt-0.5 text-2xl font-bold tabular-nums text-white">{value}</dd>
    </div>
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

  const listedCount = courses?.filter((course) => course.isPublic).length ?? 0;
  const likeTotal = courses?.reduce((sum, course) => sum + (course.likeCount ?? 0), 0) ?? 0;

  const handleResetFilters = () => {
    router.replace("?", { scroll: false });
  };

  return (
    <MotionConfig reducedMotion="user">
    <main className="mx-auto w-full max-w-[1280px] px-5 md:px-10 lg:px-20 pt-28 pb-20">
      {/* 헤더 — 만든 코스 · 홈에 올린 코스 · 받은 좋아요 */}
      <section className="relative isolate mb-10 overflow-hidden rounded-[32px] bg-navy-900 text-white">
        <div aria-hidden className="pointer-events-none absolute -left-24 -top-24 -z-10 h-72 w-72 rounded-full bg-ocean-500/25 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-32 right-10 -z-10 h-72 w-72 rounded-full bg-lime-300/10 blur-3xl" />
        <div className="grid items-center gap-8 px-6 py-10 md:grid-cols-[minmax(0,1fr)_minmax(0,360px)] md:px-12 md:py-12">
          <motion.div variants={heroStagger} initial="hidden" animate="visible" className="min-w-0">
            <motion.p
              variants={heroRise}
              className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/80 ring-1 ring-inset ring-white/15"
            >
              <Sparkles className="h-3.5 w-3.5 text-lime-300" />
              {ASSISTANT_NAME}와 함께 만든 나만의 부산 여행
            </motion.p>
            <motion.h1 variants={heroRise} className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
              내가 만든 <span className="text-lime-300">코스</span>
            </motion.h1>
            <motion.dl variants={heroRise} className="mt-7 flex flex-wrap gap-x-8 gap-y-3">
              <HeroStat label="만든 코스" value={isLoading ? "–" : `${courses?.length ?? 0}개`} />
              <HeroStat label="홈에 올린 코스" value={isLoading ? "–" : `${listedCount}개`} />
              <HeroStat label="받은 좋아요" value={isLoading ? "–" : `${likeTotal}개`} />
            </motion.dl>
            <motion.div variants={heroRise} className="mt-8">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 rounded-full bg-lime-300 px-5 py-3 text-[14px] font-bold text-navy-900
                           transition-transform hover:-translate-y-0.5 active:scale-95"
              >
                <Sparkles className="h-4 w-4" />
                새 코스 만들기
              </Link>
            </motion.div>
          </motion.div>
          <RouteIllustration />
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
              className="w-full rounded-full border border-gray-200 bg-white py-3 pl-10 pr-9 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition-colors focus:border-ocean-400"
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
              <motion.div
                key={`${page}-${sort}-${cost}`}
                className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
                variants={gridStagger}
                initial="hidden"
                animate="visible"
              >
                {visibleCourses.map((course) => (
                  <motion.div key={course.id} variants={cardRise} className="h-full">
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
                  </motion.div>
                ))}
              </motion.div>

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
    </MotionConfig>
  );
}
