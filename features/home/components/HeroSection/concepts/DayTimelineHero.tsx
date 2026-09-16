"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Moon, Sun } from "lucide-react";

import SkyScene from "@/features/home/components/TodayStrip/SkyScene";
import ConceptShell from "./ConceptShell";

import type { SkyPhase } from "@/features/home/utils/todaySky";

const T = "https://tong.visitkorea.or.kr/cms/resource/";
// 하루를 시간대별로 — 하늘색이 따라 바뀐다. 코스는 시연용 예시
const MOMENTS: { time: string; phase: SkyPhase; place: string; line: string; photo: string }[] = [
  { time: "08:00", phase: "dawn", place: "이기대 해안산책로", line: "사람 없을 때 바다 보며 걷기", photo: `${T}02/3496802_image2_1.jpg` },
  { time: "12:00", phase: "day", place: "전포카페거리", line: "브런치 먹고 골목 카페 한 바퀴", photo: `${T}60/3496960_image2_1.jpg` },
  { time: "18:00", phase: "dusk", place: "송도 해상케이블카", line: "노을 시간 맞춰 바다 위로", photo: `${T}11/3413711_image2_1.jpg` },
  { time: "21:00", phase: "night", place: "황령산 전망대", line: "부산 야경으로 하루 마무리", photo: `${T}50/2732750_image2_1.jpg` },
];

function Sky({ phase }: { phase: SkyPhase }) {
  return (
    <div className="absolute inset-0 -z-10" aria-hidden>
      <AnimatePresence initial={false}>
        <motion.div key={phase} className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }}>
          <SkyScene phase={phase} pty={0} hideDecorOnMobile />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/** 시안 E — 스크러버가 아침부터 밤까지 흐르며, 시간대마다 하늘과 추천 장소가 바뀐다 */
export default function DayTimelineHero() {
  const [active, setActive] = useState(0);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (touched) return;
    const timer = setInterval(() => setActive((a) => (a + 1) % MOMENTS.length), 3000);
    return () => clearInterval(timer);
  }, [touched]);

  const moment = MOMENTS[active];
  const MarkerIcon = moment.phase === "night" ? Moon : Sun;
  const percent = (active / (MOMENTS.length - 1)) * 100;

  return (
    <ConceptShell
      background={<Sky phase={moment.phase} />}
      className="isolate"
      headline={
        <>
          부산에서의 하루, <span className="text-lime-300">시간표로 짜드려요</span>
        </>
      }
    >
      <div className="mx-auto w-full max-w-[560px] px-5">
        {/* 시간 스크러버 */}
        <div className="relative mx-4 h-12">
          <div className="absolute left-0 right-0 top-4 h-1 rounded-full bg-white/25" />
          <motion.div className="absolute left-0 top-4 h-1 rounded-full bg-lime-300" animate={{ width: `${percent}%` }} transition={{ type: "spring", stiffness: 90, damping: 20 }} />
          <motion.span
            className="absolute top-0 flex h-9 w-9 -translate-x-1/2 items-center justify-center rounded-full bg-white text-amber-500 shadow-[0_6px_18px_-4px_rgba(5,12,26,0.5)]"
            animate={{ left: `${percent}%` }}
            transition={{ type: "spring", stiffness: 90, damping: 20 }}
          >
            <MarkerIcon className={`h-5 w-5 ${moment.phase === "night" ? "text-navy-700" : ""}`} />
          </motion.span>
          {MOMENTS.map((m, i) => (
            <button
              key={m.time}
              type="button"
              onClick={() => {
                setTouched(true);
                setActive(i);
              }}
              className={`absolute top-10 -translate-x-1/2 text-[12px] font-bold tabular-nums transition-colors ${i === active ? "text-white" : "text-white/60 hover:text-white"}`}
              style={{ left: `${(i / (MOMENTS.length - 1)) * 100}%` }}
            >
              {m.time}
            </button>
          ))}
        </div>

        <div className="relative mt-8 h-[92px]">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={moment.time}
              className="absolute inset-0 flex items-center gap-3 rounded-[22px] bg-white/90 p-2.5 text-left shadow-[0_20px_44px_-22px_rgba(5,12,26,0.6)] backdrop-blur-xl"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="relative h-full w-[96px] shrink-0 overflow-hidden rounded-[16px]">
                <Image src={moment.photo} alt="" fill sizes="96px" className="object-cover" />
              </div>
              <div className="min-w-0">
                <p className="text-[12px] font-bold tabular-nums text-ocean-600">{moment.time}</p>
                <p className="truncate text-[16px] font-bold text-navy-900">{moment.place}</p>
                <p className="truncate text-[13px] text-gray-500">{moment.line}</p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </ConceptShell>
  );
}
