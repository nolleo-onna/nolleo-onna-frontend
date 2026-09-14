import { ASSISTANT_NAME } from "@/constants/assistant";

interface AssistantGlyphProps {
  className?: string;
  /** 반짝이(오른쪽 위 별) 색 — 기본은 글자색(currentColor)을 따른다 */
  sparkleClassName?: string;
}

/** 챗봇 "온나"의 기호 — 부산 바다 물결 두 줄과 작은 반짝이. 선 색은 currentColor를 따른다 */
export function AssistantGlyph({ className = "h-4 w-4", sparkleClassName = "" }: AssistantGlyphProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={className}>
      <path
        d="M2.5 13.5c2.3 0 2.3-2.6 4.6-2.6s2.3 2.6 4.6 2.6 2.3-2.6 4.6-2.6 2.3 2.6 4.6 2.6"
        stroke="currentColor"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5 18c1.8 0 1.8-2 3.6-2s1.8 2 3.6 2 1.8-2 3.6-2 1.8 2 3.2 2"
        stroke="currentColor"
        strokeOpacity="0.55"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        className={sparkleClassName}
        fill="currentColor"
        d="M17.5 2.8l.75 1.95 1.95.75-1.95.75-.75 1.95-.75-1.95-1.95-.75 1.95-.75z"
      />
    </svg>
  );
}

interface AssistantAvatarProps {
  /** px */
  size?: number;
  className?: string;
}

/** 채팅 말풍선 옆 · 헤더 · 생성 중 화면에 쓰는 "온나" 프로필 — 네이비→오션 원 안에 물결 기호 */
export default function AssistantAvatar({ size = 28, className = "" }: AssistantAvatarProps) {
  return (
    <span
      role="img"
      aria-label={ASSISTANT_NAME}
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#0d3080] to-[#0a84ff] text-white shadow-sm ${className}`}
      style={{ width: size, height: size }}
    >
      <AssistantGlyph
        sparkleClassName="text-lime-300"
        className={size >= 36 ? "h-5 w-5" : size >= 30 ? "h-[18px] w-[18px]" : "h-4 w-4"}
      />
    </span>
  );
}
