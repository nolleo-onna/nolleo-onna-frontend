"use client";

import { useState } from "react";
import { Check, Share2 } from "lucide-react";

interface ShareButtonProps {
  title: string;
  className?: string;
  /** icon: 텍스트 없이 아이콘만 (헤더 등 좁은 공간용) */
  variant?: "default" | "icon";
}

export default function ShareButton({ title, className = "", variant = "default" }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = window.location.href;

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

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={handleShare}
        aria-label={copied ? "링크가 복사됐어요" : "공유하기"}
        title={copied ? "링크가 복사됐어요" : "공유하기"}
        className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold text-gray-600 transition-colors hover:bg-gray-100 ${className}`}
      >
        {copied ? (
          <Check className="h-3 w-3 text-ocean-600" />
        ) : (
          <Share2 className="h-3 w-3" />
        )}
        {copied ? "복사됨" : "공유"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className={`flex items-center justify-center gap-2 rounded-full border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-600 transition-colors hover:border-gray-300 ${className}`}
    >
      {copied ? (
        <>
          <Check className="h-4 w-4 text-ocean-600" />
          링크가 복사됐어요
        </>
      ) : (
        <>
          <Share2 className="h-4 w-4" />
          공유하기
        </>
      )}
    </button>
  );
}
