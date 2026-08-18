"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import WAVES from "vanta/dist/vanta.waves.min";

// 접속 브라우저가 애니메이션 최소화를 요청하면(prefers-reduced-motion)
// WebGL 파도 대신 섹션 자체의 정적 그라데이션 배경만 보이게 둔다.
export default function WavesBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const effectRef = useRef<ReturnType<typeof WAVES> | null>(null);
  // 이 컴포넌트는 부모에서 ssr:false로 동적 임포트돼 항상 클라이언트에서만
  // 렌더되므로, 초기값에서 바로 window를 읽어도 하이드레이션 불일치가 없다.
  const [reducedMotion] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  useEffect(() => {
    if (reducedMotion || !containerRef.current) return;

    effectRef.current = WAVES({
      el: containerRef.current,
      THREE,
      mouseControls: false,
      touchControls: false,
      gyroControls: false,
      scaleMobile: 2.5,
      color: 0x0a84ff,
      backgroundColor: 0x002550,
      shininess: 35,
      waveHeight: 18,
      waveSpeed: 0.9,
      zoom: 0.9,
    });

    return () => {
      effectRef.current?.destroy();
      effectRef.current = null;
    };
  }, [reducedMotion]);

  if (reducedMotion) return null;

  return <div ref={containerRef} className="absolute inset-0" />;
}
