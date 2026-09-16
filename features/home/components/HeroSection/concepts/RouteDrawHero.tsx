"use client";

import { useEffect, useState } from "react";
import { motion, useSpring, useTransform } from "motion/react";

import ConceptShell from "./ConceptShell";

// 예시 코스 — 지도 모양은 실제 축척이 아닌 느낌용
const STOPS = [
  { x: 90, y: 150, name: "전포카페거리", crowd: "여유" },
  { x: 232, y: 82, name: "부산시민공원", crowd: "여유" },
  { x: 382, y: 170, name: "광안리 해변", crowd: "보통" },
  { x: 522, y: 104, name: "황령산 야경", crowd: "여유" },
] as const;
const ROUTE = "M90,150 C140,60 190,70 232,82 S330,212 382,170 S470,90 522,104";
const DRAW_S = 2.6;
const LOOP_MS = 7500;

function CountUp({ to, format }: { to: number; format: (v: number) => string }) {
  const spring = useSpring(0, { stiffness: 40, damping: 18 });
  const text = useTransform(spring, format);
  useEffect(() => {
    spring.set(to);
  }, [spring, to]);
  return <motion.span>{text}</motion.span>;
}

function RouteBoard({ cycle }: { cycle: number }) {
  return (
    <div className="relative mx-auto aspect-[600/280] w-full max-w-[640px] overflow-hidden rounded-[28px] bg-navy-900/45 ring-1 ring-inset ring-white/25 backdrop-blur-xl shadow-[0_30px_60px_-30px_rgba(5,12,26,0.7)]">
      <svg viewBox="0 0 600 280" className="absolute inset-0 h-full w-full" aria-hidden>
        <defs>
          <pattern id="route-dots" width="18" height="18" patternUnits="userSpaceOnUse">
            <circle cx="1.5" cy="1.5" r="1.2" fill="rgba(255,255,255,0.22)" />
          </pattern>
        </defs>
        <rect width="600" height="280" fill="url(#route-dots)" />
        {/* 바다 */}
        <path d="M0,222 C90,206 160,244 250,228 S420,190 480,218 S560,250 600,236 L600,280 L0,280 Z" fill="rgba(52,166,255,0.28)" />
        <path d={ROUTE} fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="3" strokeDasharray="2 8" strokeLinecap="round" />
        <motion.path
          key={`route-${cycle}`}
          d={ROUTE}
          fill="none"
          stroke="#d4f55a"
          strokeWidth="6"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: DRAW_S, ease: "easeInOut" }}
        />
      </svg>

      {STOPS.map((stop, i) => (
        <motion.div
          key={`${stop.name}-${cycle}`}
          className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
          style={{ left: `${(stop.x / 600) * 100}%`, top: `${(stop.y / 280) * 100}%` }}
          initial={{ opacity: 0, scale: 0.4 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: (DRAW_S / (STOPS.length - 1)) * i, type: "spring", stiffness: 420, damping: 20 }}
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[14px] font-bold text-navy-900 shadow-[0_6px_16px_-4px_rgba(5,12,26,0.5)] ring-4 ring-lime-300/60">
            {i + 1}
          </span>
          <span className="mt-1.5 flex items-center gap-1 whitespace-nowrap rounded-full bg-navy-900/70 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-md md:text-[13px]">
            {stop.name}
            <span className={`h-1.5 w-1.5 rounded-full ${stop.crowd === "여유" ? "bg-lime-300" : "bg-amber-300"}`} />
          </span>
        </motion.div>
      ))}

      <motion.div
        key={`receipt-${cycle}`}
        className="absolute bottom-3 right-3 rounded-2xl bg-white px-3.5 py-2.5 text-left text-navy-900 shadow-[0_18px_40px_-18px_rgba(5,12,26,0.6)] md:bottom-4 md:right-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: DRAW_S - 0.4, duration: 0.4 }}
      >
        <p className="text-[10px] font-semibold text-gray-400">예시 코스 · 1인</p>
        <p className="text-[18px] font-bold tabular-nums leading-tight">
          <CountUp to={48000} format={(v) => `${(v / 10000).toFixed(1)}만원`} />
        </p>
        <p className="text-[11px] tabular-nums text-gray-500">
          <CountUp to={6.2} format={(v) => `${v.toFixed(1)}km`} /> · 붐비는 곳 2곳 피함
        </p>
      </motion.div>
    </div>
  );
}

/** 시안 B — 코스가 부산 지도 위에 그려지고 비용·거리가 올라간다 */
export default function RouteDrawHero() {
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setCycle((c) => c + 1), LOOP_MS);
    return () => clearInterval(timer);
  }, []);

  return (
    <ConceptShell
      headline={
        <>
          붐비는 곳은 피하고, <span className="text-lime-300">동선은 짧게</span>
        </>
      }
    >
      <div className="px-5">
        <RouteBoard cycle={cycle} />
      </div>
    </ConceptShell>
  );
}
