"use client";

import { motion, type Variants } from "motion/react";

import AssistantAvatar from "@/components/ui/Chat/AssistantAvatar";
import { ASSISTANT_NAME, ASSISTANT_TAGLINE } from "@/constants/assistant";
import { CHAT_DAILY_LIMIT, CHAT_TURNS_PER_CONVERSATION } from "@/constants/course";
import AIFirstShell from "./AIFirstShell";
import ChatComposer from "./ChatComposer";
import CourseSentenceForm from "./courseForm/CourseSentenceForm";
import PromptChips from "./PromptChips";

const stagger: Variants = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };
const rise: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

/**
 * 시안 A · 대화창이 곧 히어로
 * 화면 한가운데 큰 입력창 하나 — 들어오자마자 "여기에 말하면 된다"가 보인다.
 * 조건 폼(내 코스 만들기)은 아래에 빈칸 채우기 문장으로 — 말하듯 읽혀 채팅과 결이 같고, 유리 카드라 한 단계 뒤로 물러나 보인다.
 */
interface HeroChatCenterProps {
  /** 2순위 조건 폼 — 시안별로 바꿔 끼워 비교한다. 기본은 빈칸 채우기 문장 */
  courseForm?: React.ReactNode;
  /** 조건 폼 위 구분선 문구 */
  dividerLabel?: string;
}

export default function HeroChatCenter({
  courseForm = <CourseSentenceForm />,
  dividerLabel = "또는 한 문장으로",
}: HeroChatCenterProps) {
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

        {/* ── 2순위: 조건 골라 만들기 ── */}
        <motion.div variants={rise} className="mt-14 w-full">
          <div className="mb-5 flex items-center gap-3 text-[12px] text-white/40">
            <span className="h-px flex-1 bg-white/15" />
            {dividerLabel}
            <span className="h-px flex-1 bg-white/15" />
          </div>
          {courseForm}
        </motion.div>
      </motion.div>
    </AIFirstShell>
  );
}
