"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { ArrowRight, CloudRain, Snowflake, Sun } from "lucide-react";

import { CROWD_STYLE } from "@/features/crowd/utils/crowdUtils";
import { useCongestion } from "@/features/home/hooks/useCongestion";
import { useWeather } from "@/features/home/hooks/useWeather";
import { mergeDistrictSummaries } from "@/features/home/utils/districtWeather";
import { ptyLabelMap } from "@/types/weather";

import type { LucideIcon } from "lucide-react";
import type { PtyCode } from "@/types/weather";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;
const WEEKDAY = ["일", "월", "화", "수", "목", "금", "토"];
const ROTATE_MS = 3500;

const WEATHER_ICON: Record<PtyCode, LucideIcon> = { 0: Sun, 1: CloudRain, 2: CloudRain, 3: Snowflake };

function todayLabel() {
  const t = new Date();
  return `${t.getMonth() + 1}월 ${t.getDate()}일 ${WEEKDAY[t.getDay()]}요일`;
}

function Metric({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`min-w-0 ${className}`}>
      <p className="text-[11px] font-semibold tracking-wider text-gray-400">{label}</p>
      <div className="mt-1">{children}</div>
    </div>
  );
}

/**
 * 오늘의 부산 — 구별 날씨·강수·관광지 혼잡을 한 줄 신문 날씨란처럼 보여준다.
 * 예전의 무지개색 그라데이션 카드 3장 대신 숫자와 글자가 주인공이고, 구 이름만 위로 굴러가며 바뀐다.
 */
export default function TodayStrip() {
  const { data: weather } = useWeather();
  const { data: congestion } = useCongestion();
  const districts = mergeDistrictSummaries(weather, congestion);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (districts.length <= 1) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % districts.length), ROTATE_MS);
    return () => clearInterval(timer);
  }, [districts.length]);

  if (districts.length === 0) {
    return (
      <section className="py-6 md:py-8">
        <div className="animate-shimmer h-[112px] rounded-[24px]" />
      </section>
    );
  }

  const summary = districts[index % districts.length];
  const Icon = WEATHER_ICON[summary.pty] ?? Sun;
  const crowd = summary.congestionLevel ? CROWD_STYLE[summary.congestionLevel] : null;
  const rate = summary.congestionRate !== null ? Math.round(summary.congestionRate) : null;

  const rolling = (key: string, children: React.ReactNode, className = "") => (
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.span
        key={`${key}-${summary.district}`}
        className={`inline-block ${className}`}
        initial={{ y: 14, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -14, opacity: 0 }}
        transition={{ duration: 0.35, ease: EASE_OUT }}
      >
        {children}
      </motion.span>
    </AnimatePresence>
  );

  return (
    <MotionConfig reducedMotion="user">
      <section className="py-6 md:py-8" aria-label="오늘의 부산 날씨와 혼잡도">
        <div className="grid grid-cols-3 gap-x-4 gap-y-5 rounded-[24px] bg-white px-5 py-5 ring-1 ring-gray-100 md:flex md:items-center md:gap-0 md:px-8 md:py-6">
          <div className="col-span-3 flex items-end justify-between gap-3 md:block md:w-56 md:shrink-0">
            <div className="min-w-0">
              <p className="text-xs font-medium text-gray-400">{todayLabel()}</p>
              <p className="mt-1 flex items-baseline gap-1.5 overflow-hidden text-xl font-bold text-navy-900">
                오늘의 {rolling("district", summary.district, "text-ocean-600")}
              </p>
            </div>
            <Link href="/crowd" className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-gray-500 md:hidden">
              혼잡도 지도
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <Metric label="기온" className="md:border-l md:border-gray-100 md:px-8">
            <p className="flex items-center gap-1.5 overflow-hidden text-xl font-bold tabular-nums text-navy-900 md:text-3xl">
              <Icon className="h-5 w-5 shrink-0 text-ocean-500" />
              {rolling("tmp", summary.tmp !== null ? `${summary.tmp}°` : "–")}
            </p>
          </Metric>

          <Metric label="하늘·강수" className="md:border-l md:border-gray-100 md:px-8">
            <p className="overflow-hidden text-xl font-bold text-navy-900 md:text-3xl">
              {rolling("pty", ptyLabelMap[summary.pty])}
            </p>
            <p className="mt-0.5 text-xs text-gray-400">
              {summary.rn1 !== null ? `강수량 ${summary.rn1}mm` : "강수량 정보 없음"}
            </p>
          </Metric>

          <Metric label="관광지 혼잡" className="md:min-w-[200px] md:border-l md:border-gray-100 md:px-8">
            {crowd ? (
              <>
                <p className="flex items-center gap-2 overflow-hidden text-xl font-bold text-navy-900 md:text-3xl">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: crowd.bg }} />
                  {rolling("crowd", crowd.label)}
                </p>
                {rate !== null && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="h-1.5 w-full max-w-[120px] overflow-hidden rounded-full bg-gray-100">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: crowd.bg }}
                        initial={false}
                        animate={{ width: `${rate}%` }}
                        transition={{ duration: 0.5, ease: EASE_OUT }}
                      />
                    </div>
                    <span className="text-[11px] tabular-nums text-gray-400">{rate}%</span>
                  </div>
                )}
              </>
            ) : (
              <p className="text-xl font-bold text-gray-300 md:text-3xl">–</p>
            )}
          </Metric>

          <Link
            href="/crowd"
            className="group ml-auto hidden shrink-0 items-center gap-1 text-sm font-semibold text-gray-500 transition-colors hover:text-navy-900 md:inline-flex"
          >
            혼잡도 지도
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </section>
    </MotionConfig>
  );
}
