"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUp } from "lucide-react";

import AssistantAvatar from "@/components/ui/Chat/AssistantAvatar";
import { ASSISTANT_NAME } from "@/constants/assistant";
import { useAIChatContext } from "@/providers/AIChatProvider";
import { HERO_PLACEHOLDERS } from "./prompts";

interface ChatComposerProps {
  /** lg — 히어로 한가운데 주인공, md — 카드 안 */
  size?: "lg" | "md";
  /** 무지개 테두리 발광. 어두운 배경 위 주인공일 때만 */
  glow?: boolean;
}

const PLACEHOLDER_INTERVAL_MS = 3200;

/**
 * 히어로의 온나 입력창 — 치고 보내면 채팅 모달이 그 문장을 채운 채 열린다.
 * 한글 조합 중 Enter는 글자 확정이라 보내지 않는다.
 */
export default function ChatComposer({ size = "lg", glow = false }: ChatComposerProps) {
  const { openChat } = useAIChatContext();
  const [value, setValue] = useState("");
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(
      () => setPlaceholderIndex((i) => (i + 1) % HERO_PLACEHOLDERS.length),
      PLACEHOLDER_INTERVAL_MS,
    );
    return () => clearInterval(timer);
  }, []);

  const submit = () => {
    const text = value.trim();
    openChat(text || undefined);
    setValue("");
  };

  const isLg = size === "lg";

  const field = (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className={`relative flex items-center gap-3 bg-white ${
        isLg ? "rounded-[26px] py-3 pl-3 pr-3 md:py-3.5" : "rounded-[22px] py-2 pl-2.5 pr-2 ring-1 ring-gray-200"
      }`}
    >
      <AssistantAvatar size={isLg ? 40 : 34} />
      <div className="relative min-w-0 flex-1">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && e.nativeEvent.isComposing) e.preventDefault();
          }}
          aria-label={`${ASSISTANT_NAME}에게 물어보기`}
          maxLength={200}
          className={`w-full bg-transparent text-left text-gray-900 outline-none ${
            isLg ? "text-[16px] md:text-[17px]" : "text-[15px]"
          }`}
        />
        {/* placeholder를 직접 그려 문장이 바뀔 때 살짝 올라가며 바뀌게 한다 */}
        {!value && (
          <div className="pointer-events-none absolute inset-0 flex items-center overflow-hidden">
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={placeholderIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.28 }}
                className={`truncate text-gray-400 ${isLg ? "text-[16px] md:text-[17px]" : "text-[15px]"}`}
              >
                {HERO_PLACEHOLDERS[placeholderIndex]}
              </motion.span>
            </AnimatePresence>
          </div>
        )}
      </div>
      <button
        type="submit"
        aria-label={`${ASSISTANT_NAME}에게 보내기`}
        className={`flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#34a6ff] to-[#0a84ff] text-white shadow-[0_6px_16px_-6px_rgba(10,132,255,0.9)] transition-transform hover:scale-105 active:scale-95 ${
          isLg ? "h-11 w-11" : "h-9 w-9"
        }`}
      >
        <ArrowUp className={isLg ? "h-5 w-5" : "h-[18px] w-[18px]"} strokeWidth={2.75} />
      </button>
    </form>
  );

  if (!glow) return field;

  return (
    <motion.div
      className="rounded-[28px] p-[2px] shadow-[0_24px_70px_-20px_rgba(10,132,255,0.75)]"
      style={{
        backgroundImage: "linear-gradient(110deg, #c8f135, #34a6ff, #a78bfa, #34a6ff, #c8f135)",
        backgroundSize: "300% 100%",
      }}
      animate={{ backgroundPosition: ["0% 50%", "100% 50%"] }}
      transition={{ duration: 6, repeat: Infinity, repeatType: "mirror", ease: "linear" }}
    >
      {field}
    </motion.div>
  );
}
