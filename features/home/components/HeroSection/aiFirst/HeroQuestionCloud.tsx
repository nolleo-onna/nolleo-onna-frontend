"use client";

import { useState } from "react";
import { motion, type Variants } from "motion/react";
import { SlidersHorizontal } from "lucide-react";

import { ASSISTANT_NAME } from "@/constants/assistant";
import { CHAT_DAILY_LIMIT, CHAT_TURNS_PER_CONVERSATION } from "@/constants/course";
import { useAIChatContext } from "@/providers/AIChatProvider";
import AIFirstShell from "./AIFirstShell";
import ChatComposer from "./ChatComposer";
import CourseFormReveal from "./CourseFormReveal";
import PromptChips from "./PromptChips";

const stagger: Variants = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };
const rise: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

/** 다른 사람들이 온나에게 물어본 것 같은 질문들 — 위치(%)·흔들림 주기를 조금씩 달리해 떠다니게 한다 */
const BUBBLES = [
  { text: "부모님이랑 영도 반나절 코스", left: 4, top: 6, delay: 0 },
  { text: "비 오는 날 갈 만한 곳?", left: 30, top: 0, delay: 0.8 },
  { text: "광안리 3만원으로 놀기", left: 60, top: 8, delay: 0.3 },
  { text: "혼자 걷기 좋은 바다길", left: 80, top: 30, delay: 1.2 },
  { text: "기장 드라이브 + 카페", left: 2, top: 52, delay: 1.6 },
  { text: "서면 야경 데이트 코스", left: 24, top: 70, delay: 0.5 },
  { text: "아이랑 실내 체험 코스", left: 54, top: 62, delay: 1 },
  { text: "불꽃축제 근처 맛집", left: 74, top: 78, delay: 0.2 },
];

/**
 * 시안 F · 떠다니는 질문 풍선 + 채팅 독
 * 다른 사람들이 이런 걸 물어본다는 풍선이 화면에 떠다니고, 아래엔 메신저 입력창이 붙어 있다.
 * "이런 것도 물어봐도 되네"를 보여줘 첫 질문의 문턱을 낮추는 안. 조건 폼은 입력창 옆 작은 버튼.
 */
export default function HeroQuestionCloud() {
  const { openChat } = useAIChatContext();
  const [isFormOpen, setIsFormOpen] = useState(false);

  return (
    <AIFirstShell>
      <motion.div
        className="mx-auto flex w-full max-w-5xl flex-col items-center px-5 text-center"
        variants={stagger}
        initial="hidden"
        animate="visible"
      >
        <motion.h1
          variants={rise}
          className="text-4xl font-bold leading-tight tracking-tight text-white break-keep md:text-6xl"
        >
          궁금한 거, <span className="text-lime-300">그냥</span> 물어보세요
        </motion.h1>
        <motion.p variants={rise} className="mt-4 text-sm text-white/70 break-keep md:text-base">
          다른 사람들은 {ASSISTANT_NAME}에게 이런 걸 물어봤어요 — 눌러서 똑같이 물어봐도 돼요
        </motion.p>

        {/* 질문 풍선 — 넓은 화면에선 흩뿌리고, 좁은 화면에선 칩으로 */}
        <motion.div variants={rise} className="relative mt-8 hidden h-[260px] w-full md:block">
          {BUBBLES.map((b) => (
            <motion.button
              key={b.text}
              type="button"
              onClick={() => openChat(b.text)}
              style={{ left: `${b.left}%`, top: `${b.top}%` }}
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4 + b.delay, repeat: Infinity, ease: "easeInOut", delay: b.delay }}
              whileHover={{ scale: 1.06 }}
              className="absolute whitespace-nowrap rounded-[20px] rounded-bl-[6px] bg-white/15 px-4 py-2.5 text-[14px] font-medium text-white shadow-[0_12px_30px_-18px_rgba(5,12,26,0.9)] ring-1 ring-inset ring-white/25 backdrop-blur-md transition-colors hover:bg-white hover:text-navy-900"
            >
              {b.text}
            </motion.button>
          ))}
        </motion.div>
        <motion.div variants={rise} className="mt-8 w-full md:hidden">
          <PromptChips tone="dark" layout="row" />
        </motion.div>

        {/* 채팅 독 */}
        <motion.div variants={rise} className="mt-8 flex w-full max-w-3xl flex-col items-stretch gap-3 md:flex-row md:items-center">
          <div className="min-w-0 flex-1">
            <ChatComposer size="lg" glow />
          </div>
          <button
            type="button"
            onClick={() => setIsFormOpen((v) => !v)}
            aria-expanded={isFormOpen}
            className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full bg-white/10 px-4 py-3 text-[13px] font-semibold text-white/85 ring-1 ring-inset ring-white/20 backdrop-blur-sm transition-colors hover:bg-white/20"
          >
            <SlidersHorizontal className="h-4 w-4" />
            조건으로 만들기
          </button>
        </motion.div>

        <motion.p variants={rise} className="mt-3 text-[12px] text-white/45">
          하루 {CHAT_DAILY_LIMIT}번 · 한 대화에 질문 {CHAT_TURNS_PER_CONVERSATION}번까지 · 조건으로 만들면 제한 없음
        </motion.p>
      </motion.div>

      <CourseFormReveal isOpen={isFormOpen} />
    </AIFirstShell>
  );
}
