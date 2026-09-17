"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, MapPin, Users } from "lucide-react";

import AssistantAvatar from "@/components/ui/Chat/AssistantAvatar";
import { ASSISTANT_NAME, ASSISTANT_TAGLINE } from "@/constants/assistant";
import { useAIChatContext } from "@/providers/AIChatProvider";

interface Script {
  ask: string;
  reply: string;
  title: string;
  total: string;
  crowd: string;
  stops: [string, string][];
}

// 온나와의 대화가 실제로 어떻게 흘러가는지 보여주는 예시 — 코스 내용은 시연용
const SCRIPTS: Script[] = [
  {
    ask: "광안리에서 친구랑 3만원으로 반나절 놀고 싶어",
    reply: "좋아요! 사람 덜 붐비는 순서로 짜봤어요",
    title: "광안리 바다 반나절",
    total: "2.8만원",
    crowd: "지금 여유",
    stops: [
      ["민락수변공원 산책", "40분"],
      ["광안리 카페거리", "60분"],
      ["해변 노을 보기", "30분"],
    ],
  },
  {
    ask: "비 오는 날 아이랑 갈 만한 실내 코스 짜줘",
    reply: "비 와도 걱정 없는 실내 위주로 모았어요",
    title: "비 오는 날 실내 코스",
    total: "2.1만원",
    crowd: "보통",
    stops: [
      ["국립부산과학관", "90분"],
      ["아이와 점심", "50분"],
      ["부산박물관", "60분"],
    ],
  },
];

/** 한 장면: 질문 → 입력 중 → 답 → 코스 카드 → 잠깐 머묾 → 다음 예시 */
const STEP_MS = [700, 1100, 900, 3600] as const;

/**
 * 온나가 코스를 짜주는 장면을 저절로 재생하는 미리보기 패널.
 * 설명 문구보다 "이렇게 말하면 이렇게 나온다"를 보여주는 게 빠르다. 누르면 그 질문으로 채팅이 열린다.
 */
export default function ChatPreview() {
  const { openChat } = useAIChatContext();
  const [scriptIndex, setScriptIndex] = useState(0);
  // 0 질문만 · 1 입력 중 · 2 답 · 3 코스 카드
  const [step, setStep] = useState(0);
  const script = SCRIPTS[scriptIndex];

  useEffect(() => {
    const timer = setTimeout(() => {
      if (step < 3) {
        setStep((s) => s + 1);
      } else {
        setStep(0);
        setScriptIndex((i) => (i + 1) % SCRIPTS.length);
      }
    }, STEP_MS[step]);
    return () => clearTimeout(timer);
  }, [step]);

  return (
    <button
      type="button"
      onClick={() => openChat(script.ask)}
      aria-label={`${ASSISTANT_NAME}에게 "${script.ask}" 물어보기`}
      className="group block w-full rounded-[30px] bg-white/10 p-2 text-left ring-1 ring-inset ring-white/20 backdrop-blur-xl transition-transform hover:-translate-y-1"
    >
      <div className="flex h-[440px] flex-col overflow-hidden rounded-[24px] bg-white/95 shadow-[0_30px_80px_-30px_rgba(5,12,26,0.8)]">
        {/* 헤더 */}
        <div className="flex items-center gap-2.5 border-b border-black/[0.06] px-4 py-3">
          <AssistantAvatar size={32} />
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-semibold leading-none text-gray-900">{ASSISTANT_NAME}</p>
            <p className="mt-1 text-[11px] leading-none text-gray-400">{ASSISTANT_TAGLINE}</p>
          </div>
          <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-600">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            대화 가능
          </span>
        </div>

        {/* 대화 */}
        <div className="flex flex-1 flex-col gap-2 overflow-hidden px-4 py-4">
          <AnimatePresence mode="popLayout">
            <motion.div
              key={`ask-${scriptIndex}`}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              style={{ transformOrigin: "bottom right" }}
              className="ml-auto max-w-[82%] rounded-[18px] rounded-br-[6px] bg-ocean-500 px-3.5 py-2 text-[14px] leading-snug text-white"
            >
              {script.ask}
            </motion.div>

            {step === 1 && (
              <motion.div
                key={`typing-${scriptIndex}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex w-fit items-center gap-1 rounded-[18px] rounded-bl-[6px] bg-[#e9e9eb] px-3.5 py-3"
              >
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="h-1.5 w-1.5 rounded-full bg-gray-400"
                    animate={{ opacity: [0.35, 1, 0.35] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.16 }}
                  />
                ))}
              </motion.div>
            )}

            {step >= 2 && (
              <motion.div
                key={`reply-${scriptIndex}`}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0 }}
                style={{ transformOrigin: "bottom left" }}
                className="max-w-[82%] rounded-[18px] rounded-bl-[6px] bg-[#e9e9eb] px-3.5 py-2 text-[14px] leading-snug text-gray-900"
              >
                {script.reply}
              </motion.div>
            )}

            {step >= 3 && (
              <motion.div
                key={`card-${scriptIndex}`}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 24 }}
                className="mt-1 rounded-2xl bg-white p-3.5 ring-1 ring-ocean-100 shadow-[0_10px_24px_-14px_rgba(13,48,128,0.45)]"
              >
                <p className="flex items-center gap-1 text-[11px] font-semibold text-ocean-600">
                  <Check className="h-3.5 w-3.5" strokeWidth={3} />
                  코스 완성
                </p>
                <div className="mt-1 flex items-end justify-between gap-2">
                  <p className="text-[15px] font-bold text-gray-900">{script.title}</p>
                  <p className="text-[13px] font-bold tabular-nums text-navy-600">{script.total}</p>
                </div>
                <ol className="mt-2.5 space-y-1.5">
                  {script.stops.map(([name, time], i) => (
                    <li key={name} className="flex items-center gap-2 text-[13px]">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-ocean-50 text-[10px] font-bold text-ocean-600">
                        {i + 1}
                      </span>
                      <span className="flex-1 truncate text-gray-800">{name}</span>
                      <span className="tabular-nums text-gray-400">{time}</span>
                    </li>
                  ))}
                </ol>
                <div className="mt-2.5 flex gap-1.5 text-[11px] font-medium">
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-600">
                    <Users className="h-3 w-3" />
                    {script.crowd}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-gray-500">
                    <MapPin className="h-3 w-3" />
                    지도에서 보기
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 아래 — 누르면 채팅이 열린다는 힌트 */}
        <div className="border-t border-black/[0.06] px-3 py-2.5">
          <div className="flex items-center justify-between rounded-full bg-gray-100 py-2 pl-4 pr-2 text-[13px] text-gray-400 transition-colors group-hover:bg-ocean-50 group-hover:text-ocean-600">
            나도 이렇게 물어보기
            <span className="rounded-full bg-ocean-500 px-2.5 py-1 text-[11px] font-semibold text-white">시작</span>
          </div>
        </div>
      </div>
    </button>
  );
}
