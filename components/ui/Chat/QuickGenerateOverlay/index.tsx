'use client';

import { Loader2, Sparkles } from 'lucide-react';

interface QuickGenerateOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

// 검색바처럼 조건이 이미 확정된 요청은 대화형 챗 모달 대신 이 가벼운 로딩
// 오버레이를 보여준다. 실제 생성 로직은 AIChatProvider가 백그라운드에서 처리한다.
export default function QuickGenerateOverlay({ isOpen, onClose }: QuickGenerateOverlayProps) {
  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 animate-fade-in bg-[#0d3080]/20 backdrop-blur-[3px]"
        onClick={onClose}
      />
      <div
        className="fixed left-1/2 top-1/2 z-50 flex w-[320px] max-w-[calc(100vw-32px)] -translate-x-1/2 -translate-y-1/2
                   flex-col items-center gap-4 rounded-3xl bg-white px-8 py-10
                   shadow-[0_24px_64px_rgba(13,48,128,0.25)] animate-slide-up"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="코스 생성 중"
      >
        <div className="relative flex h-14 w-14 items-center justify-center">
          <Loader2 className="absolute h-14 w-14 animate-spin text-ocean-200" strokeWidth={2.5} />
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#0d3080] to-[#0a84ff]">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
        </div>
        <div className="text-center">
          <p className="text-[15px] font-bold text-gray-900">AI가 코스를 만들고 있어요</p>
          <p className="mt-1 text-[12px] text-gray-400">잠시만 기다려주세요...</p>
        </div>
        <button
          onClick={onClose}
          className="text-[12px] font-medium text-gray-400 transition-colors hover:text-gray-600"
        >
          취소
        </button>
      </div>
    </>
  );
}
