"use client";

import Image from "next/image";
import Link from "next/link";
import { MotionConfig, motion } from "motion/react";
import { ArrowRight, CalendarDays, Eye, Flame, MessageSquare, Sparkles } from "lucide-react";

import TiltCard from "@/components/ui/TiltCard";
import { eventBadgeClass } from "@/features/event/components/EventCard";
import { useEvents } from "@/features/event/hooks/useEvents";
import { toDateKey } from "@/features/event/utils/eventSchedule";
import { getPostsForGallery } from "@/features/hankkut/data/galleries";
import { useRecentRegionPosts, usePostThumbnails } from "@/features/hankkut/hooks/usePosts";
import { HOT_ISSUE_LIMIT, buildHotIssues } from "@/features/hankkut/utils/hotIssues";
import { filterEventsByDistrict } from "@/features/hankkut/utils/regionEvents";

import type { HankkutGallery } from "@/features/hankkut/data/galleries";
import type { HotIssueItem } from "@/features/hankkut/utils/hotIssues";

const CARD =
  "group relative block aspect-[3/4] overflow-hidden rounded-[20px] shadow-[0_18px_40px_-24px_rgba(5,12,26,0.6)] transition-shadow duration-300 hover:shadow-[0_28px_56px_-20px_rgba(5,12,26,0.55)]";
const CARD_SIZES = "(max-width: 640px) 50vw, 280px";

function HotIssueCard({ item }: { item: HotIssueItem }) {
  if (item.kind === "event") {
    return (
      <Link href={item.href} className={`${CARD} bg-navy-900`}>
        {item.imageUrl && (
          <>
            {/* 포스터가 잘리지 않게 원본은 contain, 빈 곳은 같은 이미지를 흐려 채운다 */}
            <Image src={item.imageUrl} alt="" aria-hidden fill quality={30} sizes="280px" className="scale-110 object-cover opacity-60 blur-xl" />
            <Image
              src={item.imageUrl}
              alt={item.title}
              fill
              quality={90}
              sizes={CARD_SIZES}
              className="object-contain transition-transform duration-500 group-hover:scale-[1.03]"
            />
          </>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-black/30" />
        <div className="absolute left-3 top-3 flex flex-wrap items-center gap-1.5">
          <span className="rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-bold text-navy-900">행사</span>
          <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ring-1 ring-inset ring-white/20 ${eventBadgeClass(item.badge)}`}>
            {item.badge.label}
          </span>
        </div>
        <div className="absolute inset-x-3 bottom-3">
          <p className="line-clamp-2 text-[15px] font-bold leading-snug text-white break-keep">{item.title}</p>
          <p className="mt-1.5 flex items-center gap-1 text-[11px] text-white/70">
            <CalendarDays className="h-3 w-3 shrink-0" />
            <span className="truncate">{item.period}</span>
          </p>
        </div>
      </Link>
    );
  }

  if (item.kind === "curated") {
    return (
      <Link href={item.href} className={`${CARD} bg-navy-800`}>
        <Image
          src={item.imageUrl}
          alt={item.title}
          fill
          quality={90}
          sizes={CARD_SIZES}
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent" />
        <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-lime-300 px-2 py-0.5 text-[11px] font-bold text-navy-900">
          <Sparkles className="h-3 w-3" />
          {item.category}
        </span>
        <p className="absolute inset-x-3 bottom-3 line-clamp-3 text-[15px] font-bold leading-snug text-white break-keep">
          {item.title}
        </p>
      </Link>
    );
  }

  // 사진을 올린 글은 행사 포스터처럼 사진을 깔고 글자를 얹는다
  if (item.imageUrl) {
    return (
      <Link href={item.href} className={`${CARD} bg-navy-900`}>
        <Image
          src={item.imageUrl}
          alt={item.title}
          fill
          quality={90}
          sizes={CARD_SIZES}
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/35" />
        <div className="absolute left-3 top-3 flex flex-wrap items-center gap-1.5">
          <span className="rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-bold text-navy-900">글</span>
          {item.tagLabel && (
            <span className="rounded-full bg-lime-300 px-2 py-0.5 text-[11px] font-bold text-navy-900">{item.tagLabel}</span>
          )}
        </div>
        <div className="absolute inset-x-3 bottom-3">
          <p className="line-clamp-2 text-[15px] font-bold leading-snug text-white break-keep">{item.title}</p>
          <p className="mt-1.5 flex items-center gap-2.5 text-[11px] text-white/75">
            <span className="truncate">by {item.authorName}</span>
            <span className="flex shrink-0 items-center gap-0.5">
              <Eye className="h-3 w-3" />
              {item.viewCount}
            </span>
            <span className="flex shrink-0 items-center gap-0.5">
              <MessageSquare className="h-3 w-3" />
              {item.commentCount}
            </span>
          </p>
        </div>
      </Link>
    );
  }

  return (
    <Link href={item.href} className={`${CARD} flex flex-col justify-between bg-gradient-to-br from-navy-900 to-ocean-600 p-4`}>
      <span
        aria-hidden
        className="pointer-events-none absolute -right-1 -top-8 select-none text-[140px] font-bold leading-none text-white/10"
      >
        &rdquo;
      </span>
      <div className="relative flex flex-wrap items-center gap-1.5">
        <span className="rounded-full bg-white/15 px-2 py-0.5 text-[11px] font-bold text-white">by {item.authorName}</span>
        {item.tagLabel && (
          <span className="rounded-full bg-lime-300 px-2 py-0.5 text-[11px] font-bold text-navy-900">{item.tagLabel}</span>
        )}
      </div>
      <div className="relative">
        <p className="line-clamp-4 text-base font-bold leading-snug text-white break-keep underline-offset-4 group-hover:underline">
          {item.title}
        </p>
        <p className="mt-2 flex items-center gap-2.5 text-[11px] text-white/70">
          <span className="flex items-center gap-0.5">
            <Eye className="h-3 w-3" />
            {item.viewCount}
          </span>
          <span className="flex items-center gap-0.5">
            <MessageSquare className="h-3 w-3" />
            {item.commentCount}
          </span>
        </p>
      </div>
    </Link>
  );
}

/**
 * 동네 핫이슈 — 이 동네에서 지금 갈 수 있는 행사(포스터)와 인기글. 모자란 칸은 큐레이션 한끗으로 채운다.
 * 카드는 행사 상세의 포스터처럼 기울어진 채로 떠올라 제자리에 앉는다. 보여줄 게 하나도 없으면 줄을 숨긴다.
 */
export default function RegionHotIssue({ gallery }: { gallery: HankkutGallery }) {
  const events = useEvents();
  const posts = useRecentRegionPosts(gallery.districtTag);
  const today = toDateKey(new Date());

  // 카드에 올릴 글 사진 — 목록 응답엔 없어서 사진 있는 글만 상세로 따로 받는다
  const recentPosts = posts.data?.content ?? [];
  const postThumbnails = usePostThumbnails(recentPosts);

  const isPending = events.isPending || posts.isPending;
  const items = buildHotIssues(
    filterEventsByDistrict(events.data ?? [], gallery.districtTag),
    recentPosts,
    today,
    getPostsForGallery(gallery.slug),
    HOT_ISSUE_LIMIT,
    postThumbnails,
  );

  if (!isPending && items.length === 0) return null;

  return (
    <MotionConfig reducedMotion="user">
      <section className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-10">
        <div className="lg:pt-2">
          <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-navy-900 break-keep">
            <Flame className="h-6 w-6 text-pink-500" />
            {gallery.name} 핫이슈
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-gray-500 break-keep">
            이 동네에서 지금 갈 수 있는 행사와 많이 본 이야기를 모았어요.
          </p>
          <Link
            href="/event"
            className="mt-4 hidden items-center gap-1 text-sm font-semibold text-ocean-600 hover:underline lg:inline-flex"
          >
            부산 행사 전체보기
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {isPending ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-5">
            {Array.from({ length: HOT_ISSUE_LIMIT }, (_, i) => (
              <div key={i} className="animate-shimmer aspect-[3/4] rounded-[20px]" />
            ))}
          </div>
        ) : (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-5">
            {items.map((item, i) => (
              <motion.li
                key={item.key}
                initial={{ opacity: 0, y: 48, rotate: i % 2 === 0 ? -3 : 3, scale: 0.94 }}
                whileInView={{ opacity: 1, y: 0, rotate: 0, scale: 1 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ type: "spring", stiffness: 110, damping: 18, delay: i * 0.1 }}
              >
                <TiltCard maxTilt={5}>
                  <HotIssueCard item={item} />
                </TiltCard>
              </motion.li>
            ))}
          </ul>
        )}
      </section>
    </MotionConfig>
  );
}
