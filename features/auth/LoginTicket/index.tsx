"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import { AlertCircle, Plane } from "lucide-react";

import SocialLoginButton from "@/features/auth/SocialLoginButton";
import { getLastLoginProvider } from "@/features/auth/lastLogin";

const RETURN_URL_KEY = "auth:returnUrl";

// 표 윗면 사진 — 한국관광공사(TourAPI) 광안리해수욕장
const COVER = {
  src: "https://tong.visitkorea.or.kr/cms/resource/45/3311245_image2_1.jpg",
  label: "광안리해수욕장",
};

// 바코드 느낌의 줄 굵기 — 매 렌더 무작위면 깜빡이므로 고정값
const BARCODE = [3, 1, 2, 1, 3, 2, 1, 1, 3, 1, 2, 3, 1, 2, 1, 3, 1, 1, 2, 3];

/**
 * 로그인 — "부산행 탑승권" 한 장.
 * 넓은 화면에서는 진짜 표처럼 가로로 눕고(왼쪽 사진·오른쪽 로그인), 좁은 화면에서는 세로로 접힌다.
 * 로그인 페이지와 (나중에 붙일) 로그인 모달이 이 카드를 같이 쓴다.
 */
export default function LoginTicket() {
  const searchParams = useSearchParams();
  const hasSessionNotice = searchParams.get("notice") === "session";
  // 이 브라우저에서 로그인에 성공한 적이 있는지 — 처음 온 사용자에게
  // "로그인이 만료됐어요"라고 하면 쓴 적도 없는데 혼란스러우므로 문구를 구분한다.
  const [hasLoggedInBefore, setHasLoggedInBefore] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage는 마운트 후에만 읽을 수 있음 (hydration 불일치 방지)
    setHasLoggedInBefore(getLastLoginProvider() !== null);
  }, []);

  useEffect(() => {
    const returnUrl = searchParams.get("returnUrl");

    if (returnUrl && returnUrl.startsWith("/") && !returnUrl.startsWith("//")) {
      sessionStorage.setItem(RETURN_URL_KEY, returnUrl);
    }
  }, [searchParams]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, rotate: -1 }}
      animate={{ opacity: 1, y: 0, rotate: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="flex w-full max-w-sm flex-col overflow-hidden rounded-[28px] bg-white shadow-[0_40px_90px_-30px_rgba(5,12,26,0.95)] sm:max-w-[780px] sm:flex-row"
    >
      {/* 사진 면 — 가로일 땐 왼쪽 */}
      <div className="relative h-[190px] shrink-0 sm:h-auto sm:w-[340px]">
        <Image
          src={COVER.src}
          alt=""
          fill
          priority
          quality={92}
          sizes="(max-width: 640px) 100vw, 340px"
          className="object-cover"
        />
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

      {/* 뜯는 자리 — 세로일 땐 가로줄, 가로일 땐 세로줄. 배경이 파도라 노치는 파인 것처럼 그늘로 */}
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
      <div className="flex flex-1 flex-col justify-center px-7 pb-7 pt-3 sm:py-9 sm:pl-3 sm:pr-10">
        <div className="hidden items-center justify-between sm:flex">
          <span className="text-[10px] font-bold tracking-[0.14em] text-gray-400">BOARDING PASS</span>
          <span className="text-[10px] text-gray-300">NO.001</span>
        </div>

        <p className="text-center text-[15px] font-bold text-navy-900 sm:mt-5 sm:text-left sm:text-[17px]">
          {hasLoggedInBefore ? "다시 만나서 반가워요" : "부산 여행, 지금 발권하세요"}
        </p>
        <p className="mt-1.5 text-center text-[12px] text-gray-400 sm:text-left">소셜 계정으로 3초면 시작해요</p>

        {hasSessionNotice && (
          <div className="mt-4 flex items-start gap-2 rounded-2xl bg-ocean-50 px-3.5 py-2.5 text-[12px] font-medium text-ocean-700 break-keep">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            {hasLoggedInBefore
              ? "로그인이 만료됐어요. 다시 로그인해주세요."
              : "로그인이 필요한 서비스예요. 소셜 계정으로 3초면 시작할 수 있어요."}
          </div>
        )}

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
    </motion.div>
  );
}
