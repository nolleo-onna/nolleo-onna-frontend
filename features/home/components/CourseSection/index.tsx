"use client";

import { useId, useState } from "react";
import Image from "next/image";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { ChevronDown, Shuffle, Sparkles } from "lucide-react";

import SectionHeader from "@/features/home/components/SectionHeader";
import {
  BUDGET_OPTIONS,
  MOOD_OPTIONS,
  WHO_OPTIONS,
  buildPlayPrompt,
} from "@/features/home/data/playSentence";
import { useAIChatContext } from "@/providers/AIChatProvider";
import { ASSISTANT_NAME } from "@/constants/assistant";

import type { MoodOption, SentenceOption } from "@/features/home/data/playSentence";

type SlotKey = "who" | "mood" | "budget";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

const SLOT_QUESTIONS: Record<SlotKey, string> = {
  who: "누구랑 놀아요?",
  mood: "어떤 하루를 보내고 싶어요?",
  budget: "예산은 얼마나 생각해요?",
};

const SLOT_OPTIONS: Record<SlotKey, SentenceOption[]> = {
  who: WHO_OPTIONS,
  mood: MOOD_OPTIONS,
  budget: BUDGET_OPTIONS,
};

/** 지금 고른 것과 다른 선택지 하나를 무작위로 — "섞어보기"가 같은 문장을 다시 내놓지 않게 */
function pickOther<T extends SentenceOption>(options: T[], currentId: string): T {
  const rest = options.filter((option) => option.id !== currentId);
  return rest[Math.floor(Math.random() * rest.length)] ?? options[0];
}

interface SlotWordProps {
  value: string;
  active: boolean;
  controlsId: string;
  label: string;
  onClick: () => void;
  /** 줄 첫머리에 올 때 안쪽 여백만큼 왼쪽으로 당겨 윗줄 글자와 맞춘다 */
  className?: string;
}

/** 문장 속 밑줄 자리 — 누르면 아래에 고를 수 있는 말이 펼쳐지고, 바뀐 말은 위로 굴러 들어온다 */
function SlotWord({ value, active, controlsId, label, onClick, className = "" }: SlotWordProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={active}
      aria-controls={controlsId}
      aria-label={`${label}: ${value}`}
      className={`relative inline-flex items-center gap-1 rounded-xl px-1.5 align-baseline text-ocean-600 transition-colors ${
        active ? "bg-ocean-50" : "hover:bg-ocean-50/70"
      } ${className}`}
    >
      <span className="relative inline-flex overflow-hidden">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={value}
            // 한 줄 높이만큼 통째로 밀어내야 바뀌는 동안 윗줄·아랫줄에 글자 반쪽이 비치지 않는다
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "-100%", opacity: 0 }}
            transition={{ duration: 0.32, ease: EASE_OUT }}
          >
            {value}
          </motion.span>
        </AnimatePresence>
      </span>
      <ChevronDown
        aria-hidden
        className={`h-[0.45em] w-[0.45em] shrink-0 text-ocean-400 transition-transform duration-300 ${active ? "rotate-180" : ""}`}
      />
      <span aria-hidden className="absolute inset-x-1.5 bottom-[0.06em] border-b-2 border-dashed border-ocean-300" />
    </button>
  );
}

/**
 * 오늘 어떻게 놀까? — 사진 타일을 고르는 대신, "오늘은 [연인이랑] [야경 보는] 하루, 예산은 [5만원 안쪽]"
 * 문장의 밑줄 친 말을 바꿔 AI에게 보낼 문장을 직접 완성한다. 고른 하루에 맞춰 옆 사진과 말풍선이 바뀌고,
 * 버튼을 누르면 그 문장이 채워진 AI 채팅이 열린다.
 */
export default function CourseSection() {
  const { openChat } = useAIChatContext();
  const optionsId = useId();
  const [who, setWho] = useState<SentenceOption>(WHO_OPTIONS[1]);
  const [mood, setMood] = useState<MoodOption>(MOOD_OPTIONS[3]);
  const [budget, setBudget] = useState<SentenceOption>(BUDGET_OPTIONS[2]);
  const [activeSlot, setActiveSlot] = useState<SlotKey | null>(null);

  const selected: Record<SlotKey, SentenceOption> = { who, mood, budget };
  const prompt = buildPlayPrompt(who, mood, budget);

  const toggleSlot = (slot: SlotKey) => setActiveSlot((current) => (current === slot ? null : slot));

  const choose = (slot: SlotKey, option: SentenceOption) => {
    if (slot === "who") setWho(option);
    if (slot === "mood") setMood(MOOD_OPTIONS.find((m) => m.id === option.id) ?? mood);
    if (slot === "budget") setBudget(option);
    setActiveSlot(null);
  };

  const shuffle = () => {
    setWho(pickOther(WHO_OPTIONS, who.id));
    setMood(pickOther(MOOD_OPTIONS, mood.id));
    setBudget(pickOther(BUDGET_OPTIONS, budget.id));
    setActiveSlot(null);
  };

  const handleScrollToSearch = () => {
    document.getElementById("search-bar")?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const slot = (key: SlotKey, label: string, className?: string) => (
    <SlotWord
      value={selected[key].label}
      active={activeSlot === key}
      controlsId={optionsId}
      label={label}
      className={className}
      onClick={() => toggleSlot(key)}
    />
  );

  return (
    <MotionConfig reducedMotion="user">
      <section className="py-8 md:py-12">
        <SectionHeader
          title="오늘 어떻게 놀까?"
          description={`문장을 완성하면 ${ASSISTANT_NAME}가 그대로 코스를 짜드려요`}
          action={{ label: "직접 조건 고르기", onClick: handleScrollToSearch }}
        />

        <div className="grid overflow-hidden rounded-[32px] bg-white ring-1 ring-gray-100 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
          <div className="flex flex-col p-6 md:p-10 lg:p-12">
            <p className="text-[27px] font-bold leading-[1.6] tracking-tight text-navy-900 break-keep md:text-[44px] md:leading-[1.5]">
              오늘은 {slot("who", "누구랑")}
              <br />
              {slot("mood", "어떤 하루", "-ml-1.5")} 하루,
              <br />
              예산은 {slot("budget", "예산")}
            </p>

            <div id={optionsId} className="mt-6 min-h-[96px]">
              <AnimatePresence mode="wait" initial={false}>
                {activeSlot ? (
                  <motion.div
                    key={activeSlot}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.22, ease: EASE_OUT }}
                  >
                    <p className="text-xs font-semibold text-gray-400">{SLOT_QUESTIONS[activeSlot]}</p>
                    <div role="group" aria-label={SLOT_QUESTIONS[activeSlot]} className="mt-2.5 flex flex-wrap gap-2">
                      {SLOT_OPTIONS[activeSlot].map((option) => {
                        const isSelected = selected[activeSlot].id === option.id;
                        return (
                          <button
                            key={option.id}
                            type="button"
                            aria-pressed={isSelected}
                            onClick={() => choose(activeSlot, option)}
                            className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                              isSelected
                                ? "bg-navy-900 text-lime-300"
                                : "bg-gray-50 text-gray-600 ring-1 ring-inset ring-gray-200 hover:bg-white hover:text-navy-900"
                            }`}
                          >
                            {option.label}
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                ) : (
                  <motion.p
                    key="hint"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-sm leading-relaxed text-gray-400 break-keep"
                  >
                    밑줄 친 말을 눌러 바꿔보세요. 딱히 떠오르지 않으면 섞어봐도 좋아요.
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <div className="mt-auto flex flex-wrap items-center gap-2.5 pt-4">
              <button
                type="button"
                onClick={() => openChat(prompt)}
                className="inline-flex items-center gap-1.5 rounded-full bg-navy-900 px-6 py-3.5 text-sm font-bold text-lime-300 transition-transform hover:-translate-y-0.5 active:scale-95"
              >
                <Sparkles className="h-4 w-4" />
                이 문장으로 코스 짜기
              </button>
              <motion.button
                type="button"
                onClick={shuffle}
                whileTap={{ scale: 0.94 }}
                className="group inline-flex items-center gap-1.5 rounded-full bg-white px-5 py-3.5 text-sm font-semibold text-gray-600 ring-1 ring-inset ring-gray-200 transition-colors hover:text-navy-900 hover:ring-gray-300"
              >
                <Shuffle className="h-4 w-4 transition-transform duration-300 group-hover:rotate-180" />
                섞어보기
              </motion.button>
            </div>
          </div>

          <div className="relative min-h-[260px] overflow-hidden bg-navy-800 md:min-h-[340px]">
            <AnimatePresence initial={false}>
              <motion.div
                key={mood.id}
                className="absolute inset-0"
                initial={{ opacity: 0, scale: 1.08 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: EASE_OUT }}
              >
                <Image
                  src={mood.imageUrl}
                  alt={`${mood.label} 하루를 떠올리게 하는 부산 풍경`}
                  fill
                  quality={90}
                  sizes="(max-width: 1024px) 100vw, 45vw"
                  className="object-cover"
                />
              </motion.div>
            </AnimatePresence>
            <div className="absolute inset-0 bg-gradient-to-t from-navy-900/85 via-navy-900/10 to-transparent" />

            <div className="absolute inset-x-4 bottom-4 md:inset-x-6 md:bottom-6">
              <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold text-white/75">
                <Sparkles className="h-3 w-3 text-lime-300" />
                {ASSISTANT_NAME}에게 보낼 문장
              </p>
              <AnimatePresence mode="wait" initial={false}>
                <motion.p
                  key={prompt}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.28, ease: EASE_OUT }}
                  className="max-w-md rounded-2xl rounded-bl-md bg-white/95 px-4 py-3 text-sm font-medium leading-relaxed text-navy-900 shadow-lg break-keep"
                >
                  {prompt}
                </motion.p>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>
    </MotionConfig>
  );
}
