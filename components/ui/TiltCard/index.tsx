"use client";

import { motion, useReducedMotion, useSpring } from "motion/react";

interface TiltCardProps {
  children: React.ReactNode;
  /** 좌우·상하로 기울어지는 최대 각도(도). 포스터처럼 큰 카드는 6, 작은 카드는 4 정도가 자연스럽다 */
  maxTilt?: number;
  className?: string;
}

/**
 * 마우스 위치를 따라 살짝 기울어지는 카드 래퍼. 스프링으로 따라가서 손을 떼면 부드럽게 제자리로 돌아온다.
 * 터치 기기에선 스크롤과 겹치지 않게 마우스 포인터에서만 반응하고, 동작 줄이기 설정이면 기울지 않는다.
 */
export default function TiltCard({ children, maxTilt = 6, className }: TiltCardProps) {
  const reduceMotion = useReducedMotion();
  const rotateX = useSpring(0, { stiffness: 160, damping: 16 });
  const rotateY = useSpring(0, { stiffness: 160, damping: 16 });

  const handleMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reduceMotion || e.pointerType !== "mouse") return;
    const rect = e.currentTarget.getBoundingClientRect();
    rotateY.set(((e.clientX - rect.left) / rect.width - 0.5) * maxTilt * 2);
    rotateX.set(-((e.clientY - rect.top) / rect.height - 0.5) * maxTilt * 2);
  };
  const handleLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <motion.div
      className={className}
      style={{ rotateX, rotateY, transformPerspective: 900 }}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
    >
      {children}
    </motion.div>
  );
}
