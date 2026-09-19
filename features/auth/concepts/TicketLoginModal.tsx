"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { Plane, X } from "lucide-react";

import SocialLoginButton from "@/features/auth/SocialLoginButton";
import { BUSAN_PHOTOS } from "./photos";

const COVER = BUSAN_PHOTOS[0];
const BARCODE = [3, 1, 2, 1, 3, 2, 1, 1, 3, 1, 2, 3, 1, 2, 1, 3, 1, 1, 2, 3];

/** 표 모양 로그인 — 페이지로도, 모달 속 내용으로도 쓴다. 넓은 화면에선 진짜 표처럼 가로로 눕는다 */
function TicketCard() {
  return (
    <div className="flex w-full max-w-sm flex-col overflow-hidden rounded-[28px] bg-white shadow-[0_40px_90px_-30px_rgba(5,12,26,0.95)] sm:max-w-[680px] sm:flex-row">
      {/* 사진 면 — 가로일 땐 왼쪽 절반 */}
      <div className="relative h-[190px] shrink-0 sm:h-auto sm:w-[290px]">
        <Image src={COVER.src} alt="" fill priority quality={92} sizes="(max-width: 640px) 100vw, 290px" className="object-cover" />
        <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-navy-900/85 via-navy-900/25 to-navy-900/10" />

        <div className="absolute inset-x-5 top-4 flex items-center justify-between text-white">
          <span className="flex items-center gap-1.5 text-[11px] font-bold tracking-[0.18em]">
            <Image src="/logo/icon.png" alt="" width={22} height={19} className="h-[19px] w-auto" />
            BOARDING PASS
          </span>
          <span className="text-[11px] text-white/70 sm:hidden">NO.001</span>
        </div>

        <div className="absolute inset-x-5 bottom-4 flex items-end justify-between text-white">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.14em] text-white/60">TO</p>
            <p className="text-[30px] font-black leading-none tracking-tight">BUSAN</p>
            <p className="mt-2 hidden text-[11px] text-white/60 sm:block">{COVER.label}</p>
          </div>
          <Plane className="mb-1 h-5 w-5 -rotate-12 text-lime-300" />
        </div>
      </div>

      {/* 뜯는 자리 — 세로일 땐 가로줄, 가로일 땐 세로줄 */}
      <div className="relative h-5 shrink-0 sm:h-auto sm:w-5">
        <span
          aria-hidden
          className="absolute -left-2.5 top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-gray-100 shadow-[inset_-2px_0_3px_rgba(5,12,26,0.12)] sm:left-1/2 sm:top-auto sm:-bottom-2.5 sm:-translate-x-1/2 sm:translate-y-0 sm:shadow-[inset_0_2px_3px_rgba(5,12,26,0.12)]"
        />
        <span
          aria-hidden
          className="absolute -right-2.5 top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-gray-100 shadow-[inset_2px_0_3px_rgba(5,12,26,0.12)] sm:left-1/2 sm:right-auto sm:-top-2.5 sm:-translate-x-1/2 sm:translate-y-0 sm:shadow-[inset_0_-2px_3px_rgba(5,12,26,0.12)]"
        />
        <span
          aria-hidden
          className="absolute inset-x-6 top-1/2 border-t-2 border-dashed border-gray-200 sm:inset-x-auto sm:inset-y-6 sm:left-1/2 sm:top-auto sm:border-t-0 sm:border-l-2"
        />
      </div>

      {/* 로그인 면 */}
      <div className="flex flex-1 flex-col justify-center px-7 pb-7 pt-3 sm:py-8 sm:pl-2 sm:pr-8">
        <div className="hidden items-center justify-between sm:flex">
          <span className="text-[10px] font-bold tracking-[0.14em] text-gray-400">BOARDING PASS</span>
          <span className="text-[10px] text-gray-300">NO.001</span>
        </div>

        <p className="text-center text-[15px] font-bold text-navy-900 sm:mt-5 sm:text-left sm:text-[17px]">
          부산 여행, 지금 발권하세요
        </p>
        <p className="mt-1.5 text-center text-[12px] text-gray-400 sm:text-left">소셜 계정으로 3초면 시작해요</p>

        <div className="mt-5 flex flex-col gap-3">
          <SocialLoginButton provider="kakao" />
          <SocialLoginButton provider="naver" />
          <SocialLoginButton provider="google" />
        </div>

        <div aria-hidden className="mt-6 flex h-8 items-stretch justify-center gap-[2px] sm:justify-start">
          {BARCODE.map((width, i) => (
            <span key={i} className="bg-navy-900/80" style={{ width }} />
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * 시안 D-2 · 탑승권 모달
 * 로그인 버튼을 누르면 페이지를 옮기지 않고 그 자리에서 표가 떠오른다.
 * 보던 화면을 떠나지 않아 로그인 뒤 원래 자리로 돌아오기 쉽고, 표가 "끊는" 느낌도 더 산다.
 * (스토리북 확인용 — 실제로 붙일 땐 헤더 로그인 버튼이 이 모달을 연다)
 */
export default function TicketLoginModal() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="relative min-h-screen bg-gray-50">
      {/* 뒤에 깔린 화면 흉내 — 모달이 어떤 위에 뜨는지 보이려고 */}
      <div className="pointer-events-none select-none p-8">
        <div className="mx-auto max-w-5xl">
          <div className="h-10 w-40 rounded-full bg-gray-200" />
          <div className="mt-6 h-56 rounded-[28px] bg-gray-200" />
          <div className="mt-4 grid grid-cols-3 gap-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-40 rounded-2xl bg-gray-200" />
            ))}
          </div>
        </div>
      </div>

      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 rounded-full bg-navy-900 px-6 py-3 text-sm font-bold text-lime-300"
        >
          로그인 버튼 다시 누르기
        </button>
      )}

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-5">
            <motion.button
              type="button"
              aria-label="닫기"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-navy-900/70 backdrop-blur-sm"
            />

            <motion.div
              // 표를 뽑아 올리듯 아래에서 살짝 기울어진 채로 떠오른다
              initial={{ opacity: 0, y: 40, rotate: -2, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.98 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="relative"
            >
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="닫기"
                className="absolute -top-11 right-0 flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white ring-1 ring-inset ring-white/25 transition-colors hover:bg-white/25"
              >
                <X className="h-4 w-4" />
              </button>
              <TicketCard />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
