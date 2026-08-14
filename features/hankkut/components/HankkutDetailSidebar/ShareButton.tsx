"use client";

import { useState } from "react";
import { Check, Share2 } from "lucide-react";

export default function ShareButton({ title }: { title: string }) {
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

  return (
    <button
      type="button"
      onClick={handleShare}
      className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-600 transition-colors hover:border-gray-300"
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
