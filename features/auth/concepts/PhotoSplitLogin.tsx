"use client";

import Image from "next/image";
import { motion } from "motion/react";

import SocialLoginButton from "@/features/auth/SocialLoginButton";
import { BUSAN_PHOTOS } from "./photos";

const COVER = BUSAN_PHOTOS[0];

/**
 * 시안 B-2 · 사진 반반
 * 왼쪽 절반만 사진. 사진이 보이는 폭이 원본(940px)과 비슷해 늘어나지 않고 선명하다.
 * 오른쪽은 흰 면에 로그인만 둬 눌러야 할 곳이 분명하다. 좁은 화면에선 사진이 위로 간다.
 */
export default function PhotoSplitLogin() {
  return (
    <main className="flex min-h-screen flex-col lg:flex-row">
      {/* 사진 면 */}
      <section className="relative h-[240px] shrink-0 overflow-hidden lg:h-auto lg:flex-1">
        <Image
          src={COVER.src}
          alt=""
          fill
          priority
          quality={92}
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover"
        />
        <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-navy-900/85 via-navy-900/25 to-navy-900/35" />

        <div className="absolute inset-x-0 bottom-0 p-8 lg:p-12">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <div className="flex items-center gap-2">
              <Image src="/logo/icon.png" alt="" width={36} height={31} className="h-[31px] w-auto" />
              <span className="font-taenada text-2xl text-white">놀러온나</span>
            </div>
            <h1 className="mt-4 text-2xl font-bold leading-tight tracking-tight text-white break-keep lg:text-[32px]">
              오늘 부산,
              <br />
              어떻게 놀지 <span className="text-lime-300">같이 정해요</span>
            </h1>
            <p className="mt-3 text-[12px] text-white/60">{COVER.label} · 한국관광공사</p>
          </motion.div>
        </div>
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
