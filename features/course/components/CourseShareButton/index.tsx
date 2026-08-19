"use client";

import { useState } from "react";
import { Check, Share2 } from "lucide-react";

interface Props {
  /** 공유할 코스의 pairId — /course/result?pairId=... 링크를 만든다 */
  pairId: string;
  /** 공유 시트에 표시할 제목 (코스 제목) */
  title: string;
  className?: string;
}

// 코스 결과 화면 공유 버튼.
// Web Share API를 우선 사용하고, 미지원 환경에서는 클립보드 복사 + 피드백으로 대체한다.
export default function CourseShareButton({ pairId, title, className }: Props) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = `${window.location.origin}/course/result?pairId=${encodeURIComponent(pairId)}`;

    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // 사용자가 공유를 취소한 경우 등 — 조용히 무시
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // 클립보드 접근 실패 — 조용히 무시
    }
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      className={`flex items-center gap-1.5 rounded-full border border-gray-100 bg-white px-3 py-2 text-[12px] font-semibold text-gray-600 shadow-[0_4px_16px_rgba(13,48,128,0.12)] transition-colors hover:border-gray-200 hover:text-gray-800 ${className ?? ""}`}
    >
      {copied ? (
        <>
          <Check className="h-3.5 w-3.5 text-ocean-600" />
          링크가 복사됐어요
        </>
      ) : (
        <>
          <Share2 className="h-3.5 w-3.5" />
          코스 공유
        </>
      )}
    </button>
  );
}
