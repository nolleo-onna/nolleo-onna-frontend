"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { Plane } from "lucide-react";

import SocialLoginButton from "@/features/auth/SocialLoginButton";
import WavesBackground from "@/components/ui/WavesBackground";
import { BUSAN_PHOTOS } from "./photos";

const COVER = BUSAN_PHOTOS[0];

// 바코드 느낌의 줄 굵기 — 매 렌더 무작위면 깜빡이므로 고정값
const BARCODE = [3, 1, 2, 1, 3, 2, 1, 1, 3, 1, 2, 3, 1, 2, 1, 3, 1, 1, 2, 3];

/**
 * 시안 D · 부산행 탑승권
 * 로그인 카드를 표 한 장으로 만든다. 위쪽은 사진과 "BUSAN" 도착지, 절취선 아래는 소셜 버튼.
 * "로그인 = 부산 가는 표를 끊는 일"로 읽히게 하는 안. 코스 결과의 티켓 카드와 결이 같다.
 * 배경은 홈 히어로와 같은 three.js 파도 — 어두운 물 위에 흰 표가 떠 있는 모양이 된다.
 */
export default function TicketLogin() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-b from-navy-800 via-navy-700 to-ocean-800 px-5 py-12">
      {/* 홈 히어로와 같은 파도 배경 */}
      <WavesBackground />

      <motion.div
        initial={{ opacity: 0, y: 16, rotate: -1 }}
        animate={{ opacity: 1, y: 0, rotate: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-sm overflow-hidden rounded-[28px] bg-white shadow-[0_40px_90px_-30px_rgba(5,12,26,0.95)]"
      >
        {/* 표 윗면 — 사진과 도착지 */}
        <div className="relative h-[190px]">
          <Image src={COVER.src} alt="" fill priority quality={92} sizes="420px" className="object-cover" />
          <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-navy-900/85 via-navy-900/25 to-navy-900/10" />

          <div className="absolute inset-x-5 top-4 flex items-center justify-between text-white">
            <span className="flex items-center gap-1.5 text-[11px] font-bold tracking-[0.18em]">
              <Image src="/logo/icon.png" alt="" width={22} height={19} className="h-[19px] w-auto" />
              BOARDING PASS
            </span>
            <span className="text-[11px] text-white/70">NO.001</span>
          </div>

          <div className="absolute inset-x-5 bottom-4 flex items-end justify-between text-white">
            <div>
              <p className="text-[10px] font-semibold tracking-[0.14em] text-white/60">TO</p>
              <p className="text-[30px] font-black leading-none tracking-tight">BUSAN</p>
            </div>
            <Plane className="mb-1 h-5 w-5 -rotate-12 text-lime-300" />
          </div>
        </div>

        {/* 뜯는 자리 — 배경이 파도라 노치 색을 맞출 수 없어, 파인 것처럼 안쪽으로 그늘을 넣는다 */}
        <div className="relative h-5">
          <span
            aria-hidden
            className="absolute -left-2.5 top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-gray-100 shadow-[inset_-2px_0_3px_rgba(5,12,26,0.12)]"
          />
          <span
            aria-hidden
            className="absolute -right-2.5 top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-gray-100 shadow-[inset_2px_0_3px_rgba(5,12,26,0.12)]"
          />
          <span aria-hidden className="absolute inset-x-6 top-1/2 border-t-2 border-dashed border-gray-200" />
        </div>

        {/* 표 아랫면 — 로그인 */}
        <div className="px-7 pb-7 pt-3">
          <p className="text-center text-[15px] font-bold text-navy-900">부산 여행, 지금 발권하세요</p>
          <p className="mt-1.5 text-center text-[12px] text-gray-400">소셜 계정으로 3초면 시작해요</p>

          <div className="mt-5 flex flex-col gap-3">
            <SocialLoginButton provider="kakao" />
            <SocialLoginButton provider="naver" />
            <SocialLoginButton provider="google" />
          </div>

          <div aria-hidden className="mt-6 flex h-8 items-stretch justify-center gap-[2px]">
            {BARCODE.map((width, i) => (
              <span key={i} className="bg-navy-900/80" style={{ width }} />
            ))}
          </div>
        </div>
      </motion.div>
    </main>
  );
}
