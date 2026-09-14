"use client";

import { useRouter } from "next/navigation";
import { type Variants, motion } from "motion/react";

import SectionHeader from "@/features/home/components/SectionHeader";
import SpotTicketCard from "@/features/home/components/PopularSpotsSection/SpotTicketCard";
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
    <section className="py-8 md:py-12">
      <SectionHeader title="인기 부산 스팟" action={{ label: "전체보기", href: "/spot" }} />

      {/* 카드 그리드 */}
      {isPending ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="aspect-[4/3] rounded-2xl animate-shimmer" />
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
          {spots!.map((spot, index) => (
            <motion.div key={spot.id} variants={itemVariants}>
              <SpotTicketCard
                imageSrc={spot.imageUrl}
                name={spot.name}
                location={spot.district}
                rating={spot.avgRating}
                price={spot.free ? null : spot.minPrice}
                index={index}
                onClick={() => router.push("/spot")}
              />
            </motion.div>
          ))}
        </motion.div>
      )}
    </section>
  );
}