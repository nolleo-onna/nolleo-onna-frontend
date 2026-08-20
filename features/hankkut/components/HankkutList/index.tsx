"use client";

import { MapPinned } from "lucide-react";
import { type Variants, motion } from "motion/react";

import HankkutCard from "@/features/hankkut/components/HankkutCard";
import type { Hankkut } from "@/features/hankkut/data/mockHankkut";

interface HankkutListProps {
  list: Hankkut[];
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

/** 순위별 시상대 위치 — 1등은 가운데(가장 넓은 칸), 2등은 오른쪽, 3등은 왼쪽 */
function podiumColStart(rank: number): string {
  if (rank === 0) return "md:col-start-2";
  if (rank === 1) return "md:col-start-3";
  return "md:col-start-1";
}

export default function HankkutList({ list }: HankkutListProps) {
  if (list.length === 0) {
    return <EmptyState />;
  }

  const podium = list.slice(0, 3);
  const rest = list.slice(3);

  // 인원수에 따라 시상대 칸 너비를 다르게: 3명이 모여야 올림픽 시상대(3-1-2)
  // 모양이 나오고, 1~2명일 때는 1등이 넓은 단순 배치로 자연스럽게 줄인다.
  const podiumColsClass =
    podium.length >= 3
      ? "md:grid-cols-[1fr_1.3fr_1fr]"
      : podium.length === 2
        ? "md:grid-cols-[1.3fr_1fr]"
        : "md:grid-cols-1";

  return (
    <section>
      <p className="mb-5 text-sm text-gray-500">
        총 <span className="font-bold text-navy-900">{list.length}</span>개의
        한끗
      </p>

      <motion.div
        className={`grid grid-cols-1 gap-5 md:items-end ${podiumColsClass}`}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {podium.map((hankkut, rank) => (
          <motion.div
            key={hankkut.id}
            variants={itemVariants}
            className={podium.length >= 3 ? podiumColStart(rank) : undefined}
          >
            <HankkutCard hankkut={hankkut} featured={rank === 0} />
          </motion.div>
        ))}
      </motion.div>

      {rest.length > 0 && (
        <motion.div
          className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {rest.map((hankkut) => (
            <motion.div key={hankkut.id} variants={itemVariants}>
              <HankkutCard hankkut={hankkut} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </section>
  );
}
