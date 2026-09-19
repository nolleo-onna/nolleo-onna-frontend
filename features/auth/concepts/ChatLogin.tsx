"use client";

import { motion } from "motion/react";

import AssistantAvatar from "@/components/ui/Chat/AssistantAvatar";
import SocialLoginButton from "@/features/auth/SocialLoginButton";
import WavesBackground from "@/components/ui/WavesBackground";
import { ASSISTANT_NAME } from "@/constants/assistant";

const BUBBLES = [
  { from: "onna", text: "안녕하세요, 부산 여행 도와드리는 온나예요." },
  { from: "user", text: "이번 주말에 부산 가는데 어디 가지?" },
  { from: "onna", text: "로그인하면 취향대로 코스를 짜서 저장해드릴게요!" },
] as const;

/**
 * 시안 C · 온나가 말을 거는 로그인
 * 서비스의 주인공인 채팅을 로그인 화면에서 미리 보여준다. 말풍선 세 개가 차례로 떠오르고,
 * 마지막 말풍선이 로그인 버튼으로 이어진다. "로그인하면 뭘 할 수 있는지"를 대화로 설명하는 안.
 */
export default function ChatLogin() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-b from-navy-800 via-navy-700 to-ocean-800 px-5 py-12">
      <WavesBackground />

      <div className="relative z-10 w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center">
          <AssistantAvatar size={64} className="ring-4 ring-white/20" />
          <p className="mt-3 font-taenada text-2xl text-white">놀러온나</p>
        </div>

        <div className="flex flex-col gap-2.5">
          {BUBBLES.map((bubble, i) => (
            <motion.p
              key={bubble.text}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.35, ease: "easeOut" }}
              className={
                bubble.from === "onna"
                  ? "w-fit max-w-[85%] rounded-[20px] rounded-bl-[6px] bg-white/15 px-4 py-2.5 text-[14px] text-white ring-1 ring-inset ring-white/15 backdrop-blur-sm break-keep"
                  : "ml-auto w-fit max-w-[85%] rounded-[20px] rounded-br-[6px] bg-white px-4 py-2.5 text-[14px] text-gray-900 break-keep"
              }
            >
              {bubble.text}
            </motion.p>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 1.1, ease: "easeOut" }}
          className="mt-7 rounded-[24px] bg-white p-6 shadow-[0_24px_60px_-24px_rgba(5,12,26,0.8)]"
        >
          <p className="text-center text-sm font-semibold text-navy-900">
            {ASSISTANT_NAME}와 시작하기
          </p>
          <div className="mt-4 flex flex-col gap-3">
            <SocialLoginButton provider="kakao" />
            <SocialLoginButton provider="naver" />
            <SocialLoginButton provider="google" />
          </div>
        </motion.div>
      </div>
    </main>
  );
}
