"use client";

import { Check, Share2 } from "lucide-react";

interface Props {
  copied: boolean;
  onClick: () => void;
}

/**
 * 코스 공유 버튼 — 카카오톡·SNS로 보낼 코스 내용을 공유 시트로 열거나 복사한다.
 * 코스를 공개하지 않는다. 홈 인기 코스에 올리는 일은 사이드바의 "홈 인기 코스에 올리기"가 따로 맡는다.
 */
export default function ShareButton({ copied, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="코스 내용 공유하기"
      className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors ${
        copied ? "bg-ocean-50 text-ocean-600" : "bg-gray-50 text-gray-600 hover:bg-gray-100"
      }`}
    >
      {copied ? <Check className="h-3 w-3" /> : <Share2 className="h-3 w-3" />}
      {copied ? "복사됐어요" : "공유"}
    </button>
  );
}
