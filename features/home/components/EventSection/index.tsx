"use client";

import Image from "next/image";
import Link from "next/link";
import { MotionConfig, motion } from "motion/react";
import { ArrowRight, CalendarDays } from "lucide-react";

import Container from "@/components/layout/Container";
import HoloCard, { HoloGlare } from "@/components/ui/HoloCard";
import { eventBadgeClass } from "@/features/event/components/EventCard";
import { useEvents } from "@/features/event/hooks/useEvents";
import { getEventHankkutHref } from "@/features/hankkut/utils/eventHankkutLink";
import {
  formatEventPeriod,
  getEventBadge,
  sortActiveEvents,
  toDateKey,
} from "@/features/event/utils/eventSchedule";

const POSTER_COUNT = 4;
// 포스터 높이를 조금씩 엇갈려 벽에 붙여 둔 것처럼 보이게 한다 (데스크톱만 — 모바일은 가로로 넘긴다)
const OFFSETS = ["md:translate-y-0", "md:translate-y-10", "md:-translate-y-2", "md:translate-y-8"];

/**
 * 지금 열리는 부산 행사 — 홈에서 유일하게 화면 끝까지 차는 어두운 띠. 행사 상세처럼 포스터가 기울어진 채
 * 떠올라 제자리에 앉고, 마우스로 누른 채 끌면 카드처럼 기울며 광택이 따라온다. 진행 중(곧 끝나는 순) → 곧 시작하는 순, 보여줄 게 없거나 실패하면 통째로 숨긴다.
 */
export default function EventSection() {
  const { data, isPending, isError } = useEvents();
  const today = toDateKey(new Date());
  const active = sortActiveEvents(data ?? [], today);

  if (isError || (!isPending && active.length === 0)) return null;

  const posters = active.slice(0, POSTER_COUNT);
  const backdrop = posters.find((event) => event.firstImage)?.firstImage;

  return (
    <MotionConfig reducedMotion="user">
      <section className="relative isolate my-8 overflow-hidden bg-navy-900 py-14 text-white md:my-12 md:py-20">
        {backdrop && (
          <div aria-hidden className="absolute inset-0 -z-20 opacity-30">
            <Image src={backdrop} alt="" fill quality={30} sizes="100vw" className="object-cover blur-3xl saturate-150" />
          </div>
        )}
        <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-b from-navy-900/70 via-navy-900/85 to-navy-900" />

        <Container>
          <div className="grid items-center gap-10 lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-14">
            <div>
              <p className="text-sm font-semibold text-lime-300">부산 축제·공연</p>
              <h2 className="mt-3 text-3xl font-bold leading-tight tracking-tight break-keep md:text-4xl">
                지금 부산에서
                <br />
                열리고 있어요
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-white/60 break-keep">
                {isPending
                  ? "행사 일정을 불러오고 있어요"
                  : `진행 중이거나 곧 시작하는 행사 ${active.length}개를 곧 끝나는 순서로 모았어요.`}
              </p>
              <Link
                href="/event"
                className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-lime-300 px-5 py-3 text-sm font-bold text-navy-900 transition-transform hover:-translate-y-0.5 active:scale-95"
              >
                행사 전체보기
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {isPending ? (
              <div className="flex gap-4 overflow-hidden md:grid md:grid-cols-4 md:gap-5">
                {Array.from({ length: POSTER_COUNT }, (_, i) => (
                  <div key={i} className="aspect-[3/4] w-[62%] shrink-0 animate-pulse rounded-[18px] bg-white/10 md:w-auto" />
                ))}
              </div>
            ) : (
              <ul className="scrollbar-hide -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-4 md:gap-5 md:overflow-visible md:px-0 md:pb-10">
                {posters.map((event, i) => {
                  const badge = getEventBadge(event, today);
                  return (
                    <li key={event.contentId} className={`relative z-0 w-[62%] shrink-0 snap-start has-[[data-lifted=true]]:z-20 sm:w-[40%] md:w-auto ${OFFSETS[i]}`}>
                      <motion.div
                        initial={{ opacity: 0, y: 60, rotate: i % 2 === 0 ? -4 : 4, scale: 0.92 }}
                        whileInView={{ opacity: 1, y: 0, rotate: 0, scale: 1 }}
                        viewport={{ once: true, margin: "-60px" }}
                        transition={{ type: "spring", stiffness: 100, damping: 17, delay: i * 0.1 }}
                      >
                        <HoloCard>
                          {/* 포스터는 그 행사의 한끗 정보로 — 행사 자체 상세는 "행사 전체보기"에서 들어간다 */}
                          <Link href={getEventHankkutHref(event)} className="group block">
                            <div className="relative aspect-[3/4] overflow-hidden rounded-[18px] bg-navy-800 shadow-[0_30px_60px_-24px_rgba(0,0,0,0.8)] ring-1 ring-white/10">
                              {event.firstImage && (
                                <>
                                  {/* 포스터가 잘리지 않게 원본은 contain, 빈 곳은 같은 이미지를 흐려 채운다 */}
                                  <Image
                                    src={event.firstImage}
                                    alt=""
                                    aria-hidden
                                    fill
                                    quality={30}
                                    sizes="260px"
                                    className="scale-110 object-cover opacity-60 blur-xl"
                                  />
                                  <Image
                                    src={event.firstImage}
                                    alt={event.title}
                                    fill
                                    quality={90}
                                    sizes="(max-width: 768px) 62vw, 260px"
                                    className="object-contain transition-transform duration-500 group-hover:scale-[1.03]"
                                  />
                                </>
                              )}
                              <HoloGlare />
                              <span
                                className={`absolute left-3 top-3 z-20 rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ring-inset ring-white/20 ${eventBadgeClass(badge)}`}
                              >
                                {badge.label}
                              </span>
                            </div>
                            <p className="mt-3 line-clamp-2 text-sm font-bold leading-snug text-white break-keep transition-colors group-hover:text-lime-300">
                              {event.title}
                            </p>
                            <p className="mt-1 flex items-center gap-1 text-xs text-white/50">
                              <CalendarDays className="h-3 w-3 shrink-0" />
                              {formatEventPeriod(event.eventStartDate, event.eventEndDate)}
                            </p>
                          </Link>
                        </HoloCard>
                      </motion.div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </Container>
      </section>
    </MotionConfig>
  );
}
