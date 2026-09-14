"use client";

import { AnimatePresence, motion } from "motion/react";
import { Eye, Globe, Heart, Link2, Loader2 } from "lucide-react";

import type { CourseShareInfo } from "@/types/course";

interface LinkShareConfirmProps {
  open: boolean;
  isPublishing: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * 비공개 코스에서 "링크 공유"를 눌렀을 때 펼쳐지는 확인.
 * 지금은 링크로 열리는 코스가 홈 인기 코스에도 함께 보이므로(백엔드 isPublic 하나), 말없이 공개하지 않고 먼저 알린다.
 */
export function LinkShareConfirm({ open, isPublishing, onConfirm, onCancel }: LinkShareConfirmProps) {
  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          key="link-share-confirm"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="overflow-hidden"
        >
          <div role="alert" className="mb-3 rounded-xl bg-ocean-50 px-3.5 py-3 text-[12px]">
            <p className="flex items-center gap-1.5 font-semibold text-ocean-700">
              <Link2 className="h-3.5 w-3.5 shrink-0" />
              링크를 만들면 홈에도 함께 올라가요
            </p>
            <p className="mt-1 leading-relaxed text-gray-600 break-keep">
              지금은 링크로 볼 수 있는 코스가 홈 &lsquo;지금 인기 있는 코스&rsquo;에도 함께 보여요.
            </p>
            <div className="mt-2.5 flex items-center gap-2">
              <button
                type="button"
                onClick={onConfirm}
                disabled={isPublishing}
                className="flex items-center gap-1 rounded-full bg-navy-900 px-3 py-1.5 text-[11px] font-bold text-lime-300 transition-opacity disabled:opacity-60"
              >
                {isPublishing && <Loader2 className="h-3 w-3 animate-spin" />}
                {isPublishing ? "링크 만드는 중" : "홈에도 올리고 링크 공유"}
              </button>
              <button
                type="button"
                onClick={onCancel}
                disabled={isPublishing}
                className="px-1.5 py-1.5 text-[11px] font-medium text-gray-500 transition-colors hover:text-gray-700 disabled:opacity-40"
              >
                취소
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface HomeListingCardProps {
  share: CourseShareInfo;
  isPending: boolean;
  /** 홈 인기 코스에 올린다 (코스 공개) */
  onList?: () => void;
  /** 홈에서 내린다 (코스 비공개) */
  onUnlist?: () => void;
}

/**
 * 홈 "지금 인기 있는 코스"에 올리기/내리기. 링크 공유 버튼과 따로 두어,
 * 홈에 공개하는 건 사용자가 이 카드에서 직접 고른 경우에만 일어나게 한다.
 */
export function HomeListingCard({ share, isPending, onList, onUnlist }: HomeListingCardProps) {
  if (share.isPublic) {
    return (
      <div className="mb-3 rounded-xl bg-lime-50 px-3.5 py-3 text-[12px]">
        <div className="flex items-center gap-2">
          <Globe className="h-3.5 w-3.5 shrink-0 text-lime-700" />
          <span className="font-semibold text-lime-800">홈에 올라가 있어요</span>
          <span className="flex items-center gap-0.5 text-gray-500">
            <Eye className="h-3 w-3" />
            {share.viewCount}
          </span>
          <span className="flex items-center gap-0.5 text-gray-500">
            <Heart className="h-3 w-3" />
            {share.likeCount}
          </span>
          {onUnlist && (
            <button
              type="button"
              onClick={onUnlist}
              disabled={isPending}
              className="ml-auto flex items-center gap-1 text-[11px] font-medium text-gray-500 transition-colors hover:text-gray-700 disabled:opacity-50"
            >
              {isPending && <Loader2 className="h-3 w-3 animate-spin" />}
              내리기
            </button>
          )}
        </div>
        <p className="mt-1 text-[11px] leading-relaxed text-lime-900/60 break-keep">
          내리면 홈에서 사라지고, 공유한 링크로도 열리지 않아요.
        </p>
      </div>
    );
  }

  return (
    <div className="mb-3 flex items-center gap-3 rounded-xl border border-dashed border-gray-200 px-3.5 py-3 text-[12px]">
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-gray-700">홈 인기 코스에 올리기</p>
        <p className="mt-0.5 text-[11px] leading-relaxed text-gray-400 break-keep">
          다른 여행자들이 홈에서 이 코스를 보고 좋아요를 누를 수 있어요.
        </p>
      </div>
      {onList && (
        <button
          type="button"
          onClick={onList}
          disabled={isPending}
          className="flex shrink-0 items-center gap-1 rounded-full bg-navy-900 px-3 py-1.5 text-[11px] font-bold text-lime-300 transition-opacity disabled:opacity-60"
        >
          {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Globe className="h-3 w-3" />}
          올리기
        </button>
      )}
    </div>
  );
}
