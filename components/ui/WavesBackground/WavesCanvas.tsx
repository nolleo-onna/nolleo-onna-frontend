"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import WAVES from "vanta/dist/vanta.waves.min";

export interface WavesOptions {
  /** 파도 색 */
  color?: number;
  /** 파도 뒤 배경색 */
  backgroundColor?: number;
  shininess?: number;
  waveHeight?: number;
  waveSpeed?: number;
  /** 작을수록 파도가 멀리 넓게 보인다 */
  zoom?: number;
}

// 접속 브라우저가 애니메이션 최소화를 요청하면(prefers-reduced-motion)
// WebGL 파도 대신 감싸는 WavesBackground의 정적 그라데이션만 보이게 둔다.
export default function WavesCanvas({
  color = 0x0a84ff,
  backgroundColor = 0x002550,
  shininess = 35,
  waveHeight = 18,
  waveSpeed = 0.9,
  zoom = 0.9,
}: WavesOptions) {
  const containerRef = useRef<HTMLDivElement>(null);
  const effectRef = useRef<ReturnType<typeof WAVES> | null>(null);
  // ssr:false로 동적 임포트돼 항상 클라이언트에서만 렌더되므로, 초기값에서 바로 window를 읽어도 하이드레이션 불일치가 없다.
  const [reducedMotion] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  useEffect(() => {
    if (reducedMotion || !containerRef.current) return;

    effectRef.current = WAVES({
      el: containerRef.current,
      THREE,
      mouseControls: false,
      touchControls: false,
      gyroControls: false,
      scaleMobile: 2.5,
      color,
      backgroundColor,
      shininess,
      waveHeight,
      waveSpeed,
      zoom,
    });

    return () => {
      effectRef.current?.destroy();
      effectRef.current = null;
    };
  }, [reducedMotion, color, backgroundColor, shininess, waveHeight, waveSpeed, zoom]);

  if (reducedMotion) return null;

  return <div ref={containerRef} className="absolute inset-0" />;
}
