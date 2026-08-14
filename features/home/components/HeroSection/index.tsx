"use client";

import { type Variants, motion } from "motion/react";

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

export default function HeroSection() {
  return (
    <section className="relative flex flex-col items-center justify-center py-16 md:py-24 text-center overflow-hidden">
      {/* 배경 메시 그라디언트 — 코너에 뜬 블롭 2개 대신 여러 개를 겹쳐 하나로 이어진
          색 번짐을 만들고, 하단은 마스크로 페이지 배경(gray-50)에 자연스럽게 스며들게 한다. */}
      <div
        className="absolute inset-0"
        style={{
          maskImage: "linear-gradient(to bottom, black 55%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, black 55%, transparent 100%)",
        }}
      >
        <motion.div
          className="absolute -top-24 -left-16 w-80 h-80 rounded-full bg-ocean-200 blur-3xl opacity-40 pointer-events-none"
          animate={{ x: [0, 24, 0], y: [0, 16, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-6 right-[-4rem] w-72 h-72 rounded-full bg-lime-200 blur-3xl opacity-30 pointer-events-none"
          animate={{ x: [0, -18, 0], y: [0, 20, 0] }}
          transition={{ duration: 17, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-10 left-1/3 w-96 h-96 rounded-full bg-sky-200 blur-3xl opacity-30 pointer-events-none"
          animate={{ x: [0, 20, 0], y: [0, -14, 0] }}
          transition={{ duration: 19, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <motion.div
        className="flex flex-col items-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* 상단 태그 */}
        <motion.div variants={itemVariants} className="flex items-center gap-2 mb-5">
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-lime-100 text-lime-600 text-xs font-semibold">
            ✦ AI 맞춤 코스
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-ocean-100 text-ocean-600 text-xs font-semibold">
            🌊 부산 여행
          </span>
        </motion.div>

        {/* 메인 타이틀 */}
        <motion.h1
          variants={itemVariants}
          className="text-4xl md:text-5xl lg:text-6xl font-bold text-navy-900 mb-4 leading-tight"
        >
          오늘 부산,{" "}
          <span className="relative inline-block">
            <span className="text-ocean-500">뭐하지?</span>
            <svg
              className="absolute -bottom-1 left-0 w-full"
              viewBox="0 0 200 8"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M2 6 Q50 2 100 5 Q150 8 198 4"
                stroke="#0a84ff"
                strokeWidth="3"
                strokeLinecap="round"
                fill="none"
                opacity="0.5"
              />
            </svg>
          </span>
        </motion.h1>

        {/* 서브 카피 */}
        <motion.p
          variants={itemVariants}
          className="text-sm md:text-base text-gray-400 leading-relaxed mb-8"
        >
          예산·날씨·동행마지 반영한 AI 맞춤 코스.
          <br />
          <span className="text-navy-500 font-medium">관광공사 코스 대비 평균 70% 절약.</span>
        </motion.p>

        {/* 키워드 태그 */}
        <motion.div variants={itemVariants} className="flex flex-wrap justify-center gap-2">
          {["🏖️ 해운대", "🌉 광안리", "☕ 카페 투어", "🍜 먹방 코스", "🌙 야경 투어", "🌿 자연 힐링"].map((tag) => (
            <span
              key={tag}
              className="px-3 py-1.5 rounded-full bg-white border border-gray-200 text-xs text-gray-600 shadow-sm"
            >
              {tag}
            </span>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}