'use client';

import { useState, useCallback, useRef } from 'react';

export type MessageRole = 'user' | 'assistant';
export type ChatStatus = 'NEED_MORE_INFO' | 'COMPLETED' | 'OFF_TOPIC' | 'LIMIT_EXCEEDED';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  status?: ChatStatus;
  pairId?: string;
}

interface ChatResponse {
  status: ChatStatus;
  reply: string;
  conversationId: string;
  pairId?: string;
}

interface UseAIChatReturn {
  messages: ChatMessage[];
  conversationId: string | null;
  isLoading: boolean;
  isAwaitingConfirmation: boolean;
  completedPairId: string | null;
  inputError: string | null;
  sendMessage: (text: string, opts?: { skipGuards?: boolean }) => Promise<void>;
  sendConfirmation: () => Promise<void>;
  reset: () => void;
}

export const MAX_INPUT_LENGTH = 200;
const COOLDOWN_MS = 800;
const MAX_OFF_TOPIC_STREAK = 3;

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';

export function useAIChat(): UseAIChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAwaitingConfirmation, setIsAwaitingConfirmation] = useState(false);
  const [completedPairId, setCompletedPairId] = useState<string | null>(null);
  const [inputError, setInputError] = useState<string | null>(null);

  const lastSentTextRef = useRef<string>('');
  const lastSentAtRef = useRef<number>(0);
  const offTopicStreakRef = useRef<number>(0);

  const addMessage = useCallback(
    (role: MessageRole, content: string, extra?: Partial<ChatMessage>) => {
      const msg: ChatMessage = {
        id: `${Date.now()}-${Math.random()}`,
        role,
        content,
        ...extra,
      };
      setMessages((prev) => [...prev, msg]);
      return msg;
    },
    [],
  );

  const sendMessage = useCallback(
    async (text: string, opts?: { skipGuards?: boolean }) => {
      const trimmed = text.trim();
      if (!trimmed || isLoading) return;

      if (!opts?.skipGuards) {
        if (trimmed.length > MAX_INPUT_LENGTH) {
          setInputError(`메시지는 ${MAX_INPUT_LENGTH}자 이내로 입력해주세요.`);
          return;
        }

        const now = Date.now();
        if (now - lastSentAtRef.current < COOLDOWN_MS) {
          setInputError('조금 천천히 보내주세요 🙏');
          return;
        }

        if (trimmed === lastSentTextRef.current && trimmed !== '코스 생성 시작') {
          setInputError('방금 보낸 메시지와 같아요. 다른 내용을 입력해주세요.');
          return;
        }
      }

      setInputError(null);
      lastSentTextRef.current = trimmed;
      lastSentAtRef.current = Date.now();

      addMessage('user', trimmed);
      setIsLoading(true);

      try {
        const res = await fetch(`${API_BASE}/api/v1/courses/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            message: trimmed,
            conversationId: conversationId ?? null,
          }),
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const json = await res.json();
        const data: ChatResponse = json.data ?? json;

        if (data.conversationId) setConversationId(data.conversationId);

        if (data.status === 'OFF_TOPIC') {
          offTopicStreakRef.current += 1;
          const streak = offTopicStreakRef.current;
          const reply =
            streak >= MAX_OFF_TOPIC_STREAK
              ? '여행 관련 이야기를 해주셔야 코스를 만들어드릴 수 있어요 😅\n예: "해운대 커플 코스 짜줘", "서면에서 5만원으로 놀고 싶어"'
              : data.reply;
          addMessage('assistant', reply, { status: 'OFF_TOPIC' });

        } else if (data.status === 'LIMIT_EXCEEDED') {
          offTopicStreakRef.current = 0;
          addMessage('assistant', data.reply, { status: 'LIMIT_EXCEEDED' });
          setIsAwaitingConfirmation(false);

        } else if (data.status === 'COMPLETED' && data.pairId) {
          offTopicStreakRef.current = 0;
          setCompletedPairId(data.pairId);
          setIsAwaitingConfirmation(false);
          addMessage('assistant', data.reply, { status: 'COMPLETED', pairId: data.pairId });

        } else {
          offTopicStreakRef.current = 0;
          const isConfirmationQuestion =
            data.status === 'NEED_MORE_INFO' && data.reply.includes('코스 생성 시작');
          setIsAwaitingConfirmation(isConfirmationQuestion);
          addMessage('assistant', data.reply, { status: data.status });
        }
      } catch (err) {
        console.error('[useAIChat] API error:', err);
        addMessage('assistant', '일시적인 오류가 발생했어요. 잠시 후 다시 시도해주세요. 🙏');
      } finally {
        setIsLoading(false);
      }
    },
    [addMessage, conversationId, isLoading],
  );

  const sendConfirmation = useCallback(async () => {
    lastSentTextRef.current = '';
    lastSentAtRef.current = 0;
    await sendMessage('코스 생성 시작');
  }, [sendMessage]);

  const reset = useCallback(() => {
    setMessages([]);
    setConversationId(null);
    setIsAwaitingConfirmation(false);
    setCompletedPairId(null);
    setInputError(null);
    lastSentTextRef.current = '';
    lastSentAtRef.current = 0;
    offTopicStreakRef.current = 0;
  }, []);

  return {
    messages,
    conversationId,
    isLoading,
    isAwaitingConfirmation,
    completedPairId,
    inputError,
    sendMessage,
    sendConfirmation,
    reset,
  };
}