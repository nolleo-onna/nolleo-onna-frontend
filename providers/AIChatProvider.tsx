"use client";

import { createContext, useContext, useState } from "react";
import { AIChatModal } from "@/components/ui/Chat/AIChatModal";

interface AIChatContextValue {
  isOpen: boolean;
  openChat: (initialMessage?: string) => void;
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

  const openChat = (message?: string) => {
    setInitialMessage(message ?? "");
    setIsOpen(true);
  };

  const closeChat = () => {
    setIsOpen(false);
    setInitialMessage("");
  };

  return (
    <AIChatContext.Provider value={{ isOpen, openChat }}>
      {children}
      <AIChatModal isOpen={isOpen} onClose={closeChat} initialMessage={initialMessage} />
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
