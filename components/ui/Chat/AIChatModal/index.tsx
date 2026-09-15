// components/ui/Chat/AIChatModal/index.tsx
'use client';

import { useEffect, useRef, KeyboardEvent } from 'react';
import { ArrowUp, Check, X } from 'lucide-react';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import { MAX_INPUT_LENGTH } from '@/hooks/useAIChat';
import { backdropMotion, launchContent, launchPanel } from '@/components/ui/Chat/launchMotion';
import type { ChatMessage } from '@/hooks/useAIChat';
import AssistantAvatar from '@/components/ui/Chat/AssistantAvatar';
import { ASSISTANT_NAME, ASSISTANT_TAGLINE } from '@/constants/assistant';

const INPUT_LINE = 22;
const INPUT_MAX = 88;
const EASE_OUT = [0.22, 1, 0.36, 1] as const;
/** 말풍선이 보낸 쪽 아래 모서리에서 톡 튀어나오는 스프링 */
const BUBBLE_SPRING = { type: 'spring', stiffness: 520, damping: 34, mass: 0.7 } as const;

// 처음 열었을 때 눌러서 입력창에 바로 채우는 예시 — 지역·동행·분위기·예산이 골고루 들어가게
const SUGGESTIONS = [
  '광안리에서 연인이랑 야경 보는 코스 짜줘',
  '친구랑 서면 반나절, 5만원 안쪽으로',
  '비 오는 날 아이랑 실내 위주로 놀 곳',
];

// ── 첫 화면 — Siri처럼 가운데 인사와 눌러 쓰는 예시 ─────────────────────────
function Intro({ onPick }: { onPick: (text: string) => void }) {
  return (
    <div className="flex flex-col items-center px-1 pb-2 pt-7 text-center">
      <div className="relative">
        <motion.span
          aria-hidden
          className="absolute -inset-3 rounded-full bg-ocean-400/30 blur-xl"
          animate={{ opacity: [0.45, 1, 0.45], scale: [0.94, 1.08, 0.94] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
        />
        <AssistantAvatar size={60} className="relative" />
      </div>
      <p className="mt-4 text-[22px] font-bold tracking-tight text-gray-900">안녕하세요, {ASSISTANT_NAME}예요</p>
      <p className="mt-1.5 text-[14px] leading-relaxed text-gray-500 break-keep">
        어디서 누구와 어떻게 놀고 싶은지 말해주면
        <br />
        부산 코스를 대화로 짜드려요
      </p>
      <div className="mt-6 flex w-full flex-col gap-2">
        {SUGGESTIONS.map((text, i) => (
          <motion.button
            key={text}
            type="button"
            onClick={() => onPick(text)}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18 + i * 0.06, duration: 0.35, ease: EASE_OUT }}
            className="group flex w-full items-center justify-between gap-3 rounded-2xl bg-black/[0.04] px-4 py-3 text-left text-[14px] text-gray-800 transition-colors hover:bg-black/[0.07] active:bg-black/[0.09]"
          >
            <span className="min-w-0 truncate">{text}</span>
            <ArrowUp className="h-4 w-4 shrink-0 rotate-45 text-gray-400 transition-colors group-hover:text-ocean-500" />
          </motion.button>
        ))}
      </div>
      <p className="mt-4 text-[12px] text-gray-400 break-keep">지역은 꼭 알려주세요 · 예산·동행·분위기를 더하면 더 정확해요</p>
    </div>
  );
}

// ── 말풍선 — iMessage처럼 내 말은 파랑, 온나는 회색, 이어진 말풍선의 마지막에만 꼬리 ──
function MessageBubble({
  role,
  content,
  status,
  continued,
  tail,
}: {
  role: 'user' | 'assistant';
  content: string;
  status?: string;
  /** 바로 앞 말풍선과 같은 사람이면 붙여서 한 덩어리로 */
  continued: boolean;
  /** 같은 사람이 이어 보낸 말풍선 중 마지막이면 꼬리 모서리 */
  tail: boolean;
}) {
  const isUser = role === 'user';
  const isCompleted = status === 'COMPLETED';
  const tone = isUser
    ? 'bg-ocean-500 text-white'
    : isCompleted
      ? 'bg-ocean-50 text-gray-900 ring-1 ring-inset ring-ocean-100'
      : status === 'OFF_TOPIC'
        ? 'bg-amber-50 text-gray-800'
        : status === 'LIMIT_EXCEEDED'
          ? 'bg-orange-50 text-gray-800'
          : 'bg-[#e9e9eb] text-gray-900';
  const tailCorner = tail ? (isUser ? 'rounded-br-[6px]' : 'rounded-bl-[6px]') : '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={BUBBLE_SPRING}
      style={{ transformOrigin: isUser ? 'bottom right' : 'bottom left' }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} ${continued ? 'mt-[3px]' : 'mt-3'}`}
    >
      <div className={`max-w-[78%] break-words rounded-[20px] px-3.5 py-2 text-[15px] leading-[1.45] ${tailCorner} ${tone}`}>
        {isCompleted && (
          <p className="mb-0.5 flex items-center gap-1 text-[12px] font-semibold text-ocean-600">
            <Check className="h-3.5 w-3.5" strokeWidth={3} />
            코스 완성
          </p>
        )}
        {content.split('\n').map((line, i) => (
          <p key={i}>{line || <br />}</p>
        ))}
      </div>
    </motion.div>
  );
}

// ── 답을 쓰는 중 — 회색 말풍선 안에서 점 세 개가 차례로 깜빡인다 ────────────────
function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={BUBBLE_SPRING}
      style={{ transformOrigin: 'bottom left' }}
      className="mt-3 flex justify-start"
      role="status"
      aria-label={`${ASSISTANT_NAME}가 답을 쓰고 있어요`}
    >
      <div className="flex items-center gap-1 rounded-[20px] rounded-bl-[6px] bg-[#e9e9eb] px-4 py-3">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="h-2 w-2 rounded-full bg-gray-400"
            animate={{ opacity: [0.35, 1, 0.35], scale: [0.85, 1, 0.85] }}
            transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.18, ease: 'easeInOut' }}
          />
        ))}
      </div>
    </motion.div>
  );
}

// ── Props ─────────────────────────────────────────────────────────────────────
// 채팅 상태(useAIChat)는 AIChatProvider가 소유하고, 이 컴포넌트는 그 상태를
// props로 받아 그리기만 한다 — quick 모드에서는 아예 렌더되지 않아도 상태는
// 유지돼야 하기 때문에 상태 소유권을 Provider로 올렸다.
export interface AIChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** 열릴 때 입력창에 미리 채워줄 메시지 */
  initialMessage?: string;
  messages: ChatMessage[];
  inputValue: string;
  setInputValue: (v: string) => void;
  isLoading: boolean;
  isAwaitingConfirmation: boolean;
  completedPairId: string | null;
  inputError: string | null;
  sendMessage: (text: string, opts?: { skipGuards?: boolean }) => Promise<boolean>;
  sendConfirmation: () => Promise<void>;
  reset: () => void;
}

// ── 메인 컴포넌트 ─────────────────────────────────────────────────────────────
export function AIChatModal({
  isOpen,
  onClose,
  initialMessage,
  messages,
  inputValue,
  setInputValue,
  isLoading,
  isAwaitingConfirmation,
  completedPairId,
  inputError,
  sendMessage,
  sendConfirmation,
  reset,
}: AIChatModalProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // 열릴 때 initialMessage prefill + 포커스
  useEffect(() => {
    if (!isOpen) return;

    // initialMessage가 없어도 항상 반영해야, 이전에 열었을 때 prefill됐던 텍스트가
    // "빈 채팅"으로 다시 열 때 그대로 남아있는 걸 막을 수 있다.
    setInputValue(initialMessage ?? '');

    const timer = setTimeout(() => {
      const el = inputRef.current;
      if (!el) return;
      // 모달이 아직 누른 자리에서 커져 오는 중이라, 포커스가 페이지를 그 위치로 스크롤하지 않게 막는다
      el.focus({ preventScroll: true });
      // 커서를 텍스트 끝으로
      el.setSelectionRange(el.value.length, el.value.length);
      // 높이 자동 조정
      el.style.height = `${INPUT_LINE}px`;
      el.style.height = `${Math.min(el.scrollHeight, INPUT_MAX)}px`;
    }, 100);

    return () => clearTimeout(timer);
  }, [isOpen, initialMessage, setInputValue]);

  // 새 메시지 자동 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // ESC로 닫기
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  const handleSend = async () => {
    const text = inputValue.trim();
    if (!text || isLoading) return;
    const sent = await sendMessage(text);
    // 쿨다운 등으로 실제 전송이 거부된 경우엔 입력한 텍스트가 남아있으니
    // textarea 높이를 건드리지 않는다 (건드리면 여러 줄 입력이 잘려 보임).
    if (sent && inputRef.current) {
      inputRef.current.style.height = `${INPUT_LINE}px`;
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleReset = () => {
    reset();
    if (inputRef.current) {
      inputRef.current.style.height = `${INPUT_LINE}px`;
      inputRef.current.focus();
    }
  };

  const handlePick = (text: string) => {
    setInputValue(text);
    requestAnimationFrame(() => {
      const el = inputRef.current;
      if (!el) return;
      el.focus({ preventScroll: true });
      el.setSelectionRange(text.length, text.length);
      el.style.height = `${INPUT_LINE}px`;
      el.style.height = `${Math.min(el.scrollHeight, INPUT_MAX)}px`;
    });
  };

  const canSend = !!inputValue.trim() && !isLoading && !completedPairId;

  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence>
        {isOpen && (
          <div key="ai-chat-layer">
            {/* 오버레이 — 어두워지며 흐려진다 */}
            <motion.div className="fixed inset-0 z-40 bg-black/25" {...backdropMotion} onClick={onClose} />

            {/* 모달 — 방금 누른 버튼 자리에서 커져 나와 가운데에 자리 잡고, 닫으면 그 자리로 돌아간다 */}
            <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
              <motion.div
                className="pointer-events-auto flex h-[640px] max-h-[calc(100dvh-24px)] w-[420px] max-w-[calc(100vw-24px)] flex-col overflow-hidden rounded-[28px] bg-white/85 shadow-[0_30px_80px_-20px_rgba(5,12,26,0.45)] ring-1 ring-black/[0.06] backdrop-blur-2xl backdrop-saturate-150"
                variants={launchPanel}
                initial="from"
                animate="open"
                exit="back"
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-label={`${ASSISTANT_NAME} — ${ASSISTANT_TAGLINE}`}
              >
                {/* ── 헤더 — iOS 대화 상단처럼 가운데 프로필, 왼쪽 새 대화, 오른쪽 둥근 닫기 ── */}
                <motion.div
                  custom={0}
                  variants={launchContent}
                  className="relative flex shrink-0 flex-col items-center border-b border-black/[0.06] px-16 pb-2.5 pt-3"
                >
                  {messages.length > 0 && (
                    <button
                      type="button"
                      onClick={handleReset}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-[14px] font-medium text-ocean-500 transition-colors hover:text-ocean-600"
                    >
                      새 대화
                    </button>
                  )}
                  <AssistantAvatar size={34} />
                  <p className="mt-1 text-[13px] font-semibold leading-none text-gray-900">{ASSISTANT_NAME}</p>
                  <p className="mt-1 text-[11px] leading-none text-gray-400">{ASSISTANT_TAGLINE}</p>
                  <button
                    type="button"
                    onClick={onClose}
                    aria-label="닫기"
                    className="absolute right-3.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/[0.05] text-gray-500 transition-colors hover:bg-black/[0.09] hover:text-gray-700"
                  >
                    <X className="h-4 w-4" strokeWidth={2.5} />
                  </button>
                </motion.div>

                {/* ── 대화 ── */}
                <motion.div custom={1} variants={launchContent} className="flex-1 overflow-y-auto px-4 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {messages.length === 0 ? (
                    <Intro onPick={handlePick} />
                  ) : (
                    <p className="pt-3 text-center text-[11px] font-medium text-gray-400">{ASSISTANT_NAME}와의 대화</p>
                  )}

                  {messages.map((msg, i) => (
                    <MessageBubble
                      key={msg.id}
                      role={msg.role}
                      content={msg.content}
                      status={msg.status}
                      continued={messages[i - 1]?.role === msg.role}
                      tail={messages[i + 1]?.role !== msg.role}
                    />
                  ))}

                  {isLoading && <TypingIndicator />}

                  {/* 확인 단계 — iOS 액션처럼 나란한 알약 버튼 */}
                  {isAwaitingConfirmation && !isLoading && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, ease: EASE_OUT }}
                      className="mt-4 flex gap-2"
                    >
                      <button
                        type="button"
                        onClick={handleReset}
                        className="flex-1 rounded-full bg-black/[0.05] py-2.5 text-[14px] font-semibold text-gray-700 transition-colors hover:bg-black/[0.08] active:bg-black/[0.1]"
                      >
                        처음부터 다시
                      </button>
                      <button
                        type="button"
                        onClick={sendConfirmation}
                        className="flex-[1.4] rounded-full bg-ocean-500 py-2.5 text-[14px] font-semibold text-white shadow-[0_8px_18px_-8px_rgba(10,132,255,0.8)] transition-colors hover:bg-ocean-600"
                      >
                        이대로 코스 만들기
                      </button>
                    </motion.div>
                  )}

                  <div ref={messagesEndRef} />
                </motion.div>

                {/* ── 입력 — iMessage처럼 둥근 입력칸 안에 위쪽 화살표 보내기 ── */}
                <motion.div custom={2} variants={launchContent} className="shrink-0 border-t border-black/[0.06] bg-white/60 px-3 pb-2.5 pt-2.5">
                  <div className="flex items-end gap-2 rounded-[22px] bg-white py-1.5 pl-4 pr-1.5 ring-1 ring-black/10 transition-shadow focus-within:shadow-[0_0_0_4px_rgba(10,132,255,0.12)] focus-within:ring-ocean-500/50">
                    <textarea
                      ref={inputRef}
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={`${ASSISTANT_NAME}에게 메시지 보내기`}
                      aria-label={`${ASSISTANT_NAME}에게 메시지 (Enter 보내기, Shift+Enter 줄바꿈)`}
                      rows={1}
                      maxLength={MAX_INPUT_LENGTH}
                      disabled={isLoading || !!completedPairId}
                      className="min-w-0 flex-1 resize-none self-center bg-transparent py-[3px] text-[15px] text-gray-900 outline-none placeholder:text-gray-400 disabled:opacity-50"
                      style={{ lineHeight: `${INPUT_LINE}px`, height: `${INPUT_LINE}px`, maxHeight: `${INPUT_MAX}px` }}
                      onInput={(e) => {
                        const el = e.currentTarget;
                        el.style.height = `${INPUT_LINE}px`;
                        el.style.height = `${Math.min(el.scrollHeight, INPUT_MAX)}px`;
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleSend}
                      disabled={!canSend}
                      aria-label="메시지 보내기"
                      className={`flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full text-white transition-[background-color,transform] duration-150 active:scale-90 disabled:cursor-not-allowed ${
                        canSend ? 'bg-ocean-500 hover:bg-ocean-600' : 'bg-black/[0.12]'
                      }`}
                    >
                      <ArrowUp className="h-[18px] w-[18px]" strokeWidth={2.75} />
                    </button>
                  </div>

                  {/* 오류 · 안내 · 글자 수 */}
                  <div className="mt-1.5 flex min-h-[14px] items-center justify-center gap-2 px-2">
                    <p className={`text-[11px] ${inputError ? 'font-medium text-red-500' : 'text-gray-400'}`}>
                      {inputError ?? `${ASSISTANT_NAME}(AI)의 답변은 정확하지 않을 수 있어요`}
                    </p>
                    {inputValue.length > MAX_INPUT_LENGTH * 0.7 && (
                      <span
                        className={`text-[11px] tabular-nums ${inputValue.length >= MAX_INPUT_LENGTH ? 'text-red-500' : 'text-gray-400'}`}
                      >
                        {inputValue.length}/{MAX_INPUT_LENGTH}
                      </span>
                    )}
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </MotionConfig>
  );
}
