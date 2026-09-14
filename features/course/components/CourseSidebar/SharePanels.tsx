"use client";

import { useState } from "react";
import { Check, Eye, Globe, Heart, Link2, Loader2 } from "lucide-react";

import { buildCourseShareUrl, copyToClipboard } from "@/features/course/utils/shareLink";

import type { CourseShareInfo } from "@/types/course";

interface HomeListingCardProps {
  share: CourseShareInfo;
  isPending: boolean;
  /** 홈 인기 코스에 올린다 (코스 공개) */
  onList?: () => void;
  /** 홈에서 내린다 (코스 비공개) */
  onUnlist?: () => void;
}

/**
 * 홈 "지금 인기 있는 코스"에 올리기/내리기. 헤더의 공유(코스 내용 글)와 따로 두어,
 * 홈에 공개하는 건 사용자가 이 카드에서 직접 고른 경우에만 일어나게 한다.
 * 누구나 열 수 있는 사이트 링크는 공개 코스에만 있어서, 링크 복사도 올라간 뒤에 이 카드에서 한다.
 */
export function HomeListingCard({ share, isPending, onList, onUnlist }: HomeListingCardProps) {
  const [linkCopied, setLinkCopied] = useState(false);

  const handleCopyLink = async () => {
    if (!share.shareToken) return;
    if (await copyToClipboard(buildCourseShareUrl(share.shareToken))) {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    }
  };

  if (share.isPublic) {
    return (
      <div className="mb-3 rounded-xl bg-ocean-50 px-3.5 py-3 text-[12px]">
        <div className="flex items-center gap-2">
          <Globe className="h-3.5 w-3.5 shrink-0 text-ocean-600" />
          <span className="font-semibold text-ocean-700">홈에 올라가 있어요</span>
          <span className="flex items-center gap-0.5 text-gray-500">
            <Eye className="h-3 w-3" />
            {share.viewCount}
          </span>
          <span className="flex items-center gap-0.5 text-gray-500">
            <Heart className="h-3 w-3" />
            {share.likeCount}
          </span>
        </div>
        <p className="mt-1 text-[11px] leading-relaxed text-navy-700/60 break-keep">
          내리면 홈에서 사라지고, 사이트 링크로도 열리지 않아요.
        </p>
        <div className="mt-2.5 flex items-center gap-2">
          {share.shareToken && (
            <button
              type="button"
              onClick={handleCopyLink}
              className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-semibold transition-colors ${
                linkCopied ? "bg-white text-ocean-600" : "bg-white/80 text-gray-700 hover:bg-white"
              }`}
            >
              {linkCopied ? <Check className="h-3 w-3" /> : <Link2 className="h-3 w-3" />}
              {linkCopied ? "링크가 복사됐어요" : "사이트 링크 복사"}
            </button>
          )}
          {onUnlist && (
            <button
              type="button"
              onClick={onUnlist}
              disabled={isPending}
              className="ml-auto flex items-center gap-1 text-[11px] font-medium text-gray-500 transition-colors hover:text-gray-700 disabled:opacity-50"
            >
              {isPending && <Loader2 className="h-3 w-3 animate-spin" />}
              홈에서 내리기
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-3 flex items-center gap-3 rounded-xl border border-dashed border-gray-200 px-3.5 py-3 text-[12px]">
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-gray-700">홈 인기 코스에 올리기</p>
        <p className="mt-0.5 text-[11px] leading-relaxed text-gray-400 break-keep">
          다른 여행자들이 홈에서 보고 좋아요를 누를 수 있고, 사이트 링크로도 공유할 수 있어요.
        </p>
      </div>
      {onList && (
        <button
          type="button"
          onClick={onList}
          disabled={isPending}
          className="flex shrink-0 items-center gap-1 rounded-full bg-navy-900 px-3 py-1.5 text-[11px] font-bold text-ocean-400 transition-opacity disabled:opacity-60"
        >
          {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Globe className="h-3 w-3" />}
          올리기
        </button>
      )}
    </div>
  );
}
