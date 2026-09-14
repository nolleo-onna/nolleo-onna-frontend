'use client';

import { Loader2 } from 'lucide-react';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import AssistantAvatar from '@/components/ui/Chat/AssistantAvatar';
import { backdropMotion, launchContent, launchPanel } from '@/components/ui/Chat/launchMotion';
import { ASSISTANT_NAME } from '@/constants/assistant';

interface QuickGenerateOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

// 검색바처럼 조건이 이미 확정된 요청은 대화형 챗 모달 대신 이 가벼운 로딩
// 오버레이를 보여준다. 실제 생성 로직은 AIChatProvider가 백그라운드에서 처리한다.
// 채팅 모달과 같은 동작으로, 누른 버튼 자리에서 커져 나오고 취소하면 그 자리로 돌아간다.
export default function QuickGenerateOverlay({ isOpen, onClose }: QuickGenerateOverlayProps) {
  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence>
        {isOpen && (
          <div key="quick-generate-layer">
            <motion.div className="fixed inset-0 z-40 bg-[#0d3080]/20" {...backdropMotion} onClick={onClose} />
            <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                className="pointer-events-auto flex w-[320px] max-w-[calc(100vw-32px)] flex-col items-center gap-4 rounded-3xl bg-white px-8 py-10
                           shadow-[0_24px_64px_rgba(13,48,128,0.25)]"
                variants={launchPanel}
                initial="from"
                animate="open"
                exit="back"
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-label="코스 생성 중"
              >
                <motion.div custom={0} variants={launchContent} className="relative flex h-14 w-14 items-center justify-center">
                  <Loader2 className="absolute h-14 w-14 animate-spin text-ocean-200" strokeWidth={2.5} />
                  <AssistantAvatar size={36} />
                </motion.div>
                <motion.div custom={1} variants={launchContent} className="text-center">
                  <p className="text-[15px] font-bold text-gray-900">{ASSISTANT_NAME}가 코스를 짜고 있어요</p>
                  <p className="mt-1 text-[12px] text-gray-400">잠시만 기다려주세요...</p>
                </motion.div>
                <motion.button
                  custom={2}
                  variants={launchContent}
                  onClick={onClose}
                  className="text-[12px] font-medium text-gray-400 transition-colors hover:text-gray-600"
                >
                  취소
                </motion.button>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </MotionConfig>
  );
}
