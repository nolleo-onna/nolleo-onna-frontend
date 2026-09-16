"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Coffee, FlaskConical, Footprints, Landmark, MoonStar, Palette, Trees, UtensilsCrossed, Waves } from "lucide-react";

import AssistantAvatar from "@/components/ui/Chat/AssistantAvatar";
import { ASSISTANT_NAME } from "@/constants/assistant";
import ConceptShell from "./ConceptShell";

import type { LucideIcon } from "lucide-react";

interface Stop {
  name: string;
  icon: LucideIcon;
  crowd: "여유" | "보통";
}
interface Scenario {
  ask: string;
  stops: Stop[];
  total: string;
  distance: string;
  note: string;
}

// 예시 대화 — 실제 결과가 아니라 "말하면 이런 코스가 나온다"를 보여주는 시연용
const SCENARIOS: Scenario[] = [
  {
    ask: "연인이랑 광안리 야경, 5만원 안쪽으로",
    total: "1인 4.8만원",
    distance: "3.2km",
    note: "붐비는 시간은 피해서 해 질 무렵 야경으로 끝나게 짰어요",
    stops: [
      { name: "광안리 해변", icon: Waves, crowd: "여유" },
      { name: "바다뷰 카페", icon: Coffee, crowd: "보통" },
      { name: "민락 횟집", icon: UtensilsCrossed, crowd: "보통" },
      { name: "광안대교 야경", icon: MoonStar, crowd: "여유" },
    ],
  },
  {
    ask: "친구랑 서면 반나절, 3만원이면 돼",
    total: "1인 2.9만원",
    distance: "2.1km",
    note: "점심 피크를 피해 카페부터 시작해요",
    stops: [
      { name: "전포카페거리", icon: Coffee, crowd: "여유" },
      { name: "전포공구길", icon: Footprints, crowd: "여유" },
      { name: "서면 먹자골목", icon: UtensilsCrossed, crowd: "보통" },
      { name: "부산시민공원", icon: Trees, crowd: "여유" },
    ],
  },
  {
    ask: "비 오는 날 아이랑 실내에서 놀 곳",
    total: "1인 3.6만원",
    distance: "5.4km",
    note: "전부 실내라 비 맞을 일이 거의 없어요",
    stops: [
      { name: "국립부산과학관", icon: FlaskConical, crowd: "보통" },
      { name: "뮤지엄 원", icon: Palette, crowd: "여유" },
      { name: "부산현대미술관", icon: Landmark, crowd: "여유" },
    ],
  },
];

// 내 말 → 온나가 쓰는 중 → 코스 카드 → 다음 대화
const STEP_MS = [900, 1300, 4800];
const BUBBLE = { type: "spring", stiffness: 520, damping: 34, mass: 0.7 } as const;

function ChatDemo() {
  const [index, setIndex] = useState(0);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (step < 2) setStep(step + 1);
      else {
        setStep(0);
        setIndex((i) => (i + 1) % SCENARIOS.length);
      }
    }, STEP_MS[step]);
    return () => clearTimeout(timer);
  }, [step, index]);

  const scenario = SCENARIOS[index];

  return (
    <div className="mx-auto w-full max-w-[460px] px-5">
      <div className="rounded-[28px] bg-white/10 p-4 text-left ring-1 ring-inset ring-white/20 backdrop-blur-xl md:p-5">
        <div className="flex items-center gap-2 border-b border-white/10 pb-3">
          <AssistantAvatar size={26} />
          <span className="text-[13px] font-semibold text-white">{ASSISTANT_NAME}</span>
          <span className="ml-auto text-[11px] text-white/60">예시 대화</span>
        </div>

        <div className="flex min-h-[262px] flex-col gap-2.5 pt-3">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={`ask-${index}`}
              className="max-w-[85%] self-end rounded-[20px] rounded-br-[6px] bg-white px-3.5 py-2 text-[14px] font-medium text-navy-900"
              style={{ transformOrigin: "bottom right" }}
              initial={{ opacity: 0, y: 10, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10 }}
              transition={BUBBLE}
            >
              {scenario.ask}
            </motion.div>
          </AnimatePresence>

          {step === 1 && (
            <motion.div
              className="flex w-fit items-center gap-1 rounded-[20px] rounded-bl-[6px] bg-white/85 px-3.5 py-2.5"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={BUBBLE}
            >
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="h-1.5 w-1.5 rounded-full bg-gray-400"
                  animate={{ opacity: [0.35, 1, 0.35] }}
                  transition={{ duration: 1, repeat: Infinity, delay: i * 0.16 }}
                />
              ))}
            </motion.div>
          )}

          <AnimatePresence>
            {step === 2 && (
              <motion.div
                key={`card-${index}`}
                className="rounded-[20px] rounded-bl-[6px] bg-white p-3.5 text-navy-900 shadow-[0_18px_40px_-18px_rgba(5,12,26,0.5)]"
                style={{ transformOrigin: "bottom left" }}
                initial={{ opacity: 0, y: 12, scale: 0.94 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={BUBBLE}
              >
                <div className="flex items-baseline justify-between gap-2">
                  <p className="text-[13px] font-bold">코스 완성</p>
                  <p className="text-[12px] tabular-nums text-gray-500">
                    {scenario.total} · {scenario.distance}
                  </p>
                </div>
                <ol className="mt-3 grid gap-1.5" style={{ gridTemplateColumns: `repeat(${scenario.stops.length}, minmax(0, 1fr))` }}>
                  {scenario.stops.map((stop, i) => {
                    const Icon = stop.icon;
                    return (
                      <motion.li
                        key={stop.name}
                        className="flex flex-col items-center gap-1 text-center"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 + i * 0.12, duration: 0.3 }}
                      >
                        <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-ocean-50 text-ocean-600">
                          <Icon className="h-4 w-4" />
                          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-navy-900 text-[9px] font-bold text-lime-300">
                            {i + 1}
                          </span>
                        </span>
                        <span className="line-clamp-2 text-[11px] font-semibold leading-tight break-keep">{stop.name}</span>
                        <span
                          className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold ${
                            stop.crowd === "여유" ? "bg-lime-100 text-lime-700" : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {stop.crowd}
                        </span>
                      </motion.li>
                    );
                  })}
                </ol>
                <p className="mt-3 border-t border-dashed border-gray-200 pt-2 text-[11px] text-gray-500 break-keep">{scenario.note}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="mt-3 flex justify-center gap-1.5" aria-hidden>
        {SCENARIOS.map((_, i) => (
          <span key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === index ? "w-5 bg-lime-300" : "w-1.5 bg-white/40"}`} />
        ))}
      </div>
    </div>
  );
}

/** 시안 A — 긴 설명 대신 "말하면 코스가 나오는" 장면을 직접 보여준다 */
export default function ChatDemoHero() {
  return (
    <ConceptShell
      headline={
        <>
          말만 하면, <span className="text-lime-300">코스가 나와요</span>
        </>
      }
    >
      <ChatDemo />
    </ConceptShell>
  );
}
