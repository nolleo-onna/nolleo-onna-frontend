"use client";

import { useMemo } from "react";
import { type Variants, MotionConfig, motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, CalendarDays, MessageSquareText, PenLine } from "lucide-react";

import { useEvents } from "@/features/event/hooks/useEvents";
import { sortActiveEvents, toDateKey } from "@/features/event/utils/eventSchedule";
import GalleryFallbackArt from "@/features/hankkut/components/GalleryFallbackArt";
import {
  HANKKUT_GALLERIES,
  getCuratedTotalViews,
  getGallerySummary,
} from "@/features/hankkut/data/galleries";
import { useDistrictPostStats } from "@/features/hankkut/hooks/usePosts";
import { filterEventsByDistrict } from "@/features/hankkut/utils/regionEvents";

import type { HankkutGallery } from "@/features/hankkut/data/galleries";
import type { PostDistrictTag } from "@/types/post";

type BoardStats = Map<PostDistrictTag, { count: number; latest: { title: string } | undefined }>;
const DISTRICTS = HANKKUT_GALLERIES.map((g) => g.districtTag);

const CHIP =
  "flex items-center gap-1 rounded-full bg-black/35 px-2.5 py-1 text-[11px] font-bold text-white ring-1 ring-inset ring-white/15 backdrop-blur-md";

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 120, damping: 20 },
  },
};

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06 },
  },
};

/**
 * 큐레이션 조회수 + 자유게시판 글 수로 가장 인기 있는 동네를 고른다.
 * 서버 목록은 카드용으로 글 수만 가볍게 받아서, 글 하나를 조회수 10으로 쳐서 합산한다.
 */
function pickFeaturedSlug(boardStats: BoardStats): string | null {
  const totals = HANKKUT_GALLERIES.map((gallery) => {
    const boardCount = boardStats.get(gallery.districtTag)?.count ?? 0;
    return { slug: gallery.slug, views: getCuratedTotalViews(gallery.slug) + boardCount * 10 };
  });
  const top = totals.reduce<{ slug: string; views: number } | null>(
    (best, current) => (!best || current.views > best.views ? current : best),
    null
  );
  return top?.slug ?? null;
}

interface GalleryCardProps {
  gallery: HankkutGallery;
  postCount: number;
  eventCount: number;
  coverImage?: string;
  previewTitle?: string;
  featured: boolean;
}

function GalleryCard({ gallery, postCount, eventCount, coverImage, previewTitle, featured }: GalleryCardProps) {
  return (
    <Link
      href={`/hankkut/region/${gallery.slug}`}
      className={`group relative block overflow-hidden rounded-[24px] bg-navy-800 transition-shadow duration-300 hover:shadow-[0_24px_48px_-20px_rgba(5,12,26,0.55)] ${
        featured ? "h-full min-h-[20rem]" : "h-60"
      }`}
    >
      {coverImage ? (
        <Image
          src={coverImage}
          alt={gallery.name}
          fill
          quality={90}
          sizes="(max-width: 744px) 100vw, (max-width: 1280px) 66vw, 50vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
      ) : (
        <GalleryFallbackArt name={gallery.name} />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/5" />

      <div className="absolute inset-x-0 top-0 flex items-center gap-1.5 p-4">
        <span className={CHIP}>
          <MessageSquareText className="h-3 w-3" />글 {postCount}
        </span>
        {eventCount > 0 && (
          <span className="flex items-center gap-1 rounded-full bg-lime-300 px-2.5 py-1 text-[11px] font-bold text-navy-900">
            <CalendarDays className="h-3 w-3" />
            행사 {eventCount}
          </span>
        )}
        {featured && (
          <span className="ml-auto rounded-full bg-pink-500 px-2.5 py-1 text-[11px] font-bold text-white">
            지금 가장 인기
          </span>
        )}
      </div>

      <div className={`absolute inset-x-0 bottom-0 ${featured ? "p-6 md:p-7" : "p-5"}`}>
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <h2 className={`font-bold tracking-tight text-white ${featured ? "text-3xl md:text-4xl" : "text-2xl"}`}>
              {gallery.name} <span className="text-lime-300">한끗</span>
            </h2>
            <p className={`mt-1 text-white/70 ${featured ? "text-sm" : "text-xs"}`}>{gallery.tagline}</p>
          </div>
          <span className="flex h-9 w-9 shrink-0 translate-y-2 items-center justify-center rounded-full bg-white text-navy-900 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <ArrowUpRight className="h-4 w-4" />
          </span>
        </div>
        <p
          className={`mt-3 flex items-center gap-1.5 border-t border-white/15 pt-3 text-white/85 ${
            featured ? "text-sm" : "text-xs"
          }`}
        >
          {previewTitle ? (
            <>
              <MessageSquareText className="h-3.5 w-3.5 shrink-0 text-lime-300" />
              <span className="line-clamp-1">{previewTitle}</span>
            </>
          ) : (
            <>
              <PenLine className="h-3.5 w-3.5 shrink-0 text-lime-300" />
              첫 글의 주인공이 되어보세요
            </>
          )}
        </p>
      </div>
    </Link>
  );
}

// 지역 갤러리 목록 — 큐레이션+자유게시판 조회수를 합쳐 가장 인기 있는 동네 하나를 크게 보여준다.
// 나머지는 카드마다 대표 사진·글 수·지금 열리는 행사 수·인기글 제목을 미리보기로 보여준다.
// 대표 사진이 없는 동네는 이모지 대신 동네 이름을 크게 깐 타이포 배경을 쓴다.
export default function GalleryGrid() {
  const boardStats = useDistrictPostStats(DISTRICTS);
  const { data: events } = useEvents();

  // 인기 동네를 배열 맨 앞으로 재배치한다. CSS만으로 순서를 바꾸면(col-start
  // 등) 아이템 수·그리드 트랙이 바뀌는 타이밍에 배치가 깨지는 걸 겪어서,
  // 배열 자체를 재배치하는 더 단순하고 안전한 방식을 쓴다.
  const orderedGalleries = useMemo(() => {
    const featuredSlug = pickFeaturedSlug(boardStats);
    if (!featuredSlug) return HANKKUT_GALLERIES;
    const featured = HANKKUT_GALLERIES.find((g) => g.slug === featuredSlug);
    if (!featured) return HANKKUT_GALLERIES;
    return [featured, ...HANKKUT_GALLERIES.filter((g) => g.slug !== featuredSlug)];
  }, [boardStats]);

  const eventCounts = useMemo(() => {
    const today = toDateKey(new Date());
    return new Map(
      HANKKUT_GALLERIES.map((g) => [
        g.slug,
        sortActiveEvents(filterEventsByDistrict(events ?? [], g.districtTag), today).length,
      ])
    );
  }, [events]);

  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-3"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.05 }}
      >
        {orderedGalleries.map((gallery, index) => {
          const { postCount: curatedCount, coverImage, topPostTitle } = getGallerySummary(gallery.slug);
          const board = boardStats.get(gallery.districtTag);
          const postCount = curatedCount + (board?.count ?? 0);
          // 큐레이션 인기글이 없으면 자유게시판 최신 글이라도 미리보기로 보여준다
          const previewTitle = topPostTitle ?? board?.latest?.title;
          const featured = index === 0;

          return (
            <motion.div
              key={gallery.slug}
              variants={itemVariants}
              className={featured ? "sm:col-span-2 lg:col-span-2 lg:row-span-2" : undefined}
            >
              <GalleryCard
                gallery={gallery}
                postCount={postCount}
                eventCount={eventCounts.get(gallery.slug) ?? 0}
                coverImage={coverImage}
                previewTitle={previewTitle}
                featured={featured}
              />
            </motion.div>
          );
        })}
      </motion.div>
    </MotionConfig>
  );
}
