"use client";

import { useEffect, useState } from "react";
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

const TYPING_PHRASES = ["뭐하지?", "어디갈까?", "뭐먹을까?"];

// 타이핑 → 잠깐 멈춤 → 지우기 → 다음 문구, 순환 반복하는 타자기 효과.
function useTypewriter(
  phrases: string[],
  { typingSpeed = 90, deletingSpeed = 45, pauseDuration = 1400 } = {}
) {
  const [text, setText] = useState("");
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const current = phrases[phraseIndex % phrases.length];

    if (!isDeleting && text === current) {
      const timeout = setTimeout(() => setIsDeleting(true), pauseDuration);
      return () => clearTimeout(timeout);
    }

    if (isDeleting && text === "") {
      const timeout = setTimeout(() => {
        setIsDeleting(false);
        setPhraseIndex((i) => i + 1);
      }, typingSpeed);
      return () => clearTimeout(timeout);
    }

    const nextText = isDeleting
      ? current.slice(0, text.length - 1)
      : current.slice(0, text.length + 1);
    const timeout = setTimeout(
      () => setText(nextText),
      isDeleting ? deletingSpeed : typingSpeed
    );
    return () => clearTimeout(timeout);
  }, [text, isDeleting, phraseIndex, phrases, typingSpeed, deletingSpeed, pauseDuration]);

  return text;
}

export default function HeroSection() {
  const typedText = useTypewriter(TYPING_PHRASES);

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
          <span className="relative inline-block text-ocean-500">
            {typedText}
            <span className="animate-pulse">|</span>
          </span>
        </motion.h1>

        {/* 서브 카피 */}
        <motion.p
          variants={itemVariants}
          className="text-sm md:text-base text-gray-400 leading-relaxed mb-8"
        >
          예산·동행·분위기를 말하면 AI가 코스를 짜드려요.
          <br />
          <span className="text-navy-500 font-medium">혼잡도 예측까지 반영해서 사람 많은 곳은 피해요.</span>
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