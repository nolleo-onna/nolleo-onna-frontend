"use client";

import { useAIChatContext } from "@/providers/AIChatProvider";
import { HERO_PROMPTS } from "./prompts";

interface PromptChipsProps {
  /** dark — 어두운 히어로 위, light — 흰 카드 안 */
  tone?: "dark" | "light";
  /** row — 가운데 정렬 한 줄(넘치면 줄바꿈), grid — 2열 */
  layout?: "row" | "grid";
  count?: number;
}

/** 누르면 그 문장이 채워진 채로 온나 채팅이 열리는 예시 칩 */
export default function PromptChips({ tone = "dark", layout = "row", count = HERO_PROMPTS.length }: PromptChipsProps) {
  const { openChat } = useAIChatContext();
  const prompts = HERO_PROMPTS.slice(0, count);

  const chipClass =
    tone === "dark"
      ? "bg-white/10 text-white/90 ring-white/20 hover:bg-white/20"
      : "bg-gray-50 text-gray-700 ring-gray-200 hover:bg-ocean-50 hover:text-ocean-700 hover:ring-ocean-200";

  return (
    <div className={layout === "grid" ? "grid grid-cols-1 gap-2 sm:grid-cols-2" : "flex flex-wrap justify-center gap-2"}>
      {prompts.map(({ emoji, text }) => (
        <button
          key={text}
          type="button"
          onClick={() => openChat(text)}
          className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-left text-[13px] font-medium ring-1 ring-inset backdrop-blur-sm transition-colors active:scale-[0.98] ${chipClass} ${
            layout === "grid" ? "w-full rounded-2xl py-2.5" : ""
          }`}
        >
          <span aria-hidden>{emoji}</span>
          <span className="truncate">{text}</span>
        </button>
      ))}
    </div>
  );
}
