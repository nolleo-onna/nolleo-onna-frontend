"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Loader2 } from "lucide-react";

export interface Suggestion {
  id: string;
  title: string;
  /** 제목 오른쪽에 흐리게 붙는 부가 정보 — 지역명, 행사 기간 등 */
  meta?: string;
  /** 후보 썸네일 — 장소 사진, 행사 포스터 */
  imageUrl?: string | null;
  /** 짧은 분류 — "맛집 · 카페", "행사" 등 */
  badge?: string;
}

interface SuggestFieldProps {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  placeholder: string;
  query: string;
  onQueryChange: (v: string) => void;
  suggestions: Suggestion[];
  isLoading: boolean;
  onPick: (s: Suggestion) => void;
  maxLength: number;
  /** 비활성 사유를 함께 보여준다 (예: 축제를 고르면 지역 칸을 잠근다) */
  disabled?: boolean;
  disabledHint?: string;
  /** 입력칸 아래에 붙는 칩 목록 등 */
  children?: React.ReactNode;
}

/**
 * 이름을 쳐서 후보 중 하나를 고르는 칸.
 * 서버는 입력한 이름이 데이터 제목과 정확히 맞거나 하나만 걸릴 때만 반영하므로,
 * 직접 타이핑한 이름을 그대로 보내기보다 후보에서 고르게 해 unmatched를 줄인다.
 */
export default function SuggestField({
  icon,
  iconBg,
  label,
  placeholder,
  query,
  onQueryChange,
  suggestions,
  isLoading,
  onPick,
  maxLength,
  disabled = false,
  disabledHint,
  children,
}: SuggestFieldProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  // 하나 고르고 나면 목록을 닫는다. 고른 이름이 입력칸에 남는 칸(행사)은 그대로 두면
  // 방금 고른 항목이 계속 떠 있어서 아래 안내를 가린다. 다시 타이핑하면 열린다.
  const [isDismissed, setIsDismissed] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  const isOpen = isFocused && !disabled && !isDismissed && query.trim().length > 0;
  const showEmpty = isOpen && !isLoading && suggestions.length === 0;

  // 후보가 바뀌면 하이라이트를 처음으로 되돌린다. 배열 자체는 렌더마다 새로 만들어질 수
  // 있어 id 목록으로 비교하고, effect 대신 렌더 중에 되돌린다.
  const signature = suggestions.map((s) => s.id).join("|");
  const [prevSignature, setPrevSignature] = useState(signature);
  if (prevSignature !== signature) {
    setPrevSignature(signature);
    setActiveIndex(-1);
  }

  // 바깥을 누르면 후보를 닫는다
  useEffect(() => {
    if (!isFocused) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      // 후보를 누르면 React가 먼저 목록을 지워서, 이 핸들러에 올 때쯤엔 누른 <li>가
      // 문서에서 떨어져 나가 있다. 그대로 contains로 보면 "바깥을 눌렀다"고 오해한다.
      if (!target.isConnected) return;
      if (!wrapRef.current?.contains(target)) setIsFocused(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isFocused]);

  const pick = (s: Suggestion) => {
    onPick(s);
    setActiveIndex(-1);
    setIsDismissed(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      pick(suggestions[activeIndex >= 0 ? activeIndex : 0]);
    } else if (e.key === "Escape") {
      setIsFocused(false);
    }
  };

  return (
    <div className="relative" ref={wrapRef}>
      <div
        className={`flex items-center gap-3 rounded-2xl p-3.5 transition-colors ${
          disabled ? "bg-gray-50/60" : "bg-gray-50 focus-within:bg-white focus-within:ring-2 focus-within:ring-ocean-200"
        }`}
      >
        <div
          className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl ${disabled ? "opacity-40" : ""}`}
          style={{ background: iconBg }}
        >
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="mb-1 text-[11px] leading-none text-gray-400">{label}</p>
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setIsDismissed(false);
              onQueryChange(e.target.value);
            }}
            onFocus={() => setIsFocused(true)}
            onKeyDown={handleKeyDown}
            placeholder={disabled ? (disabledHint ?? placeholder) : placeholder}
            maxLength={maxLength}
            disabled={disabled}
            role="combobox"
            aria-expanded={isOpen}
            aria-controls={listId}
            aria-autocomplete="list"
            className="w-full bg-transparent text-[15px] font-semibold text-gray-800 outline-none
                       placeholder:font-normal placeholder:text-gray-400 disabled:text-gray-400"
          />
        </div>
        {isLoading && !disabled && <Loader2 className="h-4 w-4 flex-shrink-0 animate-spin text-gray-300" />}
      </div>

      {children}

      {isOpen && (suggestions.length > 0 || showEmpty) && (
        <ul
          id={listId}
          role="listbox"
          className="absolute left-0 right-0 top-full z-30 mt-2 max-h-60 overflow-y-auto rounded-2xl border
                     border-gray-100 bg-white py-1 shadow-[0_8px_24px_rgba(13,48,128,0.12)]"
        >
          {showEmpty ? (
            <li className="px-4 py-3 text-sm text-gray-400">검색 결과가 없어요</li>
          ) : (
            suggestions.map((s, i) => (
              <li
                key={s.id}
                role="option"
                aria-selected={i === activeIndex}
                // onMouseDown이어야 input의 blur보다 먼저 잡혀 선택이 취소되지 않는다
                onMouseDown={(e) => {
                  e.preventDefault();
                  pick(s);
                }}
                onMouseEnter={() => setActiveIndex(i)}
                className={`flex cursor-pointer items-center justify-between gap-3 px-4 py-2.5 text-sm transition-colors ${
                  i === activeIndex ? "bg-ocean-50/60 text-ocean-600" : "text-gray-700"
                }`}
              >
                <span className="min-w-0 flex-1 truncate font-medium">{s.title}</span>
                {s.meta && <span className="flex-shrink-0 text-[12px] text-gray-400">{s.meta}</span>}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
