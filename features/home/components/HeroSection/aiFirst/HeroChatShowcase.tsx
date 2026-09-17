"use client";

import { motion, type Variants } from "motion/react";
import { ArrowRight } from "lucide-react";

import Container from "@/components/layout/Container";
import AssistantAvatar from "@/components/ui/Chat/AssistantAvatar";
import { ASSISTANT_NAME, ASSISTANT_TAGLINE } from "@/constants/assistant";
import { CHAT_DAILY_LIMIT, CHAT_TURNS_PER_CONVERSATION } from "@/constants/course";
import SearchBar from "@/features/home/components/SearchBar";
import { useAIChatContext } from "@/providers/AIChatProvider";
import AIFirstShell from "./AIFirstShell";
import ChatPreview from "./ChatPreview";
import PromptChips from "./PromptChips";

const stagger: Variants = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };
const rise: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

/**
 * 시안 B · 온나가 먼저 보여주는 히어로
 * 왼쪽은 크게 "온나에게 물어보기", 오른쪽은 대화가 저절로 오가며 코스가 완성되는 장면.
 * 설명 대신 결과를 보여줘서 채팅을 눌러볼 이유를 만든다. 조건 폼은 아래로 내려 작게 둔다.
 */
export default function HeroChatShowcase() {
  const { openChat } = useAIChatContext();

  return (
    <AIFirstShell>
      <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-5 md:px-8 lg:grid-cols-[minmax(0,1fr)_420px] lg:gap-16">
        <motion.div
          className="flex flex-col items-center text-center lg:items-start lg:text-left"
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
            className="mt-5 text-4xl font-bold leading-[1.15] tracking-tight text-white break-keep md:text-6xl"
          >
            말만 하면
            <br />
            <span className="text-lime-300">부산 코스</span>가 나와요
          </motion.h1>

          <motion.p variants={rise} className="mt-5 max-w-md text-sm leading-relaxed text-white/70 break-keep md:text-base">
            예산·동행·분위기를 편하게 말하면 {ASSISTANT_NAME}가 혼잡도까지 보고 동선을 짜드려요. 모르는 건 되물어보면서요.
          </motion.p>

          {/* 1순위 CTA */}
          <motion.div variants={rise} className="relative mt-9">
            <motion.span
              aria-hidden
              className="absolute inset-0 rounded-full bg-lime-300/40"
              animate={{ scale: [1, 1.12, 1], opacity: [0.6, 0, 0.6] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeOut" }}
            />
            <button
              type="button"
              onClick={() => openChat()}
              className="relative inline-flex items-center gap-3 rounded-full bg-white py-2.5 pl-2.5 pr-6 text-[17px] font-bold text-navy-900 shadow-[0_18px_40px_-14px_rgba(200,241,53,0.7)] transition-transform hover:-translate-y-0.5 active:scale-[0.98]"
            >
              <AssistantAvatar size={44} />
              {ASSISTANT_NAME}에게 물어보기
              <ArrowRight className="h-5 w-5 text-ocean-500" />
            </button>
          </motion.div>

          <motion.div variants={rise} className="mt-6 w-full max-w-lg lg:[&>div]:justify-start">
            <PromptChips tone="dark" layout="row" count={3} />
          </motion.div>

          <motion.p variants={rise} className="mt-4 text-[12px] text-white/45">
            하루 {CHAT_DAILY_LIMIT}번 · 한 대화에 질문 {CHAT_TURNS_PER_CONVERSATION}번까지 물어볼 수 있어요
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30, rotate: 2 }}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          transition={{ type: "spring", stiffness: 90, damping: 16, delay: 0.25 }}
          className="mx-auto w-full max-w-[420px]"
        >
          <ChatPreview />
        </motion.div>
      </div>

      {/* ── 2순위: 조건 골라 만들기 — 아래로 내리고 한 톤 낮춘다 ── */}
      <Container>
        <div className="mx-auto mt-16 max-w-3xl">
          <p className="mb-3 text-center text-sm text-white/60">
            조건을 직접 고르는 게 편하다면 <span className="text-white/40">· 횟수 제한 없음</span>
          </p>
          <div className="rounded-3xl bg-white/95 p-5 shadow-[0_4px_24px_rgba(13,48,128,0.12)] backdrop-blur">
            <SearchBar variant="formOnly" />
          </div>
        </div>
      </Container>
    </AIFirstShell>
  );
}
