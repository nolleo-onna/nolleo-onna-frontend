"use client";

import Image from "next/image";
import { motion } from "motion/react";

import SocialLoginButton from "@/features/auth/SocialLoginButton";

// 관광공사 사진 — 로그인 배경으로 부산을 먼저 보여준다
const BACKGROUND = "https://tong.visitkorea.or.kr/cms/resource/45/3311245_image2_1.jpg";

/**
 * 시안 B · 부산 사진 위에
 * 광안리 사진을 깔고 그 위에 유리 카드로 로그인을 얹는다. 들어오자마자 "부산 여행 서비스"라는 게 읽힌다.
 * 사진은 어둡게 덮어 글씨가 묻히지 않게 한다.
 */
export default function PhotoLogin() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-12">
      <Image src={BACKGROUND} alt="" fill priority sizes="100vw" className="object-cover" />
      <span aria-hidden className="absolute inset-0 bg-gradient-to-b from-navy-900/70 via-navy-900/55 to-navy-900/80" />

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative w-full max-w-sm rounded-[28px] bg-white/12 p-8 text-center ring-1 ring-inset ring-white/25 backdrop-blur-xl"
      >
        <div className="mb-6 flex items-center justify-center gap-2">
          <Image src="/logo/icon.png" alt="" width={48} height={41} className="h-[41px] w-auto" />
          <span className="font-taenada translate-y-1 text-3xl text-white">놀러온나</span>
        </div>

        <h1 className="text-[22px] font-bold leading-snug text-white break-keep">
          부산 여행, 오늘은
          <br />
          어디로 가볼까요?
        </h1>
        <p className="mt-2.5 text-sm text-white/70">소셜 계정으로 3초면 시작해요</p>

        <div className="mt-7 flex flex-col gap-3">
          <SocialLoginButton provider="kakao" />
          <SocialLoginButton provider="naver" />
          <SocialLoginButton provider="google" />
        </div>

        <p className="mt-6 text-[12px] text-white/50">광안리해수욕장 · 한국관광공사</p>
      </motion.div>
    </main>
  );
}
