"use client";

import { useState } from "react";
import { Check, Loader2, Share2 } from "lucide-react";

import { buildCourseShareUrl } from "@/features/course/utils/shareLink";

import type { CourseShareInfo } from "@/types/course";

interface Props {
  /** 공유 시트에 표시할 제목(코스 이름) */
  title: string;
  /** 서버 코스의 공개 상태. 없으면(목업 코스) 현재 URL을 그대로 공유한다 */
  share?: CourseShareInfo;
  /** 비공개 코스를 공개로 바꾼 뒤 토큰을 돌려준다. 실패하면 null */
  onPublish?: () => Promise<string | null>;
}

async function shareUrl(title: string, url: string): Promise<boolean> {
  if (navigator.share) {
    try {
      await navigator.share({ title, url });
    } catch {
      // 사용자가 공유를 취소한 경우 등 — 조용히 무시
    }
    return false;
  }
  try {
    await navigator.clipboard.writeText(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * 코스 공유 버튼. 결과 페이지 주소는 본인만 열 수 있어서, 공유할 땐 코스를 공개로
 * 전환해 발급받은 토큰으로 누구나 볼 수 있는 /course/shared/{token} 링크를 만든다.
 * 이미 공개된 코스면 전환 없이 바로 링크를 낸다.
 */
export default function ShareButton({ title, share, onPublish }: Props) {
  const [copied, setCopied] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const handleShare = async () => {
    let url: string;
    if (!share || !onPublish) {
      url = window.location.href;
    } else if (share.isPublic && share.shareToken) {
      url = buildCourseShareUrl(share.shareToken);
    } else {
      setIsPublishing(true);
      const token = await onPublish();
      setIsPublishing(false);
      if (!token) return;
      url = buildCourseShareUrl(token);
    }

    if (await shareUrl(title, url)) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      disabled={isPublishing}
      aria-label="코스 공유하기"
      className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors disabled:opacity-60 ${
        copied
          ? "bg-ocean-50 text-ocean-600"
          : "bg-gray-50 text-gray-600 hover:bg-gray-100"
      }`}
    >
      {isPublishing ? (
        <>
          <Loader2 className="h-3 w-3 animate-spin" />
          링크 만드는 중
        </>
      ) : copied ? (
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
