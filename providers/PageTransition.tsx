"use client";

import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";

interface PageTransitionProps {
  children: React.ReactNode;
}

// 라우트가 바뀔 때마다 콘텐츠 영역만 짧게 페이드+슬라이드로 전환한다.
// 헤더는 이 컴포넌트 밖에 있어 계속 고정돼 있고, 페이지 본문만 새로 나타난다.
export default function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
