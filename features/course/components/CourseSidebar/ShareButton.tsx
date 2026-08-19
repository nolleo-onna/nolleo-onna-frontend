"use client";

import { Check, Share2 } from "lucide-react";

import { useShareCurrentUrl } from "@/hooks/useShareCurrentUrl";

interface Props {
  /** 공유 시트에 표시할 제목(코스 이름) */
  title: string;
}

/**
 * 코스 결과 페이지 공유 버튼.
 * 현재 URL(pairId·budget 쿼리 포함)을 공유하고,
 * 클립보드 폴백 시 "링크가 복사됐어요" 피드백을 잠시 보여준다.
 */
export default function ShareButton({ title }: Props) {
  const { copied, share } = useShareCurrentUrl(title);

  return (
    <button
      type="button"
      onClick={share}
      aria-label="코스 공유하기"
      className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors ${
        copied
          ? "bg-ocean-50 text-ocean-600"
          : "bg-gray-50 text-gray-600 hover:bg-gray-100"
      }`}
    >
      {copied ? (
        <>
          <Check className="h-3 w-3" />
          링크가 복사됐어요
        </>
      ) : (
        <>
          <Share2 className="h-3 w-3" />
          공유
        </>
      )}
    </button>
  );
}
