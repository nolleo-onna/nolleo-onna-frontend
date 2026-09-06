"use client";

import { motion } from "motion/react";

interface DetailRevealProps {
  children: React.ReactNode;
  /** 등장 시차(초) — 헤더→본문→사이드바 순으로 살짝 늦게 나타나게 한다 */
  delay?: number;
}

// motion 컴포넌트는 서버 컴포넌트에서 직접 쓸 수 없어서(요청 시 500),
// 한끗 상세(서버 컴포넌트)에서 쓸 수 있도록 클라이언트 래퍼로 분리했다.
export default function DetailReveal({ children, delay = 0 }: DetailRevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
