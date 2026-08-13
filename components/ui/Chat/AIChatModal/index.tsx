// components/ui/Chat/AIChatModal/index.tsx
'use client';

import { useCallback, useEffect, useRef, KeyboardEvent } from 'react';
import { useRouter } from 'next/navigation';
import { X, Send, RotateCcw, Sparkles, MapPin, Wallet, Users, Palette } from 'lucide-react';
import { useAIChat, MAX_INPUT_LENGTH } from '@/hooks/useAIChat';

// ── 인트로 카드 ───────────────────────────────────────────────────────────────
const INTRO_ITEMS = [
  { Icon: MapPin, label: '지역', desc: '해운대, 광안리...', required: true },
  { Icon: Wallet, label: '예산', desc: '10만원 이내 등' },
  { Icon: Users, label: '동행', desc: '커플, 친구, 혼자' },
  { Icon: Palette, label: '분위기', desc: '힙한, 로맨틱...' },
];

function IntroMessage() {
  return (
    <div className="flex gap-2.5">
      <div className="flex-shrink-0 w-7 h-7 mt-0.5 rounded-full bg-gradient-to-br from-[#0d3080] to-[#0a84ff] flex items-center justify-center shadow-sm">
        <Sparkles className="w-3.5 h-3.5 text-white" />
      </div>

      <div className="bg-white rounded-2xl rounded-tl-md px-4 py-4 shadow-[0_2px_12px_rgba(13,48,128,0.06)] max-w-[88%] space-y-3">
        <div>
          <p className="font-bold text-[#0d3080] text-[14px] leading-snug">
            안녕하세요! 부산 여행 코스를<br />대화로 만들어드려요 🧳
          </p>
          <p className="text-[11px] text-gray-400 mt-1">
            아래 내용을 편하게 말씀해주세요
          </p>
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          {INTRO_ITEMS.map(({ Icon, label, desc, required }) => (
            <div
              key={label}
              className="flex items-center gap-2 bg-gradient-to-br from-[#f6f8ff] to-[#eaf6ff] rounded-xl px-2.5 py-2 border border-gray-100/80"
            >
              <div className="flex-shrink-0 w-6 h-6 rounded-lg bg-white shadow-sm flex items-center justify-center">
                <Icon className="w-3 h-3 text-[#0d3080]" />
              </div>
              <div className="min-w-0">
                <span className="text-[11px] font-semibold text-gray-700 leading-none">
                  {label}
                  {required && <span className="text-[#0a84ff] ml-0.5">*</span>}
                </span>
                <p className="text-[10px] text-gray-400 leading-tight truncate">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="text-[11px] text-gray-400 leading-relaxed">
          &ldquo;부산 여행 코스 짜줘&rdquo;처럼 편하게 시작하세요!
        </p>
      </div>
    </div>
  );
}

// ── 메시지 버블 ───────────────────────────────────────────────────────────────
function MessageBubble({
  role,
  content,
  status,
}: {
  role: 'user' | 'assistant';
  content: string;
  status?: string;
}) {
  const isUser = role === 'user';
  const isCompleted = status === 'COMPLETED';
  const isOffTopic = status === 'OFF_TOPIC';
  const isLimitExceeded = status === 'LIMIT_EXCEEDED';

  return (
    <div className={`flex gap-2.5 ${isUser ? 'flex-row-reverse' : ''}`}>
      {!isUser && (
        <div className="flex-shrink-0 w-7 h-7 mt-0.5 rounded-full bg-gradient-to-br from-[#0d3080] to-[#0a84ff] flex items-center justify-center shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-white" />
        </div>
      )}
      <div
        className={`
          max-w-[78%] px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed
          ${isUser
            ? 'bg-gradient-to-br from-[#0d3080] to-[#2456d6] text-white rounded-tr-md shadow-[0_2px_8px_rgba(13,48,128,0.25)]'
            : isCompleted
              ? 'bg-gradient-to-br from-[#eaf6ff] to-[#f5fbff] border border-[#0a84ff]/20 text-gray-800 rounded-tl-md shadow-[0_2px_12px_rgba(10,132,255,0.12)]'
              : isOffTopic
                ? 'bg-[#fffbf0] border border-amber-200/50 text-gray-600 rounded-tl-md shadow-sm'
                : isLimitExceeded
                  ? 'bg-orange-50 border border-orange-200/50 text-gray-700 rounded-tl-md shadow-sm'
                  : 'bg-white text-gray-700 rounded-tl-md shadow-[0_2px_12px_rgba(13,48,128,0.06)]'
          }
        `}
      >
        {isCompleted && (
          <p className="text-[#0a84ff] font-bold text-[11px] mb-1 flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> 코스 생성 완료!
          </p>
        )}
        {content.split('\n').map((line, i) => (
          <p key={i}>{line || <br />}</p>
        ))}
      </div>
    </div>
  );
}

// ── 타이핑 인디케이터 ─────────────────────────────────────────────────────────
function TypingIndicator() {
  return (
    <div className="flex gap-2.5">
      <div className="flex-shrink-0 w-7 h-7 mt-0.5 rounded-full bg-gradient-to-br from-[#0d3080] to-[#0a84ff] flex items-center justify-center shadow-sm">
        <Sparkles className="w-3.5 h-3.5 text-white" />
      </div>
      <div className="bg-white rounded-2xl rounded-tl-md px-4 py-3 shadow-[0_2px_12px_rgba(13,48,128,0.06)] flex items-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-1.5 h-1.5 rounded-full animate-bounce"
            style={{
              animationDelay: `${i * 0.15}s`,
              background: 'linear-gradient(135deg, #0d3080, #0a84ff)',
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ── Props ─────────────────────────────────────────────────────────────────────
export interface AIChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** 열릴 때 입력창에 미리 채워줄 메시지 */
  initialMessage?: string;
}

// ── 메인 컴포넌트 ─────────────────────────────────────────────────────────────
export function AIChatModal({ isOpen, onClose, initialMessage }: AIChatModalProps) {
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const {
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
  } = useAIChat();

  // 코스 생성 완료 후 자동 리다이렉트 전에 수동으로 닫으면, completedPairId가 남아있는 채로
  // 다음에 다시 열렸을 때 입력창/전송 버튼이 이유 없이 비활성화된 상태가 된다.
  // 대화가 이미 완료된 상태라 다음 오픈은 새 대화로 시작하는 게 자연스러워 reset한다.
  const handleClose = useCallback(() => {
    if (completedPairId) reset();
    onClose();
  }, [completedPairId, reset, onClose]);

  // 열릴 때 initialMessage prefill + 포커스
  useEffect(() => {
    if (!isOpen) return;

    // initialMessage가 없어도 항상 반영해야, 이전에 열었을 때 prefill됐던 텍스트가
    // "빈 채팅"으로 다시 열 때 그대로 남아있는 걸 막을 수 있다.
    setInputValue(initialMessage ?? '');

    const timer = setTimeout(() => {
      const el = inputRef.current;
      if (!el) return;
      el.focus();
      // 커서를 텍스트 끝으로
      el.setSelectionRange(el.value.length, el.value.length);
      // 높이 자동 조정
      el.style.height = '22px';
      el.style.height = `${Math.min(el.scrollHeight, 88)}px`;
    }, 100);

    return () => clearTimeout(timer);
  }, [isOpen, initialMessage, setInputValue]);

  // 새 메시지 자동 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // 코스 생성 완료 → 결과 페이지 이동
  useEffect(() => {
    if (!completedPairId) return;
    const timer = setTimeout(() => {
      onClose();
      router.push(`/course/result?pairId=${completedPairId}`);
    }, 2000);
    return () => clearTimeout(timer);
  }, [completedPairId, onClose, router]);

  // ESC로 닫기
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, handleClose]);

  const handleSend = async () => {
    const text = inputValue.trim();
    if (!text || isLoading) return;
    const sent = await sendMessage(text);
    // 쿨다운 등으로 실제 전송이 거부된 경우엔 입력한 텍스트가 남아있으니
    // textarea 높이를 건드리지 않는다 (건드리면 여러 줄 입력이 잘려 보임).
    if (sent && inputRef.current) {
      inputRef.current.style.height = '22px';
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
      inputRef.current.style.height = '22px';
      inputRef.current.focus();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* 오버레이 */}
      <div
        className="fixed inset-0 bg-[#0d3080]/20 backdrop-blur-[3px] z-40 animate-fade-in"
        onClick={handleClose}
      />

      {/* 모달 */}
      <div
        className="fixed z-50 left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-[440px] max-w-[calc(100vw-32px)] h-[600px] max-h-[calc(100vh-48px)] flex flex-col rounded-[20px] overflow-hidden shadow-[0_24px_64px_rgba(13,48,128,0.25)] animate-slide-up"
        style={{ background: '#F7F8FC' }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="AI 코스 메이커"
      >
        {/* ── 헤더 ── */}
        <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 bg-gradient-to-r from-[#0d3080] via-[#1a44b8] to-[#2456d6]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center backdrop-blur">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-[13px] leading-none">AI 코스 메이커</p>
              <p className="text-white/50 text-[10px] mt-1">부산 여행 코스를 대화로!</p>
            </div>
          </div>

          <div className="flex items-center gap-0.5">
            {messages.length > 0 && (
              <button
                onClick={handleReset}
                className="p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                title="새 대화"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={handleClose}
              aria-label="닫기"
              className="p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── 메시지 목록 ── */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3.5">
          <IntroMessage />

          {messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              role={msg.role}
              content={msg.content}
              status={msg.status}
            />
          ))}

          {isLoading && <TypingIndicator />}

          {/* 확인 단계 액션 버튼 */}
          {isAwaitingConfirmation && !isLoading && (
            <div className="flex justify-center gap-2 pt-1">
              <button
                onClick={handleReset}
                className="px-4 py-2 rounded-full text-[12px] font-semibold text-gray-500 bg-white border border-gray-200 shadow-sm hover:bg-gray-50 hover:text-gray-700 active:scale-95 transition-all duration-150"
              >
                🔄 처음부터 다시
              </button>
              <button
                onClick={sendConfirmation}
                className="px-4 py-2 rounded-full text-[12px] font-bold bg-gradient-to-r from-[#34a6ff] to-[#0a84ff] text-white shadow-[0_4px_14px_rgba(10,132,255,0.4)] hover:shadow-[0_6px_20px_rgba(10,132,255,0.5)] hover:brightness-105 active:scale-95 transition-all duration-150"
              >
                ✨ 네, 이대로 만들어주세요!
              </button>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ── 입력창 ── */}
        <div className="flex-shrink-0 px-3 pb-3 pt-2" style={{ background: '#F7F8FC' }}>
          <div className="flex items-center gap-2 bg-white rounded-2xl px-4 py-2.5 shadow-[0_2px_12px_rgba(13,48,128,0.08)] border border-gray-100 focus-within:border-[#0d3080]/30 focus-within:shadow-[0_2px_16px_rgba(13,48,128,0.12)] transition-all">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="무엇이든 물어보세요 (Shift+Enter 줄바꿈)"
              rows={1}
              maxLength={MAX_INPUT_LENGTH}
              disabled={isLoading || !!completedPairId}
              className="flex-1 resize-none outline-none text-[14px] text-gray-800 placeholder:text-gray-400 bg-transparent disabled:opacity-50 self-center"
              style={{ lineHeight: '22px', height: '22px', maxHeight: '88px' }}
              onInput={(e) => {
                const el = e.currentTarget;
                el.style.height = '22px';
                el.style.height = `${Math.min(el.scrollHeight, 88)}px`;
              }}
            />
            <button
              onClick={handleSend}
              disabled={!inputValue.trim() || isLoading || !!completedPairId}
              aria-label="메시지 전송"
              className="flex-shrink-0 w-8 h-8 rounded-xl bg-gradient-to-br from-[#0d3080] to-[#2456d6] flex items-center justify-center text-white shadow-[0_2px_8px_rgba(13,48,128,0.3)] hover:brightness-110 active:scale-90 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-150 self-end"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 에러 / 글자수 / 안내 */}
          <div className="flex items-center justify-between mt-1.5 px-1.5 min-h-[14px]">
            <p className={`text-[10px] ${inputError ? 'text-red-400 font-medium' : 'text-gray-400'}`}>
              {inputError ?? 'AI 답변은 정확하지 않을 수 있어요.'}
            </p>
            {inputValue.length > MAX_INPUT_LENGTH * 0.7 && (
              <span
                className={`text-[10px] tabular-nums ${
                  inputValue.length >= MAX_INPUT_LENGTH ? 'text-red-400' : 'text-gray-400'
                }`}
              >
                {inputValue.length}/{MAX_INPUT_LENGTH}
              </span>
            )}
          </div>
        </div>
      </div>
    </>
  );
}