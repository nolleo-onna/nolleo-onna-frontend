"use client";

import { useState } from "react";
import { AnimatePresence, motion, type Variants } from "motion/react";
import { ChevronDown, SlidersHorizontal } from "lucide-react";

import Container from "@/components/layout/Container";
import AssistantAvatar from "@/components/ui/Chat/AssistantAvatar";
import { ASSISTANT_NAME, ASSISTANT_TAGLINE } from "@/constants/assistant";
import { CHAT_DAILY_LIMIT, CHAT_TURNS_PER_CONVERSATION } from "@/constants/course";
import SearchBar from "@/features/home/components/SearchBar";
import AIFirstShell from "./AIFirstShell";
import ChatComposer from "./ChatComposer";
import PromptChips from "./PromptChips";

const stagger: Variants = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };
const rise: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

/**
 * 시안 A · 대화창이 곧 히어로
 * 화면 한가운데 큰 입력창 하나 — 들어오자마자 "여기에 말하면 된다"가 보인다.
 * 조건 폼(내 코스 만들기)은 접어 두고, 펼쳐야 보이는 2순위로 내린다.
 */
export default function HeroChatCenter() {
  const [isFormOpen, setIsFormOpen] = useState(false);

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
          className="inline-flex items-center gap-2 rounded-full bg-white/10 py-1 pl-1 pr-3 text-xs font-semibold text-white/85 ring-1 ring-inset ring-white/20 backdrop-blur-sm"
        >
          <AssistantAvatar size={22} />
          {ASSISTANT_TAGLINE} {ASSISTANT_NAME}
        </motion.span>

        <motion.h1
          variants={rise}
          className="mt-5 text-4xl font-bold leading-[1.15] tracking-tight text-white break-keep md:text-6xl"
        >
          부산 여행,
          <br />
          <span className="text-lime-300">{ASSISTANT_NAME}</span>한테 물어보세요
        </motion.h1>

        <motion.p variants={rise} className="mt-4 text-sm leading-relaxed text-white/70 break-keep md:text-base">
          어디서 누구랑 어떻게 놀고 싶은지 말만 하면, 혼잡도까지 보고 코스를 짜드려요
        </motion.p>

        <motion.div variants={rise} className="mt-9 w-full">
          <ChatComposer size="lg" glow />
        </motion.div>

        <motion.div variants={rise} className="mt-4 w-full">
          <PromptChips tone="dark" layout="row" />
        </motion.div>

        <motion.p variants={rise} className="mt-4 text-[12px] text-white/45">
          대화로 만드는 코스는 하루 {CHAT_DAILY_LIMIT}번 · 한 대화에 질문 {CHAT_TURNS_PER_CONVERSATION}번까지
        </motion.p>

        {/* ── 2순위: 조건 골라 만들기 — 접어 둔다 ── */}
        <motion.div variants={rise} className="mt-12 w-full">
          <div className="flex items-center gap-3 text-[12px] text-white/40">
            <span className="h-px flex-1 bg-white/15" />
            또는
            <span className="h-px flex-1 bg-white/15" />
          </div>
          <button
            type="button"
            onClick={() => setIsFormOpen((v) => !v)}
            aria-expanded={isFormOpen}
            className="mx-auto mt-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2.5 text-sm font-semibold text-white ring-1 ring-inset ring-white/20 backdrop-blur-sm transition-colors hover:bg-white/15"
          >
            <SlidersHorizontal className="h-4 w-4 text-lime-300" />
            조건 골라서 내 코스 만들기
            <span className="text-[11px] font-medium text-white/50">횟수 제한 없음</span>
            <ChevronDown className={`h-4 w-4 transition-transform ${isFormOpen ? "rotate-180" : ""}`} />
          </button>
        </motion.div>
      </motion.div>

      <AnimatePresence initial={false}>
        {isFormOpen && (
          <motion.div
            key="form"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <Container>
              <div className="mx-auto mt-5 max-w-3xl rounded-3xl bg-white p-5 text-left shadow-[0_4px_24px_rgba(13,48,128,0.12)]">
                <SearchBar variant="formOnly" />
              </div>
            </Container>
          </motion.div>
        )}
      </AnimatePresence>
    </AIFirstShell>
  );
}
