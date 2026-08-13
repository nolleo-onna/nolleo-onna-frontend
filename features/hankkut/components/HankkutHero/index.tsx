"use client";

import { type Variants, motion } from "motion/react";
import Link from "next/link";

import { HANKKUT_CATEGORIES } from "@/features/hankkut/data/mockHankkut";

interface HankkutHeroProps {
  activeCategory: string;
}



const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12 },
  },
};

export default function HankkutHero({ activeCategory }: HankkutHeroProps) {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-ocean-50 via-white to-lime-50">
      {/* 떠다니는 장식 도형 */}
      <motion.div
        className="relative px-6 py-10 md:px-12 md:py-12"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.p
          variants={itemVariants}
          className="text-sm font-semibold text-ocean-600"
        >
          부산 여행을 더 특별하게 만드는 작은 정보
        </motion.p>

        <motion.h1
          variants={itemVariants}
          className="mt-2 text-4xl font-bold text-navy-900 md:text-5xl"
        >
          여행{" "}
          <span className="relative inline-block">
            <motion.span
              aria-hidden
              className="absolute inset-x-0 bottom-1 -z-10 h-4 origin-left rounded-sm bg-lime-300"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.6, duration: 0.45, ease: "easeOut" }}
            />
            한끗
          </span>
        </motion.h1>

        {/* 카테고리 필터 */}
        <motion.nav variants={itemVariants} className="mt-8 flex flex-wrap gap-2">
          {HANKKUT_CATEGORIES.map((category) => {
            const isActive =
              category === "전체"
                ? !activeCategory || activeCategory === "전체"
                : activeCategory === category;
            const href =
              category === "전체"
                ? "/hankkut"
                : `/hankkut?category=${encodeURIComponent(category)}`;

            return (
              <Link
                key={category}
                href={href}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-all hover:-translate-y-0.5 ${
                  isActive
                    ? "bg-navy-900 text-lime-300"
                    : "bg-white text-gray-600 shadow-sm hover:text-navy-900"
                }`}
              >
                {category}
              </Link>
            );
          })}
        </motion.nav>
      </motion.div>
    </section>
  );
}
