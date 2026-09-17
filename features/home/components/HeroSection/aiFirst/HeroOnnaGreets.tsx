"use client";

import { useEffect, useState } from "react";
import { motion, type Variants } from "motion/react";
import { ChevronDown, Sparkles } from "lucide-react";

import AssistantAvatar from "@/components/ui/Chat/AssistantAvatar";
import { ASSISTANT_NAME, ASSISTANT_TAGLINE } from "@/constants/assistant";
import { CHAT_DAILY_LIMIT, CHAT_TURNS_PER_CONVERSATION } from "@/constants/course";
import { useAIChatContext } from "@/providers/AIChatProvider";
import AIFirstShell from "./AIFirstShell";
import CourseFormReveal from "./CourseFormReveal";

const stagger: Variants = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };
const rise: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

interface Greeting {
  text: string;
  /** 빠른 답장 — 누르면 이 문장으로 채팅이 열린다 */
  replies: { label: string; ask: string }[];
}

// 온나가 오늘 상황을 보고 먼저 건네는 말 — 시연용 예시. 실제로는 날씨·혼잡도·행사 API로 채운다
const GREETINGS: Greeting[] = [
  {
    text: "오늘 광안리는 사람이 적어요. 바다 보러 갈래요?",
    replies: [
      { label: "좋아, 짜줘", ask: "광안리 바다 보는 반나절 코스 짜줘" },
      { label: "다른 곳 추천해줘", ask: "오늘 사람 적은 부산 바다 추천해줘" },
    ],
  },
  {
    text: "저녁에 비 소식이 있어요. 실내 위주로 짜드릴까요?",
    replies: [
      { label: "응, 실내로", ask: "비 오는 날 실내 위주 부산 코스 짜줘" },
      { label: "비 와도 괜찮아", ask: "비 와도 즐길 만한 부산 코스 짜줘" },
    ],
  },
  {
    text: "이번 주말 불꽃축제가 있어요. 근처 코스 볼래요?",
    replies: [
      { label: "보여줘", ask: "부산불꽃축제 근처에서 놀 코스 짜줘" },
      { label: "사람 많은 건 싫어", ask: "주말에 붐비지 않는 부산 코스 짜줘" },
    ],
  },
];

const TYPE_MS = 45;
const HOLD_MS = 4200;

/**
 * 시안 D · 온나가 먼저 말을 거는 히어로
 * 입력창을 비워 두고 기다리는 대신, 온나가 오늘 상황을 보고 먼저 제안한다. 사용자는 답장 버튼만 누르면 된다.
 * 무엇을 물어볼지 떠올리는 부담을 없애는 안. 조건 폼은 아래 작은 링크로만.
 */
export default function HeroOnnaGreets() {
  const { openChat } = useAIChatContext();
  const [index, setIndex] = useState(0);
  const [typed, setTyped] = useState(0);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const greeting = GREETINGS[index];
  const isDone = typed >= greeting.text.length;

  // 한 글자씩 → 다 쓰면 잠깐 머물다 다음 제안
  useEffect(() => {
    const timer = setTimeout(
      () => {
        if (!isDone) {
          setTyped((n) => n + 1);
        } else {
          setTyped(0);
          setIndex((i) => (i + 1) % GREETINGS.length);
        }
      },
      isDone ? HOLD_MS : TYPE_MS,
    );
    return () => clearTimeout(timer);
  }, [typed, isDone]);

  return (
    <AIFirstShell>
      <motion.div
        className="mx-auto flex w-full max-w-3xl flex-col items-center px-5 text-center"
        variants={stagger}
        initial="hidden"
        animate="visible"
      >
        <motion.span
          variants={rise}
          className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/85 ring-1 ring-inset ring-white/20 backdrop-blur-sm"
        >
          {ASSISTANT_TAGLINE}
        </motion.span>
        <motion.h1
          variants={rise}
          className="mt-4 text-3xl font-bold leading-tight tracking-tight text-white break-keep md:text-5xl"
        >
          오늘 부산, <span className="text-lime-300">{ASSISTANT_NAME}</span>랑 정해요
        </motion.h1>

        {/* 빛나는 온나 */}
        <motion.div variants={rise} className="relative mt-10 flex h-40 w-40 items-center justify-center">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              aria-hidden
              className="absolute inset-0 rounded-full border border-lime-300/40"
              animate={{ scale: [0.7, 1.35], opacity: [0.7, 0] }}
              transition={{ duration: 3, repeat: Infinity, delay: i, ease: "easeOut" }}
            />
          ))}
          <motion.span
            aria-hidden
            className="absolute inset-4 rounded-full bg-gradient-to-br from-lime-300/40 via-ocean-400/50 to-violet-400/40 blur-2xl"
            animate={{ scale: [0.95, 1.1, 0.95] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
          <AssistantAvatar size={96} className="relative ring-4 ring-white/30" />
        </motion.div>

        {/* 온나의 제안 말풍선 */}
        <motion.div variants={rise} className="relative mt-6 w-full max-w-xl">
          <span aria-hidden className="absolute -top-2 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 bg-white" />
          <div className="relative rounded-[24px] bg-white px-6 py-5 shadow-[0_24px_60px_-24px_rgba(5,12,26,0.7)]">
            <p className="min-h-[3.25rem] text-[18px] font-semibold leading-snug text-gray-900 break-keep md:text-[20px]" aria-live="polite">
              {greeting.text.slice(0, typed)}
              {!isDone && <span className="ml-0.5 inline-block h-5 w-[2px] translate-y-1 animate-pulse bg-ocean-500" />}
            </p>
            <div className={`mt-4 flex flex-wrap justify-center gap-2 transition-opacity duration-300 ${isDone ? "opacity-100" : "opacity-0"}`}>
              {greeting.replies.map((reply) => (
                <button
                  key={reply.label}
                  type="button"
                  tabIndex={isDone ? 0 : -1}
                  onClick={() => openChat(reply.ask)}
                  className="rounded-full bg-ocean-50 px-4 py-2 text-sm font-semibold text-ocean-600 ring-1 ring-inset ring-ocean-200 transition-colors hover:bg-ocean-500 hover:text-white"
                >
                  {reply.label}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.button
          variants={rise}
          type="button"
          onClick={() => openChat()}
          className="mt-7 inline-flex items-center gap-2 rounded-full bg-lime-300 px-6 py-3.5 text-[16px] font-bold text-navy-900 shadow-[0_14px_36px_-12px_rgba(200,241,53,0.8)] transition-transform hover:-translate-y-0.5 active:scale-[0.98]"
        >
          <Sparkles className="h-5 w-5" />
          내 이야기로 {ASSISTANT_NAME}에게 물어보기
        </motion.button>

        <motion.p variants={rise} className="mt-3 text-[12px] text-white/45">
          하루 {CHAT_DAILY_LIMIT}번 · 한 대화에 질문 {CHAT_TURNS_PER_CONVERSATION}번까지
        </motion.p>

        {/* 2순위 — 작은 링크로만 */}
        <motion.button
          variants={rise}
          type="button"
          onClick={() => setIsFormOpen((v) => !v)}
          aria-expanded={isFormOpen}
          className="mt-10 inline-flex items-center gap-1 text-sm font-medium text-white/60 underline-offset-4 transition-colors hover:text-white hover:underline"
        >
          대화 대신 조건을 골라 만들래요
          <ChevronDown className={`h-4 w-4 transition-transform ${isFormOpen ? "rotate-180" : ""}`} />
        </motion.button>
      </motion.div>

      <CourseFormReveal isOpen={isFormOpen} />
    </AIFirstShell>
  );
}
