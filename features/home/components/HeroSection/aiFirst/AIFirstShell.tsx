"use client";

import WavesBackground from "@/components/ui/WavesBackground";

interface AIFirstShellProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * "AI 채팅 우선" 히어로 시안 공통 배경 — 지금 홈과 같은 파도·남색 그라데이션.
 * 시안끼리 배경 차이 없이 레이아웃·위계만 비교하려고 한 틀을 쓴다. 스토리북 비교용.
 */
export default function AIFirstShell({ children, className = "" }: AIFirstShellProps) {
  return (
    <section
      className={`relative flex flex-col items-center overflow-hidden rounded-b-[48px] bg-gradient-to-b from-navy-800 via-navy-700 to-ocean-800 pb-20 pt-24 md:rounded-b-[64px] md:pb-24 md:pt-28 ${className}`}
    >
      <WavesBackground />
      <div className="relative z-10 w-full">{children}</div>
    </section>
  );
}
