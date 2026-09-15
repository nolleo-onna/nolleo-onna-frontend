"use client";

import WavesBackground from "@/components/ui/WavesBackground";
import Image from "next/image";
import Link from "next/link";
import { type Variants, MotionConfig, motion } from "motion/react";
import { CalendarDays, MapPin, MessageSquareText } from "lucide-react";

import { useEvents } from "@/features/event/hooks/useEvents";
import { sortActiveEvents, toDateKey } from "@/features/event/utils/eventSchedule";
import {
  HANKKUT_GALLERIES,
  getCuratedTotalViews,
  getGallerySummary,
} from "@/features/hankkut/data/galleries";
import { useDistrictPostStats } from "@/features/hankkut/hooks/usePosts";

import type { LucideIcon } from "lucide-react";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

// 사하·을숙도처럼 같은 구를 쓰는 동네가 있어, 글 수를 셀 땐 구를 한 번씩만 센다
const DISTRICTS = [...new Set(HANKKUT_GALLERIES.map((g) => g.districtTag))];
const CURATED_COUNT = HANKKUT_GALLERIES.reduce(
  (sum, g) => sum + getGallerySummary(g.slug).postCount,
  0,
);

// 큐레이션 조회수가 높은 동네 사진 3장을 겹쳐 쌓는다 — 맨 앞(0번)이 가장 인기 있는 동네
const STACK = HANKKUT_GALLERIES.map((gallery) => ({
  gallery,
  cover: getGallerySummary(gallery.slug).coverImage,
  views: getCuratedTotalViews(gallery.slug),
}))
  .filter((item): item is typeof item & { cover: string } => !!item.cover)
  .sort((a, b) => b.views - a.views)
  .slice(0, 3);

// 뒤 두 장이 먼저 떠오르고 맨 앞 장이 마지막에 내려앉도록 등장 순서를 따로 둔다
const STACK_LAYOUT = [
  { position: "bottom-0 left-[25%]", rotate: -2, z: 20, order: 2 },
  { position: "left-0 top-[6%]", rotate: -9, z: 10, order: 0 },
  { position: "right-0 top-0", rotate: 8, z: 10, order: 1 },
];

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

/** 한끗 허브 첫 화면 — 동네 사진이 겹쳐 떠오르고, 부산 전체의 행사·이야기 수를 먼저 보여준다 */
export default function HubHero() {
  const events = useEvents();
  const boardStats = useDistrictPostStats(DISTRICTS);
  const today = toDateKey(new Date());

  const activeEventCount = sortActiveEvents(events.data ?? [], today).length;
  const boardCount = DISTRICTS.reduce((sum, d) => sum + (boardStats.get(d)?.count ?? 0), 0);
  return (
    <MotionConfig reducedMotion="user">
      <section className="relative isolate overflow-hidden bg-ocean-700 text-white">
        {/* 홈 히어로와 같은 three.js 파도 배경 — 글자가 놓이는 왼쪽과 아래만 살짝 어둡게 해 읽기 쉽게 */}
        <WavesBackground className="-z-20" zoom={0.8} />
        <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-r from-navy-900/55 via-navy-900/20 to-transparent" />
        <div aria-hidden className="absolute inset-x-0 bottom-0 -z-10 h-24 bg-gradient-to-t from-navy-900/30 to-transparent" />

        <div className="mx-auto grid max-w-[1280px] items-center gap-12 px-5 pb-14 pt-10 md:grid-cols-[minmax(0,1fr)_minmax(0,440px)] md:px-10 md:pb-20 md:pt-14 lg:px-20">
          <motion.div variants={stagger} initial="hidden" animate="visible" className="min-w-0">
            <motion.p
              variants={rise}
              className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/80 ring-1 ring-inset ring-white/15"
            >
              <MapPin className="h-3.5 w-3.5 text-lime-300" />
              부산 동네 커뮤니티
            </motion.p>
            <motion.h1
              variants={rise}
              className="mt-5 text-4xl font-bold leading-[1.15] tracking-tight break-keep md:text-5xl"
            >
              동네마다 다른
              <br />
              <span className="text-lime-300">한끗</span>을 찾아서
            </motion.h1>
            <motion.p variants={rise} className="mt-4 max-w-md text-[15px] leading-relaxed text-white/65 break-keep">
              가본 사람만 아는 꿀팁과 후기, 지금 열리는 행사까지 동네별로 모았어요.
            </motion.p>
            <motion.dl variants={rise} className="mt-9 flex flex-wrap gap-x-8 gap-y-4">
              <Stat icon={MapPin} label="동네" value={`${HANKKUT_GALLERIES.length}곳`} />
              <Stat
                icon={CalendarDays}
                label="진행 중·예정 행사"
                value={events.isPending ? "–" : `${activeEventCount}개`}
              />
              <Stat icon={MessageSquareText} label="모인 이야기" value={`${CURATED_COUNT + boardCount}개`} />
            </motion.dl>
          </motion.div>

          {STACK.length > 0 && (
            <div className="relative mx-auto aspect-[5/4] w-full max-w-[340px] md:max-w-[440px]">
              {STACK.map(({ gallery, cover }, i) => {
                const layout = STACK_LAYOUT[i];
                return (
                  <motion.div
                    key={gallery.slug}
                    className={`absolute w-[50%] ${layout.position}`}
                    initial={{ opacity: 0, y: 70, rotate: layout.rotate - 8, scale: 0.9, zIndex: layout.z }}
                    animate={{ opacity: 1, y: 0, rotate: layout.rotate, scale: 1, zIndex: layout.z }}
                    whileHover={{
                      y: -12,
                      rotate: 0,
                      scale: 1.04,
                      zIndex: 30,
                      transition: { type: "spring", stiffness: 260, damping: 20 },
                    }}
                    transition={{ type: "spring", stiffness: 110, damping: 17, delay: 0.2 + layout.order * 0.12 }}
                  >
                    <Link
                      href={`/hankkut/region/${gallery.slug}`}
                      className="relative block aspect-[4/5] overflow-hidden rounded-[22px] bg-navy-800 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.7)] ring-1 ring-white/15"
                    >
                      <Image src={cover} alt={`${gallery.name} 풍경`} fill quality={90} sizes="240px" className="object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <span className="absolute bottom-3 left-3 rounded-full bg-black/35 px-2.5 py-1 text-xs font-bold text-white ring-1 ring-inset ring-white/15 backdrop-blur-md">
                        {gallery.name} <span className="text-lime-300">한끗</span>
                      </span>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </MotionConfig>
  );
}
