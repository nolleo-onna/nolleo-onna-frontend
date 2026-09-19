"use client";

import Image from "next/image";
import { motion } from "motion/react";

import SocialLoginButton from "@/features/auth/SocialLoginButton";

const WORDS = ["해운대", "광안리", "전포", "영도", "기장", "남포"];

/**
 * 시안 F · 큰 글씨
 * 사진 없이 브랜드 색 그라데이션 위에 큰 문장만 둔다. 화질 걱정이 아예 없고 가장 빨리 뜬다.
 * 아래쪽에서 동네 이름이 천천히 흘러가며 "부산 서비스"라는 걸 말해 준다.
 */
export default function TypeLogin() {
  return (
    <main className="relative flex min-h-screen flex-col justify-between overflow-hidden bg-gradient-to-br from-ocean-500 via-ocean-700 to-navy-800 px-6 py-10">
      <span aria-hidden className="pointer-events-none absolute -left-24 -top-20 h-80 w-80 rounded-full bg-lime-300/25 blur-3xl" />
      <span aria-hidden className="pointer-events-none absolute -right-16 bottom-10 h-72 w-72 rounded-full bg-white/15 blur-3xl" />

      <div className="relative flex items-center gap-2">
        <Image src="/logo/icon.png" alt="" width={34} height={29} className="h-[29px] w-auto" />
        <span className="font-taenada text-2xl text-white">놀러온나</span>
      </div>

      <div className="relative mx-auto grid w-full max-w-5xl gap-10 lg:grid-cols-2 lg:items-center">
        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="text-[40px] font-bold leading-[1.1] tracking-tight text-white break-keep md:text-[56px]"
        >
          오늘 부산,
          <br />
          어떻게 놀지
          <br />
          <span className="text-lime-300">같이 정해요</span>
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.12, ease: "easeOut" }}
          className="w-full max-w-sm justify-self-end rounded-[28px] bg-white p-7 shadow-[0_30px_80px_-24px_rgba(5,12,26,0.9)]"
        >
          <p className="text-[15px] font-bold text-navy-900">시작하기</p>
          <p className="mt-1.5 text-[13px] text-gray-500">소셜 계정으로 3초면 시작할 수 있어요</p>

          <div className="mt-6 flex flex-col gap-3">
            <SocialLoginButton provider="kakao" />
            <SocialLoginButton provider="naver" />
            <SocialLoginButton provider="google" />
          </div>
        </motion.div>
      </div>

      {/* 동네 이름이 천천히 흘러간다 — 같은 줄을 두 벌 이어 끊기지 않게 */}
      <div aria-hidden className="relative overflow-hidden">
        <motion.div
          className="flex w-max gap-8 whitespace-nowrap"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
        >
          {[...WORDS, ...WORDS].map((word, i) => (
            <span key={`${word}-${i}`} className="text-[15px] font-semibold text-white/35">
              {word}
            </span>
          ))}
        </motion.div>
      </div>
    </main>
  );
}
