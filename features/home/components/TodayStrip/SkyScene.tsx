"use client";

import { motion } from "motion/react";

import type { SkyPhase } from "@/features/home/utils/todaySky";
import type { PtyCode } from "@/types/weather";

// 시간대별 하늘색. 비·눈 오는 날은 채도를 뺀 흐린 하늘을 쓴다
const CLEAR_SKY: Record<SkyPhase, string> = {
  dawn: "from-[#27325e] via-[#8d5d86] to-[#f0a98a]",
  day: "from-[#1557c0] via-[#2f7fe0] to-[#6db4f5]",
  dusk: "from-[#1c2658] via-[#9b4a78] to-[#f28c5b]",
  night: "from-[#050c1a] via-[#0d1b3e] to-[#1d3470]",
};
const OVERCAST_SKY: Record<SkyPhase, string> = {
  dawn: "from-[#2d3550] via-[#5d6680] to-[#9a9fb3]",
  day: "from-[#46546e] via-[#6a7890] to-[#9aa7ba]",
  dusk: "from-[#262c45] via-[#56506c] to-[#8e7f8c]",
  night: "from-[#070b16] via-[#141d33] to-[#27314b]",
};

const CLOUD_PATH = "M14 30a10 10 0 0 1-1-19.9A14 14 0 0 1 39 7a11 11 0 0 1 12 9.2A7 7 0 0 1 52 30z";

// 렌더마다 같은 자리에 오도록 무작위 대신 고정 수열로 흩뿌린다
function scatter(count: number, seed: number) {
  return Array.from({ length: count }, (_, i) => ({
    left: (i * 37 + seed) % 100,
    top: (i * 53 + seed * 3) % 100,
    delay: ((i * 29 + seed) % 100) / 100,
  }));
}
const STARS = scatter(18, 7);
const DROPS = scatter(24, 13);
const FLAKES = scatter(18, 5);
const GUSTS = [
  { top: "30%", delay: 0 },
  { top: "52%", delay: 1.1 },
  { top: "70%", delay: 2.3 },
];
const RAYS = Array.from({ length: 12 }, (_, i) => {
  const angle = (i * Math.PI) / 6;
  const at = (r: number) => [+(50 + Math.cos(angle) * r).toFixed(2), +(50 + Math.sin(angle) * r).toFixed(2)];
  return { from: at(36), to: at(46) };
});

function Sun({ phase, animated }: { phase: SkyPhase; animated: boolean }) {
  // 아침·저녁 해는 낮고 붉게
  const low = phase !== "day";
  return (
    <div className={`absolute h-14 w-14 md:h-16 md:w-16 ${low ? "right-[16%] top-[40%]" : "right-[14%] top-[16%]"}`}>
      <motion.div
        className={`absolute -inset-8 rounded-full blur-2xl ${low ? "bg-[#ffae6b]/55" : "bg-[#fff2a8]/50"}`}
        animate={animated ? { scale: [1, 1.2, 1], opacity: [0.75, 1, 0.75] } : undefined}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="absolute left-1/2 top-1/2 h-[170%] w-[170%] -translate-x-1/2 -translate-y-1/2">
        <motion.svg
          viewBox="0 0 100 100"
          className="h-full w-full text-white/70"
          animate={animated ? { rotate: 360 } : undefined}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        >
          {RAYS.map(({ from, to }, i) => (
            <line key={i} x1={from[0]} y1={from[1]} x2={to[0]} y2={to[1]} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          ))}
        </motion.svg>
      </div>
      <div
        className={`relative h-full w-full rounded-full bg-gradient-to-br ${
          low ? "from-[#ffe2b8] to-[#ff9a5c]" : "from-[#fffbe6] to-[#ffd35c]"
        }`}
      />
    </div>
  );
}

function NightSky({ animated }: { animated: boolean }) {
  return (
    <>
      {STARS.map((star, i) => (
        <motion.span
          key={i}
          className="absolute h-[3px] w-[3px] rounded-full bg-white"
          style={{ left: `${star.left}%`, top: `${star.top * 0.65}%` }}
          initial={{ opacity: 0.5 }}
          animate={animated ? { opacity: [0.15, 1, 0.15] } : undefined}
          transition={{ duration: 2 + (i % 4) * 0.7, delay: star.delay * 3, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
      <motion.div
        className="absolute right-[15%] top-[16%] h-14 w-14 md:h-16 md:w-16"
        animate={animated ? { y: [0, -5, 0] } : undefined}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="absolute -inset-6 rounded-full bg-[#f6efcf]/15 blur-xl" />
        <div className="relative h-full w-full rounded-full shadow-[inset_-14px_-4px_0_0_#f6efcf]" />
      </motion.div>
    </>
  );
}

function Cloud({ className, drift, duration, animated }: { className: string; drift: number; duration: number; animated: boolean }) {
  return (
    <motion.svg
      viewBox="0 0 64 32"
      fill="currentColor"
      className={`absolute ${className}`}
      animate={animated ? { x: [0, drift, 0] } : undefined}
      transition={{ duration, repeat: Infinity, ease: "easeInOut" }}
    >
      <path d={CLOUD_PATH} />
    </motion.svg>
  );
}

interface SkySceneProps {
  phase: SkyPhase;
  pty: PtyCode;
  /** 바람이 세면 하늘을 가로지르는 바람 줄기를 그린다 */
  windy?: boolean;
  /** 화면 밖이거나 움직임 줄이기 설정이면 false — 같은 장면을 멈춘 채로 보여준다 */
  animated?: boolean;
}

/** 오늘의 부산 왼쪽 하늘 — 시간대 배경 위에 해·달·별, 구름, 비·눈, 바람 줄기를 겹친다 */
export default function SkyScene({ phase, pty, windy = false, animated = true }: SkySceneProps) {
  const wet = pty !== 0;
  const rain = pty === 1 || pty === 2;
  const snow = pty === 2 || pty === 3;
  const night = phase === "night";

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden bg-gradient-to-b ${wet ? OVERCAST_SKY[phase] : CLEAR_SKY[phase]}`}
    >
      {!wet && (night ? <NightSky animated={animated} /> : <Sun phase={phase} animated={animated} />)}

      {wet ? (
        <>
          <Cloud className="-left-6 top-[2%] w-44 text-white/25 md:w-56" drift={14} duration={14} animated={animated} />
          <Cloud className="-right-10 -top-4 w-52 text-white/30 md:w-64" drift={-12} duration={17} animated={animated} />
          <Cloud className="left-[36%] top-[14%] w-36 text-white/20" drift={10} duration={12} animated={animated} />
        </>
      ) : (
        <>
          <Cloud className={`left-[46%] top-[30%] w-20 ${night ? "text-white/10" : "text-white/55"}`} drift={16} duration={16} animated={animated} />
          <Cloud className={`right-[34%] top-[8%] w-12 ${night ? "text-white/[0.06]" : "text-white/40"}`} drift={-10} duration={13} animated={animated} />
        </>
      )}

      {rain &&
        DROPS.map((drop, i) => (
          <motion.span
            key={`drop-${i}`}
            className="absolute h-5 w-px rotate-[14deg] rounded-full bg-gradient-to-b from-white/0 to-white/75"
            style={{ left: `${drop.left * 1.1}%`, top: animated ? "-12%" : `${drop.top}%` }}
            animate={animated ? { x: [0, -80], y: [0, 330] } : undefined}
            transition={{ duration: 0.85 + (i % 3) * 0.15, delay: drop.delay * 1.2, repeat: Infinity, ease: "linear" }}
          />
        ))}

      {snow &&
        FLAKES.filter((_, i) => pty === 3 || i % 2 === 0).map((flake, i) => (
          <motion.span
            key={`flake-${i}`}
            className={`absolute rounded-full bg-white/90 ${i % 3 === 0 ? "h-2 w-2" : "h-1.5 w-1.5"}`}
            style={{ left: `${flake.left}%`, top: animated ? "-8%" : `${flake.top}%` }}
            animate={animated ? { y: [0, 320], x: [0, 12, -8, 6] } : undefined}
            transition={{ duration: 5.5 + (i % 4), delay: flake.delay * 3, repeat: Infinity, ease: "linear" }}
          />
        ))}

      {windy &&
        GUSTS.map((gust, i) => (
          <motion.span
            key={`gust-${i}`}
            className="absolute left-0 h-px w-28 bg-gradient-to-r from-transparent via-white/70 to-transparent"
            style={{ top: gust.top }}
            initial={{ x: animated ? -140 : 40 + i * 60, opacity: animated ? 0 : 0.6 }}
            animate={animated ? { x: [-140, 720], opacity: [0, 1, 0] } : undefined}
            transition={{ duration: 2.8, delay: gust.delay, repeat: Infinity, repeatDelay: 1.2, ease: "easeInOut" }}
          />
        ))}

      {/* 글자가 어느 하늘색 위에서도 읽히도록 아래쪽을 살짝 어둡게 */}
      <div className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-black/35 via-black/10 to-transparent" />
    </div>
  );
}
