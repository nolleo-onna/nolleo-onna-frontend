"use client";

import { useState } from "react";

/**
 * 현재 페이지 URL을 공유하는 훅.
 * Web Share API를 지원하면 시스템 공유 시트를 열고,
 * 미지원(데스크톱 등)이면 클립보드에 복사 후 잠시 copied 상태를 켠다.
 */
export function useShareCurrentUrl(title: string) {
  const [copied, setCopied] = useState(false);

  const share = async () => {
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

  return { copied, share };
}
