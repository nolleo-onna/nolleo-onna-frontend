"use client";

import { useState } from "react";
import { AnimatePresence, motion, type Variants } from "motion/react";
import { SlidersHorizontal } from "lucide-react";

import Container from "@/components/layout/Container";
import AssistantAvatar, { AssistantGlyph } from "@/components/ui/Chat/AssistantAvatar";
import { ASSISTANT_NAME } from "@/constants/assistant";
import { CHAT_DAILY_LIMIT, CHAT_TURNS_PER_CONVERSATION } from "@/constants/course";
import SearchBar from "@/features/home/components/SearchBar";
import AIFirstShell from "./AIFirstShell";
import ChatComposer from "./ChatComposer";
import PromptChips from "./PromptChips";

type Mode = "chat" | "form";

const stagger: Variants = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };
const rise: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

/**
 * 시안 C · 모드 전환 카드
 * 지금처럼 카드 하나에 담되, 기본 모드를 "온나랑 대화로 짜기"로 두고 그 탭을 크고 진하게.
 * 조건 폼은 옆 탭으로 — 지금 홈 구조를 가장 적게 바꾸면서 위계만 뒤집는 안.
 */
export default function HeroModeSwitch() {
  const [mode, setMode] = useState<Mode>("chat");

  return (
    <AIFirstShell>
      <motion.div
        className="flex w-full flex-col items-center text-center"
        variants={stagger}
        initial="hidden"
        animate="visible"
      >
        <motion.span
          variants={rise}
          className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/85 ring-1 ring-inset ring-white/20 backdrop-blur-sm"
        >
          부산 AI 여행 플래너
        </motion.span>
        <motion.h1
          variants={rise}
          className="mt-5 px-5 text-4xl font-bold leading-tight tracking-tight text-white break-keep md:text-5xl lg:text-6xl"
        >
          오늘 부산, <span className="text-lime-300">어떻게 놀까?</span>
        </motion.h1>
        <motion.p variants={rise} className="mt-4 px-5 text-sm text-white/70 break-keep md:text-base">
          {ASSISTANT_NAME}한테 말로 물어보거나, 조건을 골라 바로 만들어요
        </motion.p>

        <motion.div variants={rise} className="mt-9 w-full">
          <Container>
            <div className="mx-auto max-w-3xl rounded-[32px] bg-white p-2 text-left shadow-[0_24px_70px_-24px_rgba(5,12,26,0.7)]">
              {/* 모드 전환 — 대화 탭이 더 넓고, 선택되면 그라데이션으로 빛난다 */}
              <div role="tablist" className="flex gap-1 rounded-[26px] bg-gray-100 p-1.5">
                <button
                  type="button"
                  role="tab"
                  aria-selected={mode === "chat"}
                  onClick={() => setMode("chat")}
                  className={`relative flex flex-[1.4] items-center justify-center gap-2 rounded-[22px] py-3 text-[15px] font-bold transition-colors ${
                    mode === "chat" ? "text-white" : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {mode === "chat" && (
                    <motion.span
                      layoutId="hero-mode-pill"
                      className="absolute inset-0 rounded-[22px] bg-gradient-to-r from-[#0d3080] via-[#0a84ff] to-[#34a6ff] shadow-[0_10px_24px_-10px_rgba(10,132,255,0.9)]"
                      transition={{ type: "spring", stiffness: 400, damping: 34 }}
                    />
                  )}
                  <span className="relative flex items-center gap-2">
                    <AssistantGlyph className="h-5 w-5" sparkleClassName="text-lime-300" />
                    {ASSISTANT_NAME}랑 대화로 짜기
                    <span
                      className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                        mode === "chat" ? "bg-lime-300 text-navy-900" : "bg-ocean-100 text-ocean-600"
                      }`}
                    >
                      추천
                    </span>
                  </span>
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={mode === "form"}
                  onClick={() => setMode("form")}
                  className={`relative flex flex-1 items-center justify-center gap-1.5 rounded-[22px] py-3 text-[14px] font-semibold transition-colors ${
                    mode === "form" ? "text-navy-900" : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  {mode === "form" && (
                    <motion.span
                      layoutId="hero-mode-pill"
                      className="absolute inset-0 rounded-[22px] bg-white shadow-sm"
                      transition={{ type: "spring", stiffness: 400, damping: 34 }}
                    />
                  )}
                  <span className="relative flex items-center gap-1.5">
                    <SlidersHorizontal className="h-4 w-4" />
                    조건 골라 만들기
                  </span>
                </button>
              </div>

              <div className="p-3 md:p-4">
                {/* 나가는 쪽이 사라질 때까지 기다리지 않고 바로 바꾼다 — 탭 전환이 굼떠 보이지 않게 */}
                <AnimatePresence mode="popLayout" initial={false}>
                  {mode === "chat" ? (
                    <motion.div
                      key="chat"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.22 }}
                    >
                      {/* 온나가 먼저 말을 거는 첫 말풍선 */}
                      <div className="flex items-end gap-2">
                        <AssistantAvatar size={36} />
                        <p className="max-w-[80%] rounded-[20px] rounded-bl-[6px] bg-[#e9e9eb] px-4 py-2.5 text-[15px] leading-snug text-gray-900 break-keep">
                          안녕하세요, {ASSISTANT_NAME}예요! 어디서 누구랑 어떻게 놀고 싶어요? 편하게 말해주세요 👋
                        </p>
                      </div>
                      <div className="mt-4">
                        <ChatComposer size="md" />
                      </div>
                      <div className="mt-3">
                        <PromptChips tone="light" layout="grid" />
                      </div>
                      <p className="mt-4 flex flex-wrap items-center justify-center gap-x-1.5 text-center text-[12px] text-gray-400">
                        하루 {CHAT_DAILY_LIMIT}번 · 한 대화에 질문 {CHAT_TURNS_PER_CONVERSATION}번까지 ·
                        <button
                          type="button"
                          onClick={() => setMode("form")}
                          className="font-semibold text-ocean-600 underline-offset-2 hover:underline"
                        >
                          조건으로 만들면 제한 없어요
                        </button>
                      </p>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="form"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.22 }}
                    >
                      <SearchBar variant="formOnly" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </Container>
        </motion.div>
      </motion.div>
    </AIFirstShell>
  );
}
