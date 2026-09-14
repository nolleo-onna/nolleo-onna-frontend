"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { MapPin } from "lucide-react";

import SectionHeader from "@/features/home/components/SectionHeader";
import { CROWD_STYLE } from "@/features/crowd/utils/crowdUtils";
import { CROWD_FALLBACK_SPOTS, RELAXED_FALLBACK_SPOTS } from "@/features/home/data/crowdFallbackSpots";
import { useCongestion } from "@/features/home/hooks/useCongestion";
import { getLeastCongested, getTopCongested } from "@/features/home/utils/congestion";

type Mode = "crowd" | "relaxed";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;
const RANK_COUNT = 5;
const TABS: { id: Mode; label: string }[] = [
  { id: "crowd", label: "붐빌 곳" },
  { id: "relaxed", label: "여유로운 곳" },
];

/**
 * 오늘 혼잡도 순위 — 붐빌 곳/여유로운 곳 캐러셀 두 줄을 탭 하나로 합쳤다.
 * 왼쪽은 고른(마우스를 올린) 곳의 큰 사진, 오른쪽은 1~5위 목록과 집중률 막대. 카드 줄 대신 "순위표"로 읽힌다.
 */
export default function CrowdRankingSection() {
  const [mode, setMode] = useState<Mode>("crowd");
  const [active, setActive] = useState(0);
  const { data: congestion } = useCongestion();

  // 실데이터: 붐빌 곳=집중률 상위, 여유로운 곳=하위. 구 목록은 와도 관광지 목록이 비면 대체 데이터로
  const real = congestion?.length
    ? mode === "crowd"
      ? getTopCongested(congestion, RANK_COUNT)
      : getLeastCongested(congestion, RANK_COUNT)
    : [];
  const spots = real.length ? real : mode === "crowd" ? CROWD_FALLBACK_SPOTS : RELAXED_FALLBACK_SPOTS;
  const current = spots[Math.min(active, spots.length - 1)];

  const switchMode = (next: Mode) => {
    setMode(next);
    setActive(0);
  };

  return (
    <MotionConfig reducedMotion="user">
      <section className="py-8 md:py-12">
        <SectionHeader
          title="오늘 부산, 어디가 붐빌까?"
          description="관광공사 혼잡도 예측 기준이에요. 붐비는 곳은 피하고 여유로운 곳을 골라보세요."
          action={{ label: "혼잡도 지도", href: "/crowd" }}
        >
          <div role="tablist" aria-label="혼잡도 순위" className="flex rounded-full bg-gray-100 p-1">
            {TABS.map((tab) => {
              const selected = mode === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => switchMode(tab.id)}
                  className={`relative rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
                    selected ? "text-lime-300" : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  {selected && (
                    <motion.span
                      layoutId="crowd-ranking-tab"
                      className="absolute inset-0 rounded-full bg-navy-900"
                      transition={{ type: "spring", stiffness: 400, damping: 32 }}
                    />
                  )}
                  <span className="relative">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </SectionHeader>

        <div className="grid gap-5 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] md:gap-8">
          <Link
            href="/crowd"
            className="relative block aspect-[4/3] overflow-hidden rounded-[24px] bg-navy-800 md:aspect-auto md:min-h-[380px]"
          >
            <AnimatePresence initial={false}>
              <motion.div
                key={`${mode}-${current?.name}`}
                className="absolute inset-0"
                initial={{ opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.45, ease: EASE_OUT }}
              >
                {current?.imageUrl ? (
                  <Image
                    src={current.imageUrl}
                    alt={current.name}
                    fill
                    quality={90}
                    sizes="(max-width: 768px) 100vw, 55vw"
                    className="object-cover"
                  />
                ) : (
                  // 관광공사 혼잡도 API는 이미지를 안 내려줄 때가 있어 브랜드 톤 배경 + 핀으로 채운다
                  <div className="flex h-full items-center justify-center bg-gradient-to-br from-navy-700 to-ocean-600">
                    <MapPin className="h-10 w-10 text-white/25" strokeWidth={1.5} />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
            {current && (
              <div className="absolute inset-x-0 bottom-0 p-5 md:p-7">
                <span
                  className="rounded-full px-2.5 py-1 text-[11px] font-bold"
                  style={{ backgroundColor: CROWD_STYLE[current.level].bg, color: CROWD_STYLE[current.level].text }}
                >
                  {current.level} · 집중률 {Math.round(current.rate)}%
                </span>
                <p className="mt-3 text-2xl font-bold text-white break-keep md:text-3xl">{current.name}</p>
                <p className="mt-1 text-sm text-white/70">{current.district}</p>
              </div>
            )}
          </Link>

          <ol aria-label={mode === "crowd" ? "오늘 붐빌 곳 순위" : "오늘 여유로운 곳 순위"} className="flex flex-col justify-center">
            {spots.map((spot, i) => {
              const style = CROWD_STYLE[spot.level];
              const selected = i === Math.min(active, spots.length - 1);
              return (
                <li key={`${mode}-${spot.name}`}>
                  <button
                    type="button"
                    onMouseEnter={() => setActive(i)}
                    onFocus={() => setActive(i)}
                    onClick={() => setActive(i)}
                    aria-pressed={selected}
                    className="flex w-full items-center gap-4 border-b border-gray-100 py-3.5 text-left md:py-4"
                  >
                    <span
                      className={`w-7 shrink-0 text-center text-2xl font-bold tabular-nums transition-colors ${
                        selected ? "text-navy-900" : "text-gray-300"
                      }`}
                    >
                      {i + 1}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span
                        className={`block truncate text-[15px] font-bold transition-colors ${
                          selected ? "text-navy-900" : "text-gray-600"
                        }`}
                      >
                        {spot.name}
                      </span>
                      <span className="block truncate text-xs text-gray-400">{spot.district}</span>
                    </span>
                    <span className="hidden w-28 shrink-0 sm:block">
                      <span className="block h-1.5 overflow-hidden rounded-full bg-gray-100">
                        <motion.span
                          className="block h-full rounded-full"
                          style={{ backgroundColor: style.bg }}
                          initial={{ width: 0 }}
                          whileInView={{ width: `${Math.round(spot.rate)}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.6, ease: EASE_OUT, delay: i * 0.05 }}
                        />
                      </span>
                    </span>
                    <span className="flex w-[4.5rem] shrink-0 items-center justify-end gap-1.5 text-xs font-semibold text-gray-600">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: style.bg }} />
                      {spot.level}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </div>
      </section>
    </MotionConfig>
  );
}
