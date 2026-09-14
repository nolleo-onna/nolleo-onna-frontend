"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  AnimatePresence,
  MotionConfig,
  motion,
  useInView,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";
import { ArrowRight, Fan } from "lucide-react";

import SkyScene from "./SkyScene";
import { CROWD_STYLE } from "@/features/crowd/utils/crowdUtils";
import { useCongestion } from "@/features/home/hooks/useCongestion";
import { useWeather } from "@/features/home/hooks/useWeather";
import { mergeDistrictSummaries } from "@/features/home/utils/districtWeather";
import {
  SKY_PHASE_LABEL,
  describeHumidity,
  describeRain,
  describeSky,
  describeWind,
  findCalmestDistrict,
  getSkyPhase,
  getTemperatureRange,
  windSpinSeconds,
} from "@/features/home/utils/todaySky";

import type { DistrictSummary } from "@/features/home/utils/districtWeather";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;
const WEEKDAY = ["일", "월", "화", "수", "목", "금", "토"];
const ROTATE_MS = 4500;
const HUMIDITY_COLOR = "#2f7fe0";

// 시각·날짜는 서버와 브라우저가 다를 수 있어 브라우저에서만 읽는다(서버 렌더에서는 null·빈 문자열)
const subscribeNever = () => () => {};
const readHour = () => new Date().getHours();
const readDateLabel = () => {
  const t = new Date();
  return `${t.getMonth() + 1}월 ${t.getDate()}일 ${WEEKDAY[t.getDay()]}요일`;
};

const formatNumber = (value: number) => value.toFixed(1).replace(/\.0$/, "");

/** 구가 바뀌면 이전 값에서 새 값으로 숫자가 굴러간다 */
function CountingNumber({ value }: { value: number }) {
  const reduceMotion = useReducedMotion();
  const spring = useSpring(0, { stiffness: 80, damping: 20 });
  const text = useTransform(spring, formatNumber);

  useEffect(() => {
    if (reduceMotion) spring.jump(value);
    else spring.set(value);
  }, [value, reduceMotion, spring]);

  return <motion.span>{text}</motion.span>;
}

/** 값이 바뀔 때 아래에서 올라오고 위로 빠진다. 부모에 overflow-hidden 필요 */
function Rolling({ id, children, className = "" }: { id: string; children: React.ReactNode; className?: string }) {
  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.span
        key={id}
        className={`inline-block ${className}`}
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "-100%", opacity: 0 }}
        transition={{ duration: 0.4, ease: EASE_OUT }}
      >
        {children}
      </motion.span>
    </AnimatePresence>
  );
}

function RingGauge({ percent }: { percent: number | null }) {
  return (
    <svg viewBox="0 0 44 44" className="h-11 w-11 -rotate-90" aria-hidden>
      <circle cx="22" cy="22" r="17" fill="none" strokeWidth="5" className="stroke-gray-200" />
      {percent !== null && (
        <motion.circle
          cx="22"
          cy="22"
          r="17"
          fill="none"
          strokeWidth="5"
          strokeLinecap="round"
          stroke={HUMIDITY_COLOR}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: Math.min(percent, 100) / 100 }}
          transition={{ duration: 0.9, ease: EASE_OUT }}
        />
      )}
    </svg>
  );
}

function HalfGauge({ percent, color }: { percent: number | null; color?: string }) {
  const arc = "M6 26a20 20 0 0 1 40 0";
  return (
    <svg viewBox="0 0 52 30" className="h-11 w-[76px] max-w-full" aria-hidden>
      <path d={arc} fill="none" strokeWidth="5" strokeLinecap="round" className="stroke-gray-200" />
      {percent !== null && color && (
        <motion.path
          d={arc}
          fill="none"
          strokeWidth="5"
          strokeLinecap="round"
          stroke={color}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: Math.min(percent, 100) / 100 }}
          transition={{ duration: 0.9, ease: EASE_OUT }}
        />
      )}
    </svg>
  );
}

function Tile({
  label,
  visual,
  value,
  caption,
}: {
  label: string;
  visual: React.ReactNode;
  value: React.ReactNode;
  caption: React.ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-col rounded-2xl bg-gray-50 p-3 md:p-4">
      <p className="text-[11px] font-semibold text-gray-400">{label}</p>
      <div className="mt-2 flex h-11 items-center">{visual}</div>
      <p className="mt-2 overflow-hidden text-lg font-bold tabular-nums text-navy-900 md:text-xl">{value}</p>
      <div className="mt-0.5 truncate text-[11px] text-gray-500">{caption}</div>
    </div>
  );
}

function TodayCard({ districts }: { districts: DistrictSummary[] }) {
  const [index, setIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const pillsRef = useRef<HTMLDivElement>(null);
  const inView = useInView(cardRef, { margin: "-60px 0px" });
  const reduceMotion = useReducedMotion();
  const hour = useSyncExternalStore(subscribeNever, readHour, () => null);
  const dateLabel = useSyncExternalStore(subscribeNever, readDateLabel, () => "");

  const count = districts.length;
  const current = index % count;
  const paused = hovered || !inView;

  // 구를 자동으로 넘기되 마우스를 올렸거나 화면 밖이면 멈춘다. 직접 고르면 그 구부터 다시 센다
  useEffect(() => {
    if (count <= 1 || paused) return;
    const timer = setTimeout(() => setIndex((i) => (i + 1) % count), ROTATE_MS);
    return () => clearTimeout(timer);
  }, [count, paused, current]);

  // 고른 구 칩을 가로 목록 가운데로 — scrollIntoView는 페이지까지 움직여서 목록만 스크롤한다
  useEffect(() => {
    const row = pillsRef.current;
    const pill = row?.children[current] as HTMLElement | undefined;
    if (!row || !pill) return;
    row.scrollTo({
      left: pill.offsetLeft - (row.clientWidth - pill.offsetWidth) / 2,
      behavior: reduceMotion ? "auto" : "smooth",
    });
  }, [current, reduceMotion]);

  const summary = districts[current];
  const phase = getSkyPhase(hour ?? 12);
  const wind = describeWind(summary.wsd);
  const windy = (wind?.level ?? 0) >= 2;
  const spin = windSpinSeconds(summary.wsd);
  const crowd = summary.congestionLevel ? CROWD_STYLE[summary.congestionLevel] : null;
  const rate = summary.congestionRate !== null ? Math.round(summary.congestionRate) : null;
  const calmest = findCalmestDistrict(districts);
  const range = getTemperatureRange(districts);

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE_OUT }}
      onPointerEnter={(e) => {
        if (e.pointerType === "mouse") setHovered(true);
      }}
      onPointerLeave={() => setHovered(false)}
      className="grid overflow-hidden rounded-[28px] bg-white ring-1 ring-gray-100 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]"
    >
      {/* 하늘 — 시간대·강수·바람에 따라 장면이 바뀐다 */}
      <div className="relative isolate overflow-hidden text-white">
        <AnimatePresence initial={false}>
          <motion.div
            key={`${phase}-${summary.pty}-${windy}`}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          >
            <SkyScene phase={phase} pty={summary.pty} windy={windy} animated={inView && !reduceMotion} />
          </motion.div>
        </AnimatePresence>

        <div className="relative flex h-full min-h-[228px] flex-col justify-between gap-8 p-6 md:min-h-[272px] md:p-8">
          <div>
            <p className="text-xs font-medium text-white/75">
              {dateLabel}
              {hour !== null && ` · 지금은 ${SKY_PHASE_LABEL[phase]}`}
            </p>
            <p className="mt-1 flex items-baseline gap-1.5 overflow-hidden text-lg font-bold">
              오늘의 <Rolling id={summary.district} className="text-lime-300">{summary.district}</Rolling>
            </p>
          </div>

          <div className="flex items-end gap-4">
            <p className="text-6xl font-bold leading-none tracking-tight tabular-nums md:text-7xl">
              {summary.tmp !== null ? (
                <>
                  <CountingNumber value={summary.tmp} />
                  <span className="text-white/70">°</span>
                </>
              ) : (
                "–"
              )}
            </p>
            <div className="min-w-0 pb-1">
              <p className="overflow-hidden text-base font-semibold">
                <Rolling id={`${summary.district}-sky`}>{describeSky(summary.pty, phase)}</Rolling>
              </p>
              <p className="text-xs text-white/75">{describeRain(summary.pty, summary.rn1)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 구 고르기 · 습도 · 바람 · 혼잡 */}
      <div className="flex min-w-0 flex-col gap-4 p-5 md:p-7">
        <motion.div
          ref={pillsRef}
          layoutScroll
          aria-label="구 선택"
          className="relative -mx-1 flex gap-1 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {districts.map((item, i) => {
            const active = i === current;
            return (
              <button
                key={item.district}
                type="button"
                aria-pressed={active}
                onClick={() => setIndex(i)}
                className={`relative shrink-0 overflow-hidden rounded-full px-3.5 py-2 text-[13px] font-semibold transition-colors ${
                  active ? "text-white" : "text-gray-500 hover:bg-gray-100 hover:text-navy-900"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="today-district-pill"
                    className="absolute inset-0 rounded-full bg-navy-900"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  />
                )}
                {/* 다음 구로 넘어가기까지 남은 시간 */}
                {active && !paused && count > 1 && (
                  <motion.span
                    key={`progress-${current}`}
                    className="absolute inset-x-3 bottom-[5px] h-[2px] origin-left rounded-full bg-lime-300"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: ROTATE_MS / 1000, ease: "linear" }}
                  />
                )}
                <span className="relative">{item.district}</span>
              </button>
            );
          })}
        </motion.div>

        <div className="grid grid-cols-3 gap-2 md:gap-3">
          <Tile
            label="습도"
            visual={<RingGauge percent={summary.reh} />}
            value={<Rolling id={`${summary.district}-reh`}>{summary.reh !== null ? `${summary.reh}%` : "–"}</Rolling>}
            caption={describeHumidity(summary.reh) ?? "정보 없음"}
          />
          <Tile
            label="바람"
            visual={
              <motion.div
                key={`fan-${summary.district}`}
                animate={spin ? { rotate: 360 } : undefined}
                transition={spin ? { duration: spin, repeat: Infinity, ease: "linear" } : undefined}
              >
                <Fan className="h-9 w-9 text-ocean-500" strokeWidth={1.6} />
              </motion.div>
            }
            value={
              <Rolling id={`${summary.district}-wsd`}>
                {summary.wsd !== null ? (
                  <>
                    {summary.wsd}
                    <span className="ml-0.5 text-xs font-semibold text-gray-400">m/s</span>
                  </>
                ) : (
                  "–"
                )}
              </Rolling>
            }
            caption={wind?.label ?? "정보 없음"}
          />
          <Tile
            label="관광지 혼잡"
            visual={<HalfGauge percent={rate} color={crowd?.bg} />}
            value={<Rolling id={`${summary.district}-crowd`}>{rate !== null ? `${rate}%` : "–"}</Rolling>}
            caption={
              crowd ? (
                <span className="inline-flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: crowd.bg }} />
                  {crowd.label}
                </span>
              ) : (
                "정보 없음"
              )
            }
          />
        </div>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-dashed border-gray-200 pt-4">
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-gray-500">
            {range && (
              <span>
                지금 부산{" "}
                <b className="font-bold tabular-nums text-navy-900">
                  {formatNumber(range.min)}°~{formatNumber(range.max)}°
                </b>
              </span>
            )}
            {calmest && (
              <button
                type="button"
                onClick={() => setIndex(districts.indexOf(calmest))}
                className="inline-flex items-center gap-1 transition-colors hover:text-navy-900"
              >
                가장 여유로운 곳 <b className="font-bold text-lime-700">{calmest.district}</b>
              </button>
            )}
          </p>
          <Link
            href="/crowd"
            className="group inline-flex shrink-0 items-center gap-1 text-[13px] font-semibold text-gray-500 transition-colors hover:text-navy-900"
          >
            혼잡도 지도
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * 오늘의 부산 — 왼쪽은 지금 시간대·날씨대로 움직이는 하늘과 기온, 오른쪽은 구 고르기와 습도·바람·혼잡 게이지.
 * 구는 자동으로 넘어가며(마우스를 올리면 멈춤) 칩을 눌러 직접 고를 수 있다.
 */
export default function TodayStrip() {
  const { data: weather } = useWeather();
  const { data: congestion } = useCongestion();
  const districts = mergeDistrictSummaries(weather, congestion);

  return (
    <MotionConfig reducedMotion="user">
      <section className="py-6 md:py-8" aria-label="오늘의 부산 날씨와 혼잡도">
        {districts.length === 0 ? (
          <div className="animate-shimmer h-[500px] rounded-[28px] md:h-[272px]" />
        ) : (
          <TodayCard districts={districts} />
        )}
      </section>
    </MotionConfig>
  );
}
