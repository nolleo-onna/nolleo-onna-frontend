"use client";

import { Suspense, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";

import TicketCard from "@/features/auth/LoginTicket/TicketCard";

interface LoginTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * 로그인 표를 지금 보던 화면 위에 띄운다. 뒤 화면은 어둡게 덮고 흐리게 한다.
 * 헤더 로그인 버튼이 이 모달을 연다 — 페이지를 옮기지 않아 로그인 뒤 보던 자리로 돌아오기 쉽다.
 * (세션이 만료돼 보내지는 경우나 /login 주소를 직접 열었을 때를 위해 페이지도 그대로 둔다)
 */
export default function LoginTicketModal({ isOpen, onClose }: LoginTicketModalProps) {
  // 모달이 떠 있는 동안 Esc로 닫고, 뒤 화면은 스크롤되지 않게 한다
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="로그인"
          className="fixed inset-0 z-[60] flex items-center justify-center px-5 py-10"
        >
          <motion.button
            type="button"
            aria-label="닫기"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="absolute inset-0 bg-navy-900/70 backdrop-blur-md"
          />

          <motion.div
            // 표를 뽑아 올리듯 아래에서 살짝 기울어진 채로 떠오른다
            initial={{ opacity: 0, y: 40, rotate: -2, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="relative flex w-full max-w-sm justify-center sm:max-w-[780px]"
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="닫기"
              className="absolute -top-11 right-0 flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white ring-1 ring-inset ring-white/25 transition-colors hover:bg-white/25"
            >
              <X className="h-4 w-4" />
            </button>

            {/* useSearchParams(returnUrl·세션 만료 안내)를 쓰므로 Suspense 필요 */}
            <Suspense fallback={null}>
              <TicketCard />
            </Suspense>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
