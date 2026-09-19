"use client";

import Image from "next/image";
import { motion } from "motion/react";

import SocialLoginButton from "@/features/auth/SocialLoginButton";
import WavesBackground from "@/components/ui/WavesBackground";
import { BUSAN_PHOTOS } from "./photos";

/** 떠다니는 스팟 카드 — 위치(%)와 흔들림 주기를 조금씩 달리해 같이 움직이지 않게 한다 */
const FLOATERS = [
  { photo: BUSAN_PHOTOS[0], left: 4, top: 12, rotate: -6, delay: 0 },
  { photo: BUSAN_PHOTOS[1], left: 74, top: 8, rotate: 5, delay: 0.8 },
  { photo: BUSAN_PHOTOS[4], left: 10, top: 62, rotate: 4, delay: 1.4 },
  { photo: BUSAN_PHOTOS[5], left: 78, top: 58, rotate: -5, delay: 0.4 },
  { photo: BUSAN_PHOTOS[8], left: 42, top: 2, rotate: 2, delay: 1.1 },
];

/**
 * 시안 E · 떠다니는 스팟 카드
 * 부산 곳곳의 사진 카드가 화면에 흩어져 천천히 떠다니고, 가운데에 로그인 카드가 놓인다.
 * 사진을 작은 카드로 쓰기 때문에 원본(940px)이 늘어나지 않아 선명하고, 화면이 심심하지 않다.
 */
export default function FloatingSpotLogin() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-b from-navy-800 via-navy-700 to-ocean-800 px-5 py-12">
      <WavesBackground />

      {/* 떠다니는 사진 카드 — 좁은 화면에선 숨긴다 */}
      <div aria-hidden className="pointer-events-none absolute inset-0 hidden lg:block">
        {FLOATERS.map((floater) => (
          <motion.div
            key={floater.photo.src}
            style={{ left: `${floater.left}%`, top: `${floater.top}%`, rotate: floater.rotate }}
            animate={{ y: [0, -16, 0] }}
            transition={{ duration: 6 + floater.delay, repeat: Infinity, ease: "easeInOut", delay: floater.delay }}
            className="absolute w-[190px] overflow-hidden rounded-[18px] bg-white p-2 shadow-[0_20px_50px_-20px_rgba(5,12,26,0.8)]"
          >
            <div className="relative aspect-[4/3] overflow-hidden rounded-[12px]">
              <Image src={floater.photo.src} alt="" fill sizes="190px" quality={85} className="object-cover" />
            </div>
            <p className="truncate px-1 pt-1.5 pb-0.5 text-[11px] font-semibold text-gray-600">{floater.photo.label}</p>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative w-full max-w-sm rounded-[28px] bg-white p-8 text-center shadow-[0_30px_80px_-24px_rgba(5,12,26,0.9)]"
      >
        <div className="mb-6 flex items-center justify-center gap-2">
          <Image src="/logo/icon.png" alt="" width={44} height={37} className="h-[37px] w-auto" />
          <span className="font-taenada translate-y-1 bg-gradient-to-r from-navy-700 via-ocean-600 to-ocean-400 bg-clip-text text-3xl text-transparent">
            놀러온나
          </span>
        </div>

        <h1 className="text-[20px] font-bold leading-snug text-navy-900 break-keep">
          부산의 좋은 곳,
          <br />
          모아뒀어요
        </h1>
        <p className="mt-2.5 text-sm text-gray-500">로그인하고 내 코스를 만들어보세요</p>

        <div className="mt-7 flex flex-col gap-3">
          <SocialLoginButton provider="kakao" />
          <SocialLoginButton provider="naver" />
          <SocialLoginButton provider="google" />
        </div>
      </motion.div>
    </main>
  );
}
