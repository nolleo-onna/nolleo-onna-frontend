"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";

import SocialLoginButton from "@/features/auth/SocialLoginButton";
import { BUSAN_PHOTOS } from "./photos";

// 열마다 사진 세 장씩 — 끊김 없이 흐르게 같은 줄을 두 벌 잇는다
const COLUMNS = [BUSAN_PHOTOS.slice(0, 3), BUSAN_PHOTOS.slice(3, 6), BUSAN_PHOTOS.slice(6, 9)];

/** 한 바퀴 도는 데 걸리는 시간(초) — 열마다 조금씩 달리해 같이 움직이는 티를 없앤다 */
const DURATIONS = [38, 46, 42];

/**
 * 시안 B-1 · 사진 모자이크
 * 부산 사진을 세 열로 깔고 **첫 열은 위로, 둘째 열은 아래로, 셋째 열은 위로** 천천히 흐르게 한다.
 * 사진 한 장이 화면의 3분의 1이라 관광공사 원본(940px)이 늘어나지 않아 선명하다.
 * 움직임 줄이기 설정이면 멈춘 채로 보여준다.
 */
export default function MosaicLogin() {
  const reduceMotion = useReducedMotion();

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-navy-900 px-5 py-12">
      <div className="absolute inset-0 grid grid-cols-2 sm:grid-cols-3">
        {COLUMNS.map((column, columnIndex) => {
          const goesUp = columnIndex % 2 === 0;
          return (
            <div
              key={columnIndex}
              // 좁은 화면에선 두 열만 — 세 번째 열은 숨긴다
              className={`relative overflow-hidden ${columnIndex === 2 ? "hidden sm:block" : ""}`}
            >
              <motion.div
                className="flex flex-col"
                animate={reduceMotion ? undefined : { y: goesUp ? ["0%", "-50%"] : ["-50%", "0%"] }}
                transition={{
                  duration: DURATIONS[columnIndex],
                  repeat: Infinity,
                  ease: "linear",
                }}
                style={reduceMotion ? { transform: "translateY(-25%)" } : undefined}
              >
                {/* 같은 사진을 두 벌 이어 붙여 끝에서 처음으로 이어지게 한다 */}
                {[...column, ...column].map((photo, i) => (
                  <div key={`${photo.src}-${i}`} className="relative h-[46vh] w-full shrink-0">
                    <Image
                      src={photo.src}
                      alt=""
                      fill
                      sizes="(max-width: 640px) 50vw, 34vw"
                      quality={90}
                      priority={columnIndex < 2 && i === 0}
                      className="object-cover"
                    />
                  </div>
                ))}
              </motion.div>
            </div>
          );
        })}
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
          <span className="font-taenada translate-y-1 bg-gradient-to-r from-navy-700 via-ocean-600 to-ocean-400 bg-clip-text text-3xl text-transparent">
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
