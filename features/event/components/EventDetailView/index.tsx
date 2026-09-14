"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  Clock,
  ExternalLink,
  MapPin,
  Navigation,
  Phone,
  Ticket,
  Users,
} from "lucide-react";

import { useEvent } from "@/features/event/hooks/useEvents";
import { formatEventPeriod, getEventBadge, toDateKey } from "@/features/event/utils/eventSchedule";
import { getKakaoMapDirectionsUrl } from "@/features/course/utils/kakaoMapLink";
import { EventNotFoundError } from "@/libs/api/events";

import type { LucideIcon } from "lucide-react";

function telHref(tel: string): string {
  return `tel:${tel.replace(/[^\d+]/g, "")}`;
}

/** http(s) 링크만 연다 — 다른 스킴(javascript: 등)은 버린다 */
function safeUrl(url: string | null): string | null {
  const trimmed = url?.trim();
  return trimmed && /^https?:\/\//i.test(trimmed) ? trimmed : null;
}

function InfoRow({ icon: Icon, label, children }: { icon: LucideIcon; label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3 py-3.5">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-ocean-500" />
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-gray-400">{label}</p>
        <div className="mt-0.5 whitespace-pre-line break-words text-sm leading-relaxed text-gray-700">
          {children}
        </div>
      </div>
    </div>
  );
}

function TelLink({ tel }: { tel: string }) {
  return (
    <a href={telHref(tel)} className="text-ocean-600 hover:underline">
      {tel}
    </a>
  );
}

function Notice({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-[28px] border border-gray-100 bg-white px-6 py-20 text-center">
      <span className="text-3xl">🎪</span>
      <p className="text-[15px] font-semibold text-gray-700">{title}</p>
      <p className="text-xs text-gray-400">{description}</p>
      <Link
        href="/event"
        className="mt-1 rounded-full bg-navy-900 px-5 py-2.5 text-xs font-semibold text-lime-300 transition-transform active:scale-95"
      >
        행사 목록으로
      </Link>
    </div>
  );
}

export default function EventDetailView({ contentId }: { contentId: string }) {
  const { data: event, isPending, isError, error } = useEvent(contentId);

  if (isError) {
    return error instanceof EventNotFoundError ? (
      <Notice title="행사를 찾을 수 없어요" description="기간이 끝나 내려갔거나 주소가 잘못됐을 수 있어요" />
    ) : (
      <Notice title="행사 정보를 불러오지 못했어요" description="잠시 후 다시 시도해주세요" />
    );
  }
  if (isPending || !event) return <div className="animate-shimmer h-[480px] rounded-[28px]" />;

  const badge = getEventBadge(event, toDateKey(new Date()));
  const address = [event.addr1, event.addr2].filter(Boolean).join(" ");
  const homepage = safeUrl(event.eventHomepage);
  const hasCoords = event.mapX !== null && event.mapY !== null;

  return (
    <article>
      <Link
        href="/event"
        className="inline-flex items-center gap-1 text-sm font-medium text-gray-500 transition-colors hover:text-navy-900"
      >
        <ArrowLeft className="h-4 w-4" />
        행사 목록
      </Link>

      <div className="mt-5 overflow-hidden rounded-[28px] border border-gray-100 bg-white">
        {event.firstImage && (
          <div className="relative aspect-[16/9] w-full bg-gray-50">
            <Image
              src={event.firstImage}
              alt={event.title}
              fill
              priority
              quality={90}
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-contain"
            />
          </div>
        )}

        <div className="p-6 md:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                badge.endingSoon
                  ? "bg-pink-500 text-white"
                  : badge.status === "ongoing"
                    ? "bg-lime-300 text-navy-900"
                    : badge.status === "upcoming"
                      ? "bg-navy-900 text-lime-300"
                      : "bg-gray-200 text-gray-500"
              }`}
            >
              {badge.label}
            </span>
            <span className="flex items-center gap-1 text-sm text-gray-500">
              <CalendarDays className="h-4 w-4" />
              {formatEventPeriod(event.eventStartDate, event.eventEndDate)}
            </span>
          </div>

          <h1 className="mt-3 text-2xl font-bold leading-snug text-navy-900 md:text-3xl">{event.title}</h1>

          {(hasCoords || homepage) && (
            <div className="mt-5 flex flex-wrap gap-2">
              {hasCoords && (
                <a
                  href={getKakaoMapDirectionsUrl(event.eventPlace ?? event.title, event.mapY!, event.mapX!)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-full bg-navy-900 px-4 py-2 text-xs font-semibold text-lime-300 transition-transform hover:-translate-y-0.5"
                >
                  <Navigation className="h-3.5 w-3.5" />
                  카카오맵 길찾기
                </a>
              )}
              {homepage && (
                <a
                  href={homepage}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-full border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-600 transition-colors hover:border-gray-300"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  공식 홈페이지
                </a>
              )}
            </div>
          )}

          <div className="mt-6 divide-y divide-gray-100 border-t border-gray-100">
            {(event.eventPlace || address) && (
              <InfoRow icon={MapPin} label="장소">
                {event.eventPlace && <span className="font-semibold text-gray-800">{event.eventPlace}</span>}
                {address && <span className="block text-gray-500">{address}</span>}
              </InfoRow>
            )}
            {event.playTime && (
              <InfoRow icon={Clock} label="운영 시간">
                {event.playTime}
              </InfoRow>
            )}
            {event.useTimeFestival && (
              <InfoRow icon={Ticket} label="이용 요금">
                {event.useTimeFestival}
              </InfoRow>
            )}
            {event.ageLimit && (
              <InfoRow icon={Users} label="관람 연령">
                {event.ageLimit}
              </InfoRow>
            )}
            {(event.sponsor1 || event.sponsor2) && (
              <InfoRow icon={Building2} label="주최 · 주관">
                {event.sponsor1 && (
                  <span className="block">
                    주최 {event.sponsor1}
                    {event.sponsor1Tel && (
                      <>
                        {" · "}
                        <TelLink tel={event.sponsor1Tel} />
                      </>
                    )}
                  </span>
                )}
                {event.sponsor2 && (
                  <span className="block">
                    주관 {event.sponsor2}
                    {event.sponsor2Tel && (
                      <>
                        {" · "}
                        <TelLink tel={event.sponsor2Tel} />
                      </>
                    )}
                  </span>
                )}
              </InfoRow>
            )}
            {event.tel && (
              <InfoRow icon={Phone} label="문의">
                <TelLink tel={event.tel} />
              </InfoRow>
            )}
          </div>

          <p className="mt-6 text-[11px] text-gray-400">
            한국관광공사 TourAPI 기준 정보예요. 일정·요금은 주최 측 사정으로 바뀔 수 있어요.
          </p>
        </div>
      </div>
    </article>
  );
}
