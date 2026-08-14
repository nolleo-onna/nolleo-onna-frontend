"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { type Variants, motion } from "motion/react";

const WavesBackground = dynamic(() => import("./WavesBackground"), { ssr: false });

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
    <section className="relative flex flex-col items-center justify-center pt-20 pb-24 md:pt-28 md:pb-32 text-center overflow-hidden rounded-b-[48px] bg-gradient-to-b from-navy-800 via-navy-700 to-ocean-800 md:rounded-b-[64px]">
      {/* 파도 애니메이션 배경(WebGL). 접속 환경이 애니메이션을 원치 않으면
          섹션 자체의 그라데이션만 정적으로 보인다. */}
      <WavesBackground />

      <motion.div
        className="relative z-10 flex flex-col items-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* 상단 태그 */}
        <motion.div variants={itemVariants} className="flex items-center gap-2 mb-5">
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-lime-100 text-lime-600 text-xs font-semibold">
            ✦ AI 맞춤 코스
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 text-ocean-700 text-xs font-semibold">
            🌊 부산 여행
          </span>
        </motion.div>

        {/* 메인 타이틀 */}
        <motion.h1
          variants={itemVariants}
          className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight"
        >
          오늘 부산,{" "}
          <span className="relative inline-block text-lime-300">
            {typedText}
            <span className="animate-pulse">|</span>
          </span>
        </motion.h1>

        {/* 서브 카피 */}
        <motion.p
          variants={itemVariants}
          className="text-sm md:text-base text-white/70 leading-relaxed mb-8"
        >
          예산·동행·분위기를 말하면 AI가 코스를 짜드려요.
          <br />
          <span className="text-white font-medium">혼잡도 예측까지 반영해서 사람 많은 곳은 피해요.</span>
        </motion.p>

        {/* 키워드 태그 */}
        <motion.div variants={itemVariants} className="flex flex-wrap justify-center gap-2">
          {["🏖️ 해운대", "🌉 광안리", "☕ 카페 투어", "🍜 먹방 코스", "🌙 야경 투어", "🌿 자연 힐링"].map((tag) => (
            <span
              key={tag}
              className="px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-sm text-xs text-gray-700 shadow-sm"
            >
              {tag}
            </span>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
