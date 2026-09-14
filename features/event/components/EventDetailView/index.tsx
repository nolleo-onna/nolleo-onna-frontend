"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MotionConfig, motion, useReducedMotion, useSpring } from "motion/react";
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  Check,
  Clock,
  Copy,
  ExternalLink,
  Info,
  MapPin,
  Navigation,
  Phone,
  Share2,
  Ticket,
  Users,
} from "lucide-react";

import EventCard, { eventBadgeClass } from "@/features/event/components/EventCard";
import EventLocationMap from "@/features/event/components/EventLocationMap";
import { useEvent, useEvents } from "@/features/event/hooks/useEvents";
import { formatEventPeriod, getEventBadge, toDateKey } from "@/features/event/utils/eventSchedule";
import {
  formatDateWithWeekday,
  formatPeriodWithWeekday,
  getEventProgress,
  getRelatedEvents,
  parseFeeLines,
  splitListLines,
  summarizeFee,
} from "@/features/event/utils/eventText";
import { getKakaoMapDirectionsUrl } from "@/features/course/utils/kakaoMapLink";
import { extractDistrictName } from "@/features/hankkut/utils/regionEvents";
import { useShareCurrentUrl } from "@/hooks/useShareCurrentUrl";
import { EventNotFoundError } from "@/libs/api/events";

import type { Variants } from "motion/react";
import type { LucideIcon } from "lucide-react";
import type { EventProgress, FeeLine } from "@/features/event/utils/eventText";
import type { BusanEvent } from "@/types/event";

const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

const heroStagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.2 } },
};

const heroItem: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE_OUT } },
};

const RELATED_COLS = ["", "md:grid-cols-2", "md:grid-cols-2", "md:grid-cols-3", "md:grid-cols-4"];

function telHref(tel: string): string {
  return `tel:${tel.replace(/[^\d+]/g, "")}`;
}

/** http(s) 링크만 연다 — 다른 스킴(javascript: 등)은 버린다 */
function safeUrl(url: string | null): string | null {
  const trimmed = url?.trim();
  return trimmed && /^https?:\/\//i.test(trimmed) ? trimmed : null;
}

function directionsUrl(event: BusanEvent): string | null {
  if (event.mapX === null || event.mapY === null) return null;
  return getKakaoMapDirectionsUrl(event.eventPlace ?? event.title, event.mapY, event.mapX);
}

// ─────────────────────────── 히어로 ───────────────────────────

/** 마우스를 따라 포스터가 살짝 기울어진다 — 터치·움직임 줄이기 설정에서는 가만히 */
function TiltPoster({ children, disabled }: { children: React.ReactNode; disabled: boolean }) {
  const rotateX = useSpring(0, { stiffness: 160, damping: 16 });
  const rotateY = useSpring(0, { stiffness: 160, damping: 16 });

  const handleMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (disabled || e.pointerType !== "mouse") return;
    const rect = e.currentTarget.getBoundingClientRect();
    rotateY.set(((e.clientX - rect.left) / rect.width - 0.5) * 12);
    rotateX.set(-((e.clientY - rect.top) / rect.height - 0.5) * 12);
  };
  const handleLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <motion.div
      style={{ rotateX, rotateY, transformPerspective: 900 }}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
    >
      {children}
    </motion.div>
  );
}

function HeroFact({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="flex min-w-0 gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-inset ring-white/10">
        <Icon className="h-4 w-4 text-lime-300" />
      </span>
      <div className="min-w-0">
        <dt className="text-[11px] font-semibold tracking-wider text-white/45">{label}</dt>
        <dd className="mt-0.5 truncate text-sm font-semibold text-white/90" title={value}>
          {value}
        </dd>
      </div>
    </div>
  );
}

function PeriodProgress({
  event,
  progress,
  animateBar,
}: {
  event: BusanEvent;
  progress: EventProgress;
  animateBar: boolean;
}) {
  const { status, totalDays, dayNumber, daysLeft, daysUntil, ratio } = progress;

  if (status === "upcoming") {
    return (
      <div className="inline-flex items-center gap-2.5 rounded-full bg-white/10 py-2 pl-3 pr-4 ring-1 ring-inset ring-white/15">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-lime-300 opacity-60 motion-reduce:hidden" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-lime-300" />
        </span>
        <span className="text-sm font-semibold">
          {daysUntil === 1 ? "내일 시작해요" : `시작까지 ${daysUntil}일 남았어요`}
        </span>
      </div>
    );
  }

  // 1년 내내 여는 상설 행사는 "365일 중 257일째"가 어색해 종료일만 알려준다
  const caption =
    status === "ended"
      ? "종료된 행사예요"
      : totalDays > 60
        ? `${formatDateWithWeekday(event.eventEndDate)}까지 열려요`
        : daysLeft === 0
          ? "오늘이 마지막 날이에요"
          : `${totalDays}일 중 ${dayNumber}일째 · ${daysLeft}일 남았어요`;
  const width = `${Math.round(ratio * 100)}%`;

  return (
    <div className="max-w-md">
      <div className="flex items-baseline justify-between gap-3 text-xs">
        <span className="font-semibold text-white">{caption}</span>
        <span className="shrink-0 tabular-nums text-white/45">
          {formatEventPeriod(event.eventStartDate, event.eventEndDate)}
        </span>
      </div>
      <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-white/15">
        <motion.div
          className={`h-full rounded-full ${
            status === "ended" ? "bg-white/35" : "bg-gradient-to-r from-lime-400 to-lime-200"
          }`}
          initial={{ width: animateBar ? "0%" : width }}
          animate={{ width }}
          transition={{ duration: 1.2, delay: 0.6, ease: EASE_OUT }}
        />
      </div>
    </div>
  );
}

function EventActions({ event, tone }: { event: BusanEvent; tone: "dark" | "light" }) {
  const { copied, share } = useShareCurrentUrl(event.title);
  const directions = directionsUrl(event);
  const homepage = safeUrl(event.eventHomepage);
  const ghost =
    tone === "dark"
      ? "bg-white/10 text-white ring-1 ring-inset ring-white/15 hover:bg-white/20"
      : "bg-gray-100 text-gray-700 hover:bg-gray-200";

  return (
    <div className="flex items-center gap-2">
      {directions && (
        <a
          href={directions}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center justify-center gap-1.5 rounded-full bg-lime-300 px-5 py-3 text-sm font-bold text-navy-900 transition-transform hover:-translate-y-0.5 active:scale-95 ${
            tone === "light" ? "flex-1" : ""
          }`}
        >
          <Navigation className="h-4 w-4" />
          길찾기
        </a>
      )}
      <button
        type="button"
        onClick={share}
        className={`inline-flex items-center justify-center gap-1.5 rounded-full px-4 py-3 text-sm font-semibold transition-colors ${ghost} ${
          directions ? "" : "flex-1"
        }`}
      >
        {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
        {copied ? "링크 복사됨" : "공유"}
      </button>
      {homepage && tone === "dark" && (
        <a
          href={homepage}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center justify-center gap-1.5 rounded-full px-4 py-3 text-sm font-semibold transition-colors ${ghost}`}
        >
          <ExternalLink className="h-4 w-4" />
          홈페이지
        </a>
      )}
    </div>
  );
}

function Hero({ event, today }: { event: BusanEvent; today: string }) {
  const reduceMotion = useReducedMotion();
  const badge = getEventBadge(event, today);
  const district = extractDistrictName(event.addr1);
  const playTime = splitListLines(event.playTime);
  const fee = summarizeFee(event.useTimeFestival);
  const place = event.eventPlace ?? (district ? `부산 ${district}` : null);

  return (
    <section className="relative isolate overflow-hidden bg-navy-900 text-white">
      {/* 포스터를 크게 흐려 깔아 행사마다 다른 색의 분위기를 만든다 */}
      {event.firstImage && (
        <motion.div
          aria-hidden
          className="absolute inset-0 -z-20"
          initial={{ opacity: 0, scale: 1.2 }}
          animate={{ opacity: 0.55, scale: 1.08 }}
          transition={{ duration: 1.4, ease: EASE_OUT }}
        >
          <Image
            src={event.firstImage}
            alt=""
            fill
            priority
            quality={30}
            sizes="100vw"
            className="object-cover blur-3xl saturate-150"
          />
        </motion.div>
      )}
      <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-b from-navy-900/40 via-navy-900/75 to-navy-900" />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 -top-32 -z-10 h-[420px] w-[420px] rounded-full bg-ocean-500/20 blur-3xl"
      />

      <div className="mx-auto max-w-[1120px] px-5 pb-12 pt-6 md:px-10 md:pb-16 md:pt-8">
        <Link
          href="/event"
          className="inline-flex items-center gap-1 text-sm font-medium text-white/60 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          부산 축제·공연
        </Link>

        <div className="mt-6 grid items-center gap-8 md:mt-8 md:grid-cols-[280px_minmax(0,1fr)] md:gap-12 lg:grid-cols-[340px_minmax(0,1fr)]">
          <motion.div
            initial={{ opacity: 0, y: 40, rotate: -3, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, rotate: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 110, damping: 18, delay: 0.05 }}
            className="mx-auto w-full max-w-[240px] md:max-w-none"
          >
            <TiltPoster disabled={!!reduceMotion}>
              <div className="relative aspect-[3/4] overflow-hidden rounded-[24px] bg-navy-800 shadow-[0_40px_80px_-24px_rgba(0,0,0,0.75)] ring-1 ring-white/10">
                {event.firstImage ? (
                  <>
                    {/* 가로 사진도 잘리지 않게 원본은 contain, 빈 곳은 같은 사진을 흐려 채운다 */}
                    <Image
                      src={event.firstImage}
                      alt=""
                      aria-hidden
                      fill
                      quality={30}
                      sizes="340px"
                      className="scale-110 object-cover opacity-70 blur-xl"
                    />
                    <Image
                      src={event.firstImage}
                      alt={event.title}
                      fill
                      priority
                      quality={90}
                      sizes="(max-width: 768px) 240px, 340px"
                      className="object-contain"
                    />
                  </>
                ) : (
                  <div className="flex h-full items-center justify-center bg-gradient-to-br from-ocean-600 to-navy-700 text-7xl">
                    🎪
                  </div>
                )}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-white/10"
                />
              </div>
            </TiltPoster>
          </motion.div>

          <motion.div variants={heroStagger} initial="hidden" animate="show" className="min-w-0">
            <motion.div variants={heroItem} className="flex flex-wrap items-center gap-2">
              <span className={`rounded-full px-3 py-1 text-xs font-bold ring-1 ring-inset ring-white/15 ${eventBadgeClass(badge)}`}>
                {badge.label}
              </span>
              {district && (
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/80 ring-1 ring-inset ring-white/15">
                  부산 {district}
                </span>
              )}
            </motion.div>

            <motion.h1
              variants={heroItem}
              className="mt-4 text-balance break-keep text-3xl font-bold leading-[1.2] tracking-tight md:text-[42px]"
            >
              {event.title}
            </motion.h1>

            <motion.dl variants={heroItem} className="mt-7 grid gap-x-8 gap-y-4 sm:grid-cols-2">
              <HeroFact
                icon={CalendarDays}
                label="기간"
                value={formatPeriodWithWeekday(event.eventStartDate, event.eventEndDate)}
              />
              {place && <HeroFact icon={MapPin} label="장소" value={place} />}
              {playTime[0] && (
                <HeroFact
                  icon={Clock}
                  label="시간"
                  value={playTime.length > 1 ? `${playTime[0]} 외` : playTime[0]}
                />
              )}
              {fee && <HeroFact icon={Ticket} label="요금" value={fee} />}
            </motion.dl>

            <motion.div variants={heroItem} className="mt-8">
              <PeriodProgress event={event} progress={getEventProgress(event, today)} animateBar={!reduceMotion} />
            </motion.div>

            <motion.div variants={heroItem} className="mt-8 hidden md:block">
              <EventActions event={event} tone="dark" />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────── 본문 ───────────────────────────

function InfoSection({ icon: Icon, title, children }: { icon: LucideIcon; title: string; children: React.ReactNode }) {
  return (
    <motion.section
      initial={{ opacity: 0.6, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, ease: EASE_OUT }}
      className="py-6"
    >
      <h2 className="mb-3.5 flex items-center gap-2 text-sm font-bold text-navy-900">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ocean-50">
          <Icon className="h-3.5 w-3.5 text-ocean-600" />
        </span>
        {title}
      </h2>
      {children}
    </motion.section>
  );
}

function FeeTable({ lines }: { lines: FeeLine[] }) {
  return (
    <div className="flex flex-col gap-1.5">
      {lines.map((line, index) => {
        const key = `${line.kind}-${index}`;
        if (line.kind === "heading") {
          return (
            <p key={key} className="mt-2 text-xs font-bold text-ocean-600 first:mt-0">
              {line.text}
            </p>
          );
        }
        if (line.kind === "item") {
          return (
            <div key={key} className="flex items-baseline gap-3 rounded-2xl bg-gray-50 px-4 py-3">
              <span className="min-w-0 text-sm text-gray-700">{line.label}</span>
              <span aria-hidden className="min-w-4 flex-1 border-b border-dashed border-gray-200" />
              <span
                className={`shrink-0 text-sm font-bold tabular-nums ${
                  line.price === "무료" ? "text-lime-600" : "text-navy-900"
                }`}
              >
                {line.price}
              </span>
            </div>
          );
        }
        if (line.kind === "note") {
          return (
            <p key={key} className="mt-1 flex gap-1.5 text-xs leading-relaxed text-gray-500">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-400" />
              {line.text}
            </p>
          );
        }
        return (
          <p key={key} className="text-sm font-semibold leading-relaxed text-gray-800">
            {line.text}
          </p>
        );
      })}
    </div>
  );
}

function EventInfo({ event }: { event: BusanEvent }) {
  const feeLines = parseFeeLines(event.useTimeFestival);
  const playTime = splitListLines(event.playTime);
  const sponsors = [
    event.sponsor1 ? { role: "주최", name: event.sponsor1, tel: event.sponsor1Tel } : null,
    event.sponsor2 ? { role: "주관", name: event.sponsor2, tel: event.sponsor2Tel } : null,
  ].filter((s): s is { role: string; name: string; tel: string | null } => s !== null);

  if (feeLines.length === 0 && playTime.length === 0 && !event.ageLimit && sponsors.length === 0) {
    return null;
  }

  return (
    <div className="divide-y divide-gray-100 rounded-[28px] border border-gray-100 bg-white px-6 md:px-8">
      {feeLines.length > 0 && (
        <InfoSection icon={Ticket} title="이용 요금">
          <FeeTable lines={feeLines} />
        </InfoSection>
      )}
      {playTime.length > 0 && (
        <InfoSection icon={Clock} title="운영 시간">
          <ul className="flex flex-col gap-1.5">
            {playTime.map((line) => (
              <li key={line} className="text-sm tabular-nums text-gray-700">
                {line}
              </li>
            ))}
          </ul>
        </InfoSection>
      )}
      {event.ageLimit && (
        <InfoSection icon={Users} title="관람 연령">
          <span className="inline-flex rounded-full bg-ocean-50 px-3 py-1 text-sm font-semibold text-ocean-700">
            {event.ageLimit}
          </span>
        </InfoSection>
      )}
      {sponsors.length > 0 && (
        <InfoSection icon={Building2} title="주최 · 주관">
          <ul className="flex flex-col gap-2">
            {sponsors.map((sponsor) => (
              <li key={sponsor.role} className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-sm">
                <span className="w-9 shrink-0 text-xs font-semibold text-gray-400">{sponsor.role}</span>
                <span className="text-gray-800">{sponsor.name}</span>
                {sponsor.tel && (
                  <a href={telHref(sponsor.tel)} className="tabular-nums text-ocean-600 hover:underline">
                    {sponsor.tel}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </InfoSection>
      )}
    </div>
  );
}

function LocationCard({ event }: { event: BusanEvent }) {
  const [copied, setCopied] = useState(false);
  const address = [event.addr1, event.addr2].filter(Boolean).join(" ");
  const directions = directionsUrl(event);
  const secondaryCount = (address ? 1 : 0) + (event.tel ? 1 : 0);
  const secondaryWidth = secondaryCount === 1 ? "col-span-2" : "";

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // 클립보드 권한이 없으면 조용히 넘어간다
    }
  };

  return (
    <div className="overflow-hidden rounded-[28px] border border-gray-100 bg-white shadow-[0_24px_48px_-32px_rgba(13,48,128,0.35)]">
      {event.mapX !== null && event.mapY !== null && (
        <div className="h-56 bg-gray-100">
          <EventLocationMap lat={event.mapY} lng={event.mapX} label={event.eventPlace ?? event.title} />
        </div>
      )}
      <div className="p-5 md:p-6">
        <p className="text-[11px] font-semibold tracking-wider text-gray-400">오시는 길</p>
        <p className="mt-1.5 text-base font-bold leading-snug text-navy-900">
          {event.eventPlace ?? "장소 정보가 없어요"}
        </p>
        {address && <p className="mt-1 text-sm leading-relaxed text-gray-500">{address}</p>}

        {(directions || secondaryCount > 0) && (
          <div className="mt-5 grid grid-cols-2 gap-2">
            {directions && (
              <a
                href={directions}
                target="_blank"
                rel="noopener noreferrer"
                className="col-span-2 flex items-center justify-center gap-1.5 rounded-2xl bg-navy-900 py-3 text-sm font-semibold text-lime-300 transition-transform hover:-translate-y-0.5 active:scale-[0.98]"
              >
                <Navigation className="h-4 w-4" />
                카카오맵 길찾기
              </a>
            )}
            {address && (
              <button
                type="button"
                onClick={copyAddress}
                className={`${secondaryWidth} flex items-center justify-center gap-1.5 rounded-2xl bg-gray-50 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100`}
              >
                {copied ? <Check className="h-4 w-4 text-lime-600" /> : <Copy className="h-4 w-4" />}
                {copied ? "주소 복사됨" : "주소 복사"}
              </button>
            )}
            {event.tel && (
              <a
                href={telHref(event.tel)}
                className={`${secondaryWidth} flex items-center justify-center gap-1.5 rounded-2xl bg-gray-50 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100`}
              >
                <Phone className="h-4 w-4" />
                문의 전화
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function RelatedEvents({ current, today }: { current: BusanEvent; today: string }) {
  const { data } = useEvents();
  const related = getRelatedEvents(data ?? [], current, today);
  if (related.length === 0) return null;

  return (
    <section className="border-t border-gray-100 bg-white">
      <div className="mx-auto max-w-[1120px] px-5 py-12 md:px-10 md:py-16">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-pink-500">함께 가볼 만한</p>
            <h2 className="mt-1 text-xl font-bold text-navy-900 md:text-2xl">지금 열리는 다른 부산 행사</h2>
          </div>
          <Link
            href="/event"
            className="shrink-0 rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-500 transition-colors hover:bg-gray-50"
          >
            전체보기
          </Link>
        </div>
        <div className={`grid grid-cols-2 gap-x-4 gap-y-7 ${RELATED_COLS[related.length]}`}>
          {related.map((event) => (
            <EventCard key={event.contentId} event={event} today={today} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────── 상태 화면 ───────────────────────────

function DetailSkeleton() {
  return (
    <div className="bg-navy-900">
      <div className="mx-auto grid max-w-[1120px] items-center gap-8 px-5 pb-12 pt-14 md:grid-cols-[280px_minmax(0,1fr)] md:gap-12 md:px-10 lg:grid-cols-[340px_minmax(0,1fr)]">
        <div className="mx-auto aspect-[3/4] w-full max-w-[240px] animate-pulse rounded-[24px] bg-white/10 md:max-w-none" />
        <div className="flex flex-col gap-4">
          <div className="h-6 w-24 animate-pulse rounded-full bg-white/10" />
          <div className="h-10 w-3/4 animate-pulse rounded-xl bg-white/10" />
          <div className="h-5 w-1/2 animate-pulse rounded-lg bg-white/10" />
          <div className="mt-4 h-1.5 w-80 max-w-full animate-pulse rounded-full bg-white/10" />
        </div>
      </div>
    </div>
  );
}

function Notice({ title, description }: { title: string; description: string }) {
  return (
    <div className="mx-auto max-w-3xl px-5 py-16">
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
    </div>
  );
}

// ─────────────────────────── 페이지 ───────────────────────────

/**
 * 행사 상세 — 흐린 포스터 위에 포스터 카드가 떠오르는 히어로, 요금·시간·주최를 정리한 본문,
 * 데스크톱에서 스크롤을 따라오는 오시는 길 카드, 같은 기간 다른 행사.
 * 모바일은 길찾기·공유를 화면 아래에 고정한다.
 */
export default function EventDetailView({ contentId }: { contentId: string }) {
  const { data: event, isPending, isError, error } = useEvent(contentId);

  if (isError) {
    return error instanceof EventNotFoundError ? (
      <Notice title="행사를 찾을 수 없어요" description="기간이 끝나 내려갔거나 주소가 잘못됐을 수 있어요" />
    ) : (
      <Notice title="행사 정보를 불러오지 못했어요" description="잠시 후 다시 시도해주세요" />
    );
  }
  if (isPending || !event) return <DetailSkeleton />;

  const today = toDateKey(new Date());

  return (
    <MotionConfig reducedMotion="user">
      <Hero event={event} today={today} />

      <div className="bg-gray-50">
        <div className="mx-auto grid max-w-[1120px] gap-5 px-5 py-10 md:px-10 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-10 lg:py-14">
          <div className="flex min-w-0 flex-col gap-4">
            <EventInfo event={event} />
            <p className="px-2 text-[11px] leading-relaxed text-gray-400">
              한국관광공사 TourAPI 기준 정보예요. 일정·요금은 주최 측 사정으로 바뀔 수 있으니 방문 전 확인하세요.
            </p>
          </div>
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <LocationCard event={event} />
          </aside>
        </div>
      </div>

      <RelatedEvents current={event} today={today} />

      {/* 모바일 하단 고정 버튼 — 가려지지 않게 같은 높이만큼 여백을 둔다 */}
      <div aria-hidden className="h-24 md:hidden" />
      <div
        className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-100 bg-white/90 px-4 pt-3 backdrop-blur-md md:hidden"
        style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
      >
        <EventActions event={event} tone="light" />
      </div>
    </MotionConfig>
  );
}
