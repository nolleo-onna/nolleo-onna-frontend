"use client";

import Image from "next/image";
import Link from "next/link";
import { CalendarDays, Eye, Flame, MessageSquare } from "lucide-react";

import { eventBadgeClass } from "@/features/event/components/EventCard";
import { useEvents } from "@/features/event/hooks/useEvents";
import { toDateKey } from "@/features/event/utils/eventSchedule";
import { useRecentRegionPosts } from "@/features/hankkut/hooks/usePosts";
import { HOT_ISSUE_LIMIT, buildHotIssues } from "@/features/hankkut/utils/hotIssues";
import { filterEventsByDistrict } from "@/features/hankkut/utils/regionEvents";

import type { HankkutGallery } from "@/features/hankkut/data/galleries";
import type { HotIssueItem } from "@/features/hankkut/utils/hotIssues";

// 카드 수만큼만 칸을 나눠 한 장이 덩그러니 남지 않게 한다
const GRID_COLS = ["md:grid-cols-1", "md:grid-cols-1", "md:grid-cols-2", "md:grid-cols-3"];

function HotIssueCard({ item, wide }: { item: HotIssueItem; wide: boolean }) {
  const shape = wide ? "aspect-[4/3] md:aspect-[21/9]" : "aspect-[4/3]";

  if (item.kind === "event") {
    return (
      <Link
        href={item.href}
        className={`group relative block overflow-hidden rounded-2xl bg-navy-900 ${shape}`}
      >
        {item.imageUrl && (
          <Image
            src={item.imageUrl}
            alt={item.title}
            fill
            quality={90}
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/30" />
        <div className="absolute left-3 top-3 flex items-center gap-1.5">
          <span className="rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-bold text-navy-900">
            행사
          </span>
          <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${eventBadgeClass(item.badge)}`}>
            {item.badge.label}
          </span>
        </div>
        <div className="absolute inset-x-3 bottom-3">
          <p className="line-clamp-2 text-base font-bold leading-snug text-white">{item.title}</p>
          <p className="mt-1 flex items-center gap-1 truncate text-[11px] text-white/75">
            <CalendarDays className="h-3 w-3 shrink-0" />
            <span className="truncate">
              {item.period}
              {item.place && ` · ${item.place}`}
            </span>
          </p>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={item.href}
      className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-gradient-to-br from-navy-900 to-ocean-600 p-4 ${shape}`}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -right-1 -top-8 select-none text-[140px] font-bold leading-none text-white/10"
      >
        &rdquo;
      </span>
      <div className="relative flex flex-wrap items-center gap-1.5">
        <span className="rounded-full bg-white/15 px-2 py-0.5 text-[11px] font-bold text-white">
          by {item.authorName}
        </span>
        {item.tagLabel && (
          <span className="rounded-full bg-lime-300 px-2 py-0.5 text-[11px] font-bold text-navy-900">
            {item.tagLabel}
          </span>
        )}
      </div>
      <div className="relative">
        <p className="line-clamp-3 text-base font-bold leading-snug text-white underline-offset-4 group-hover:underline">
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

/** 동네 핫이슈 — 이 동네에서 지금 갈 수 있는 행사(포스터)와 인기글. 둘 다 없으면 줄을 숨긴다 */
export default function RegionHotIssue({ gallery }: { gallery: HankkutGallery }) {
  const events = useEvents();
  const posts = useRecentRegionPosts(gallery.districtTag);
  const today = toDateKey(new Date());

  const isPending = events.isPending || posts.isPending;
  const items = buildHotIssues(
    filterEventsByDistrict(events.data ?? [], gallery.districtTag),
    posts.data?.content ?? [],
    today,
  );

  if (!isPending && items.length === 0) return null;

  return (
    <section>
      <h2 className="mb-3 flex items-center gap-2 text-lg font-bold text-navy-900">
        <Flame className="h-5 w-5 text-pink-500" />
        {gallery.name} 핫이슈
      </h2>
      <div className="rounded-[24px] border border-gray-100 bg-white p-3 md:p-4">
        {isPending ? (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {Array.from({ length: HOT_ISSUE_LIMIT }, (_, i) => (
              <div key={i} className="animate-shimmer aspect-[4/3] rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className={`grid grid-cols-1 gap-3 ${GRID_COLS[items.length]}`}>
            {items.map((item) => (
              <HotIssueCard key={item.key} item={item} wide={items.length === 1} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
