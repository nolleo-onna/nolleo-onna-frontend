"use client";

import { MapPinned } from "lucide-react";
import { type Variants, motion } from "motion/react";

import HankkutCard from "@/features/hankkut/components/HankkutCard";
import type { WeeklyBestItem } from "@/features/hankkut/utils/weeklyBestFeed";

interface HankkutListProps {
  items: WeeklyBestItem[];
}

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

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-navy-900 shadow-lg">
        <MapPinned className="h-8 w-8 text-lime-300" />
      </div>
      <div>
        <p className="text-lg font-bold text-gray-800">아직 등록된 한끗이 없어요</p>
        <p className="mt-1.5 text-sm text-gray-400 leading-relaxed">
          이 동네에 한끗이 등록되면
          <br />
          여기에서 확인할 수 있어요
        </p>
      </div>
    </div>
  );
}

const TOP_N = 3;

export default function HankkutList({ items }: HankkutListProps) {
  if (items.length === 0) {
    return <EmptyState />;
  }

  // "이번 주 베스트"는 시상대 개념이라 항상 최대 3개까지만 보여준다(4개 이상
  // 늘어나면 그리드가 깨지는 문제가 있었다). 4위 이후는 자유게시판 목록에서
  // 볼 수 있으니 여기서는 자른다.
  const top = items.slice(0, TOP_N);

  // CSS col-start로 순서만 바꾸는 방식은 그리드 트랙 수가 바뀌는 타이밍에
  // 깨지는 걸 확인해서, 배열 자체를 왼쪽부터 3위-1위-2위 순서로 재배치하는
  // 더 단순한 방식으로 바꿨다. 1~2개일 때는 재배치 없이 그대로 둔다(1위가
  // 먼저 나오고, 아래 너비 차이로 "더 크다"는 느낌은 유지된다).
  const podiumOrder = top.length === 3 ? [top[2], top[0], top[1]] : top;

  const gridColsClass =
    top.length === 3
      ? "md:grid-cols-[1fr_1.3fr_1fr]"
      : top.length === 2
        ? "md:grid-cols-[1.3fr_1fr]"
        : "md:grid-cols-1";

  return (
    <section>
      <p className="mb-5 text-sm text-gray-500">
        총 <span className="font-bold text-navy-900">{items.length}</span>개의
        한끗 중 <span className="font-bold text-navy-900">TOP {top.length}</span>
      </p>

      <motion.div
        className={`grid grid-cols-1 gap-5 md:items-end ${gridColsClass}`}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {podiumOrder.map((item) => (
          <motion.div key={item.key} variants={itemVariants}>
            <HankkutCard item={item} featured={item === top[0]} />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
