import Image from "next/image";
import Link from "next/link";
import { CalendarDays, MapPin } from "lucide-react";

import { formatEventPeriod, getEventBadge } from "@/features/event/utils/eventSchedule";

import type { EventStatus } from "@/features/event/utils/eventSchedule";
import type { BusanEvent } from "@/types/event";

const BADGE_STYLES: Record<EventStatus, string> = {
  ongoing: "bg-lime-300 text-navy-900",
  upcoming: "bg-navy-900 text-lime-300",
  ended: "bg-gray-200 text-gray-500",
};

interface EventCardProps {
  event: BusanEvent;
  /** YYYY-MM-DD — 목록 전체가 같은 기준일로 배지를 계산하도록 부모가 넘긴다 */
  today: string;
}

// 포스터가 주인공인 행사 카드. 배지로 "지금 갈 수 있는지"를 먼저 보여준다.
export default function EventCard({ event, today }: EventCardProps) {
  const badge = getEventBadge(event, today);
  const badgeClass = badge.endingSoon ? "bg-pink-500 text-white" : BADGE_STYLES[badge.status];

  return (
    <Link href={`/event/${encodeURIComponent(event.contentId)}`} className="group block">
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-gradient-to-br from-ocean-100 via-white to-lime-100">
        {event.firstImage ? (
          <Image
            src={event.firstImage}
            alt={event.title}
            fill
            quality={90}
            sizes="(max-width: 768px) 50vw, 25vw"
            className={`object-cover transition-transform duration-500 group-hover:scale-105 ${
              badge.status === "ended" ? "grayscale" : ""
            }`}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-5xl opacity-50">🎪</div>
        )}
        <span
          className={`absolute left-2.5 top-2.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${badgeClass}`}
        >
          {badge.label}
        </span>
      </div>
      <p className="mt-2.5 line-clamp-2 text-sm font-bold leading-snug text-gray-900 transition-colors group-hover:text-ocean-600">
        {event.title}
      </p>
      <p className="mt-1 flex items-center gap-1 text-xs text-gray-500">
        <CalendarDays className="h-3 w-3 shrink-0" />
        {formatEventPeriod(event.eventStartDate, event.eventEndDate)}
      </p>
      {event.eventPlace && (
        <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-400">
          <MapPin className="h-3 w-3 shrink-0" />
          <span className="truncate">{event.eventPlace}</span>
        </p>
      )}
    </Link>
  );
}
