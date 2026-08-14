"use client";

import { useRouter } from "next/navigation";
import { type Variants, motion } from "motion/react";

import SpotCard from "@/components/ui/Card/SpotCard";

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

type Spot = {
  id: number;
  imageSrc: string;
  name: string;
  location: string;
  rating: number;
  reviewCount: string;
  price?: number | null;
  crowdStatus?: "매우혼잡" | "혼잡" | "보통" | "여유";
};

const mockSpots: Spot[] = [
  { id: 1, imageSrc: "https://picsum.photos/seed/seomyeon2/400/300", name: "할매 국밥", location: "해운대", rating: 4.6, reviewCount: "3.5k", price: 8000, crowdStatus: "혼잡" },
  { id: 2, imageSrc: "https://picsum.photos/seed/cafe/400/300", name: "오션뷰 커피", location: "광안리", rating: 4.8, reviewCount: "2.1k", price: 7000, crowdStatus: "보통" },
  { id: 3, imageSrc: "https://picsum.photos/seed/museum2/400/300", name: "부산시립미술관", location: "해운대", rating: 4.5, reviewCount: "1.2k", price: null, crowdStatus: "여유" },
  { id: 4, imageSrc: "https://picsum.photos/seed/huinnyeoul2/400/300", name: "흰여울문화마을", location: "영도", rating: 4.7, reviewCount: "4.2k", price: null, crowdStatus: "여유" },
];

type Props = {
  spots?: Spot[];
};

export default function PopularSpotsSection({ spots = mockSpots }: Props) {
  const router = useRouter();

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
      <motion.div
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        {spots.map((spot) => (
          <motion.div key={spot.id} variants={itemVariants}>
            <SpotCard
              imageSrc={spot.imageSrc}
              name={spot.name}
              location={spot.location}
              rating={spot.rating}
              reviewCount={spot.reviewCount}
              price={spot.price}
              crowdStatus={spot.crowdStatus}
            />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}