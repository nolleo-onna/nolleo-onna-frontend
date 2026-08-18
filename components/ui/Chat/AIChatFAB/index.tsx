"use client";

import { useState, useEffect } from "react";
import { MessageCircle, X } from "lucide-react";
import { useAIChatContext } from "@/providers/AIChatProvider";

const HINT_MESSAGES = [
  "어디로 갈지 고민되나요?",
  "AI가 코스를 짜드려요!",
  "부산 여행 계획 세워볼까요?",
];

const HINT_SHOW_DELAY = 2000;   // 진입 후 힌트 노출까지
const HINT_HIDE_DELAY = 6000;   // 힌트 유지 시간

export default function AIChatFAB() {
  const { openChat } = useAIChatContext();
  const [showHint, setShowHint] = useState(false);
  const [hintDismissed, setHintDismissed] = useState(false);
  // 서버/클라이언트 첫 렌더에서 같은 값이어야 하므로 랜덤 선택은 마운트 후에만 한다
  // (Math.random()을 초기 상태로 쓰면 하이드레이션 시 텍스트 불일치 경고가 뜬다).
  const [hintIndex, setHintIndex] = useState(0);

  // 힌트 자동 노출 → 자동 숨김 (한 번만)
  useEffect(() => {
    if (hintDismissed) return;

    /* eslint-disable-next-line react-hooks/set-state-in-effect -- 마운트 후에만 랜덤값을 정해야 하이드레이션 불일치가 안 생김 */
    setHintIndex(Math.floor(Math.random() * HINT_MESSAGES.length));
    const showTimer = setTimeout(() => setShowHint(true), HINT_SHOW_DELAY);
    const hideTimer = setTimeout(() => {
      setShowHint(false);
      setHintDismissed(true);
    }, HINT_SHOW_DELAY + HINT_HIDE_DELAY);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [hintDismissed]);

  const handleOpen = () => {
    openChat();
    setShowHint(false);
    setHintDismissed(true);
  };

  const handleDismissHint = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowHint(false);
    setHintDismissed(true);
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-30 flex items-center gap-2.5">
        {/* 말풍선 힌트 */}
        <div
          className={`
            flex items-center gap-2 rounded-2xl border border-gray-100 bg-white
            px-4 py-2.5 shadow-[0_4px_18px_rgba(13,48,128,0.12)]
            transition-all duration-300
            ${showHint
              ? "translate-x-0 opacity-100"
              : "pointer-events-none translate-x-4 opacity-0"
            }
          `}
        >
          <p className="whitespace-nowrap text-[13px] font-medium text-gray-700">
            {HINT_MESSAGES[hintIndex]}
          </p>
          <button
            onClick={handleDismissHint}
            aria-label="힌트 닫기"
            className="rounded-md p-0.5 text-gray-300 transition-colors hover:bg-gray-50 hover:text-gray-500"
          >
            <X className="h-3 w-3" />
          </button>
        </div>

        {/* 원형 버튼 */}
        <button
          onClick={handleOpen}
          aria-label="AI 코스 메이커 열기"
          className="flex h-14 w-14 flex-shrink-0 items-center justify-center
                     rounded-full bg-gradient-to-br from-[#34a6ff] to-[#0a84ff]
                     shadow-[0_6px_20px_rgba(10,132,255,0.40)]
                     transition-all duration-200
                     hover:shadow-[0_8px_26px_rgba(10,132,255,0.52)]
                     hover:brightness-105 hover:scale-105 active:scale-95"
        >
          <MessageCircle className="h-6 w-6 text-white" />
        </button>
      </div>
    </>
  );
}