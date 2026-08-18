"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAIChat } from "@/hooks/useAIChat";
import { saveCourseBudget } from "@/features/course/utils/budgetStorage";
import { AIChatModal } from "@/components/ui/Chat/AIChatModal";
import QuickGenerateOverlay from "@/components/ui/Chat/QuickGenerateOverlay";

type ViewMode = "chat" | "quick";

interface AIChatContextValue {
  isOpen: boolean;
  /** 대화형 채팅 모달을 연다 (FAB, 테마 카드 등 자유 입력 진입점용) */
  openChat: (initialMessage?: string) => void;
  /** 조건이 이미 확정된 요청을 채팅 UI 없이 바로 생성한다 (검색바 등) */
  generateCourse: (prompt: string, options?: { budget?: number }) => void;
}

const AIChatContext = createContext<AIChatContextValue | null>(null);

interface AIChatProviderProps {
  children: React.ReactNode;
}

// 홈페이지 내 여러 진입점(FAB, 검색바, 테마 캐러셀)이 채팅 모달과 대화 상태를
// 하나씩 따로 들고 있으면, 한 진입점에서 시작한 대화가 다른 진입점에서 열었을 때
// 사라진 것처럼 보인다. useAIChat을 여기 하나로 모아 모든 진입점이 공유한다.
export default function AIChatProvider({ children }: AIChatProviderProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("chat");
  const [initialMessage, setInitialMessage] = useState("");
  const autoConfirmedRef = useRef(false);
  // 검색바에서 확정한 예산 금액. 결과 페이지의 예산 게이지 기준값으로 URL에 실어 보낸다.
  const budgetRef = useRef<number | undefined>(undefined);

  const chat = useAIChat();
  const { messages, isLoading, isAwaitingConfirmation, completedPairId, sendMessage, sendConfirmation, reset } =
    chat;

  const closeChat = () => {
    setIsOpen(false);
    setInitialMessage("");
    // quick 모드는 대화를 다시 볼 일이 없고, 완료된 대화는 다음에 새로 시작하는 게
    // 자연스러워서 reset한다. 진행 중인 자유 대화는 닫아도 이어서 볼 수 있게 유지.
    if (viewMode === "quick" || completedPairId) reset();
    setViewMode("chat");
  };

  const openChat = (message?: string) => {
    setViewMode("chat");
    setInitialMessage(message ?? "");
    // 자유 대화로 만드는 코스는 확정된 예산값이 없다. 이전 quick 생성의 예산이
    // 남아있으면 엉뚱한 게이지가 붙으므로 초기화한다.
    budgetRef.current = undefined;
    setIsOpen(true);
  };

  const generateCourse = (prompt: string, options?: { budget?: number }) => {
    setViewMode("quick");
    setInitialMessage("");
    autoConfirmedRef.current = false;
    budgetRef.current = options?.budget;
    setIsOpen(true);
    sendMessage(prompt);
  };

  // quick 모드에서 "이대로 만들까요?" 확인 대기 상태가 되면 자동으로 확정한다.
  useEffect(() => {
    if (viewMode !== "quick" || !isAwaitingConfirmation || autoConfirmedRef.current) return;
    autoConfirmedRef.current = true;
    sendConfirmation();
  }, [viewMode, isAwaitingConfirmation, sendConfirmation]);

  // quick 모드인데 확인/완료로 못 이어지고 되묻기(정보 부족, 주제 이탈 등)가 필요하면
  // 로딩 오버레이 대신 실제 채팅 UI로 전환해 사용자가 직접 답할 수 있게 한다.
  useEffect(() => {
    if (viewMode !== "quick" || isLoading || isAwaitingConfirmation || completedPairId) return;
    if (messages.length === 0) return;
    if (messages[messages.length - 1]?.role === "assistant") {
      /* eslint-disable-next-line react-hooks/set-state-in-effect -- 서버 응답(비동기 API) 결과에 따라 UI 모드를 바꾸는 것이라 렌더 중엔 알 수 없음 */
      setViewMode("chat");
    }
  }, [viewMode, isLoading, isAwaitingConfirmation, completedPairId, messages]);

  // 코스 생성 완료 → 결과 페이지 이동
  useEffect(() => {
    if (!completedPairId) return;
    // quick 모드는 보여줄 대화 내용이 없어 바로 넘어가고, 채팅 모드는 완료 말풍선을
    // 잠깐 보여준 뒤 이동한다.
    const delay = viewMode === "quick" ? 400 : 2000;
    const timer = setTimeout(() => {
      setIsOpen(false);
      const budget = budgetRef.current;
      if (budget !== undefined) {
        // 코스 목록 등 budget 파라미터 없는 경로로 재진입해도 게이지를
        // 복원할 수 있게 저장해둔다.
        saveCourseBudget(completedPairId, budget);
      }
      const budgetParam = budget !== undefined ? `&budget=${budget}` : "";
      router.push(`/course/result?pairId=${completedPairId}${budgetParam}`);
    }, delay);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completedPairId]);

  return (
    <AIChatContext.Provider value={{ isOpen, openChat, generateCourse }}>
      {children}
      {viewMode === "chat" ? (
        <AIChatModal isOpen={isOpen} onClose={closeChat} initialMessage={initialMessage} {...chat} />
      ) : (
        <QuickGenerateOverlay isOpen={isOpen} onClose={closeChat} />
      )}
    </AIChatContext.Provider>
  );
}

export function useAIChatContext() {
  const ctx = useContext(AIChatContext);
  if (!ctx) {
    throw new Error("useAIChatContext는 AIChatProvider 내부에서만 사용할 수 있습니다.");
  }
  return ctx;
}
