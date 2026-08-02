'use client';

import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { AIChatModal } from '@/components/ui/Chat/AIChatModal';

// ── 홈 탭 버튼에 연결할 때 쓰는 훅 ──────────────────────────────────────────
export function useAIChatButton() {
  const [isOpen, setIsOpen] = useState(false);

  const openChat = () => setIsOpen(true);
  const closeChat = () => setIsOpen(false);

  const ChatModalSlot = <AIChatModal isOpen={isOpen} onClose={closeChat} />;

  return { openChat, closeChat, ChatModalSlot };
}

// ── 플로팅 FAB (독립 배치용) ──────────────────────────────────────────────────
export function AIChatFAB() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-30 flex items-center gap-2 px-4 py-3 rounded-full bg-gradient-to-r from-[#0d3080] to-[#1a4fc8] text-white text-sm font-semibold shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200"
      >
        <Sparkles className="w-4 h-4" />
        AI에게 말하기
      </button>
      <AIChatModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}