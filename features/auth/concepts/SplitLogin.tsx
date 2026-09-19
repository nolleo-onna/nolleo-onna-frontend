"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { MapPin, MessageCircle, Sparkles } from "lucide-react";

import SocialLoginButton from "@/features/auth/SocialLoginButton";
import WavesBackground from "@/components/ui/WavesBackground";
import { ASSISTANT_NAME } from "@/constants/assistant";

const POINTS = [
  { icon: <MessageCircle className="h-4 w-4" />, text: `${ASSISTANT_NAME}에게 말하면 코스를 짜드려요` },
  { icon: <MapPin className="h-4 w-4" />, text: "혼잡도까지 보고 덜 붐비는 곳으로" },
  { icon: <Sparkles className="h-4 w-4" />, text: "만든 코스는 저장하고 공유까지" },
];

/**
 * 시안 A · 반반 화면
 * 왼쪽은 파도가 치는 소개 면, 오른쪽은 흰 로그인 면. 로그인 창 하나만 덩그러니 있던 화면에
 * "여기서 뭘 할 수 있는지"를 같이 둔다. 좁은 화면에서는 소개가 위로 접힌다.
 */
export default function SplitLogin() {
  return (
    <main className="flex min-h-screen flex-col lg:flex-row">
      {/* 소개 면 */}
      <section className="relative flex min-h-[260px] flex-1 items-center overflow-hidden bg-gradient-to-br from-navy-800 via-navy-700 to-ocean-800 px-8 py-12 lg:px-14">
        <WavesBackground />
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative z-10 w-full max-w-md"
        >
          <div className="flex items-center gap-2">
            <Image src="/logo/icon.png" alt="" width={40} height={34} className="h-[34px] w-auto" />
            <span className="font-taenada text-2xl text-white">놀러온나</span>
          </div>

          <h1 className="mt-7 text-3xl font-bold leading-tight tracking-tight text-white break-keep lg:text-4xl">
            오늘 부산,
            <br />
            어떻게 놀지 <span className="text-lime-300">같이 정해요</span>
          </h1>

          <ul className="mt-8 flex flex-col gap-3">
            {POINTS.map((point) => (
              <li key={point.text} className="flex items-center gap-2.5 text-[14px] text-white/85 break-keep">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10 text-lime-300 ring-1 ring-inset ring-white/15">
                  {point.icon}
                </span>
                {point.text}
              </li>
            ))}
          </ul>
        </motion.div>
      </section>

      {/* 로그인 면 */}
      <section className="flex flex-1 items-center justify-center bg-white px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
          className="w-full max-w-sm"
        >
          <h2 className="text-xl font-bold text-navy-900">시작하기</h2>
          <p className="mt-2 text-sm text-gray-500">소셜 계정으로 3초면 시작할 수 있어요</p>

          <div className="mt-7 flex flex-col gap-3">
            <SocialLoginButton provider="kakao" />
            <SocialLoginButton provider="naver" />
            <SocialLoginButton provider="google" />
          </div>

          <p className="mt-6 text-center text-[12px] leading-relaxed text-gray-400 break-keep">
            로그인하면 이용약관과 개인정보처리방침에 동의한 것으로 봅니다
          </p>
        </motion.div>
      </section>
    </main>
  );
}
