"use client";

import { Check, Link2, Loader2 } from "lucide-react";

import type { LinkShareStatus } from "@/features/course/hooks/useCourseLinkShare";

interface Props {
  status: LinkShareStatus;
  onClick: () => void;
}

/**
 * 코스 링크 공유 버튼 — 카카오톡·SNS 등으로 보낼 링크를 공유 시트로 열거나 복사한다.
 * 홈 인기 코스에 올리는 일은 사이드바의 "홈 인기 코스에 올리기"가 따로 맡는다.
 * 흐름(비공개 코스 확인·공개·복사)은 useCourseLinkShare가 들고, 이 버튼은 상태만 보여준다.
 */
export default function ShareButton({ status, onClick }: Props) {
  const isPublishing = status === "publishing";
  const isCopied = status === "copied";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isPublishing}
      aria-label="코스 링크 공유하기"
      aria-expanded={status === "confirming"}
      className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors disabled:opacity-60 ${
        isCopied || status === "confirming"
          ? "bg-ocean-50 text-ocean-600"
          : "bg-gray-50 text-gray-600 hover:bg-gray-100"
      }`}
    >
      {isPublishing ? (
        <>
          <Loader2 className="h-3 w-3 animate-spin" />
          링크 만드는 중
        </>
      ) : isCopied ? (
        <>
          <Check className="h-3 w-3" />
          링크가 복사됐어요
        </>
      ) : (
        <>
          <Link2 className="h-3 w-3" />
          링크 공유
        </>
      )}
    </button>
  );
}
