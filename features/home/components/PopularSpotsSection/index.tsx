"use client";

import { useRouter } from "next/navigation";
import { type Variants, motion } from "motion/react";

import SpotCard from "@/components/ui/Card/SpotCard";
import { usePopularSpots } from "@/features/home/hooks/usePopularSpots";

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 },
  },
};

export default function PopularSpotsSection() {
  const router = useRouter();
  const { data: spots, isPending } = usePopularSpots(4);

  if (!isPending && !spots?.length) return null;

  return (
    <section className="py-6 md:py-10">
      {/* 헤더 */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-gray-400">부산 스팟</span>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">인기 부산 스팟</h2>
        </div>
        <button
          onClick={() => router.push("/spot")}
          className="text-sm text-gray-500 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors"
        >
          전체보기
        </button>
      </div>

      {/* 카드 그리드 */}
      {isPending ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="aspect-[4/3] rounded-2xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {spots!.map((spot) => (
            <motion.div key={spot.id} variants={itemVariants}>
              <SpotCard
                imageSrc={spot.imageUrl}
                name={spot.name}
                location={spot.district}
                rating={spot.avgRating}
                reviewCount={String(spot.reviewCount)}
                price={spot.free ? null : spot.minPrice}
                onClick={() => router.push("/spot")}
              />
            </motion.div>
          ))}
        </motion.div>
      )}
    </section>
  );
}