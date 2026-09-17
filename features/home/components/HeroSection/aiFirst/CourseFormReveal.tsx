"use client";

import { AnimatePresence, motion } from "motion/react";

import Container from "@/components/layout/Container";
import SearchBar from "@/features/home/components/SearchBar";

interface CourseFormRevealProps {
  isOpen: boolean;
}

/** 2순위 "조건 골라 만들기" 폼 — 평소엔 접어 두고, 누르면 아래로 펼친다 */
export default function CourseFormReveal({ isOpen }: CourseFormRevealProps) {
  return (
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          key="course-form"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="overflow-hidden"
        >
          <Container>
            <div className="mx-auto mt-6 max-w-3xl rounded-3xl bg-white p-5 text-left shadow-[0_4px_24px_rgba(13,48,128,0.12)]">
              <SearchBar variant="formOnly" />
            </div>
          </Container>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
