"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

interface ExpandableTextProps {
  children: string;
  /** 접었을 때 보여줄 줄 수 */
  clampLines?: number;
  /** 글 상자 모양 — 화면마다 배경색이 달라 바깥에서 준다 */
  className?: string;
  /** 접힌 아래쪽을 흐리게 덮는 색 (글 상자 배경과 같은 색이어야 자연스럽다) */
  fadeClassName?: string;
}

/**
 * 긴 설명을 정해진 줄 수에서 접고 "더 보기"로 펼친다.
 * 원래는 그냥 잘려서 뒷부분을 아예 볼 수 없었다. 짧은 글에는 버튼을 만들지 않으려고
 * 실제로 넘치는지 재보고(줄 수는 글자 수가 아니라 상자 너비에 따라 달라진다) 버튼을 붙인다.
 */
export default function ExpandableText({
  children,
  clampLines = 5,
  className = "",
  fadeClassName = "from-white",
}: ExpandableTextProps) {
  const textRef = useRef<HTMLParagraphElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);

  // 넘치는지는 접힌 상태에서만 알 수 있다. 창 너비가 바뀌면 줄 수도 달라져 다시 잰다.
  useEffect(() => {
    const element = textRef.current;
    if (!element || isExpanded) return;

    const measure = () => setIsOverflowing(element.scrollHeight - element.clientHeight > 1);
    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [isExpanded, children]);

  return (
    <div className={className}>
      <div className="relative">
        <p
          ref={textRef}
          className="text-sm leading-relaxed text-gray-700 whitespace-pre-line"
          style={
            isExpanded
              ? undefined
              : { display: "-webkit-box", WebkitBoxOrient: "vertical", WebkitLineClamp: clampLines, overflow: "hidden" }
          }
        >
          {children}
        </p>
        {!isExpanded && isOverflowing && (
          <span
            aria-hidden
            className={`pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t to-transparent ${fadeClassName}`}
          />
        )}
      </div>

      {isOverflowing && (
        <button
          type="button"
          onClick={() => setIsExpanded((prev) => !prev)}
          aria-expanded={isExpanded}
          className="mt-2 inline-flex items-center gap-1 text-[13px] font-semibold text-ocean-600 transition-colors hover:text-ocean-700"
        >
          {isExpanded ? "접기" : "더 보기"}
          <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
        </button>
      )}
    </div>
  );
}
