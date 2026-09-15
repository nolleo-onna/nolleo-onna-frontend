"use client";

import dynamic from "next/dynamic";

import type { WavesOptions } from "./WavesCanvas";

const WavesCanvas = dynamic(() => import("./WavesCanvas"), { ssr: false });

interface WavesBackgroundProps extends WavesOptions {
  className?: string;
}

/**
 * 홈 히어로와 같은 three.js(vanta) 파도 배경. 부모는 relative·overflow-hidden이어야 한다.
 * WebGL이 뜨기 전이나 움직임 줄이기 설정에서는 같은 톤의 정적 그라데이션이 보인다.
 */
export default function WavesBackground({ className = "", ...options }: WavesBackgroundProps) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden bg-gradient-to-br from-ocean-700 via-ocean-600 to-navy-600 ${className}`}
    >
      <WavesCanvas {...options} />
    </div>
  );
}
