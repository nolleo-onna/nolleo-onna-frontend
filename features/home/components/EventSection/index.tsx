"use client";

import Link from "next/link";
import { type Variants, motion } from "motion/react";

import EventCard from "@/features/event/components/EventCard";
import { useEvents } from "@/features/event/hooks/useEvents";
import { sortActiveEvents, toDateKey } from "@/features/event/utils/eventSchedule";

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

const CARD_COUNT = 4;

// 관광공사 행사 중 진행 중(곧 끝나는 순) → 곧 시작하는 순으로 4개. 종료된 행사는 뺀다.
// 보여줄 행사가 없거나 불러오지 못하면 홈 흐름을 끊지 않게 섹션을 통째로 숨긴다.
export default function EventSection() {
  const { data, isPending, isError } = useEvents();
  const today = toDateKey(new Date());
  const active = sortActiveEvents(data ?? [], today);

  if (isError || (!isPending && active.length === 0)) return null;

  return (
    <section className="py-6 md:py-10">
      <div className="mb-6 flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-pink-500">관광공사 · 부산 축제·공연</span>
          <h2 className="text-xl font-bold text-gray-900 md:text-2xl">지금 열리는 부산 행사</h2>
        </div>
        <Link
          href="/event"
          className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-500 transition-colors hover:bg-gray-50"
        >
          전체보기
        </Link>
      </div>

      {isPending ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {Array.from({ length: CARD_COUNT }, (_, i) => (
            <div key={i} className="animate-shimmer aspect-[4/3] rounded-2xl" />
          ))}
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-2 gap-x-4 gap-y-6 md:grid-cols-4"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {active.slice(0, CARD_COUNT).map((event) => (
            <motion.div key={event.contentId} variants={itemVariants}>
              <EventCard event={event} today={today} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </section>
  );
}
