"use client";

import { usePathname } from "next/navigation";
import { motion } from "motion/react";

interface PageTransitionProps {
  children: React.ReactNode;
}

// 라우트가 바뀔 때마다 콘텐츠 영역만 짧게 페이드+슬라이드로 전환한다.
// 헤더는 이 컴포넌트 밖에 있어 계속 고정돼 있고, 페이지 본문만 새로 나타난다.
//
// AnimatePresence(mode="wait")는 쓰지 않는다 — Next.js 라우터가 이전 페이지를
// 즉시 교체하는 방식과 맞물리면 "이전 페이지의 퇴장 애니메이션이 끝날 때까지
// 새 페이지 마운트를 미루는" 상태로 걸려서, 클라이언트 이동 시 새 페이지가
// 안 보이고 새로고침해야만 나오는 문제가 있었다. 등장 애니메이션만 준다.
export default function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
