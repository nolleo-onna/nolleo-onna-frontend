"use client";

import WavesBackground from "@/components/ui/WavesBackground";
import Image from "next/image";
import Link from "next/link";
import { type Variants, MotionConfig, motion } from "motion/react";
import { ArrowLeft, ArrowUpRight, CalendarDays, MessageSquareText, PenLine } from "lucide-react";

import TiltCard from "@/components/ui/TiltCard";
import { useEvents } from "@/features/event/hooks/useEvents";
import { sortActiveEvents, toDateKey } from "@/features/event/utils/eventSchedule";
import GalleryFallbackArt from "@/features/hankkut/components/GalleryFallbackArt";
import { POST_DISTRICT_LABELS } from "@/features/hankkut/constants/postTags";
import { getPostsForGallery } from "@/features/hankkut/data/galleries";
import { useRegionPosts } from "@/features/hankkut/hooks/usePosts";
import { filterEventsByDistrict } from "@/features/hankkut/utils/regionEvents";

import type { LucideIcon } from "lucide-react";
import type { HankkutGallery } from "@/features/hankkut/data/galleries";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};
const rise: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE_OUT } },
};

function Stat({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-inset ring-white/10">
        <Icon className="h-4 w-4 text-lime-300" />
      </span>
      <div>
        <dt className="text-[11px] font-semibold tracking-wider text-white/45">{label}</dt>
        <dd className="mt-0.5 text-lg font-bold tabular-nums text-white">{value}</dd>
      </div>
    </div>
  );
}

/** 동네 게시판 첫 화면 — 동네 사진이 떠오르며 기울고, 지금 열리는 행사·모인 이야기 수와 글쓰기를 먼저 보여준다 */
export default function RegionHero({ gallery }: { gallery: HankkutGallery }) {
  const events = useEvents();
  // 화제글 [최신] 첫 페이지와 같은 캐시라 추가 요청이 없다
  const board = useRegionPosts(gallery.districtTag);
  const today = toDateKey(new Date());

  const curated = getPostsForGallery(gallery.slug);
  const topCurated = [...curated].sort((a, b) => b.views - a.views)[0];
  const cover = curated[0]?.imageUrl;
  const activeEvents = sortActiveEvents(
    filterEventsByDistrict(events.data ?? [], gallery.districtTag),
    today,
  );
  const storyCount = board.isPending ? null : curated.length + (board.data?.totalElements ?? 0);

  return (
    <MotionConfig reducedMotion="user">
      <section className="relative isolate overflow-hidden bg-ocean-700 text-white">
        {/* 홈 히어로와 같은 three.js 파도 배경 — 글자가 놓이는 왼쪽과 아래만 살짝 어둡게 해 읽기 쉽게 */}
        <WavesBackground className="-z-20" zoom={0.8} />
        <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-r from-navy-900/55 via-navy-900/20 to-transparent" />
        <div aria-hidden className="absolute inset-x-0 bottom-0 -z-10 h-24 bg-gradient-to-t from-navy-900/30 to-transparent" />

        <div className="mx-auto max-w-[1280px] px-5 pb-12 pt-6 md:px-10 md:pb-16 md:pt-8 lg:px-20">
          <Link
            href="/hankkut"
            className="inline-flex items-center gap-1 text-sm font-medium text-white/60 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            전체 동네
          </Link>

          <div className="mt-6 grid items-center gap-10 md:mt-8 md:grid-cols-[minmax(0,1fr)_minmax(0,440px)] md:gap-12">
            <motion.div variants={stagger} initial="hidden" animate="visible" className="min-w-0">
              <motion.span
                variants={rise}
                className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/80 ring-1 ring-inset ring-white/15"
              >
                부산 {POST_DISTRICT_LABELS[gallery.districtTag]}
              </motion.span>
              <motion.h1 variants={rise} className="mt-4 text-5xl font-bold leading-none tracking-tight break-keep md:text-6xl">
                {gallery.name} <span className="text-lime-300">한끗</span>
              </motion.h1>
              <motion.p variants={rise} className="mt-4 text-base text-white/65 break-keep md:text-lg">
                {gallery.tagline}
              </motion.p>
              <motion.dl variants={rise} className="mt-8 flex flex-wrap gap-x-8 gap-y-4">
                <Stat
                  icon={CalendarDays}
                  label="진행 중·예정 행사"
                  value={events.isPending ? "–" : `${activeEvents.length}개`}
                />
                <Stat icon={MessageSquareText} label="모인 이야기" value={storyCount === null ? "–" : `${storyCount}개`} />
              </motion.dl>
              <motion.div variants={rise} className="mt-8 flex flex-wrap gap-2.5">
                <Link
                  href={`/hankkut/region/${gallery.slug}/write`}
                  className="inline-flex items-center gap-1.5 rounded-full bg-lime-300 px-5 py-3 text-sm font-bold text-navy-900 transition-transform hover:-translate-y-0.5 active:scale-95"
                >
                  <PenLine className="h-4 w-4" />
                  글쓰기
                </Link>
                <a
                  href="#board"
                  className="inline-flex items-center rounded-full bg-white/10 px-5 py-3 text-sm font-semibold text-white ring-1 ring-inset ring-white/15 transition-colors hover:bg-white/15"
                >
                  게시판 보기
                </a>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40, rotate: 4, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, rotate: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 110, damping: 18, delay: 0.15 }}
              className="mx-auto w-full max-w-[440px]"
            >
              <TiltCard>
                <div className="relative aspect-[4/3] overflow-hidden rounded-[28px] bg-navy-800 shadow-[0_40px_80px_-24px_rgba(0,0,0,0.75)] ring-1 ring-white/10">
                  {cover ? (
                    <Image
                      src={cover}
                      alt={`${gallery.name} 풍경`}
                      fill
                      priority
                      quality={90}
                      sizes="(max-width: 768px) 100vw, 440px"
                      className="object-cover"
                    />
                  ) : (
                    <GalleryFallbackArt name={gallery.name} />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  {topCurated && (
                    <Link
                      href={`/hankkut/${topCurated.id}`}
                      className="group absolute inset-x-3 bottom-3 flex items-center gap-2.5 rounded-2xl bg-white/10 p-3 ring-1 ring-inset ring-white/15 backdrop-blur-md transition-colors hover:bg-white/20"
                    >
                      <span className="shrink-0 rounded-full bg-lime-300 px-2 py-0.5 text-[10px] font-bold text-navy-900">
                        많이 본 한끗
                      </span>
                      <span className="line-clamp-1 text-sm font-semibold text-white">{topCurated.title}</span>
                      <ArrowUpRight className="ml-auto h-4 w-4 shrink-0 text-white/70 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </Link>
                  )}
                </div>
              </TiltCard>
            </motion.div>
          </div>
        </div>
      </section>
    </MotionConfig>
  );
}
