"use client";

import { createContext, useContext, useState } from "react";
import { AIChatModal } from "@/components/ui/Chat/AIChatModal";

interface OpenChatOptions {
  /**
   * 이미 조건이 다 확정된 요청(예: 검색바 드롭다운)이면 true로 넘긴다.
   * true면 챗봇이 "이대로 만들까요?" 되묻는 확인 단계를 자동으로 통과시켜
   * 사용자가 한 번 더 클릭하지 않아도 되게 한다.
   */
  autoConfirm?: boolean;
}

interface AIChatContextValue {
  isOpen: boolean;
  openChat: (initialMessage?: string, options?: OpenChatOptions) => void;
}

const AIChatContext = createContext<AIChatContextValue | null>(null);

interface AIChatProviderProps {
  children: React.ReactNode;
}

// 홈페이지 내 여러 진입점(FAB, 검색바, 테마 캐러셀)이 채팅 모달과 대화 상태를
// 하나씩 따로 들고 있으면, 한 진입점에서 시작한 대화가 다른 진입점에서 열었을 때
// 사라진 것처럼 보인다. 모달과 상태를 여기 하나로 모아 모든 진입점이 공유한다.
export default function AIChatProvider({ children }: AIChatProviderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [initialMessage, setInitialMessage] = useState("");
  const [autoConfirm, setAutoConfirm] = useState(false);

  const openChat = (message?: string, options?: OpenChatOptions) => {
    setInitialMessage(message ?? "");
    setAutoConfirm(options?.autoConfirm ?? false);
    setIsOpen(true);
  };

  const closeChat = () => {
    setIsOpen(false);
    setInitialMessage("");
    setAutoConfirm(false);
  };

  return (
    <AIChatContext.Provider value={{ isOpen, openChat }}>
      {children}
      <AIChatModal
        isOpen={isOpen}
        onClose={closeChat}
        initialMessage={initialMessage}
        autoConfirm={autoConfirm}
      />
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
