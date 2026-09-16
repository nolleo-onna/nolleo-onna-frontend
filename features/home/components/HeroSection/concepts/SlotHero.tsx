"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { ArrowRight, Dices } from "lucide-react";

import ConceptShell from "./ConceptShell";

// 어디서 · 뭐하고 · 뭐먹지 — 세 릴을 돌려 오늘 조합을 뽑는다
const REELS = [
  { label: "어디서", items: ["광안리", "전포동", "영도", "송도", "기장", "서면", "다대포"] },
  { label: "뭐하고", items: ["바다 산책", "카페 투어", "야경 보기", "케이블카", "시장 구경", "노을 보기", "골목 탐방"] },
  { label: "뭐먹지", items: ["돼지국밥", "밀면", "조개구이", "씨앗호떡", "어묵", "장어구이", "빵지순례"] },
];
const ROW = 64;
const LOOPS = 3;
const pick = () => REELS.map((r) => Math.floor(Math.random() * r.items.length));

function Reel({ items, from, to, spin, index }: { items: string[]; from: number; to: number; spin: number; index: number }) {
  const strip = Array.from({ length: LOOPS + 1 }, () => items).flat();
  return (
    <div className="relative h-[64px] overflow-hidden rounded-2xl bg-white shadow-[inset_0_10px_14px_-10px_rgba(5,12,26,0.35),inset_0_-10px_14px_-10px_rgba(5,12,26,0.35)]">
      <motion.ul
        key={spin}
        initial={{ y: -from * ROW }}
        animate={{ y: -(items.length * LOOPS + to) * ROW }}
        transition={{ duration: 1.1 + index * 0.45, ease: [0.12, 0.8, 0.2, 1.04] }}
      >
        {strip.map((item, i) => (
          <li key={i} className="flex h-[64px] items-center justify-center text-[18px] font-bold text-navy-900 md:text-[22px]">
            {item}
          </li>
        ))}
      </motion.ul>
    </div>
  );
}

/** 시안 D — "오늘 뭐하지?"를 슬롯머신으로. 누르면 돌아가고, 멈춘 조합으로 바로 코스를 만든다 */
export default function SlotHero() {
  const [spin, setSpin] = useState(0);
  const [from, setFrom] = useState([0, 0, 0]);
  const [to, setTo] = useState([0, 3, 1]);
  const [landed, setLanded] = useState(true);

  const roll = () => {
    setFrom(to);
    setTo(pick());
    setSpin((s) => s + 1);
    setLanded(false);
  };

  useEffect(() => {
    if (landed) return;
    const timer = setTimeout(() => setLanded(true), 1100 + (REELS.length - 1) * 450 + 150);
    return () => clearTimeout(timer);
  }, [landed, spin]);

  return (
    <ConceptShell
      headline={
        <>
          오늘 부산, <span className="text-lime-300">뭐하지?</span>
        </>
      }
    >
      <div className="mx-auto w-full max-w-[600px] px-5">
        <div className="rounded-[30px] bg-navy-900/45 p-3 ring-1 ring-inset ring-white/25 backdrop-blur-xl md:p-4">
          <div className="grid grid-cols-3 gap-2 md:gap-3">
            {REELS.map((reel, i) => (
              <div key={reel.label}>
                <p className="mb-1.5 text-[11px] font-semibold text-white/70">{reel.label}</p>
                <Reel items={reel.items} from={from[i]} to={to[i]} spin={spin} index={i} />
              </div>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
            <motion.button
              type="button"
              onClick={roll}
              whileTap={{ scale: 0.94 }}
              className="inline-flex items-center gap-1.5 rounded-full bg-lime-300 px-4 py-2 text-[14px] font-bold text-navy-900 shadow-[0_8px_20px_-8px_rgba(200,241,53,0.8)]"
            >
              <motion.span animate={landed ? { rotate: 0 } : { rotate: 360 }} transition={landed ? { duration: 0 } : { duration: 0.6, repeat: Infinity, ease: "linear" }}>
                <Dices className="h-4 w-4" />
              </motion.span>
              다시 돌리기
            </motion.button>
            <motion.button
              type="button"
              animate={{ opacity: landed ? 1 : 0.4 }}
              className="inline-flex items-center gap-1 rounded-full bg-white/15 px-4 py-2 text-[14px] font-semibold text-white ring-1 ring-inset ring-white/30"
            >
              이 조합으로 코스 만들기 <ArrowRight className="h-4 w-4" />
            </motion.button>
          </div>
        </div>
      </div>
    </ConceptShell>
  );
}
