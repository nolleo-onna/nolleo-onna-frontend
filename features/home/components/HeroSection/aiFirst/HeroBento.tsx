"use client";

import { useState } from "react";
import { motion, type Variants } from "motion/react";
import { ArrowRight, SlidersHorizontal } from "lucide-react";

import AssistantAvatar from "@/components/ui/Chat/AssistantAvatar";
import { ASSISTANT_NAME, ASSISTANT_TAGLINE } from "@/constants/assistant";
import { CHAT_DAILY_LIMIT, CHAT_TURNS_PER_CONVERSATION } from "@/constants/course";
import AIFirstShell from "./AIFirstShell";
import ChatComposer from "./ChatComposer";
import CourseFormReveal from "./CourseFormReveal";
import PromptChips from "./PromptChips";

const stagger: Variants = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };
const rise: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const CONDITIONS = ["지역", "예산", "행사", "꼭 갈 곳"];

/**
 * 시안 E · 벤토 카드
 * 두 기능을 카드 두 장으로 나란히 두고, 크기로 위계를 말한다 — 온나 카드가 2/3, 조건 카드가 1/3.
 * 둘 다 한눈에 보이면서도 무엇이 메인인지 헷갈리지 않는 안.
 */
export default function HeroBento() {
  const [isFormOpen, setIsFormOpen] = useState(false);

  return (
    <AIFirstShell>
      <motion.div className="mx-auto w-full max-w-6xl px-5 md:px-8" variants={stagger} initial="hidden" animate="visible">
        <motion.h1
          variants={rise}
          className="text-center text-3xl font-bold leading-tight tracking-tight text-white break-keep md:text-5xl"
        >
          오늘 부산, <span className="text-lime-300">어떻게 놀지</span> 정해볼까요?
        </motion.h1>

        <div className="mt-10 grid gap-4 lg:grid-cols-[minmax(0,1.75fr)_minmax(0,1fr)]">
          {/* ── 1순위: 온나 카드 ── */}
          <motion.div
            variants={rise}
            className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#0d3080] via-[#1450c8] to-[#0a84ff] p-6 text-left shadow-[0_30px_80px_-30px_rgba(10,132,255,0.8)] ring-1 ring-inset ring-white/15 md:p-8"
          >
            <span aria-hidden className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-lime-300/25 blur-3xl" />
            <span aria-hidden className="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-violet-400/25 blur-3xl" />

            <div className="relative flex items-center gap-3">
              <AssistantAvatar size={44} className="ring-2 ring-white/30" />
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-bold leading-none text-white">{ASSISTANT_NAME}</p>
                <p className="mt-1.5 text-[12px] leading-none text-white/60">{ASSISTANT_TAGLINE}</p>
              </div>
              <span className="flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-white/85 ring-1 ring-inset ring-white/15">
                <span className="h-1.5 w-1.5 rounded-full bg-lime-300" />
                대화 가능
              </span>
            </div>

            <p className="relative mt-7 text-[28px] font-bold leading-[1.2] tracking-tight text-white break-keep md:text-[40px]">
              말로 물어보면
              <br />
              코스를 짜드려요
            </p>

            {/* 대화가 어떤 느낌인지 한 줄씩 */}
            <div className="relative mt-6 space-y-2">
              <p className="ml-auto w-fit max-w-[85%] rounded-[18px] rounded-br-[6px] bg-white px-3.5 py-2 text-[14px] text-gray-900">
                친구랑 서면에서 3만원으로 놀고 싶어
              </p>
              <p className="w-fit max-w-[85%] rounded-[18px] rounded-bl-[6px] bg-white/15 px-3.5 py-2 text-[14px] text-white ring-1 ring-inset ring-white/15 backdrop-blur-sm">
                몇 시쯤 출발해요? 점심도 코스에 넣을까요?
              </p>
            </div>

            <div className="relative mt-6">
              <ChatComposer size="lg" />
            </div>
            <div className="relative mt-3 [&>div]:justify-start">
              <PromptChips tone="dark" layout="row" count={3} />
            </div>
            <p className="relative mt-4 text-[12px] text-white/50">
              하루 {CHAT_DAILY_LIMIT}번 · 한 대화에 질문 {CHAT_TURNS_PER_CONVERSATION}번까지
            </p>
          </motion.div>

          {/* ── 2순위: 조건 카드 ── */}
          <motion.div
            variants={rise}
            className="flex flex-col rounded-[32px] bg-white/95 p-6 text-left shadow-[0_20px_50px_-30px_rgba(5,12,26,0.6)] backdrop-blur md:p-7"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gray-100 text-gray-600">
              <SlidersHorizontal className="h-5 w-5" />
            </span>
            <p className="mt-5 text-[22px] font-bold leading-tight text-gray-900">조건 골라 만들기</p>
            <p className="mt-2 text-sm leading-relaxed text-gray-500 break-keep">
              지역이랑 예산만 고르면 바로 만들어요. 대화 없이, 횟수 제한도 없어요.
            </p>
            <div className="mt-5 flex flex-wrap gap-1.5">
              {CONDITIONS.map((c) => (
                <span key={c} className="rounded-full bg-gray-100 px-2.5 py-1 text-[12px] font-medium text-gray-600">
                  {c}
                </span>
              ))}
            </div>
            {/* 온나 카드와 높이를 맞추면 비는 공간 — 조건으로 만들면 어떻게 나오는지 한 줄 보여준다 */}
            <div className="mt-6 hidden rounded-2xl bg-gray-50 p-4 ring-1 ring-inset ring-gray-100 lg:block">
              <p className="text-[11px] font-semibold text-gray-400">예를 들면</p>
              <p className="mt-1.5 text-[14px] font-semibold text-gray-800">광안리 · 3만원 · 불꽃축제</p>
              <p className="mt-1 text-[13px] text-gray-500">→ 축제 위치 기준 반나절 코스, 약 1초</p>
            </div>
            {/* 남는 높이를 채워 버튼을 카드 바닥에 붙인다 */}
            <div aria-hidden className="min-h-6 flex-1" />
            <button
              type="button"
              onClick={() => setIsFormOpen((v) => !v)}
              aria-expanded={isFormOpen}
              className="mt-2 inline-flex items-center justify-between rounded-2xl bg-gray-900 px-5 py-4 text-[15px] font-semibold text-white transition-colors hover:bg-gray-800"
            >
              {isFormOpen ? "조건 접기" : "조건 고르기"}
              <ArrowRight className={`h-4 w-4 transition-transform ${isFormOpen ? "rotate-90" : ""}`} />
            </button>
          </motion.div>
        </div>
      </motion.div>

      <CourseFormReveal isOpen={isFormOpen} />
    </AIFirstShell>
  );
}
