"use client";

import Image from "next/image";
import { motion } from "motion/react";

import SocialLoginButton from "@/features/auth/SocialLoginButton";
import { BUSAN_PHOTOS } from "./photos";

/**
 * 시안 B-1 · 사진 모자이크
 * 부산 사진 아홉 장을 격자로 깔고 가운데에 로그인 카드를 얹는다.
 * 사진 한 장이 화면의 3분의 1이라 관광공사 원본(940px)이 늘어나지 않아 선명하다.
 */
export default function MosaicLogin() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-navy-900 px-5 py-12">
      {/* 사진 격자 — 좁은 화면에선 두 줄, 넓은 화면에선 세 줄 */}
      <div className="absolute inset-0 grid grid-cols-2 grid-rows-4 sm:grid-cols-3 sm:grid-rows-3">
        {BUSAN_PHOTOS.slice(0, 9).map((photo, i) => (
          <div key={photo.src} className={`relative ${i >= 8 ? "hidden sm:block" : ""}`}>
            <Image
              src={photo.src}
              alt=""
              fill
              sizes="(max-width: 640px) 50vw, 34vw"
              quality={90}
              priority={i < 3}
              className="object-cover"
            />
          </div>
        ))}
      </div>
      <span aria-hidden className="absolute inset-0 bg-navy-900/70" />

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative w-full max-w-sm rounded-[28px] bg-white p-8 text-center shadow-[0_30px_80px_-24px_rgba(5,12,26,0.9)]"
      >
        <div className="mb-6 flex items-center justify-center gap-2">
          <Image src="/logo/icon.png" alt="" width={44} height={37} className="h-[37px] w-auto" />
          <span className="font-taenada translate-y-1 text-3xl bg-gradient-to-r from-navy-700 via-ocean-600 to-ocean-400 bg-clip-text text-transparent">
            놀러온나
          </span>
        </div>

        <h1 className="text-[20px] font-bold leading-snug text-navy-900 break-keep">
          부산 어디로 갈지
          <br />
          같이 정해요
        </h1>
        <p className="mt-2.5 text-sm text-gray-500">소셜 계정으로 3초면 시작해요</p>

        <div className="mt-7 flex flex-col gap-3">
          <SocialLoginButton provider="kakao" />
          <SocialLoginButton provider="naver" />
          <SocialLoginButton provider="google" />
        </div>
      </motion.div>
    </main>
  );
}
