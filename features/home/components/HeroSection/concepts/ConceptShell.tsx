"use client";

import { type Variants, motion } from "motion/react";

import Container from "@/components/layout/Container";
import WavesBackground from "@/components/ui/WavesBackground";
import SearchBar from "@/features/home/components/SearchBar";

const stagger: Variants = { hidden: {}, visible: { transition: { staggerChildren: 0.12 } } };
const rise: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

/**
 * 히어로 시안 공통 틀 — 지금 홈과 같은 파도 배경·검색바는 두고, 긴 문구 자리에 시안(children)을 넣는다.
 * 스토리북 비교용이라 실제 홈에서는 쓰지 않는다.
 */
interface ConceptShellProps {
  headline: React.ReactNode;
  children: React.ReactNode;
  /** 파도 대신 깔 배경 — 없으면 지금 홈과 같은 파도 */
  background?: React.ReactNode;
  className?: string;
}

export default function ConceptShell({ headline, children, background, className = "" }: ConceptShellProps) {
  return (
    <section className={`relative flex flex-col items-center overflow-hidden rounded-b-[48px] bg-gradient-to-b from-navy-800 via-navy-700 to-ocean-800 pb-20 pt-24 text-center md:rounded-b-[64px] md:pb-24 md:pt-28 ${className}`}>
      {background ?? <WavesBackground />}
      <motion.div className="relative z-10 flex w-full flex-col items-center" variants={stagger} initial="hidden" animate="visible">
        <motion.span
          variants={rise}
          className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/85 ring-1 ring-inset ring-white/20 backdrop-blur-sm"
        >
          부산 AI 여행 플래너
        </motion.span>
        <motion.h1 variants={rise} className="mt-4 px-5 text-3xl font-bold leading-tight text-white break-keep md:text-5xl">
          {headline}
        </motion.h1>
        <motion.div variants={rise} className="mt-8 w-full">
          {children}
        </motion.div>
        <motion.div variants={rise} className="mt-8 w-full">
          <Container>
            <SearchBar />
          </Container>
        </motion.div>
      </motion.div>
    </section>
  );
}
